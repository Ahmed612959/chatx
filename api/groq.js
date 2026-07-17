here// Vercel Edge Function. Runs on Vercel's edge runtime so we can stream the
// response straight through (Node serverless functions buffer the body,
// which breaks the typing/streaming effect).
export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY غير مضبوط في Environment Variables' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await request.text();

  let upstream;
  try {
    upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Groq' }), {
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
}
