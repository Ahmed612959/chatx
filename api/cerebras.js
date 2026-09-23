// Runs as a standard Node.js serverless function (not edge) — Cerebras's API sits
// behind a bot-protection layer that was blocking the Edge runtime's fetch requests
// outright (returning an HTML block page instead of a JSON API response). Regular
// Node functions send a different network/TLS fingerprint that gets through.

import { checkRateLimit } from './_rateLimit.js';
import { isEntitled, extractBearerToken } from './_premiumCheck.js';
import { reportApiUsage } from './_usageTrack.js';

// الموديل مثبّت من السيرفر دايمًا — حتى لو الفرونت إند بعت اسم موديل تاني في
// الـ body، هيتجاهل بالكامل ونستبدله بالقيمة دي. من غير التثبيت ده، أي حد معاه
// توكن مشترك (أو مسروق) كان يقدر يطلب أي موديل تاني متاح على Cerebras، أو يحط
// max_tokens ضخم، أو يستخدم الـ endpoint كبروكسي مفتوح لحاجة تانية خالص غير
// شات التطبيق — ده أخطر بكتير من مجرد استهلاك زيادة، لأنه فعليًا "سرقة" استخدام
// المفتاح المدفوع لأي غرض غير مقصود.
const FORCED_MODEL = 'gpt-oss-120b';
const MAX_MESSAGES = 60;              // حد أقصى منطقي لعدد الرسايل في المحادثة الواحدة
const MAX_MESSAGE_CHARS = 12000;      // حد أقصى لطول أي رسالة واحدة
const MAX_TOKENS_CAP = 2000;          // سقف صارم لعدد الكلمات المسموح للموديل يرد بيها

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const rl = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      response.setHeader('Retry-After', String(rl.retryAfterSeconds));
      return response.status(429).json({ error: `طلبات كتير أوي في وقت قصير — حاول تاني بعد ${rl.retryAfterSeconds} ثانية` });
    }

    // ✅ التحقق الحقيقي من الاشتراك (مش بس ثقة في الفرونت إند): كل طلب لازم يجيب
    // معاه توكن School X، وبنتأكد فعليًا من قاعدة البيانات إن صاحبه مشترك في
    // premium_ai (أو أدمن) قبل ما نكمل — شوف _premiumCheck.js لتفاصيل الـ fail-closed.
    const token = extractBearerToken(request);
    const allowed = await isEntitled(token, 'premium_ai');
    if (!allowed) {
      return response.status(403).json({ error: 'الموديل ده متاح للمشتركين في Premium بس' });
    }

    const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
    if (!CEREBRAS_API_KEY) {
      return response.status(500).json({ error: 'CEREBRAS_API_KEY غير مضبوط في Environment Variables' });
    }

    // فاليديشن الرسايل: مش بنثق في شكل جسم الطلب — لازم يكون فيه مصفوفة messages
    // صحيحة، كل عنصر فيها role/content بالشكل المتوقع بس، وبحدود حجم منطقية.
    const rawMessages = request.body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return response.status(400).json({ error: 'الرسايل مطلوبة' });
    }
    if (rawMessages.length > MAX_MESSAGES) {
      return response.status(400).json({ error: 'عدد الرسايل في المحادثة أكبر من المسموح' });
    }
    const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);
    const cleanMessages = [];
    for (const m of rawMessages) {
      const role = ALLOWED_ROLES.has(m?.role) ? m.role : 'user';
      const content = typeof m?.content === 'string' ? m.content.slice(0, MAX_MESSAGE_CHARS) : '';
      if (!content) continue;
      cleanMessages.push({ role, content });
    }
    if (cleanMessages.length === 0) {
      return response.status(400).json({ error: 'الرسايل فاضية' });
    }

    // بنبني الـ body إحنا من الصفر — مش بنمرر جسم الطلب زي ما هو — عشان الموديل
    // والحدود القصوى يفضلوا مثبّتين دايمًا بغض النظر عما بيبعته الفرونت إند.
    const forwardBody = JSON.stringify({
      model: FORCED_MODEL,
      messages: cleanMessages,
      stream: true,
      max_tokens: MAX_TOKENS_CAP
    });

    let upstream;
    try {
      upstream = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/event-stream'
        },
        body: forwardBody
      });
    } catch (err) {
      return response.status(502).json({ error: 'تعذر الوصول لـ Cerebras' });
    }

    // استدعاء فعلي وصل لـ Cerebras (حتى لو رجّع خطأ لاحقًا) — نسجّله لعدّاد التكلفة
    // التقريبية الشهرية. الموديل ده تحديدًا (premium_ai) من الأغلى في التطبيق.
    await reportApiUsage('cerebras', forwardBody.length);

    if (!upstream.ok) {
      const text = await upstream.text();
      const looksLikeHtml = text.trim().startsWith('<');
      return response.status(upstream.status).json({
        error: looksLikeHtml
          ? 'Cerebras رفض الطلب على مستوى الشبكة (صفحة حجب وليست رد API) — قد يكون IP سيرفر Vercel محظور مؤقتًا من مزود الحماية'
          : text.slice(0, 500)
      });
    }

    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      response.write(value);
    }
    response.end();
  } catch (err) {
    return response.status(500).json({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) });
  }
}