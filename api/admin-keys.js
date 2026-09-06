export const config = { runtime: 'edge' };
import { listManagedKeys, addManagedKey, deleteManagedKey, revealManagedKey, kvConfigured, hasAnyKey } from './_keystore.js';

// ====================================================================================
// بيدعم صفحة admin-apikeys.html — إضافة/مسح/كشف أكتر من مفتاح لكل مزوّد، مع تتبع
// عدد مرات الفشل لكل مفتاح (بتتحدّث تلقائيًا من _keystore.js وقت استخدام المفاتيح
// الفعلي في باقي ملفات api/*.js عن طريق attemptWithFailover).
//
// الحماية: بيتطلب Authorization: Bearer <ADMIN_PANEL_SECRET> — نفس القيمة اللي
// المفروض تحطها إنت في Environment Variables باسم ADMIN_PANEL_SECRET.
// ====================================================================================

// كل مفتاح ممكن الأدمن يتحكم فيه من الصفحة — اسم الـ Environment Variable + وصف
// قصير يظهر في الواجهة. ضيف أي مزوّد جديد هنا وهيظهر تلقائيًا في admin-apikeys.html.
// ملحوظة: AWS (Polly) مستثناة عمدًا من هنا لأنها زوج مفاتيح (Access Key + Secret)
// مش قيمة واحدة، فبتتضبط من Environment Variables في Vercel مباشرة بس — التفاصيل
// في تعليق أعلى api/tts-polly.js.
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
        const keys = await listManagedKeys(k.env);
        const envHasFallback = Boolean((process.env[k.env] || '').trim());
        return { env: k.env, label: k.label, keys, envHasFallback };
      }));
      return json({ kvConfigured: kvConfigured(), providers: rows });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { action, env, apiKey, label, id } = body;

      if (!env || !MANAGED_KEYS.some(k => k.env === env)) {
        return json({ error: 'اسم المزوّد ده مش معروف' }, 400);
      }

      if (action === 'reveal') {
        if (!id) return json({ error: 'مفيش id للمفتاح' }, 400);
        const value = await revealManagedKey(env, id);
        if (!value) return json({ error: 'المفتاح مش موجود' }, 404);
        return json({ value });
      }

      // الإجراء الافتراضي: إضافة مفتاح جديد لنفس المزوّد (يتضاف لقائمة المفاتيح،
      // مش بيستبدل القديم — يعني ممكن تحط أكتر من مفتاح وهيتبدّل بينهم تلقائيًا
      // لو واحد فشل).
      if (!apiKey || !apiKey.trim()) {
        return json({ error: 'اكتب المفتاح الأول' }, 400);
      }
      try {
        await addManagedKey(env, apiKey.trim(), label || '');
      } catch (e) {
        if (e.code === 'KV_NOT_CONFIGURED') {
          return json({ error: 'لازم تربط Vercel KV (أو Upstash for Redis) بالمشروع الأول عشان تقدر تضيف أكتر من مفتاح من الصفحة — لحد ما تعمل كده تقدر تحط أكتر من مفتاح مفصولين بفاصلة في نفس الـ Environment Variable مباشرة من Vercel' }, 501);
        }
        return json({ error: 'تعذر حفظ المفتاح' }, 502);
      }
      return json({ ok: true });
    }

    if (request.method === 'DELETE') {
      const body = await request.json().catch(() => ({}));
      const { env, id } = body;
      if (!env || !MANAGED_KEYS.some(k => k.env === env)) {
        return json({ error: 'اسم المزوّد ده مش معروف' }, 400);
      }
      if (!id) return json({ error: 'مفيش id للمفتاح' }, 400);
      try {
        await deleteManagedKey(env, id);
      } catch (e) {
        if (e.code === 'KV_NOT_CONFIGURED') {
          return json({ error: 'مفيش KV مربوط أصلاً فمفيش مفاتيح متخزنة نمسحها من هنا' }, 501);
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
