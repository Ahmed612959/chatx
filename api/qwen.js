export const config = { runtime: 'edge' };

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const QWEN_API_KEY = process.env.QWEN_API_KEY;
    if (!QWEN_API_KEY) {
      return new Response(JSON.stringify({ error: 'QWEN_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();

    // DashScope's OpenAI-compatible endpoint. This is the international (Singapore)
    // endpoint — if your Qwen key was issued from the mainland-China console instead,
    // swap this for https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
    let upstream;
    try {
      upstream = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Qwen' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(upstream.body, {
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
