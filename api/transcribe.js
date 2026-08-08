export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// بيستقبل ملف صوت (multipart/form-data، حقل اسمه "audio") ويبعته لـ Whisper بتاع Groq
// عشان يحوّله لنص — نفس مفتاح GROQ_API_KEY المستخدم أصلاً في api/groq.js، مفيش مفتاح
// جديد مطلوب. النص الناتج بعد كده بيتلخّص عن طريق الشات العادي في الفرونت إند.
export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // ليمت أقل من مزودي النص العادية لأن الترانسكرايب أتقل بكتير على الـ upstream
    const rl = checkRateLimit(request, { limit: 6, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const incomingForm = await request.formData();
    const audioFile = incomingForm.get('audio');
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'مفيش ملف صوت في الطلب (حقل audio مطلوب)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // حد أقصى 25 ميجا — نفس حد Groq نفسه لملفات الصوت، نرفضه بدري بدل ما نضيّع وقت الرفع كله
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'حجم التسجيل أكبر من 25 ميجا — قسّم التسجيل لأجزاء أقصر' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const upstreamForm = new FormData();
    upstreamForm.append('file', audioFile, audioFile.name || 'lecture.webm');
    upstreamForm.append('model', 'whisper-large-v3-turbo');
    upstreamForm.append('language', 'ar');
    upstreamForm.append('response_format', 'json');

    let upstream;
    try {
      upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: upstreamForm
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة تحويل الصوت لنص' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
