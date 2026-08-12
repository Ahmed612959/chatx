export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// صوت Gemini TTS — بديل ElevenLabs، بنفس GEMINI_API_KEY المستخدم أصلاً في باقي الشات
// (مفيش مفتاح جديد ولا فوترة منفصلة مطلوبة). الجودة من أعلى المتاح حاليًا وبتدعم العربي
// تلقائيًا من غير أي إعداد لغة صريح — الموديل بيكتشف اللغة من النص نفسه.
//
// ملاحظة تقنية: الـ API بيرجّع صوت PCM خام (L16، بدون أي غلاف/header)، مش MP3 أو WAV
// جاهز — لازم نغلّفه بـ WAV header يدويًا هنا قبل ما نرجّعه، وإلا المتصفح مش هيعرف يشغّله.
const VOICE_NAME = 'Kore'; // صوت واضح ومتزن، من أنسب الأصوات المتاحة لقراءة نصوص تعليمية

function buildWavHeader({ dataLength, sampleRate = 24000, channels = 1, bitsPerSample = 16 }) {
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);       // fmt chunk size
  view.setUint16(20, 1, true);        // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);
  return new Uint8Array(buffer);
}

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // الحد كان 15 طلب/دقيقة، وده قليل جدًا فعليًا: مشهد واحد من الحالة المتفرّعة لوحده
    // بيولّد 5-10 نداءات TTS ورا بعض (كل عقدة بتتقرأ بصوت)، غير أي ردود شات عادية
    // المستخدم طالب سماعها. رفعناه لرقم مريح لطالب واحد نشط من غير ما نفتح الباب
    // للاستغلال الكامل.
    const rl = checkRateLimit(request, { limit: 40, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try { payload = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON غير صالح' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const text = (payload.text || '').toString().trim().slice(0, 4000);
    if (!text) {
      return new Response(JSON.stringify({ error: 'لا يوجد نص لتحويله لصوت' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // بيبعت طلب واحد فعلي لـ Gemini، بترجع {upstream, networkError}
    async function callGemini() {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `اقرأ النص التالي بصوت طبيعي وواضح: ${text}` }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } } }
            }
          })
        });
        return { upstream: res, networkError: null };
      } catch (err) {
        return { upstream: null, networkError: err };
      }
    }

    // ====================================================================================
    // gemini-3.1-flash-tts-preview لسه موديل preview فعليًا (مش متوقف)، وده معناه إنه
    // أحيانًا بيرجّع 429/503 مؤقتة من عند جوجل نفسها بسبب ضغط مؤقت على الموديل، مش بالضرورة
    // مشكلة حقيقية أو تخطي فعلي للحصة. من غير إعادة محاولة، أي هزة مؤقتة كانت بترجع فشل
    // كامل للمستخدم على طول. دلوقتي بنجرب تاني تلقائيًا (لمرة واحدة بعد تأخير بسيط) قبل
    // ما نستسلم ونرجّع خطأ فعلي.
    let upstream, networkError;
    ({ upstream, networkError } = await callGemini());
    if (networkError) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة Gemini TTS' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
    if (!upstream.ok && (upstream.status === 429 || upstream.status === 503)) {
      await new Promise(r => setTimeout(r, 600));
      ({ upstream, networkError } = await callGemini());
      if (networkError) {
        return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة Gemini TTS' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'فشل توليد الصوت من Gemini', detail: detail.slice(0, 300) }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await upstream.json();
    const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) {
      return new Response(JSON.stringify({ error: 'الرد من Gemini ماكانش فيه صوت' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    // استخراج معدل العينة الفعلي من mimeType (بيجي بالشكل "audio/L16;codec=pcm;rate=24000")
    // بدل ما نفترضه ثابت، عشان لو الموديل غيّره يوم مانكسرش.
    const rateMatch = /rate=(\d+)/.exec(part.mimeType || '');
    const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

    const pcmBytes = Uint8Array.from(atob(part.data), c => c.charCodeAt(0));
    const wavHeader = buildWavHeader({ dataLength: pcmBytes.length, sampleRate });
    const wavBytes = new Uint8Array(wavHeader.length + pcmBytes.length);
    wavBytes.set(wavHeader, 0);
    wavBytes.set(pcmBytes, wavHeader.length);

    return new Response(wavBytes, { status: 200, headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-cache' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
