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
export function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
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
export async function isEntitled(token, featureKey) {
  if (!token) return false;
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
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.type === 'admin') return true;
    return Array.isArray(data?.premiumFeatures) && data.premiumFeatures.includes(featureKey);
  } catch (e) {
    return false;
  }
}
