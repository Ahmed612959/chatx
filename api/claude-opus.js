export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// ⚠️ الموديل ده مخصص للطلاب المشتركين في premium_ai بس. الفرونت إند بيتحقق من
// الاشتراك قبل ما يظهر الاختيار ده أصلاً، لكن ده مش كافي وحده — أي حد يقدر يفتح
// الـ devtools ويبعت طلب مباشر على الـ endpoint ده. عشان كده الموديل هنا مثبّت
// من السيرفر (مش بياخده من جسم الطلب) — حتى لو حد بعت "model" تاني في الـ body،
// هيتجاهل، ومحدش يقدر "يرقّي" نفسه لموديل أغلى.
//
// ⚠️ ملحوظة أمان مهمة: الـ endpoint ده — زي /api/cerebras بالظبط في الكود ده —
// مبيتحققش من إن صاحب الطلب فعلاً عنده اشتراك premium_ai (محتاج يتأكد من التوكن
// بتاع School X ويسأل قاعدة البيانات، وده مش متاح من جوه edge function زي دي من
// غير اتصال بقاعدة البيانات). يعني أي حد يعرف رابط السيرفر يقدر ينادي عليه
// مباشرة من برة الموقع من غير ما يكون مشترك. لو عايز حماية حقيقية على مستوى
// السيرفر، محتاج نضيف هنا تحقق من التوكن + الاشتراك عن طريق نداء على السيرفر
// الرئيسي (server-index.js) قبل ما نكمل — قولّي لو عايز ده.
//
// الموديل ده كان Claude Opus (لازم بروتوكول Anthropic Messages المختلف عبر
// /anthropic/v1/messages)، ودلوقتي اتغيّر لـ claude-fable-5 اللي بيشتغل عادي
// عبر بروتوكول OpenAI العادي (/v1/chat/completions) — فرجعنا للـ passthrough
// البسيط زي باقي الموديلات، مفيش داعي لأي ترجمة استريم دلوقتي.
const FORCED_MODEL = 'anthropic/claude-fable-5';
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

    const CLAUDE_OPUS_API_KEY = process.env.CLAUDE_OPUS_API_KEY;
    if (!CLAUDE_OPUS_API_KEY) {
      return new Response(JSON.stringify({ error: 'CLAUDE_OPUS_API_KEY غير مضبوط في Environment Variables' }), {
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
          'Authorization': `Bearer ${CLAUDE_OPUS_API_KEY}`
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
