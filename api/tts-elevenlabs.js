export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// صوت ElevenLabs — أعلى جودة واقعية متاحة حاليًا، محجوز للمشتركين Premium بس (الفرونت
// إند بيتأكد من hasPremium('premium_voice') قبل ما يكلم الـ endpoint ده أصلاً؛ المستخدم
// العادي مبيوصلش هنا خالص وبيفضل على السلسلة القديمة Azure ← Google Translate ← المتصفح).
//
// ELEVENLABS_VOICE_ID اختياري — لو مش متحط، بنستخدم صوت "Rachel" الافتراضي المدعوم في
// كل الحسابات (multilingual v2 بيشتغل بيه مع أي لغة بما فيها العربي، الصوت نفسه بيحدد
// الطابع/الجرس بس مش اللغة). لو عندك صوت مفضّل من مكتبة ElevenLabs بتاعتك، حط الـ voice_id
// بتاعه في env variable بالاسم ده.
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 15, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try { payload = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON غير صالح' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const text = (payload.text || '').toString().trim().slice(0, 5000);
    if (!text) {
      return new Response(JSON.stringify({ error: 'لا يوجد نص لتحويله لصوت' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    let upstream;
    try {
      upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة ElevenLabs' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      // 401 مفتاح غلط، 429 كوتة الحروف الشهرية خلصت — الاتنين بيترجعوا 502 موحّد عشان
      // الفرونت إند يرجع تلقائي للسلسلة القديمة من غير ما يفرّق في المعالجة بينهم.
      return new Response(JSON.stringify({ error: 'تعذر توليد الصوت من ElevenLabs', detail: detail.slice(0, 200) }), {
        status: upstream.status === 429 ? 502 : upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
