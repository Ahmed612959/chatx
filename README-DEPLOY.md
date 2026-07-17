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

## تعديل المتغيرات بعد الديبلوي

لو غيرت مفتاح أو ضفت واحد جديد من الداشبورد (Project → Settings → Environment Variables)، لازم تعمل **Redeploy** عشان التغيير يتفعل — التعديل في الداشبورد لوحده مش كافي.

## اختبار محلي قبل النشر (اختياري)

```bash
npm install -g vercel
cp .env.example .env   # واملأ المفاتيح الحقيقية
vercel dev
```

هيشغل نسخة محلية على `http://localhost:3000` فيها الـ API شغال زي بالظبط اللي هيحصل بعد النشر.
