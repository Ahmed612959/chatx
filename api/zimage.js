export const config = { runtime: 'edge' };

// Handles image analysis. Uses DashScope's OpenAI-compatible chat/completions endpoint with a
// vision-capable Qwen-VL model, so it can accept the same {role, content:[{type:'image_url',...}]}
// message shape the frontend sends. Uses DASHSCOPE_API_KEY (the key format shown in Alibaba's
// Model Studio docs/SDK examples); falls back to QWEN_API_KEY if that's the one already set, since
// both are the same kind of Model Studio key.
export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const API_KEY = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'DASHSCOPE_API_KEY (أو QWEN_API_KEY) غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();

    // Same DashScope international endpoint used by api/qwen.js — if your key was issued from
    // the mainland-China console instead, swap this for https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
    let upstream;
    try {
      upstream = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة تحليل الصور' }), {
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

    // See gemini.js/groq.js for why this manual read loop exists: an error that happens
    // after streaming has started is outside any try/catch around the fetch call, and left
    // unguarded it crashes the whole function instead of ending cleanly.
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
              `data: {"error":{"message":"انقطع الاتصال بخدمة تحليل الصور أثناء الرد"}}\n\n`
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
