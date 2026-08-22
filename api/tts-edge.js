// طبقة صوت مجانية وغير محدودة — بتستخدم مكتبة edge-tts-universal (موجودة أصلاً في
// package.json) اللي بتكلم خدمة "قراءة بصوت عالٍ" في مايكروسوفت إيدج نفسها، وهي
// بتستخدم بالظبط نفس كتالوج أصوات Azure Neural (سلمى/شاكر/زارية/حامد) — يعني نفس
// الجودة اللي في /api/tts-neural.js تمامًا، لكن من غير أي حد شهري ومن غير مفتاح API.
//
// ⚠️ ملحوظة صراحة (تقنية + قانونية) لازم تتقرا قبل الاعتماد عليها بشكل أساسي:
// 1) دي مش خدمة رسمية من مايكروسوفت — بتحاكي بروتوكول WebSocket الداخلي بتاع
//    خدمة Edge، فمفيش SLA ولا ضمان استقرار، ومايكروسوفت ممكن (نادرًا) تغيّر حاجة
//    تكسّرها فجأة. عشان كده هي هنا كطبقة أولى "مجانية" بس مش الوحيدة — لو فشلت
//    بترجع خطأ فورًا والفرونت إند بيكمل تلقائيًا لـ /api/tts-neural (Azure الرسمي).
// 2) رخصة المكتبة AGPL-3.0 — رخصة "copyleft" قوية. لو المشروع ده تجاري (وعنده
//    اشتراكات Premium زي اللي شايفها في الكود)، AGPL ممكن تلزمك قانونيًا تنشري كود
//    المصدر بتاع أي تعديل على المكتبة لو بتقدّميها كخدمة عبر الشبكة. ده قرار قانوني
//    مش تقني — يفضّل مراجعته مع محامي أو مستشار قبل الإطلاق التجاري الفعلي.

import { EdgeTTS } from 'edge-tts-universal';

// المهلة الافتراضية لـ Vercel Serverless Functions (Node) هي 10 ثواني على خطة
// Hobby — كانت كافية للرسايل القصيرة بس مش للطويلة (خدمة Edge TTS بترجع الصوت
// كامل مرة واحدة، مش Streaming، فكل ما النص يطول كل ما وقت التوليد يزيد). رفعتها
// لـ 5 دقايق بناءً على طلبك.
//
// ⚠️ ملحوظة مهمة: خطة Vercel Hobby (المجانية) بيبقى أقصى حد فيها 60 ثانية بس —
// إلا لو مفعّل عندك "Fluid Compute" من إعدادات المشروع على Vercel (لو مفعّل،
// الحد بيوصل لـ 300 ثانية حتى على Hobby). لو النشر (deploy) فشل برسالة خطأ فيها
// "maxDuration" أو "invalid maxDuration value for plan hobby"، يبقى Fluid Compute
// مش مفعّل عندك — إما تفعّليه من Project Settings → Functions، أو ترجعي الرقم
// تحت لـ 60 (اللي هو الحد الآمن المضمون على Hobby من غير أي إعداد إضافي).
export const config = { maxDuration: 300 };

const VOICES = {
  salma: 'ar-EG-SalmaNeural',
  shakir: 'ar-EG-ShakirNeural',
  zariyah: 'ar-SA-ZariyahNeural',
  hamed: 'ar-SA-HamedNeural'
};

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('edge-tts-timeout')), ms))
  ]);
}

// PRNG بسيط بـ seed ثابت من النص نفسه — نفس نفس التقنية المستخدمة في
// tts-neural.js، عشان نفس الجملة تدّي نفس التنويع دايمًا (يفيد أي كاش مستقبلي)
// بدل Math.random() اللي كانت هتخلي كل توليد مختلف حتى لنفس النص بالظبط.
function seededRandom(seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  return function () {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// بيقسّم النص لجمل وبيديلها rate/pitch مختلف حسب نوع الجملة (سؤال/تعجب/عادية)
// بالظبط زي منطق SSML في tts-neural.js — بس هنا Edge TTS مش بتاخد SSML خالص،
// بتاخد نص عادي + خيارات (rate/pitch/volume) على مستوى الطلب كله. عشان نقدر
// نطبّق تنويع لكل جملة لوحدها، بنقسّم النص ونعمل طلب توليد صوت منفصل لكل جملة
// بإعدادات مختلفة شوية، وبعدين نلزّق الصوت الناتج مع بعضه في ملف واحد.
function splitSentences(text) {
  return text
    .split(/(?<=[.!?؟])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function prosodyFor(sentence, rand) {
  const isQuestion = /[؟?]$/.test(sentence);
  const isExclaim = /!$/.test(sentence);
  const jitter = Math.round((rand() - 0.5) * 4); // -2..+2
  let ratePct = -4 + jitter;
  let pitchHz = 0;
  if (isQuestion) { pitchHz = 8; ratePct += 1; }
  else if (isExclaim) { ratePct += 4; pitchHz = 4; }
  return { rate: `${ratePct >= 0 ? '+' : ''}${ratePct}%`, pitch: `${pitchHz >= 0 ? '+' : ''}${pitchHz}Hz` };
}

async function synthesizeSentence(sentence, voiceName, prosody, timeoutMs) {
  const tts = new EdgeTTS(sentence, voiceName, { rate: prosody.rate, volume: '+0%', pitch: prosody.pitch });
  const result = await withTimeout(tts.synthesize(), timeoutMs);
  return Buffer.from(await result.audio.arrayBuffer());
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice: voiceParam } = request.body || {};
    const cleanText = (text || '').toString().trim().slice(0, 6000);
    if (!cleanText) {
      return response.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }

    const voiceName = VOICES[voiceParam] || VOICES.salma;
    const rand = seededRandom(cleanText.slice(0, 120));
    const sentences = splitSentences(cleanText);

    // مهلة كل جملة على حدة — بدل ما نحسب مهلة واحدة ضخمة للنص كله زي الأول،
    // كل جملة بتاخد مهلة تتناسب مع طولها هي بس (مع حد أدنى وأقصى معقولين)، وده
    // بيسيب هامش أمان إجمالي أكبر داخل حد الـ 5 دقايق بتاع الفانكشن نفسها فوق.
    const buffers = [];
    for (const sentence of (sentences.length ? sentences : [cleanText])) {
      const prosody = prosodyFor(sentence, rand);
      const perSentenceTimeout = Math.min(60000, Math.max(6000, sentence.length * 120));
      const buf = await synthesizeSentence(sentence, voiceName, prosody, perSentenceTimeout);
      if (buf && buf.length) buffers.push(buf);
    }

    const audioBuffer = Buffer.concat(buffers);
    if (!audioBuffer || !audioBuffer.length) {
      throw new Error('empty-audio-response');
    }

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'no-cache');
    return response.status(200).send(audioBuffer);
  } catch (err) {
    // أي فشل هنا (timeout، تغيير في بروتوكول مايكروسوفت، إلخ) لازم يرجع بسرعة
    // وبوضوح عشان الفرونت إند يعرف يتحول فورًا لطبقة Azure الرسمية.
    return response.status(502).json({ error: 'تعذر توليد الصوت عبر Edge TTS', detail: String(err).slice(0, 200) });
  }
}
