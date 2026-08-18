export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// ⚠️ الملف ده كان بينادي على OneHop (موديل DeepSeek)، ودلوقتي بينادي على
// OpenRouter بدل كده — نفس اسم متغير البيئة (ONEHOP_API_KEY) اتسيب زي ما هو
// عمدًا (بطلب صاحب المشروع)، بس لازم تحدّث قيمته على Vercel بمفتاح OpenRouter
// الجديد بدل مفتاح OneHop القديم.
//
// الموديل مثبّت من السيرفر (مش بياخده من الفرونت إند) — الفرونت إند لسه بيبعت
// model: "deepseek/deepseek-v4-pro" (اسم خاص بـ OneHop) بس ده هيتجاهل خالص
// ومنستبدله بالموديل الصح عند OpenRouter، فمفيش داعي نلمس الفرونت إند خالص.
const FORCED_MODEL = 'dots-studio/dots-3-note-preview:free';
const UPSTREAM_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const ONEHOP_API_KEY = process.env.ONEHOP_API_KEY;
    if (!ONEHOP_API_KEY) {
      return new Response(JSON.stringify({ error: 'ONEHOP_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'جسم الطلب غير صالح' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!Array.isArray(payload?.messages) || !payload.messages.length) {
      return new Response(JSON.stringify({ error: 'الرسايل مطلوبة' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // بنبني الـ body إحنا من الأول (مش بنمرر جسم الطلب زي ما هو زي قبل كده) —
    // عشان الموديل يفضل مثبّت دايمًا بغض النظر عما بيبعته الفرونت إند.
    const forwardBody = JSON.stringify({
      model: FORCED_MODEL,
      messages: payload.messages,
      stream: payload.stream !== false
    });

    let upstream;
    try {
      upstream = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ONEHOP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: forwardBody
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ OpenRouter' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok || !upstream.body) {
      // لسه مش بدأ الـ streaming (أخطاء auth/quota/bad-request بترجع كـ JSON عادي) —
      // آمن نمررها زي ما هي، مفيش حاجة نص الطريق.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    // من هنا الرد بدأ يتستريم فعليًا للمستخدم، فأي عطل في النص (اتصال OpenRouter
    // اتقطع، تايم آوت، إلخ) لازم نمسكه هنا بالظبط — خطأ يترمي بعد ما الفنكشن دي
    // ترجع بيبقى برة أي try/catch وبيكسر الطلب كله بصفحة 500 عامة. لفّينا القراءة
    // في ReadableStream بتاعنا عشان نقفلها بهدوء بدل ما الـ runtime يقتلها فجأة.
    const upstreamReader = upstream.body.getReader();
    const safeStream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await upstreamReader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        } catch (err) {
          try {
            controller.enqueue(new TextEncoder().encode(
              `data: {"error":{"message":"انقطع الاتصال بـ OpenRouter أثناء الرد"}}\n\n`
            ));
          } catch (e) {}
          controller.close();
        }
      },
      cancel() {
        try { upstreamReader.cancel(); } catch (e) {}
      }
    });

    return new Response(safeStream, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

