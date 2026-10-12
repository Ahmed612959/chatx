import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';

const OPENROUTER_URL =
  'https://openrouter.ai/api/v1/chat/completions';

const MODEL = 'qwen/qwen3.8-omni-flash';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    // Rate limiting
    const rl = checkRateLimit(req, {
      limit: 10,
      windowMs: 60_000,
    });

    if (!rl.allowed) {
      const response = rateLimitResponse(
        rl.retryAfterSeconds
      );

      res.statusCode = response.status;

      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      return res.end(await response.text());
    }

    // API key
    const API_KEY = process.env.QWEN_OMNI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error:
          'QWEN_OMNI_API_KEY غير مضبوط في Environment Variables',
      });
    }

    // Parse request body
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: 'Invalid JSON request body',
        });
      }
    }

    if (!body || !Array.isArray(body.messages) ||
        body.messages.length === 0) {
      return res.status(400).json({
        error: 'messages must be a non-empty array',
      });
    }

    // Keep the requested model fixed.
    body = {
      ...body,
      model: MODEL,
    };

    if (body.reasoning === undefined) {
      body.reasoning = { enabled: true };
    }

    // Call OpenRouter
    let upstream;

    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.OPENROUTER_SITE_URL ||
            'https://vercel.com',
          'X-OpenRouter-Title':
            process.env.OPENROUTER_APP_NAME || 'Chat X',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('OpenRouter connection error:', error);

      return res.status(502).json({
        error: 'تعذر الاتصال بخدمة OpenRouter',
      });
    }

    // Track usage; tracking failures must not break the response.
    try {
      await reportApiUsage(
        'zimage',
        Buffer.byteLength(JSON.stringify(body), 'utf8')
      );
    } catch (error) {
      console.error('Usage tracking error:', error);
    }

    // Forward provider errors.
    if (!upstream.ok || !upstream.body) {
      const errorBody = await upstream.text();

      res.status(upstream.status);
      res.setHeader(
        'Content-Type',
        upstream.headers.get('content-type') ||
          'application/json'
      );

      return res.end(errorBody);
    }

    const contentType =
      upstream.headers.get('content-type') ||
      'application/json';

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');

    if (body.stream) {
      res.setHeader('X-Accel-Buffering', 'no');

      if (!upstream.body.getReader) {
        return res.status(502).json({
          error: 'Streaming غير مدعوم في بيئة التشغيل الحالية',
        });
      }

      const reader = upstream.body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (res.destroyed) {
            await reader.cancel();
            return;
          }

          if (!res.write(Buffer.from(value))) {
            await new Promise((resolve) => {
              res.once('drain', resolve);
            });
          }
        }

        return res.end();
      } catch (error) {
        console.error('OpenRouter stream error:', error);

        if (!res.destroyed && !res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({
              error: {
                message:
                  'انقطع الاتصال بخدمة OpenRouter أثناء الرد',
              },
            })}\n\n`
          );

          return res.end();
        }
      }
    }

    // Non-streaming response
    const responseBody = await upstream.text();

    return res.end(responseBody);
  } catch (error) {
    console.error('zimage API error:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'خطأ غير متوقع في السيرفر',
      });
    }

    if (!res.destroyed && !res.writableEnded) {
      return res.end();
    }
  }
}
