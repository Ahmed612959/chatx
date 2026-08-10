// Runs as a standard Node.js serverless function (not edge) — بسيطة كفاية إنها تشتغل
// على أي runtime، لكن سايبينها Node زي ما كانت أصلاً عشان الفرونت إند مش محتاج أي تعديل.
//
// صوت "Azure AI Speech" الرسمي من مايكروسوفت (نفس كتالوج الأصوات اللي edge-tts-universal
// كان بياخده بشكل غير رسمي، لكن دلوقتي عبر API رسمي ومستقر بمفتاح اشتراك حقيقي).
// الفترة المجانية: 500 ألف حرف/شهر متجددة (F0 tier). لو المفتاح أو الـ region غلط، أو
// الكوتة خلصت، بنرجّع 502 واضح والفرونت إند (index-11.html) بيرجع تلقائيًا لـ /api/tts
// (Google Translate) وبعدها لصوت المتصفح — نفس 3 طبقات الأمان زي الأول.

const VOICE_MAP = {
  female: 'ar-EG-SalmaNeural',
  male: 'ar-EG-ShakirNeural'
};

const GENDER_MAP = {
  female: 'Female',
  male: 'Male'
};

function escapeSsml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

    const { text, gender } = request.body || {};
    const cleanText = (text || '').toString().trim().slice(0, 2000);
    if (!cleanText) {
      return response.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }
    const genderKey = VOICE_MAP[gender] ? gender : 'female';
    const voice = VOICE_MAP[genderKey];
    const ssmlGender = GENDER_MAP[genderKey];

    const ssml = `<speak version='1.0' xml:lang='ar-EG'><voice xml:lang='ar-EG' xml:gender='${ssmlGender}' name='${voice}'>${escapeSsml(cleanText)}</voice></speak>`;

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

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'no-cache');
    return response.status(200).send(audioBuffer);
  } catch (err) {
    return response.status(502).json({ error: 'تعذر توليد الصوت الطبيعي', detail: String(err).slice(0, 200) });
  }
}
