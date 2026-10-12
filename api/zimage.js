export const config = { runtime: 'edge' };

import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { reportApiUsage } from './_usageTrack.js';

const OPENROUTER_URL =
  'https://openrouter.ai/api/v1/chat/completions';

const MODEL = 'qwen/qwen3.8-omni-flash';

export default async function handler(request) {
  try {
    // Allow POST requests only.
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Allow': 'POST'
          }
        }
      );
    }

    // Rate limiting: 10 requests per minute.
    const rl = checkRateLimit(request, {
      limit: 10,
      windowMs: 60_000
    });

    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    // Read the API key from the new environment variable.
    const API_KEY = process.env.QWEN_OMNI_API_KEY;

    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            'QWEN_OMNI_API_KEY غير مضبوط في Environment Variables'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Read and validate the request body.
    const rawBody = await request.text();

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON request body'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: 'messages must be a non-empty array'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Force the requested model.
    // Preserve messages, image content, and stream settings.
    body.model = MODEL;

    // Enable reasoning by default unless the client specifies it.
    if (body.reasoning === undefined) {
      body.reasoning = { enabled: true };
    }

    let upstream;

    // Send the request to OpenRouter.
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',

          'HTTP-Referer':
            process.env.OPENROUTER_SITE_URL ||
            'https://vercel.com',

          'X-OpenRouter-Title':
            process.env.OPENROUTER_APP_NAME ||
            'Chat X'
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'تعذر الاتصال بخدمة OpenRouter'
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Track usage without allowing tracking failures to break the response.
    try {
      await reportApiUsage('zimage', rawBody.length);
    } catch (err) {
      // Ignore usage tracking failures.
    }

    // Forward API errors from OpenRouter.
    if (!upstream.ok || !upstream.body) {
      const errorBody = await upstream.text();

      return new Response(errorBody, {
        status: upstream.status,
        headers: {
          'Content-Type':
            upstream.headers.get('content-type') ||
            'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }

    const contentType =
      upstream.headers.get('content-type') ||
      'application/json';

    // Forward non-streaming responses directly.
    if (!body.stream) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Safely forward streaming responses.
    const upstreamReader = upstream.body.getReader();
    const encoder = new TextEncoder();

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
          // Send an SSE error if the upstream stream is interrupted.
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: {
                    message:
                      'انقطع الاتصال بخدمة OpenRouter أثناء الرد'
                  }
                })}\n\n`
              )
            );
          } catch (e) {
            // The client may have already disconnected.
          }

          controller.close();
        }
      },

      async cancel(reason) {
        try {
          await upstreamReader.cancel(reason);
        } catch (err) {
          // Ignore cancellation errors.
        }
      }
    });

    return new Response(safeStream, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
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
