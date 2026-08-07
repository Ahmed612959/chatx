// ⚠️ Rate limiter بسيط ومباشر — Best Effort مش دقيق 100%.
// Vercel Edge/Serverless Functions معندهاش ذاكرة مشتركة مضمونة بين كل الـ instances
// (كل instance ليها نسخة من الـ Map دي لوحدها، وبتتصفر مع أي cold start). يعني ده
// مش بديل عن rate limiting حقيقي على مستوى الحساب (زي Vercel KV أو Redis)، لكنه
// طبقة حماية إضافية سهلة وبدون أي إعداد خارجي، وبتوقف السبام العادي من نفس الجهاز
// طول ما الـ instance شغالة (دقايق لحد ساعات عادةً).

const buckets = new Map();
const MAX_BUCKETS = 5000; // حماية من تسريب الذاكرة لو فيه IPs كتير جدًا

export function checkRateLimit(request, { limit = 20, windowMs = 60_000 } = {}) {
    // بيدعم الشكلين: Edge Function (request.headers.get) و Node Function (request.headers['x-forwarded-for'])
    const h = request.headers;
    const rawForwardedFor = typeof h.get === 'function' ? h.get('x-forwarded-for') : h['x-forwarded-for'];
    const rawRealIp = typeof h.get === 'function' ? h.get('x-real-ip') : h['x-real-ip'];
    const ip = rawForwardedFor?.split(',')[0]?.trim() || rawRealIp || 'unknown';

    const now = Date.now();
    let bucket = buckets.get(ip);

    if (!bucket || now - bucket.windowStart > windowMs) {
        bucket = { windowStart: now, count: 0 };
        if (buckets.size >= MAX_BUCKETS) {
            // تنضيف بسيط: امسح أقدم مدخل بدل ما نسيب الـ Map تكبر من غير حدود
            const oldestKey = buckets.keys().next().value;
            if (oldestKey !== undefined) buckets.delete(oldestKey);
        }
        buckets.set(ip, bucket);
    }

    bucket.count += 1;

    if (bucket.count > limit) {
        const retryAfterSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
        return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
    }

    return { allowed: true };
}

export function rateLimitResponse(retryAfterSeconds) {
    return new Response(
        JSON.stringify({ error: `طلبات كتير أوي في وقت قصير — حاول تاني بعد ${retryAfterSeconds} ثانية` }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfterSeconds)
            }
        }
    );
}
