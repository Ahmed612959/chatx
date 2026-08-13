// ⚠️ لازم يبقى Node.js Runtime (مش Edge) — الطبقة الاحتياطية (Edge TTS) محتاجة اتصال
// WebSocket فعلي، ومش مدعوم في Vercel Edge Runtime. لو الملف ده كان شغال Edge قبل كده،
// شيل أي "export const config = { runtime: 'edge' }" قديم؛ مفيش حاجة هنا دلوقتي = Node تلقائيًا.
//
// محتاج تضيف "ws" في package.json بتاعك (npm install ws) عشان الطبقة الاحتياطية تشتغل.

import { WebSocket } from 'ws';
import crypto from 'crypto';

// ====================================================================================
// نظام صوت بمرحلتين، شفاف تمامًا للطالب:
//   المرحلة 1: Gemini TTS (الأساسي، جودة عالية) — بمحاولتين لو حصل ضغط مؤقت من جوجل.
//   المرحلة 2: Microsoft Edge TTS (احتياطي مجاني وغير محدود، بلا مفتاح API ولا كوتة) —
//              بيتفعّل تلقائيًا لو Gemini فشل تمامًا (المفتاح مفقود، الكوتة خلصت، خطأ
//              مؤقت، حد الاستخدام المحلي اتخطى...إلخ). الطالب هيسمع صوت في الحالتين
//              من غير ما يلاحظ أي فرق أو يشوف رسالة خطأ.
// ====================================================================================

const GEMINI_VOICE = 'Kore';           // صوت Gemini الأساسي
const EDGE_TTS_VOICE = 'ar-EG-SalmaNeural'; // صوت مصري طبيعي (أنثى) — البديل: ar-EG-ShakirNeural (ذكر)
const EDGE_TRUSTED_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'; // قيمة عامة ثابتة يستخدمها متصفح Edge نفسه

// ---------------------------------------------------------------------------
// Rate limiting بسيط داخل نفس الملف (in-memory)، مستقل عن _rateLimit.js المشترك
// لأن ده كان مبني على شكل Request بتاع Edge Runtime، ومفيش ضمان إنه هيشتغل صح
// تحت Node.js Runtime من غير ما نشوفه ونعدله. الرقم هنا سخي (40/دقيقة) عشان
// مشهد واحد من الحالة المتفرّعة بيولّد نداءات كتير ورا بعض.
// ---------------------------------------------------------------------------
const rateLimitStore = new Map();
function checkLocalRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 40;
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

function buildWavHeader({ dataLength, sampleRate = 24000, channels = 1, bitsPerSample = 16 }) {
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

function escapeSsml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// -------------------------- المرحلة 1: Gemini TTS --------------------------
async function tryGeminiTts(text, apiKey) {
  async function callGemini() {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `اقرأ النص التالي بصوت طبيعي وواضح: ${text}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } }
          }
        })
      });
      return { upstream: res, networkError: null };
    } catch (err) {
      return { upstream: null, networkError: err };
    }
  }

  let { upstream, networkError } = await callGemini();
  if (networkError) return null;
  if (!upstream.ok && (upstream.status === 429 || upstream.status === 503)) {
    await new Promise(r => setTimeout(r, 600));
    ({ upstream, networkError } = await callGemini());
    if (networkError) return null;
  }
  if (!upstream.ok) return null;

  const data = await upstream.json().catch(() => null);
  const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) return null;

  const rateMatch = /rate=(\d+)/.exec(part.mimeType || '');
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const pcmBytes = Buffer.from(part.data, 'base64');
  const wavHeader = buildWavHeader({ dataLength: pcmBytes.length, sampleRate });
  return { buffer: Buffer.concat([wavHeader, pcmBytes]), contentType: 'audio/wav' };
}

// -------------------------- المرحلة 2: Edge TTS (احتياطي) --------------------------
function synthesizeWithEdgeTts(text, voice = EDGE_TTS_VOICE) {
  return new Promise((resolve, reject) => {
    const connectionId = crypto.randomUUID().replace(/-/g, '');
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${EDGE_TRUSTED_TOKEN}&ConnectionId=${connectionId}`;
    const ws = new WebSocket(url, {
      headers: {
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      }
    });

    const audioChunks = [];
    let settled = false;
    const finish = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { ws.close(); } catch (_) {}
      if (err) reject(err); else resolve(result);
    };
    const timeout = setTimeout(() => finish(new Error('Edge TTS timeout')), 15000);

    ws.on('open', () => {
      const timestamp = new Date().toISOString();
      ws.send(
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
              }
            }
          }
        })
      );

      const requestId = crypto.randomUUID().replace(/-/g, '');
      const ssml =
        `<speak version='1.0' xml:lang='ar-EG'>` +
        `<voice name='${voice}'>` +
        `<prosody rate='0%' pitch='0%'>${escapeSsml(text)}</prosody>` +
        `</voice></speak>`;
      ws.send(
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      );
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        // أول بايتين = طول الهيدر النصي المرفق قبل الصوت، وبعدهم الصوت الخام (mp3) مباشرة
        const headerLen = data.readUInt16BE(0);
        const audioPart = data.subarray(headerLen + 2);
        if (audioPart.length > 0) audioChunks.push(Buffer.from(audioPart));
      } else {
        const message = data.toString();
        if (message.includes('Path:turn.end')) {
          if (audioChunks.length === 0) finish(new Error('Edge TTS رجّع صوت فاضي'));
          else finish(null, Buffer.concat(audioChunks));
        }
      }
    });

    ws.on('error', (err) => finish(err));
    ws.on('close', () => finish(new Error('Edge TTS اتقفل قبل ما يخلص')));
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = (body.text || '').toString().trim().slice(0, 4000);
    if (!text) {
      return res.status(400).json({ error: 'لا يوجد نص لتحويله لصوت' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const underLocalLimit = checkLocalRateLimit(ip);

    let result = null;
    if (GEMINI_API_KEY && underLocalLimit) {
      result = await tryGeminiTts(text, GEMINI_API_KEY);
    }

    if (!result) {
      try {
        const edgeAudio = await synthesizeWithEdgeTts(text);
        result = { buffer: edgeAudio, contentType: 'audio/mpeg' };
      } catch (edgeErr) {
        return res.status(502).json({ error: 'تعذر توليد الصوت من Gemini ومن الخدمة الاحتياطية معًا', detail: String(edgeErr) });
      }
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(result.buffer);
  } catch (err) {
    return res.status(500).json({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) });
  }
}
