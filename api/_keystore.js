// ====================================================================================
// مخزن مفاتيح بسيط بيسمح للأدمن يضيف/يغيّر مفتاح API من صفحة admin-apikeys.html
// من غير ما يحتاج يعمل deploy جديد كل مرة يغيّر فيها مفتاح.
//
// إزاي شغال:
//   - لو عندك Vercel KV (أو Upstash for Redis) مربوط بالمشروع، بيتخزن أي مفتاح
//     بيتضاف من لوحة الأدمن هناك، ودالة getApiKey بتدور عليه هناك الأول.
//   - لو مفيش KV مربوط أصلاً (الحالة الافتراضية)، كل حاجة بترجع تشتغل بالظبط زي
//     ما كانت — process.env.XXX_API_KEY العادي زي كل الملفات التانية. يعني مفيش
//     أي كسر لأي حاجة شغالة دلوقتي حتى لو محدش ربط KV خالص.
//
// عشان تفعّل الإضافة من لوحة الأدمن فعليًا: من Vercel Dashboard → Storage → Create
// Database → اختار "KV" (أو من ماركت بليس Upstash for Redis، بلان مجاني كفاية جدًا
// هنا) واربطه بالمشروع ده. Vercel بيضيف تلقائيًا KV_REST_API_URL و KV_REST_API_TOKEN
// كـ Environment Variables — مفيش أي كود إضافي مطلوب منك.
// ====================================================================================

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KEY_PREFIX = 'chatx:apikey:';

export function kvConfigured() {
  return Boolean(KV_URL && KV_TOKEN);
}

async function kvFetch(pathParts) {
  const url = `${KV_URL}/${pathParts.map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data && 'result' in data ? data.result : null;
}

// بيرجع المفتاح: أولوية لأي قيمة اتضافت يدويًا من لوحة الأدمن، ولو مفيش، يرجع
// لـ Environment Variable العادي بنفس الاسم بالظبط زي أي مزوّد تاني في المشروع.
export async function getApiKey(envName) {
  if (kvConfigured()) {
    try {
      const override = await kvFetch(['get', KEY_PREFIX + envName]);
      if (override) return override;
    } catch (e) {
      // KV اتعطل مؤقتًا — نكمل عادي بالمتغير العادي بدل ما نوقف الميزة كلها
    }
  }
  return process.env[envName] || '';
}

export async function setApiKey(envName, value) {
  if (!kvConfigured()) {
    const err = new Error('KV_NOT_CONFIGURED');
    err.code = 'KV_NOT_CONFIGURED';
    throw err;
  }
  const res = await fetch(
    `${KV_URL}/set/${encodeURIComponent(KEY_PREFIX + envName)}/${encodeURIComponent(value)}`,
    { headers: { Authorization: `Bearer ${KV_TOKEN}` } }
  );
  if (!res.ok) throw new Error('KV_SET_FAILED');
  return true;
}

export async function deleteApiKey(envName) {
  if (!kvConfigured()) {
    const err = new Error('KV_NOT_CONFIGURED');
    err.code = 'KV_NOT_CONFIGURED';
    throw err;
  }
  await kvFetch(['del', KEY_PREFIX + envName]);
  return true;
}

// بيرجع true لو فيه override متخزن من لوحة الأدمن لمفتاح معيّن (مش القيمة نفسها،
// عشان الاستخدام في شاشة الحالة/الإدارة من غير ما نسرّب أي مفتاح).
export async function hasOverride(envName) {
  if (!kvConfigured()) return false;
  try {
    const v = await kvFetch(['get', KEY_PREFIX + envName]);
    return Boolean(v);
  } catch (e) {
    return false;
  }
}
