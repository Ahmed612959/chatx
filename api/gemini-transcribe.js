export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { getApiKey } from './_keystore.js';

// ====================================================================================
// نظام تعرف على صوت تاني (احتياطي) بيستخدم فهم Gemini للصوت مباشرة — بيتنادى بس لو
// Whisper بتاع Groq فشل أو تأخر أوي (مقطع صوت رجّع خطأ 500/502/429 أو الشبكة اتقطعت).
// الهدف إن المكالمة متفضلش من غير رد خالص لو مزوّد واحد وقع، مش استبدال Whisper —
// Whisper (Groq) لسه هو الأساس لأنه أسرع بكتير ومصمم للتفريغ الفوري، لكن دلوقتي
// فيه شبكة أمان حقيقية بموديل تاني قوي بدل ما الطالب يحس إن المكالمة "بتقفل في وشه".
// ====================================================================================

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const GEMINI_API_KEY = await getApiKey('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY غير مضبوط' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const incomingForm = await request.formData().catch(() => null);
    const audioFile = incomingForm?.get('audio');
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'مفيش ملف صوت في الطلب' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = audioFile.type || 'audio/webm';

    let upstream;
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'فرّغ الكلام اللي في المقطع الصوتي ده لنص عربي فقط، بالظبط زي ما اتقال، من غير أي إضافة أو تعليق أو علامات ترقيم زيادة. لو مفيش كلام واضح رجّع سطر فاضي.' },
                { inline_data: { mime_type: mimeType, data: base64Audio } }
              ]
            }],
            generationConfig: { temperature: 0, maxOutputTokens: 200 }
          })
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Gemini' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'Gemini رجّعت خطأ', detail: errText.slice(0, 300) }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    return new Response(JSON.stringify({ text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
