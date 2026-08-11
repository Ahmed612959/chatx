export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// ====================================================================================
// شرح عام لوظيفة الملف ده:
// ====================================================================================
// الـ endpoint ده بيولّد "سيناريو إكلينيكي متفرّع" كامل — يعني شجرة قرارات فيها عقدة
// بداية، وكل عقدة إما فيها اختيارات (choices) بتودّي لعقد تانية، أو نهاية (ending).
// بيُستخدم من الفرونت إند في 3 حالات مختلفة (الفرق بينهم بس هو نص "seedPrompt" اللي بيوصل):
//   1) الطالب/الأدمن كاتب وصف حالة بنفسه
//   2) طلب عام "ولّد حالة عشوائية" (specialty/difficulty بس من غير وصف تفصيلي)
//   3) نص سؤال موقف حقيقي متسحوب من بنك الأسئلة، وعايزين نحوّله لسيناريو تفاعلي كامل
//
// الشكل النهائي (JSON) لازم يطابق بالظبط الشكل اللي مشغّل الفيديو المتفرّع في الفرونت
// إند (VIDEO_SCENARIOS) متوقّعه، عشان يشتغل مع نفس الكود من غير أي تعديل هناك.
//
// ====================================================================================
// أهم درس اتعلمناه من مشكلة الـ 502 اللي كانت بتحصل قبل كده:
// ====================================================================================
// الموديل كان أحيانًا بيرجّع JSON "مقطوع" (truncated) — يعني بيبدأ يكتب الشجرة، لكن
// عدد الكلمات المسموح له بيه (maxOutputTokens) بيخلص قبل ما يكمّل، فيوصلنا نص ناقص
// زي: {"id": "chest_pain", "nodes": {"n1": {"narration": "..." — وبعدين بينقطع فجأة.
// النص ده مش JSON صالح، فـ JSON.parse() كان بيرمي استثناء، وكنا بنرجّع 502 على طول
// من غير أي محاولة نصلّح أو نفهم السبب. الإصلاحات التالية بتعالج المشكلة دي من كذا زاوية.

// عدد الكلمات (tokens) الأقصى المسموح بيه للموديل يكتبه في رده — رفعناه لرقم كبير
// (8192) عشان شجرة قرارات كاملة بكل تفاصيلها (سرد + علامات حيوية + اختيارات لكل عقدة)
// محتاجة مساحة كتابة كبيرة، وده كان على الأغلب السبب الحقيقي وراء الـ 502 اللي حصل.
const MAX_OUTPUT_TOKENS = 8192;

