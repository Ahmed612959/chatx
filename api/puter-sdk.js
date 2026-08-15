// السبب اللي عملنا الـ endpoint ده: بدل ما مربع <script> في الصفحة يستدعي المكتبة
// مباشرة من js.puter.com (دومين تالت)، بنخلي الصفحة تستدعيها من دومين موقعنا احنا
// (/api/puter-sdk)، والفنكشن دي هي اللي بتروح تجيب الملف من عند Puter نيابة عنك،
// وتخزّنه في الذاكرة (cache) لمدة ساعة، فمعظم الزوار بياخدوا الملف من الكاش فورًا من
// غير ما نضطر نطلب من js.puter.com كل مرة. ده بيحل مشكلتين:
//   ١) لو دومين js.puter.com بطيء أو متحجب عند شبكة/متصفح المستخدم (زي بعض الشبكات
//      المدرسية أو الـ Ad-Blockers اللي بتحجب دومينات خارجية غريبة)، تحميل السكريبت
//      مش هيعتمد عليه تحميل صفحتك — هتاخده من دومينك انت زي أي ملف تابع للموقع.
//   ٢) تقليل عدد الطلبات لسيرفرات Puter نفسها (كاش مشترك لكل الزوار بدل طلب لكل زائر).
//
// ملحوظة مهمة لازم تعرفها: الملف ده بس هو "كود تحميل المكتبة" — أما فعليًا لما حد
// يستخدم الصوت (puter.ai.txt2speech)، النداء ده بيتصل بسيرفرات Puter الحقيقية وقت
// التشغيل (مش حاجة نقدر "نستضيفها" إحنا، لأنها خدمة سحابية مربوطة بحساباتهم هما) —
// يعني الجزء ده برضه محتاج إنترنت شغال عند المستخدم وقت الاستماع، لكن على الأقل مش
// هيأثر على *فتح الصفحة* نفسها ولا هيعلّقها، وعندنا مهلة 20 ثانية على النداء ده أصلاً
// (راجع PUTER_TTS_TIMEOUT_MS في index.html) فلو Puter نفسه بطيء، بننزل تلقائي لصوت
// Azure/Google الاحتياطي بدل ما نستنى للأبد.
export const config = { runtime: 'edge' };

const PUTER_SDK_URL = 'https://js.puter.com/v2/';
const CACHE_TTL_MS = 60 * 60 * 1000; // ساعة واحدة — كفاية إن مفيش ضغط على js.puter.com لكل زيارة، وقليلة كفاية إن أي تحديث للمكتبة يوصلنا بسرعة معقولة

let cachedScript = null;
let cachedAt = 0;

export default async function handler(req) {
  const now = Date.now();
  if (!cachedScript || now - cachedAt > CACHE_TTL_MS) {
    try {
      const upstream = await fetch(PUTER_SDK_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChatXProxy/1.0)' }
      });
      if (!upstream.ok) throw new Error(`Puter SDK upstream ${upstream.status}`);
      cachedScript = await upstream.text();
      cachedAt = now;
    } catch (err) {
      // لو التحديث فشل ولسه عندنا نسخة قديمة مخزّنة، نفضل نستخدمها بدل ما نرجّع خطأ —
      // نسخة قديمة شوية أحسن بكتير من مفيش صوت خالص. لو مفيش نسخة خالص من الأول، هنا
      // بس بنرجّع خطأ فعلي.
      if (!cachedScript) {
        return new Response(`console.error('تعذر تحميل مكتبة Puter.js: ${String(err).replace(/'/g, "\\'")}');`, {
          status: 502,
          headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
        });
      }
    }
  }

  return new Response(cachedScript, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // الكاش على مستوى المتصفح/الـ CDN بتاع Vercel نفسه، مستقل عن الكاش الداخلي فوق
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
