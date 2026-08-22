// Runs as a standard Node.js serverless function (not edge) — بسيطة كفاية إنها تشتغل
// على أي runtime، لكن سايبينها Node زي ما كانت أصلاً عشان الفرونت إند مش محتاج أي تعديل
// جوهري (اللي اتضاف هو باراميتر "voice" اختياري، ولو ملوش قيمة بيرجع لنفس سلوك gender القديم).
//
// صوت "Azure AI Speech" الرسمي من مايكروسوفت (نفس كتالوج الأصوات اللي edge-tts-universal
// كان بياخده بشكل غير رسمي، لكن دلوقتي عبر API رسمي ومستقر بمفتاح اشتراك حقيقي).
// الفترة المجانية: 500 ألف حرف/شهر متجددة (F0 tier). لو المفتاح أو الـ region غلط، أو
// الكوتة خلصت، بنرجّع 502 واضح والفرونت إند بيرجع تلقائيًا لـ /api/tts (Google Translate)
// وبعدها لصوت المتصفح — نفس 3 طبقات الأمان زي الأول.

// أربع "شخصيات" صوت بدل صوت واحد بس — 2 مصري (الافتراضي، أقرب للهجة محتوى الموقع)
// و2 سعودي (بديل لمين حابب طابع صوت مختلف). كل الأسماء دي أصوات Azure Neural رسمية
// وموثّقة في كتالوج Azure نفسه، مفيش صوت مخترع هنا.
const VOICES = {
  salma:   { name: 'ar-EG-SalmaNeural',   lang: 'ar-EG', gender: 'Female', label: 'سلمى (مصري)' },
  shakir:  { name: 'ar-EG-ShakirNeural',  lang: 'ar-EG', gender: 'Male',   label: 'شاكر (مصري)' },
  zariyah: { name: 'ar-SA-ZariyahNeural', lang: 'ar-SA', gender: 'Female', label: 'زارية (سعودي)' },
  hamed:   { name: 'ar-SA-HamedNeural',   lang: 'ar-SA', gender: 'Male',   label: 'حامد (سعودي)' }
};

// توافق مع الاستدعاءات القديمة اللي بتبعت gender بس من غير voice.
const GENDER_FALLBACK = { female: 'salma', male: 'shakir' };

