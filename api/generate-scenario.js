export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// بيولّد سيناريو إكلينيكي متفرّع كامل (عقد + اختيارات + نهايات) كـ JSON صارم، من 3 مصادر ممكنة
// بيحددها الفرونت إند بنفسه في seedPrompt:
//   1) وصف حر كتبه الأدمن/الطالب بنفسه (حالة مخصصة)
//   2) طلب عام لتوليد حالة عشوائية بالكامل (specialty/difficulty بس، من غير وصف)
//   3) نص سؤال موقف حقيقي مستخرج من بنك الأسئلة، متحول لسيناريو متفرّع كامل
// الشكل الناتج لازم يطابق بالظبط بنية VIDEO_SCENARIOS في الفرونت إند عشان يشتغل مع نفس
// الـ player من غير أي تعديل تاني.
export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 8, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY غير مضبوط في Environment Variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let payload;
    try { payload = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: 'JSON غير صالح' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const seedPrompt = (payload.seedPrompt || '').toString().slice(0, 3000);
    const specialty = (payload.specialty || 'عام').toString().slice(0, 60);
    const difficulty = (payload.difficulty || 'متوسط').toString().slice(0, 30);
    if (!seedPrompt.trim()) {
      return new Response(JSON.stringify({ error: 'محتاجين وصف أو تخصص للحالة الأول' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const schemaInstructions = `أنت مولّد سيناريوهات تدريب إكلينيكي لطلاب تمريض، ومهمتك ترجع كائن JSON صارم بس (من غير أي نص قبله أو بعده، من غير markdown code fences) بالشكل ده بالظبط:

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
        { "text": "خيار 2", "next": "n2b" },
        { "text": "خيار 3 (عادة أضعف قرار)", "next": "n2c" }
      ]
    }
  }
}

قواعد صارمة:
- الشجرة لازم تكون 3-4 مستويات عمق بالظبط (يعني بعد nodeالبداية، فيه مستويين أو تلاتة قرارات، وبعدين نهايات).
- كل عقدة "ending: true" (بس النهايات) لازم يكون فيها "quality" من القيم دي بالظبط: excellent, good, risky, critical — وميكونش فيها "choices".
- كل عقدة مش نهاية لازم يكون فيها "choices" (2 أو 3 خيارات) ومفيهاش "ending" ولا "quality".
- "mood" لازم يكون واحد من: normal, tense, critical — وده بيتغيّر حسب خطورة الموقف في العقدة دي.
- القرارات الطبية الأدق تودّي لنهايات "excellent"/"good"، والقرارات الخطرة أو التأخير تودّي لـ"risky"/"critical" — خلي المنطق الطبي واقعي ومبني على أساسيات التمريض.
- لازم يكون فيه 4-6 نهايات مختلفة على الأقل موزعة على المسارات المختلفة.
- كل الأسماء والنصوص بالعربي، إلا "id" و"mood" و"quality" و"next" وأسماء المفاتيح نفسها بالإنجليزي زي المثال بالظبط.`;

    const userInstruction = `التخصص: ${specialty}\nمستوى الصعوبة: ${difficulty}\n\nوصف/أساس الحالة:\n${seedPrompt}`;

    let upstream;
    try {
      upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: schemaInstructions },
            { role: 'user', content: userInstruction }
          ],
          temperature: 0.9,
          response_format: { type: 'json_object' }
        })
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لخدمة توليد الحالات' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'فشل توليد الحالة', detail: detail.slice(0, 300) }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const upstreamData = await upstream.json();
    const rawText = upstreamData?.choices?.[0]?.message?.content || '';

    // ====================== تحقق + ترقيع كامل لكل عقدة في الشجرة ======================
    // الفحص السطحي القديم كان بيتأكد بس إن startNode موجودة — يعني لو الموديل نسي "vitals"
    // أو "choices" في عقدة تانية جوه الشجرة (بعيدة عن البداية)، كانت بتعدي وتتحفظ عادي
    // وبعدين تكسر التطبيق فعليًا لما الطالب يوصلها أثناء اللعب. دلوقتي:
    // - الحاجات البسيطة الناقصة (mood/vitals/quality) بترقّع تلقائي بقيم افتراضية معقولة.
    // - المشاكل اللي مش آمن نصلّحها لوحدنا (رابط next بيشاور على عقدة مش موجودة، عقدة
    //   مش نهاية ومفيهاش اختيارات خالص) بترفض الحالة كلها وتطلب توليد تاني، بدل ما نبعت
    //   شجرة مكسورة للفرونت إند.
    function normalizeAndValidateScenario(scenario) {
      const moods = ['normal', 'tense', 'critical'];
      const qualities = ['excellent', 'good', 'risky', 'critical'];
      const vDefaults = {
        normal: { hr: 88, spo2: 97, bp: '120/80' },
        tense: { hr: 108, spo2: 93, bp: '105/70' },
        critical: { hr: 130, spo2: 85, bp: '85/55' }
      };
      const nodeIds = Object.keys(scenario.nodes || {});
      for (const id of nodeIds) {
        const node = scenario.nodes[id];
        if (!node || typeof node !== 'object') return `عقدة "${id}" فاسدة`;
        if (!node.narration || typeof node.narration !== 'string') return `عقدة "${id}" من غير سرد (narration)`;

        if (!moods.includes(node.mood)) node.mood = 'normal';
        const d = vDefaults[node.mood];
        if (!node.vitals || typeof node.vitals !== 'object') node.vitals = { ...d };
        else {
          if (typeof node.vitals.hr !== 'number') node.vitals.hr = d.hr;
          if (typeof node.vitals.spo2 !== 'number') node.vitals.spo2 = d.spo2;
          if (!node.vitals.bp) node.vitals.bp = d.bp;
        }

        if (node.ending) {
          if (!qualities.includes(node.quality)) node.quality = 'good';
        } else {
          if (!Array.isArray(node.choices) || !node.choices.length) {
            return `عقدة "${id}" مش نهاية ومفيهاش اختيارات`;
          }
          for (const choice of node.choices) {
            if (!choice || !choice.text || !choice.next) return `عقدة "${id}" فيها اختيار ناقص بيانات`;
            if (!nodeIds.includes(choice.next)) return `عقدة "${id}" بتشاور على عقدة "${choice.next}" مش موجودة في الشجرة`;
          }
        }
      }
      return null; // null = الشجرة سليمة
    }

    let scenario;
    try {
      scenario = JSON.parse(rawText);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'الموديل رجّع شكل مش JSON صالح، جرب تاني' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // تحقق سطحي سريع إن الشكل الأساسي موجود قبل ما نكمل — لسه محتاجين ده كخطوة أولى
    // قبل الفحص التفصيلي اللي بيمشي على كل عقدة في الشجرة.
    if (!scenario || typeof scenario !== 'object' || !scenario.nodes || !scenario.startNode || !scenario.nodes[scenario.startNode]) {
      return new Response(JSON.stringify({ error: 'الحالة المولّدة ناقصة أجزاء أساسية، جرب تاني' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!scenario.id) scenario.id = 'custom_' + Date.now();

    const validationError = normalizeAndValidateScenario(scenario);
    if (validationError) {
      return new Response(JSON.stringify({ error: `الحالة المولّدة فيها مشكلة (${validationError}) — جرب تاني`, detail: validationError }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ scenario }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
