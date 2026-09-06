export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';
import { attemptWithFailover } from './_keystore.js';

// بيفرّغ مقطع صوت لنص عن طريق Whisper (large-v3-turbo) بتاع Groq — نظام تعرف على
// الصوت أدق وأقوى بكتير من التعرف المدمج في المتصفح (Web Speech API)، خصوصًا مع
// اللهجة المصرية، وسريع جدًا (بيرجع النص في أقل من ثانية غالبًا لمقطع قصير). بيدعم
// أكتر من مفتاح مع تبديل تلقائي لو واحد فشل (شوف _keystore.js).
export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 40, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    let incomingForm;
    try {
      incomingForm = await request.formData();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'الطلب لازم يكون multipart/form-data فيه ملف صوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const audioFile = incomingForm.get('audio');
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'مفيش ملف صوت في الطلب' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let upstream;
    try {
      upstream = await attemptWithFailover('GROQ_API_KEY', (key) => {
        // بنبني FormData جديدة لكل محاولة — الـ Blob نفسه (audioFile) قابل للقراءة
        // أكتر من مرة، فمفيش مشكلة نعيد استخدامه مع مفتاح تاني لو الأول فشل.
        const outForm = new FormData();
        outForm.append('file', audioFile, 'speech.webm');
        outForm.append('model', 'whisper-large-v3-turbo');
        outForm.append('language', 'ar');
        outForm.append('response_format', 'json');
        outForm.append('temperature', '0');
        return fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}` },
          body: outForm
        });
      });
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return new Response(JSON.stringify({ error: 'GROQ_API_KEY غير مضبوط في Environment Variables' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة تفريغ الصوت' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = await upstream.text();
    // استدعاء فعلي وصل للمزود (حتى لو رجّع خطأ لاحقًا) — نسجّله لعدّاد التكلفة التقريبية الشهرية.
    await reportApiUsage('groq-whisper', text.length);

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
