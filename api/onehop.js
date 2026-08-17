// ====================== DeepSeek عن طريق OneHop ======================
// حط الكود ده في نفس ملف باك إند Chat X اللي فيه /api/mistral, /api/qwen, إلخ.
//
// ⚠️ الـ API key بتاعك لازم يكون Environment Variable على السيرفر
// (اسمه ONEHOP_API_KEY) — ميتحطش أبدًا مكتوب في الكود ولا في أي ملف فرونت إند.
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

        // ⚠️ upstream.body من fetch المدمج في Node.js (Node 18+/Vercel) هو
        // Web ReadableStream — مافيهوش .pipe() (ده بتاع Node streams بس)، وده
        // كان بيرمي خطأ فورًا وبيترجم لـ 500. بنقرا الـ stream يدويًا بدل كده
        // (شغالة مع أي نسخة fetch، Node أو node-fetch v3).
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = upstream.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
            }
        } catch (streamErr) {
            console.error('❌ خطأ في تدفق رد OneHop:', streamErr);
        } finally {
            res.end();
        }
    } catch (error) {
        console.error('❌ OneHop proxy error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'خطأ في الاتصال بـ OneHop: ' + error.message });
        } else {
            res.end();
        }
    }
});
