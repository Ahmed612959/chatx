export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';
import { attemptWithFailover } from './_keystore.js';

// ====================================================================================
// الموديل هنا شغّال عن طريق OpenRouter (z-ai/glm-5.2:free). بيستخدم المفتاح
// OPENROUTER_API_KEY — ضيفه من صفحة admin-apikeys.html، وتقدر تحط أكتر من مفتاح
// وهيتبدّل بينهم تلقائيًا لو واحد فشل (شوف _keystore.js).
// ====================================================================================

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'z-ai/glm-5.2:free';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const rawBody = await request.text();

    // نجبر الموديل على z-ai/glm-5.2:free دايمًا، حتى لو وصل اسم موديل قديم
    // من نسخة فرونت إند لسه متحدّثتش.
    let body = rawBody;
    try {
      const parsed = JSON.parse(rawBody);
      parsed.model = OPENROUTER_MODEL;
      body = JSON.stringify(parsed);
    } catch (e) {
      // لو الـ body مش JSON صالح، سيبه زي ما هو ووديه للمزوّد يرجّع خطأه بنفسه.
    }

    let upstream;
    try {
      upstream = await attemptWithFailover('OPENROUTER_API_KEY', (key) => fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body
      }));
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY غير مضبوط في Environment Variables — ضيفه من صفحة admin-apikeys.html' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ OpenRouter' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // استدعاء فعلي وصل للمزود (حتى لو رجّع خطأ لاحقًا) — نسجّله لعدّاد التكلفة التقريبية الشهرية.
    await reportApiUsage('mistral', body.length);

    if (!upstream.ok || !upstream.body) {
      // نسجّل تفاصيل الخطأ في Vercel Function Logs كمان (مش بس في رد المتصفح)
      // عشان تقدر تشوفه حتى لو الطالب مبعتلكش سكرين شوت للـ console.
      try {
        const errText = await upstream.clone().text();
        console.error(`⚠️ OpenRouter رجّع status ${upstream.status}:`, errText.slice(0, 500));
      } catch (e) {}
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    // See gemini.js for why this manual read loop exists: an error that happens
    // after streaming has started is outside any try/catch around the fetch call,
    // and left unguarded it crashes the whole function instead of ending cleanly.
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
