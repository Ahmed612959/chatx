// ====================== DeepSeek عن طريق OneHop ======================
// حط الكود ده في نفس ملف باك إند Chat X اللي فيه /api/mistral, /api/qwen, إلخ
// (مش في server-index.js بتاع School X — ده مشروع تاني).
//
// ⚠️ مهم جدًا: حط الـ API key بتاعك كـ Environment Variable على السيرفر
// (اسمه مثلاً ONEHOP_API_KEY)، وميتحطش أبدًا مكتوب مباشرة في الكود ولا في
// أي ملف فرونت إند — لو اتحط في الفرونت إند أي حد بيفتح "عرض المصدر" هيقدر
// ياخده ويستخدمه على حسابك.
//
// إعداد المتغير:
//   - لو بتستضيف على Vercel: Project Settings → Environment Variables → أضف
//     ONEHOP_API_KEY بالقيمة اللي عندك، وبعدين اعمل Redeploy.
//   - لو محلي: حطه في ملف .env (وتأكد إن .env مضاف في .gitignore).
app.post('/api/onehop', async (req, res) => {
    try {
        const apiKey = process.env.ONEHOP_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ONEHOP_API_KEY مش متظبط على السيرفر' });
        }

        const { messages, model, stream } = req.body;
        if (!messages) {
            return res.status(400).json({ error: 'messages مطلوبة' });
        }

        const upstream = await fetch('https://api.onehop.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'deepseek/deepseek-v4-pro',
                messages,
                stream: stream !== false
            })
        });

        if (!upstream.ok) {
            const errText = await upstream.text().catch(() => '');
            console.error('❌ OneHop API error:', upstream.status, errText.slice(0, 300));
            return res.status(upstream.status).send(errText || 'OneHop API error');
        }

        // بنمرر الـ streaming response زي ما هو (نفس شكل باقي الـ providers) —
        // الفرونت إند بيتوقع سطور "data: {...}" بصيغة OpenAI streaming القياسية،
        // وOneHop بيرجعها بنفس الشكل لأنه OpenAI-compatible.
        res.setHeader('Content-Type', 'text/event-stream');
        upstream.body.pipe(res);
    } catch (error) {
        console.error('❌ OneHop proxy error:', error);
        res.status(500).json({ error: 'خطأ في الاتصال بـ OneHop: ' + error.message });
    }
});
