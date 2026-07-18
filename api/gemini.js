export const config = { runtime: 'edge' };

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();

    let upstream;
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Gemini' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok || !upstream.body) {
      // Not streaming yet (auth/quota/bad-request errors arrive as a normal JSON
      // body) — safe to just forward as-is, nothing is mid-flight.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    // From here on the response has already started streaming to the client, so a
    // network blip partway through (Google's connection dropping, a timeout, etc.)
    // must be caught HERE — an error thrown after this function returns is outside
    // any try/catch and used to crash the whole invocation with a generic 500 page.
    // Wrapping the read loop in our own ReadableStream lets us end the stream
    // gracefully instead of letting the runtime kill it.
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
          // Surface a clean SSE error chunk instead of letting the connection just die,
          // so the frontend's parser sees something instead of an abrupt cutoff.
          try {
            controller.enqueue(new TextEncoder().encode(
              `data: {"error":{"message":"انقطع الاتصال بـ Gemini أثناء الرد"}}\n\n`
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
