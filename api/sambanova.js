export const config = { runtime: 'edge' };

import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';
import { attemptWithFailover } from './_keystore.js';

// ====================================================================================
// الموديل هنا شغّال عن طريق Experiential Labs.
// بيستخدم المفتاح EXPLABS_API_KEY.
// ====================================================================================

const EXPLABS_URL = 'https://api.experientiallabs.ai/v1/chat/completions';
const EXPLABS_MODEL = 'claude-opus-5.5';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 }
      );
    }

    const rl = checkRateLimit(request, {
      limit: 20,
      windowMs: 60_000
    });

    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const rawBody = await request.text();

    // نجبر الموديل على claude-opus-5.5 دايمًا،
    // حتى لو وصل اسم موديل قديم من نسخة Frontend لسه متحدّثتش.
    let body = rawBody;

    try {
      const parsed = JSON.parse(rawBody);
      parsed.model = EXPLABS_MODEL;
      body = JSON.stringify(parsed);
    } catch (e) {
      // لو الـ body مش JSON صالح، سيبه زي ما هو
      // والمزوّد يرجّع الخطأ الخاص به.
    }

    let upstream;

    try {
      upstream = await attemptWithFailover(
        'EXPLABS_API_KEY',
        (key) =>
          fetch(EXPLABS_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            },
            body
          })
      );
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return new Response(
          JSON.stringify({
            error:
              'EXPLABS_API_KEY غير مضبوط في Environment Variables — ضيفه من إعدادات Vercel'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'تعذر الوصول لـ Experiential Labs'
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // تسجيل استخدام الـ API
    await reportApiUsage('claude-opus-5.5', body.length);

    if (!upstream.ok || !upstream.body) {
      // تسجيل تفاصيل الخطأ في Vercel Function Logs
      try {
        const errText = await upstream.clone().text();

        console.error(
          `⚠️ Experiential Labs رجّع status ${upstream.status}:`,
          errText.slice(0, 500)
        );
      } catch (e) {}

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type':
            upstream.headers.get('content-type') ||
            'application/json'
        }
      });
    }

    // قراءة الـ stream يدويًا حتى لا ينهار السيرفر
    // إذا حدث خطأ بعد بدء الـ streaming.
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
            controller.enqueue(
              new TextEncoder().encode(
                `data: {"error":{"message":"انقطع الاتصال بـ Experiential Labs أثناء الرد"}}\n\n`
              )
            );
          } catch (e) {}

          controller.close();
        }
      },

      cancel() {
        try {
          upstreamReader.cancel();
        } catch (e) {}
      }
    });

    return new Response(safeStream, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ||
          'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'خطأ غير متوقع في السيرفر',
        detail: String(err)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