function escapeSsml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// PRNG بسيط بـ seed ثابت من النص نفسه — عشان نفس الجملة تدّي نفس التنويع دايمًا
// (يفيد الكاش تحت) بدل Math.random() اللي كانت هتخلي كل توليد للنص ده مختلف عن اللي قبله.
function seededRandom(seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  return function () {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// بيبني SSML أغنى بدل بلوك نص واحد مسطّح أو حتى مقارنةً بالنسخة القديمة اللي كانت
// بتدّي نفس rate/pitch الثابتين لكل الجمل. التحسينات هنا:
// - كل جملة بتتقسم في <s> منفصلة (زي الأول) عشان تنغيم صحيح لكل جملة لوحدها.
// - نوع الجملة بيتحدد (سؤال / تعجب / عادية) وبياخد pitch/rate مختلف يناسبه: السؤال
//   بينتهي بنبرة أعلى شوية (زي ما بيحصل فعليًا وقت السؤال)، والتعجب بيتقال بسرعة
//   وحدة أعلى شوية، والجملة العادية تفضل عند الإعداد الأساسي.
// - تنويع طفيف عشوائي (لكن ثابت لنفس النص بفضل الـ seed) في كل جملة (±2% rate)
//   عشان يكسر الرتابة الآلية اللي بتبان لما كل جملة مضبوطة بالظبط بنفس الرقم.
// - وقفة متغيّرة الطول: أطول بعد نقطة/سؤال (تنفّس طبيعي)، أقصر بعد فاصلة جوه الجملة.
// ملحوظة صراحة: أصوات ar-EG/ar-SA معندهاش دعم لـ mstts:express-as (أساليب التعبير
// زي "cheerful"/"sad") على عكس أصوات إنجليزي/صيني معينة — مش موجود لأي صوت عربي
// حاليًا على Azure، فمش بنستخدمه هنا عشان ميتجاهلش بصمت.
function buildSsml(text, voice) {
  const rand = seededRandom(text.slice(0, 120));
  const sentences = text
    .split(/(?<=[.!?؟])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const body = (sentences.length ? sentences : [text]).map((sentence, i) => {
    const withCommaBreaks = escapeSsml(sentence).replace(/،/g, '،<break time="150ms"/>');
    const isLast = i === sentences.length - 1;

    const isQuestion = /[؟?]$/.test(sentence);
    const isExclaim = /!$/.test(sentence);
    const jitter = Math.round((rand() - 0.5) * 4); // -2..+2
    let rate = -4 + jitter;
    let pitch = 1;
    if (isQuestion) { pitch = 6; rate += 2; }
    else if (isExclaim) { rate += 5; pitch = 3; }

    const pauseAfter = isLast ? '' : (isQuestion || isExclaim) ? '<break time="420ms"/>' : '<break time="360ms"/>';
    return `<prosody rate='${rate}%' pitch='+${pitch}%'><s>${withCommaBreaks}</s></prosody>${pauseAfter}`;
  }).join('');

  return `<speak version='1.0' xml:lang='${voice.lang}'><voice xml:lang='${voice.lang}' xml:gender='${voice.gender}' name='${voice.name}'>${body}</voice></speak>`;
}

// كاش داخل ذاكرة الـ lambda نفسها — مش دائم (بيتصفّر مع أي cold start)، لكن طول ما
// الـ instance دافي (طلبات متقاربة من طلاب مختلفين بيسألوا نفس السؤال الشائع، أو نفس
// الطالب بيعيد سماع نفس الرد) بيوفّر نداءات فعلية لـ Azure ويقلل استهلاك الكوتة
// الشهرية المجانية من غير ما نحتاج نضيف قاعدة بيانات أو تخزين خارجي جديد للمشروع.
const memoryCache = new Map();
const MAX_CACHE_ENTRIES = 60;

function cacheKey(text, voiceKey) {
  return voiceKey + '::' + text;
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || 'northeurope';
    if (!AZURE_SPEECH_KEY) {
      return response.status(500).json({ error: 'AZURE_SPEECH_KEY غير مضبوط في Environment Variables' });
    }

    const { text, gender, voice: voiceParam } = request.body || {};
    const cleanText = (text || '').toString().trim().slice(0, 2000);
    if (!cleanText) {
      return response.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }

    let voiceKey = voiceParam && VOICES[voiceParam] ? voiceParam : null;
    if (!voiceKey) voiceKey = GENDER_FALLBACK[gender] || 'salma';
    const voice = VOICES[voiceKey];

    const key = cacheKey(cleanText, voiceKey);
    const cached = memoryCache.get(key);
    if (cached) {
      response.setHeader('Content-Type', 'audio/mpeg');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('X-TTS-Cache', 'hit');
      return response.status(200).send(cached);
    }

    const ssml = buildSsml(cleanText, voice);

    let upstream;
    try {
      upstream = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'chatx-tts-neural'
        },
        body: ssml
      });
    } catch (err) {
      return response.status(502).json({ error: 'تعذر الوصول لخدمة Azure Speech', detail: String(err).slice(0, 200) });
    }

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      // 401/403 غالبًا مفتاح غلط أو region غلط، 429 كوتة الشهر خلصت
      return response.status(upstream.status === 429 ? 502 : upstream.status).json({
        error: 'تعذر توليد الصوت الطبيعي',
        detail: detail.slice(0, 200)
      });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    if (!audioBuffer || !audioBuffer.length) {
      throw new Error('empty-audio-response');
    }

    if (memoryCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = memoryCache.keys().next().value;
      memoryCache.delete(oldestKey);
    }
    memoryCache.set(key, audioBuffer);

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('X-TTS-Cache', 'miss');
    return response.status(200).send(audioBuffer);
  } catch (err) {
    return response.status(502).json({ error: 'تعذر توليد الصوت الطبيعي', detail: String(err).slice(0, 200) });
  }
}