// بيشيل أي غلاف Markdown (```json ... ```) لو الموديل حطّه غصب عنه حتى مع تحديد
// responseMimeType: 'application/json' — النماذج أحيانًا "بتنسى" التعليمات دي، فبنتعامل
// مع الاحتمال ده بدل ما نفترض إنه مستحيل يحصل.
function stripMarkdownFences(text) {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

// لو الـ JSON اتقطع في النص (نسيان قوس إغلاق آخره مثلاً بسبب انتهاء الـ tokens)، بنحاول
// "نصلّحه" بطريقة بسيطة: نقص من آخر النص لحد آخر قوس "}" مغلق كامل، ونجرب نقفل أي أقواس
// ناقصة تلقائيًا. مش حل مثالي 100%، لكنه بينقذ نسبة كبيرة من الحالات اللي كانت قبل كده
// بترجع فشل كامل، بدل ما نرمي الاستجابة كلها في القمامة لمجرد إنها اتقطعت بحرف واحد.
function attemptJsonRepair(text) {
  let candidate = text;
  // نجرب نلاقي آخر "}" أو "]" في النص، ونقص أي حاجة زيادة بعده (زي فاصلة معلّقة أو نص ناقص)
  const lastBrace = Math.max(candidate.lastIndexOf('}'), candidate.lastIndexOf(']'));
  if (lastBrace !== -1) candidate = candidate.slice(0, lastBrace + 1);

  // نعدّ الأقواس المفتوحة والمقفولة، ولو فيه نقص، نضيف الأقواس الناقصة في الآخر
  const openCurly = (candidate.match(/{/g) || []).length;
  const closeCurly = (candidate.match(/}/g) || []).length;
  const openSquare = (candidate.match(/\[/g) || []).length;
  const closeSquare = (candidate.match(/\]/g) || []).length;
  candidate += '}'.repeat(Math.max(0, openCurly - closeCurly));
  candidate += ']'.repeat(Math.max(0, openSquare - closeSquare));

  try {
    return JSON.parse(candidate);
  } catch (e) {
    return null; // فشل الترقيع برضه — هنرجع نجرب من الموديل تاني بدل ما نكمل بحاجة تالفة
  }
}

// بيتأكد إن السيناريو فيه كل الأجزاء الأساسية اللي مشغّل الفيديو محتاجها عشان يشتغل —
// مش تحقق كامل لكل قاعدة فنية، بس كفاية نلتقط أي نقص جوهري قبل ما نبعته للفرونت إند
// ونخلّي التجربة تتكسر هناك بدل ما نمسكها هنا بوضوح.
function validateScenarioShape(scenario) {
  if (!scenario || typeof scenario !== 'object') return 'الناتج مش كائن JSON خالص';
  if (!scenario.nodes || typeof scenario.nodes !== 'object') return 'مفيش nodes في الناتج';
  if (!scenario.startNode || !scenario.nodes[scenario.startNode]) return 'startNode مش موجودة جوه nodes';
  const nodeIds = Object.keys(scenario.nodes);
  if (nodeIds.length < 3) return 'شجرة القرارات صغيرة جدًا (أقل من 3 عقد)';
  const hasEnding = nodeIds.some(id => scenario.nodes[id]?.ending);
  if (!hasEnding) return 'مفيش أي عقدة نهاية (ending) في الشجرة كلها';
  return null; // null = كل حاجة سليمة
}

// النص اللي بيوصف للموديل الشكل المطلوب بالظبط والقواعد اللي لازم يلتزم بيها. مفصولة
// كدالة بدل نص ثابت عشان نقدر نبعتلها "درجة تعقيد" مختلفة في محاولة الإصلاح (retry)
// لو المحاولة الأولى فشلت — شجرة أبسط شوية بتقلل احتمال القطع بسبب طول الرد.
function buildSchemaInstructions({ simplified = false } = {}) {
  const depthRule = simplified
    ? 'الشجرة تكون مستويين قرار بس (بسيطة ومختصرة) — يعني عقدة البداية، وبعدها مستوى واحد بس من الاختيارات يودّي مباشرة لنهايات.'
    : 'الشجرة لازم تكون 3-4 مستويات عمق (يعني بعد عقدة البداية، فيه مستويين أو تلاتة قرارات، وبعدين نهايات).';
  const endingsRule = simplified
    ? 'لازم يكون فيه 3 نهايات مختلفة على الأقل.'
    : 'لازم يكون فيه 4-6 نهايات مختلفة على الأقل موزعة على المسارات المختلفة.';

  return `أنت مولّد سيناريوهات تدريب إكلينيكي لطلاب تمريض، ومهمتك ترجع كائن JSON صارم بس (من غير أي نص قبله أو بعده، من غير markdown code fences) بالشكل ده بالظبط:

{
  "id": "نص إنجليزي قصير فريد بدون مسافات (slug)",
  "icon": "إيموجي واحد يناسب الحالة",
  "title": "عنوان قصير بالعربي",
  "specialty": "التخصص بالعربي",
  "difficulty": "سهل أو متوسط أو صعب",
  "startNode": "n1",
  "nodes": {
    "n1": {
      "mood": "normal",
      "vitals": { "hr": رقم, "spo2": رقم, "bp": "نص زي 120/80" },
      "narration": "وصف سردي بالعربي المصري العامي شبه الفصيح، بيحط الطالب في الموقف كممرض مناوب، 3-5 جمل",
      "choices": [
        { "text": "خيار 1", "next": "n2" },
        { "text": "خيار 2", "next": "n2b" }
      ]
    }
  }
}

قواعد صارمة:
- ${depthRule}
- كل عقدة "ending: true" (بس النهايات) لازم يكون فيها "quality" من القيم دي بالظبط: excellent, good, risky, critical — وميكونش فيها "choices".
- كل عقدة مش نهاية لازم يكون فيها "choices" (2 أو 3 خيارات) ومفيهاش "ending" ولا "quality".
- "mood" لازم يكون واحد من: normal, tense, critical.
- القرارات الطبية الأدق تودّي لنهايات "excellent"/"good"، والقرارات الخطرة أو التأخير تودّي لـ"risky"/"critical".
- ${endingsRule}
- خلي النصوص مختصرة ومباشرة (النص التوضيحي "narration" 3-5 جمل بالكتير) — الاختصار مهم جدًا عشان الرد كله يخلص من غير ما ينقطع.
- كل الأسماء والنصوص بالعربي، إلا "id" و"mood" و"quality" و"next" وأسماء المفاتيح نفسها بالإنجليزي زي المثال بالظبط.`;
}

// بيبعت طلب واحد لـ Gemini ويرجّع {scenario, error} — دالة منفصلة عشان نقدر ننادّيها
// مرتين (محاولة عادية، وبعدين محاولة "مبسّطة" لو الأولى فشلت) من غير تكرار كود.
async function requestScenarioFromGemini(apiKey, schemaInstructions, userInstruction) {
  let upstream;
  try {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${schemaInstructions}\n\n${userInstruction}` }] }],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: 'application/json',
          maxOutputTokens: MAX_OUTPUT_TOKENS
        }
      })
    });
  } catch (err) {
    return { scenario: null, error: 'تعذر الوصول لخدمة توليد الحالات (مشكلة شبكة)', httpStatus: 502 };
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    return { scenario: null, error: 'Gemini رفض الطلب', detail: detail.slice(0, 300), httpStatus: upstream.status };
  }

  const upstreamData = await upstream.json();
  // finishReason بيوضّحلنا لو الرد اتقطع لأنه خلّص الـ tokens المسموحة (MAX_TOKENS) —
  // معلومة مهمة جدًا للتشخيص، فبنسجّلها في رسالة الخطأ لو حصلت مشكلة بعد كده.
  const finishReason = upstreamData?.candidates?.[0]?.finishReason;
  const rawText = upstreamData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!rawText.trim()) {
    return { scenario: null, error: 'الموديل رجّع رد فاضي', finishReason, httpStatus: 502 };
  }

  const cleanText = stripMarkdownFences(rawText);
  let scenario;
  try {
    scenario = JSON.parse(cleanText);
  } catch (e) {
    // فشل التحليل العادي — نجرب نصلّح النص (غالبًا انقطع في النص عشان خلّصت الـ tokens)
    scenario = attemptJsonRepair(cleanText);
    if (!scenario) {
      return {
        scenario: null,
        error: 'الموديل رجّع شكل مش JSON صالح ومحاولة الإصلاح فشلت',
        finishReason,
        rawTextPreview: cleanText.slice(-300), // آخر 300 حرف — أهم جزء لمعرفة فين اتقطع بالظبط
        httpStatus: 502
      };
    }
  }

  const shapeError = validateScenarioShape(scenario);
  if (shapeError) {
    return { scenario: null, error: shapeError, finishReason, httpStatus: 502 };
  }

  if (!scenario.id) scenario.id = 'custom_' + Date.now();
  return { scenario, error: null };
}

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 8, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try { payload = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON غير صالح في الطلب' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const seedPrompt = (payload.seedPrompt || '').toString().slice(0, 3000);
    const specialty = (payload.specialty || 'عام').toString().slice(0, 60);
    const difficulty = (payload.difficulty || 'متوسط').toString().slice(0, 30);
    if (!seedPrompt.trim()) {
      return new Response(JSON.stringify({ error: 'محتاجين وصف أو تخصص للحالة الأول' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userInstruction = `التخصص: ${specialty}\nمستوى الصعوبة: ${difficulty}\n\nوصف/أساس الحالة:\n${seedPrompt}`;

    // ====================================================================================
    // المحاولة الأولى: الشجرة الكاملة (3-4 مستويات، 4-6 نهايات) زي ما كنا بنطلبها من الأول
    // ====================================================================================
    let result = await requestScenarioFromGemini(GEMINI_API_KEY, buildSchemaInstructions({ simplified: false }), userInstruction);

    // ====================================================================================
    // لو فشلت (أي سبب: قطع، شكل ناقص، إلخ)، نجرب تاني بنسخة "مبسّطة" من الطلب — شجرة أقصر
    // بمستوى قرار واحد بدل اتنين-تلاتة، فاحتمال إنها تنقطع قبل ما تخلص بيقل جدًا. ده معناه
    // إن أي محاولة توليد بقى ليها فرصتين بدل فرصة واحدة قبل ما نرجّع فشل نهائي للمستخدم.
    // ====================================================================================
    if (!result.scenario) {
      const firstAttemptError = result;
      result = await requestScenarioFromGemini(GEMINI_API_KEY, buildSchemaInstructions({ simplified: true }), userInstruction);

      if (!result.scenario) {
        // الاتنين فشلوا — نرجّع أوضح رسالة خطأ ممكنة، بما فيها تفاصيل المحاولتين، عشان أي
        // مشكلة تانية تحصل تبقى واضحة على طول من غير ما نحتاج نلف زي المرة اللي فاتت.
        return new Response(JSON.stringify({
          error: 'فشل توليد الحالة بعد محاولتين',
          firstAttempt: { error: firstAttemptError.error, finishReason: firstAttemptError.finishReason },
          secondAttempt: { error: result.error, finishReason: result.finishReason, rawTextPreview: result.rawTextPreview }
        }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ scenario: result.scenario }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
