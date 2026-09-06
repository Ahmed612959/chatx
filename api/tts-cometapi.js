export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { attemptWithFailover } from './_keystore.js';

// ====================================================================================
// صوت Kling TTS عن طريق CometAPI — دلوقتي طبقة تانية بعد Amazon Polly (شوف
// tts-polly.js) في fetchTtsAudioBlob بالفرونت إند. لو Polly مش مضبوط أو فشل، ده أول
// حاجة بتتجرب. بيدعم أكتر من مفتاح مع تبديل تلقائي لو واحد فشل (شوف _keystore.js).
// ====================================================================================

const COMETAPI_TTS_URL = 'https://api.cometapi.com/kling/v1/audio/tts';
const DEFAULT_VOICE_ID = 'genshin_vindi2';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const { text, voice_id, voice_language, voice_speed } = await request.json().catch(() => ({}));
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'مفيش نص للتحويل لصوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let upstream;
    try {
      upstream = await attemptWithFailover('COMETAPI_API_KEY', (key) => fetch(COMETAPI_TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          text: text.slice(0, 2000),
          voice_id: voice_id || DEFAULT_VOICE_ID,
          voice_language: voice_language || 'ar',
          voice_speed: voice_speed || 1.0
        })
      }));
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return new Response(JSON.stringify({ error: 'COMETAPI_API_KEY غير مضبوط' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ CometAPI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'CometAPI رجّعت خطأ', detail: errText.slice(0, 500) }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (contentType.startsWith('audio/') || contentType.includes('octet-stream')) {
      return new Response(upstream.body, {
        status: 200,
        headers: { 'Content-Type': contentType || 'audio/mpeg', 'Cache-Control': 'no-store' }
      });
    }

    const data = await upstream.json().catch(() => null);
    const audioUrl = data?.audio_url || data?.data?.audio_url || data?.url || data?.data?.url;
    if (audioUrl) {
      const audioRes = await fetch(audioUrl);
      if (!audioRes.ok) {
        return new Response(JSON.stringify({ error: 'تعذر تحميل ملف الصوت الناتج من CometAPI' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(audioRes.body, {
        status: 200,
        headers: { 'Content-Type': audioRes.headers.get('content-type') || 'audio/mpeg', 'Cache-Control': 'no-store' }
      });
    }

    return new Response(JSON.stringify({ error: 'شكل رد CometAPI غير متوقع', detail: JSON.stringify(data).slice(0, 500) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
