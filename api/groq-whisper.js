export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';
import { attemptWithFailover } from './_keystore.js';

// بيفرّغ مقطع صوت لنص عن طريق Whisper (large-v3-turbo) بتاع Groq — نظام تعرف على
// الصوت أدق وأقوى بكتير من التعرف المدمج في المتصفح (Web Speech API)، خصوصًا مع
// اللهجة المصرية، وسريع جدًا (بيرجع النص في أقل من ثانية غالبًا لمقطع قصير). بيدعم
// أكتر من مفتاح مع تبديل تلقائي لو واحد فشل (شوف _keystore.js).
//
// ثنائي اللغة (عربي/إنجليزي): مفيش لغة متفروضة على الموديل — بيتعرّف تلقائيًا على
// لغة كل مقطع لوحده (عربي مصري، إنجليزي، أو خليط)، مع prompt سياقي بيساعده يحافظ
// على المصطلحات الإنجليزية بحروفها الأصلية جوه كلام عربي، زي أي نظام تفريغ صوت
// احترافي حديث.
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
    if (!audioFile || typeof audioFile.size !== 'number' || audioFile.size === 0) {
      return new Response(JSON.stringify({ error: 'مفيش ملف صوت في الطلب' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // حد أقصى منطقي (25MB زي حد Groq الفعلي) — بنرفض بدري بدل ما نستهلك محاولة
    // فاشلة على المزوّد لملف أكبر من المسموح أصلاً.
    const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return new Response(JSON.stringify({ error: 'ملف الصوت أكبر من الحجم المسموح' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // بنسيب اللغة من غير تحديد (auto-detect) بدل ما نجبرها "عربي بس" — عشان
    // المكالمة تتعامل صح مع كود-سويتشينج (عربي وإنجليزي في نفس المحادثة أو حتى
    // في نفس الجملة)، زي أي نظام تفريغ صوت احترافي (Claude, ChatGPT, Grok) بيسيب
    // الموديل يتعرف على اللغة الفعلية بدل ما يفرض واحدة بس. كل مقطع بيتسجل لوحده
    // (جملة/عبارة واحدة من كاشف الصوت)، فالـ auto-detect بيكون دقيق غالبًا حتى
    // لمقاطع قصيرة.
    //
    // الـ prompt بيدّي Whisper سياق/أسلوب الكلام المتوقع (عربي مصري عامية +
    // مصطلحات تمريض إنجليزية) عشان يحافظ على المصطلحات الإنجليزية بحروفها
    // الأصلية بدل ما "يعرّبها" غلط، ده مستقل عن اللغة المكتشفة وبيحسّن الدقة في
    // المحتوى ثنائي اللغة بغض النظر عن اللغة السائدة في المقطع.
    const BILINGUAL_CONTEXT_PROMPT = 'الطالب بيتكلم عربي مصري عامية غالبًا، وأحيانًا جملة كاملة بالإنجليزي، وبيستخدم مصطلحات زي blood pressure, IV fluids, vital signs, medication dose, heart rate جوه كلامه.';

    let upstream;
    try {
      upstream = await attemptWithFailover('GROQ_API_KEY', (key) => {
        // بنبني FormData جديدة لكل محاولة — الـ Blob نفسه (audioFile) قابل للقراءة
        // أكتر من مرة، فمفيش مشكلة نعيد استخدامه مع مفتاح تاني لو الأول فشل.
        const outForm = new FormData();
        outForm.append('file', audioFile, 'speech.webm');
        outForm.append('model', 'whisper-large-v3-turbo');
        outForm.append('prompt', BILINGUAL_CONTEXT_PROMPT);
        outForm.append('response_format', 'json');
        outForm.append('temperature', '0');

        // مهلة زمنية للطلب الصادر لـ Groq — لو المزوّد علّق (شبكة/حمل زيادة)، بنفشل
        // بسرعة معقولة بدل ما نسيب المكالمة الحية عالقة تستنى للأبد.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15_000);
        return fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}` },
          body: outForm,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      });
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return new Response(JSON.stringify({ error: 'GROQ_API_KEY غير مضبوط في Environment Variables' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'خدمة تفريغ الصوت اتأخرت في الرد' }), {
          status: 504,
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
