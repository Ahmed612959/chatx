export const config = { runtime: 'edge' };

// Free text-to-speech proxy for the "listen to the bot's reply" button.
//
// Uses Google Translate's public `translate_tts` endpoint — the same one the Google
// Translate website itself calls when you click its speaker icon. It needs no API key
// and costs nothing, but it's an unofficial, undocumented endpoint with two practical
// limits: (1) it caps each request at roughly 200 characters, and (2) Google can rate-limit
// or block it without notice. That's why long replies are split into chunks and the
// resulting MP3 chunks are concatenated server-side before being sent back as one file,
// and why the frontend (see speakText/speakWithBrowserFallback in index.html) automatically
// falls back to the browser's own speechSynthesis if this route ever fails.

const MAX_CHUNK = 190; // stay safely under Google's ~200 char-per-request limit
const MAX_CHUNKS = 20; // hard cap so one huge message can't trigger dozens of upstream calls
const MAX_INPUT_CHARS = 4000;

function splitIntoChunks(text) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK) {
      chunks.push(remaining);
      break;
    }
    // Prefer cutting at a sentence/clause boundary, then a space, within the limit —
    // never mid-word, so the resulting audio doesn't clip a word in half.
    let cut = remaining.lastIndexOf('. ', MAX_CHUNK);
    if (cut < 40) cut = remaining.lastIndexOf('؟ ', MAX_CHUNK);
    if (cut < 40) cut = remaining.lastIndexOf('! ', MAX_CHUNK);
    if (cut < 40) cut = remaining.lastIndexOf('، ', MAX_CHUNK);
    if (cut < 40) cut = remaining.lastIndexOf(' ', MAX_CHUNK);
    if (cut < 40) cut = MAX_CHUNK;
    chunks.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  return chunks.filter(Boolean);
}

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON غير صالح' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = ((payload && payload.text) || '').toString().trim().slice(0, MAX_INPUT_CHARS);
    const lang = (payload && payload.lang) ? String(payload.lang).slice(0, 10) : 'ar';
    if (!text) {
      return new Response(JSON.stringify({ error: 'لا يوجد نص لتحويله لصوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const chunks = splitIntoChunks(text).slice(0, MAX_CHUNKS);
    if (chunks.length === 0) {
      return new Response(JSON.stringify({ error: 'لا يوجد نص لتحويله لصوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const buffers = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob&idx=${i}&total=${chunks.length}&textlen=${chunk.length}`;

      let upstream;
      try {
        upstream = await fetch(url, {
          headers: {
            // Google's TTS endpoint returns 403 without a normal-looking browser UA.
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة تحويل النص لصوت' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: 'خدمة تحويل النص لصوت رفضت الطلب', status: upstream.status }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      buffers.push(new Uint8Array(await upstream.arrayBuffer()));
    }

    let totalLen = 0;
    for (const b of buffers) totalLen += b.length;
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const b of buffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    return new Response(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
