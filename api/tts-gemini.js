// ⚠️ لازم يبقى Node.js Runtime (مش Edge) — الطبقة الاحتياطية (Edge TTS) محتاجة اتصال
// WebSocket فعلي، ومش مدعوم في Vercel Edge Runtime. لو الملف ده كان شغال Edge قبل كده،
// شيل أي "export const config = { runtime: 'edge' }" قديم؛ مفيش حاجة هنا دلوقتي = Node تلقائيًا.
//
// محتاج تضيف "ws" في package.json بتاعك (npm install ws) عشان الطبقة الاحتياطية تشتغل.

import { WebSocket } from 'ws';
import crypto from 'crypto';

// السبب الحقيقي اللي كان بيخلي صوت Gemini يشتغل بس في الردود القصيرة: الدالة دي شغالة
// كـ Vercel Serverless Function، وليها مهلة تنفيذ افتراضية قصيرة (10 ثانية على خطة
// Hobby). توليد صوت لنص طويل عند Gemini بياخد وقت أطول من نص قصير، فكان بيضرب المهلة
// دي ويتقفل بالقوة (504) قبل ما يخلص — الطلب يفشل كـ "خطأ شبكة" في المتصفح، فالتطبيق
// كان بينزل تلقائي لطبقة الصوت الاحتياطية (Azure/Google) من غير ما المستخدم يعرف السبب،
// وحاسس إن "صوت Gemini مش شغال" مع النصوص الطويلة. الحل الجذري خطوتين:
//   ١) نرفع مهلة الفنكشن دي صراحة لحد ٦٠ ثانية (أقصى حد مسموح حتى على خطة Vercel
//      المجانية Hobby).
//   ٢) نقسّم أي نص طويل لقطع صغيرة عند حدود الجمل ونولّد صوت كل قطعة بالتوازي، بدل
//      طلب واحد ضخم بياخد وقت طويل متراكم — فكل قطعة بترجع بسرعة، والنتيجة توصل
//      أسرع بكتير حتى لو النص كله كان طويل جدًا.
export const config = { maxDuration: 60 };

const GEMINI_CHUNK_CHAR_LIMIT = 600; // حجم القطعة الواحدة اللي بتتبعت لـ Gemini
const GEMINI_CALL_TIMEOUT_MS = 25000; // مهلة كل قطعة لوحدها، عشان قطعة واحدة عالقة متوقفش كل الطلب

// بيقسّم النص الطويل لقطع عند حدود الجمل (نقطة/علامة استفهام/تعجب أو سطر جديد) بدل
// القطع العشوائي في نص الكلمة، عشان الصوت الناتج يفضل طبيعي ومفيش وقفة غريبة نص كلمة.
function splitTextIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const sentences = text.split(/(?<=[.!?؟،\n])\s+/);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      // جملة واحدة أطول من الحد (نادر) — نقسمها بالعافية عند أقرب مسافة
      if (current) { chunks.push(current); current = ''; }
      let rest = sentence;
      while (rest.length > maxLen) {
        let cut = rest.lastIndexOf(' ', maxLen);
        if (cut <= 0) cut = maxLen;
        chunks.push(rest.slice(0, cut));
        rest = rest.slice(cut).trim();
      }
      if (rest) current = rest;
      continue;
    }
    if ((current + ' ' + sentence).trim().length > maxLen) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = (current ? current + ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(c => c.trim().length > 0);
}

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
// بترجع الصوت الخام (PCM) وسرعة العينة، مش ملف WAV كامل — عشان لو النص اتقسّم لقطع
// نقدر نلزّق كل قطع الـ PCM مع بعض ونبني هيدر WAV واحد بس في الآخر لملف صوت متصل.
async function tryGeminiTtsChunk(text, apiKey) {
  async function callGemini() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CALL_TIMEOUT_MS);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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
    } finally {
      clearTimeout(timeoutId);
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
  return { pcmBytes, sampleRate };
}

// بيقسّم النص الطويل لقطع (لو محتاج) ويولّد صوت كل قطعة بالتوازي عند Gemini، وبعدين
// يلزّق كل الـ PCM بالترتيب الصح ويبني ملف WAV واحد متصل. لو أي قطعة فشلت، الكل يعتبر
// فاشل (بيرجع null) عشان الطالب مايسمعش صوت مقطوع في نص الكلام — وقتها هانديلر التاني
// بينزل تلقائي لطبقة Edge TTS الاحتياطية على *النص الكامل*.
async function tryGeminiTts(text, apiKey) {
  const chunks = splitTextIntoChunks(text, GEMINI_CHUNK_CHAR_LIMIT);
  const results = await Promise.all(chunks.map(chunk => tryGeminiTtsChunk(chunk, apiKey)));
  if (results.some(r => !r)) return null;

  const sampleRate = results[0].sampleRate;
  const pcmBuffers = results.map(r => r.pcmBytes);
  const combinedPcm = Buffer.concat(pcmBuffers);
  const wavHeader = buildWavHeader({ dataLength: combinedPcm.length, sampleRate });
  return { buffer: Buffer.concat([wavHeader, combinedPcm]), contentType: 'audio/wav' };
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
    // كان محدود بـ 4000 حرف زمان — رفعناه لـ 8000 دلوقتي لأن التقسيم لقطع فوق خلّى
    // النص الطويل يتعالج بسرعة وأمان بدل ما يضرب مهلة التنفيذ.
    const text = (body.text || '').toString().trim().slice(0, 8000);
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
