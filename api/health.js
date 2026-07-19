// Quick diagnostic endpoint — visit /api/health in the browser after deploying
// to instantly see whether the environment variables actually reached this
// deployment, without exposing the key values themselves.
export const config = { runtime: 'edge' };

export default async function handler() {
  return new Response(
    JSON.stringify({
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      openrouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
      cerebrasConfigured: Boolean(process.env.CEREBRAS_API_KEY),
      qwenConfigured: Boolean(process.env.QWEN_API_KEY),
      deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
      zimageConfigured: Boolean(process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY)
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}