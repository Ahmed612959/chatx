export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';
import { isEntitled, extractBearerToken } from './_premiumCheck.js';

// ⚠️ الموديل ده مخصص للطلاب المشتركين في premium_ai بس. الفرونت إند بيتحقق من
// الاشتراك قبل ما يظهر الاختيار ده أصلاً، لكن ده مش كافي وحده — أي حد يقدر يفتح
// الـ devtools ويبعت طلب مباشر على الـ endpoint ده. عشان كده الموديل هنا مثبّت
// من السيرفر (مش بياخده من جسم الطلب) — حتى لو حد بعت "model" تاني في الـ body،
// هيتجاهل، ومحدش يقدر "يرقّي" نفسه لموديل أغلى.
//
// ✅ التحقق الحقيقي من الاشتراك موجود هنا كمان (مش بس في الفرونت إند): كل طلب
// بيتبعت معاه توكن School X (Authorization: Bearer)، وبنتأكد من الاشتراك فعليًا
// عن طريق /api/premium-status على السيرفر الرئيسي قبل ما نكمل — شوف _premiumCheck.js.
//
// ⚠️ ملحوظة مهمة: الملف/الـ endpoint ده لسه اسمه "claude-opus" واسمه في واجهة
// الموقع لسه "Claude" (عمدًا، بطلب صاحب المشروع)، لكن الموديل الفعلي اللي بيرد
// دلوقتي هو openai/gpt-5.6-sol مش أي موديل من Anthropic خالص. يعني الاسم ده بقى
// "علامة تجارية" داخلية بس مش وصف حقيقي للموديل الشغال فعليًا. لو حبيت تغيّر
// الاسم الظاهر للطلاب في القايمة (index.html) في أي وقت، قولّي.
//
// بروتوكول الاتصال: الموديل ده (زي كل موديلات openai/* عند OneHop) بيتنادى
// بالبروتوكول العادي القياسي لـ OpenAI (/v1/chat/completions، Authorization:
// Bearer) — على عكس موديلات anthropic/* اللي كانت شغالة قبل كده هنا واحتاجت
// بروتوكول Anthropic Messages المختلف تمامًا. فرجعنا للـ passthrough البسيط،
// مفيش داعي لأي ترجمة استريم.
const FORCED_MODEL = 'openai/gpt-5.6-sol';
const UPSTREAM_URL = 'https://api.onehop.ai/v1/chat/completions';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // حد أقل من باقي الموديلات (10 بدل 20) لأن الموديل ده أغلى بكتير في التكلفة —
    // بيحمي من استهلاك الرصيد بسرعة لو حصل استخدام مكثف أو غير طبيعي.
    const rl = checkRateLimit(request, { limit: 10, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    // الفحص الحقيقي للاشتراك — قبل أي حاجة تانية، وقبل حتى ما نتأكد من مفتاح
    // OneHop، عشان مفيش داعي نكمل أي خطوة تانية أصلاً لو الطلب مش مسموح بيه.
    const token = extractBearerToken(request);
    const allowed = await isEntitled(token, 'premium_ai');
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'الموديل ده متاح للمشتركين في Premium بس' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ⚠️ اسم الـ Environment Variable اتغيّر (كان CLAUDE_OPUS_API_KEY) لـ
    // PREMIUM_MODEL_API_KEY — عشان الاسم يبقى معبّر عن دوره الحقيقي (مفتاح
    // الموديل المميز اللي وراء "Claude" في الواجهة) مش مربوط باسم موديل معيّن،
    // خصوصًا إن الموديل الشغال فعليًا اتغيّر أكتر من مرة من غير ما اسم الـ UI يتغيّر.
    // لازم تضيف المتغير ده الجديد في Environment Variables على Vercel بقيمة
    // المفتاح الجديد، والقديم (CLAUDE_OPUS_API_KEY) يقدر يتشال بعد كده.
    const PREMIUM_MODEL_API_KEY = process.env.PREMIUM_MODEL_API_KEY;
    if (!PREMIUM_MODEL_API_KEY) {
      return new Response(JSON.stringify({ error: 'PREMIUM_MODEL_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'جسم الطلب غير صالح' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!Array.isArray(payload?.messages) || !payload.messages.length) {
      return new Response(JSON.stringify({ error: 'الرسايل مطلوبة' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // بنبني الـ body إحنا من الأول — مش بنمرر جسم الطلب زي ما هو — عشان الموديل
    // يفضل مثبّت دايمًا بغض النظر عما بيبعته الفرونت إند.
    const forwardBody = JSON.stringify({
      model: FORCED_MODEL,
      messages: payload.messages,
      stream: payload.stream !== false
    });

    let upstream;
    try {
      upstream = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PREMIUM_MODEL_API_KEY}`
        },
        body: forwardBody
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول للموديل' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok || !upstream.body) {
      // مش استريمنج لسه (أخطاء المصادقة/الحصة/الطلب الغلط بتوصل كـ JSON عادي) —
      // آمن إننا نمررها زي ما هي، مفيش حاجة نص عملية.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    // من هنا الاستجابة بدأت تتستريم فعليًا للعميل، فأي قطع في النص (الشبكة، تايم
    // آوت، إلخ) لازم نمسكه هنا — خطأ بعد ما الدالة دي ترجع هيكون برة أي try/catch
    // وهيسيب الاتصال يتقفل فجأة من غير رسالة واضحة للفرونت إند.
    const upstreamReader = upstream.body.getReader();
    const safeStream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await upstreamReader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        } catch (err) {
          try {
            controller.enqueue(new TextEncoder().encode(
              `data: {"error":{"message":"انقطع الاتصال بالموديل أثناء الرد"}}\n\n`
            ));
          } catch (e) {}
          controller.close();
        }
      },
      cancel() {
        try { upstreamReader.cancel(); } catch (e) {}
      }
    });

    return new Response(safeStream, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
