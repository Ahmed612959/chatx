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
const FORCED_MODEL = 'anthropic/claude-fable-5';
const MAX_TOKENS = 4096;

// ⚠️ موديلات Anthropic عند OneHop (Opus كان كده، وطلع Fable كمان كده) بتتنادى
// ببروتوكول مختلف تمامًا عن باقي الموديلات في الموقع (Cerebras/DeepSeek/Mistral/...):
// - مش /v1/chat/completions (بروتوكول OpenAI) — ده بيرجع 400
//   "can't be called via this endpoint (protocol 'openai_chat')".
// - الصح هو /anthropic/v1/messages (بروتوكول Anthropic Messages API الأصلي)،
//   بـ header اسمه x-api-key بدل Authorization: Bearer، وheader تاني
//   anthropic-version، وmax_tokens مطلوب في الـ body.
// - الـ system prompt بيتبعت كحقل منفصل اسمه "system"، مش كرسالة role:"system"
//   جوه مصفوفة messages زي OpenAI.
// المصدر: https://onehop.ai/docs/chat (قسم "Anthropic messages").
const UPSTREAM_URL = 'https://api.onehop.ai/anthropic/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

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

    const incomingMessages = Array.isArray(payload?.messages) ? payload.messages : [];
    if (!incomingMessages.length) {
      return new Response(JSON.stringify({ error: 'الرسايل مطلوبة' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // الفرونت إند بيبعت الـ system prompt كأول رسالة في المصفوفة (role: 'system')
    // زي باقي الموديلات كلها (شكل OpenAI). Anthropic Messages API عايزاه منفصل،
    // فبنسحبه هنا ونحط الباقي (user/assistant بس) في messages.
    let systemPrompt;
    let messages = incomingMessages;
    if (incomingMessages[0]?.role === 'system') {
      systemPrompt = incomingMessages[0].content;
      messages = incomingMessages.slice(1);
    }

    if (!messages.length) {
      return new Response(JSON.stringify({ error: 'الرسايل مطلوبة' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const wantsStream = payload.stream !== false;

    // بنبني الـ body إحنا من الأول — مش بنمرر جسم الطلب زي ما هو — عشان الموديل
    // يفضل مثبّت دايمًا بغض النظر عما بيبعته الفرونت إند.
    const anthropicBody = {
      model: FORCED_MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      stream: wantsStream
    };
    if (systemPrompt) anthropicBody.system = systemPrompt;

    let upstream;
    try {
      upstream = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_OPUS_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION
        },
        body: JSON.stringify(anthropicBody)
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول للموديل' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      // أخطاء المصادقة/الحصة/الطلب الغلط بتوصل كـ JSON عادي من Anthropic — آمن
      // إننا نمررها زي ما هي، مفيش حاجة نص عملية.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
      });
    }

    if (!wantsStream) {
      // غير استريمنج: بنترجم رد Anthropic (شكل {content:[{type:'text',text:...}]})
      // لشكل OpenAI اللي باقي الكود في الفرونت إند متعوّد عليه، عشان مفيش داعي
      // نلمس أي حاجة تانية في الموقع.
      let anthropicJson;
      try {
        anthropicJson = await upstream.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: 'رد غير متوقع من الموديل' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const text = (anthropicJson.content || [])
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');
      return new Response(JSON.stringify({
        choices: [{ message: { role: 'assistant', content: text }, delta: { content: text } }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!upstream.body) {
      return new Response(JSON.stringify({ error: 'مفيش استريم راجع من الموديل' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ====================== ترجمة استريم Anthropic لشكل OpenAI ======================
    // Anthropic Messages API بتبعت أحداث SSE مختلفة تمامًا عن OpenAI: أنواع زي
    // message_start / content_block_start / content_block_delta / message_delta /
    // message_stop، والنص الفعلي بييجي في content_block_delta جوه
    // delta.text_delta.text — مش choices[0].delta.content زي كل موديل تاني في
    // الموقع. بدل ما نغيّر منطق الاستريمنج في الفرونت إند كله عشان موديل واحد،
    // بنترجم هنا في السيرفر: بنقرأ استريم Anthropic ونطلّع بدله استريم بشكل
    // OpenAI عادي (نفس اللي streamCerebras/streamOneHop في الفرونت إند بيفهموه)،
    // فباقي الكود (الـ parsing، عرض الرسالة، إلخ) يفضل شغال من غير أي تغيير.
    const upstreamReader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';

    const safeStream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await upstreamReader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let evt;
            try { evt = JSON.parse(raw); } catch (e) { continue; }

            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta' && evt.delta.text) {
              const chunk = { choices: [{ delta: { content: evt.delta.text } }] };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            } else if (evt.type === 'error') {
              const msg = evt.error?.message || 'خطأ من الموديل';
              controller.enqueue(encoder.encode(`data: {"error":{"message":${JSON.stringify(msg)}}}\n\n`));
            }
            // باقي أنواع الأحداث (message_start, content_block_start, message_delta,
            // message_stop, ping...) متجاهلة عمدًا — مش محتاجينها عشان نطلّع النص بس.
          }
        } catch (err) {
          try {
            controller.enqueue(encoder.encode(
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
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
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
