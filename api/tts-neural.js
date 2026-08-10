// Runs as a standard Node.js serverless function (not edge) — the underlying Microsoft
// Edge TTS protocol needs a real WebSocket client with custom headers, which isn't
// reliably available in Vercel's Edge (V8 isolate) runtime.
//
// ⚠️ ملاحظة صراحة: ده صوت "Microsoft Edge Neural TTS" — بروتوكول غير رسمي متعاكس هندسيًا
// (reverse-engineered)، مش API رسمي من مايكروسوفت. بيشتغل من غير أي مفتاح ومجاني تمامًا،
// وجودته طبيعية جدًا وأعلى بمراحل من صوت Google Translate القديم، لكن بما إنه غير رسمي:
// لو مايكروسوفت غيّرت البروتوكول يوم، الـ endpoint ده ممكن يفشل فجأة. عشان كده الفرونت
// إند (index-11.html) لازم يجرب الـ endpoint ده الأول، وعند أي فشل يرجع تلقائيًا لـ
// /api/tts (Google Translate) وبعدها لصوت المتصفح نفسه (speechSynthesis) — 3 طبقات أمان.
import { EdgeTTS } from 'edge-tts-universal';

// أصوات عربية مصرية طبيعية بجنس ذكر/أنثى — لو الطالب مش محدد، بنستخدم الأنثى كافتراضي
// (نفس الصوت المستخدم في محاكي المواقف حاليًا).
const VOICE_MAP = {
  female: 'ar-EG-SalmaNeural',
  male: 'ar-EG-ShakirNeural'
};

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { text, gender } = request.body || {};
    const cleanText = (text || '').toString().trim().slice(0, 2000);
    if (!cleanText) {
      return response.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }
    const voice = VOICE_MAP[gender] || VOICE_MAP.female;

    const tts = new EdgeTTS(cleanText, voice, { rate: '0%', pitch: '0Hz', volume: '0%' });
    const result = await tts.synthesize();

    // مكتبات edge-tts المختلفة بترجع الصوت بأشكال شوية مختلفة حسب النسخة (audio مباشر،
    // أو audio.buffer) — بنغطي الاحتمالين عشان الكود ميبوظش لو النسخة اتحدّثت.
    const audioBuffer = result?.audio?.buffer
      ? Buffer.from(result.audio.buffer)
      : Buffer.from(result?.audio || result);

    if (!audioBuffer || !audioBuffer.length) {
      throw new Error('empty-audio-response');
    }

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'no-cache');
    return response.status(200).send(audioBuffer);
  } catch (err) {
    // بنرجّع 502 واضح بدل ما نكسر الطلب — الفرونت إند هيلقط الفشل ده ويرجع لـ /api/tts
    // تلقائيًا زي ما هو متوقع، فمفيش تجربة مستخدم بتتقطع حتى لو الـ endpoint ده وقع.
    return response.status(502).json({ error: 'تعذر توليد الصوت الطبيعي', detail: String(err).slice(0, 200) });
  }
}
