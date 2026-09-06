// ====================================================================================
// مخزن مفاتيح متعدد بيسمح للأدمن يضيف أكتر من مفتاح لنفس المزوّد من صفحة
// admin-apikeys.html، ولو مفتاح فشل (رجّع خطأ أو الشبكة اتقطعت)، النظام بيجرب
// المفتاح اللي بعده تلقائيًا من غير أي تدخل ولا deploy جديد على Vercel.
//
// إزاي شغال:
//   - كل مفاتيح مزوّد معيّن (مثلاً COMETAPI_API_KEY) بتتخزن كقائمة في Vercel KV
//     (أو Upstash for Redis) — كل مفتاح ليه عداد فشل (failCount) بيزيد كل ما فشل
//     وبيرجع صفر تاني أول ما ينجح، عشان أسلم مفتاح دايمًا يتجرب الأول.
//   - Environment Variable العادي (زي COMETAPI_API_KEY في Vercel) بيفضل شغال زي ما
//     هو دايمًا كـ "آخر خط دفاع" حتى لو مفيش KV أو مفيش مفاتيح مضافة من اللوحة —
//     مفيش أي كسر لأي حاجة شغالة دلوقتي.
//
// عشان تفعّل الإضافة المتعددة من لوحة الأدمن فعليًا لازم KV مربوط بالمشروع (مرة
// واحدة بس): Vercel Dashboard → Storage → Create Database → KV (أو Upstash for
// Redis من الماركت بليس، البلان المجاني كفاية جدًا هنا). لحد ما تعمل كده، تقدر
// تحط أكتر من مفتاح لنفس المزوّد كـ فاصلة بين بعض في نفس الـ Environment Variable
// (مثلاً COMETAPI_API_KEY = "key1,key2,key3") وهو برضه هيجرب بينهم تلقائيًا لو
// واحد فشل، من غير أي حاجة تانية مطلوبة منك ولا أي ربط KV.
// ====================================================================================

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const LIST_PREFIX = 'chatx:apikeys:'; // + envName -> JSON array of {id,key,label,failCount,lastError,addedAt}

export function kvConfigured() {
  return Boolean(KV_URL && KV_TOKEN);
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data && 'result' in data ? data.result : null;
}

async function kvSet(key, value) {
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!res.ok) throw new Error('KV_SET_FAILED');
  return true;
}

