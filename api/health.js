// Quick diagnostic endpoint — visit /api/health in the browser after deploying
// to instantly see whether the environment variables actually reached this
// deployment, without exposing the key values themselves.
//
// إضافة GET /api/health?live=1 بتعمل فحص حقيقي (ping بأقل تكلفة ممكنة، max_tokens=1)
// لكل مزود بدل ما تتأكد بس إن المفتاح موجود — بتوضح لو المفتاح موجود بس منتهي/كوتته خلصت.
// ده اختياري ومش الافتراضي عشان الفحص العادي يفضل فوري ومجاني (صفر استهلاك كوتة).
export const config = { runtime: 'edge' };

const PROVIDERS = [
  {
    name: 'groq',
    envKey: 'GROQ_API_KEY',
    ping: (key) => fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-oss-20b', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'gemini',
    envKey: 'GEMINI_API_KEY',
    ping: (key) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 1 } })
    })
  },
  {
    name: 'openrouter',
    envKey: 'OPENROUTER_API_KEY',
    ping: (key) => fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'cerebras',
    envKey: 'CEREBRAS_API_KEY',
    ping: (key) => fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-4-scout-17b-16e-instruct', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'mistral',
    envKey: 'MISTRAL_API_KEY',
    ping: (key) => fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'mistral-small-latest', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'sambanova',
    envKey: 'SAMBANOVA_API_KEY',
    ping: (key) => fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'Meta-Llama-3.3-70B-Instruct', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'qwen',
    envKey: 'QWEN_API_KEY',
    ping: (key) => fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen-flash', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  },
  {
    name: 'deepseek',
    envKey: 'DEEPSEEK_API_KEY',
    ping: (key) => fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
    })
  }
];

export default async function handler(request) {
  const url = new URL(request.url);
  const live = url.searchParams.get('live') === '1';

  if (!live) {
    return new Response(
      JSON.stringify({
        mode: 'configured-only (أضف ?live=1 لفحص حقيقي — بيستهلك جزء بسيط جدًا من الكوتة)',
        groqConfigured: Boolean(process.env.GROQ_API_KEY),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        openrouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
        cerebrasConfigured: Boolean(process.env.CEREBRAS_API_KEY),
        mistralConfigured: Boolean(process.env.MISTRAL_API_KEY),
        sambanovaConfigured: Boolean(process.env.SAMBANOVA_API_KEY),
        qwenConfigured: Boolean(process.env.QWEN_API_KEY),
        deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
        zimageConfigured: Boolean(process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY)
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const results = await Promise.all(PROVIDERS.map(async (p) => {
    const key = process.env[p.envKey];
    if (!key) return { name: p.name, status: 'not_configured' };
    try {
      const res = await p.ping(key);
      if (res.ok) return { name: p.name, status: 'ok' };
      let detail = '';
      try { detail = (await res.text()).slice(0, 150); } catch (e) {}
      return { name: p.name, status: 'error', httpStatus: res.status, detail };
    } catch (err) {
      return { name: p.name, status: 'unreachable', detail: String(err).slice(0, 150) };
    }
  }));

  return new Response(
    JSON.stringify({ mode: 'live', checkedAt: new Date().toISOString(), providers: results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}