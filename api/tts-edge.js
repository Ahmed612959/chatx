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

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice: voiceParam } = request.body || {};
    const cleanText = (text || '').toString().trim().slice(0, 2000);
    if (!cleanText) {
      return response.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }

    const voiceName = VOICES[voiceParam] || VOICES.salma;

    // مهلة يدوية (٩ ثواني) — لو خدمة Edge بطيئة أو معلّقة، نفشل بسرعة ونسيب
    // الفرونت إند يكمل على Azure الرسمي بدل ما يستنى لحد ما الـ serverless
    // function نفسها تعمل timeout (اللي ممكن ياخد وقت أطول بكتير).
    const tts = new EdgeTTS(cleanText, voiceName, { rate: '-4%', volume: '+0%', pitch: '+0Hz' });
    const result = await withTimeout(tts.synthesize(), 9000);

    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
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