async function readList(envName) {
  if (!kvConfigured()) return [];
  try {
    const raw = await kvGet(LIST_PREFIX + envName);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

async function writeList(envName, list) {
  if (!kvConfigured()) {
    const err = new Error('KV_NOT_CONFIGURED');
    err.code = 'KV_NOT_CONFIGURED';
    throw err;
  }
  await kvSet(LIST_PREFIX + envName, JSON.stringify(list));
  return true;
}

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function maskKey(value) {
  if (!value) return '';
  if (value.length <= 8) return '••••';
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

// المفاتيح اللي حطها الأدمن من اللوحة، وقيمة الـ Environment Variable العادي لو
// موجودة، اتنين بيتقروا هنا (فاصلة بين بعض في المتغير العادي معناها أكتر من مفتاح
// برضه، للي مش عايز يربط KV خالص).
function envFallbackKeys(envName) {
  const raw = process.env[envName] || '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// بيرجع المفاتيح مرتّبة: مفاتيح اللوحة (الأنضف/الأقل فشلًا الأول)، وبعدين أي مفتاح
// في الـ Environment Variable العادي كخط دفاع أخير. كل عنصر: { id, key }.
// id = 'env:<index>' لمفاتيح الـ Environment Variable (مفيش تتبع فشل ليها فردي).
async function getOrderedKeys(envName) {
  const stored = await readList(envName);
  const sorted = [...stored].sort((a, b) => (a.failCount || 0) - (b.failCount || 0));
  const fromPanel = sorted.map(k => ({ id: k.id, key: k.key }));
  const fromEnv = envFallbackKeys(envName).map((key, i) => ({ id: `env:${i}`, key }));
  return [...fromPanel, ...fromEnv];
}

function isPanelId(id) {
  return typeof id === 'string' && !id.startsWith('env:');
}

async function reportFailure(envName, id, errMsg) {
  if (!isPanelId(id) || !kvConfigured()) return;
  try {
    const list = await readList(envName);
    const entry = list.find(k => k.id === id);
    if (!entry) return;
    entry.failCount = (entry.failCount || 0) + 1;
    entry.lastError = String(errMsg || '').slice(0, 200);
    await writeList(envName, list);
  } catch (e) { /* تتبع الفشل best-effort — مش أولوية توقف الطلب لو فشل هو نفسه */ }
}

async function reportSuccess(envName, id) {
  if (!isPanelId(id) || !kvConfigured()) return;
  try {
    const list = await readList(envName);
    const entry = list.find(k => k.id === id);
    if (!entry || !entry.failCount) return;
    entry.failCount = 0;
    entry.lastError = '';
    await writeList(envName, list);
  } catch (e) { /* best-effort */ }
}

// ====================================================================================
// الدالة الرئيسية اللي بتستخدمها كل ملفات api/*.js: بتاخد اسم الـ Environment
// Variable ودالة attemptFn(key) بترجع upstream Response. بتجرب كل مفتاح بالترتيب
// (الأسلم الأول)، ولو مفتاح رجّع رد فشل (status مش ok) أو الشبكة اتقطعت، بتسجّل
// الفشل وتجرب اللي بعده تلقائيًا. لو كل المفاتيح فشلت، بترجع آخر رد فشل وصلها (أو
// آخر استثناء لو كل المحاولات كانت أخطاء شبكة).
// ====================================================================================
export async function attemptWithFailover(envName, attemptFn) {
  const keys = await getOrderedKeys(envName);
  if (!keys.length) {
    const err = new Error('NO_API_KEY');
    err.code = 'NO_API_KEY';
    throw err;
  }

  let lastResponse = null;
  let lastError = null;

  for (const entry of keys) {
    let res;
    try {
      res = await attemptFn(entry.key);
    } catch (err) {
      lastError = err;
      reportFailure(envName, entry.id, String(err)).catch(() => {});
      continue;
    }
    if (res && res.ok) {
      reportSuccess(envName, entry.id).catch(() => {});
      return res;
    }
    lastResponse = res;
    if (res) {
      let detail = '';
      try { detail = (await res.clone().text()).slice(0, 200); } catch (e) {}
      reportFailure(envName, entry.id, `HTTP ${res.status} ${detail}`).catch(() => {});
    }
  }

  if (lastResponse) return lastResponse; // كل المفاتيح فشلت بردود فعلية — رجّع آخر واحد زي ما هو
  throw lastError || new Error('ALL_KEYS_FAILED');
}

// ====================== دوال إدارة لوحة admin-apikeys.html ======================

export async function listManagedKeys(envName) {
  const list = await readList(envName);
  return list.map(k => ({
    id: k.id,
    label: k.label || '',
    masked: maskKey(k.key),
    failCount: k.failCount || 0,
    lastError: k.lastError || '',
    addedAt: k.addedAt || null
  }));
}

export async function addManagedKey(envName, key, label) {
  const list = await readList(envName);
  list.push({ id: genId(), key, label: label || '', failCount: 0, lastError: '', addedAt: Date.now() });
  await writeList(envName, list);
  return true;
}

export async function deleteManagedKey(envName, id) {
  const list = await readList(envName);
  const next = list.filter(k => k.id !== id);
  await writeList(envName, next);
  return true;
}

export async function revealManagedKey(envName, id) {
  const list = await readList(envName);
  const entry = list.find(k => k.id === id);
  return entry ? entry.key : null;
}

// بيرجع true لو فيه مفتاح واحد على الأقل مضبوط (من اللوحة أو Environment Variable)
// — يستخدم في شاشات الحالة (health/admin) من غير ما يسرّب أي قيمة.
export async function hasAnyKey(envName) {
  const keys = await getOrderedKeys(envName);
  return keys.length > 0;
}
