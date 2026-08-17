export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

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

    // الفرونت إند أصلاً بيبعت { model, messages, stream } بصيغة OpenAI جاهزة —
    // نفس الشكل اللي OneHop بتتوقعه بالظبط، فمنمررها زي ما هي من غير ما نفككها.
    const body = await request.text();

    let upstream;
    try {
      upstream = await fetch('https://api.onehop.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ONEHOP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ OneHop' }), {
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

    // من هنا الرد بدأ يتستريم فعليًا للمستخدم، فأي عطل في النص (اتصال OneHop
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
              `data: {"error":{"message":"انقطع الاتصال بـ OneHop أثناء الرد"}}\n\n`
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
