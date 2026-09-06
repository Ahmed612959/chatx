export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// ====================================================================================
// Amazon Polly — أول طبقة صوت بتتحاول في المكالمة وفي رسائل الشات العادية كمان (نفس
// الدالة fetchTtsAudioBlob بالفرونت إند مستخدمة في الاتنين). لو مفتاح AWS مش مضبوط
// أو الطلب فشل لأي سبب، بيكمل تلقائيًا وبصمت لـ CometAPI وبعدين لباقي الطبقات القديمة.
//
// الإعداد المطلوب (خطوات AWS، لازم تتعمل هناك، مفيش بديل لأن Polly بيوقّع كل طلب
// بمفتاح AWS مش Bearer token عادي):
//   1) https://console.aws.amazon.com → IAM → Users → Create user (مثلاً chatx-polly)
//   2) من تبويب "Permissions" ضيف policy اسمها AmazonPollyReadOnlyAccess (أو
//      policy مخصصة صلاحيتها polly:SynthesizeSpeech بس — أضمن أمنيًا)
//   3) من تبويب "Security credentials" → Create access key → اختار "Application
//      running outside AWS" → هيديك Access Key ID و Secret Access Key (تتحفظ مرة
//      واحدة بس، انسخهم فورًا)
//   4) في Vercel → Settings → Environment Variables ضيف:
//        AWS_ACCESS_KEY_ID       = القيمة اللي نسختها
//        AWS_SECRET_ACCESS_KEY   = القيمة اللي نسختها
//        AWS_REGION              = اختياري، افتراضيًا eu-west-1
//        POLLY_VOICE_ID          = اختياري، افتراضيًا Zayd (الصوت العربي الرجالي
//                                   الوحيد المتاح في Polly — لهجة خليجية/فصحى، مفيش
//                                   صوت رجالي بلهجة مصرية في Polly لحد دلوقتي)
//        POLLY_VOLUME            = اختياري، افتراضيًا +3dB (تقدر تزوّدها أو تقلّلها،
//                                   مثلاً +6dB لصوت أعلى أو +0dB للمستوى الافتراضي)
//        POLLY_RATE              = اختياري، افتراضيًا 90% (سرعة الكلام — قلّلها زي
//                                   80% لو عايزه أبطأ، أو زوّدها لـ 100% للسرعة العادية)
//   5) اعمل Redeploy من Vercel عشان يقرأ المتغيرات الجديدة.
//
// ملحوظة عن الصوت: Zayd صوت رجالي neural (خليجي/فصحى مش مصري)، وده أفضل خيار متاح
// حاليًا من AWS لأنها لسه معندهاش صوت رجالي باللهجة المصرية. لو حبيت ترجع للصوت
// الستّاتي (Zeina) بدل Zayd، غيّر POLLY_VOICE_ID = Zeina وEngine تحت لـ 'standard'.
// ====================================================================================

const DEFAULT_REGION = 'eu-west-1';
const DEFAULT_VOICE = 'Zayd';   // رجالي، neural — كان Zeina (نسائي) قبل كده
const DEFAULT_ENGINE = 'neural';
const DEFAULT_VOLUME = '+3dB';  // مستوى صوت طبيعي ومسموع، مش هادي زيادة ولا صارخ
const DEFAULT_RATE = '90%';     // أبطأ شوية من العادي (100%) — إحساس هادي واحترافي بدل الاندفاع

function escapeSsml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// بيحوّل النص العادي لـ SSML فيه وقفات طبيعية: وقفة أوضح بعد نهاية كل جملة (نقطة/
// علامة استفهام/تعجب) ووقفة أقصر بعد الفواصل — عشان الصوت يحس إنه "بيتكلم بانتظام"
// جملة جملة، مش بيندفع في الرسالة كلها مرة واحدة من غير أي نفَس بينها.
function buildSsml(text, { volume, rate }) {
  let escaped = escapeSsml(text.slice(0, 3000));
  escaped = escaped.replace(/([.!؟?])(\s+|$)/g, '$1<break time="450ms"/>$2');
  escaped = escaped.replace(/([,،])(\s+)/g, '$1<break time="200ms"/>$2');
  return `<speak><prosody rate="${rate}" volume="${volume}">${escaped}</prosody></speak>`;
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(message) {
  const data = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const hash = await crypto.subtle.digest('SHA-256', data);
  return toHex(hash);
}

async function hmac(keyBytes, message) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, typeof message === 'string' ? new TextEncoder().encode(message) : message);
  return new Uint8Array(sig);
}

function pad(n) { return String(n).padStart(2, '0'); }

// بيبني ويوقّع طلب Amazon Polly SynthesizeSpeech (AWS Signature Version 4) يدويًا —
// مفيش AWS SDK متاح في بيئة Edge، فالتوقيع بيتعمل بـ Web Crypto مباشرة.
async function signedPollyRequest({ accessKeyId, secretAccessKey, region, bodyObj }) {
  const service = 'polly';
  const host = `polly.${region}.amazonaws.com`;
  const path = '/v1/speech';
  const body = JSON.stringify(bodyObj);

  const now = new Date();
  const amzDate = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const payloadHash = await sha256Hex(body);

  const canonicalRequest = ['POST', path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n');

  const kDate = await hmac(new TextEncoder().encode('AWS4' + secretAccessKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = toHex(await hmac(kSigning, stringToSign));

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(`https://${host}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': amzDate,
      Authorization: authorization
    },
    body
  });
}

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const rl = checkRateLimit(request, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey) {
      return new Response(JSON.stringify({ error: 'AWS_ACCESS_KEY_ID أو AWS_SECRET_ACCESS_KEY غير مضبوطين' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const region = process.env.AWS_REGION || DEFAULT_REGION;
    const voiceId = process.env.POLLY_VOICE_ID || DEFAULT_VOICE;
    const engine = process.env.POLLY_ENGINE || DEFAULT_ENGINE;
    const volume = process.env.POLLY_VOLUME || DEFAULT_VOLUME;
    const rate = process.env.POLLY_RATE || DEFAULT_RATE;

    const { text } = await request.json().catch(() => ({}));
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'مفيش نص للتحويل لصوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // بنلف النص بـ SSML عشان نتحكم في السرعة والوقفات الطبيعية بين الجمل ومستوى
    // الصوت — من غير كده Polly بيقول الرسالة كلها دفعة واحدة وبسرعة عادية.
    const ssml = buildSsml(text, { volume, rate });

    let upstream;
    try {
      upstream = await signedPollyRequest({
        accessKeyId,
        secretAccessKey,
        region,
        bodyObj: {
          Text: ssml,
          OutputFormat: 'mp3',
          VoiceId: voiceId,
          Engine: engine,
          TextType: 'ssml'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'تعذر الوصول لـ Amazon Polly', detail: String(err) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'Amazon Polly رجّعت خطأ', detail: errText.slice(0, 500) }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع في السيرفر', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
