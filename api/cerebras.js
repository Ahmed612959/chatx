// Runs as a standard Node.js serverless function (not edge) — Cerebras's API sits
// behind a bot-protection layer that was blocking the Edge runtime's fetch requests
// outright (returning an HTML block page instead of a JSON API response). Regular
// Node functions send a different network/TLS fingerprint that gets through.

import { checkRateLimit } from './_rateLimit.js';
import { isEntitled, extractBearerToken } from './_premiumCheck.js';

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
        body: JSON.stringify(request.body)
      });
    } catch (err) {
      return response.status(502).json({ error: 'تعذر الوصول لـ Cerebras' });
    }

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