// وحدة مشتركة (زي _rateLimit.js و_premiumCheck.js بالظبط) — بتبعت تقرير مختصر
// لكل استدعاء AI فعلي (المزود + حجم الطلب) لسيرفر School X، عشان لوحة الأدمن
// تقدر تعرض عدّاد رسايل/تكلفة تقريبية شهرية لكل مزود، من غير ما الأدمن يتفاجئ
// بفاتورة آخر الشهر.
//
// استخدمها في أي api/*.js بينادي على مزود AI خارجي، فورًا بعد ما upstream fetch
// ينجح (وصل فعليًا للمزود، حتى لو رجّع خطأ — لسه ده استدعاء حقيقي مكلّف غالبًا):
//
//   import { reportApiUsage } from './_usageTrack.js';
//   await reportApiUsage('gemini', body.length);

const SCHOOL_API_URL = process.env.SCHOOL_API_URL || 'https://schoolx-eta.vercel.app';
// مفتاح داخلي بسيط (مش توكن طالب/أدمن — أغلب الملفات دي مفيش عندها توكن أصلًا)
// بيتحط زي ما هو في Environment Variables على المشروعين (chatx وSchool X) بنفس
// القيمة، عشان يمنع أي حد عشوائي من ضخ بيانات استهلاك وهمية في الإحصائيات.
// لو سايبها فاضية، الـ endpoint بيقبل الطلبات من غيرها (أسهل للتجربة، أقل أمانًا).
const INTERNAL_METRICS_KEY = process.env.INTERNAL_METRICS_KEY || '';

// await عمدًا (مش fire-and-forget حرفي) — لكن بحد أقصى 1.5 ثانية تايم آوت، عشان
// نضمن إن التقرير "يتبعت فعلاً" قبل ما الـ edge function يقفل (بعض بيئات الـ edge
// بتوقف أي كود شغال بعد ما الـ response يترجع، فمينفعش نسيبها تجري في الخلفية من
// غير استنى). التأخير الإضافي على رد الطالب: أقل من نص ثانية عادةً، ومحدود بـ1.5
// ثانية حتى لو School X كان بطيء أو واقع تمامًا — أبدًا مش هيوقف أو يبطّئ رد الشات
// نفسه بشكل ملحوظ، وأي فشل فيه بيتجاهل بهدوء تمامًا.
export async function reportApiUsage(provider, requestBytes) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    try {
      await fetch(`${SCHOOL_API_URL}/api/usage/api-cost/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(INTERNAL_METRICS_KEY ? { 'X-Internal-Key': INTERNAL_METRICS_KEY } : {})
        },
        body: JSON.stringify({ provider, requestBytes: requestBytes || 0 }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    // بصمت — تسجيل الإحصائيات مايأثرش أبدًا على رد الطالب الفعلي
  }
}
