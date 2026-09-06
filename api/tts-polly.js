export const config = { runtime: 'edge' };
import { checkRateLimit, rateLimitResponse } from './_rateLimit.js';

// ====================================================================================
// Amazon Polly — دلوقتي أول طبقة صوت بتتحاول في المكالمة (قبل CometAPI). لو مفتاح
// AWS مش مضبوط أو الطلب فشل لأي سبب، الفرونت إند بيكمل تلقائيًا وبصمت لـ CometAPI
// وبعدين لباقي الطبقات القديمة — مفيش أي تأثير على المكالمة حتى لو Polly مش مفعّل.
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
//        AWS_REGION              = اختياري، افتراضيًا eu-west-1 (Polly متاحة في أغلب
//                                   الـ regions، اختار الأقرب جغرافيًا لطلابك)
//        POLLY_VOICE_ID          = اختياري، افتراضيًا Zeina (الصوت العربي الوحيد
//                                   المتاح حاليًا بمحرك standard)
//   5) اعمل Redeploy من Vercel عشان يقرأ المتغيرات الجديدة.
//
// ملحوظة: صوت Zeina عربي لكن مش بأحدث جودة عصبية (neural) لأن AWS لسه معندهاش
// صوت عربي neural رسمي وقت كتابة الكود ده — لو تحقق لاحقًا وحبيت تستخدمه غيّر
// Engine تحت من 'standard' لـ 'neural' وVoiceId المناسب.
// ====================================================================================

const DEFAULT_REGION = 'eu-west-1';
const DEFAULT_VOICE = 'Zeina';

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

    const { text } = await request.json().catch(() => ({}));
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'مفيش نص للتحويل لصوت' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let upstream;
    try {
      upstream = await signedPollyRequest({
        accessKeyId,
        secretAccessKey,
        region,
        bodyObj: {
          Text: text.slice(0, 3000),
          OutputFormat: 'mp3',
          VoiceId: voiceId,
          Engine: 'standard',
          TextType: 'text'
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
