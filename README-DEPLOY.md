# نشر School X على Vercel

الهيكل هنا مظبوط عشان يشتغل على Vercel من غير أي إعداد إضافي:
- `index.html` → الموقع نفسه (بيتفتح على `/`)
- `api/groq.js` و `api/gemini.js` → Edge Functions بتكلم Groq وGemini بمفاتيح مخزنة في Environment Variables

## الطريقة 1: من الموقع (أسهل، من غير Terminal)

1. ارفع الفولدر ده كامل على GitHub repo (لازم يكون فيه `index.html` و `api/` في الروت)
2. روح على [vercel.com](https://vercel.com) → **Add New → Project** → اختار الـ repo
3. Vercel هيكتشف إنه مشروع static + functions تلقائي، سيبه زي ما هو من غير ما تغير الـ Framework Preset (خليه "Other")
4. قبل الضغط على Deploy، افتح **Environment Variables** وضيف:
   - `GROQ_API_KEY` = مفتاحك من Groq
   - `GEMINI_API_KEY` = مفتاحك من Gemini
   - `OPENROUTER_API_KEY` = مفتاحك من OpenRouter (اختياري)
   - `CEREBRAS_API_KEY` = مفتاحك من Cerebras (اختياري)
   - `QWEN_API_KEY` = مفتاحك من Qwen / DashScope (اختياري) — من [https://dashscope.console.aliyun.com](https://dashscope.console.aliyun.com)
5. اضغط **Deploy**
6. بعد ما يخلص، هتاخد رابط زي `https://school-x-xxxx.vercel.app`

## الطريقة 2: من الـ Terminal (Vercel CLI)

```bash
npm install -g vercel
cd school-x-vercel
vercel login
vercel
```

هيسألك أسئلة إعداد (سيب الإجابات الافتراضية). بعد أول ديبلوي:

```bash
vercel env add GROQ_API_KEY
vercel env add GEMINI_API_KEY
vercel env add QWEN_API_KEY
```

هيطلب منك تختار Environment (Production / Preview / Development) — اختار **Production** على الأقل، وأدخل قيمة المفتاح.

بعد كده اعمل ديبلوي تاني عشان المتغيرات تتفعل:

```bash
vercel --prod
```

## ربط الموقع بالسيرفر

بعد الديبلوي، افتح `index.html` (سواء لايف على Vercel أو محلي) → **الإعدادات (⚙️)** → حط رابط الـ Vercel بتاعك:

```
https://school-x-xxxx.vercel.app
```

بما إن الموقع والـ API على نفس الدومين هنا، أي رابط تحطه هيشتغل — مش شرط يكون نفس الدومين بالظبط، تقدر كمان تستضيف الـ `index.html` في مكان تاني وتسيب الـ API بس على Vercel، وتحط رابط الـ Vercel في الإعدادات برضه.

## اتأكد إن المفاتيح شغالة فعلاً (أهم خطوة)

بعد أي ديبلوي، افتح الرابط ده في المتصفح:

```
https://your-app.vercel.app/api/health
```

هيرجعلك رد زي:

```json
{ "groqConfigured": true, "geminiConfigured": true, "openrouterConfigured": false, "cerebrasConfigured": false, "qwenConfigured": true }
```

لو أي واحدة فيهم `false`، معناها المتغير ده مش واصل للديبلوي الحالي — روح على الـ checklist اللي تحت. الصفحة دي متعمل معمول عشان تتأكد في ثانية من غير ما تفتح Developer Console أو تدور في الـ Network tab.

## Checklist نهائي لو المفاتيح مش شغالة

اتبع الخطوات دي بالترتيب — 95% من مشاكل الـ 500 سببها واحدة منهم:

1. **الاسم مطابق حرفياً** — لازم يكون `GROQ_API_KEY` و `GEMINI_API_KEY` بالظبط (حساس لحالة الحروف، بدون مسافات قبل أو بعد)
2. **الـ Environment مفعّل على Production** — لما تضيف المتغير في Settings → Environment Variables، لازم تختار (أو تعلّم صح) على **Production** — مش بس Preview أو Development
3. **عملت Redeploy بعد الإضافة** — إضافة أو تعديل متغير من الداشبورد **مبيتفعلش تلقائي** على ديبلوي شغال قبله. لازم:
   - Deployments → آخر ديبلوي → (⋯) → **Redeploy**
   - أو ببساطة اعمل `vercel --prod` تاني لو شغال بالـ CLI
4. **مفيش مسافات أو quotes زيادة في القيمة نفسها** — لو نسخت المفتاح من مكان تاني وجه معاه مسافة أو سطر جديد في الآخر، الـ API هيرفضه برسالة مختلفة (401 مش 500) — لو شكيت في كده امسح المتغير وضيفه تاني يدوي
5. **افتح `/api/health` تاني بعد كل تعديل** للتأكد إن التغيير فعلاً وصل قبل ما تدور في مشاكل تانية

## اختبار محلي قبل النشر (اختياري)

```bash
npm install -g vercel
cp .env.example .env   # واملأ المفاتيح الحقيقية
vercel dev
```

هيشغل نسخة محلية على `http://localhost:3000` فيها الـ API شغال زي بالظبط اللي هيحصل بعد النشر.
