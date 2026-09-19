// ============================================================
// البحث في الويب — ضيف الكود ده في server-index.js (بعد express.json() والـ CORS)
// المزوّد: Tavily (https://tavily.com) — بيرجّع نتايج + محتوى الصفحة جاهز للموديل.
//
// متغيرات البيئة على Vercel:
//   TAVILY_API_KEYS = tvly-xxxx,tvly-yyyy   (مفتاح واحد أو أكتر مفصولين بفاصلة)
//   لو مفتاح خلص رصيده أو اتعمله rate limit، السيرفر بيجرّب اللي بعده تلقائيًا.
//
// ملحوظة: لو عندك middleware للتحقق من توكن الطالب (زي اللي في /api/deep-think/use)
// حطه قبل الـ handler: app.post('/api/web-search', requireAuth, async (req, res) => {...})
// ============================================================

const TAVILY_KEYS = (process.env.TAVILY_API_KEYS || process.env.TAVILY_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);
let tavilyKeyIdx = 0;

// حد استخدام بسيط لكل مستخدم/IP: 20 بحث كل 10 دقايق (best-effort — على Vercel serverless
// الذاكرة بتتصفّر مع كل instance جديدة، فلو عايز حد دقيق خزّنه في MongoDB زي حد Deep Thinking).
const WEB_SEARCH_WINDOW_MS = 10 * 60 * 1000;
const WEB_SEARCH_MAX_PER_WINDOW = 20;
const webSearchHits = new Map();

function webSearchRateLimited(key) {
  const now = Date.now();
  const hits = (webSearchHits.get(key) || []).filter(t => now - t < WEB_SEARCH_WINDOW_MS);
  if (hits.length >= WEB_SEARCH_MAX_PER_WINDOW) { webSearchHits.set(key, hits); return true; }
  hits.push(now);
  webSearchHits.set(key, hits);
  if (webSearchHits.size > 5000) webSearchHits.clear(); // حماية من تضخّم الذاكرة
  return false;
}

app.post('/api/web-search', async (req, res) => {
  try {
    if (!TAVILY_KEYS.length) {
      return res.status(503).json({ error: 'البحث في الويب مش متظبط على السيرفر لسه' });
    }

    const query = String(req.body?.query || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    if (query.length < 3) return res.status(400).json({ error: 'نص البحث قصير جدًا' });
    const maxResults = Math.min(Math.max(parseInt(req.body?.maxResults, 10) || 5, 1), 8);

    const who = String(req.headers.authorization || req.headers['x-forwarded-for'] || req.ip || 'anon').slice(-60);
    if (webSearchRateLimited(who)) {
      return res.status(429).json({ error: 'بحثت كتير في وقت قصير — جرّب تاني بعد شوية' });
    }

    let lastStatus = 0;
    for (let i = 0; i < TAVILY_KEYS.length; i++) {
      const idx = (tavilyKeyIdx + i) % TAVILY_KEYS.length;
      try {
        const r = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEYS[idx]}` },
          body: JSON.stringify({
            query,
            search_depth: 'basic',   // basic = 1 credit — "advanced" بـ 2 credits لو عايز جودة أعلى
            max_results: maxResults,
            topic: 'general',        // غيّرها لـ 'news' لو السؤال عن أخبار حديثة
            include_answer: false
          }),
          signal: AbortSignal.timeout(15000)
        });
        lastStatus = r.status;
        if (r.status === 400) return res.status(400).json({ error: 'نص البحث مش مقبول' });
        if (!r.ok) continue; // 401/429/432/433/5xx → جرّب المفتاح اللي بعده

        const data = await r.json();
        tavilyKeyIdx = idx; // خلّي المفتاح الشغال هو الأول المرة الجاية
        const results = (Array.isArray(data.results) ? data.results : [])
          .filter(x => x && typeof x.url === 'string' && /^https?:\/\//i.test(x.url))
          .map(x => ({
            title: String(x.title || '').slice(0, 200),
            url: x.url,
            content: String(x.content || '').slice(0, 1500),
            published_date: x.published_date || ''
          }));
        return res.json({ results });
      } catch (e) {
        lastStatus = 0; // timeout أو خطأ شبكة → جرّب المفتاح اللي بعده
      }
    }

    console.error('web-search: all Tavily keys failed, last status', lastStatus);
    return res.status(lastStatus === 429 ? 429 : 502).json({ error: 'خدمة البحث مش متاحة دلوقتي' });
  } catch (err) {
    console.error('web-search error', err);
    return res.status(500).json({ error: 'حصل خطأ في البحث' });
  }
});
