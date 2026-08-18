// وحدة مشتركة (زي _rateLimit.js بالظبط) — بتتحقق فعليًا من إن صاحب الطلب مشترك
// في ميزة Premium معيّنة، عن طريق نداء على السيرفر الرئيسي (school x) اللي عنده
// قاعدة البيانات، بدل ما نصدّق أي حاجة جاية من الفرونت إند. استوردها في أي edge
// function بتحمي موديل Premium (زي /api/cerebras أو /api/claude-opus):
//
//   import { isEntitled, extractBearerToken } from './_premiumCheck.js';
//   const token = extractBearerToken(request);
//   if (!(await isEntitled(token, 'premium_ai'))) {
//     return new Response(JSON.stringify({ error: 'الموديل ده متاح للمشتركين في Premium بس' }), {
//       status: 403, headers: { 'Content-Type': 'application/json' }
//     });
//   }

// دومين باك إند School X — نفس الرابط اللي بيستخدمه الفرونت إند (FIXED_SCHOOL_API_URL
// في index.html). ممكن تحطه في Environment Variable اسمه SCHOOL_API_URL لو حبيت
// تغيّره من غير ما تعدّل كود، لكن مش إجباري — القيمة الافتراضية هنا مطابقة للموقع الحالي.
const SCHOOL_API_URL = process.env.SCHOOL_API_URL || 'https://schoolx-eta.vercel.app';

// بيقرأ التوكن من Authorization: Bearer <token> — لو مش موجود أو الصيغة غلط بيرجع null.
// شغالة مع نوعين مختلفين من الـ request objects عندنا في المشروع:
// - Web-standard Request (edge functions زي claude-opus.js): headers.get('authorization')
// - Node.js/Express-style request (regular serverless functions زي cerebras.js،
//   اللي شغالة Node مش Edge عشان تتخطى حماية Cerebras): headers.authorization مباشرة.
export function extractBearerToken(request) {
  const authHeader = (typeof request.headers?.get === 'function')
    ? (request.headers.get('authorization') || '')
    : (request.headers?.authorization || request.headers?.Authorization || '');
  const parts = authHeader.split(' ');
  return (parts[0] === 'Bearer' && parts[1]) ? parts[1] : null;
}

// بيرجع true لو ومبس لو المستخدم مسموحله فعليًا (أدمن، أو طالب معاه مفتاح الميزة
// المطلوبة في premiumFeatures بتاعته على قاعدة البيانات).
//
// ⚠️ fail-closed عمدًا: أي حالة غير أكيدة 100% (مفيش توكن، السيرفر الرئيسي رجّع
// خطأ، رد غريب، تايم آوت، مشكلة شبكة...) بترجع false (رفض)، مش true (سماح).
// الشك هنا لازم يروح لصالح الحماية مش لصالح السماح، عكس أغلب الأماكن التانية في
// الكود اللي بتفشل بشكل "مرن" (fallback لموديل تاني مثلاً) — هنا الفشل الآمن
// هو المنع، لأن التكلفة على الطرف التاني (استخدام موديل مكلّف من غير استحقاق).
//
// ⚡ كاش قصير في الذاكرة (90 ثانية) للموافقات بس — الطالب بيبعت رسايل كتير متتالية
// في نفس الشات، وكل رسالة كانت بتدفع تمن نداء شبكة كامل لـ School X من الأول، وده
// كان بيضيف تأخير محسوس فوق بطء الموديل نفسه. دلوقتي أول رسالة بس هي اللي بتستنى
// الفحص الكامل، والرسايل اللي بعدها (لحد 90 ثانية) بتاخد "مسموح" من الكاش فورًا.
// الرفض (false) مبيتكاشش خالص — كل رسالة من طالب مش مسموحله بتتفحص من جديد، عشان
// أي مشكلة شبكة عابرة أو طالب اتفعله الاشتراك لتوّه ميفضلش عالق برفض غلط.
// ⚠️ الكاش ده best-effort بس (edge/Node instances بتتقفل وتتفتح من غير إنذار،
// فمش مضمون إنه يفضل موجود بين كل رسالتين) ومش مشترك بين الموديلين (Cerebras
// وClaude Opus كل واحد بقالته نسخة منفصلة من الملف ده — عادي، الكاش محلي لكل
// instance مش قاعدة بيانات مركزية). التريدأوف الوحيد: لو الأدمن سحب الاشتراك من
// طالب وهو نص محادثة، ممكن ياخد لحد 90 ثانية لحد ما السحب يتفعّل بدل ما يكون
// فوري — مقبول جدًا مقابل السرعة المكتسبة، وأقل بكتير من صلاحية التوكن نفسه (24 ساعة).
const ENTITLEMENT_CACHE_TTL_MS = 90_000;
const entitlementCache = new Map(); // key: `${token}:${featureKey}` → { allowed, expiresAt }

export async function isEntitled(token, featureKey) {
  if (!token) return false;

  const cacheKey = `${token}:${featureKey}`;
  const cached = entitlementCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.allowed;
  }

  let allowed = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    let res;
    try {
      res = await fetch(`${SCHOOL_API_URL}/api/premium-status`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (res.ok) {
      const data = await res.json();
      allowed = data?.type === 'admin'
        || (Array.isArray(data?.premiumFeatures) && data.premiumFeatures.includes(featureKey));
    }
  } catch (e) {
    allowed = false;
  }

  // بنكاش الموافقة (true) بس — مش الرفض. لو كاشنا false كمان، أي مشكلة شبكة
  // عابرة أو طالب اتفعله الاشتراك لتوّه ممكن يفضل مرفوض لحد 90 ثانية غلط، وده
  // أسوأ بكتير من تمن نداء شبكة إضافي واحد. التريدأوف بقى في اتجاه واحد بس:
  // نكسب سرعة للحالة العادية (طالب مشترك فعلًا بيبعت رسايل متتالية) من غير ما
  // نخاطر نمنع حد مستحق فعلًا.
  if (allowed) {
    if (entitlementCache.size > 500) entitlementCache.clear();
    entitlementCache.set(cacheKey, { allowed: true, expiresAt: Date.now() + ENTITLEMENT_CACHE_TTL_MS });
  }

  return allowed;
}
