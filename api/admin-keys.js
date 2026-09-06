export const config = { runtime: 'edge' };
import { getApiKey, setApiKey, deleteApiKey, kvConfigured, hasOverride } from './_keystore.js';

// ====================================================================================
// بيدعم صفحة admin-apikeys.html — عشان الأدمن يضيف/يغيّر مفتاح API لأي مزوّد من
// المتصفح مباشرة من غير ما يحتاج يدخل Vercel Dashboard كل مرة.
//
// الحماية: بيتطلب Authorization: Bearer <ADMIN_PANEL_SECRET> — نفس القيمة اللي
// المفروض تحطها إنت في Environment Variables باسم ADMIN_PANEL_SECRET (اختار قيمة
// عشوائية طويلة وسيبها سر، ده هو "الباسورد" بتاع صفحة admin-apikeys.html).
//
// الحفظ الفعلي بيحصل في Vercel KV (أو Upstash for Redis) لو مربوط بالمشروع —
// لو لسه مش مربوط، الـ endpoint بيقول كده بوضوح بدل ما يدّعي إن الحفظ نجح.
// ====================================================================================

// كل مفتاح ممكن الأدمن يتحكم فيه من الصفحة — اسم الـ Environment Variable + وصف
// قصير يظهر في الواجهة. ضيف أي مزوّد جديد هنا وهيظهر تلقائيًا في admin-apikeys.html.
const MANAGED_KEYS = [
  { env: 'COMETAPI_API_KEY', label: 'CometAPI (صوت Kling TTS للمكالمة)' },
  { env: 'GROQ_API_KEY', label: 'Groq (رد سريع + Whisper للتعرف على الصوت)' },
  { env: 'GEMINI_API_KEY', label: 'Gemini' },
  { env: 'DEEPSEEK_API_KEY', label: 'DeepSeek' },
  { env: 'QWEN_API_KEY', label: 'Qwen' },
  { env: 'OPENROUTER_API_KEY', label: 'OpenRouter' },
  { env: 'MISTRAL_API_KEY', label: 'Mistral' },
  { env: 'SAMBANOVA_API_KEY', label: 'SambaNova' },
  { env: 'CEREBRAS_API_KEY', label: 'Cerebras' },
  { env: 'PREMIUM_MODEL_API_KEY', label: 'Claude Opus (Premium)' },
  { env: 'AZURE_SPEECH_KEY', label: 'Azure Neural TTS' },
  { env: 'ELEVENLABS_API_KEY', label: 'ElevenLabs TTS' }
];

function checkAdmin(request) {
  const secret = process.env.ADMIN_PANEL_SECRET;
  if (!secret) return false; // لازم الأدمن يضبط السر ده الأول — من غيره مفيش دخول خالص
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token && token === secret;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function maskKey(value) {
  if (!value) return null;
  if (value.length <= 8) return '••••';
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

export default async function handler(request) {
  try {
    if (!process.env.ADMIN_PANEL_SECRET) {
      return json({ error: 'ADMIN_PANEL_SECRET غير مضبوط في Environment Variables — ضيفه الأول عشان تقدر تستخدم لوحة المفاتيح' }, 500);
    }
    if (!checkAdmin(request)) {
      return json({ error: 'مش مسموحلك — سر الأدمن غلط أو ناقص' }, 401);
    }

    if (request.method === 'GET') {
      const rows = await Promise.all(MANAGED_KEYS.map(async (k) => {
        const value = await getApiKey(k.env);
        const overridden = await hasOverride(k.env);
        return {
          env: k.env,
          label: k.label,
          configured: Boolean(value),
          masked: maskKey(value),
          source: value ? (overridden ? 'admin-panel' : 'environment-variable') : 'not-set'
        };
      }));
      return json({ kvConfigured: kvConfigured(), providers: rows });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { env, apiKey } = body;
      if (!env || !MANAGED_KEYS.some(k => k.env === env)) {
        return json({ error: 'اسم المفتاح ده مش معروف' }, 400);
      }
      if (!apiKey || !apiKey.trim()) {
        return json({ error: 'اكتب المفتاح الأول' }, 400);
      }
      try {
        await setApiKey(env, apiKey.trim());
      } catch (e) {
        if (e.code === 'KV_NOT_CONFIGURED') {
          return json({ error: 'لازم تربط Vercel KV (أو Upstash for Redis) بالمشروع الأول عشان الحفظ من الصفحة يشتغل — لحد ما تعمل كده تقدر تضبط المفتاح مباشرة من Environment Variables في Vercel' }, 501);
        }
        return json({ error: 'تعذر حفظ المفتاح' }, 502);
      }
      return json({ ok: true });
    }

    if (request.method === 'DELETE') {
      const body = await request.json().catch(() => ({}));
      const { env } = body;
      if (!env || !MANAGED_KEYS.some(k => k.env === env)) {
        return json({ error: 'اسم المفتاح ده مش معروف' }, 400);
      }
      try {
        await deleteApiKey(env);
      } catch (e) {
        if (e.code === 'KV_NOT_CONFIGURED') {
          return json({ error: 'مفيش KV مربوط أصلاً فمفيش override نمسحه' }, 501);
        }
        return json({ error: 'تعذر مسح المفتاح' }, 502);
      }
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }, 500);
  }
}
