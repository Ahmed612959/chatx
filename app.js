marked.setOptions({ breaks: true, gfm: true });

        function wrapTables(container) {
            if (!container) return;
            container.querySelectorAll('table').forEach(tbl => {
                if (tbl.parentElement && tbl.parentElement.classList.contains('table-wrap')) return;
                const wrap = document.createElement('div');
                wrap.className = 'table-wrap';
                tbl.parentNode.insertBefore(wrap, tbl);
                wrap.appendChild(tbl);
            });
        }

        // Runs after a message bubble's final HTML is set. Syntax-highlights every
        // code block and adds a small copy button on top of each one, so code is
        // recognizable at a glance and can be copied without selecting the bot's
        // surrounding explanation text too.
        function enhanceCodeBlocks(bubbleEl) {
            if (!bubbleEl) return;
            wrapTables(bubbleEl);
            bubbleEl.querySelectorAll('pre code').forEach((codeEl) => {
                if (codeEl.dataset.enhanced) return;
                codeEl.dataset.enhanced = '1';

                if (window.hljs) {
                    try { hljs.highlightElement(codeEl); } catch (e) {}
                }

                const preEl = codeEl.parentElement;
                const langMatch = (codeEl.className || '').match(/language-(\w+)/);
                if (langMatch) {
                    const tag = document.createElement('span');
                    tag.className = 'code-lang-tag';
                    tag.textContent = langMatch[1];
                    preEl.appendChild(tag);
                }

                const btn = document.createElement('button');
                btn.className = 'code-copy-btn';
                btn.type = 'button';
                btn.innerHTML = '<i class="fas fa-copy"></i>';
                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(codeEl.textContent).then(() => {
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        btn.classList.add('copied');
                        showToast('تم نسخ الكود', 'success');
                        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; btn.classList.remove('copied'); }, 1500);
                    }).catch(() => showToast('تعذر النسخ', 'error'));
                });
                preEl.appendChild(btn);
            });
        }

        // Builds the action buttons (copy / listen / regenerate / pin) under a message bubble.
        // isLastBotMsg restricts the "regenerate" button to the most recent bot reply only,
        // since regenerating an older reply would also wipe every message that came after it.
        function buildMsgActionButtons(msg, actionsDiv, isLastBotMsg) {
            actionsDiv.innerHTML = '';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'msg-action-btn';
            copyBtn.title = 'نسخ';
            copyBtn.setAttribute('aria-label', 'نسخ الرسالة');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.addEventListener('click', () => copyToClipboard(msg.content));
            actionsDiv.appendChild(copyBtn);

            if (msg.role === 'bot') {
                const speakBtn = document.createElement('button');
                speakBtn.className = 'msg-action-btn';
                speakBtn.title = 'سماع الرد';
                speakBtn.setAttribute('aria-label', 'سماع الرد');
                speakBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
                speakBtn.addEventListener('click', () => speakText(msg, speakBtn));
                actionsDiv.appendChild(speakBtn);

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'msg-action-btn';
                downloadBtn.title = 'تحميل كملف صوتي (تسمعه وانت ماشي)';
                downloadBtn.setAttribute('aria-label', 'تحميل الرد كملف صوتي');
                downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
                downloadBtn.addEventListener('click', () => downloadAsAudio(msg.content, downloadBtn));
                actionsDiv.appendChild(downloadBtn);

                // تقييم الرد (👍/👎) — بيساعدنا نعرف فعليًا أي موديل بيدي إجابات ضعيفة.
                // دوس على نفس الزرار تاني يشيل التقييم (toggle)، مش لازم يفضل ثابت.
                const rateUpBtn = document.createElement('button');
                rateUpBtn.className = 'msg-action-btn rate-btn' + (msg.rating === 'up' ? ' rate-active-up' : '');
                rateUpBtn.title = 'رد مفيد';
                rateUpBtn.setAttribute('aria-label', 'تقييم الرد كمفيد');
                rateUpBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
                actionsDiv.appendChild(rateUpBtn);

                const rateDownBtn = document.createElement('button');
                rateDownBtn.className = 'msg-action-btn rate-btn' + (msg.rating === 'down' ? ' rate-active-down' : '');
                rateDownBtn.title = 'رد مش مفيد';
                rateDownBtn.setAttribute('aria-label', 'تقييم الرد كغير مفيد');
                rateDownBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
                actionsDiv.appendChild(rateDownBtn);

                rateUpBtn.addEventListener('click', () => rateMessage(msg, 'up', rateUpBtn, rateDownBtn));
                rateDownBtn.addEventListener('click', () => rateMessage(msg, 'down', rateUpBtn, rateDownBtn));

                if (isLastBotMsg) {
                    const regenBtn = document.createElement('button');
                    regenBtn.className = 'msg-action-btn regen-btn';
                    regenBtn.title = 'إعادة توليد الرد';
                    regenBtn.setAttribute('aria-label', 'إعادة توليد الرد');
                    regenBtn.innerHTML = '<i class="fas fa-rotate-right"></i>';
                    regenBtn.addEventListener('click', () => regenerateMessage(msg.id));
                    actionsDiv.appendChild(regenBtn);
                }
            }

            if (msg.role === 'user') {
                const editBtn = document.createElement('button');
                editBtn.className = 'msg-action-btn';
                editBtn.title = 'تعديل الرسالة';
                editBtn.setAttribute('aria-label', 'تعديل الرسالة');
                editBtn.innerHTML = '<i class="fas fa-pen"></i>';
                editBtn.addEventListener('click', () => enterEditMode(msg.id));
                actionsDiv.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'msg-action-btn delete-btn';
                deleteBtn.title = 'حذف الرسالة';
                deleteBtn.setAttribute('aria-label', 'حذف الرسالة');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => deleteMessage(msg.id));
                actionsDiv.appendChild(deleteBtn);
            }

            const pinBtn = document.createElement('button');
            pinBtn.className = 'msg-action-btn pin-btn' + (msg.pinned ? ' pinned' : '');
            pinBtn.title = msg.pinned ? 'إلغاء التثبيت' : 'تثبيت الرسالة';
            pinBtn.setAttribute('aria-label', msg.pinned ? 'إلغاء تثبيت الرسالة' : 'تثبيت الرسالة');
            pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
            pinBtn.addEventListener('click', () => togglePinMessage(msg.id));
            actionsDiv.appendChild(pinBtn);
        }

        // تقييم رد بوت (👍/👎) — بيتخزن محليًا فورًا (تجربة الطالب متتأثرش لو الشبكة بطيئة
        // أو فشلت)، وبيتبعت لسيرفر School X في الخلفية عشان يظهر في ملخص الأدمن. دوس على
        // نفس الزرار اللي مختاره تاني = إلغاء التقييم (toggle)، مش استبدال إجباري.
        // متاحة لكل الطلاب (Premium وعاديين) — مش ميزة Premium.
        async function rateMessage(msg, rating, upBtn, downBtn) {
            const newRating = (msg.rating === rating) ? null : rating;
            msg.rating = newRating;
            saveData();
            upBtn.classList.toggle('rate-active-up', newRating === 'up');
            downBtn.classList.toggle('rate-active-down', newRating === 'down');

            if (!schoolToken) return; // من غير حساب School X، التقييم بيفضل محلي بس (تجربة الواجهة) ومبيوصلش للأدمن
            try {
                if (newRating) {
                    await fetch(`${FIXED_SCHOOL_API_URL}/api/message-ratings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                        body: JSON.stringify({
                            clientMessageId: msg.id,
                            model: msg.source || 'unknown',
                            rating: newRating,
                            excerpt: (msg.content || '').slice(0, 200)
                        })
                    });
                } else {
                    await fetch(`${FIXED_SCHOOL_API_URL}/api/message-ratings/${encodeURIComponent(msg.id)}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${schoolToken}` }
                    });
                }
            } catch (e) { /* فشل الحفظ في السيرفر مش لازم يبوّظ تجربة الطالب — التقييم المحلي فضل شغال */ }
        }

        // Ensures the "regenerate" button only ever appears on the current last bot reply.
        // Needed because older bot bubbles keep their DOM around once a new question is asked.
        function syncRegenerateButtons(chat) {
            if (!chat) return;
            const lastBot = [...chat.messages].reverse().find(m => m.role === 'bot');
            chat.messages.forEach(m => {
                if (m.role !== 'bot') return;
                const el = document.getElementById(m.id);
                if (!el) return;
                const actionsDiv = el.querySelector('.msg-actions');
                if (!actionsDiv) return;
                const regenBtn = actionsDiv.querySelector('.regen-btn');
                const shouldHave = lastBot && m.id === lastBot.id;
                if (shouldHave && !regenBtn) {
                    const btn = document.createElement('button');
                    btn.className = 'msg-action-btn regen-btn';
                    btn.title = 'إعادة توليد الرد';
                    btn.innerHTML = '<i class="fas fa-rotate-right"></i>';
                    btn.addEventListener('click', () => regenerateMessage(m.id));
                    const pinBtn = actionsDiv.querySelector('.pin-btn');
                    if (pinBtn) actionsDiv.insertBefore(btn, pinBtn); else actionsDiv.appendChild(btn);
                } else if (!shouldHave && regenBtn) {
                    regenBtn.remove();
                }
            });
        }

        let currentUtterance = null;
        let currentAudio = null;
        let currentSpeakBtn = null;
        let speakToken = 0;

        function resetSpeakBtn() {
            if (currentSpeakBtn) {
                currentSpeakBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
                currentSpeakBtn.classList.remove('speaking');
            }
            currentUtterance = null;
            currentSpeakBtn = null;
        }

        // Stops whatever is currently speaking, whether it's the /api/tts audio player
        // or the browser's built-in speechSynthesis fallback. Bumping speakToken also
        // cancels any in-flight /api/tts fetch so a stale response can't start playing late.
        function stopSpeaking() {
            speakToken++;
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.src = '';
                currentAudio = null;
            }
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            resetSpeakBtn();
        }

        // Reads a bot reply out loud using the free /api/tts backend route (real speech
        // audio, works even where the browser has no/poor Arabic voices). Falls back to
        // speechSynthesis if the API route is unreachable or returns an error. Clicking
        // the same button again (or another speak button) stops playback first, so only
        // one message speaks at a time.
        // Helper مشترك: بيجرب الصوت الطبيعي الجديد الأول (Microsoft Edge Neural)، ولو فشل
        // يرجع تلقائي لـ /api/tts القديم (Google Translate) — مستخدم في كل مكان بيولّد
        // صوت في التطبيق (زرار الاستماع، تحميل MP3، محاكي المواقف) عشان الترقية تتطبق
        // ====================================================================================
        // Helper مركزي واحد لكل صوت في التطبيق كله — بيتنادى من 3 أماكن:
        //   1) speakText()          → زرار "استمع" تحت أي رسالة في المحادثة العادية
        //   2) downloadAsAudio()    → زرار تحميل رد كـ ملف MP3/WAV
        //   3) speakSimNarration()  → سرد المشهد في محاكي المواقف الإكلينيكية (الفيديو المتفرّع)
        // بما إن التلاتة بينادوا نفس الدالة دي، أي تحسين أو تغيير في جودة الصوت بيتطبق في
        // كل مكان في التطبيق مرة واحدة — مفيش داعي نكرر نفس المنطق في 3 أماكن مختلفة.
        //
        // ترتيب المحاولات (fallback chain) — كل طبقة بتتجرب وبترجع أول ما توفر النتيجة:
        //   (-1) Amazon Polly (/api/tts-polly) → أول حاجة بتتجرب فعليًا لكل الطلاب لو
        //        مفاتيح AWS مضبوطة على السيرفر.
        //   (0) CometAPI (Kling TTS، /api/tts-cometapi) → بتتجرب بعد كده لو Polly مش
        //       متاحة، لكل الطلاب برضه (مش بس Premium).
        //   الطالب Premium (premium_voice مفعّلة)?
        //     └─(1) Gemini TTS المباشر (/api/tts-gemini بمفتاحنا احنا) → أعلى جودة، لكن
        //           حصته محدودة جدًا على الخطة المجانية (3 طلبات/دقيقة، 15/يوم لكل
        //           الموقع). بنطلبه بوضع geminiOnly عشان نعرف فورًا لو فشل بدل ما ننتظر
        //           السيرفر يجرب صوت احتياطي إحنا مش هنستخدمه أصلاً.
        //   كل المستخدمين (Premium وعادي) بيوصلوا هنا لو الطبقة اللي فوق مش موجودة/فشلت:
        //     └─(2) Edge TTS (/api/tts-edge) → نفس كتالوج أصوات Azure Neural بالظبط
        //           (سلمى/شاكر/زارية/حامد)، مجاني وغير محدود، من غير أي مفتاح API.
        //           غير رسمية من مايكروسوفت فمش مضمونة الاستقرار 100%، فهي أولوية
        //           لكن مش الاعتماد الوحيد.
        //     └─(3) Azure Neural TTS الرسمي (/api/tts-neural) → صوت رسمي واقعي كويس،
        //           محتاج AZURE_SPEECH_KEY ومحدود بـ 500 ألف حرف/شهر. شبكة أمان لو
        //           Edge TTS فشلت.
        //     └─(4) Google Translate TTS (/api/tts) → أقل جودة (صوت آلي واضح لكن مش طبيعي)
        //           لكنه مضمون الشغل دايمًا من غير أي مفتاح API خالص، فهو "شبكة الأمان"
        //           النهائية اللي التطبيق بيرجعلها لو كل حاجة تانية فشلت.
        //
        // ملاحظة مهمة: المستخدم العادي (مش Premium) بيتخطى الطبقة (1) تمامًا ومبيكلمش
        // Gemini خالص لصوت — بيبدأ مباشرة من (2)، فتجربته متأثرتش ولا اتغيّرت بأي شكل.
        //
        // ⚠️ Puter.js (طبقة وسيطة كانت هنا بين Gemini وAzure) اتشالت بالكامل بطلب صريح —
        // مبقاش فيه أي استدعاء لـ js.puter.com ولا لـ window.puter في التطبيق ده خالص.
        // ====================================================================================
        // ====================================================================================
        // Prefetch cache: بمجرد ما رد البوت يخلص كتابة (finalizeBotMessage)، بنبدأ نجيب
        // الصوت بتاعه فورًا في الخلفية من غير ما ننتظر الطالب يدوس زرار "استمع" أصلاً.
        // لما الطالب يدوس الزرار بعد كده، الصوت غالبًا يكون خلص تحميل بالفعل فيشتغل
        // فورًا من الكاش (Blob) من غير أي وقت تحميل ظاهر — الصوت لسه هو نفسه (Neural/Gemini
        // الطبيعي زي ما هو، مفيش أي تغيير في المصدر أو الجودة)، بس بقى بيتحمّل بدري.
        // الكاش مربوط بـ msg.id، وبيتصفّى تلقائيًا لو الطلب فشل عشان محاولة يدوية بعدين
        // (زرار الاستماع نفسه) تقدر تتصرف عادي من غير ما تفضل عالقة على فشل قديم.
        // ====================================================================================
        const ttsPrefetchCache = new Map(); // msg.id -> Promise<Blob>

        // ====================================================================================
        // كاش دائم للصوت (IndexedDB) — الكاش القديم (ttsPrefetchCache فوق) بيتصفّر لما
        // الصفحة تتقفل أو تتعمل reload، فلو الطالب فتح نفس المحادثة تاني وداس "استمع" على
        // رد قراه قبل كده، كان بيطلب الصوت من Azure/Gemini من جديد بالمجان — استهلاك كوتة
        // من غير أي فايدة حقيقية لإن الصوت هو نفسه بالظبط. الكاش ده بيخزّن الـ Blob على
        // جهاز الطالب نفسه (IndexedDB، مش السيرفر) مربوط بـ hash(النص + الصوت المختار)،
        // فأي إعادة استماع لنفس الرد — حتى بعد يوم أو reload — بتيجي فورًا من غير أي طلب
        // شبكة خالص. الكاش محدود بعدد أقصى من العناصر (الأقدم بيتشال أول ما نوصل للحد).
        // ====================================================================================
        const TTS_IDB_NAME = 'chatx-tts-cache';
        const TTS_IDB_STORE = 'audio';
        const TTS_IDB_MAX_ENTRIES = 150;
        let ttsIdbPromise = null;

        function openTtsIdb() {
            if (ttsIdbPromise) return ttsIdbPromise;
            ttsIdbPromise = new Promise((resolve, reject) => {
                if (!window.indexedDB) { reject(new Error('no-indexeddb')); return; }
                const req = indexedDB.open(TTS_IDB_NAME, 1);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(TTS_IDB_STORE)) {
                        db.createObjectStore(TTS_IDB_STORE, { keyPath: 'key' });
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            }).catch(err => { ttsIdbPromise = null; throw err; });
            return ttsIdbPromise;
        }

        async function ttsHashKey(text, voice) {
            const input = voice + '::' + text;
            try {
                const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
                return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                // بيئة من غير crypto.subtle (نادر) — مفتاح أبسط أقل أمانًا لكن كافي هنا
                let h = 0;
                for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
                return 'k' + h;
            }
        }

        async function ttsIdbGet(key) {
            try {
                const db = await openTtsIdb();
                return await new Promise((resolve) => {
                    const tx = db.transaction(TTS_IDB_STORE, 'readonly');
                    const req = tx.objectStore(TTS_IDB_STORE).get(key);
                    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
                    req.onerror = () => resolve(null);
                });
            } catch (e) { return null; }
        }

        async function ttsIdbSet(key, blob) {
            try {
                const db = await openTtsIdb();
                await new Promise((resolve) => {
                    const tx = db.transaction(TTS_IDB_STORE, 'readwrite');
                    tx.objectStore(TTS_IDB_STORE).put({ key, blob, ts: Date.now() });
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                });
                await ttsIdbPrune();
            } catch (e) { /* الكاش الدائم اختياري — أي فشل هنا ميوقفش تشغيل الصوت نفسه */ }
        }

        async function ttsIdbPrune() {
            try {
                const db = await openTtsIdb();
                const tx = db.transaction(TTS_IDB_STORE, 'readonly');
                const countReq = tx.objectStore(TTS_IDB_STORE).count();
                countReq.onsuccess = async () => {
                    if (countReq.result <= TTS_IDB_MAX_ENTRIES) return;
                    const db2 = await openTtsIdb();
                    const tx2 = db2.transaction(TTS_IDB_STORE, 'readwrite');
                    const store = tx2.objectStore(TTS_IDB_STORE);
                    const cursorReq = store.openCursor();
                    let toDelete = countReq.result - TTS_IDB_MAX_ENTRIES;
                    cursorReq.onsuccess = () => {
                        const cursor = cursorReq.result;
                        if (cursor && toDelete > 0) {
                            store.delete(cursor.primaryKey);
                            toDelete--;
                            cursor.continue();
                        }
                    };
                };
            } catch (e) { /* تنظيف اختياري، مش مشكلة لو فشل */ }
        }

        // الصوت المختار من الإعدادات (يتخزن في localStorage) — افتراضيًا "سلمى" (مصري).
        function getSelectedTtsVoice() {
            return localStorage.getItem('chatx_tts_voice') || 'salma';
        }
        function setSelectedTtsVoice(voiceKey) {
            localStorage.setItem('chatx_tts_voice', voiceKey);
            syncTtsVoiceOptionsUI();
        }
        function syncTtsVoiceOptionsUI() {
            const current = getSelectedTtsVoice();
            document.querySelectorAll('#ttsVoiceOptions .tts-voice-opt').forEach(label => {
                const radio = label.querySelector('input[type="radio"]');
                const isActive = label.dataset.voice === current;
                if (radio) radio.checked = isActive;
                label.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
                label.style.background = isActive ? 'var(--bg-glass)' : 'transparent';
            });
        }
        document.addEventListener('DOMContentLoaded', () => {
            syncTtsVoiceOptionsUI();
            document.querySelectorAll('#ttsVoiceOptions .tts-voice-opt').forEach(label => {
                label.addEventListener('click', () => setSelectedTtsVoice(label.dataset.voice));
            });
        });

        // ثيم "كليني هادي" — overlay اختياري فوق الوضع الليلي/النهاري العادي (زي ثيم
        // Premium الذهبي بالظبط)، متخزن في localStorage ومستقل تمامًا عنه.
        function getSelectedColorway() {
            return localStorage.getItem('chatx_colorway') || 'default';
        }
        function setSelectedColorway(colorway) {
            localStorage.setItem('chatx_colorway', colorway);
            document.body.classList.toggle('clinical-theme-on', colorway === 'clinical');
            syncColorwayOptionsUI();
        }
        function syncColorwayOptionsUI() {
            const current = getSelectedColorway();
            document.querySelectorAll('#colorwayOptions .colorway-opt').forEach(label => {
                const radio = label.querySelector('input[type="radio"]');
                const isActive = label.dataset.colorway === current;
                if (radio) radio.checked = isActive;
                label.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
                label.style.background = isActive ? 'var(--bg-glass)' : 'transparent';
            });
        }
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.toggle('clinical-theme-on', getSelectedColorway() === 'clinical');
            syncColorwayOptionsUI();
            document.querySelectorAll('#colorwayOptions .colorway-opt').forEach(label => {
                label.addEventListener('click', () => setSelectedColorway(label.dataset.colorway));
            });
        });

        function stripMarkdownForSpeech(text) {
            return (text || '')
                .replace(/```[\s\S]*?```/g, ' ')
                .replace(/[*_#>`~\-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // بترجع Promise<Blob> — من الكاش لو موجود ولسه شغال، أو بتبدأ طلب جديد وتسجّله
        // في الكاش عشان أي حد تاني (الزرار نفسه، أو تحميل مستقبلي) يستخدم نفس النتيجة
        // بدل ما يطلب الصوت مرتين لنفس الرسالة.
        function getCachedOrFetchTts(msgId, plainText) {
            if (msgId && ttsPrefetchCache.has(msgId)) {
                return ttsPrefetchCache.get(msgId);
            }
            const promise = fetchTtsAudioBlob(plainText);
            if (msgId) {
                ttsPrefetchCache.set(msgId, promise);
                // فشل الطلب؟ نشيله من الكاش عشان محاولة تانية (يدوية أو تلقائية) تقدر تعيد المحاولة
                // بدل ما تفضل واقفة على نفس الخطأ القديم للأبد.
                promise.catch(() => { if (ttsPrefetchCache.get(msgId) === promise) ttsPrefetchCache.delete(msgId); });
            }
            return promise;
        }

        // بتتنادى تلقائيًا لما رد البوت يخلص (مش لما الطالب يدوس زرار) — بتجيب الصوت في
        // الخلفية بصمت من غير ما تأثر على أي حاجة تانية في الشاشة، وبتتجاهل تمامًا لو
        // فشلت (هتتعاد المحاولة عادي لما الطالب يدوس الزرار بنفسه).
        function prefetchTtsAudio(msg) {
            if (!msg || msg.role !== 'bot' || !msg.id || !msg.content) return;
            if (ttsPrefetchCache.has(msg.id)) return;
            const plain = stripMarkdownForSpeech(msg.content);
            if (!plain) return;
            getCachedOrFetchTts(msg.id, plain).catch(() => {}); // بصمت — الزرار هو اللي هيبلّغ المستخدم لو فشل فعليًا
        }

        async function fetchTtsAudioBlob(text) {
            const voiceKey = getSelectedTtsVoice();

            // كاش دائم أولاً: نفس النص + نفس الصوت المختار قبل كده على الجهاز ده؟ رجّعه
            // فورًا من غير أي طلب شبكة (يفيد في إعادة سماع نفس الرد بعد reload أو في يوم تاني).
            const idbKey = await ttsHashKey(text, voiceKey);
            const cachedBlob = await ttsIdbGet(idbKey);
            if (cachedBlob) return cachedBlob;

            // (-1) Amazon Polly — الطبقة الأولى فعليًا دلوقتي، بتتجرب لكل الطلاب قبل أي
            // حاجة تانية. لو مفاتيح AWS مش مضبوطة أو الطلب فشل، بنكمل بصمت لـ CometAPI
            // وبعدين لباقي الطبقات القديمة من غير ما الطالب يحس بأي فرق (شوف خطوات
            // الإعداد في تعليق أعلى api/tts-polly.js).
            try {
                const pollyRes = await fetch('/api/tts-polly', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                if (pollyRes.ok) {
                    const blob = await pollyRes.blob();
                    ttsIdbSet(idbKey, blob);
                    return blob;
                }
            } catch (err) { /* Polly مش متاحة دلوقتي — نكمل عادي للطبقات الجاية */ }

            // (0) CometAPI (Kling TTS) — الطبقة الأولى اللي بتتحاول لكل الطلاب، مش بس
            // Premium. دي أول صوت هيرد فعليًا لو مفتاح COMETAPI_API_KEY مضبوط على
            // السيرفر (Environment Variables أو من صفحة admin-apikeys.html). لو المفتاح
            // مش مضبوط أو الطلب فشل لأي سبب، بنكمل تلقائيًا وبصمت لباقي الطبقات القديمة
            // (Gemini/Edge/Azure/Google) من غير ما الطالب يحس بأي فرق.
            try {
                const cometRes = await fetch('/api/tts-cometapi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, voice_language: 'ar' })
                });
                if (cometRes.ok) {
                    const blob = await cometRes.blob();
                    ttsIdbSet(idbKey, blob);
                    return blob;
                }
            } catch (err) { /* CometAPI مش متاحة دلوقتي — نكمل عادي للطبقات الجاية */ }

            if (hasPremium('premium_voice')) {
                reportFeatureUsage('premium_voice');
                try {
                    const res = await fetch('/api/tts-gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, geminiOnly: true }) });
                    if (res.ok) {
                        const blob = await res.blob();
                        ttsIdbSet(idbKey, blob);
                        return blob;
                    }
                    // الطبقة (1) رجّعت خطأ من السيرفر (مش استثناء شبكة) — ده أكتر سبب شائع
                    // لصوت Gemini اللي "مبيجيش خالص" مع إن الميزة مفعّلة: مفتاح API غلط/منتهي،
                    // أو الموديل رافض الطلب، أو الكوتة خلصت. كنا بنتجاهل التفاصيل دي بصمت
                    // قبل كده فمفيش طريقة تعرف السبب الحقيقي — دلوقتي بتتسجل في الـ console.
                    try {
                        const errBody = await res.clone().json().catch(() => null);
                        console.error('Gemini TTS المباشر فشل:', res.status, errBody || (await res.text().catch(() => '')));
                    } catch (logErr) { console.error('Gemini TTS المباشر فشل بحالة:', res.status); }
                } catch (err) {
                    console.error('Gemini TTS: تعذر الوصول للـ endpoint خالص', err);
                    /* الطبقة (1) فشلت — نكمل عادي للطبقة (2) */
                }
            }
            // (2) Edge TTS — مجاني وغير محدود، نفس كتالوج أصوات Azure الرسمي بالظبط
            // (سلمى/شاكر/زارية/حامد) لكن من غير سقف الـ 500 ألف حرف شهريًا. لو فشلت
            // (نادر — الخدمة مش رسمية) بنكمل فورًا لطبقة Azure الرسمية تحت كشبكة أمان.
            try {
                const res = await fetch('/api/tts-edge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: voiceKey }) });
                if (res.ok) {
                    const blob = await res.blob();
                    ttsIdbSet(idbKey, blob);
                    return blob;
                }
            } catch (err) { /* الطبقة (2) فشلت — نكمل للطبقة (3) */ }
            try {
                const res = await fetch('/api/tts-neural', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: voiceKey }) });
                if (res.ok) {
                    const blob = await res.blob();
                    ttsIdbSet(idbKey, blob);
                    return blob;
                }
            } catch (err) { /* الطبقة (3) فشلت — نكمل للطبقة (4) الأخيرة والمضمونة */ }
            const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang: 'ar' }) });
            if (!res.ok) throw new Error('tts-request-failed'); // الطبقة (4) نفسها فشلت — هنا بس نستسلم فعليًا
            const blob = await res.blob();
            ttsIdbSet(idbKey, blob); // صوت Google Translate برضه بيتكاش عشان مايتطلبش تاني لنفس النص
            return blob;
        }

        // بتتنادى لما المستخدم يدوس زرار "استمع" (🔊) تحت أي رسالة رد من الذكاء الاصطناعي
        // في المحادثة العادية. بتنضّف النص من رموز الماركداون الأول (عشان الصوت ميقولش
        // "نجمة نجمة" أو يقرا رموز التنسيق)، وبعدين تستخدم fetchTtsAudioBlob فوق عشان
        // تجيب الصوت الفعلي (سواء Gemini للمشتركين أو السلسلة العادية للباقي).
        async function speakText(msgOrText, btn) {
            // بيقبل الرسالة كاملة (عشان نستخدم msg.id مع كاش الـ prefetch) أو نص عادي
            // (توافقًا مع أي استدعاء قديم كان بيبعت نص مباشر).
            const isMsgObject = msgOrText && typeof msgOrText === 'object';
            const text = isMsgObject ? msgOrText.content : msgOrText;
            const msgId = isMsgObject ? msgOrText.id : null;

            const wasThisBtn = currentSpeakBtn === btn;
            stopSpeaking();
            if (wasThisBtn) return;

            const plain = stripMarkdownForSpeech(text);
            if (!plain) { showToast('لا يوجد نص لقراءته', 'error'); return; }

            const myToken = ++speakToken;
            currentSpeakBtn = btn;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.classList.add('speaking');

            try {
                // لو الصوت اتحمّل بالفعل في الخلفية (prefetchTtsAudio) وقت ما الرد كان
                // بيتكتب، الـ Promise هنا يكون خلص أو قرب يخلص، فالتشغيل بيحس إنه "فوري"
                // من غير أي تحميل ظاهر للطالب.
                const blob = await getCachedOrFetchTts(msgId, plain);
                if (myToken !== speakToken) return; // stopped/replaced while we were waiting

                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                currentAudio = audio;
                btn.innerHTML = '<i class="fas fa-stop"></i>';
                const cleanup = () => {
                    URL.revokeObjectURL(url);
                    if (currentAudio === audio) {
                        currentAudio = null;
                        if (myToken === speakToken) resetSpeakBtn();
                    }
                };
                audio.onended = cleanup;
                audio.onerror = cleanup;
                await audio.play();
            } catch (err) {
                if (myToken !== speakToken) return;
                speakWithBrowserFallback(plain, btn, myToken);
            }
        }

        // بيحوّل رد المساعد كامل لملف MP3 حقيقي وينزّله على جهاز الطالب (يسمعه بعدين وهو ماشي/أوفلاين)
        async function downloadAsAudio(text, btn) {
            const plain = (text || '')
                .replace(/```[\s\S]*?```/g, ' ')
                .replace(/[*_#>`~\-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (!plain) { showToast('لا يوجد نص لتحويله', 'error'); return; }

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            try {
                const blob = await fetchTtsAudioBlob(plain);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ملخص-صوتي-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 4000);
                showToast('اتحمّل الملف الصوتي ✓', 'success');
            } catch (err) {
                showToast('تعذر إنشاء الملف الصوتي، حاول تاني', 'error');
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        }

        // (e.g. offline, or the free upstream TTS service is temporarily unavailable).
        function speakWithBrowserFallback(plain, btn, myToken) {
            if (!('speechSynthesis' in window)) {
                showToast('تعذّر توليد الصوت، والمتصفح لا يدعم القراءة كبديل', 'error');
                resetSpeakBtn();
                return;
            }
            const utter = new SpeechSynthesisUtterance(plain);
            utter.lang = 'ar-SA';
            const voices = window.speechSynthesis.getVoices();
            const arVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
            if (arVoice) utter.voice = arVoice;
            utter.onend = () => { if (myToken === speakToken) resetSpeakBtn(); };
            utter.onerror = () => { if (myToken === speakToken) resetSpeakBtn(); };

            currentUtterance = utter;
            btn.innerHTML = '<i class="fas fa-stop"></i>';
            window.speechSynthesis.speak(utter);
        }

        // Deletes a bot reply (and anything after it) and asks the current model for a
        // fresh answer to the same conversation up to that point.
        async function regenerateMessage(msgId) {
            if (isGenerating) return;
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;
            const idx = chat.messages.findIndex(m => m.id === msgId);
            if (idx === -1) return;

            stopSpeaking();

            const removed = chat.messages.splice(idx);
            removed.forEach(m => {
                const el = document.getElementById(m.id);
                if (el) el.remove();
            });
            saveData();
            renderPinnedBar(chat);

            if (abortController) abortController.abort();
            abortController = new AbortController();
            isGenerating = true;
            setSendButtonState(true);
            document.getElementById('typingIndicator').classList.add('active');
            scrollToBottom();
            await runGeneration(chat);
        }

        let chats = JSON.parse(localStorage.getItem('sx_chats')) || [];
        let currentChatId = localStorage.getItem('sx_current_chat') || null;
        // رابط سيرفر School X ثابت مش قابل للتعديل من المستخدم
        const FIXED_SCHOOL_API_URL = 'https://schoolx-eta.vercel.app';
        // أول مرة يفتح فيها الطالب الموقع (مفيش إعدادات متخزنة قبل كده)، بنحترم تفضيل نظام
        // تشغيله (فاتح/غامق) بدل ما نفرض الوضع الغامق عليه دايمًا كافتراضي ثابت.
        const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        let settings = JSON.parse(localStorage.getItem('sx_settings')) || { theme: systemPrefersLight ? 'light' : 'dark', backendUrl: '', model: 'auto', schoolApiUrl: FIXED_SCHOOL_API_URL, deepThink: false, deepThinkSpeed: 'deep' };
        if (!settings.deepThinkSpeed) settings.deepThinkSpeed = 'deep'; // توافق مع إعدادات محفوظة قبل إضافة اختيار السرعة
        settings.schoolApiUrl = FIXED_SCHOOL_API_URL; // بنفرضه دايمًا حتى لو كان متخزن قديم مختلف
        // بيانات ربط School X (مشروع منفصل تماماً بدومين ومتغيرات بيئة مختلفة)
        let schoolToken = localStorage.getItem('sx_school_token') || null;

        // ====================== بصمة الجهاز (لكشف مشاركة الحسابات) ======================
        // بتتحسب مرة واحدة وتتخزن محليًا (مش بتتغيّر كل مرة تفتح فيها الصفحة) عشان
        // تفضل ثابتة لنفس الجهاز عبر الوقت — لو حسبناها من الصفر كل مرة، أي تغيير
        // بسيط (فتح نافذة تصفح خفي مثلاً) كان هيدّي بصمة مختلفة ويطلع نتيجة كشف غلط.
        // العناصر المستخدمة كلها مقروءة من غير أي إذن (permission) من المستخدم:
        // دقة الشاشة، عدد أنوية المعالج، المنطقة الزمنية، دعم اللمس، وبصمة Canvas
        // (رسمة بسيطة بتختلف نتيجتها شكليًا حسب كارت الشاشة/التعريفات، معيار قياسي
        // ومعروف لزيادة دقة تمييز الأجهزة عن بعضها).
        async function computeDeviceFingerprint() {
            const cached = localStorage.getItem('sx_device_fp');
            if (cached) return cached;
            try {
                let canvasSig = '';
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200; canvas.height = 40;
                    const ctx = canvas.getContext('2d');
                    ctx.textBaseline = 'top';
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#f60';
                    ctx.fillRect(0, 0, 100, 20);
                    ctx.fillStyle = '#069';
                    ctx.fillText('chatx-fp-🩺', 2, 15);
                    canvasSig = canvas.toDataURL();
                } catch (e) { /* بعض المتصفحات بتمنع Canvas API — مش مشكلة، بنكمل من غيرها */ }

                const parts = [
                    navigator.userAgent || '',
                    navigator.platform || '',
                    navigator.language || '',
                    String(screen.width) + 'x' + String(screen.height) + 'x' + String(screen.colorDepth),
                    String(window.devicePixelRatio || 1),
                    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                    String(navigator.hardwareConcurrency || 0),
                    String(navigator.maxTouchPoints || 0),
                    canvasSig
                ].join('||');

                let hash;
                try {
                    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts));
                    hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
                } catch (e) {
                    // بيئة من غير crypto.subtle (نادر) — هاش أبسط أقل دقة لكن كافي كخط أخير
                    let h = 0;
                    for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) >>> 0;
                    hash = 'k' + h;
                }
                localStorage.setItem('sx_device_fp', hash);
                return hash;
            } catch (e) {
                return 'unknown';
            }
        }
        let schoolUser = JSON.parse(localStorage.getItem('sx_school_user') || 'null');
        // بروفايل الحساب الحالي كامل (فيه isVerified وavatarUrl) — بيتحدّث من /api/me في
        // fetchSchoolProfile، ومستخدم في شارة السايدبار وأفاتار رسايل المستخدم في الشات.
        let currentUserProfile = null;
        let schoolContext = localStorage.getItem('sx_school_context') || '';
        let isGenerating = false;
        let abortController = null;
        let lastSendTime = 0;
        // ====================== Deep Thinking (تفكير عميق) ======================
        // بيتفعّل من زرار "Deep Thinking" جنب صندوق الكتابة. لما يكون شغال، قبل ما نبعت
        // سؤال الطالب للموديل المختار عادي، بنعمل نداء إضافي منفصل لـ Gemini بس عشان
        // "يفكر" فعليًا (تحليل داخلي خطوة بخطوة قبل الإجابة، مش مجرد أنيميشن شكلي) —
        // وبنعرض التفكير ده وهو بيتكتب لحظة بلحظة تحت آخر رسالة، بالظبط زي المواقع
        // الكبيرة. بعد ما يخلص، بنحقن نتيجة التفكير ده في الـ system prompt بتاع
        // الموديل الأصلي (أيًا كان) عشان إجابته النهائية تبقى فعلاً مبنية على تحليل
        // أعمق، مش بس شكل بصري. deepThinkReasoningContext بيتصفّر بعد كل رد.
        let deepThinkReasoningContext = '';
        let deepThinkTimerInterval = null;
        let deepThinkStatusInterval = null;
        // العبارات اللي بتتبدّل مع بعض تحت الرسالة وهو "بيفكر" — بتدّي إحساس إنه فعلاً
        // بيمر بمراحل تفكير حقيقية (فهم السؤال، مراجعة المعلومات، ترتيب الإجابة...) بدل
        // ما تفضل نفس الجملة الثابتة طول الوقت.
        const DEEP_THINK_STATUS_MESSAGES = [
            'جاري التفكير...',
            'بفهم السؤال كويس...',
            'بحلل كل جوانب السؤال...',
            'براجع دقة المعلومات...',
            'بفكر في أفضل طريقة للإجابة...',
            'برتب الأفكار...',
            'قربت أخلص التحليل...'
        ];
        const DEEP_THINK_REASONING_SYSTEM_PROMPT = `إنت دلوقتي في وضع "تفكير عميق" (Deep Thinking) قبل ما تجاوب على سؤال الطالب. مهمتك هنا مش إنك تكتب الإجابة النهائية خالص — مهمتك إنك تكتب تحليلك الداخلي (Reasoning) خطوة بخطوة زي ما بتفكر فعلاً قبل ما تحسم إجابة. اتبع الأسلوب ده بالظبط:
1. افهم السؤال بدقة: إيه المطلوب فعليًا؟ فيه أكتر من جزء أو شرط في السؤال؟
2. لو السؤال طبي/تمريضي أو فيه أكتر من احتمال، فكر في أهم الاحتمالات وقيّم كل واحد بسرعة.
3. تأكد من دقة أي معلومة أو رقم أو خطوة قبل ما تعتمد عليها في الإجابة.
4. حدد أفضل ترتيب وأسلوب لعرض الإجابة النهائية (نقاط، خطوات، جدول، شرح متصل).
اكتب التحليل ده مباشرة كنقاط أو جمل قصيرة متتالية بالعربي المصري، من غير أي مقدمة زي "حاضر" أو "تمام هفكر"، ومن غير ما تكتب الإجابة النهائية الكاملة هنا خالص — تحليل وتفكير بس، مختصر ومركّز (من 5 لـ 10 أسطر بحد أقصى).`;
        // نسخة "سريعة" من نفس الفكرة — لمّا الطالب يختار ⚡ سريع بدل 🧠 عميق: نفس
        // مبدأ المراجعة الداخلية قبل الإجابة، لكن في 2-3 أسطر بس وبدون تفصيل
        // الاحتمالات المتعددة، عشان يبقى أسرع وأرخص من غير ما نلغي فايدة الميزة
        // خالص.
        const DEEP_THINK_REASONING_SYSTEM_PROMPT_QUICK = `إنت دلوقتي في وضع "تفكير سريع" (نسخة أخف من Deep Thinking) قبل ما تجاوب على سؤال الطالب. اكتب مراجعة داخلية مختصرة جدًا (سطرين لـ 3 بالكتير): إيه المطلوب بالظبط، وإيه أهم حاجة لازم تتأكد منها قبل ما تجاوب. من غير مقدمات، ومن غير ما تكتب الإجابة النهائية هنا خالص.`;
        const DEEP_THINK_FINAL_ANSWER_INSTRUCTION = `

وضع "التفكير العميق" (Deep Thinking) مفعّل من الطالب لسؤاله ده: قبل ما تكتب إجابتك، تأكد داخليًا إنك فاهم السؤال بكل جوانبه، مراجع دقة أي معلومة أو رقم هتذكره، وغطّيت أهم الاحتمالات المهمة. جاوب بعمق وتركيز وتنظيم أكتر من العادي، من غير حشو أو إطالة زيادة عن اللزوم.`;
        let recentSendTimestamps = []; // للـ rate limiting: تايم ستامب كل رسالة اتبعتت في آخر دقيقة
        let pendingAttachment = null;
        // فحص الدواء بالكاميرا: نسخة الماسح الحالية، آخر كود متقروء، والصورة الملتقطة قبل التأكيد
        let drugScannerInstance = null;
        let drugScannerActive = false;
        let drugScanDecodedCode = null;
        let drugScanCapturedImage = null; // { base64, mimeType }
        // ====================== Premium ======================
        // مصفوفة مفاتيح المميزات المفعّلة للطالب ده (بييجي من /api/me، مع نسخة محلية
        // مؤقتة في localStorage عشان الواجهة متتلخبطش في اللحظة الأولى قبل أول fetch).
        let myPremiumFeatures = JSON.parse(localStorage.getItem('sx_premium_features') || '[]');
        const PREMIUM_LABELS = {
            premium_ai: { icon: '🧠', title: 'الذكاء الاصطناعي المتقدم (Cerebras / Claude Opus)', desc: 'بيتفتحلك قسم "موديلات Premium" في قايمة الموديلات (Cerebras وClaude Opus)، وتقدر تختار منه أو من الموديلات العامة براحتك، مع حد رسايل أعلى بكتير من الوضع العادي.' },
            premium_mock_exams: { icon: '📝', title: 'امتحانات المحاكاة الشاملة', desc: 'امتحان محاكاة حقيقي من أكتر من فصل مع تقرير أداء مفصل وخطة مذاكرة بعده.' },
            premium_prompts: { icon: '⚡', title: 'مكتبة البرومبتس الذكية', desc: 'برومبتس جاهزة ومُختارة بعناية عشان تطلعلك أفضل نتيجة من المساعد في أي مهمة.' },
            premium_theme: { icon: '👑', title: 'تصميم Chat X الذهبي', desc: 'شكل مميز حصري بألوان ذهبية للمشتركين بس.' },
            premium_drug_library: { icon: '💊', title: 'مكتبة الأدوية الشخصية', desc: 'كل دواء تفحصه بالكاميرا بيتحفظلك تلقائيًا في مكتبة شخصية ترجعلها وقت ما تحب.' },
            premium_clinical_sim: { icon: '🩺', title: 'محاكي المواقف الإكلينيكية', desc: 'حالة مريض واقعية بتتفاعل معاها وتاخد قرارات، وفي الآخر بتاخد تقييم لقراراتك.' },
            premium_lecture_audio: { icon: '🎙️', title: 'ملخص صوتي للمحاضرات', desc: 'سجّل المحاضرة بصوتك، وهيتحول لنص وملخص منظم بالنقاط تلقائيًا.' },
            premium_skills: { icon: '🧩', title: 'مهارات مخصصة (Skills)', desc: 'اعمل مهارات خاصة بيك (تعليمات ثابتة يلتزم بيها المساعد)، وهو يستخدمها تلقائي في ردوده وقت ما تكون مناسبة.' },
            premium_academic_profile: { icon: '📊', title: 'البروفايل الأكاديمي الموحّد', desc: 'كل حاجة عن أدائك (حضور، نتائج امتحانات، واجبات، مخالفات) في شاشة واحدة، بدل ما تكون متفرقة.' },
            premium_german_pro: { icon: '🇩🇪', title: 'German Pro — الألمانية الاحترافية للتمريض', desc: 'مدرّس ألماني ذكي بيبنيلك خطة تعلّم شخصية (أساسيات + محادثات يومية + Fachsprache Pflege/التمريض) ويمشي معاك خطوة بخطوة مع مراجعة مستمرة عشان متنساش.' },
            premium_english_pro: { icon: '🇬🇧', title: 'English Pro — الإنجليزية الاحترافية للتمريض', desc: 'مدرّس إنجليزي ذكي بيبنيلك خطة تعلّم شخصية (أساسيات + محادثات يومية + إنجليزية التمريض/OET-IELTS) مع قاموس طبي وتمريضي وصيدلي كامل، ويمشي معاك خطوة بخطوة.' },
            premium_image_studio: { icon: '🖼️', title: 'استوديو الصور الذكي', desc: 'حلّل أي صورة (صفحة كتاب، رسم تشريحي، جهاز، تحليل) بدقة عالية عن طريق رؤية ذكاء اصطناعي حقيقية — مش OCR بس. وكمان أنشئ أي صورة توضيحية تتخيلها من وصف نصي.' },
            premium_video_sim: { icon: '🎬', title: 'محاكاة الفيديو التفاعلية', desc: 'حوّل أي ملخص أو نص تعليمي لسلسلة فيديو تعليمي قصير بشرائح متتالية.' }
        };
        // الأدمن (type === 'admin' جاية من بيانات School X) عنده كل مميزات Premium تلقائيًا
        // من غير ما يحتاج يفعّلها لنفسه — طبيعي إنه يقدر يجرب أي حاجة بيفعّلها للطلاب.
        // ⚠️ إصلاح: كانت بتتأكد من schoolUser.role (قيمة بتختلف — 'manager' غالبًا للأدمن
        // الحقيقي، مش 'admin' دايمًا)، والصح إنها تتأكد من schoolUser.type اللي هو دايمًا
        // 'admin' لأي حساب أدمن مهما كان الـ role الفرعي بتاعه.
        function hasPremium(key) { return schoolUser?.type === 'admin' || myPremiumFeatures.includes(key); }

        // بدل ما الطالب يشوف رسالة "الميزة دي محتاجة تفعيل من الأدمن" وبس، ده بيديله
        // خيار إنه يبعت طلب تفعيل جاهز للأدمن فورًا (زي رسايل "تواصل مع الأدمن" بالظبط)
        // من غير ما يضطر يروح لقسم الرسايل ويكتب بنفسه. بيتحط باسمه دايمًا (مش مجهول)
        // عشان الأدمن يعرف مين يفعّلها له.
        async function requestPremiumFeatureFromAdmin(featureKey) {
            const meta = PREMIUM_LABELS[featureKey];
            const title = meta ? meta.title : featureKey;
            showToast(`ميزة "${title}" محتاجة تفعيل Premium من الأدمن`, 'error');
            if (!schoolToken) return;
            if (!confirm(`تحب تبعت طلب تفعيل ميزة "${title}" للأدمن دلوقتي؟`)) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({
                        text: `طلب تفعيل ميزة Premium: "${title}" لحسابي، لو ممكن حضرتك تفعّلها.`,
                        anonymous: false,
                        requestType: 'premium_feature',
                        requestFeatureKey: featureKey
                    })
                });
                if (!res.ok) throw new Error('failed');
                showToast('اتبعت طلب التفعيل للأدمن ✓', 'success');
            } catch (e) {
                showToast('تعذر إرسال الطلب — جرب تبعتله من قسم "تواصل مع الأدمن"', 'error');
            }
        }
        let stats = JSON.parse(localStorage.getItem('sx_stats')) || { streak: 0, lastActiveDay: null, todayCount: 0 };
        let recognition = null;
        let isListening = false;

        // ====================== بنك أخطائي الشخصي ======================
        // كل سؤال يغلطه الطالب في أي اختبار (بنك أسئلة أو امتحان محاكاة) بيتجمع هنا
        // تلقائي، عشان يقدر يرجعله ويراجعه لوحده لحد ما يتقنه فعلاً. التخزين محلي
        // بالكامل (localStorage) زي باقي بيانات الطالب في التطبيق ده.
        let mistakesBank = JSON.parse(localStorage.getItem('sx_mistakes_bank')) || [];

        function saveMistakesBank() {
            localStorage.setItem('sx_mistakes_bank', JSON.stringify(mistakesBank));
            updateMistakesBankBadge();
        }

        // هاش بسيط ومتزامن (sync) — مش محتاجين قوة crypto.subtle هنا، مجرد مفتاح
        // ثابت لنفس السؤال عشان منكررش نفس الغلطة في البنك مرتين كسطرين منفصلين.
        function simpleHashKey(str) {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
            return 'q' + h.toString(36);
        }

        function mistakeIdFor(q, chapterName) {
            return simpleHashKey(`${chapterName}::${q.type}::${q.text}`);
        }

        // بتتنادى من tryGradeActiveQuiz لكل سؤال غلط فيه الطالب.
        function addMistakeToBank(q, chapterName, studentAnswer) {
            const id = mistakeIdFor(q, chapterName);
            const existing = mistakesBank.find(m => m.id === id);
            if (existing) {
                existing.timesWrong += 1;
                existing.lastWrongAnswer = studentAnswer;
                existing.lastWrongAt = Date.now();
            } else {
                mistakesBank.push({
                    id,
                    chapterName: chapterName || 'غير محدد',
                    type: q.type,
                    text: q.text,
                    options: q.options || null,
                    correct: q.correct !== undefined ? q.correct : null,
                    completion: q.completion || null,
                    lastWrongAnswer: studentAnswer,
                    timesWrong: 1,
                    lastWrongAt: Date.now()
                });
            }
            saveMistakesBank();
        }

        // بتتنادى لما الطالب يجاوب صح على سؤال أثناء "مراجعة بنك الأخطاء" — بيتشال
        // من البنك لأنه بقى متقن له (إلا لو غلط فيه تاني، وقتها هيتضاف تاني عادي).
        function removeMistakeFromBank(id) {
            mistakesBank = mistakesBank.filter(m => m.id !== id);
            saveMistakesBank();
        }

        // ====================== كاشف الأخطاء الذكي في الشات العادي ======================
        // بتتنادى بعد أي رد ناجح من المساعد في الشات العادي (مش في اختبار رسمي —
        // ده متغطّى أصلاً بـ tryGradeActiveQuiz). بتبعت آخر تبادل (سؤال الطالب + رد
        // المساعد) لنداء منفصل تمامًا وصامت للذكاء الاصطناعي، بمهمة واحدة بس: يحدد
        // هل الطالب قال إجابة/معلومة علمية غلط ولا لأ، ويرجع JSON بس. النداء ده
        // "fire and forget" زي submitToSharedQuestionBank بالظبط: مش بيوقف ولا بيلمس
        // رد الشات المعروض للطالب خالص، وأي فشل فيه بيتجاهل بصمت.
        //
        // ⚠️ حدود مهمة لازم تعرفها: الكشف ده تقديري بالذكاء الاصطناعي مش تصحيح برمجي
        // 100% زي بنك الأسئلة الرسمي — ممكن يفوّت غلطة أو (نادرًا) يسجل حاجة مش غلطة
        // فعلية. لو حصل كده كتير، الطالب يقدر يمسح أي سطر غلط من "بنك أخطائي" يدويًا.
        async function detectMistakeInBackground(userText, botMsg) {
            try {
                if (!settings.backendUrl) return; // مفيش باك إند متظبط، تجاهل بصمت
                const cleanUserText = String(userText || '').trim();
                if (cleanUserText.length < 4) return; // تحية/شكر/رسايل قصيرة جدًا مش مفيد نحللها
                const botText = (botMsg && botMsg.role === 'bot') ? stripMarkdownForSpeech(botMsg.content).slice(0, 3000) : '';
                if (!botText) return;

                const classifierPrompt = `مهمتك الوحيدة دلوقتي: تحليل التبادل ده بين طالب تمريض ومساعد أكاديمي، وتحديد هل الطالب ذكر إجابة أو معلومة علمية/دراسية غلط (سواء جاوب على سؤال بشكل غلط، أو قال معلومة طبية/تمريضية غلط وصححها المساعد في رده).

رسالة الطالب:
"""${cleanUserText.slice(0, 1500)}"""

رد المساعد:
"""${botText}"""

رد فقط بكائن JSON صالح واحد، من غير أي نص أو ماركداون أو تعليق قبله أو بعده، بالشكل ده بالظبط:
{"mistake": true, "question": "نص السؤال أو النقطة العلمية المختصرة", "studentAnswer": "إجابة الطالب كما قالها", "correctAnswer": "الإجابة الصحيحة كما وضحها المساعد", "chapter": "اسم المادة أو الموضوع لو واضح، وإلا اتركه فاضي"}

لو مفيش غلطة علمية واضحة (كلام عادي، سلام، شكر، سؤال عام من غير إجابة غلط، أو المساعد لسه بيشرح من غير ما الطالب يجاوب حاجة أصلاً)، رجّع بالظبط: {"mistake": false}`;

                const response = await fetch(`${settings.backendUrl}/api/gemini`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: classifierPrompt }] }] })
                });
                if (!response.ok || !response.body) return;

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '', fullText = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            const piece = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (piece) fullText += piece;
                        } catch (e) {}
                    }
                }
                if (!fullText.trim()) return;

                // احتياطًا لو الموديل حاطط ```json``` حوالين الرد رغم التعليمات
                const cleaned = fullText.trim().replace(/^```json\s*|^```\s*|```\s*$/g, '').trim();
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (!jsonMatch) return;
                const parsed = JSON.parse(jsonMatch[0]);
                if (!parsed || parsed.mistake !== true || !parsed.question || !parsed.correctAnswer) return;

                const q = { type: 'chat', text: String(parsed.question).slice(0, 400), correct: String(parsed.correctAnswer).slice(0, 400) };
                const chapter = (parsed.chapter && String(parsed.chapter).trim()) || 'من الشات';
                addMistakeToBank(q, chapter, String(parsed.studentAnswer || cleanUserText).slice(0, 400));
            } catch (e) {
                console.error('detectMistakeInBackground error:', e); // فشل صامت — متأثرش على تجربة الشات الأساسية
            }
        }

        function updateMistakesBankBadge() {
            const badge = document.getElementById('mistakesBankBadge');
            if (!badge) return;
            badge.style.display = mistakesBank.length ? 'flex' : 'none';
            badge.textContent = mistakesBank.length > 99 ? '99+' : mistakesBank.length;
        }

        function openMistakesBankModal() {
            renderMistakesBankList();
            openModal('mistakesBankModal');
        }

        function renderMistakesBankList() {
            const box = document.getElementById('mistakesBankList');
            const empty = document.getElementById('mistakesBankEmpty');
            const reviewBtn = document.getElementById('mistakesBankReviewBtn');
            if (!box) return;
            if (!mistakesBank.length) {
                box.innerHTML = '';
                if (empty) empty.style.display = 'block';
                if (reviewBtn) reviewBtn.style.display = 'none';
                return;
            }
            if (empty) empty.style.display = 'none';
            if (reviewBtn) reviewBtn.style.display = 'block';

            // بنجمعهم حسب الفصل عشان يبقوا منظمين وسهل يعرف يذاكر إيه بالظبط
            const byChapter = {};
            mistakesBank.slice().sort((a, b) => b.lastWrongAt - a.lastWrongAt).forEach(m => {
                (byChapter[m.chapterName] = byChapter[m.chapterName] || []).push(m);
            });

            const typeLabel = { mcq: 'اختيار من متعدد', truefalse: 'صح / خطأ', complete: 'إكمال الفراغ', chat: 'من محادثة عادية' };
            let html = '';
            Object.entries(byChapter).forEach(([chapter, items]) => {
                html += `<div style="font-size:12px;font-weight:800;color:var(--text-2);margin:10px 0 6px;display:flex;align-items:center;justify-content:space-between;">
                    <span>${escapeHtml(chapter)} (${items.length})</span>
                    <button class="btn-calc" style="width:auto;padding:4px 10px;font-size:11px;background:var(--bg-2);color:var(--text-2);" onclick="startMistakeReview('${escapeHtml(chapter).replace(/'/g, "\\'")}')"><i class="fas fa-rotate"></i> راجع الفصل ده بس</button>
                </div>`;
                items.forEach(m => {
                    const correctText = m.type === 'complete' ? m.completion : (m.type === 'truefalse' ? (m.correct ? 'صح' : 'خطأ') : m.correct);
                    html += `
                    <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius: var(--radius-md);padding:10px 12px;margin-bottom:8px;">
                        <div style="font-size:12px;color:var(--text-3);margin-bottom:4px;">${typeLabel[m.type] || m.type} · غلط فيه ${m.timesWrong} مرة</div>
                        <div style="font-size:13px;font-weight:600;margin-bottom:6px;line-height:1.6;">${escapeHtml(m.text)}</div>
                        <div style="font-size:12px;color:var(--success);margin-bottom:8px;">الإجابة الصح: ${escapeHtml(String(correctText))}</div>
                        <button class="btn-calc" style="width:auto;padding:4px 10px;font-size:11px;background:var(--bg-2);color:var(--text-2);" onclick="removeMistakeFromBank('${m.id}'); renderMistakesBankList();"><i class="fas fa-check"></i> اتقنتها، امسحها</button>
                    </div>`;
                });
            });
            box.innerHTML = html;
        }

        // بيبني اختبار من أسئلة البنك (كلها أو فصل معين بس) ويبعته في الشات، بنفس
        // آلية generateBankQuiz بالظبط عشان يتصحح بنفس نظام tryGradeActiveQuiz.
        function startMistakeReview(chapterFilter) {
            const pool = chapterFilter ? mistakesBank.filter(m => m.chapterName === chapterFilter) : mistakesBank.slice();
            if (!pool.length) { showToast('مفيش أسئلة في بنك الأخطاء دلوقتي', 'error'); return; }

            const picked = shuffleArray(pool.map(m => ({ ...m })));
            activeQuiz = { chapterName: chapterFilter ? chapterFilter : 'مراجعة بنك الأخطاء', questions: picked, isMistakeReview: true };

            let msg = `🧠 **مراجعة بنك أخطائي** (${picked.length} سؤال)\n\n`;
            picked.forEach((q, i) => {
                if (q.type === 'mcq') {
                    msg += `**${i + 1}. [اختيار من متعدد] ${q.text}**\n`;
                    (q.options || []).forEach(o => { msg += `${o}\n`; });
                } else if (q.type === 'truefalse') {
                    msg += `**${i + 1}. [صح / خطأ] ${q.text}**\n`;
                } else if (q.type === 'complete') {
                    msg += `**${i + 1}. [إكمال] ${q.text}**\n`;
                } else if (q.type === 'chat') {
                    msg += `**${i + 1}. [من محادثة سابقة] ${q.text}**\n`;
                }
                msg += '\n';
            });
            msg += `---\nجاوب بنفس شكل \`رقم: إجابة\` زي أي اختبار. أي سؤال تجاوبه صح هيتشال من بنك أخطائك تلقائي.`;

            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                const botMsg = { role: 'bot', content: msg, source: 'local', timestamp: Date.now(), id: `msg-${Date.now()}-mistakereview` };
                chat.messages.push(botMsg);
                appendMessageToDOM(botMsg);
                saveData();
            }
            closeModal('mistakesBankModal');
            showToast('اتعمل اختبار من بنك أخطائك — جاوب عليه في الشات', 'success');
        }

        window.onload = () => {
            applyTheme(settings.theme);
            if (settings.model) document.getElementById('modelSelect').value = settings.model;
            applyDeepThinkBtnState();
            if (chats.length === 0) createNewChat();
            else {
                if (!currentChatId || !chats.find(c => c.id === currentChatId)) currentChatId = chats[0].id;
                renderChatList();
                renderChat(currentChatId);
            }
            renderStats();
            updateMistakesBankBadge();
            maybeShowTvNewDot();
            initSpeechRecognition();
            const backendInput = document.getElementById('backendUrlInput');
            if (backendInput) backendInput.value = settings.backendUrl || '';
            const schoolInput = document.getElementById('schoolApiUrlInput');
            if (schoolInput) schoolInput.value = settings.schoolApiUrl || '';
            const duaToggle = document.getElementById('duaReminderToggle');
            if (duaToggle) duaToggle.checked = settings.duaReminders !== false;
            updateSchoolLoginUI();
            if (schoolToken) {
                fetchSchoolProfile(true); // حدّث بيانات الطالب/الأدمن من السيرفر (فريش دايمًا)
                // تذكير لطيف عند فتح الصفحة: لو الجهاز ده بيتشارك بين أكتر من طالب، سهل حد
                // ينسى إنه لسه مسجل دخول بحساب زميله من المرة اللي فاتت.
                setTimeout(() => {
                    if (schoolUser) showToast(`مسجّل دخول باسم ${schoolUser.fullName || schoolUser.username} — مش إنت؟ سجّل خروج من ⚙️`, 'success');
                }, 900);
            }
            populateBankSubjects();
            applyPremiumGatesUI(); // نطبّق الحالة المتخزنة محليًا فورًا، وfetchSchoolProfile هيحدّثها لو اتغيرت

            if (!localStorage.getItem('sx_onboarded')) {
                openModal('onboardingModal');
            } else if (settings.duaReminders !== false) {
                setTimeout(() => showDuaReminder(), 2200); // تظهر أول ما الصفحة تفتح (بعد الترحيب لو أول مرة)
            }

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            }

            // بانر توجيه لطلاب الأيفون (تثبيت PWA) — لازم قبل استدعاء enablePushNotifications
            // القادم تحت، عشان أكبر عدد ممكن يعرف السبب الحقيقي من أول لحظة، مش بس اللي
            // هيدوس على زرار "تفعيل الإشعارات" في الإعدادات بنفسه.
            setTimeout(() => maybeShowIOSInstallBanner(), 3500);

            // تلميح "جديد" لميزة الحسابات الموثقة — مرة واحدة بس لكل طالب، وبعد ما
            // يشوف الشاشة ويستقر عليها (مش أول نص ثانية) عشان الظهور يكون سلس ومحترف.
            setTimeout(() => maybeShowVerifiedAccountsTip(), 2600);

            // لو الطالب سبق ووافق على الإشعارات في جلسة قبل كده، لازم نعيد تسجيل هاندلر
            // الفوجراوند (onMessage) من جديد كل مرة يفتح فيها الصفحة — لأنه بيعيش في ذاكرة
            // الصفحة بس ومش بيفضل محفوظ بعد الريفريش، حتى لو الموافقة والتوكن نفسهم متسجلين.
            if (schoolToken && window.Notification && Notification.permission === 'granted') {
                enablePushNotifications();
            }
        };

        function closeOnboarding() {
            localStorage.setItem('sx_onboarded', '1');
            closeModal('onboardingModal');
            if (settings.duaReminders !== false) setTimeout(() => showDuaReminder(), 1200);
        }

        // ====================== تنبيه الواجبات القريب ميعادها ======================
        // بنخزن آخر تنبيه اتعرض في localStorage (مش متغير في الذاكرة بس) عشان لو الطالب قفل
        // وفتح المتصفح كذا مرة في نفس اليوم، مايشوفش نفس تنبيه الواجب من كل فتح — يشوفه مرة
        // واحدة في اليوم لنفس مجموعة الواجبات، وتاني يوم لو لسه المواعيد قريبة يفتكّره تاني.
        function homeworkAlertStorageKey() {
            const d = new Date();
            return `sx_hw_alert_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }
        function checkUpcomingHomeworkAlert(pendingHomework) {
            if (!pendingHomework || !pendingHomework.length) return;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const urgent = pendingHomework.filter(h => {
                const d = new Date(h.deadline); d.setHours(0, 0, 0, 0);
                const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));
                h._diffDays = diffDays;
                return diffDays >= 0 && diffDays <= 2;
            });
            if (!urgent.length) return;
            const key = urgent.map(h => `${h.title}-${h.deadline}`).sort().join('|');
            const storageKey = homeworkAlertStorageKey();
            if (localStorage.getItem(storageKey) === key) return;
            localStorage.setItem(storageKey, key);
            showHomeworkAlert(urgent);
        }

        function dayLabel(diff) {
            if (diff === 0) return 'النهاردة آخر ميعاده! ⏰';
            if (diff === 1) return 'باقيله يوم واحد بس';
            return `باقيله ${diff} يوم`;
        }

        function showHomeworkAlert(urgentList) {
            const container = document.getElementById('duaOverlayContainer');
            if (!container || duaReminderShowing) return; // منزحمش على تذكير تاني لو ظاهر دلوقتي
            // لو تلميح "الحسابات الموثقة" لسه ظاهر، منستناش نغطّي عليه بأوفرلاي كامل
            // الشاشة — بنأجّل التنبيه شوية بدل ما نضيّع فرصة الطالب إنه يشوف التلميح.
            if (isVerifiedTipShowing()) { setTimeout(() => showHomeworkAlert(urgentList), 1500); return; }
            duaReminderShowing = true;

            const itemsHTML = urgentList.map(h => `
                <div class="dua-text" style="text-align:right;">
                    <b>${h.title}</b> <span style="color:#f4c542;">(${h.chapterName})</span><br>
                    <span style="font-size:12.5px;color:rgba(255,255,255,.75);">${dayLabel(h._diffDays)} — آخر ميعاد: ${h.deadline}</span>
                </div>`).join('');

            container.innerHTML = `
                <div class="dua-overlay" id="duaOverlayEl">
                    <div class="dua-card" style="background:linear-gradient(160deg, #3a2b0d 0%, #4b3a11 45%, #5c4a1a 100%); border-color: rgba(244,197,66,.4);">
                        <button class="dua-close" aria-label="إغلاق التذكير" onclick="closeDuaReminder()"><i class="fas fa-times"></i></button>
                        <div class="dua-icon" style="color:#f4c542;text-shadow:0 0 20px rgba(244,197,66,.5);"><i class="fas fa-triangle-exclamation"></i></div>
                        <div class="dua-title">واجب قربّ ميعاده ⏳</div>
                        <div class="dua-sub">متنساش تسلّمه قبل ما يفوتك</div>
                        ${itemsHTML}
                        <div class="dua-extra">
                            وفّقك الله وسهّل عليك المذاكرة 🤍
                        </div>
                    </div>
                </div>`;

            const overlayEl = document.getElementById('duaOverlayEl');
            requestAnimationFrame(() => overlayEl.classList.add('show'));
            const t = setTimeout(() => closeDuaReminder(), 12000);
            duaReminderTimers.push(t);
        }

        let duaReminderShowing = false;
        let duaReminderTimers = [];
        const DUA_PHASES = [
            {
                label: '🕌 الصلاة على النبي ﷺ',
                text: 'اللهم صلِّ وسلِّم وبارك على سيدنا محمد، وعلى آله وصحبه أجمعين'
            },
            {
                label: '🤲 الاستغفار',
                text: 'أستغفر الله العظيم الذي لا إله إلا هو، الحي القيوم، وأتوب إليه'
            }
        ];

        function clearDuaTimers() {
            duaReminderTimers.forEach(t => clearTimeout(t));
            duaReminderTimers = [];
        }

        function showDuaReminder(quick) {
            if (duaReminderShowing) return;
            // نفس الفكرة: لو تلميح الحسابات الموثقة ظاهر دلوقتي، منسيبوش أوفرلاي "لحظة مع
            // الله" (اللي بيغطي الشاشة كلها) يخفيه من غير ما الطالب ياخد باله منه أصلاً.
            if (isVerifiedTipShowing()) { setTimeout(() => showDuaReminder(quick), 1500); return; }
            duaReminderShowing = true;
            const container = document.getElementById('duaOverlayContainer');
            if (!container) { duaReminderShowing = false; return; }

            const phasesHTML = DUA_PHASES.map((p, i) => `
                <div class="dua-phase${i === 0 ? ' active' : ''}" data-phase="${i}">
                    <div class="dua-phase-label">${p.label}</div>
                    <div class="dua-text">${p.text}</div>
                    <div class="dua-progress-wrap"><div class="dua-progress-bar" id="duaProgress${i}"></div></div>
                    <div class="dua-timer">٣٠ ثانية</div>
                </div>`).join('');

            container.innerHTML = `
                <div class="dua-overlay" id="duaOverlayEl">
                    <div class="dua-card">
                        <button class="dua-close" aria-label="إغلاق التذكير" onclick="closeDuaReminder()"><i class="fas fa-times"></i></button>
                        <div class="dua-icon"><i class="fas fa-moon"></i></div>
                        <div class="dua-title">لحظة مع الله 🌙</div>
                        <div class="dua-sub">خد لك دقيقة بسيطة وانت بتذاكر</div>
                        ${phasesHTML}
                        <div class="dua-extra">
                            💚 «من صلَّى عليَّ صلاةً واحدة صلَّى الله عليه بها عشرًا»<br>
                            وخد بالك من نفسك: اشرب شوية ميه دلوقتي وريّح عينك ثانية من الشاشة 🤍
                        </div>
                    </div>
                </div>`;

            const overlayEl = document.getElementById('duaOverlayEl');
            requestAnimationFrame(() => overlayEl.classList.add('show'));

            // الانتقال التلقائي بين المرحلتين كل 30 ثانية، وقفل تلقائي بعدها
            const t1 = setTimeout(() => {
                const phase0 = container.querySelector('[data-phase="0"]');
                const phase1 = container.querySelector('[data-phase="1"]');
                if (phase0) phase0.classList.remove('active');
                if (phase1) phase1.classList.add('active');
            }, 30000);
            const t2 = setTimeout(() => closeDuaReminder(), quick ? 6000 : 60000);
            duaReminderTimers.push(t1, t2);
        }

        function closeDuaReminder() {
            const overlayEl = document.getElementById('duaOverlayEl');
            clearDuaTimers();
            if (overlayEl) {
                overlayEl.classList.remove('show');
                setTimeout(() => {
                    const container = document.getElementById('duaOverlayContainer');
                    if (container) container.innerHTML = '';
                    duaReminderShowing = false;
                }, 500);
            } else {
                duaReminderShowing = false;
            }
        }

        // ====================== جدول المذاكرة الشخصي ======================
        // الطالب هو اللي بيبني الجدول بنفسه بالكامل (مواد ومواعيد براحته) — مفيش أي
        // اقتراح أو توليد تلقائي من الذكاء الاصطناعي هنا عمدًا، الجدول ده ملكه هو بس.
        // مخزّن محليًا في المتصفح (localStorage)، زي باقي إعدادات الطالب الشخصية.
        let studySchedule = JSON.parse(localStorage.getItem('sx_study_schedule')) || [];
        const STUDY_DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

        function saveStudySchedule() {
            localStorage.setItem('sx_study_schedule', JSON.stringify(studySchedule));
        }

        function openStudySchedule() {
            const toggle = document.getElementById('studyReminderToggle');
            if (toggle) toggle.checked = settings.studyReminders === true;
            const permNote = document.getElementById('studyReminderPermNote');
            if (permNote) permNote.style.display = (settings.studyReminders === true && window.Notification && Notification.permission !== 'granted') ? 'block' : 'none';
            renderStudySchedule();
            openModal('studyScheduleModal');
        }

        function renderStudySchedule() {
            const list = document.getElementById('studyScheduleList');
            if (!list) return;
            if (!studySchedule.length) {
                list.innerHTML = '<div style="text-align:center;padding:16px 10px;color:var(--text-3);font-size:12px;">لسه مفيش فترات مذاكرة مضافة — ضيف أول فترة من فوق</div>';
                return;
            }
            // مرتبين حسب اليوم الأول، وبعدين حسب وقت البداية جوه نفس اليوم
            const sorted = [...studySchedule].sort((a, b) => (a.day - b.day) || a.start.localeCompare(b.start));
            let html = '';
            let lastDay = null;
            for (const block of sorted) {
                if (block.day !== lastDay) {
                    html += `<div style="font-size:12px;font-weight:700;color:var(--accent);margin:${lastDay === null ? '0' : '14px'} 0 6px;">${STUDY_DAY_NAMES[block.day]}</div>`;
                    lastDay = block.day;
                }
                html += `
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg-2);border-radius: var(--radius-sm);padding:8px 10px;margin-bottom:6px;">
                        <div style="font-size:12.5px;">
                            <b>${escapeHtml(block.subject)}</b>
                            <div style="color:var(--text-3);font-size:11px;margin-top:2px;">${block.start} — ${block.end}</div>
                        </div>
                        <button class="icon-btn" style="flex-shrink:0;" aria-label="حذف فترة ${escapeHtml(block.subject)}" onclick="deleteStudyBlock('${block.id}')"><i class="fas fa-trash"></i></button>
                    </div>`;
            }
            list.innerHTML = html;
        }

        function addStudyBlock() {
            const day = parseInt(document.getElementById('studyBlockDay').value, 10);
            const start = document.getElementById('studyBlockStart').value;
            const end = document.getElementById('studyBlockEnd').value;
            const subject = document.getElementById('studyBlockSubject').value.trim();

            if (!subject) { showToast('اكتب اسم المادة الأول', 'error'); return; }
            if (!start || !end) { showToast('حدد وقت البداية والنهاية', 'error'); return; }
            if (start >= end) { showToast('وقت النهاية لازم يكون بعد وقت البداية', 'error'); return; }

            studySchedule.push({
                id: 'sb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                day, start, end, subject
            });
            saveStudySchedule();
            renderStudySchedule();
            document.getElementById('studyBlockSubject').value = '';
            showToast('اتضافت فترة المذاكرة', 'success');
        }

        function deleteStudyBlock(id) {
            studySchedule = studySchedule.filter(b => b.id !== id);
            saveStudySchedule();
            renderStudySchedule();
        }

        function toggleStudyReminders(enabled) {
            settings.studyReminders = enabled;
            saveData();
            const permNote = document.getElementById('studyReminderPermNote');
            if (enabled) {
                // نطلب إذن الإشعارات فورًا لو لسه ملهوش قرار — عشان التذكير يقدر يوصل حتى
                // لو الطالب مفتحش الموقع في اللحظة نفسها (طالما فيه إذن نظام ممنوح).
                if (window.Notification && Notification.permission === 'default') {
                    Notification.requestPermission().then(() => {
                        if (permNote) permNote.style.display = Notification.permission !== 'granted' ? 'block' : 'none';
                    }).catch(() => {});
                } else if (permNote) {
                    permNote.style.display = (window.Notification && Notification.permission !== 'granted') ? 'block' : 'none';
                }
                showToast('اتفعّل تذكير جدول المذاكرة', 'success');
            } else {
                if (permNote) permNote.style.display = 'none';
                showToast('اتوقف تذكير جدول المذاكرة', 'success');
            }
        }

        // بيدوّر كل دقيقة (طول ما الصفحة/التطبيق مفتوح) على فترة مذاكرة بتبدأ دلوقتي
        // بالظبط، ولو لقى، يفكّر الطالب — إما بإشعار نظام حقيقي (لو موافق عليه) أو
        // ببانر جوه الصفحة (زي تذكير الصلاة والواجبات بالظبط، نفس النظام).
        // ⚠️ حدود مهمة: التذكير ده شغال طول ما المتصفح/التطبيق مفتوح في الخلفية (تاب
        // مفتوح أو الـ PWA شغالة)، مش لو التطبيق مقفول تمامًا. تذكير حقيقي حتى مع قفل
        // التطبيق محتاج Push Notification فعلي يتبعت من السيرفر في وقت محدد، وده محتاج
        // نظام مجدول (Cron Job) يخزن جدول كل طالب على السيرفر ويبعتله وقت المذاكرة
        // بالظبط — مرحلة تانية لو حابب نضيفها بعدين.
        let studyReminderLastFired = {}; // blockId -> "YYYY-MM-DD" آخر يوم اتبعت فيه تذكير البلوك ده

        function checkStudyScheduleReminders() {
            if (settings.studyReminders !== true || !studySchedule.length) return;
            const now = new Date();
            const day = now.getDay();
            const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const todayKey = now.toISOString().slice(0, 10);

            for (const block of studySchedule) {
                if (block.day !== day || block.start !== nowStr) continue;
                if (studyReminderLastFired[block.id] === todayKey) continue; // اتبعت النهاردة بالفعل
                studyReminderLastFired[block.id] = todayKey;
                fireStudyReminder(block);
            }
        }

        function fireStudyReminder(block) {
            if (window.Notification && Notification.permission === 'granted') {
                try {
                    new Notification('⏰ وقت المذاكرة', {
                        body: `دلوقتي معاد مذاكرة ${block.subject} (${block.start} - ${block.end})`,
                        icon: '/icons/icon-192.png',
                        tag: 'study-reminder-' + block.id
                    });
                    return;
                } catch (e) { /* نزّل على البانر جوه الصفحة لو الإشعار فشل لأي سبب */ }
            }
            showStudyReminderOverlay(block);
        }

        // بديل جوه الصفحة (لو الإشعارات مش متاحة/مرفوضة) — بيستخدم نفس نظام الـ overlay
        // المشترك مع تذكير الصلاة/الواجبات (duaOverlayContainer) بدل ما نكرر نفس الكود.
        function showStudyReminderOverlay(block) {
            const container = document.getElementById('duaOverlayContainer');
            if (!container || duaReminderShowing) return;
            duaReminderShowing = true;
            container.innerHTML = `
                <div class="dua-overlay" id="duaOverlayEl">
                    <div class="dua-card" style="background:linear-gradient(160deg, #0d2e3a 0%, #113a4b 45%, #1a4c5c 100%); border-color: rgba(66,180,244,.4);">
                        <button class="dua-close" aria-label="إغلاق التذكير" onclick="closeDuaReminder()"><i class="fas fa-times"></i></button>
                        <div class="dua-icon" style="color:#42b4f4;text-shadow:0 0 20px rgba(66,180,244,.5);"><i class="fas fa-clock"></i></div>
                        <div class="dua-title">وقت المذاكرة! ⏰</div>
                        <div class="dua-sub">${escapeHtml(block.subject)}</div>
                        <div class="dua-text" style="text-align:center;">من ${block.start} لحد ${block.end}</div>
                        <div class="dua-extra">يلا بينا، ركّز وابدأ 💪</div>
                    </div>
                </div>`;
            const overlayEl = document.getElementById('duaOverlayEl');
            requestAnimationFrame(() => overlayEl.classList.add('show'));
            const t = setTimeout(() => closeDuaReminder(), 15000);
            duaReminderTimers.push(t);
        }

        setInterval(checkStudyScheduleReminders, 60000);

        // كل 10 دقايق من فتح الصفحة (طول ما هي ظاهرة قدام المستخدم) — وبس لو الطالب مفعّل
        // الميزة دي من الإعدادات (بعض الطلبة بيحسوا إنها بتقاطعهم وهما في نص حل مسألة).
        setInterval(() => {
            if (document.visibilityState === 'visible' && settings.duaReminders !== false) showDuaReminder();
        }, 10 * 60 * 1000);

        // "قبل ما يغادر الصفحة" — المتصفحات بتمنع رسايل مخصصة فعلية عند الإغلاق الفعلي،
        // فأقرب حاجة بنقدر نعملها فعليًا هي إننا نظهرله التذكير لما يسيب التاب أو يقفلها/يرجع تاني
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && settings.duaReminders !== false) showDuaReminder(true);
        });

        function todayKey() {
            const d = new Date();
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }

        function recordQuestionForStats() {
            pingActivity(); // نشاط حقيقي (سؤال/رسالة) → يتحسب في لوحة الصدارة الأسبوعية
            const key = todayKey();
            if (stats.lastActiveDay === key) {
                stats.todayCount += 1;
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
                stats.streak = (stats.lastActiveDay === yKey) ? stats.streak + 1 : 1;
                stats.lastActiveDay = key;
                stats.todayCount = 1;
            }
            localStorage.setItem('sx_stats', JSON.stringify(stats));
            renderStats();
        }

        function renderStats() {
            const streakEl = document.getElementById('streakCount');
            const todayEl = document.getElementById('todayCount');
            if (streakEl) streakEl.textContent = stats.streak;
            if (todayEl) todayEl.textContent = stats.lastActiveDay === todayKey() ? stats.todayCount : 0;
        }

        function createNewChat() {
            const newChat = { id: 'chat_' + Date.now(), title: 'محادثة جديدة', messages: [], timestamp: Date.now() };
            chats.unshift(newChat);
            currentChatId = newChat.id;
            saveData();
            renderChatList();
            renderChat(currentChatId);
            if (window.innerWidth < 768) closeSidebar();
        }

        function deleteChat(id, event) {
            event.stopPropagation();
            chats = chats.filter(c => c.id !== id);
            if (currentChatId === id) {
                currentChatId = chats.length > 0 ? chats[0].id : null;
                if (!currentChatId) createNewChat();
                else renderChat(currentChatId);
            }
            saveData();
            renderChatList();
        }

        function saveData() {
            localStorage.setItem('sx_chats', JSON.stringify(chats));
            localStorage.setItem('sx_current_chat', currentChatId);
            localStorage.setItem('sx_settings', JSON.stringify(settings));
        }

        function saveModelChoice() {
            settings.model = document.getElementById('modelSelect').value;
            saveData();
        }

        // بيقلّب حالة "Deep Thinking" (تفكير عميق) — بيتحفظ في الإعدادات ويفضل شغال
        // في كل المحادثات لحد ما الطالب يقفله بنفسه.
        // حالة الميزة الحالية للطالب — بتتحمّل من السيرفر (تفعيل/تعطيل إداري +
        // الحد اليومي المتبقي) وبتتحدّث بعد كل استخدام فعلي.
        let deepThinkFeatureStatus = { enabled: true, used: 0, remaining: null, limit: 0 };

        async function loadDeepThinkStatus() {
            if (!schoolToken) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/deep-think/status`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) return;
                deepThinkFeatureStatus = await res.json();
            } catch (e) { /* لو فشل الجلب، نسيب الميزة شغالة افتراضيًا (فيها فحص تاني وقت الاستخدام الفعلي) */ }
            applyDeepThinkBtnState();
        }

        function toggleDeepThink() {
            if (!deepThinkFeatureStatus.enabled) {
                showToast('التفكير العميق متوقف مؤقتًا من الإدارة', 'error');
                return;
            }
            if (!settings.deepThink && deepThinkFeatureStatus.remaining === 0) {
                showToast('وصلت للحد اليومي لاستخدام التفكير العميق — جرب تاني بكرة', 'error');
                return;
            }
            settings.deepThink = !settings.deepThink;
            saveData();
            applyDeepThinkBtnState();
            showToast(settings.deepThink ? 'اتفعّل التفكير العميق 🧠 — هيفكر أعمق قبل كل رد' : 'اتقفل التفكير العميق', 'success');
        }

        function setDeepThinkSpeed(speed) {
            settings.deepThinkSpeed = speed === 'quick' ? 'quick' : 'deep';
            saveData();
            document.getElementById('deepThinkSpeedQuick').classList.toggle('active', settings.deepThinkSpeed === 'quick');
            document.getElementById('deepThinkSpeedDeep').classList.toggle('active', settings.deepThinkSpeed === 'deep');
        }

        function applyDeepThinkBtnState() {
            const btn = document.getElementById('deepThinkBtn');
            if (!btn) return;
            btn.classList.toggle('active', !!settings.deepThink);
            btn.setAttribute('aria-pressed', settings.deepThink ? 'true' : 'false');
            document.getElementById('deepThinkSpeedRow').classList.toggle('show', !!settings.deepThink);
            document.getElementById('deepThinkSpeedQuick').classList.toggle('active', settings.deepThinkSpeed === 'quick');
            document.getElementById('deepThinkSpeedDeep').classList.toggle('active', settings.deepThinkSpeed !== 'quick');

            // حالة "متوقف من الإدارة" أو بادچ "متبقّي كام" — عشان الطالب يفهم
            // السبب لو الزرار مش شغال أو قرّب يخلص استخدامه.
            const badge = document.getElementById('deepThinkLimitBadge');
            btn.classList.toggle('disabled-by-admin', !deepThinkFeatureStatus.enabled);
            if (!deepThinkFeatureStatus.enabled) {
                badge.style.display = ''; badge.textContent = 'متوقف مؤقتًا';
            } else if (deepThinkFeatureStatus.limit > 0) {
                badge.style.display = ''; badge.textContent = `${deepThinkFeatureStatus.remaining} متبقّي اليوم`;
            } else {
                badge.style.display = 'none';
            }
        }

        function toggleDuaReminders(enabled) {
            settings.duaReminders = enabled;
            saveData();
            showToast(enabled ? 'اتفعّلت التذكيرات' : 'اتوقفت التذكيرات', 'success');
        }

        function renderChatList(filterQuery) {
            const list = document.getElementById('chatList');
            const emptyBox = document.getElementById('chatSearchEmpty');
            list.innerHTML = '';

            const q = (filterQuery !== undefined ? filterQuery : (document.getElementById('chatSearchInput')?.value || '')).trim();
            // البحث بيدور في عنوان المحادثة وكمان في نص كل الرسائل جواها، مش بس العنوان —
            // عشان الطالب يقدر يلاقي محادثة قديمة حتى لو مش فاكر عنوانها بالظبط.
            const visibleChats = q
                ? chats.filter(chat => {
                    const inTitle = chat.title && chat.title.includes(q);
                    const inMessages = chat.messages.some(m => (m.content || '').includes(q));
                    return inTitle || inMessages;
                })
                : chats;

            if (emptyBox) emptyBox.style.display = (q && visibleChats.length === 0) ? 'block' : 'none';

            visibleChats.forEach(chat => {
                const wrap = document.createElement('div');
                wrap.className = 'chat-item-swipe-wrap';

                const revealDelete = document.createElement('div');
                revealDelete.className = 'swipe-delete-reveal';
                revealDelete.innerHTML = '<i class="fas fa-trash"></i>';
                revealDelete.setAttribute('aria-label', `حذف محادثة ${chat.title}`);
                revealDelete.onclick = (e) => { e.stopPropagation(); deleteChat(chat.id, e); };
                wrap.appendChild(revealDelete);

                const div = document.createElement('div');
                div.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
                div.addEventListener('click', () => {
                    // لو المستخدم لسه فاتح وضع السحب (مقفلش تاني)، أول ضغطة تقفله بس، مش تفتح المحادثة
                    if (parseFloat(div.dataset.swipeX || '0') < -10) { closeSwipe(div); return; }
                    currentChatId = chat.id;
                    saveData();
                    renderChatList();
                    renderChat(currentChatId);
                    if (window.innerWidth < 768) closeSidebar();
                });
                attachSwipeToDelete(div);

                const icon = document.createElement('div');
                icon.className = 'icon';
                icon.innerHTML = '<i class="fas fa-message"></i>';

                const info = document.createElement('div');
                info.className = 'info';
                const title = document.createElement('div');
                title.className = 'title';
                title.textContent = chat.title;
                const date = document.createElement('div');
                date.className = 'date';
                date.textContent = new Date(chat.timestamp).toLocaleDateString('ar-EG');
                info.appendChild(title);
                info.appendChild(date);

                const actions = document.createElement('div');
                actions.className = 'actions';
                const delBtn = document.createElement('button');
                delBtn.className = 'icon-btn delete';
                delBtn.title = 'حذف المحادثة';
                delBtn.setAttribute('aria-label', `حذف محادثة ${chat.title}`);
                delBtn.innerHTML = '<i class="fas fa-trash"></i>';
                delBtn.addEventListener('click', (e) => deleteChat(chat.id, e));
                actions.appendChild(delBtn);

                div.appendChild(icon);
                div.appendChild(info);
                div.appendChild(actions);
                wrap.appendChild(div);
                list.appendChild(wrap);
            });
        }

        // سحب لليسار بيكشف زرار حذف أحمر تحت الرسالة (زي واتساب) — بيحتاج ضغطة تانية
        // على الزرار عشان يحذف فعليًا، مش حذف مباشر بمجرد السحب، تقليلًا لحذف عرضي بالغلط.
        function closeSwipe(div) {
            div.dataset.swipeX = '0';
            div.style.transform = '';
            div.classList.remove('swiping');
            const reveal = div.parentElement?.querySelector('.swipe-delete-reveal');
            if (reveal) reveal.classList.remove('visible');
        }
        function attachSwipeToDelete(div) {
            let startX = 0, startY = 0, dragging = false, lockedHorizontal = false;
            const MAX_SWIPE = 64;
            const getReveal = () => div.parentElement?.querySelector('.swipe-delete-reveal');

            div.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                dragging = true;
                lockedHorizontal = false;
                div.classList.add('swiping');
            }, { passive: true });

            div.addEventListener('touchmove', (e) => {
                if (!dragging) return;
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                if (!lockedHorizontal) {
                    if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // سكرول عمودي عادي، سيبه يمشي
                    lockedHorizontal = true;
                }
                // نسمح بالسحب لجهة واحدة بس (سالب = يمين لشمال) عشان نكشف زرار الحذف
                const clamped = Math.max(-MAX_SWIPE, Math.min(0, dx));
                div.dataset.swipeX = String(clamped);
                div.style.transform = `translateX(${clamped}px)`;
                const reveal = getReveal();
                if (reveal) reveal.classList.toggle('visible', clamped < -4);
            }, { passive: true });

            const endHandler = () => {
                if (!dragging) return;
                dragging = false;
                div.classList.remove('swiping');
                const dx = parseFloat(div.dataset.swipeX || '0');
                // فوق نص المسافة؟ يفضل مفتوح على زرار الحذف. أقل من كده؟ يرجع يقفل لوحده.
                if (dx < -MAX_SWIPE / 2) {
                    div.dataset.swipeX = String(-MAX_SWIPE);
                    div.style.transform = `translateX(${-MAX_SWIPE}px)`;
                    const reveal = getReveal();
                    if (reveal) reveal.classList.add('visible');
                } else {
                    closeSwipe(div);
                }
            };
            div.addEventListener('touchend', endHandler);
            div.addEventListener('touchcancel', () => { dragging = false; closeSwipe(div); });
        }

        function filterChatList(query) {
            renderChatList(query);
        }

        function renderChat(chatId) {
            const chat = chats.find(c => c.id === chatId);
            const container = document.getElementById('chatContainer');
            const welcome = document.getElementById('welcomeScreen');

            // بنقفل شريط البحث ونصفّر نتايجه — عناصر الـ DOM اللي كان بيدوّر فيها هتتشال دلوقتي
            toggleChatSearchBar(false);
            
            // Remove old messages only — لازم نستثني صندوق "جاري التفكير..." (deep-think-indicator)
            // زي ما بنستثني نقط "بيكتب..." بالظبط، وإلا هيتشال من الـ DOM أول ما أي محادثة
            // تترندر (حتى أول ما الصفحة تفتح)، وبعدها كل نداءات getElementById بتاعته هترجع
            // null للأبد فيبقى مفيش أي حاجة بتظهر لما الطالب يفعّل Deep Thinking.
            Array.from(container.children).forEach(child => {
                if (!child.classList.contains('welcome-screen') && !child.classList.contains('typing-indicator') && !child.classList.contains('deep-think-indicator')) {
                    child.remove();
                }
            });

            if (!chat || chat.messages.length === 0) {
                welcome.style.display = 'flex';
                renderPinnedBar(null);
                return;
            }
            
            welcome.style.display = 'none';
            chat.messages.forEach(msg => appendMessageToDOM(msg, false));
            scrollToBottom();
            renderPinnedBar(chat);
        }

        // Shows a horizontal strip of pinned messages under the top bar, so the user can
        // jump back to anything important without scrolling through the whole conversation.
        function renderPinnedBar(chat) {
            const bar = document.getElementById('pinnedBar');
            if (!bar) return;
            const pinned = chat ? chat.messages.filter(m => m.pinned) : [];
            if (!chat || pinned.length === 0) {
                bar.innerHTML = '';
                bar.classList.remove('active');
                return;
            }
            bar.classList.add('active');
            bar.innerHTML = '';
            pinned.forEach(m => {
                const chip = document.createElement('div');
                chip.className = 'pinned-chip';
                chip.title = 'اذهب إلى الرسالة';
                const icon = document.createElement('i');
                icon.className = m.role === 'user' ? 'fas fa-user' : 'fas fa-thumbtack';
                chip.appendChild(icon);
                const label = document.createElement('span');
                label.textContent = (m.content || '').replace(/\s+/g, ' ').trim().slice(0, 36) || '(بدون نص)';
                chip.appendChild(label);
                chip.addEventListener('click', () => {
                    const el = document.getElementById(m.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.title = 'إلغاء التثبيت';
                removeBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePinMessage(m.id); });
                chip.appendChild(removeBtn);
                bar.appendChild(chip);
            });
        }

        // ====================== بحث داخل المحادثة الحالية ======================
        // بيدوّر في نصوص كل الرسايل الظاهرة في الشات المفتوح دلوقتي بس (مش كل المحادثات)،
        // وبيدّي نتيجة "X من Y" مع أزرار تنقل بين النتائج، وبيوضّح الرسالة الحالية بإطار.
        let chatSearchMatches = [];
        let chatSearchIndex = -1;

        function toggleChatSearchBar(forceState) {
            const bar = document.getElementById('chatSearchBar');
            if (!bar) return;
            const show = forceState !== undefined ? forceState : !bar.classList.contains('active');
            bar.classList.toggle('active', show);
            if (show) {
                document.getElementById('chatSearchBarInput').focus();
            } else {
                document.getElementById('chatSearchBarInput').value = '';
                clearChatSearchHighlight();
                chatSearchMatches = [];
                chatSearchIndex = -1;
                document.getElementById('chatSearchCount').textContent = '';
                document.getElementById('chatSearchPrevBtn').disabled = true;
                document.getElementById('chatSearchNextBtn').disabled = true;
            }
        }

        function clearChatSearchHighlight() {
            document.querySelectorAll('.msg-bubble.search-current').forEach(el => el.classList.remove('search-current'));
        }

        function performChatSearch(query) {
            clearChatSearchHighlight();
            const q = (query || '').trim().toLowerCase();
            const countEl = document.getElementById('chatSearchCount');
            const prevBtn = document.getElementById('chatSearchPrevBtn');
            const nextBtn = document.getElementById('chatSearchNextBtn');
            if (!q) {
                chatSearchMatches = [];
                chatSearchIndex = -1;
                countEl.textContent = '';
                prevBtn.disabled = nextBtn.disabled = true;
                return;
            }
            const bubbles = Array.from(document.querySelectorAll('#chatContainer .message .msg-bubble'));
            chatSearchMatches = bubbles.filter(b => (b.textContent || '').toLowerCase().includes(q));
            if (!chatSearchMatches.length) {
                chatSearchIndex = -1;
                countEl.textContent = 'مفيش نتايج';
                prevBtn.disabled = nextBtn.disabled = true;
                return;
            }
            prevBtn.disabled = nextBtn.disabled = false;
            chatSearchIndex = 0;
            countEl.textContent = `1 من ${chatSearchMatches.length}`;
            highlightCurrentSearchMatch();
        }

        function highlightCurrentSearchMatch() {
            clearChatSearchHighlight();
            const el = chatSearchMatches[chatSearchIndex];
            if (!el) return;
            el.classList.add('search-current');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function goToSearchMatch(direction) {
            if (!chatSearchMatches.length) return;
            chatSearchIndex = (chatSearchIndex + direction + chatSearchMatches.length) % chatSearchMatches.length;
            document.getElementById('chatSearchCount').textContent = `${chatSearchIndex + 1} من ${chatSearchMatches.length}`;
            highlightCurrentSearchMatch();
        }

        // Toggles the pinned state of a message, keeps the on-screen button/bubble in sync,
        // and refreshes the pinned bar.
        function togglePinMessage(msgId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;
            const msg = chat.messages.find(m => m.id === msgId);
            if (!msg) return;
            msg.pinned = !msg.pinned;
            saveData();

            const msgDiv = document.getElementById(msgId);
            if (msgDiv) {
                const pinBtn = msgDiv.querySelector('.pin-btn');
                if (pinBtn) {
                    pinBtn.classList.toggle('pinned', msg.pinned);
                    pinBtn.title = msg.pinned ? 'إلغاء التثبيت' : 'تثبيت الرسالة';
                }
                const bubbleEl = msgDiv.querySelector('.msg-bubble');
                if (bubbleEl) bubbleEl.classList.toggle('pinned-msg', msg.pinned);
            }
            renderPinnedBar(chat);
            showToast(msg.pinned ? 'تم تثبيت الرسالة' : 'تم إلغاء تثبيت الرسالة', 'success');
        }

        // Turns a sent (user) message bubble into an inline textarea so it can be edited
        // in place. Only the text portion is swapped out — an attached image (if any)
        // stays visible above it untouched.
        function enterEditMode(msgId) {
            if (isGenerating) { showToast('استنى لحظة، البوت لسه بيرد على آخر رسالة', 'error'); return; }
            const chat = chats.find(c => c.id === currentChatId);
            const msg = chat && chat.messages.find(m => m.id === msgId);
            if (!msg) return;
            const msgDiv = document.getElementById(msgId);
            const bubble = msgDiv && msgDiv.querySelector('.msg-bubble');
            const textWrap = bubble && bubble.querySelector('.msg-text');
            if (!bubble || !textWrap || bubble.dataset.editing) return;

            bubble.dataset.editing = '1';
            const originalHTML = textWrap.innerHTML;
            textWrap.innerHTML = '';

            const textarea = document.createElement('textarea');
            textarea.className = 'msg-edit-textarea';
            textarea.value = msg.content;
            textWrap.appendChild(textarea);

            const editActions = document.createElement('div');
            editActions.className = 'msg-edit-actions';

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'msg-edit-btn save';
            saveBtn.innerHTML = '<i class="fas fa-check"></i> حفظ وإعادة الإرسال';
            saveBtn.addEventListener('click', () => saveEditMessage(msgId, textarea.value));

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'msg-edit-btn cancel';
            cancelBtn.innerHTML = '<i class="fas fa-xmark"></i> إلغاء';
            cancelBtn.addEventListener('click', () => {
                delete bubble.dataset.editing;
                textWrap.innerHTML = originalHTML;
                enhanceCodeBlocks(bubble);
            });

            editActions.appendChild(saveBtn);
            editActions.appendChild(cancelBtn);
            textWrap.appendChild(editActions);

            textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }

        // Saves an edited message. Because everything after it in the conversation was a
        // reply built on the old text, that tail (bot answers, follow-ups...) is removed
        // and a fresh reply is generated for the edited message — same as regenerateMessage.
        async function saveEditMessage(msgId, newText) {
            newText = (newText || '').trim();
            if (!newText) { showToast('الرسالة لا يمكن أن تكون فارغة', 'error'); return; }
            if (isGenerating) return;

            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;
            const idx = chat.messages.findIndex(m => m.id === msgId);
            if (idx === -1) return;

            stopSpeaking();

            chat.messages[idx].content = newText;
            const removed = chat.messages.splice(idx + 1);
            removed.forEach(m => {
                const el = document.getElementById(m.id);
                if (el) el.remove();
            });

            if (idx === 0) chat.title = newText.substring(0, 35) + (newText.length > 35 ? '...' : '');

            saveData();
            renderChatList();
            renderChat(currentChatId);

            if (abortController) abortController.abort();
            abortController = new AbortController();
            isGenerating = true;
            setSendButtonState(true);
            document.getElementById('typingIndicator').classList.add('active');
            scrollToBottom();
            await runGeneration(chat);
        }

        // Deletes a single sent message. Anything after it in the conversation is left as-is.
        function deleteMessage(msgId) {
            if (isGenerating) { showToast('استنى لحظة، البوت لسه بيرد على آخر رسالة', 'error'); return; }
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;
            const idx = chat.messages.findIndex(m => m.id === msgId);
            if (idx === -1) return;
            if (!confirm('تحذف الرسالة دي؟')) return;

            stopSpeaking();

            chat.messages.splice(idx, 1);
            const el = document.getElementById(msgId);
            if (el) el.remove();
            saveData();
            renderChatList();
            renderPinnedBar(chat);
            syncRegenerateButtons(chat);

            if (chat.messages.length === 0) {
                document.getElementById('welcomeScreen').style.display = 'flex';
            }
            showToast('تم حذف الرسالة', 'success');
        }

        function sendQuick(text) {
            document.getElementById('messageInput').value = text;
            autoResize(document.getElementById('messageInput'));
            updateCharCount();
            sendMessage();
        }

        async function sendMessage() {
            // Debounce: guards against double key-events / double taps firing sendMessage twice in quick succession
            const now = Date.now();
            if (now - lastSendTime < 600) return;

            // Rate limit: حد أقصى 15 رسالة في الدقيقة الواحدة (60 لمشتركي premium_ai) — بيحمي
            // من إساءة استخدام الـ API (وبالتالي تكلفة فلوس حقيقية على المطور) لو حد حاول
            // يبعت رسايل بشكل آلي أو مكثف، من غير ما يضايق مشترك بريميوم بيستخدم عادي.
            recentSendTimestamps = recentSendTimestamps.filter(t => now - t < 60000);
            const maxMsgsPerMinute = hasPremium('premium_ai') ? 60 : 15;
            if (recentSendTimestamps.length >= maxMsgsPerMinute) {
                showToast('استنى شوية، بتبعت رسايل كتير بسرعة — جرب تاني بعد دقيقة', 'error');
                return;
            }
            recentSendTimestamps.push(now);
            lastSendTime = now;

            const input = document.getElementById('messageInput');
            let text = input.value.trim();
            if ((!text && !pendingAttachment) || isGenerating) return;

            if (pendingAttachment && pendingAttachment.processing && !pendingAttachment.base64) {
                showToast('استنى لحظة، لسه بيتم استخراج النص من الملف...', 'error');
                return;
            }

            if (pendingAttachment) {
                const kind = (pendingAttachment.mimeType && pendingAttachment.mimeType.startsWith('image/'))
                    ? 'image'
                    : (/\.pdf$/i.test(pendingAttachment.name) ? 'pdf' : 'file');
                const framed = formatAttachmentForMessage(pendingAttachment.name, pendingAttachment.textContent, kind);
                text = text ? `${text}\n\n${framed}` : framed;
            }

            // لو الرسالة فيها تاج "/اسم-مهارة" (اتحط من قائمة اختيار المهارات جوه زرار
            // الإرفاق)، نجيب تعليمات المهارة دي ونحطها كسياق خاص بالرد على الرسالة دي
            // بس — بيتصفّر تاني بعد كل رد عشان مايفضلش يأثر على الرسايل اللي بعده.
            pendingSkillContext = buildSkillTagContext(text);

            // Cancel any ongoing request
            if (abortController) {
                abortController.abort();
            }
            abortController = new AbortController();

            const chat = chats.find(c => c.id === currentChatId);
            if (chat.messages.length === 0) chat.title = text.substring(0, 35) + (text.length > 35 ? '...' : '');
            
            const userMsg = {
                role: 'user', content: text, timestamp: Date.now(), id: `msg-${Date.now()}-u`,
                image: (pendingAttachment && pendingAttachment.base64 && pendingAttachment.mimeType && pendingAttachment.mimeType.startsWith('image/'))
                    ? { base64: pendingAttachment.base64, mimeType: pendingAttachment.mimeType, name: pendingAttachment.name }
                    : null
            };
            chat.messages.push(userMsg);
            saveData();
            recordQuestionForStats();
            
            input.value = ''; 
            autoResize(input); 
            updateCharCount();
            clearAttachment();
            renderChatList();
            appendMessageToDOM(userMsg, true);
            document.getElementById('welcomeScreen').style.display = 'none';

            isGenerating = true;
            setSendButtonState(true);
            document.getElementById('typingIndicator').classList.add('active');
            scrollToBottom();

            if (schoolToken) await fetchSchoolProfile(true); // force=true دايمًا: نجيب بيانات فريش من السيرفر قبل كل رسالة عشان الدقة، بدل الاعتماد على كاش قديم
            tryGradeActiveQuiz(text);
            await runGeneration(chat);
            pendingQuizContext = '';
            pendingSkillContext = '';
        }

        // بتبدأ تبديل جملة "بيفكر..." تحت العنوان كل شوية عشان تديله إحساس إنه بيمر
        // بمراحل تفكير حقيقية (فهم السؤال، مراجعة المعلومات، ترتيب الإجابة...).
        function startDeepThinkStatusCycle() {
            const statusEl = document.getElementById('deepThinkStatus');
            if (!statusEl) return;
            let idx = 0;
            statusEl.textContent = DEEP_THINK_STATUS_MESSAGES[0];
            statusEl.classList.remove('fade');
            deepThinkStatusInterval = setInterval(() => {
                idx = (idx + 1) % DEEP_THINK_STATUS_MESSAGES.length;
                statusEl.classList.add('fade');
                setTimeout(() => {
                    statusEl.textContent = DEEP_THINK_STATUS_MESSAGES[idx];
                    statusEl.classList.remove('fade');
                }, 250);
            }, 4200);
        }
        function stopDeepThinkStatusCycle() {
            if (deepThinkStatusInterval) { clearInterval(deepThinkStatusInterval); deepThinkStatusInterval = null; }
        }

        // ====================== Deep Thinking: نداء تفكير حقيقي منفصل ======================
        // بيتنادى قبل أي رد عادي لو الطالب مفعّل زرار "Deep Thinking". بيبعت سؤاله لـ
        // Gemini بس (مش الموديل المختار) مع تعليمات "فكّر ومتجاوبش"، وبيعرض التحليل وهو
        // بيتكتب لحظة بلحظة تحت المحادثة — ده تفكير فعلي بيتنفّذ فعلاً، مش أنيميشن وهمي.
        // لو النداء فشل لأي سبب (شبكة، مفتاح API، إلخ) بنكمل عادي من غير تفكير عشان
        // فشل الميزة الإضافية دي ميوقفش رد الطالب الأساسي.
        async function runDeepThinkingPass(chat, signal) {
            const indicator = document.getElementById('deepThinkIndicator');
            const textEl = document.getElementById('deepThinkText');
            const timeEl = document.getElementById('deepThinkTime');
            if (textEl) textEl.textContent = '';
            if (timeEl) timeEl.textContent = '0';
            document.getElementById('typingIndicator').classList.remove('active');
            if (indicator) {
                // بننقل العنصر (مش بننسخه) لآخر المحادثة تحت آخر رسالة مباشرة، بنفس مكان
                // مؤشر "جاري الكتابة..." بالظبط، عشان يفضل ظاهر تحت آخر رسالة دايمًا مهما
                // كان عدد الرسايل اللي اتضافت قبل كده.
                document.getElementById('chatContainer').insertBefore(indicator, document.getElementById('typingIndicator'));
                indicator.classList.add('active');
            }
            startDeepThinkStatusCycle();
            scrollToBottom();

            const startTime = Date.now();
            deepThinkTimerInterval = setInterval(() => {
                if (timeEl) timeEl.textContent = String(Math.round((Date.now() - startTime) / 1000));
            }, 500);

            try {
                const messages = chat.messages;
                const lastUserMsg = messages[messages.length - 1];
                const parts = [{ text: lastUserMsg.content }];
                if (lastUserMsg.image && lastUserMsg.image.base64) {
                    parts.push({ inline_data: { mime_type: lastUserMsg.image.mimeType, data: lastUserMsg.image.base64 } });
                }
                const history = messages.slice(0, -1);
                // السرعة المختارة (⚡ سريع / 🧠 عميق) بتحدد البرومبت وحد أقصى تقريبي
                // لطول رد التفكير نفسه — نسخة "سريع" برومبتها أقصر أصلًا، وبنحط
                // maxOutputTokens أقل ليها كمان عشان تنتهي فعليًا أسرع مش بس تتكتب أقصر.
                const isQuickMode = settings.deepThinkSpeed === 'quick';
                const requestBody = {
                    contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })).concat([{ role: 'user', parts }]),
                    systemInstruction: { parts: [{ text: isQuickMode ? DEEP_THINK_REASONING_SYSTEM_PROMPT_QUICK : DEEP_THINK_REASONING_SYSTEM_PROMPT }] }
                };
                if (isQuickMode) requestBody.generationConfig = { maxOutputTokens: 220 };

                const response = await fetchWithRetry(`${settings.backendUrl}/api/gemini`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal
                });
                if (!response.ok || !response.body) throw new Error('deep-think-unavailable');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            const piece = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (piece) {
                                fullText += piece;
                                if (textEl) { textEl.textContent = fullText; textEl.scrollTop = textEl.scrollHeight; }
                            }
                        } catch (e) {}
                    }
                }

                const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
                if (!fullText.trim()) return null;
                return { reasoningText: fullText.trim(), elapsedSeconds };
            } finally {
                clearInterval(deepThinkTimerInterval);
                deepThinkTimerInterval = null;
                stopDeepThinkStatusCycle();
                if (indicator) indicator.classList.remove('active');
            }
        }

        // بتبني الـ HTML بتاع بلوك "فكّر لمدة X ثانية" القابل للطي، سواء كان بيتحط لحظة
        // ما الرد بيوصل أو بعد كده لما نعرض محادثة قديمة من الذاكرة.
        function buildThinkingBlockHTML(reasoningText, seconds) {
            const s = Number(seconds) || 0;
            const label = s > 0 ? `فكّر لمدة ${s} ${s === 1 ? 'ثانية' : 'ثواني'}` : 'فكّر قبل الإجابة';
            return `
                <div class="thinking-block">
                    <button type="button" class="thinking-toggle" onclick="this.parentElement.classList.toggle('open')">
                        <i class="fas fa-brain"></i>
                        <span>${escapeHtml(label)}</span>
                        <i class="fas fa-chevron-down thinking-chevron"></i>
                    </button>
                    <div class="thinking-body">${escapeHtml(reasoningText)}</div>
                </div>`;
        }

        // بتحقن بلوك التفكير جوه رسالة رد جاهزة بالفعل في الـ DOM (لسه سخنة من رد جديد).
        function attachThinkingBlockToMessage(msgId, reasoningText, seconds) {
            const msgDiv = document.getElementById(msgId);
            if (!msgDiv) return;
            const bubble = msgDiv.querySelector('.msg-bubble');
            if (!bubble || !bubble.parentElement) return;
            const wrap = document.createElement('div');
            wrap.innerHTML = buildThinkingBlockHTML(reasoningText, seconds);
            bubble.parentElement.insertBefore(wrap.firstElementChild, bubble);
        }

        // Calls the selected AI provider (with auto-fallback chain) for the given chat and
        // appends its reply. Shared by sendMessage (new question) and regenerateMessage
        // (re-asking after deleting the previous bot reply) so both behave identically.
        async function runGeneration(chat) {
            let model = document.getElementById('modelSelect').value;
            let source = 'local';
            const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
            const fallbackText = lastUserMsg ? lastUserMsg.content : '';
            const hasImage = !!(lastUserMsg && lastUserMsg.image && lastUserMsg.image.base64);

            // قسم موديلات Premium (Cerebras و Claude Opus): الطالب المشترك حر يختار أي
            // موديل من القسمين (Premium أو العامة) وهيشتغل عليه براحته — مفيش توجيه
            // تلقائي لموديل معيّن. اللي بيتفحص هنا هو بس إن الطالب اللي مش مشترك ميقدرش
            // يستخدم الموديلات دي حتى لو القيمة اتحطت بأي طريقة (اختيار قديم متخزّن،
            // تلاعب في القايمة من الـ devtools، إلخ) — نرجعها لـ "تلقائي".
            const premiumOnlyModels = ['cerebras', 'claude-opus', 'examiner'];
            if (premiumOnlyModels.includes(model) && !hasPremium('premium_ai')) {
                model = 'auto';
            }

            // Groq/OpenRouter/Cerebras/Mistral/Qwen are text-only — if the user attached a photo,
            // routing to them would silently ignore it. Force a vision-capable model instead
            // so an attached image always actually gets looked at.
            if (hasImage && model !== 'gemini' && model !== 'zimage' && model !== 'german-teacher' && model !== 'examiner') {
                model = 'zimage';
            }

            // Deep Thinking: لو مفعّل من الطالب، بنعمل نداء تفكير حقيقي منفصل الأول (شوف
            // runDeepThinkingPass) قبل ما نكمّل لرد الموديل الأصلي المختار. لو فشل النداء
            // ده لأي سبب مش AbortError، بنتجاهله ونكمل عادي من غير ما نوقف رد الطالب.
            let deepThinkResult = null;
            if (settings.deepThink && model !== 'local') {
                // لازم ناخد إذن من السيرفر الأول (الميزة مفعّلة إداريًا + لسه متبقّي
                // للطالب استخدام من حده اليومي) قبل ما نستهلك وقت/تكلفة نداء فعلي.
                // لو اتمنع، منوقفش رسالة الطالب خالص — بس بنكمّل من غير تفكير عميق.
                let deepThinkAllowed = true;
                if (schoolToken) {
                    try {
                        const permRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/deep-think/use`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${schoolToken}` }
                        });
                        const permData = await permRes.json().catch(() => ({}));
                        if (!permRes.ok) {
                            deepThinkAllowed = false;
                            deepThinkFeatureStatus = { ...deepThinkFeatureStatus, ...permData, enabled: permData.enabled !== undefined ? permData.enabled : deepThinkFeatureStatus.enabled };
                            applyDeepThinkBtnState();
                            showToast(permData.error || 'التفكير العميق مش متاح دلوقتي — هنجاوبك عادي', 'error');
                        } else if (permData.limit > 0) {
                            deepThinkFeatureStatus = { ...deepThinkFeatureStatus, ...permData };
                            applyDeepThinkBtnState();
                        }
                    } catch (e) { /* السيرفر مش متاح دلوقتي — منمنعش الميزة بسبب مشكلة شبكة عابرة */ }
                }
                if (deepThinkAllowed) {
                try {
                    deepThinkResult = await runDeepThinkingPass(chat, abortController.signal);
                    if (deepThinkResult) deepThinkReasoningContext = deepThinkResult.reasoningText;
                } catch (deepThinkError) {
                    if (deepThinkError.name === 'AbortError') {
                        isGenerating = false;
                        abortController = null;
                        setSendButtonState(false);
                        document.getElementById('typingIndicator').classList.remove('active');
                        showToast('تم إيقاف الرد', 'error');
                        return;
                    }
                    console.error('Deep think pass failed', deepThinkError);
                    deepThinkResult = null;
                }
                document.getElementById('typingIndicator').classList.add('active');
                }
            }

            // إعادة محاولة تلقائية لو النت اتقطع أثناء التوليد: بنلف منطق النداء كله
            // جوه حلقة، وأي خطأ اتصال (مش خطأ من نوع تاني) بيوقف عند waitForReconnectAndRetry
            // بدل ما يسقط على طول لرد محلي — لحد ما ينجح، أو يوصل لأقصى عدد محاولات،
            // أو الطالب يدوس "إيقاف" بنفسه وهو مستني.
            const MAX_NETWORK_RETRIES = 3;
            let networkRetryAttempt = 0;
            try {
            while (true) {
            try {
                if (model === 'groq') {
                    source = 'groq';
                    await streamGroq(chat.messages, abortController.signal);
                } else if (model === 'gemini') {
                    source = 'gemini';
                    await streamGemini(chat.messages, abortController.signal);
                } else if (model === 'german-teacher') {
                    source = 'gemini';
                    await streamGemini(chat.messages, abortController.signal, GERMAN_TEACHER_SYSTEM_PROMPT);
                } else if (model === 'examiner') {
                    source = 'gemini';
                    await streamGemini(chat.messages, abortController.signal, EXAMINER_SYSTEM_PROMPT);
                } else if (model === 'zimage') {
                    source = 'zimage';
                    await streamZimage(chat.messages, abortController.signal);
                } else if (model === 'openrouter') {
                    source = 'openrouter';
                    await streamOpenRouter(chat.messages, abortController.signal);
                } else if (model === 'cerebras') {
                    source = 'cerebras';
                    await streamCerebras(chat.messages, abortController.signal);
                } else if (model === 'claude-opus') {
                    source = 'claude-opus';
                    await streamClaudeOpus(chat.messages, abortController.signal);
                } else if (model === 'mistral') {
                    source = 'mistral';
                    await streamMistral(chat.messages, abortController.signal);
                } else if (model === 'sambanova') {
                    source = 'sambanova';
                    try {
                        await streamSambanova(chat.messages, abortController.signal);
                    } catch (sambanovaError) {
                        if (sambanovaError.name === 'AbortError') throw sambanovaError;
                        // 429 = SambaNova نفسه مزدحم مؤقتًا (مش عطل في الاشتراك ولا الكود) —
                        // بنحاول تلقائي موديل تاني بدل ما نوقف بخطأ للطالب مباشرة. أي خطأ
                        // تاني (401، 500، إلخ) بيتصعّد زي ما هو عادي للـ catch العام تحت.
                        if (sambanovaError.status === 429) {
                            source = 'qwen';
                            await streamQwen(chat.messages, abortController.signal);
                        } else {
                            throw sambanovaError;
                        }
                    }
                } else if (model === 'qwen') {
                    source = 'qwen';
                    await streamQwen(chat.messages, abortController.signal);
                } else if (model === 'onehop') {
                    source = 'onehop';
                    await streamOneHop(chat.messages, abortController.signal);
                } else if (model === 'auto') {
                    if (hasImage) {
                        // Image attached in auto mode: try the dedicated vision model first,
                        // then Gemini (also vision-capable) before giving up on the image.
                        try {
                            source = 'zimage';
                            await streamZimage(chat.messages, abortController.signal);
                        } catch (zimageError) {
                            if (zimageError.name === 'AbortError') throw zimageError;
                            source = 'gemini';
                            await streamGemini(chat.messages, abortController.signal);
                        }
                    } else {
                    // We can't tell from the browser which server-side keys are actually
                    // configured, so auto mode tries providers in order and falls through
                    // automatically on failure — only dropping to local after all five miss.
                    try {
                        source = 'groq';
                        await streamGroq(chat.messages, abortController.signal);
                    } catch (groqError) {
                        if (groqError.name === 'AbortError') throw groqError;
                        try {
                            source = 'gemini';
                            await streamGemini(chat.messages, abortController.signal);
                        } catch (geminiError) {
                            if (geminiError.name === 'AbortError') throw geminiError;
                            try {
                                source = 'openrouter';
                                await streamOpenRouter(chat.messages, abortController.signal);
                            } catch (openrouterError) {
                                if (openrouterError.name === 'AbortError') throw openrouterError;
                                // Cerebras و Claude Opus اتشالوا من سلسلة الـ auto العادية عمدًا — موديلات Premium بس
                                // (مشتركين premium_ai بياخدوه مباشرة فوق قبل ما نوصل هنا أصلاً).
                                try {
                                    source = 'mistral';
                                    await streamMistral(chat.messages, abortController.signal);
                                } catch (mistralError) {
                                    if (mistralError.name === 'AbortError') throw mistralError;
                                    try {
                                        source = 'sambanova';
                                        await streamSambanova(chat.messages, abortController.signal);
                                    } catch (sambanovaError) {
                                        if (sambanovaError.name === 'AbortError') throw sambanovaError;
                                        source = 'qwen';
                                        await streamQwen(chat.messages, abortController.signal);
                                    }
                                }
                            }
                        }
                    }
                    }
                } else {
                    await respondLocally(fallbackText, chat, abortController.signal);
                }
                // Deep Thinking نجح: نلزّق بلوك "فكّر لمدة X ثانية" القابل للطي فوق آخر رد
                // اتضاف للمحادثة، ونحفظه مع الرسالة عشان يفضل ظاهر لو اترجع للمحادثة دي تاني.
                if (deepThinkResult) {
                    const lastBotMsg = chat.messages[chat.messages.length - 1];
                    if (lastBotMsg && lastBotMsg.role === 'bot') {
                        lastBotMsg.thinking = deepThinkResult.reasoningText;
                        lastBotMsg.thinkingSeconds = deepThinkResult.elapsedSeconds;
                        attachThinkingBlockToMessage(lastBotMsg.id, deepThinkResult.reasoningText, deepThinkResult.elapsedSeconds);
                        saveData();
                    }
                }
                // ====================== بنك الأسئلة الشائعة ======================
                // بعد أي رد ناجح (وصلنا هنا يبقى معدّيش استثناء)، نبعت السؤال وآخر
                // رد للبنك المشترك — مجهول تمامًا (مفيش توكن ولا اسم مستخدم في
                // الطلب ده خالص). "fire and forget": مش بنستنى النتيجة ولا بنوقف
                // ظهور الرد للطالب لو الطلب ده فشل أو اتأخر.
                submitToSharedQuestionBank(fallbackText, chat.messages[chat.messages.length - 1]);
                // بنك أخطائي الذكي: نشغّله بس لو الرسالة دي مش إجابة اختبار رسمي
                // اتصححت أصلاً فوق (tryGradeActiveQuiz)، عشان منحللش نفس الحاجة مرتين.
                if (!lastTurnWasGradedQuiz) {
                    detectMistakeInBackground(fallbackText, chat.messages[chat.messages.length - 1]);
                }
                reportFeatureUsage('main_chat', source);
                break; // نجح الرد — نخرج من حلقة إعادة المحاولة
            } catch (error) {
                if (error.name === 'AbortError') {
                    showToast('تم إيقاف الرد', 'error');
                    break;
                }
                // خطأ اتصال فعلي (النت مقطوع أو فشل مؤقت) ولسه معندناش محاولات كفاية؟
                // نستنى رجوع النت (أو محاولة سريعة تانية) ونعيد نفس الطلب تلقائيًا
                // من غير ما نزعج الطالب برد محلي ضعيف كان ممكن نتجنبه.
                if (isConnectivityError(error) && networkRetryAttempt < MAX_NETWORK_RETRIES) {
                    networkRetryAttempt++;
                    const outcome = await waitForReconnectAndRetry(abortController.signal, networkRetryAttempt, MAX_NETWORK_RETRIES);
                    if (outcome.userCancelled) {
                        showToast('تم إيقاف الرد', 'error');
                        break;
                    }
                    if (outcome.shouldRetry) {
                        abortController = new AbortController();
                        continue; // نعيد نفس محاولة التوليد من الأول
                    }
                    // استنينا وماعادش النت رجع في الوقت المسموح — نكمل عادي لرد محلي تحت
                }
                console.error(error);
                const shortDetail = (error.message || '').slice(0, 80);
                showToast(shortDetail ? `${shortDetail} — تم استخدام رد محلي` : 'حدث خطأ في الاتصال، تم استخدام رد محلي', 'error');
                // Only add a local fallback reply if no bot reply was already added for this turn
                const lastMsg = chat.messages[chat.messages.length - 1];
                const alreadyReplied = lastMsg && lastMsg.role === 'bot' && (!lastUserMsg || lastMsg.timestamp >= lastUserMsg.timestamp);
                if (!alreadyReplied) {
                    await respondLocally(fallbackText, chat, new AbortController().signal);
                }
                break;
            }
            } // نهاية حلقة إعادة المحاولة (while)
            } finally {
                isGenerating = false;
                abortController = null;
                setSendButtonState(false);
                document.getElementById('typingIndicator').classList.remove('active');
                const dtIndicator = document.getElementById('deepThinkIndicator');
                if (dtIndicator) dtIndicator.classList.remove('active');
                if (deepThinkTimerInterval) { clearInterval(deepThinkTimerInterval); deepThinkTimerInterval = null; }
                stopDeepThinkStatusCycle();
                deepThinkReasoningContext = '';
                updateCharCount();
                // لو الطالب مبعّد عن التاب (تاب/تطبيق تاني) وقت ما الرد خلص، يوصله إشعار
                // حقيقي من نظام التشغيل بدل ما يفوته من غير ما يعرف.
                notifyResponseReadyIfHidden(chat);
            }
        }

        // ====================== بنك الأسئلة الشائعة (سؤال اليوم من زميل) ======================
        // إرسال مجهول تمامًا: من غير Authorization header ومن غير أي معرّف للطالب،
        // فمفيش وسيلة تقنية تربط السؤال بصاحبه لا عند الإرسال ولا بعد كده.
        function submitToSharedQuestionBank(question, lastMsg) {
            try {
                const q = String(question || '').trim();
                if (!q || q.length < 8) return; // أسئلة قصيرة جدًا (زي "تمام" أو "شكرا") مش مفيدة في البنك
                const answer = (lastMsg && lastMsg.role === 'bot') ? stripMarkdownForSpeech(lastMsg.content).slice(0, 2000) : '';
                fetch(`${FIXED_SCHOOL_API_URL}/api/shared-questions/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: q, answer })
                }).catch(() => {});
            } catch (e) { /* ميزة مساعدة — فشلها مايأثرش على المحادثة نفسها */ }
        }

        let sharedQuestionsCache = [];
        async function fetchSharedQuestions() {
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-questions/top`);
                if (!res.ok) return;
                const data = await res.json();
                sharedQuestionsCache = (data && data.questions) || [];
            } catch (e) { sharedQuestionsCache = []; }
        }
        function renderSharedQuestionsList() {
            const container = document.getElementById('sharedQuestionsList');
            if (!container) return;
            if (!sharedQuestionsCache.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-3);font-size:12.5px;">مفيش أسئلة شائعة كفاية دلوقتي — لسه بدري</p>';
                return;
            }
            container.innerHTML = sharedQuestionsCache.map((q, i) => `
                <div class="shared-q-item" data-idx="${i}" style="background:var(--bg-glass);border:1px solid var(--border);border-radius: var(--radius-md);padding:12px 14px;cursor:pointer;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                        <p style="font-size:13px;line-height:1.6;margin:0;flex:1;">${escapeHtml(q.displayText || '')}</p>
                        <span style="font-size:10.5px;color:var(--accent);background:var(--accent-glow);padding:2px 8px;border-radius: var(--radius-lg);white-space:nowrap;flex-shrink:0;">سألها ${q.askCount} طلاب</span>
                    </div>
                    <div class="shared-q-answer" id="sharedQAnswer${i}" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:12.5px;line-height:1.7;color:var(--text-2);white-space:pre-wrap;"></div>
                </div>
            `).join('');
            container.querySelectorAll('.shared-q-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = Number(item.dataset.idx);
                    const answerEl = document.getElementById(`sharedQAnswer${idx}`);
                    const q = sharedQuestionsCache[idx];
                    if (!answerEl) return;
                    if (answerEl.style.display === 'none') {
                        answerEl.textContent = q.answerText || 'مفيش إجابة محفوظة لسؤال زي ده، جرّب تسأله بنفسك في المحادثة.';
                        answerEl.style.display = 'block';
                    } else {
                        answerEl.style.display = 'none';
                    }
                });
            });
        }
        function openSharedQuestionsModal() {
            openModal('sharedQuestionsModal');
            renderSharedQuestionsList();
            fetchSharedQuestions().then(renderSharedQuestionsList);
        }

        function setSendButtonState(generating) {
            const btn = document.getElementById('sendBtn');
            const icon = document.getElementById('sendBtnIcon');
            if (generating) {
                btn.classList.add('stop-mode');
                icon.className = 'fas fa-stop';
                btn.disabled = false;
                btn.onclick = stopGeneration;
            } else {
                btn.classList.remove('stop-mode');
                icon.className = 'fas fa-paper-plane';
                btn.onclick = sendMessage;
                btn.disabled = document.getElementById('messageInput').value.length === 0 && !pendingAttachment;
            }
        }

        function stopGeneration() {
            if (abortController) abortController.abort();
        }

        async function respondLocally(text, chat, signal) {
            document.getElementById('typingIndicator').classList.add('active');
            await sleep(600, signal);
            if (signal.aborted) { document.getElementById('typingIndicator').classList.remove('active'); return; }

            const fullText = getLocalResponse(text);
            renderFinishedBotMessage(fullText, 'local', false);
        }

        function sleep(ms, signal) {
            return new Promise((resolve) => {
                const t = setTimeout(resolve, ms);
                if (signal) signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
            });
        }

        function createBotMessageShell(botMsg) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message bot';
            msgDiv.id = botMsg.id;
            msgDiv.innerHTML = `
                <div class="msg-avatar" style="background: var(--grad-bold); color: white;"><i class="fas fa-graduation-cap"></i></div>
                <div class="msg-content">
                    <div class="msg-bubble"></div>
                    <div class="msg-meta">
                        <span class="msg-time">جاري الكتابة...</span>
                        <span class="msg-source-icon" style="margin-right:6px;opacity:0.6"></span>
                        <div class="msg-actions"></div>
                    </div>
                </div>
            `;
            document.getElementById('chatContainer').insertBefore(msgDiv, document.getElementById('typingIndicator'));
            return msgDiv;
        }

        // ====================== كتابة الرد لحظة بلحظة (Live Streaming) ======================
        // كل دوال stream* بتقرأ الرد من السيرفر chunk-by-chunk فعليًا، لكن كانت بتراكم
        // الأجزاء دي في متغيّر مخفي وميحطهاش في الشات إلا بعد ما الرد يخلص تمامًا —
        // فكان الطالب بيشوف نقط "بيكتب..." لفترة، وبعدين الرد كله يظهر مرة واحدة.
        // beginBotMessageStream() و streamChunkToUI() بيحلوا المشكلة دي: بيعرضوا الفقاعة
        // فور ما أول جزء من النص يوصل، وبيحدّثوا محتواها مباشرة مع كل جزء جديد.
        function beginBotMessageStream() {
            return { msgDiv: null, botMsg: null };
        }

        function streamChunkToUI(streamState, textSoFar, source) {
            if (!textSoFar) return;
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;
            if (!streamState.msgDiv) {
                // أول جزء نص بيوصل: نقفل نقط "بيكتب..." ونضيف فقاعة الرد فعليًا دلوقتي
                // بدل ما نستناها لحد النهاية.
                document.getElementById('typingIndicator').classList.remove('active');
                streamState.botMsg = { role: 'bot', content: '', source, timestamp: Date.now(), id: `msg-${Date.now()}-b` };
                chat.messages.push(streamState.botMsg);
                streamState.msgDiv = createBotMessageShell(streamState.botMsg);
            }
            streamState.botMsg.content = textSoFar;
            const bubbleDiv = streamState.msgDiv.querySelector('.msg-bubble');
            if (bubbleDiv) bubbleDiv.innerHTML = DOMPurify.sanitize(marked.parse(textSoFar));
            scrollToBottom();
        }

        // بتتنادى مرة واحدة بس، أول ما نص الرد يكون جاهز بالكامل — إما لأن البوت خلّص
        // الرد كله، أو لأن الطالب وقف الرد وعندنا الجزء اللي وصل لحد دلوقتي. لو الرد
        // كان بيتكتب لحظة بلحظة بالفعل (streamState من streamChunkToUI)، بنستخدم نفس
        // الفقاعة اللي ظهرت أول أول بدل ما نضيف فقاعة تانية مكررة — وبنقفل عليها
        // بالتنسيق النهائي (أزرار، مصدر، صوت...).
        function renderFinishedBotMessage(text, source, stopped, streamState) {
            document.getElementById('typingIndicator').classList.remove('active');
            const chat = chats.find(c => c.id === currentChatId);
            const finalText = stopped ? cleanupTruncatedMarkdown(text) : text;
            let msgDiv, botMsg;
            if (streamState && streamState.msgDiv && streamState.botMsg) {
                botMsg = streamState.botMsg;
                botMsg.content = finalText;
                msgDiv = streamState.msgDiv;
            } else {
                botMsg = { role: 'bot', content: finalText, source, timestamp: Date.now(), id: `msg-${Date.now()}-b` };
                chat.messages.push(botMsg);
                msgDiv = createBotMessageShell(botMsg);
            }
            if (stopped) {
                finalizeStoppedBotMessage(msgDiv, botMsg);
            } else {
                finalizeBotMessage(msgDiv, botMsg);
            }
            saveData();
            return { msgDiv, botMsg };
        }

        // بتتنادى لما الطالب يوقف الرد وهو لسه بيتكتب: بتخلّص تنسيق النص اللي وصل لحد
        // دلوقتي بشكل نهائي (مش هيفضل نص خام غير منسّق)، وبتضيف شارة صغيرة أنيقة توضّح
        // إن الرد اتوقف عمدًا مش إنه ناقص لخطأ.
        function finalizeStoppedBotMessage(msgDiv, botMsg) {
            finalizeBotMessage(msgDiv, botMsg);
            const bubbleDiv = msgDiv.querySelector('.msg-bubble');
            const note = document.createElement('div');
            note.className = 'msg-stopped-note';
            note.innerHTML = '<i class="fas fa-circle-stop"></i> تم إيقاف الرد هنا بواسطتك';
            bubbleDiv.appendChild(note);
        }

        // بنك العبارات التحفيزية اللي بتظهر بعد رد الشات بوت — كل عبارة معاها إيموجي مناسب لجوها
        const MOTIVATIONAL_PHRASES = [
            { text: 'شد حيلك، أنت قادر', emoji: '💪' },
            { text: 'خطوة بخطوة للنجاح', emoji: '🌱' },
            { text: 'إنت أذكى مما تتخيل', emoji: '🧠' },
            { text: 'استمر، الطريق واضح', emoji: '✨' },
            { text: 'كل مجهود بيتحسب', emoji: '📈' },
            { text: 'ثق في نفسك أكتر', emoji: '🌟' },
            { text: 'التعب ده هيتنسى والنجاح هيفضل', emoji: '🏆' },
            { text: 'يوم بيوم بتقرب من حلمك', emoji: '🚀' },
            { text: 'أنت شجاع لإنك بتحاول', emoji: '🦁' },
            { text: 'ما تقارنش نفسك بحد، إنت في رحلتك', emoji: '🧭' },
            { text: 'كل سؤال بتفهمه إضافة ليك', emoji: '📚' },
            { text: 'المثابرة سر التفوق', emoji: '🔥' },
            { text: 'إنت هتكون ممرض/ة ممتاز', emoji: '🩺' },
            { text: 'خد نفس، وكمل بثقة', emoji: '🌤️' },
            { text: 'التميز عادة مش صدفة', emoji: '🎯' },
            { text: 'قلبك في مكانه الصح', emoji: '💙' },
            { text: 'إنجازك النهارده بداية أكبر', emoji: '🌈' },
            { text: 'استحقيت الفخر بنفسك', emoji: '🥳' },
            { text: 'الصبر مفتاح كل حاجة حلوة', emoji: '🕊️' },
            { text: 'ادرس بحب، وهتفهم أسرع', emoji: '❤️' },
            { text: 'مفيش مجهود بيضيع', emoji: '☀️' },
            { text: 'إنت أقوى من أي عقبة', emoji: '🌻' },
            { text: 'كل يوم بتتعلم حاجة جديدة', emoji: '🍀' },
            { text: 'النجاح بيحب المحاولة المستمرة', emoji: '👏' },
            { text: 'إنت على الطريق الصح', emoji: '🙌' },
            { text: 'صدقني، الصعب ده هيعدي', emoji: '💫' },
            { text: 'الفهم بياخد وقت، وإنت ماشي كويس', emoji: '⭐' },
            { text: 'افتخر بكل خطوة صغيرة', emoji: '🎉' },
            { text: 'جهدك النهارده هيفرق بكرة', emoji: '🥇' },
            { text: 'إنت بتبني مستقبلك بإيدك', emoji: '🔑' },
            { text: 'العلم نور، وإنت بتنور طريقك', emoji: '🎓' },
            { text: 'استمرارك دليل قوتك', emoji: '📖' },
            { text: 'مفيش حد بيتعلم من غير غلطة', emoji: '🌙' },
            { text: 'كل مذاكرة بتقربك من حلمك', emoji: '🌞' },
            { text: 'إنت بتستحق كل خير', emoji: '🌺' },
            { text: 'ثابر، النتيجة هتستاهل', emoji: '🍃' },
            { text: 'العقبات بتخلي النجاح أحلى', emoji: '💡' },
            { text: 'إنت أهم من أي امتحان', emoji: '👍' },
            { text: 'نفسك الطيبة أقوى سلاح', emoji: '😊' },
            { text: 'إنت مؤهل لكل حاجة حلوة', emoji: '🤲' },
            { text: 'خليك واثق، ربنا معاك', emoji: '🙏' },
            { text: 'الطريق بيبان لمن يكمل', emoji: '🌷' },
            { text: 'مش لازم تكون مثالي، يكفي إنك تحاول', emoji: '🕯️' },
            { text: 'إنت بتزرع دلوقتي وهتحصد بكرة', emoji: '🧡' },
            { text: 'كل صفحة بتقراها فرق', emoji: '💛' },
            { text: 'اطمن، إنت في تحسن مستمر', emoji: '💪' },
            { text: 'إنت جدير بكل نجاح', emoji: '🌱' },
            { text: 'التركيز دلوقتي راحة بكرة', emoji: '🧠' },
            { text: 'إنت مش لوحدك في الرحلة دي', emoji: '✨' },
            { text: 'استحقيت لحظة فخر بنفسك', emoji: '📈' },
            { text: 'المجهود الصغير بيبني الحاجة الكبيرة', emoji: '🌟' },
            { text: 'إنت بطل النهارده وكل يوم', emoji: '🏆' },
            { text: 'واصل، الشمس هتطلع بعد التعب', emoji: '🚀' },
            { text: 'إنت بتتحسن من غير ما تحس', emoji: '🦁' },
            { text: 'صبرك النهارده نجاحك بكرة', emoji: '🧭' },
            { text: 'إنت أهل للثقة اللي حاطها فيك الناس', emoji: '📚' },
            { text: 'الطاقة الإيجابية بتفرق كتير', emoji: '🔥' },
            { text: 'كل حلم كبير بدأ بخطوة صغيرة', emoji: '🩺' },
            { text: 'إنت بتستاهل كل تعب اتعبته', emoji: '🌤️' },
            { text: 'خليك فخور بمشوارك', emoji: '🎯' },
            { text: 'إنت شمعة بتنور لغيرك كمان', emoji: '💙' },
            { text: 'النجاح مش نهاية، هو رحلة مستمرة', emoji: '🌈' },
            { text: 'إنت أقوى مما تتصور', emoji: '🥳' },
            { text: 'كل يوم فرصة جديدة تبدأ فيها من تاني', emoji: '🕊️' },
            { text: 'اهتم بنفسك زي ما بتهتم بمذاكرتك', emoji: '❤️' },
            { text: 'إنت بتستحق الراحة كمان بعد التعب', emoji: '☀️' },
            { text: 'خليك صبور، الثمرة قربت', emoji: '🌻' },
            { text: 'النجاح بيبدأ بقرار إنك متستسلمش', emoji: '🍀' },
            { text: 'إنت غالي على كل اللي بيحبوك', emoji: '👏' },
            { text: 'العمل الجاد بيتكلل بالنجاح دايمًا', emoji: '🙌' },
            { text: 'إنت بتصنع فرق حقيقي', emoji: '💫' },
            { text: 'استمر في العطاء، هيرجعلك أضعاف', emoji: '⭐' },
            { text: 'إنت مصدر فخر لعيلتك', emoji: '🎉' },
            { text: 'كل تحدي بيخليك أقوى', emoji: '🥇' },
            { text: 'إنت بتستاهل الأفضل دايمًا', emoji: '🔑' },
            { text: 'النية الطيبة نص الطريق للنجاح', emoji: '🎓' },
            { text: 'إنت شخص مميز فعلاً', emoji: '📖' },
            { text: 'خليك متفائل، الغد أفضل', emoji: '🌙' },
            { text: 'إنت بتحقق حلمك خطوة خطوة', emoji: '🌞' },
            { text: 'كل يوم بتقرب من هدفك أكتر', emoji: '🌺' },
            { text: 'إنت قدوة لغيرك من غير ما تحس', emoji: '🍃' },
            { text: 'النجاح حليف الصبورين', emoji: '💡' },
            { text: 'إنت أهم استثمار في حياتك', emoji: '👍' },
            { text: 'كل مجهود بذلته هيرجعلك خير', emoji: '😊' },
            { text: 'إنت بتستاهل كل لحظة سعادة', emoji: '🤲' },
            { text: 'استمر بثقة، النتيجة هتفرحك', emoji: '🙏' },
            { text: 'إنت جوهرة، مهما كانت الظروف', emoji: '🌷' },
            { text: 'النجاح رحلة مش سباق', emoji: '🕯️' },
            { text: 'إنت بتنمو كل يوم أكتر من امبارح', emoji: '🧡' },
            { text: 'خليك ممتن لكل خطوة قطعتها', emoji: '💛' },
            { text: 'إنت قادر على تجاوز أي صعوبة', emoji: '💪' },
            { text: 'المذاكرة دلوقتي استثمار لمستقبلك', emoji: '🌱' },
            { text: 'إنت بتستحق كل تشجيع بتسمعه', emoji: '🧠' },
            { text: 'الثقة بالنفس نص النجاح', emoji: '✨' },
            { text: 'إنت شخص طيب وقادر في نفس الوقت', emoji: '📈' },
            { text: 'خليك فخور بكل تفصيلة كويسة عملتها', emoji: '🌟' },
            { text: 'إنت مش وحدك، ربنا معاك في كل خطوة', emoji: '🏆' },
            { text: 'النجاح بيحتاج وقت، خليك صبور', emoji: '🚀' },
            { text: 'إنت هتوصل لحلمك بإذن الله', emoji: '🦁' },
            { text: 'كل يوم صعب بيخلص وبييجي بعده يوم أسهل', emoji: '🧭' },
            { text: 'إنت بتستاهل التقدير اللي جواك', emoji: '📚' },
            { text: 'استمر، إنت أقرب مما تتخيل', emoji: '🔥' },
            { text: 'إنت جميل من جوه وده هيبان في شغلك', emoji: '🩺' },
            { text: 'خليك واثق إن التعب مش هيروح هدر', emoji: '🌤️' },
            { text: 'إنت بتزرع الخير في كل حاجة بتعملها', emoji: '🎯' },
            { text: 'النجاح بيبدأ بخطوة أول شجاعة', emoji: '💙' },
            { text: 'إنت هتفتخر بنفسك قريب أوي', emoji: '🌈' },
            { text: 'كل عقبة دلوقتي درس لبكرة', emoji: '🥳' },
            { text: 'إنت أقوى من كل توتر بتحس بيه', emoji: '🕊️' },
            { text: 'اطمن على نفسك، إنت بتتقدم', emoji: '❤️' },
            { text: 'إنت بتستاهل كل حاجة حلوة جاية ليك', emoji: '☀️' },
            { text: 'النجاح مش حظ، هو مجهود متراكم', emoji: '🌻' },
            { text: 'إنت شخص مسؤول وده أعظم صفة', emoji: '🍀' },
            { text: 'خليك رحيم بنفسك زي ما إنت طيب مع غيرك', emoji: '👏' },
            { text: 'إنت بتصنع تاريخك بنفسك', emoji: '🙌' },
            { text: 'كل امتحان فرصة تثبت فيها لنفسك إنك قادر', emoji: '💫' },
            { text: 'إنت بتستاهل كل نجاح جاي', emoji: '⭐' },
            { text: 'استمر، حلمك مستنيك', emoji: '🎉' },
            { text: 'إنت هتكون فخر لمهنتك', emoji: '🥇' },
            { text: 'خليك متأكد إن ربنا بيكافئ التعب', emoji: '🔑' },
            { text: 'إنت بتنور حياة كل اللي حواليك', emoji: '🎓' },
            { text: 'النجاح رفيق الصادقين في مجهودهم', emoji: '📖' },
            { text: 'إنت بتستحق كل دقيقة راحة كمان', emoji: '🌙' },
            { text: 'كل خطوة بتاخدها بتقربك من حلمك أكتر', emoji: '🌞' },
            { text: 'إنت شخص يستاهل كل الاحترام', emoji: '🌺' },
            { text: 'خليك مؤمن بقدراتك', emoji: '🍃' },
            { text: 'إنت هتعدي الصعب ده بسلام', emoji: '💡' },
            { text: 'النجاح بيحب اللي بيثابروا مهما حصل', emoji: '👍' },
            { text: 'إنت بتستاهل تفتخر بنفسك دلوقتي مش بس بكرة', emoji: '😊' },
            { text: 'استمر، أنت في الطريق الصح فعلاً', emoji: '🤲' },
            { text: 'إنت أمل لغيرك من غير ما تحس', emoji: '🙏' },
            { text: 'خليك صبور، اللي بعد الصعب حلو دايمًا', emoji: '🌷' },
            { text: 'إنت بتستاهل كل كلمة تشجيع بتسمعها', emoji: '🕯️' },
            { text: 'النجاح بيبدأ من جوه القلب', emoji: '🧡' },
            { text: 'إنت هتفرح قريب بثمرة تعبك', emoji: '💛' },
            { text: 'كل يوم بتديله من وقتك هيرجعلك أضعاف', emoji: '💪' },
            { text: 'إنت بتستاهل تحس بالفخر دلوقتي', emoji: '🌱' },
            { text: 'استمر، النور في آخر النفق قريب', emoji: '🧠' },
            { text: 'إنت شخص عنده كل مقومات النجاح', emoji: '✨' },
            { text: 'خليك ثابت، الثبات نص النجاح', emoji: '📈' },
            { text: 'إنت بتستاهل تشوف حلمك حقيقة', emoji: '🌟' },
            { text: 'النجاح بيتحقق باستمرار مش بطفرة', emoji: '🏆' },
            { text: 'إنت أقوى مما تعتقد بكتير', emoji: '🚀' },
            { text: 'كل خطوة صغيرة بتبني إنجاز كبير', emoji: '🦁' },
            { text: 'إنت بتستاهل كل خير جاي في طريقك', emoji: '🧭' },
            { text: 'استمر، الصبر مفتاح الفرج', emoji: '📚' },
            { text: 'إنت هتوصل، بس خليك مستمر', emoji: '🔥' },
            { text: 'خليك متأكد إن كل تعب له نتيجة', emoji: '🩺' },
            { text: 'إنت بتستاهل تحتفل بكل إنجاز صغير', emoji: '🌤️' },
            { text: 'النجاح مش بعيد زي ما بيبان', emoji: '🎯' },
            { text: 'إنت شخص واعد ومجتهد', emoji: '💙' },
            { text: 'كل يوم مذاكرة بيقربك من حلم كبير', emoji: '🌈' },
            { text: 'إنت بتستاهل تفتخر بمشوارك من الأول للآخر', emoji: '🥳' },
            { text: 'استمر، مفيش حاجة مستحيلة مع الإصرار', emoji: '🕊️' },
            { text: 'إنت هتبقى قدوة يوم من الأيام', emoji: '❤️' },
            { text: 'خليك متفائل، الغيوم دايمًا بتتفرق', emoji: '☀️' },
            { text: 'إنت بتستاهل كل نجاح هيجيلك', emoji: '🌻' },
            { text: 'النجاح بيحصل مع اللي بيؤمنوا بنفسهم', emoji: '🍀' },
            { text: 'إنت شخص رائع فعلاً', emoji: '👏' },
            { text: 'كل يوم بتتحدى فيه نفسك بتكسب', emoji: '🙌' },
            { text: 'إنت بتستاهل الدعم اللي حواليك', emoji: '💫' },
            { text: 'استمر، إنت أقرب للحلم من أي وقت', emoji: '⭐' },
            { text: 'إنت هتفخر بنفسك جدًا لما توصل', emoji: '🎉' },
            { text: 'خليك صبور، الحلاوة جاية بعد التعب', emoji: '🥇' },
            { text: 'إنت بتستاهل كل يوم سعيد', emoji: '🔑' },
            { text: 'النجاح بيحب اللي بيحاولوا برضا', emoji: '🎓' },
            { text: 'إنت شخص عنده طاقة إيجابية', emoji: '📖' },
            { text: 'كل مجهود دلوقتي استثمار في مستقبلك', emoji: '🌙' },
            { text: 'إنت بتستاهل تحس بالراحة النفسية', emoji: '🌞' },
            { text: 'استمر، الطريق بيقصر كل يوم', emoji: '🌺' },
            { text: 'إنت هتشكر نفسك على التعب ده يوم ما', emoji: '🍃' },
            { text: 'خليك متأكد إن ربنا مايضيعش تعب حد', emoji: '💡' },
            { text: 'إنت بتستاهل كل نجاح صغير وكبير', emoji: '👍' },
            { text: 'النجاح بيبدأ بيوم واحد وبيكمل', emoji: '😊' },
            { text: 'إنت شخص طموح وده حلو أوي', emoji: '🤲' },
            { text: 'كل خطوة بتاخدها فخر ليك', emoji: '🙏' },
            { text: 'إنت بتستاهل كل لحظة فرح جاية', emoji: '🌷' },
            { text: 'استمر، إنت أقوى من التعب', emoji: '🕯️' },
            { text: 'إنت هتوصل لأحلامك بإذن الله', emoji: '🧡' },
            { text: 'خليك واثق إن الغد هيكون أحلى', emoji: '💛' },
            { text: 'إنت بتستاهل الثقة اللي حاطها الناس فيك', emoji: '💪' },
            { text: 'النجاح بيحتاج قلب صابر وعقل مصمم', emoji: '🌱' },
            { text: 'إنت شخص جدير بكل احترام', emoji: '🧠' },
            { text: 'كل يوم فرصة تثبت فيها لنفسك تاني إنك قوي', emoji: '✨' },
            { text: 'إنت بتستاهل كل تشجيع حواليك', emoji: '📈' },
            { text: 'استمر، أنت شعلة أمل لغيرك', emoji: '🌟' },
            { text: 'إنت هتفرح بنفسك قريب جدًا', emoji: '🏆' },
            { text: 'خليك متأكد إن كل خطوة ليها معنى', emoji: '🚀' },
            { text: 'إنت بتستاهل النجاح اللي جاي', emoji: '🦁' },
            { text: 'النجاح رحلة صبر وثقة مع بعض', emoji: '🧭' },
            { text: 'إنت شخص هيغير حياة ناس كتير', emoji: '📚' },
            { text: 'كل امتحان بيقربك خطوة من حلمك', emoji: '🔥' },
            { text: 'إنت بتستاهل الابتسامة دي على وشك', emoji: '🩺' },
            { text: 'استمر، لسه فيه أمل كبير قدامك', emoji: '🌤️' },
            { text: 'إنت هتكون سبب فخر لكل اللي بيحبوك', emoji: '🎯' },
            { text: 'خليك ثابت على هدفك مهما طال الطريق', emoji: '💙' },
            { text: 'إنت بتستاهل تنجح بجدارة', emoji: '🌈' },
            { text: 'النجاح بيحب اللي بيصمموا على الاستمرار', emoji: '🥳' },
            { text: 'إنت شخص قيّم جدًا', emoji: '🕊️' },
            { text: 'كل يوم بتضيف فيه لبنة في بناء حلمك', emoji: '❤️' }
        ];

        // ============ القسم الديني ============
        const QURAN_SURAHS = [
            { n: 1, name: 'الفاتحة' },
            { n: 2, name: 'البقرة' },
            { n: 3, name: 'آل عمران' },
            { n: 4, name: 'النساء' },
            { n: 5, name: 'المائدة' },
            { n: 6, name: 'الأنعام' },
            { n: 7, name: 'الأعراف' },
            { n: 8, name: 'الأنفال' },
            { n: 9, name: 'التوبة' },
            { n: 10, name: 'يونس' },
            { n: 11, name: 'هود' },
            { n: 12, name: 'يوسف' },
            { n: 13, name: 'الرعد' },
            { n: 14, name: 'إبراهيم' },
            { n: 15, name: 'الحجر' },
            { n: 16, name: 'النحل' },
            { n: 17, name: 'الإسراء' },
            { n: 18, name: 'الكهف' },
            { n: 19, name: 'مريم' },
            { n: 20, name: 'طه' },
            { n: 21, name: 'الأنبياء' },
            { n: 22, name: 'الحج' },
            { n: 23, name: 'المؤمنون' },
            { n: 24, name: 'النور' },
            { n: 25, name: 'الفرقان' },
            { n: 26, name: 'الشعراء' },
            { n: 27, name: 'النمل' },
            { n: 28, name: 'القصص' },
            { n: 29, name: 'العنكبوت' },
            { n: 30, name: 'الروم' },
            { n: 31, name: 'لقمان' },
            { n: 32, name: 'السجدة' },
            { n: 33, name: 'الأحزاب' },
            { n: 34, name: 'سبأ' },
            { n: 35, name: 'فاطر' },
            { n: 36, name: 'يس' },
            { n: 37, name: 'الصافات' },
            { n: 38, name: 'ص' },
            { n: 39, name: 'الزمر' },
            { n: 40, name: 'غافر' },
            { n: 41, name: 'فصلت' },
            { n: 42, name: 'الشورى' },
            { n: 43, name: 'الزخرف' },
            { n: 44, name: 'الدخان' },
            { n: 45, name: 'الجاثية' },
            { n: 46, name: 'الأحقاف' },
            { n: 47, name: 'محمد' },
            { n: 48, name: 'الفتح' },
            { n: 49, name: 'الحجرات' },
            { n: 50, name: 'ق' },
            { n: 51, name: 'الذاريات' },
            { n: 52, name: 'الطور' },
            { n: 53, name: 'النجم' },
            { n: 54, name: 'القمر' },
            { n: 55, name: 'الرحمن' },
            { n: 56, name: 'الواقعة' },
            { n: 57, name: 'الحديد' },
            { n: 58, name: 'المجادلة' },
            { n: 59, name: 'الحشر' },
            { n: 60, name: 'الممتحنة' },
            { n: 61, name: 'الصف' },
            { n: 62, name: 'الجمعة' },
            { n: 63, name: 'المنافقون' },
            { n: 64, name: 'التغابن' },
            { n: 65, name: 'الطلاق' },
            { n: 66, name: 'التحريم' },
            { n: 67, name: 'الملك' },
            { n: 68, name: 'القلم' },
            { n: 69, name: 'الحاقة' },
            { n: 70, name: 'المعارج' },
            { n: 71, name: 'نوح' },
            { n: 72, name: 'الجن' },
            { n: 73, name: 'المزمل' },
            { n: 74, name: 'المدثر' },
            { n: 75, name: 'القيامة' },
            { n: 76, name: 'الإنسان' },
            { n: 77, name: 'المرسلات' },
            { n: 78, name: 'النبأ' },
            { n: 79, name: 'النازعات' },
            { n: 80, name: 'عبس' },
            { n: 81, name: 'التكوير' },
            { n: 82, name: 'الانفطار' },
            { n: 83, name: 'المطففين' },
            { n: 84, name: 'الانشقاق' },
            { n: 85, name: 'البروج' },
            { n: 86, name: 'الطارق' },
            { n: 87, name: 'الأعلى' },
            { n: 88, name: 'الغاشية' },
            { n: 89, name: 'الفجر' },
            { n: 90, name: 'البلد' },
            { n: 91, name: 'الشمس' },
            { n: 92, name: 'الليل' },
            { n: 93, name: 'الضحى' },
            { n: 94, name: 'الشرح' },
            { n: 95, name: 'التين' },
            { n: 96, name: 'العلق' },
            { n: 97, name: 'القدر' },
            { n: 98, name: 'البينة' },
            { n: 99, name: 'الزلزلة' },
            { n: 100, name: 'العاديات' },
            { n: 101, name: 'القارعة' },
            { n: 102, name: 'التكاثر' },
            { n: 103, name: 'العصر' },
            { n: 104, name: 'الهمزة' },
            { n: 105, name: 'الفيل' },
            { n: 106, name: 'قريش' },
            { n: 107, name: 'الماعون' },
            { n: 108, name: 'الكوثر' },
            { n: 109, name: 'الكافرون' },
            { n: 110, name: 'النصر' },
            { n: 111, name: 'المسد' },
            { n: 112, name: 'الإخلاص' },
            { n: 113, name: 'الفلق' },
            { n: 114, name: 'الناس' }
        ];
        const PROPHETS_STORIES = [
            { name: 'آدم عليه السلام', story: [
                'قبل أن توجد الأرض بشرًا واحدًا، قال الله للملائكة: "إني جاعل في الأرض خليفة". تعجبت الملائكة: أتجعل فيها من يفسد فيها ويسفك الدماء؟ فجاء الجواب الأزلي: "إني أعلم ما لا تعلمون".',
                'خلق الله آدم من طين، وسوّاه بيده، ونفخ فيه من روحه، فإذا هو بشر حي يتحرك. ثم علّمه أسماء كل شيء — علمًا لم يكن عند الملائكة أنفسهم — وأمر الملائكة بالسجود له تكريمًا، فسجدوا جميعًا إلا إبليس، استكبر وأبى، فكان أول عاصٍ في الوجود.',
                'أسكن الله آدم الجنة مع زوجه حواء، وأباح لهما كل شيء فيها إلا شجرة واحدة. وسوس لهما إبليس حتى أكلا منها، فبدت لهما سوءاتهما، وأدركا خطأهما فورًا. لم ييأسا، بل بكيا وتابا بكلمات علّمهما إياها ربهما: "ربنا ظلمنا أنفسنا وإن لم تغفر لنا وترحمنا لنكونن من الخاسرين".',
                'قَبِل الله توبتهما، لكن الحكمة اقتضت أن يهبطا إلى الأرض، لتبدأ رحلة البشرية. فكان آدم أول إنسان، وأول نبي، وقصته الدرس الأول: أن باب التوبة لا يُغلق أبدًا مهما عظم الذنب.'
            ] },
            { name: 'إدريس عليه السلام', story: [
                'بعد آدم بأجيال، وُلد رجل جمع بين النبوة والعلم في زمن كانت المعرفة فيه نادرة. قيل إنه أول من خطّ بالقلم، وأول من نظر في علوم الفلك والحساب، فكان معلّم قومه قبل أن يكون نبيهم.',
                'دعا إدريس قومه إلى توحيد الله بصبر طويل، لا يكلّ ولا يملّ، وسط قوم أكثرهم معرض. لم يُثنه ذلك عن الاستمرار، وظل صادقًا صابرًا حتى وصفه القرآن بأنه "كان صديقًا نبيًا".',
                'وكان جزاؤه من الله عظيمًا، فرفعه إلى مكان عالٍ تكريمًا له، كما قال تعالى: "ورفعناه مكانًا عليًا" — تكريم نادر لم يُذكر لغيره من الأنبياء بهذا اللفظ، خلّده القرآن عبرة لكل صابر على الحق.'
            ] },
            { name: 'نوح عليه السلام', story: [
                'تسعمائة وخمسون عامًا! هذا هو عمر الدعوة التي حملها نوح لقومه وحده. دعاهم ليلًا ونهارًا، سرًا وجهرًا، بكل أسلوب يعرفه الإنسان ليقنع قلبًا مغلقًا. وكلما دعاهم زادهم ذلك فرارًا، حتى وضعوا أصابعهم في آذانهم كي لا يسمعوا صوته.',
                'استهزأ القوم به حين أمره الله ببناء سفينة ضخمة في أرض يابسة لا بحر فيها. كانوا يمرون عليه يسخرون: نبيّ يصنع سفينة على الرمال! لكنه واصل العمل صامتًا، يعلم ما لا يعلمون.',
                'وحين تم الأمر، فار التنور، وانفتحت السماء بماء منهمر، وتفجرت الأرض عيونًا، فالتقى الماءان على أمر قد قُدر. حمل نوح في السفينة من كل زوجين اثنين، ومن آمن معه — وما آمن معه إلا قليل. حتى ابنه رفض الركوب معتصمًا بجبل يظنه ينجيه، فكان من المغرقين.',
                'استقرت السفينة أخيرًا على الجودي، وقيل: "يا أرض ابلعي ماءك، ويا سماء أقلعي". بدأت الحياة من جديد على الأرض، ونجا من الطوفان من ثبت على الإيمان، فكان نوح أول رسول واجه التكذيب الجماعي، وأعظم مثال في الصبر على الدعوة.'
            ] },
            { name: 'هود عليه السلام', story: [
                'كان قوم عاد أعظم أمة في زمانهم قوة وبناءً، شادوا مدنًا على كل مرتفع كأنهم يتحدون الزمن، واغتروا بأجسادهم الطويلة العريضة حتى ظنوا أن لا أحد أقوى منهم على وجه الأرض.',
                'جاءهم هود من بينهم، نسيبهم، فقال: اعبدوا الله ما لكم من إله غيره. فردّوا عليه بسخرية: أجئتنا لنترك آلهتنا من أجلك؟ فأنت في سفاهة ونحن نظنك من الكاذبين.',
                'أنذرهم مرارًا، فأصروا على الاستكبار، حتى رأوا سحابة في الأفق ظنوها مطرًا يُنقذهم من قحط أصابهم، ففرحوا. لكنها كانت "ريحًا فيها عذاب أليم"، ريحًا صرصرًا عاتية، سُلّطت عليهم سبع ليالٍ وثمانية أيام حسومًا، تركتهم كأعجاز نخل خاوية، فما أبقت منهم أحدًا إلا من آمن مع هود.'
            ] },
            { name: 'صالح عليه السلام', story: [
                'ورث قوم ثمود الأرض من بعد عاد، ونحتوا من الجبال بيوتًا فارهين، يظنون أنهم آمنون من كل عذاب لأنهم أهل حصانة وصخر متين.',
                'بعث الله فيهم صالحًا يدعوهم للتوحيد، فطلبوا منه آية معجزة، فأخرج الله لهم من صخرة ناقة عظيمة، وقال لهم صالح: هذه ناقة الله، لها شرب يوم ولكم شرب يوم معلوم، فلا تمسّوها بسوء فيأخذكم عذاب أليم.',
                'عاشوا معها زمنًا، ثم تآمر أشقاهم فعقرها، تحديًا صريحًا لأمر الله. أمهلهم صالح ثلاثة أيام يتمتعون في ديارهم، محذرًا إياهم، لكنهم لم يرعووا. وفي الصباح الرابع أخذتهم الصيحة، فأصبحوا في ديارهم جاثمين، ونجّى الله صالحًا ومن آمن معه برحمته.'
            ] },
            { name: 'إبراهيم عليه السلام', story: [
                'وُلد إبراهيم في قوم يعبدون الأصنام، ووالده صانعها. لم يقتنع قلبه الصغير يومًا بحجر لا ينفع ولا يضر، وأخذ يتأمل الكون بعقله: رأى نجمًا فقال هذا ربي، فلما أفل قال لا أحب الآفلين، حتى اهتدى إلى خالق السماوات والأرض.',
                'واجه أباه بالحوار الهادئ اللين: "يا أبتِ لم تعبد ما لا يسمع ولا يبصر ولا يغني عنك شيئًا؟" فلم يُجب إلا بالتهديد. فلما يئس من قومه، دخل ذات يوم معبدهم وحطّم الأصنام كلها إلا كبيرها، وعلّق الفأس عليه، ليقول لهم حين سألوه: بل فعله كبيرهم هذا فاسألوهم إن كانوا ينطقون — فبُهتوا.',
                'غضب القوم وأشعلوا نارًا عظيمة ليحرقوه فيها، لكن الله قال: "يا نار كوني بردًا وسلامًا على إبراهيم" — فخرج منها سالمًا لم تمسه شعلة واحدة.',
                'هاجر بعدها بدينه، وترك زوجته هاجر وابنه الرضيع إسماعيل وحدهما في وادٍ لا زرع فيه بأمر الله، فتفجرت زمزم إجابة لسعي هاجر بين الصفا والمروة. وحين شبّ إسماعيل، رأى إبراهيم في المنام أنه يذبحه، فأخبر ابنه، فقال الابن البار: "يا أبتِ افعل ما تؤمر ستجدني إن شاء الله من الصابرين"، ففداه الله بذبح عظيم. ثم رفع إبراهيم وإسماعيل قواعد الكعبة معًا، وهما يدعوان: "ربنا تقبل منا إنك أنت السميع العليم"، فكان إبراهيم أبًا للأنبياء من بعده، وخليل الرحمن.'
            ] },
            { name: 'لوط عليه السلام', story: [
                'كان لوط ابن أخي إبراهيم، آمن معه وهاجر، ثم أرسله الله إلى قرية سدوم، حيث ابتدع أهلها فاحشة لم يسبقهم بها أحد من العالمين.',
                'دعاهم لوط للطهارة مرارًا، فسخروا منه وهددوه بالطرد من قريتهم. وذات ليلة، نزل عليه ضيوف في صورة شبان حسان، فهرع قومه إليه يريدون بهم سوءًا، فضاق بهم لوط ذرعًا وقال: "لو أن لي بكم قوة أو آوي إلى ركن شديد".',
                'كشف له ضيوفه أنهم ملائكة، وأنهم أُرسلوا لإهلاك القرية، وأمروه بالخروج بأهله ليلًا دون التفات، إلا امرأته فقد أصابها ما أصاب قومها. وفي الصباح، قلب الله القرية عاليها سافلها، وأمطرها حجارة من سجيل، فنجا لوط ومن آمن معه، وبقيت قصته عبرة إلى يوم الدين.'
            ] },
            { name: 'إسماعيل عليه السلام', story: [
                'كان طفلًا رضيعًا حين تركه أبوه إبراهيم مع أمه هاجر في وادٍ مكة الجرداء، لا ماء فيه ولا زرع. سعت الأم بين جبلي الصفا والمروة سبع مرات تبحث عن غوث، حتى فجّر الله زمزم تحت قدمي طفلها الباكي، فارتوى الوادي وسكنه الناس من حوله.',
                'شبّ إسماعيل في تلك الأرض المباركة، بارًا صادق الوعد، حتى إذا بلغ معه السعي، رأى أبوه في المنام أنه يذبحه. لم يتردد الابن ولم يجزع، بل قال كلمته الخالدة: "يا أبتِ افعل ما تؤمر ستجدني إن شاء الله من الصابرين". وحين تله للجبين، فداه الله بذبح عظيم، فكانت أعظم دروس التسليم لأمر الله في تاريخ البشرية.',
                'وحين كبر، شارك أباه في رفع قواعد بيت الله الحرام، وأصبح جد العرب المستعربة، ومنه امتدت سلسلة النسب حتى وصلت إلى خاتم الأنبياء محمد ﷺ.'
            ] },
            { name: 'إسحاق عليه السلام', story: [
                'حين بلغ إبراهيم وزوجته سارة من الكبر عتيًا، ويئسا من الولد، جاءت الملائكة تبشرهما بغلام عليم. ضحكت سارة متعجبة، فقيل لها: "أتعجبين من أمر الله؟ رحمة الله وبركاته عليكم أهل البيت".',
                'وُلد إسحاق بشارة من السماء، ونشأ نبيًا صالحًا، امتداداً لدعوة أبيه في التوحيد. ومن نسله استمرت سلسلة النبوة جيلًا بعد جيل، حتى وصلت إلى يعقوب ثم يوسف، فكان حلقة الوصل التي حملت الرسالة عبر القرون.'
            ] },
            { name: 'يعقوب عليه السلام', story: [
                'هو ابن إسحاق، ولُقّب بإسرائيل، وكان أبًا لاثني عشر ولدًا، أحبّ منهم يوسف حبًا شديدًا لما رأى فيه من نور خاص. حسده إخوته على هذا الحب، حتى دبّروا له مكيدة وألقوه في غيابة الجب، ثم أتوا أباهم يبكون بقميص ملطخ بدم كاذب.',
                'لم يُصدّق يعقوب القصة كاملة، وقال كلمته المشهورة: "فصبر جميل والله المستعان على ما تصفون". عاش بعدها سنوات طويلة من الحزن على فراق ابنه، حتى ابيضّت عيناه من كثرة البكاء، وهو كظيم لا يشكو إلا لله.',
                'وحين جاء الفرج أخيرًا، وأرسل يوسف قميصه من مصر، ألقاه إخوته على وجه أبيهم فارتد بصيرًا في لحظة، وقال: "ألم أقل لكم إني أعلم من الله ما لا تعلمون". فكانت لمّ الشمل بعد الفراق من أجمل ختامات القصص القرآنية، وسافر يعقوب بأهله كلهم ليجتمع بابنه في مصر عزيزًا مكينًا.'
            ] },
            { name: 'يوسف عليه السلام', story: [
                'رأى يوسف وهو صبي رؤيا عجيبة: أحد عشر كوكبًا والشمس والقمر ساجدين له. حذّره أبوه من أن يقصّها على إخوته، لكن الحسد كان قد استقر في قلوبهم من قبل. اتفقوا على التخلص منه، فألقوه في غيابة الجب وهو يستغيث، ثم باعوه لقافلة مسافرة بثمن بخس دراهم معدودة.',
                'وصل يوسف إلى مصر رقيقًا، فاشتراه عزيز البلاد وأكرم مثواه. كبر يوسف في بيته وسيمًا حسن الخلق، حتى راودته امرأة العزيز عن نفسه وغلّقت الأبواب، فقال معتصمًا: "معاذ الله إنه ربي أحسن مثواي". فرّ منها هاربًا، لكن كيدهن اجتمع عليه، فسُجن ظلمًا سنوات رغم براءته، وهو صابر يدعو الناس إلى ربه حتى داخل السجن.',
                'فسّر يوسف رؤيا الملك بسبع سنين خصب تليها سبع سنين جدب، فأُخرج من السجن وعُيّن على خزائن الأرض لحكمته وأمانته. وحين جاءت سنوات المجاعة، قدم إخوته إلى مصر يطلبون الطعام دون أن يعرفوه، فعاملهم بكرم، ثم كشف لهم نفسه أخيرًا: "أنا يوسف وهذا أخي".',
                'استقدم أباه وأمه وإخوته جميعًا إلى مصر، وسجد له أبواه وإخوته الأحد عشر تحقيقًا لرؤياه الأولى، وقال حينها الكلمة التي تختصر القصة كلها: "إن ربي لطيف لما يشاء إنه هو العليم الحكيم". فكانت قصته أحسن القصص، جمعت بين الصبر والعفو والحكمة.'
            ] },
            { name: 'أيوب عليه السلام', story: [
                'كان أيوب رجلًا غنيًا كثير المال والولد، عظيم الشكر لربه. ثم ابتلاه الله ليمتحن صبره، فذهب ماله كله في لحظات، ومات أبناؤه جميعًا، وأصابه مرض عضال في جسده أقعده سنوات طويلة، حتى هجره من حوله إلا زوجته الوفية التي بقيت ترعاه.',
                'ومع كل هذا، لم يخرج من فم أيوب شكوى واحدة تجرح صبره، ولم يتسخط على قدر ربه لحظة. وحين اشتد به الألم، لم يدعُ بجزع، بل توجه إلى الله بأرق دعاء عرفته البشرية: "أني مسّني الضر وأنت أرحم الراحمين".',
                'استجاب الله له فورًا: "اركض برجلك هذا مغتسل بارد وشراب"، فقام أيوب معافى كأن لم يصبه شيء، وردّ الله له أهله ومثلهم معهم رحمة من عنده وذكرى للعابدين. فصار اسمه مرادفًا للصبر الجميل إلى اليوم.'
            ] },
            { name: 'شعيب عليه السلام', story: [
                'أُرسل شعيب إلى أهل مدين، قوم اشتهروا بالتطفيف في الكيل والميزان، يأخذون من الناس زيادة ويعطونهم نقصانًا، وينشرون الفساد في تجارتهم. لُقّب شعيب بـ"خطيب الأنبياء" لفصاحة لسانه وحكمة موعظته.',
                'دعاهم برفق: "يا قوم اعبدوا الله ما لكم من إله غيره... وأوفوا الكيل والميزان بالقسط". لكنهم استكبروا وهددوه بالرجم والطرد، بل قالوا له ساخرين: "أصلاتك تأمرك أن نترك ما يعبد آباؤنا؟".',
                'لما استمر عنادهم، أنذرهم عذابًا يوم قريب، فأخذتهم صيحة مروّعة وظلة من فوقهم، فأصبحوا في ديارهم جاثمين كأن لم يغنوا فيها، ونجّى الله شعيبًا ومن آمن معه برحمته.'
            ] },
            { name: 'موسى عليه السلام', story: [
                'وُلد موسى في زمن فرعون الذي كان يذبح أبناء بني إسرائيل خوفًا من نبوءة بزوال ملكه. أوحى الله لأمه أن تلقيه في صندوق باليم حين تخاف عليه، فحمله الماء حتى التقطه آل فرعون، فتربى في قصر عدوّه دون أن يدري أحد.',
                'حين كبر، رأى قبطيًا يظلم إسرائيليًا فوكزه فمات، ففرّ خائفًا إلى مدين، حيث سقى للفتاتين وتزوج إحداهما بعد أن عمل عند أبيهما سنوات. وفي طريق عودته، رأى نارًا عند جبل الطور، فناداه ربه من الشجرة: "إني أنا الله رب العالمين"، وأعطاه معجزتي العصا واليد البيضاء، وأرسله إلى فرعون.',
                'واجه موسى فرعون وسحرته بثبات، فألقى السحرة عصيّهم فإذا هي حبال تسحر الأعين، فألقى موسى عصاه فابتلعت ما صنعوا، فسجد السحرة إيمانًا في لحظة واحدة رغم تهديد فرعون لهم بالقتل.',
                'استمر العناد، فخرج موسى ببني إسرائيل ليلًا، ولحقهم فرعون بجيشه حتى أدركهم عند البحر. ضرب موسى البحر بعصاه فانفلق اثني عشر طريقًا يابسة، عبر منها بنو إسرائيل، فلما دخل فرعون وجنوده أطبق الله عليهم الماء، فغرقوا جميعًا وهو يصرخ بإيمان متأخر لا ينفعه.'
            ] },
            { name: 'هارون عليه السلام', story: [
                'كان هارون أخا موسى الأكبر، أفصح منه لسانًا، فدعا موسى ربه حين أُرسل إلى فرعون: "واجعل لي وزيرًا من أهلي، هارون أخي، اشدد به أزري وأشركه في أمري". فاستجاب الله له، وأرسلهما معًا يحملان رسالة واحدة.',
                'حين ذهب موسى لميقات ربه أربعين ليلة، تركه خليفة على بني إسرائيل، فعبد القوم عجلًا من ذهب صنعه لهم السامري. حاول هارون منعهم بكل ما استطاع، وقال: "يا قوم إنما فتنتم به"، لكنهم أصروا حتى عاد موسى غاضبًا. برّأه الله من أي تقصير، وبقي مثالًا للأخ الناصح الصادق في أصعب المواقف.'
            ] },
            { name: 'ذو الكفل عليه السلام', story: [
                'يذكره القرآن باسم مختصر لكن بمكانة عالية، ضمن قائمة الصابرين المصطفين الأخيار: "وإسماعيل وإلياس وذا الكفل، كل من الأخيار". قيل إنه سُمّي بذلك لأنه تكفّل بعمل صالح كثير، والتزم به رغم صعوبته، ووفى بما وعد.',
                'اشتهر بالصبر على القضاء بالعدل بين الناس، وبمواصلة الخير دون كلل، حتى صار اسمه رمزًا للوفاء بالعهد، وإن كانت تفاصيل قصته أقل ظهورًا من غيره من الأنبياء، إلا أن ذكره في صحبة الأخيار يكفي شرفًا ومكانة.'
            ] },
            { name: 'داود عليه السلام', story: [
                'كان داود جنديًا شجاعًا قبل أن يكون نبيًا وملكًا، اشتهر بقتله للطاغية جالوت بمقلاعه وحده وسط جيش عظيم، فمنحه الله بعدها الملك والحكمة والنبوة معًا.',
                'سخّر الله له الجبال تسبّح معه إذا رفع صوته، والطير تجتمع حوله مرددة تسبيحه، وألان له الحديد فصنع منه دروعًا سابغة، فكان أول من صنع الدروع الحلقية في التاريخ.',
                'اشتهر بعدله في القضاء، وحادثة الخصمين اللذين تسورا عليه المحراب لاختباره كانت درسًا في سرعة الرجوع إلى الحق والاستغفار. آتاه الله الزبور، وكان كثير العبادة، يصوم يومًا ويفطر يومًا، فكانت عبادته مثالًا يُحتذى إلى اليوم.'
            ] },
            { name: 'سليمان عليه السلام', story: [
                'ورث سليمان الملك والنبوة عن أبيه داود وهو غلام، وسأل ربه ملكًا لا ينبغي لأحد من بعده، فسخّر الله له الريح تجري بأمره، والجن يعملون بين يديه، وعلّمه منطق الطير والحيوان.',
                'ذات يوم فقد الهدهد من جيشه، فتوعده بعذاب شديد، لكن الهدهد عاد بخبر عظيم: مملكة عظيمة تحكمها امرأة اسمها بلقيس، تسجد هي وقومها للشمس من دون الله. أرسل سليمان إليها رسالة، فأتته بنفسها، وأحضر عرشها إليه قبل أن تصل بلمح البصر بقدرة من آتاه الله علمًا.',
                'رأت بلقيس صرحًا من زجاج يشبه الماء، فكشفت عن ساقيها ظنًا منها أنه بحر، فقال لها سليمان: إنه صرح ممرد من قوارير. أسلمت بلقيس لله رب العالمين، فكانت خاتمة القصة إيمانًا لا قهرًا، وبقي سليمان رمزًا للملك المسخّر لخدمة الحق لا للتباهي.'
            ] },
            { name: 'إلياس عليه السلام', story: [
                'أُرسل إلياس إلى قوم من بني إسرائيل انحرفوا عن التوحيد وعبدوا صنمًا يسمونه "بعلًا"، فتركوا عبادة الله الواحد إلى حجر لا يسمع ولا يبصر.',
                'وقف فيهم بشجاعة نادرة: "أتدعون بعلًا وتذرون أحسن الخالقين، الله ربكم ورب آبائكم الأولين؟" لكن أكثرهم كذّبوه وأصروا على ضلالهم، فلم يؤمن به إلا قلة قليلة، وبقي صوته شاهدًا على أن الحق قد يُقال ولو لم يُسمع.'
            ] },
            { name: 'اليسع عليه السلام', story: [
                'جاء اليسع بعد إلياس ليكمل مسيرة الدعوة إلى التوحيد في بني إسرائيل، حاملًا الرسالة نفسها بصبر وثبات، في زمن كان الانحراف قد استشرى فيه.',
                'ذكره القرآن مقترنًا بأسماء المصطفين الأخيار، إسماعيل وذي الكفل وإلياس، شهادة على مكانته رغم قلة ما وصلنا من تفاصيل رحلته، فبقي اسمه علامة على استمرار حبل النبوة جيلًا بعد جيل.'
            ] },
            { name: 'يونس عليه السلام', story: [
                'دعا يونس قومه في نينوى زمنًا طويلًا فلم يؤمنوا، فغضب وتركهم مهاجرًا قبل أن يأذن له ربه بذلك، وركب سفينة في البحر. حين اشتد الموج وكادت السفينة تغرق بمن فيها، اقترع البحّارة على من يُلقى في الماء تخفيفًا للحمل، فخرجت القرعة على يونس مرارًا.',
                'ألقوه في البحر، فالتقمه حوت عظيم بأمر الله، فوجد نفسه في ظلمات ثلاث: ظلمة الليل، وظلمة البحر، وظلمة بطن الحوت. هناك، في أحلك لحظة، نادى ربه بكلمات خالدة: "لا إله إلا أنت سبحانك إني كنت من الظالمين".',
                'استجاب الله لندائه فورًا، فنبذه الحوت على الشاطئ سليمًا وهو سقيم. ثم عاد إلى قومه فوجدهم قد آمنوا جميعًا بعد رحيله — استثناء نادرًا لم يحدث لأمة أخرى كذّبت نبيها — فكانت قصته درسًا في أن رحمة الله تسبق غضبه، وأن دعوة "لا إله إلا أنت" باب لا يُرد صاحبه أبدًا.'
            ] },
            { name: 'زكريا عليه السلام', story: [
                'كان زكريا كبيرًا في السن، وامرأته عاقر لم تلد قط، ومع ذلك لم ييأس من رحمة ربه. كان يكفل مريم بنت عمران في المحراب، فكلما دخل عليها وجد عندها رزقًا من عند الله، فسألها من أين لها هذا؟ فقالت: هو من عند الله.',
                'هزّه هذا المشهد، فدعا ربه في خفاء: "رب هب لي من لدنك ذرية طيبة إنك سميع الدعاء". استجاب الله له، وبشّرته الملائكة بغلام اسمه يحيى، فتعجب: أنّى يكون لي غلام وقد بلغني الكبر وامرأتي عاقر؟ فقيل له: كذلك الله يفعل ما يشاء، وجعل الله له آية ألا يكلم الناس ثلاثة أيام إلا رمزًا، وهو سويّ لا آفة به، شكرًا على النعمة.'
            ] },
            { name: 'يحيى عليه السلام', story: [
                'وُلد يحيى استجابة لدعاء أبيه زكريا، وآتاه الله الحكم وهو صبي صغير، حكمة وفهمًا لم يُعطهما لغيره في مثل سنه. وصفه القرآن بصفات جامعة: "وحنانًا من لدنا وزكاة وكان تقيًا، وبرًا بوالديه ولم يكن جبارًا عصيًا".',
                'عاش حياته زاهدًا عابدًا، بارًا بأبويه في كل حال، سيدًا بين قومه رغم زهده في زينة الدنيا، حتى لُقّب بـ"الحصور" لعفته وترفعه. وختمت حياته بشهادة في سبيل الحق، فكان السلام عليه يوم وُلد ويوم مات ويوم يُبعث حيًا، كما وصفه القرآن الكريم.'
            ] },
            { name: 'عيسى عليه السلام', story: [
                'وُلدت مريم البتول في بيت طاهر، ونذرتها أمها لخدمة المحراب. وذات يوم، أتاها ملك في صورة بشر سويّ، فبشّرها بغلام زكي دون أن يمسّها بشر. حملت بأمر الله، وتعجبت الدنيا كلها حين وضعته وهي وحيدة تحت نخلة، ثم أتت به قومها.',
                'اتهمها قومها ظلمًا، فأشارت إلى المهد، فتكلم الرضيع بمعجزة: "إني عبد الله آتاني الكتاب وجعلني نبيًا"، فبُهت الجميع. كبر عيسى وأيده الله بمعجزات عظيمة: أحيا الموتى بإذن الله، وأبرأ الأكمه والأبرص، وخلق من الطين طيرًا فنفخ فيه فكان طيرًا حيًا بإذن ربه.',
                'دعا بني إسرائيل إلى التوحيد وتصديق ما بين يديه من التوراة، فكذّبه أكثرهم وتآمروا على قتله وصلبه. لكن الله رفعه إليه ونجّاه، وألقى شبهه على غيره، فما قُتل وما صُلب يقينًا، وهو باقٍ عند ربه ينزل في آخر الزمان، وقصته أعظم شاهد على قدرة الله في خرق العادة.'
            ] },
            { name: 'محمد صلى الله عليه وسلم', story: [
                'وُلد يتيم الأب في مكة، ونشأ صادقًا أمينًا حتى لُقّب بين قومه بـ"الصادق الأمين" قبل أن يُبعث نبيًا. وفي غار حراء، وهو يتعبد بعيدًا عن ضجيج قومه، جاءه الوحي لأول مرة: "اقرأ باسم ربك الذي خلق"، فبدأت أعظم رسالة عرفتها البشرية.',
                'دعا قومه إلى التوحيد سرًا ثم جهرًا، فواجه أذى شديدًا: مقاطعة، وتعذيبًا لأصحابه، ومحاولات لقتله. صبر وثبت، وهاجر إلى المدينة بعد ثلاث عشرة سنة من الدعوة الشاقة، فأسس هناك أول مجتمع يقوم على العدل والإخاء بين الناس جميعًا مهما اختلفت أصولهم.',
                'واجه غزوات كثيرة دفاعًا عن دينه ودعوته، وعامل حتى أعداءه بالرحمة حين مكّنه الله منهم، حتى فتح مكة التي أخرجته يومًا فقال لأهلها: "اذهبوا فأنتم الطلقاء". كان في بيته أرحم الناس، وفي حكمه أعدلهم، وفي خلقه أكملهم، حتى قال عنه ربه: "وإنك لعلى خلق عظيم".',
                'أتم الله به الدين، وختم به الأنبياء، فكان رحمة للعالمين لا لأمته وحدها. توفي وقد ترك للبشرية أعظم إرث: كتابًا لا يأتيه الباطل، وسنة هادية، وأمة تحمل الرسالة من بعده إلى قيام الساعة — فكانت خاتمة السلسلة، وبداية النور الذي لا ينطفئ.'
            ] }
        ];

        const ASMA_HUSNA = [
            { name: 'الله', meaning: 'صاحب الألوهية والمعبود بحق' },
            { name: 'الرحمن', meaning: 'ذو الرحمة الواسعة لكل الخلق' },
            { name: 'الرحيم', meaning: 'ذو الرحمة الخاصة بالمؤمنين' },
            { name: 'الملك', meaning: 'المالك لكل شيء المتصرف فيه' },
            { name: 'القدوس', meaning: 'المنزّه عن كل نقص' },
            { name: 'السلام', meaning: 'السالم من كل عيب، مصدر الأمن والسلامة' },
            { name: 'المؤمن', meaning: 'المصدّق لوعده، مانح الأمان' },
            { name: 'المهيمن', meaning: 'الرقيب الحافظ على كل شيء' },
            { name: 'العزيز', meaning: 'الغالب الذي لا يُقهر' },
            { name: 'الجبار', meaning: 'الذي يجبر الضعف ويقهر الجبابرة' },
            { name: 'المتكبر', meaning: 'العظيم عن كل نقص وصفة خلق' },
            { name: 'الخالق', meaning: 'موجد الأشياء من العدم' },
            { name: 'البارئ', meaning: 'المُنشئ للخلق على غير مثال سابق' },
            { name: 'المصور', meaning: 'مُعطي الصور والأشكال' },
            { name: 'الغفار', meaning: 'كثير المغفرة للذنوب' },
            { name: 'القهار', meaning: 'الغالب لكل شيء القاهر له' },
            { name: 'الوهاب', meaning: 'كثير العطاء بلا مقابل' },
            { name: 'الرزاق', meaning: 'مُقدّر الأرزاق ومُوصلها لكل مخلوق' },
            { name: 'الفتاح', meaning: 'الحاكم بين عباده، فاتح أبواب الرزق والرحمة' },
            { name: 'العليم', meaning: 'المحيط علمه بكل شيء' },
            { name: 'القابض', meaning: 'المُضيّق الرزق بحكمته' },
            { name: 'الباسط', meaning: 'الموسّع الرزق برحمته' },
            { name: 'الخافض', meaning: 'خافض الجبابرة والمتكبرين' },
            { name: 'الرافع', meaning: 'رافع أولياءه بالطاعة والتقوى' },
            { name: 'المعز', meaning: 'معطي العزة لمن يشاء' },
            { name: 'المذل', meaning: 'سالب العزة عمّن يشاء' },
            { name: 'السميع', meaning: 'المحيط سمعه بكل مسموع' },
            { name: 'البصير', meaning: 'المحيط بصره بكل مرئي' },
            { name: 'الحكم', meaning: 'الفاصل بين الحق والباطل' },
            { name: 'العدل', meaning: 'المنزّه عن الظلم في كل حكمه' },
            { name: 'اللطيف', meaning: 'الرفيق بعباده العالم بدقائق أمورهم' },
            { name: 'الخبير', meaning: 'العالم ببواطن الأمور' },
            { name: 'الحليم', meaning: 'الذي لا يعجل بالعقوبة رغم قدرته' },
            { name: 'العظيم', meaning: 'صاحب العظمة التي لا حد لها' },
            { name: 'الغفور', meaning: 'الساتر للذنوب الماحي لها' },
            { name: 'الشكور', meaning: 'المُثيب على القليل من الطاعة بالكثير من الأجر' },
            { name: 'العلي', meaning: 'الذي علا فوق كل شيء قدرًا وشأنًا' },
            { name: 'الكبير', meaning: 'الأعظم من كل شيء' },
            { name: 'الحفيظ', meaning: 'الحافظ لكل شيء من الزوال والضياع' },
            { name: 'المقيت', meaning: 'المُقتدر، مُوصل الأقوات لكل مخلوق' },
            { name: 'الحسيب', meaning: 'الكافي عباده، المُحاسب لهم على أعمالهم' },
            { name: 'الجليل', meaning: 'صاحب الجلال والعظمة والكمال' },
            { name: 'الكريم', meaning: 'كثير العطاء والفضل والإحسان' },
            { name: 'الرقيب', meaning: 'المطّلع على كل شيء لا يغيب عنه شيء' },
            { name: 'المجيب', meaning: 'الذي يجيب دعاء من دعاه' },
            { name: 'الواسع', meaning: 'الذي وسع رزقه وعلمه ورحمته كل شيء' },
            { name: 'الحكيم', meaning: 'صاحب الحكمة في كل خلقه وأمره' },
            { name: 'الودود', meaning: 'المحب لعباده الصالحين والمحبوب منهم' },
            { name: 'المجيد', meaning: 'صاحب المجد والشرف الكامل' },
            { name: 'الباعث', meaning: 'الذي يبعث الخلق يوم القيامة' },
            { name: 'الشهيد', meaning: 'المطّلع على كل شيء الحاضر في كل مكان بعلمه' },
            { name: 'الحق', meaning: 'الثابت الذي لا يتغير، وجوده حق' },
            { name: 'الوكيل', meaning: 'الكافي لمن توكل عليه' },
            { name: 'القوي', meaning: 'صاحب القوة الكاملة التي لا تُضاهى' },
            { name: 'المتين', meaning: 'شديد القوة الذي لا يلحقه ضعف' },
            { name: 'الولي', meaning: 'الناصر والمعين لعباده المؤمنين' },
            { name: 'الحميد', meaning: 'المحمود على كل حال في ذاته وأفعاله' },
            { name: 'المحصي', meaning: 'الذي أحصى كل شيء عددًا' },
            { name: 'المبدئ', meaning: 'الذي بدأ الخلق من العدم' },
            { name: 'المعيد', meaning: 'الذي يعيد الخلق بعد الموت' },
            { name: 'المحيي', meaning: 'الذي يهب الحياة لكل حي' },
            { name: 'المميت', meaning: 'الذي يقدّر الموت على كل حي' },
            { name: 'الحي', meaning: 'الباقي الذي لا يموت' },
            { name: 'القيوم', meaning: 'القائم بذاته المُقيم لغيره' },
            { name: 'الواجد', meaning: 'الغني الذي لا يعوزه شيء' },
            { name: 'الماجد', meaning: 'صاحب المجد الواسع الكريم' },
            { name: 'الواحد', meaning: 'المتفرد بذاته وصفاته لا شريك له' },
            { name: 'الصمد', meaning: 'الذي يُقصد في الحوائج ولا يحتاج لأحد' },
            { name: 'القادر', meaning: 'صاحب القدرة الكاملة على كل شيء' },
            { name: 'المقتدر', meaning: 'الغالب الذي لا يعجزه شيء' },
            { name: 'المقدم', meaning: 'الذي يقدّم من يشاء بفضله' },
            { name: 'المؤخر', meaning: 'الذي يؤخر من يشاء بحكمته' },
            { name: 'الأول', meaning: 'الذي ليس قبله شيء' },
            { name: 'الآخر', meaning: 'الذي ليس بعده شيء' },
            { name: 'الظاهر', meaning: 'الغالب فوق كل شيء الظاهر بأدلة وجوده' },
            { name: 'الباطن', meaning: 'العالم بما خفي، المحتجب عن الأبصار' },
            { name: 'الوالي', meaning: 'المتولي لأمور خلقه المدبر لها' },
            { name: 'المتعالي', meaning: 'المنزّه عن صفات الخلق العالي فوق كل شيء' },
            { name: 'البر', meaning: 'المحسن إلى خلقه الكثير الخير' },
            { name: 'التواب', meaning: 'الذي يقبل توبة عباده مرارًا' },
            { name: 'المنتقم', meaning: 'الذي ينتقم من الظالمين بعدله' },
            { name: 'العفو', meaning: 'الذي يمحو السيئات ويصفح عنها' },
            { name: 'الرؤوف', meaning: 'شديد الرحمة والرأفة بعباده' },
            { name: 'مالك الملك', meaning: 'المتصرف في الملك كله يعطيه ويسلبه بحكمته' },
            { name: 'ذو الجلال والإكرام', meaning: 'صاحب العظمة والكرم اللذين لا يوصفان' },
            { name: 'المقسط', meaning: 'العادل في قسمته وحكمه بين خلقه' },
            { name: 'الجامع', meaning: 'الذي يجمع الخلق يوم لا ريب فيه' },
            { name: 'الغني', meaning: 'الذي لا يحتاج إلى أحد وكل شيء يحتاج إليه' },
            { name: 'المغني', meaning: 'الذي يُغني من يشاء من عباده' },
            { name: 'المانع', meaning: 'الذي يمنع عن عباده ما يشاء بحكمته' },
            { name: 'الضار', meaning: 'الذي يخلق الضر بحكمته لمن يشاء' },
            { name: 'النافع', meaning: 'الذي يخلق النفع ويوصله لمن يشاء' },
            { name: 'النور', meaning: 'الذي نوّر السماوات والأرض بالحق والهداية' },
            { name: 'الهادي', meaning: 'الذي يهدي عباده إلى الحق والصراط المستقيم' },
            { name: 'البديع', meaning: 'الذي أبدع الخلق على غير مثال سابق' },
            { name: 'الباقي', meaning: 'الذي لا يفنى ولا يزول' },
            { name: 'الوارث', meaning: 'الباقي بعد فناء الخلق، الذي يرث كل شيء' },
            { name: 'الرشيد', meaning: 'الذي يرشد عباده إلى مصالحهم' },
            { name: 'الصبور', meaning: 'الذي لا يعجل بالعقوبة على العصاة' }
        ];
        const ADHKAR_MORNING = [
            { text: 'آية الكرسي: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...، من قالها حين يصبح أُجير من الجن حتى يمسي.', count: 1 },
            { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ (سورة الإخلاص كاملة)', count: 3 },
            { text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (سورة الفلق كاملة)', count: 3 },
            { text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (سورة الناس كاملة)', count: 3 },
            { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', count: 1 },
            { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', count: 1 },
            { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ (سيد الاستغفار)', count: 1 },
            { text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ...', count: 4 },
            { text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', count: 3 },
            { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', count: 1 },
            { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3 },
            { text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', count: 3 },
            { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
            { text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 10 },
            { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', count: 100 }
        ];
        const ADHKAR_EVENING = [
            { text: 'آية الكرسي: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...، من قالها حين يمسي أُجير من الجن حتى يصبح.', count: 1 },
            { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ (سورة الإخلاص كاملة)', count: 3 },
            { text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (سورة الفلق كاملة)', count: 3 },
            { text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (سورة الناس كاملة)', count: 3 },
            { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', count: 1 },
            { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', count: 1 },
            { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ (سيد الاستغفار)', count: 1 },
            { text: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ...', count: 4 },
            { text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', count: 3 },
            { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', count: 1 },
            { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3 },
            { text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', count: 3 },
            { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
            { text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 10 },
            { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3 },
            { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', count: 100 }
        ];

        const TASBIH_OPTIONS = [
            'سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله',
            'أستغفر الله العظيم', 'لا حول ولا قوة إلا بالله', 'سبحان الله وبحمده سبحان الله العظيم'
        ];
        let tasbihState = JSON.parse(localStorage.getItem('sx_tasbih') || '{}');
        let currentTasbihPhrase = TASBIH_OPTIONS[0];
        let currentTasbihTarget = 33;

        function saveTasbihState() { localStorage.setItem('sx_tasbih', JSON.stringify(tasbihState)); }

        let religionInitialized = false;
        function openReligionSection() {
            openModal('religionModal');
            if (!religionInitialized) {
                initReligionSection();
                religionInitialized = true;
            }
        }

        function renderQuranLastReadRow() {
            const lastRead = JSON.parse(localStorage.getItem('sx_quran_last') || 'null');
            const row = document.getElementById('quranLastRead');
            if (!lastRead) { row.innerHTML = ''; return; }
            row.innerHTML = `
                <span>آخر قراءة: سورة ${lastRead.surahName} — آية ${lastRead.ayah}</span>
                <button class="quran-continue-btn" onclick="continueQuranReading()"><i class="fas fa-play"></i> تابع القراءة</button>
            `;
        }

        function continueQuranReading() {
            const lastRead = JSON.parse(localStorage.getItem('sx_quran_last') || 'null');
            if (!lastRead) return;
            const sel = document.getElementById('quranSurahSelect');
            sel.value = lastRead.surah;
            quranJumpToAyah = lastRead.ayah;
            loadSurah();
        }

        let quranJumpToAyah = null;

        function initReligionSection() {
            applyQuranFontSize(parseInt(localStorage.getItem('sx_quran_fs') || '23', 10));
            const sel = document.getElementById('quranSurahSelect');
            sel.innerHTML = QURAN_SURAHS.map(s => `<option value="${s.n}">${s.n}. سورة ${s.name}</option>`).join('');
            const lastRead = JSON.parse(localStorage.getItem('sx_quran_last') || 'null');
            if (lastRead) sel.value = lastRead.surah;
            renderQuranLastReadRow();

            const tasbihSelectDiv = document.getElementById('tasbihSelect');
            tasbihSelectDiv.innerHTML = TASBIH_OPTIONS.map((t, i) =>
                `<button class="tasbih-opt ${i === 0 ? 'active' : ''}" onclick="selectTasbih('${t.replace(/'/g, "\\'")}', this)">${t}</button>`
            ).join('');
            updateTasbihDisplay();

            renderAdhkarList('morning', ADHKAR_MORNING, 'adhkarMorningList');
            renderAdhkarList('evening', ADHKAR_EVENING, 'adhkarEveningList');

            document.getElementById('prophetsGrid').innerHTML = PROPHETS_STORIES.map((p, i) => {
                const paras = (Array.isArray(p.story) ? p.story : [p.story]).map(t => `<p>${t}</p>`).join('');
                return `
                <div class="prophet-card">
                    <div class="prophet-ep">الحلقة ${i + 1} من ${PROPHETS_STORIES.length}</div>
                    <div class="prophet-name"><i class="fas fa-star-and-crescent"></i> ${p.name}</div>
                    <div class="prophet-story collapsed" id="prophetStory-${i}">${paras}</div>
                    <button class="prophet-toggle" onclick="toggleProphetStory(${i})" id="prophetToggle-${i}">
                        اقرأ القصة كاملة <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            `;
            }).join('');

            document.getElementById('asmaGrid').innerHTML = ASMA_HUSNA.map(a => `
                <div class="asma-card">
                    <div class="asma-name">${a.name}</div>
                    <div class="asma-meaning">${a.meaning}</div>
                </div>
            `).join('');
        }

        function switchReligionTab(tab) {
            document.querySelectorAll('.rel-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
            document.querySelectorAll('.rel-panel').forEach(p => p.classList.toggle('active', p.id === `relPanel-${tab}`));
        }

        // ===== التحكم في حجم خط القرآن =====
        const QURAN_FS_MIN = 17, QURAN_FS_MAX = 34;
        function applyQuranFontSize(px) {
            const reader = document.getElementById('quranReader');
            if (reader) reader.style.setProperty('--quran-fs', px + 'px');
        }
        function changeQuranFontSize(step) {
            let current = parseInt(localStorage.getItem('sx_quran_fs') || '23', 10);
            current = Math.min(QURAN_FS_MAX, Math.max(QURAN_FS_MIN, current + step * 1.5));
            localStorage.setItem('sx_quran_fs', current);
            applyQuranFontSize(current);
        }

        // ===== فتح السورة الحالية في صفحة/تاب مستقل بحجم قراءة مريح =====
        function openSurahInNewTab() {
            if (!currentQuranAyahs || !currentQuranSurahMeta) {
                showToast('اقرأ سورة الأول', 'error');
                return;
            }
            const surahMeta = currentQuranSurahMeta;
            const ayahs = currentQuranAyahs;
            const showBasmala = surahMeta.n !== 9 && surahMeta.n !== 1;
            const fs = localStorage.getItem('sx_quran_fs') || '23';
            const ayahsHtml = ayahs.map(a =>
                `<span class="ayah">${a.text}<span class="ayah-num">${a.n}</span></span>`
            ).join(' ');

            const pageHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سورة ${surahMeta.name} — Chat X</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  :root { --gold: rgba(180,138,22,0.5); --gold-dim: rgba(180,138,22,0.22); }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: 'Cairo', sans-serif; background: #f4f1ea; color: #1c1a14;
    min-height: 100vh; display: flex; justify-content: center; padding: 28px 14px 60px;
    transition: background 0.3s ease, color 0.3s ease;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #14120e; color: #f1ede2; }
  }
  /* الوضع الورقي — يحاكي شكل صفحة المصحف التقليدية بغض النظر عن وضع الجهاز */
  body.paper { background: #efe2bf !important; color: #3b2a13 !important; }
  body.paper .inner { background: rgba(255,255,255,0.35) !important; border-color: rgba(120,90,20,0.35) !important; }
  body.paper .topbar button { border-color: rgba(120,90,20,0.35) !important; }
  .page { width: 100%; max-width: 700px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 8px; flex-wrap: wrap; }
  .topbar button {
    font-family: 'Cairo', sans-serif; font-size: 12.5px; font-weight: 700; border: 1px solid var(--gold-dim);
    background: transparent; color: inherit; border-radius: var(--radius-sm); padding: 8px 14px; cursor: pointer;
  }
  .frame { position: relative; padding: 3px; border-radius: var(--radius-lg); background: linear-gradient(135deg, rgba(180,138,22,0.4), rgba(180,138,22,0.05) 30%, rgba(180,138,22,0.05) 70%, rgba(180,138,22,0.4)); }
  .inner {
    position: relative; border: 1px solid var(--gold-dim); border-radius: 17px; padding: 30px 26px;
    background: rgba(255,255,255,0.55); transition: background 0.3s ease, border-color 0.3s ease;
  }
  @media (prefers-color-scheme: dark) { .inner { background: rgba(255,255,255,0.03); } }
  .inner::before, .inner::after {
    content: ''; position: absolute; width: 24px; height: 24px; border: 2px solid var(--gold); opacity: .85;
  }
  .inner::before { top: 8px; right: 8px; border-left: none; border-bottom: none; }
  .inner::after { bottom: 8px; left: 8px; border-right: none; border-top: none; }
  .heading { text-align: center; padding-bottom: 16px; margin-bottom: 20px; border-bottom: 1px dashed var(--gold-dim); }
  .sname { font-family: 'Amiri Quran', serif; font-weight: 700; font-size: 26px; }
  .basmala { font-family: 'Amiri Quran', serif; font-size: 21px; margin-top: 10px; opacity: .9; }
  .ayah {
    font-family: 'Amiri Quran', serif; font-size: ${fs}px; line-height: 2.8; text-align: justify;
  }
  .ayah-num {
    display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;
    border: 1.5px solid var(--gold); border-radius: 50%; font-size: 11px; font-family: 'Cairo', sans-serif;
    margin: 0 5px; vertical-align: middle; background: rgba(180,138,22,0.08);
  }
  .footer-note { text-align: center; font-size: 11.5px; opacity: .55; margin-top: 26px; }
  @media print { .topbar { display: none; } body { background: #fff !important; color: #000 !important; padding: 0; } .inner { background: #fff !important; } }
</style>
</head>
<body>
  <div class="page">
    <div class="topbar">
      <button onclick="document.body.classList.toggle('paper')">📜 الوضع الورقي</button>
      <button onclick="window.print()">🖨️ طباعة</button>
      <button onclick="window.close()">✕ إغلاق الصفحة</button>
    </div>
    <div class="frame">
      <div class="inner">
        <div class="heading">
          <div class="sname">سورة ${surahMeta.name}</div>
          ${showBasmala ? '<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : ''}
        </div>
        ${ayahsHtml}
      </div>
    </div>
    <div class="footer-note">Chat X — القسم الديني</div>
  </div>
</body>
</html>`;

            const win = window.open('', '_blank');
            if (!win) {
                showToast('المتصفح منع فتح صفحة جديدة، فعّل النوافذ المنبثقة', 'error');
                return;
            }
            win.document.open();
            win.document.write(pageHtml);
            win.document.close();
        }

        async function loadSurah() {
            const n = document.getElementById('quranSurahSelect').value;
            const surahMeta = QURAN_SURAHS.find(s => String(s.n) === String(n));
            const reader = document.getElementById('quranReader');
            const cacheKey = `sx_quran_${n}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                renderSurahAyahs(JSON.parse(cached), surahMeta);
                return;
            }
            reader.innerHTML = '<div class="quran-empty"><i class="fas fa-spinner fa-spin" style="font-size:20px;display:block;margin-bottom:8px;"></i>جارٍ تحميل السورة...</div>';
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`);
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                const ayahs = (data.data && data.data.ayahs) ? data.data.ayahs.map(a => ({ n: a.numberInSurah, text: a.text })) : [];
                if (!ayahs.length) throw new Error('empty');
                localStorage.setItem(cacheKey, JSON.stringify(ayahs));
                renderSurahAyahs(ayahs, surahMeta);
            } catch (e) {
                reader.innerHTML = '<div class="quran-empty"><i class="fas fa-triangle-exclamation" style="font-size:20px;display:block;margin-bottom:8px;"></i>تعذر تحميل السورة، تأكد من الاتصال بالإنترنت وحاول تاني</div>';
            }
        }

        let currentQuranAyahs = null;
        let currentQuranSurahMeta = null;

        function renderSurahAyahs(ayahs, surahMeta) {
            currentQuranAyahs = ayahs;
            currentQuranSurahMeta = surahMeta;
            const openBtn = document.getElementById('quranOpenTabBtn');
            if (openBtn) openBtn.disabled = false;

            const reader = document.getElementById('quranReader');
            // البسملة تُعرض كعنوان مستقل فوق كل سورة ما عدا التوبة (لم تُفتتح ببسملة)
            // والفاتحة (بسملتها آية أولى بالفعل ضمن الآيات المحمّلة، فتفادي التكرار).
            const showBasmala = surahMeta.n !== 9 && surahMeta.n !== 1;
            const heading = `
                <div class="quran-surah-heading">
                    <div class="sname">سورة ${surahMeta.name}</div>
                    ${showBasmala ? '<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : ''}
                </div>`;
            const ayahsHtml = ayahs.map((a, idx) =>
                `<span class="quran-ayah" id="ayahEl-${idx}" data-idx="${idx}">${a.text}<span class="ayah-num">${a.n}</span></span>`
            ).join(' ');
            reader.innerHTML = heading + ayahsHtml;
            reader.scrollTop = 0;
            reader.querySelectorAll('.ayah-num').forEach((el, idx) => {
                el.style.cursor = 'pointer';
                el.title = 'اضغط لحفظ هذه كآخر آية قرأتها';
                el.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const lastRead = { surah: surahMeta.n, surahName: surahMeta.name, ayah: ayahs[idx].n };
                    localStorage.setItem('sx_quran_last', JSON.stringify(lastRead));
                    renderQuranLastReadRow();
                    showToast('اتحفظت آخر آية قرأتها', 'success');
                });
            });
            // الضغط على نص الآية نفسه (مش الرقم) يفتح تفسيرها الميسر
            reader.querySelectorAll('.quran-ayah').forEach((el, idx) => {
                el.addEventListener('click', (ev) => {
                    if (ev.target.classList.contains('ayah-num')) return;
                    openTafsir(surahMeta, ayahs[idx]);
                });
            });

            // لو جاي من "تابع القراءة"، نلوّن الآية المطلوبة ونعمل لها سكرول
            if (quranJumpToAyah != null) {
                const targetIdx = ayahs.findIndex(a => a.n === quranJumpToAyah);
                quranJumpToAyah = null;
                if (targetIdx !== -1) {
                    setTimeout(() => {
                        const el = document.getElementById(`ayahEl-${targetIdx}`);
                        if (el) {
                            el.scrollIntoView({ block: 'center' });
                            el.style.transition = 'background 0.4s ease';
                            el.style.background = 'rgba(212, 175, 55, 0.25)';
                            el.style.borderRadius = '6px';
                            setTimeout(() => { el.style.background = 'transparent'; }, 2500);
                        }
                    }, 60);
                }
            }
        }

        // ===== تفسير الميسر لكل آية (Al Quran Cloud API) =====
        async function openTafsir(surahMeta, ayah) {
            openModal('tafsirModal');
            const body = document.getElementById('tafsirBody');
            body.innerHTML = `
                <div class="tafsir-ayah-ref">سورة ${surahMeta.name} — آية ${ayah.n}</div>
                <div class="tafsir-ayah-text">${ayah.text}</div>
                <div class="tafsir-loading" id="tafsirLoadingBox"><i class="fas fa-spinner fa-spin"></i> جارٍ تحميل التفسير الميسر...</div>
            `;
            const cacheKey = `sx_tafsir_${surahMeta.n}_${ayah.n}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                renderTafsirText(cached);
                return;
            }
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahMeta.n}:${ayah.n}/ar.muyassar`);
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                const text = data?.data?.text;
                if (!text) throw new Error('empty');
                localStorage.setItem(cacheKey, text);
                renderTafsirText(text);
            } catch (e) {
                const box = document.getElementById('tafsirLoadingBox');
                if (box) box.innerHTML = '<i class="fas fa-triangle-exclamation"></i> تعذر تحميل التفسير، تأكد من الاتصال بالإنترنت وحاول تاني';
            }
        }

        function renderTafsirText(text) {
            const box = document.getElementById('tafsirLoadingBox');
            if (!box) return;
            box.outerHTML = `<div class="tafsir-text">${text}</div><div class="tafsir-source-note">المصدر: التفسير الميسّر — مجمع الملك فهد</div>`;
        }

        function toggleProphetStory(i) {
            const storyEl = document.getElementById(`prophetStory-${i}`);
            const btnEl = document.getElementById(`prophetToggle-${i}`);
            const isCollapsed = storyEl.classList.toggle('collapsed');
            btnEl.innerHTML = isCollapsed
                ? 'اقرأ القصة كاملة <i class="fas fa-chevron-down"></i>'
                : 'إخفاء القصة <i class="fas fa-chevron-up"></i>';
        }

        function selectTasbih(phrase, btnEl) {
            currentTasbihPhrase = phrase;
            currentTasbihTarget = phrase.includes('أستغفر') || phrase.includes('سبحان الله وبحمده') ? 100 : 33;
            document.querySelectorAll('.tasbih-opt').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            updateTasbihDisplay();
        }

        function updateTasbihDisplay() {
            document.getElementById('tasbihCurrentText').textContent = currentTasbihPhrase;
            const count = tasbihState[currentTasbihPhrase] || 0;
            document.getElementById('tasbihCount').textContent = (count % currentTasbihTarget === 0 && count > 0) ? currentTasbihTarget : count % currentTasbihTarget;
            document.getElementById('tasbihTarget').textContent = `الهدف: ${currentTasbihTarget}`;
            const today = new Date().toDateString();
            const todayTotal = (tasbihState._daily && tasbihState._daily.date === today) ? tasbihState._daily.count : 0;
            document.getElementById('tasbihDailyTotal').textContent = `مجموع تسبيحاتك النهاردة: ${todayTotal}`;
        }

        function tasbihTap() {
            tasbihState[currentTasbihPhrase] = (tasbihState[currentTasbihPhrase] || 0) + 1;
            const today = new Date().toDateString();
            if (!tasbihState._daily || tasbihState._daily.date !== today) {
                tasbihState._daily = { date: today, count: 0 };
            }
            tasbihState._daily.count++;
            saveTasbihState();
            const circle = document.getElementById('tasbihCircle');
            circle.style.transform = 'scale(0.94)';
            setTimeout(() => circle.style.transform = '', 100);
            if (navigator.vibrate) navigator.vibrate(15);
            const countNow = tasbihState[currentTasbihPhrase];
            if (countNow % currentTasbihTarget === 0) {
                showToast(`أتممت ${currentTasbihTarget} — تقبل الله منك`, 'success');
            }
            updateTasbihDisplay();
        }

        function resetTasbih() {
            tasbihState[currentTasbihPhrase] = 0;
            saveTasbihState();
            updateTasbihDisplay();
        }

        function renderAdhkarList(key, items, containerId) {
            const stateKey = `sx_adhkar_${key}`;
            const today = new Date().toDateString();
            let state = JSON.parse(localStorage.getItem(stateKey) || '{}');
            if (state.date !== today) state = { date: today, progress: {} };
            const container = document.getElementById(containerId);
            container.innerHTML = items.map((item, i) => {
                const remaining = state.progress[i] != null ? state.progress[i] : item.count;
                const done = remaining <= 0;
                return `<div class="adhkar-item ${done ? 'done' : ''}" id="${key}-item-${i}" onclick="tapAdhkar('${key}', ${i}, '${containerId}')">
                    <div class="adhkar-text">${item.text}</div>
                    <div class="adhkar-counter">${done ? '✓' : remaining}</div>
                </div>`;
            }).join('');
            localStorage.setItem(stateKey, JSON.stringify(state));
        }

        function tapAdhkar(key, i, containerId) {
            const stateKey = `sx_adhkar_${key}`;
            const today = new Date().toDateString();
            let state = JSON.parse(localStorage.getItem(stateKey) || '{}');
            if (state.date !== today) state = { date: today, progress: {} };
            const items = key === 'morning' ? ADHKAR_MORNING : ADHKAR_EVENING;
            const current = state.progress[i] != null ? state.progress[i] : items[i].count;
            state.progress[i] = Math.max(0, current - 1);
            localStorage.setItem(stateKey, JSON.stringify(state));
            renderAdhkarList(key, items, containerId);
        }

        // بيختار عدد عشوائي من العبارات (من غير تكرار) ويرصهم أفقيًا تحت رد الشات بوت
        function renderMotivationalRow(msgDiv) {
            if (!msgDiv) return;
            const contentDiv = msgDiv.querySelector('.msg-content');
            const metaDiv = msgDiv.querySelector('.msg-meta');
            if (!contentDiv || !metaDiv) return;
            const old = contentDiv.querySelector('.motivational-row');
            if (old) old.remove();

            const shuffled = [...MOTIVATIONAL_PHRASES].sort(() => Math.random() - 0.5);
            const picked = shuffled.slice(0, 3 + Math.floor(Math.random() * 2)); // 3 أو 4 عبارات

            const row = document.createElement('div');
            row.className = 'motivational-row';
            picked.forEach(p => {
                const chip = document.createElement('span');
                chip.className = 'motivational-chip';
                chip.innerHTML = `<span class="emoji">${p.emoji}</span><span>${p.text}</span>`;
                row.appendChild(chip);
            });
            contentDiv.insertBefore(row, metaDiv);
        }

        function finalizeBotMessage(msgDiv, botMsg) {
            const bubbleDiv = msgDiv.querySelector('.msg-bubble');
            bubbleDiv.innerHTML = DOMPurify.sanitize(marked.parse(botMsg.content));
            bubbleDiv.classList.toggle('pinned-msg', !!botMsg.pinned);
            enhanceCodeBlocks(bubbleDiv);
            const timeSpan = msgDiv.querySelector('.msg-time');
            const sourceSpan = msgDiv.querySelector('.msg-source-icon');
            const actionsDiv = msgDiv.querySelector('.msg-actions');
            timeSpan.textContent = new Date(botMsg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});
            sourceSpan.textContent = botMsg.source === 'groq' ? '⚡' : botMsg.source === 'gemini' ? '🌟' : botMsg.source === 'openrouter' ? '🔀' : botMsg.source === 'cerebras' ? '🧠' : botMsg.source === 'claude-opus' ? '✨' : botMsg.source === 'mistral' ? '🌬️' : botMsg.source === 'sambanova' ? '🚀' : botMsg.source === 'qwen' ? '🐉' : botMsg.source === 'onehop' ? '🐋' : botMsg.source === 'zimage' ? '🖼️' : '💻';
            // This message was just pushed as the newest one, so it's always eligible for regenerate.
            buildMsgActionButtons(botMsg, actionsDiv, true);
            syncRegenerateButtons(chats.find(c => c.id === currentChatId));
            renderMotivationalRow(msgDiv);
            // نبدأ نحمّل صوت الرد ده في الخلفية دلوقتي، قبل ما الطالب يدوس زرار "استمع"
            // أصلاً — لو دوسه بعد كده، الصوت غالبًا يكون جاهز فيشتغل فورًا من غير تحميل.
            prefetchTtsAudio(botMsg);
        }

        function appendMessageToDOM(msg, scroll = true) {
            const container = document.getElementById('chatContainer');
            const div = document.createElement('div');
            div.className = `message ${msg.role}`;
            div.id = msg.id || `msg-${Date.now()}`;
            
            const contentHTML = DOMPurify.sanitize(marked.parse(msg.content));
            const time = new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});

            const avatar = document.createElement('div');
            avatar.className = 'msg-avatar';
            // لو ده حساب طالب موثّق، بنستبدل أيقونة الطالب الافتراضية بصورته الشخصية
            // (أو دايرة باسمه لو لسه مضافش صورة) مع شارة التوثيق الزرقاء فوق طرفها —
            // بنفس شكل الشارة المستخدم في الإعدادات وقائمة الحسابات الموثقة.
            if (msg.role === 'user' && currentUserProfile && currentUserProfile.isVerified) {
                avatar.style.background = 'transparent';
                avatar.style.border = 'none';
                avatar.innerHTML = renderVerifiedAvatar(currentUserProfile.fullName, currentUserProfile.avatarUrl, true, 34);
            } else {
                avatar.innerHTML = `<i class="fas fa-${msg.role === 'user' ? 'user' : 'graduation-cap'}"></i>`;
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'msg-content';

            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble' + (msg.pinned ? ' pinned-msg' : '');
            if (msg.image && msg.image.base64) {
                const img = document.createElement('img');
                img.className = 'msg-image';
                img.src = `data:${msg.image.mimeType};base64,${msg.image.base64}`;
                img.alt = msg.image.name || 'صورة مرفقة';
                img.loading = 'lazy';
                img.addEventListener('click', () => openImageLightbox(img.src));
                bubble.appendChild(img);
            }
            const textWrap = document.createElement('div');
            textWrap.className = 'msg-text';
            textWrap.innerHTML = contentHTML;
            bubble.appendChild(textWrap);
            enhanceCodeBlocks(bubble);

            const meta = document.createElement('div');
            meta.className = 'msg-meta';
            const timeSpan = document.createElement('span');
            timeSpan.textContent = time;
            meta.appendChild(timeSpan);

            if (msg.role === 'bot') {
                const sourceSpan = document.createElement('span');
                sourceSpan.style.cssText = 'margin-right:6px;opacity:0.6';
                sourceSpan.textContent = msg.source === 'groq' ? '⚡' : msg.source === 'gemini' ? '🌟' : msg.source === 'openrouter' ? '🔀' : msg.source === 'cerebras' ? '🧠' : msg.source === 'claude-opus' ? '✨' : msg.source === 'mistral' ? '🌬️' : msg.source === 'sambanova' ? '🚀' : msg.source === 'qwen' ? '🐉' : msg.source === 'onehop' ? '🐋' : msg.source === 'zimage' ? '🖼️' : '💻';
                meta.appendChild(sourceSpan);
            }

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'msg-actions';
            const chatForLastCheck = chats.find(c => c.id === currentChatId);
            const isLastMsg = !!(chatForLastCheck && chatForLastCheck.messages.length > 0 &&
                chatForLastCheck.messages[chatForLastCheck.messages.length - 1].id === msg.id);
            buildMsgActionButtons(msg, actionsDiv, msg.role === 'bot' && isLastMsg);
            meta.appendChild(actionsDiv);

            if (msg.role === 'bot' && msg.thinking) {
                const thinkWrap = document.createElement('div');
                thinkWrap.innerHTML = buildThinkingBlockHTML(msg.thinking, msg.thinkingSeconds);
                contentDiv.appendChild(thinkWrap.firstElementChild);
            }
            contentDiv.appendChild(bubble);
            contentDiv.appendChild(meta);
            div.appendChild(avatar);
            div.appendChild(contentDiv);
            
            container.insertBefore(div, document.getElementById('typingIndicator'));
            if (scroll) scrollToBottom();
            syncRegenerateButtons(chatForLastCheck);
        }

        // لو الرد اتقطع (المستخدم ضغط إيقاف) في نص صف جدول Markdown أو بلوك كود مش مقفول،
        // marked.parse بيعرضه كنص خام مكسور بدل جدول/كود منسق. بنشيل آخر سطر لو كان جزء من
        // جدول ناقص واضح (بيبدأ بـ | ومش منتهي بـ |)، وبنقفل ``` مفتوحة لو عددها فردي —
        // كده الجزء الأخير المقطوع بيتشال بدل ما يتعرض مكسور وبرا الإطار.
        function cleanupTruncatedMarkdown(text) {
            if (!text) return text;
            let out = text;
            const lines = out.split('\n');
            const lastLine = lines[lines.length - 1];
            if (lastLine && lastLine.trim().startsWith('|') && !lastLine.trim().endsWith('|')) {
                lines.pop();
                out = lines.join('\n');
            }
            const fenceCount = (out.match(/```/g) || []).length;
            if (fenceCount % 2 !== 0) out += '\n```';
            return out;
        }


        // Retry مع exponential backoff — بيحاول تاني بس على فشل شبكة حقيقي (انقطاع نت، تايم أوت)
        // أو 5xx من السيرفر (مشكلة مؤقتة عند المزود). ميحاولش تاني على 4xx (زي 400 كوتة خلصت،
        // أو 401 مفتاح غلط) لأن ده خطأ ثابت مش هيتغير بإعادة المحاولة، وهيضيع وقت وياخد نفس الرفض.
        // كان maxRetries = 2 (يعني 3 محاولات) على *كل* مزود لوحده قبل ما ننزل للمزود
        // التالي في سلسلة "auto" — لو مزود معين واقع أو بطيء، الطالب كان بينتظر 3
        // محاولات كاملة (بينهم مهلة 500ms/1000ms) عليه لوحده قبل حتى ما نجرب مزود
        // تاني شغال، وده كان بيدي إحساس إن البوت "بطيء وضعيف". دلوقتي محاولة واحدة
        // إعادة بس (يعني محاولتين إجمالي) — لو المزود لسه واقع، ننزل بسرعة للمزود
        // التالي بدل ما نضيّع وقت في إعادة محاولة نفس المزود العالق.
        // مهلة لكل محاولة اتصال لوحدها (مش للطلب كله) — لو مزود عالق وماردش خالص (لا
        // نجاح ولا فشل صريح، الشبكة واقفة عنده)، كنا بننتظره من غير حد أقصى لحد ما
        // المتصفح نفسه يقفل الاتصال بعد وقت طويل جدًا. دلوقتي بعد 12 ثانية بدون رد
        // نعتبرها فشلت وننزل فورًا للمزود التالي، بدل ما الطالب يحس إن البوت "واقف".
        // ⚠️ 12 ثانية دي افتراضي مناسب لمعظم المزودين (Groq/Cerebras/DeepSeek/...
        // كلهم سريعين في أول توكن). Claude Opus موديل "تفكير عميق" وبطبيعته أبطأ في
        // إرسال أول توكن (time-to-first-byte)، فبنمرّرله timeoutMs أعلى صراحة عند
        // النداء عليه (شوف streamClaudeOpus) بدل ما نغيّر الافتراضي العام لكل المزودين.
        const PROVIDER_ATTEMPT_TIMEOUT_MS = 12000;
        async function fetchWithRetry(url, options, maxRetries = 1, timeoutMs = PROVIDER_ATTEMPT_TIMEOUT_MS) {
            let lastErr;
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                const attemptController = new AbortController();
                const onOuterAbort = () => attemptController.abort();
                const outerSignal = options.signal;
                if (outerSignal) {
                    if (outerSignal.aborted) attemptController.abort();
                    else outerSignal.addEventListener('abort', onOuterAbort, { once: true });
                }
                const timeoutId = setTimeout(() => attemptController.abort(), timeoutMs);
                try {
                    const res = await fetch(url, { ...options, signal: attemptController.signal });
                    clearTimeout(timeoutId);
                    if (res.ok || res.status < 500) {
                        // نجح الاتصال — سيبي المستمع شغال طول فترة قراءة الـ body (مش بس لحد وصول الهيدرز)
                        // عشان زرار "إيقاف" يقدر يقفل الرد فورًا حتى لو لسه بيتكتب. هيتشال لوحده لما
                        // outerSignal يتلغي (once: true) أو لما المحادثة الحالية تخلص طبيعي.
                        return res;
                    }
                    if (outerSignal) outerSignal.removeEventListener('abort', onOuterAbort);
                    lastErr = new Error(`Server error ${res.status}`);
                } catch (err) {
                    clearTimeout(timeoutId);
                    if (outerSignal) outerSignal.removeEventListener('abort', onOuterAbort);
                    if (outerSignal && outerSignal.aborted) { const abortErr = new Error('Aborted'); abortErr.name = 'AbortError'; throw abortErr; } // المستخدم ألغى بنفسه
                    lastErr = (err.name === 'AbortError') ? new Error('Provider timeout') : err; // مهلتنا إحنا، مش إلغاء المستخدم — نكمل للمحاولة/المزود التالي
                }
                if (attempt < maxRetries) {
                    const delay = 300 * Math.pow(2, attempt); // 300ms, 600ms...
                    await new Promise(r => setTimeout(r, delay));
                }
            }
            throw lastErr;
        }

        async function streamGroq(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/groq`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });
            
            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Groq API error', response.status, detail);
                throw new Error(`Groq API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'groq'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'groq', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'groq', false, streamState);
        }

        async function streamOpenRouter(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/openrouter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // "openrouter/free" is OpenRouter's own auto-router across its free-tier
                    // models — it keeps working even as individual free model IDs rotate out,
                    // instead of hardcoding one that might get retired without notice.
                    model: "openrouter/free",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('OpenRouter API error', response.status, detail);
                throw new Error(`OpenRouter API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'openrouter'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'openrouter', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'openrouter', false, streamState);
        }

        // مهلة أعلى شوية من الافتراضي (20 ثانية بدل 12) — بعد ما ضفنا فحص الاشتراك
        // الحقيقي (نداء شبكة + استعلام قاعدة بيانات) قبل أي طلب لـ Cerebras، بقى فيه
        // زمن إضافي فوق سرعة Cerebras الطبيعية، خصوصًا في أول طلب (cold start).
        const CEREBRAS_TIMEOUT_MS = 20000;
        async function streamCerebras(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/cerebras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // بنبعت توكن School X عشان السيرفر يتأكد فعليًا إن الطالب مشترك في
                    // premium_ai قبل ما يكمل الطلب — مش بس ثقة في إن الفرونت إند مخفي
                    // الخيار ده عن غير المشتركين (ده سهل الالتفاف عليه من الـ devtools).
                    ...(schoolToken ? { 'Authorization': `Bearer ${schoolToken}` } : {})
                },
                body: JSON.stringify({
                    model: "gpt-oss-120b",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            }, 1, CEREBRAS_TIMEOUT_MS);

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Cerebras API error', response.status, detail);
                throw new Error(`Cerebras API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'cerebras'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'cerebras', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'cerebras', false, streamState);
        }

        // موديل Claude Opus عن طريق OneHop — Premium بس (زي Cerebras بالظبط)، بيعدي على
        // باك إند Chat X نفسه على endpoint مخصص (/api/claude-opus) مش /api/onehop العادي،
        // عشان الموديل يبقى مثبّت من السيرفر ومحدش يقدر يغيّره لموديل تاني أغلى أو مش
        // مسموح بيه حتى لو لعب في الطلب من الـ devtools.
        // مهلة أطول خصيصًا لـ Claude Opus/Fable (60 ثانية بدل 35) — بعد ما ضفنا فحص
        // الاشتراك الحقيقي (نداء شبكة + استعلام قاعدة بيانات على سيرفر School X) قبل
        // ما نبدأ حتى نكلم الموديل، بقى فيه زمن إضافي فوق بطء الموديل نفسه الطبيعي في
        // أول رد. 35 ثانية بقت مش كفاية أحيانًا، خصوصًا في أول طلب (cold start).
        const CLAUDE_OPUS_TIMEOUT_MS = 60000;
        async function streamClaudeOpus(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/claude-opus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // بنبعت توكن School X عشان السيرفر يتأكد فعليًا إن الطالب مشترك في
                    // premium_ai قبل ما يكمل الطلب — مش بس ثقة في إن الفرونت إند مخفي
                    // الخيار ده عن غير المشتركين (ده سهل الالتفاف عليه من الـ devtools).
                    ...(schoolToken ? { 'Authorization': `Bearer ${schoolToken}` } : {})
                },
                body: JSON.stringify({
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            }, 1, CLAUDE_OPUS_TIMEOUT_MS);

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Claude Opus API error', response.status, detail);
                throw new Error(`Claude Opus API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'claude-opus'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'claude-opus', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'claude-opus', false, streamState);
        }

        async function streamMistral(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/mistral`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "mistral-small-latest",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Mistral API error', response.status, detail);
                throw new Error(`Mistral API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'mistral'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'mistral', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'mistral', false, streamState);
        }

        async function streamSambanova(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/sambanova`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "Meta-Llama-3.3-70B-Instruct",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('SambaNova API error', response.status, detail);
                const err = new Error(`SambaNova API Error (${response.status}): ${detail || 'no detail'}`);
                err.status = response.status; // بنحفظ الكود عشان اللي بينادي يقدر يميّز 429 (مزدحم) عن أي خطأ تاني
                throw err;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'sambanova'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'sambanova', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'sambanova', false, streamState);
        }

        async function streamQwen(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/qwen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "qwen-plus",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Qwen API error', response.status, detail);
                throw new Error(`Qwen API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'qwen'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'qwen', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'qwen', false, streamState);
        }

        // موديل DeepSeek عن طريق OneHop — نفس شكل باقي الموديلات بالظبط، بيعدي على
        // باك إند Chat X نفسه (مش على OneHop مباشرة) عشان الـ API key يفضل مخبّي
        // على السيرفر وميظهرش في كود الموقع خالص.
        async function streamOneHop(messages, signal) {
            const response = await fetchWithRetry(`${settings.backendUrl}/api/onehop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "deepseek/deepseek-v4-pro",
                    messages: [{role: "system", content: getSystemPrompt()}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.content}))],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('OneHop API error', response.status, detail);
                throw new Error(`OneHop API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'onehop'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'onehop', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(messages[messages.length - 1].content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'onehop', false, streamState);
        }

        // System prompt for the "معلم الألماني" mode: a professional German teacher
        // specialized in absolute beginners (A1/A2), explaining in Arabic with German
        // examples. Sent to Gemini as systemInstruction — never shown in the chat itself.
        const GERMAN_TEACHER_SYSTEM_PROMPT = `أنت معلّم لغة ألمانية محترف ومتخصص فى تعليم المبتدئين تمامًا (مستوى A1 و A2). اتبع هذه القواعد فى كل رد:
- اشرح دايمًا بالعربية البسيطة والواضحة، واستخدم الألمانية فقط فى الكلمات والجمل المثال.
- ابدأ دايمًا من الأساس ولو الطالب مش محدد مستواه: الحروف والنطق، التحية، تقديم النفس، الأرقام، الجمل البسيطة، قبل الانتقال لحاجة أصعب.
- كل كلمة أو جملة ألمانية جديدة، اكتبها بالشكل ده: الكلمة الألمانية (النطق التقريبي بالعربي) = المعنى بالعربي.
- اشرح القواعد النحوية (زي أدوات التعريف der/die/das، تصريف الأفعال، ترتيب الجملة) بطريقة مبسطة جدًا وبأمثلة عملية، من غير ما تستخدم مصطلحات لغوية معقدة إلا ولو شرحتها.
- لما الطالب يكتب جملة أو يحاول يترجم حاجة، صحح غلطه بأسلوب مشجّع ومحترم، ووضح سبب الغلط بشكل مختصر، وإديله الصيغة الصحيحة.
- بعد كل شرح، اقترح تمرين قصير جدًا (سؤال أو جملة يكملها الطالب) عشان تتأكد إنه فاهم قبل ما تكمل.
- خلّي أسلوبك صبور، ودود، ومشجّع طول الوقت، ومتدرج فى الصعوبة حسب رد الطالب.
- لو الطالب سأل سؤال مالوش علاقة باللغة الألمانية، جاوبه بإيجاز ورجّعه بلطف لموضوع تعلم الألمانية.
- لو حد سألك "مين عملك؟" أو "مين صنعك؟" أو "مين المطور بتاعك؟" أو أي سؤال عن هويتك، جاوبه إنك جزء من منصة Chat X، اتصنعت بواسطة web developer اسمه Ahmed Moussa Ahmed Hussin (أحمد موسى أحمد حسين) من محافظة الأقصر.`;

        // "الممتحن الشرس" — امتحان شفهي تفاعلي مبني حصريًا على ملف/نص بيرفعه الطالب
        // (بيستخدم نفس آلية استخراج النص من المرفقات الموجودة أصلاً فى formatAttachmentForMessage
        // — النص الكامل بيتحط فعليًا فى الرسالة، مش مجرد اسم الملف، فالموديل بيقرأه
        // بالكامل زي أي نص تاني فى المحادثة). القواعد هنا مصممة عشان الأسئلة تبقى
        // مبنية على محتوى الملف فعلاً (مش عامة)، والمتابعة (follow-up) تبقى مبنية
        // على إجابة الطالب الفعلية (مش سؤال عشوائي تانى من الملف) — ده اللي بيدّي
        // إحساس "فاهم بيسأل ازاي" بدل أسئلة مقطوعة عن بعض.
        const EXAMINER_SYSTEM_PROMPT = `أنت "الممتحن الشرس" — دكتور/مشرف تمريض صارم بيعمل امتحان شفهي (Oral Exam) حقيقي للطالب، مش مساعد بيشرح.

## القاعدة الأهم: الملف هو مصدرك الوحيد
- أول رسالة من الطالب هتحتوي على نص مرفق (ملف/محاضرة) داخل قسم "مرفق". اقرأه بالكامل وبعناية قبل ما تسأل أي سؤال.
- كل سؤال تسأله لازم يكون عن معلومة موجودة فعليًا في النص ده. ممنوع تختلق معلومة أو تسأل عن حاجة مش مذكورة فيه.
- لو الطالب بعت رسالة من غير ملف مرفق، قوله بوضوح إنك محتاج ملف/محاضرة الأول عشان تمتحنه فيها، ومتبدأش تمتحن من غير مصدر.

## طريقة الامتحان
- سؤال واحد بس فى كل رد — زي امتحان شفهي حقيقي، مش قائمة أسئلة.
- بعد إجابة الطالب، قيّمها فورًا وبصراحة (صح / ناقص / غلط) فى سطر أو سطرين، من غير لف ودوران.
- سؤال المتابعة (follow-up) لازم يكون مبني تحديدًا على اللي الطالب قاله هو فى إجابته دي — مش سؤال عشوائي تاني من الملف. لو قال معلومة، اسأله "ليه؟" أو "وإيه لو..." عليها بالذات.

## التصعيد الذكي
- لو جاوب صح وبسهولة: صعّب السؤال الجاي — حالة استثنائية، سيناريو معقد، أو تعارض بين حاجتين فى الملف.
- لو جاوب غلط أو ناقص: وضّح الصح بسرعة (سطرين بالكتير)، وبعدين ارجع تمتحنه فى نفس النقطة من زاوية مختلفة — متسبهاش وتنتقل لحاجة تانية على طول.
- لو مسكت تناقض بين إجابته دلوقتي وإجابة قالها قبل كده فى نفس المحادثة، واجهه بيه صراحةً: "قولت قبل كده كذا، ودلوقتي بتقول كذا — أنهي الكلام صح؟"

## الأسلوب
- مباشر وصارم لكن مش مهين خالص — زي دكتور بيدرّبك على امتحان حقيقي، مش بيسخر منك. ضغط بنّاء، مش تنمر.
- من غير مجاملات زيادة ("رائع!"، "ممتاز جدًا!") إلا لو الإجابة فعلاً كانت كاملة ودقيقة.
- لو الطالب قال "كفاية" أو "وقف" أو طلب ينهي الجلسة، اديله ملخص سريع: النقط اللي كان قوي فيها، والنقط اللي محتاجة مراجعة أكتر — وبس، من غير سؤال جديد بعده.
- لو حد سألك "مين عملك؟" أو "مين صنعك؟" أو "مين المطور بتاعك؟" أو أي سؤال عن هويتك، اخرج من وضع الامتحان لحظة واحدة وجاوبه إنك جزء من منصة Chat X، اتصنعت بواسطة web developer اسمه Ahmed Moussa Ahmed Hussin (أحمد موسى أحمد حسين) من محافظة الأقصر، وبعدين ارجع كمّل الامتحان.`;

        async function streamGemini(messages, signal, systemPrompt) {
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user') || messages[messages.length - 1];
            const parts = [{ text: lastUserMsg.content }];
            if (lastUserMsg.image && lastUserMsg.image.base64) {
                parts.push({ inline_data: { mime_type: lastUserMsg.image.mimeType, data: lastUserMsg.image.base64 } });
            }
            // Gemini has no memory of its own between requests — every call is stateless,
            // so "remembering" earlier parts of the lesson only works if we actually send
            // them again as history. Send the full conversation every time.
            const history = messages.slice(0, -1);
            const requestBody = {
                contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })).concat([{ role: 'user', parts }])
            };
            // لو Deep Thinking مفعّل، نضيف تعليمات التركيز والتحليل السابق حتى لو الموديل
            // ده اتنادى من غير system prompt خاص بيه أصلاً (حالة Gemini الافتراضية).
            let effectiveSystemPrompt = systemPrompt || '';
            if (settings.deepThink) {
                effectiveSystemPrompt = (effectiveSystemPrompt || 'أنت مساعد أكاديمي ذكي.') + DEEP_THINK_FINAL_ANSWER_INSTRUCTION;
                if (deepThinkReasoningContext) {
                    effectiveSystemPrompt += `\n\nده تحليلك الداخلي اللي عملته بنفسك من شوية على نفس سؤال الطالب ده — استخدمه عشان تجاوب بدقة وتركيز، من غير ما تكرره أو تشير إنه موجود:\n${deepThinkReasoningContext}`;
                }
            }
            if (effectiveSystemPrompt) {
                requestBody.systemInstruction = { parts: [{ text: effectiveSystemPrompt }] };
            }
            const response = await fetchWithRetry(`${settings.backendUrl}/api/gemini`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Gemini API error', response.status, detail);
                throw new Error(`Gemini API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // keep any partial line for the next chunk

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            const piece = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (piece) { fullText += piece; streamChunkToUI(streamState, fullText, 'gemini'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'gemini', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(lastUserMsg.content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'gemini', false, streamState);
        }

        // Sends the last user message (with its attached image, if any) to the vision-capable
        // model behind /api/zimage and streams back an analysis/answer about it. Falls back to
        // plain text if no image is attached, so picking this model still works normally.
        async function streamZimage(messages, signal) {
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user') || messages[messages.length - 1];
            const userContent = (lastUserMsg.image && lastUserMsg.image.base64)
                ? [
                      { type: 'text', text: lastUserMsg.content || 'صف هذه الصورة بالتفصيل وحلل محتواها.' },
                      { type: 'image_url', image_url: { url: `data:${lastUserMsg.image.mimeType};base64,${lastUserMsg.image.base64}` } }
                  ]
                : lastUserMsg.content;

            const historyMessages = messages.slice(0, -1)
                .filter(m => m.role === 'user' || m.role === 'bot')
                .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

            const response = await fetchWithRetry(`${settings.backendUrl}/api/zimage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "qwen-vl-max",
                    messages: [
                        { role: "system", content: getSystemPrompt("أنت مساعد أكاديمي ذكي قادر على تحليل الصور المرفوعة بدقة ووصف محتواها والإجابة عن أي سؤال متعلق بها.") },
                        ...historyMessages,
                        { role: "user", content: userContent }
                    ],
                    stream: true
                }),
                signal
            });

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.text()).slice(0, 200); } catch (e) {}
                console.error('Z-Image API error', response.status, detail);
                throw new Error(`Z-Image API Error (${response.status}): ${detail || 'no detail'}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';
            const streamState = beginBotMessageStream();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const data = JSON.parse(payload);
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) { fullText += content; streamChunkToUI(streamState, fullText, 'zimage'); }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && fullText) {
                    renderFinishedBotMessage(fullText, 'zimage', true, streamState);
                }
                throw err;
            }

            if (!fullText) {
                await respondLocally(lastUserMsg.content, chats.find(c => c.id === currentChatId), signal);
                return;
            }

            renderFinishedBotMessage(fullText, 'zimage', false, streamState);
        }

        function getLocalResponse(prompt) {
            const p = prompt.toLowerCase();
            if (p.includes('خطة') || p.includes('دراسة')) {
                return "### خطة دراسة مقترحة:\n\n**1. تحديد الأولويات:** ابدأ بالمواد الأصعب.\n**2. تقنية بومودورو:** 25 دقيقة دراسة + 5 دقائق راحة.\n**3. المراجعة النشطة:** اختبر نفسك باستمرار.\n**4. النوم الكافي:** 7-8 ساعات يومياً.";
            }
            if (p.includes('تلخيص') || p.includes('درس')) {
                return "لتلخيص أي درس:\n1. اقرأ العنوان والأهداف\n2. حدد الكلمات المفتاحية\n3. أعد الصياغة بأسلوبك\n4. ارسم خريطة ذهنية";
            }
            if (p.includes('mcq') || p.includes('اختبار') || p.includes('سؤال')) {
                return "**س:** ما هي عاصمة السعودية؟\n**ج:** الرياض\n\n**س:** كم عدد قارات العالم؟\n**ج:** 7 قارات";
            }
            return "أهلاً بك في Chat X! كيف يمكنني مساعدتك في دراستك اليوم؟";
        }

        function initSpeechRecognition() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const micBtn = document.getElementById('micBtn');
            if (!SR) {
                micBtn.classList.add('unsupported');
                return;
            }
            recognition = new SR();
            recognition.lang = 'ar-EG';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                isListening = true;
                micBtn.classList.add('listening');
                document.getElementById('micIcon').className = 'fas fa-stop';
            };

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                const input = document.getElementById('messageInput');
                input.value = transcript;
                autoResize(input);
                updateCharCount();
            };

            recognition.onerror = (event) => {
                // الرسائل دي بقت مبنية على نوع الخطأ الحقيقي من محرك التعرف على الصوت نفسه
                // (مش تخمين)، وخصوصًا 'not-allowed': الرسالة القديمة كانت بتقول "سمح بيه من
                // إعدادات المتصفح" من غير ما تحدد فين بالظبط — والمشكلة إن كروم بمجرد ما ترفض
                // الإذن مرة واحدة (حتى بالغلط) بيوقف يسأل تاني للأبد لنفس الموقع، فالطالب
                // بيفتكر إنه "مفعّل" لأنه شايف إذن الميكروفون عمومًا مفعّل من إعدادات
                // الموبايل (على مستوى التطبيق كله)، من غير ما يعرف إن فيه إذن منفصل خاص
                // بكل موقع بالظبط، وده اللي محتاج يتغيّر من أيقونة القفل 🔒 جنب رابط الموقع.
                const messages = {
                    'not-allowed': 'الإذن مرفوض لموقع Chat X تحديدًا (مش إعدادات الميكروفون العامة للموبايل) — دوس على أيقونة 🔒 أو (i) جنب رابط الموقع فوق ← إعدادات الموقع ← الميكروفون ← اسمح، وبعدها اعمل تحديث للصفحة',
                    'service-not-allowed': 'خدمة التعرف على الصوت مرفوضة من المتصفح',
                    'audio-capture': 'مفيش ميكروفون متاح، أو هو مستخدم دلوقتي في تطبيق/تاب تاني — اقفله وجرب تاني',
                    'network': 'مشكلة في الاتصال بخدمة التعرف على الصوت'
                };
                if (messages[event.error]) showToast(messages[event.error], 'error');
            };

            recognition.onend = () => {
                isListening = false;
                micBtn.classList.remove('listening');
                document.getElementById('micIcon').className = 'fas fa-microphone';
            };
        }

        async function toggleVoiceInput() {
            if (!recognition || isGenerating) return;

            if (isListening) {
                recognition.stop();
                return;
            }

            // SpeechRecognition (and getUserMedia) only work in a secure context — https:// or
            // localhost. Opening the file directly (file://) or over plain http:// silently fails
            // without this check, which is the #1 cause of "the mic just doesn't work".
            if (!window.isSecureContext) {
                showToast('المايك محتاج الصفحة تتفتح عن طريق HTTPS أو localhost', 'error');
                return;
            }

            // ⚠️ مقصود عمدًا إننا مانعملش getUserMedia({audio:true}) هنا "كفحص مبدئي" قبل
            // recognition.start() — ده كان بيسبب باج حقيقي: بنطلب المايك، نوقفه فورًا
            // (stream.getTracks().forEach(t => t.stop()))، وبعدين recognition.start() بتطلب
            // المايك تاني لوحدها من غير ما تستخدم الـ stream اللي أخدناه أصلًا. الفتح والقفل
            // السريع ده كان أحيانًا بيمنع المتصفح من تسليم المايك تاني فورًا (خصوصًا موبايل)،
            // فبيرجع خطأ "مرفوض" حتى لو الإذن فعليًا ممنوح — والطالب يفتكر إن المشكلة إذن
            // وهي مش كده. دلوقتي recognition.start() بتطلب المايك مرة واحدة بس، ورسائل
            // onerror فوق بقت دقيقة بما يكفي (بتفرّق بين "مرفوض فعلاً" و"مستخدم في مكان تاني").
            try {
                recognition.start();
            } catch (e) {
                // start() throws if called while a previous session is still winding down —
                // reset cleanly and retry once instead of leaving the mic stuck "on" visually.
                try { recognition.stop(); } catch (_) {}
                setTimeout(() => { try { recognition.start(); } catch (_) {} }, 250);
            }
        }

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }

        function updateCharCount() {
            const len = document.getElementById('messageInput').value.length;
            document.getElementById('charCount').textContent = `${len} / 4000`;
            if (!isGenerating) {
                document.getElementById('sendBtn').disabled = len === 0 && !pendingAttachment;
            }
        }

        function handleKeyDown(e) {
            // Ignore Enter presses that are part of IME composition (common on mobile keyboards
            // with Arabic predictive text) — otherwise a single Enter can fire sendMessage() twice.
            if (e.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }

        // بدل ما نعمل setTimeout جديد كل مرة بتتنادى (كان بيحصل مع كل تحديث نص، يعني عشرات
        // الـ timeouts المتراكمة فوق بعض في الثانية الواحدة أثناء الكتابة الحية — ده كمان
        // كان سبب في التهزهز)، بنستخدم علم "scheduled" بسيط: لو فيه scroll مجدول بالفعل،
        // منجدولش واحد تاني فوقه، ونستنى الـ requestAnimationFrame يظبط التوقيت مع دورة
        // رسم المتصفح نفسها (أنعم بكتير من setTimeout عشوائي).
        // السبب الحقيقي للتهزهز: chat-container كان فيه scroll-behavior: smooth في الـ CSS.
        // ده معناه إن أي مرة نغيّر فيها scrollTop برمجيًا (زي هنا، كل تيك من الـ typewriter
        // كل 18ms تقريبًا)، المتصفح كان بيبدأ أنيميشن "smooth scroll" جديد للهدف الجديد —
        // لكن قبل ما الأنيميشن يخلص، بييجي تيك تاني بهدف أعلى، فيتلغي ويبدأ من جديد... وهكذا
        // عشرات المرات في الثانية. النتيجة البصرية: الشات بيهتز/يرتعش لأنه بيحاول يلحق هدف
        // بيتحرك باستمرار بمنحنى حركة (easing) بدل ما ينط للمكان الصح على طول.
        // الحل الجذري: شلنا scroll-behavior:smooth من الـ CSS خالص (خليناها auto)، وهنا كمان
        // بنستخدم scrollTo({behavior:'auto'}) صراحةً بدل تعيين scrollTop مباشرة، عشان الكود
        // يفضل يشتغل صح حتى لو حد ضاف smooth-scroll تاني في مكان تاني من الصفحة مستقبلاً.
        let scrollScheduled = false;
        function scrollToBottom() {
            if (scrollScheduled) return;
            scrollScheduled = true;
            requestAnimationFrame(() => {
                const container = document.getElementById('chatContainer');
                container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
                scrollScheduled = false;
            });
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => showToast('تم النسخ', 'success'))
                .catch(() => showToast('تعذر النسخ', 'error'));
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        }

        function closeSidebar() {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        }

        function toggleTheme(event) {
            const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
            const btn = event?.currentTarget;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // فولباك: لو المتصفح مش بيدعم View Transitions API أو المستخدم مفعّل "تقليل الحركة"،
            // بدّل الوضع عادي من غير أنيميشن.
            if (!document.startViewTransition || !btn || prefersReducedMotion) {
                settings.theme = newTheme;
                applyTheme(newTheme);
                saveData();
                return;
            }

            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const transition = document.startViewTransition(() => {
                settings.theme = newTheme;
                applyTheme(newTheme);
                saveData();
            });

            transition.ready.then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`
                        ]
                    },
                    {
                        duration: 550,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        }

        function applyTheme(theme) {
            // بنستخدم classList بدل className= المباشرة (اللي كانت بتمسح أي كلاس تاني
            // على الـ body زي premium-theme-on أو clinical-theme-on عند كل تبديل وضع
            // ليلي/نهاري) — كده الثيمات الإضافية بتفضل شغالة مهما بدّلنا الوضع.
            document.body.classList.toggle('light', theme === 'light');
            document.getElementById('themeIcon').className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // آخر عنصر كان عليه فوكس قبل ما نفتح أي مودال — عشان نرجّعله التركيز تاني
        // بمجرد ما يتقفل (أهم حاجة لمستخدمي الكيبورد وقارئ الشاشة عشان "يفضلوا
        // واقفين" في نفس المكان اللي كانوا فيه، بدل ما التركيز يضيع من الصفحة).
        let lastFocusedBeforeModal = null;

        function openModal(id) {
            const el = document.getElementById(id);
            if (!el) return;
            lastFocusedBeforeModal = document.activeElement;
            el.classList.add('active');
            if (window.innerWidth < 768) closeSidebar();
            // role="dialog" + aria-modal بيخلوا قارئ الشاشة يفهم إن ده نافذة منبثقة
            // مستقلة عن باقي الصفحة (على صندوق المودال نفسه مش الخلفية)، ونقل
            // التركيز جواه بيمنع مستخدم الكيبورد إنه "يعلق" على عنصر تحت المودال
            // وهو مش شايفه على الشاشة.
            const modalBox = el.querySelector('.modal') || el;
            modalBox.setAttribute('role', 'dialog');
            modalBox.setAttribute('aria-modal', 'true');
            if (!modalBox.hasAttribute('tabindex')) modalBox.setAttribute('tabindex', '-1');
            requestAnimationFrame(() => { try { modalBox.focus({ preventScroll: true }); } catch (e) {} });
            if (id === 'toolsModal' && schoolUser?.type === 'admin') loadDeepThinkAdminConfig();
        }

        function closeModal(id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('active');
            // رجّع التركيز للزرار اللي فتح المودال أصلاً — لو لسه موجود وقابل للتركيز
            if (lastFocusedBeforeModal && document.body.contains(lastFocusedBeforeModal) && typeof lastFocusedBeforeModal.focus === 'function') {
                try { lastFocusedBeforeModal.focus({ preventScroll: true }); } catch (e) {}
            }
            lastFocusedBeforeModal = null;
        }

        // Escape بيقفل أي مودال فاتح دلوقتي — تعميم لكل النوافذ المبنية على
        // modal-overlay اللي مكنش عندها طريقة تقفيل بالكيبورد قبل كده.
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const openModals = document.querySelectorAll('.modal-overlay.active');
            if (!openModals.length) return;
            const topId = openModals[openModals.length - 1].id;
            if (topId === 'telegramLinkModal') stopTelegramLinkPoll();
            if (topId === 'passwordResetModal') stopResetTelegramLinkPoll();
            closeModal(topId);
        });

        // ====================== نسخ احتياطي: تصدير/استيراد كل بيانات الطالب ======================
        // بنصدّر المحادثات والإحصائيات والإعدادات كملف JSON ينزل على جهاز الطالب.
        // عمدًا مبنصدّرش sx_school_token (توكن الدخول الحيّ) — لو الملف اتبعت لحد أو
        // اتشيّر بالغلط، أسوأ حاجة ممكن تحصل إنه يشوف محادثات الطالب، مش إنه يدخل حسابه.
        function exportAllData() {
            try {
                const backup = {
                    app: 'chat-x',
                    exportedAt: new Date().toISOString(),
                    version: 1,
                    chats: JSON.parse(localStorage.getItem('sx_chats') || '[]'),
                    currentChatId: localStorage.getItem('sx_current_chat') || null,
                    settings: JSON.parse(localStorage.getItem('sx_settings') || '{}'),
                    stats: JSON.parse(localStorage.getItem('sx_stats') || '{}'),
                    onboarded: localStorage.getItem('sx_onboarded') || null
                };
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-x-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 4000);
                const status = document.getElementById('backupStatus');
                if (status) status.innerHTML = '<span style="color:var(--success)">تم تنزيل النسخة الاحتياطية ✓</span>';
                showToast('تم تصدير بياناتك بنجاح', 'success');
            } catch (e) {
                showToast('تعذر تصدير البيانات', 'error');
            }
        }

        // بيقرأ ملف نسخة احتياطية ويرجّع البيانات — بيستبدل المحادثات الحالية بعد تأكيد من
        // الطالب (عشان منخسرش بياناته الحالية بالغلط لو ضغط استيراد وهو ناسي إن عنده حاجة جديدة).
        function importAllData(event) {
            const file = event.target.files[0];
            event.target.value = '';
            if (!file) return;
            const status = document.getElementById('backupStatus');
            const reader = new FileReader();
            reader.onload = () => {
                let data;
                try {
                    data = JSON.parse(reader.result);
                } catch (e) {
                    if (status) status.innerHTML = '<span style="color:var(--danger)">الملف تالف أو مش نسخة احتياطية صحيحة</span>';
                    showToast('تعذر قراءة الملف', 'error');
                    return;
                }
                if (!data || data.app !== 'chat-x' || !Array.isArray(data.chats)) {
                    if (status) status.innerHTML = '<span style="color:var(--danger)">الملف ده مش نسخة احتياطية من Chat X</span>';
                    showToast('ملف غير صالح', 'error');
                    return;
                }
                const confirmMsg = `هيتم استبدال محادثاتك الحالية (${chats.length}) بمحادثات من النسخة الاحتياطية (${data.chats.length}). متأكد؟`;
                if (!confirm(confirmMsg)) return;

                chats = data.chats;
                currentChatId = data.currentChatId || (chats[0] && chats[0].id) || null;
                if (data.settings && typeof data.settings === 'object') {
                    settings = { ...settings, ...data.settings, schoolApiUrl: FIXED_SCHOOL_API_URL };
                }
                if (data.stats && typeof data.stats === 'object') {
                    stats = data.stats;
                    localStorage.setItem('sx_stats', JSON.stringify(stats));
                }
                saveData();
                renderChatList();
                if (currentChatId) renderChat(currentChatId);
                applyTheme(settings.theme);
                renderStats();
                if (status) status.innerHTML = '<span style="color:var(--success)">تم استيراد البيانات بنجاح ✓</span>';
                showToast('تم استعادة بياناتك', 'success');
                closeModal('settingsModal');
            };
            reader.onerror = () => showToast('تعذرت قراءة الملف', 'error');
            reader.readAsText(file);
        }

        function saveBackendUrl() {
            const input = document.getElementById('backendUrlInput');
            const url = input.value.trim().replace(/\/+$/, '');
            settings.backendUrl = url;
            saveData();
            const status = document.getElementById('backendStatus');
            if (url) {
                status.innerHTML = '<span style="color:var(--success)">تم الحفظ ✓ هيتم النداء على ' + url + '</span>';
            } else {
                status.innerHTML = '<span style="color:var(--text-2)">تلقائي — هيتم النداء على /api/groq و /api/gemini على نفس الدومين</span>';
            }
            showToast('تم الحفظ', 'success');
        }

        // ====================== ربط School X (مشروع منفصل - سيرفر تاني، رابط ثابت) ======================

        function updateSchoolLoginUI() {
            const loggedOutBox = document.getElementById('schoolLoggedOutBox');
            const loggedInBox = document.getElementById('schoolLoggedInBox');
            const loggedInText = document.getElementById('schoolLoggedInText');
            const sbUserName = document.getElementById('sbUserNameText');
            const sbUserStatus = document.getElementById('sbUserStatus');
            const sbQuickLogoutBtn = document.getElementById('sbQuickLogoutBtn');
            const contactAdminSection = document.getElementById('contactAdminSection');
            const adminInboxSection = document.getElementById('adminInboxSection');

            if (schoolToken && schoolUser) {
                const name = schoolUser.fullName || schoolUser.username;
                const isAdmin = schoolUser.type === 'admin';
                if (loggedOutBox && loggedInBox) {
                    loggedOutBox.style.display = 'none';
                    loggedInBox.style.display = 'block';
                    loggedInText.innerHTML = `مسجّل دخول باسم: <b>${name}</b> (${isAdmin ? 'أدمن' : 'طالب'})`;
                }
                // نعرض اسم الطالب الحقيقي بشكل دائم في السايدبار — عشان لو الجهاز مشترك،
                // أي حد يفتح الشات يلاقي فورًا (من غير ما يفتح إعدادات) إن فيه حساب حد تاني
                // لسه مسجل دخول، ويقدر يعمل logout بضغطة واحدة بدل ما يدخل يدور في القوائم.
                if (sbUserName) sbUserName.textContent = name;
                if (sbUserStatus) sbUserStatus.innerHTML = '<span style="color:var(--warning)">مربوط بحساب School X</span>';
                if (sbQuickLogoutBtn) sbQuickLogoutBtn.style.display = 'flex';
                const leaderboardBtn = document.getElementById('leaderboardBtn');
                const groupChatBtn = document.getElementById('groupChatBtn');
                const pushNotifSection = document.getElementById('pushNotifSection');
                if (leaderboardBtn) leaderboardBtn.style.display = 'flex';
                const liveNowBtnOn = document.getElementById('liveNowBtn');
                if (liveNowBtnOn) liveNowBtnOn.style.display = 'flex';
                if (groupChatBtn) groupChatBtn.style.display = 'flex';
                if (pushNotifSection) pushNotifSection.style.display = 'block';

                // قسم "تواصل مع الأدمن" يظهر لغير الأدمن بس (الأدمن مش محتاج يبعت رسالة لنفسه).
                // قسم "الرسايل الواردة" يظهر للأدمن بس، وبيتحمّل تلقائيًا أول ما يظهر.
                if (contactAdminSection) contactAdminSection.style.display = isAdmin ? 'none' : 'block';
                if (adminInboxSection) {
                    adminInboxSection.style.display = isAdmin ? 'block' : 'none';
                    if (isAdmin) loadAdminInbox();
                }
                const adminAuditLogSection = document.getElementById('adminAuditLogSection');
                if (adminAuditLogSection) {
                    adminAuditLogSection.style.display = isAdmin ? 'block' : 'none';
                    if (isAdmin) loadAdminAuditLog();
                }
                const adminReviewSection = document.getElementById('adminReviewSection');
                if (adminReviewSection) {
                    adminReviewSection.style.display = isAdmin ? 'block' : 'none';
                    if (isAdmin) loadAdminReviewQueue();
                }
                const adminRatingsSection = document.getElementById('adminRatingsSection');
                if (adminRatingsSection) {
                    adminRatingsSection.style.display = isAdmin ? 'block' : 'none';
                    if (isAdmin) loadAdminRatingsSummary();
                }
                const adminPremiumPanelSection = document.getElementById('adminPremiumPanelSection');
                if (adminPremiumPanelSection) adminPremiumPanelSection.style.display = isAdmin ? 'block' : 'none';
                const adminSharingSection = document.getElementById('adminSharingSection');
                if (adminSharingSection) {
                    adminSharingSection.style.display = isAdmin ? 'block' : 'none';
                    if (isAdmin) loadAccountSharingReport();
                }
            } else {
                if (loggedOutBox && loggedInBox) {
                    loggedOutBox.style.display = 'block';
                    loggedInBox.style.display = 'none';
                }
                if (sbUserName) sbUserName.textContent = 'طالب Chat X';
                if (sbUserStatus) sbUserStatus.textContent = 'متصل الآن';
                if (sbQuickLogoutBtn) sbQuickLogoutBtn.style.display = 'none';
                if (contactAdminSection) contactAdminSection.style.display = 'none';
                if (adminInboxSection) adminInboxSection.style.display = 'none';
                const adminAuditLogSectionOff = document.getElementById('adminAuditLogSection');
                if (adminAuditLogSectionOff) adminAuditLogSectionOff.style.display = 'none';
                const adminReviewSectionOff = document.getElementById('adminReviewSection');
                if (adminReviewSectionOff) adminReviewSectionOff.style.display = 'none';
                const adminRatingsSectionOff = document.getElementById('adminRatingsSection');
                if (adminRatingsSectionOff) adminRatingsSectionOff.style.display = 'none';
                const adminPremiumPanelSectionOff = document.getElementById('adminPremiumPanelSection');
                if (adminPremiumPanelSectionOff) adminPremiumPanelSectionOff.style.display = 'none';
                const leaderboardBtnOff = document.getElementById('leaderboardBtn');
                const groupChatBtnOff = document.getElementById('groupChatBtn');
                const pushNotifSectionOff = document.getElementById('pushNotifSection');
                if (leaderboardBtnOff) leaderboardBtnOff.style.display = 'none';
                const liveNowBtnOff = document.getElementById('liveNowBtn');
                if (liveNowBtnOff) liveNowBtnOff.style.display = 'none';
                if (groupChatBtnOff) groupChatBtnOff.style.display = 'none';
                if (pushNotifSectionOff) pushNotifSectionOff.style.display = 'none';
            }
        }

        // خروج سريع من السايدبار مباشرة، مع تأكيد عشان محدش يعمله بالغلط بضغطة عرضية
        function quickSchoolLogout() {
            if (!confirm('تسجيل الخروج من حساب School X؟ (مفيد لو الجهاز ده بيستخدمه أكتر من طالب)')) return;
            schoolLogout();
        }

        async function schoolLogin() {
            const apiUrl = FIXED_SCHOOL_API_URL;
            const username = document.getElementById('schoolUsernameInput').value.trim();
            const password = document.getElementById('schoolPasswordInput').value;
            const status = document.getElementById('schoolLoginStatus');
            if (!username || !password) { status.innerHTML = '<span style="color:var(--danger)">اكتب اسم المستخدم وكلمة المرور</span>'; return; }
            status.innerHTML = 'جاري تسجيل الدخول...';
            try {
                const deviceFingerprint = await computeDeviceFingerprint();
                const res = await fetch(`${apiUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, deviceFingerprint })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    status.innerHTML = `<span style="color:var(--danger)">${data.error || 'فشل تسجيل الدخول'}</span>`;
                    return;
                }
                schoolToken = data.token;
                schoolUser = data.user;
                localStorage.setItem('sx_school_token', schoolToken);
                localStorage.setItem('sx_school_user', JSON.stringify(schoolUser));
                document.getElementById('schoolPasswordInput').value = '';
                status.innerHTML = '<span style="color:var(--success)">تم تسجيل الدخول ✓</span>';
                startSchoolHeartbeat();
                updateSchoolLoginUI();
                // بنعرض توست تأكيد الربط ده الأول قبل استدعاء fetchSchoolProfile عمدًا —
                // لو فيه ميزات بريميوم جديدة هتتفتحله، توستاتها هتتضاف بعده في نفس
                // الطابور وتظهر واحد ورا التاني بالترتيب الصح، بدل ما تتزاحم كلها مع بعض.
                showToast('تم ربط حسابك بمنصة School X', 'success', { icon: 'fa-link' });
                await fetchSchoolProfile(true); // force=true: نجيب بيانات جديدة فورًا (منتجنبش استخدام كاش حساب قديم)
            } catch (e) {
                status.innerHTML = '<span style="color:var(--danger)">تعذر الاتصال بالسيرفر — تأكد من الرابط</span>';
            }
        }

        // ====================== استرجاع كلمة السر ذاتيًا ======================
        let passwordResetToken = null;

        function openPasswordResetModal() {
            document.getElementById('prStep1').style.display = '';
            document.getElementById('prStepOtp').style.display = 'none';
            document.getElementById('prStepLinkTelegram').style.display = 'none';
            document.getElementById('prStep2').style.display = 'none';
            document.getElementById('prUsernameInput').value = document.getElementById('schoolUsernameInput').value || '';
            document.getElementById('prPhoneInput').value = '';
            document.getElementById('prOtpInput').value = '';
            document.getElementById('prNewPasswordInput').value = '';
            document.getElementById('prNewPasswordConfirmInput').value = '';
            document.getElementById('prStep1Status').innerHTML = '';
            document.getElementById('prStep1Status').classList.remove('show');
            document.getElementById('prStepOtpStatus').innerHTML = '';
            document.getElementById('prStepOtpStatus').classList.remove('show');
            document.getElementById('prStep2Status').innerHTML = '';
            document.getElementById('prStep2Status').classList.remove('show');
            document.getElementById('prLinkTelegramBtn').style.display = '';
            document.getElementById('prLinkTelegramWaiting').style.display = 'none';
            stopResetTelegramLinkPoll();
            passwordResetToken = null;
            openModal('passwordResetModal');
        }

        // isResend=true معناها إننا جايين من زرار "إعادة إرسال الكود" جوه خطوة الـ
        // OTP نفسها، مش من نموذج الخطوة الأولى — فبنستخدم نفس اسم المستخدم المتخزن.
        async function verifyPasswordResetIdentity(isResend) {
            const username = document.getElementById('prUsernameInput').value.trim();
            const phone = document.getElementById('prPhoneInput').value.trim();
            const statusEl = document.getElementById(isResend ? 'prStepOtpStatus' : 'prStep1Status');
            const btn = document.getElementById(isResend ? 'prOtpVerifyBtn' : 'prVerifyBtn');
            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };
            if (!username) { showStatus('<span style="color:var(--danger);">اكتب اسم المستخدم</span>'); return; }
            btn.disabled = true;
            showStatus(isResend ? 'جاري إعادة الإرسال...' : 'جاري التحقق...');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/password-reset/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, phone })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showStatus(`<span style="color:var(--danger);">${escapeHtml(data.error || 'تعذر التحقق')}</span>`);
                    return;
                }
                if (data.requiresOtp) {
                    // الحساب مربوط بـ Telegram بالفعل — كود اتبعت هناك، نفتح خطوة إدخاله
                    document.getElementById('prStep1').style.display = 'none';
                    document.getElementById('prStepOtp').style.display = '';
                    document.getElementById('prStepOtpStatus').innerHTML = '';
                    document.getElementById('prStepOtpStatus').classList.remove('show');
                    if (isResend) showStatus('<span style="color:var(--success);">اتبعت كود جديد ✅</span>');
                    return;
                }
                // رقم الهاتف اتطابق — عندنا التوكن دلوقتي. لو الحساب لسه مش مربوط
                // بتيليجرام (السيرفر بعتلنا رابط ربط)، نعرض عليه يربطه دلوقتي قبل
                // ما يكمل، بدل ما نروح على طول لخطوة كلمة السر الجديدة.
                passwordResetToken = data.resetToken;
                document.getElementById('prStep1').style.display = 'none';
                document.getElementById('prStepOtp').style.display = 'none';
                if (data.telegramLinkUrl) {
                    pendingResetTelegramLinkUrl = data.telegramLinkUrl;
                    document.getElementById('prStepLinkTelegram').style.display = '';
                } else {
                    document.getElementById('prStep2').style.display = '';
                }
            } catch (e) {
                showStatus('<span style="color:var(--danger);">تعذر الاتصال بالسيرفر</span>');
            } finally {
                btn.disabled = false;
            }
        }

        // ====================== ربط Telegram أثناء استرجاع كلمة السر (بدون تسجيل دخول) ======================
        let pendingResetTelegramLinkUrl = null;
        let resetTelegramLinkPollTimer = null;

        function stopResetTelegramLinkPoll() {
            if (resetTelegramLinkPollTimer) { clearInterval(resetTelegramLinkPollTimer); resetTelegramLinkPollTimer = null; }
        }

        function goToPasswordResetStep2() {
            stopResetTelegramLinkPoll();
            document.getElementById('prStepLinkTelegram').style.display = 'none';
            document.getElementById('prStep2').style.display = '';
        }

        function skipTelegramLinkGoToStep2() {
            goToPasswordResetStep2();
        }

        function startTelegramLinkFromReset() {
            if (!pendingResetTelegramLinkUrl) return;
            window.open(pendingResetTelegramLinkUrl, '_blank');
            document.getElementById('prLinkTelegramBtn').style.display = 'none';
            document.getElementById('prLinkTelegramWaiting').style.display = 'block';
            stopResetTelegramLinkPoll();
            resetTelegramLinkPollTimer = setInterval(async () => {
                try {
                    const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/telegram/link/status-by-reset-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resetToken: passwordResetToken })
                    });
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data.linked) {
                        stopResetTelegramLinkPoll();
                        showToast('تم ربط حسابك بـ Telegram بنجاح ✅', 'success', { icon: 'fa-telegram' });
                        setTimeout(goToPasswordResetStep2, 900);
                    }
                } catch (e) { /* هنجرب تاني في الدورة الجاية */ }
            }, 3000);
        }

        async function verifyPasswordResetOtp() {
            const username = document.getElementById('prUsernameInput').value.trim();
            const otp = document.getElementById('prOtpInput').value.trim();
            const statusEl = document.getElementById('prStepOtpStatus');
            const btn = document.getElementById('prOtpVerifyBtn');
            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };
            if (!otp || otp.length !== 6) { showStatus('<span style="color:var(--danger);">اكتب الكود المكوّن من 6 أرقام</span>'); return; }
            btn.disabled = true;
            showStatus('جاري التحقق...');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/password-reset/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, otp })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showStatus(`<span style="color:var(--danger);">${escapeHtml(data.error || 'الكود غلط')}</span>`);
                    return;
                }
                passwordResetToken = data.resetToken;
                document.getElementById('prStepOtp').style.display = 'none';
                document.getElementById('prStep2').style.display = '';
            } catch (e) {
                showStatus('<span style="color:var(--danger);">تعذر الاتصال بالسيرفر</span>');
            } finally {
                btn.disabled = false;
            }
        }

        async function confirmPasswordReset() {
            const newPassword = document.getElementById('prNewPasswordInput').value;
            const confirmPassword = document.getElementById('prNewPasswordConfirmInput').value;
            const statusEl = document.getElementById('prStep2Status');
            const btn = document.getElementById('prConfirmBtn');
            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };
            if (!newPassword || newPassword.length < 6) { showStatus('<span style="color:var(--danger);">كلمة السر لازم تكون 6 حروف/أرقام على الأقل</span>'); return; }
            if (newPassword !== confirmPassword) { showStatus('<span style="color:var(--danger);">كلمتا السر مش متطابقتين</span>'); return; }
            if (!passwordResetToken) { showStatus('<span style="color:var(--danger);">انتهت الجلسة — ابدأ من الأول</span>'); return; }
            btn.disabled = true;
            showStatus('جاري الحفظ...');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/password-reset/confirm`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resetToken: passwordResetToken, newPassword })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showStatus(`<span style="color:var(--danger);">${escapeHtml(data.error || 'تعذر تغيير كلمة السر')}</span>`);
                    return;
                }
                showStatus('<span style="color:var(--success);">اتغيّرت كلمة السر بنجاح ✅</span>');
                showToast('اتغيّرت كلمة السر بنجاح — سجّل دخول بيها دلوقتي', 'success');
                setTimeout(() => closeModal('passwordResetModal'), 1400);
            } catch (e) {
                showStatus('<span style="color:var(--danger);">تعذر الاتصال بالسيرفر</span>');
            } finally {
                btn.disabled = false;
            }
        }

        // ====================== ربط حساب Telegram ======================
        let telegramLinkPollTimer = null;

        function stopTelegramLinkPoll() {
            if (telegramLinkPollTimer) { clearInterval(telegramLinkPollTimer); telegramLinkPollTimer = null; }
        }

        async function refreshTelegramLinkUI() {
            const label = document.getElementById('telegramLinkBtnLabel');
            if (!schoolToken) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/telegram/link/status`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (label) label.textContent = data.linked ? 'حساب Telegram مربوط ✅' : 'ربط حساب Telegram';
                return data.linked;
            } catch (e) { return null; }
        }

        async function openTelegramLinkModal() {
            document.getElementById('tgLinkStatus').innerHTML = '';
            document.getElementById('tgLinkStatus').classList.remove('show');
            document.getElementById('tgLinkWaiting').style.display = 'none';
            document.getElementById('tgStartLinkBtn').style.display = '';
            openModal('telegramLinkModal');
            const linked = await refreshTelegramLinkUI();
            document.getElementById('tgLinkedView').style.display = linked ? '' : 'none';
            document.getElementById('tgUnlinkedView').style.display = linked ? 'none' : '';
        }

        function closeTelegramLinkModal() {
            stopTelegramLinkPoll();
            closeModal('telegramLinkModal');
        }

        async function startTelegramLink() {
            const statusEl = document.getElementById('tgLinkStatus');
            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/telegram/link/start`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showStatus(`<span style="color:var(--danger);">${escapeHtml(data.error || 'تعذر بدء الربط')}</span>`);
                    return;
                }
                window.open(data.linkUrl, '_blank');
                document.getElementById('tgStartLinkBtn').style.display = 'none';
                document.getElementById('tgLinkWaiting').style.display = 'block';
                // نتأكد كل 3 ثواني هل الربط اتأكد من تليجرام ولا لسه (الويب هوك
                // بيحصل في خلفية تليجرام، فمفيش طريقة "نستنى" رد فوري من نفس الطلب).
                stopTelegramLinkPoll();
                telegramLinkPollTimer = setInterval(async () => {
                    const linked = await refreshTelegramLinkUI();
                    if (linked) {
                        stopTelegramLinkPoll();
                        document.getElementById('tgLinkWaiting').style.display = 'none';
                        document.getElementById('tgUnlinkedView').style.display = 'none';
                        document.getElementById('tgLinkedView').style.display = '';
                        showToast('تم ربط حسابك بـ Telegram بنجاح', 'success', { icon: 'fa-telegram' });
                    }
                }, 3000);
            } catch (e) {
                showStatus('<span style="color:var(--danger);">تعذر الاتصال بالسيرفر</span>');
            }
        }

        async function unlinkTelegram() {
            if (!confirm('متأكد إنك عايز تفصل ربط Telegram؟ هترجع تستخدم رقم الهاتف لاسترجاع كلمة السر.')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/telegram/unlink`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error();
                document.getElementById('tgLinkedView').style.display = 'none';
                document.getElementById('tgUnlinkedView').style.display = '';
                document.getElementById('tgStartLinkBtn').style.display = '';
                document.getElementById('tgLinkWaiting').style.display = 'none';
                refreshTelegramLinkUI();
                showToast('تم فصل ربط Telegram', 'success');
            } catch (e) {
                showToast('تعذر فصل الربط', 'error');
            }
        }

        // ====================== سجل تسجيل الدخول الشخصي ======================
        const LOGIN_HISTORY_EVENT_LABELS = {
            login: { text: 'تسجيل دخول ناجح', icon: 'fa-circle-check', color: 'var(--success)' },
            blocked: { text: 'محاولة دخول اتمنعت (جلسة تانية شغالة)', icon: 'fa-triangle-exclamation', color: 'var(--warning)' },
            heartbeat_mismatch: { text: 'استخدام من جهاز مختلف بنفس الجلسة', icon: 'fa-triangle-exclamation', color: 'var(--danger)' },
            password_reset: { text: 'تم استرجاع/تغيير كلمة السر', icon: 'fa-key', color: 'var(--accent)' }
        };

        function formatLoginHistoryDate(dateStr) {
            try {
                return new Date(dateStr).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            } catch (e) { return ''; }
        }

        async function openLoginHistoryModal() {
            openModal('loginHistoryModal');
            const list = document.getElementById('loginHistoryList');
            list.innerHTML = Array.from({ length: 4 }).map(() => `
                <div class="skeleton-row"><div class="skeleton-line long"></div><div class="skeleton-line short"></div></div>
            `).join('');
            if (!schoolToken) { list.innerHTML = '<p style="text-align:center;color:var(--text-3);font-size:12px;padding:20px 0;">سجّل دخول الأول</p>'; return; }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/my-login-history`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const events = await res.json();
                if (!events.length) {
                    list.innerHTML = '<p style="text-align:center;color:var(--text-3);font-size:12px;padding:20px 0;">مفيش سجل دخول متسجّل لحد دلوقتي</p>';
                    return;
                }
                list.innerHTML = events.map(ev => {
                    const meta = LOGIN_HISTORY_EVENT_LABELS[ev.event] || { text: ev.event, icon: 'fa-circle-info', color: 'var(--text-3)' };
                    const deviceLine = [ev.deviceType, ev.os, ev.browser].filter(Boolean).join(' · ');
                    return `
                        <div style="display:flex;gap:10px;align-items:flex-start;background:var(--bg-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;">
                            <i class="fas ${meta.icon}" style="color:${meta.color};font-size:14px;margin-top:2px;flex-shrink:0;"></i>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:12.5px;font-weight:700;">${escapeHtml(meta.text)}</div>
                                <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${escapeHtml(deviceLine || 'جهاز غير معروف')} · ${formatLoginHistoryDate(ev.at)}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (e) {
                list.innerHTML = `
                    <div style="text-align:center;padding:20px 0;color:var(--danger);font-size:12px;">
                        تعذر تحميل السجل
                        <br><button class="btn-calc" style="margin-top:10px;width:auto;padding:6px 16px;" onclick="openLoginHistoryModal()"><i class="fas fa-rotate-right"></i> إعادة المحاولة</button>
                    </div>`;
            }
        }

        function schoolLogout() {
            // نبلّغ السيرفر بالخروج الصريح ده الأول (قبل ما نمسح schoolToken محليًا) —
            // ده اللي بيمسح الجلسة الشغالة فورًا من الداتابيز، عشان جهاز تاني يقدر
            // يدخل بنفس الحساب على طول من غير ما يستنى انتهاء نافذة الـ heartbeat.
            // "fire and forget": مش بنستنى الرد ولا بنوقف الخروج المحلي لو فشل الطلب —
            // لو فشل، الجلسة هتنتهي لوحدها بعد كام دقيقة أصلاً (شوف heartbeat تحت).
            if (schoolToken) {
                fetch(`${FIXED_SCHOOL_API_URL}/api/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                }).catch(() => {});
            }
            stopSchoolHeartbeat();
            schoolToken = null;
            schoolUser = null;
            schoolContext = '';
            localStorage.removeItem('sx_school_token');
            localStorage.removeItem('sx_school_user');
            localStorage.removeItem('sx_school_context');
            // مهم: من غير السطرين دول، myPremiumFeatures كانت فاضلة زي ما هي في الميموري
            // وفي localStorage حتى بعد الخروج — يعني hasPremium() كانت لسه بترجع true
            // لأي ميزة كانت مفعّلة قبل الخروج، وأي حد يستخدم نفس الجهاز بعد كده يلاقيها
            // شغالة من غير ما يكون مستحقها هو. بنصفّرها هنا فورًا ونعيد تطبيق القيود
            // على الواجهة (بيقفل الثيم الذهبي، يشيل Cerebras من القايمة، يقفل كل
            // data-premium-feature) في نفس اللحظة.
            myPremiumFeatures = [];
            localStorage.removeItem('sx_premium_features');
            applyPremiumGatesUI();
            currentUserProfile = null;
            applySidebarIdentity();
            refreshRenderedUserAvatars();
            updateSchoolLoginUI();
            showToast('تم تسجيل الخروج من School X', 'success');
        }

        // ====================== نبضة حياة الجلسة (heartbeat) ======================
        // بتبعت كل شوية للسيرفر عشان تقوله "لسه فاتح التطبيق على الجهاز ده" — ده
        // اللي بيمنع جهاز تاني إنه يدخل بنفس الحساب طول ما الجهاز ده شغال فعلاً.
        // لو الجهاز ده قفل التاب من غير تسجيل خروج، الـ heartbeat بيوقف تلقائيًا
        // (مفيش حد بيبعته)، وبعد كام دقيقة السيرفر بيعتبر الجلسة ماتت ويسمح لجهاز
        // تاني يدخل — يعني مفيش قفل دائم للحساب لو حد نسي يعمل logout.
        let schoolHeartbeatInterval = null;
        function startSchoolHeartbeat() {
            if (schoolHeartbeatInterval) return; // شغالة أصلاً
            const sendHeartbeat = () => {
                if (!schoolToken) { stopSchoolHeartbeat(); return; }
                computeDeviceFingerprint().then(deviceFingerprint => {
                    fetch(`${FIXED_SCHOOL_API_URL}/api/heartbeat`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${schoolToken}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceFingerprint })
                    }).catch(() => {}); // فشل مؤقت في الشبكة مش مبرر نوقف كل حاجة
                });
            };
            sendHeartbeat(); // نبعت واحدة فورًا عند فتح التطبيق، مش نستنى أول interval
            schoolHeartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000); // كل دقيقتين
        }
        function stopSchoolHeartbeat() {
            if (schoolHeartbeatInterval) { clearInterval(schoolHeartbeatInterval); schoolHeartbeatInterval = null; }
        }
        // لو الطالب فاتح Chat X أصلاً ومربوط بحساب School X من قبل (توكن محفوظ في
        // localStorage من زيارة سابقة)، لازم نبدأ الـ heartbeat على طول من غير ما
        // ننتظر منه يعمل تسجيل دخول تاني — وإلا هيتعتبر "مش شغال" غلط بعد 5 دقايق.
        if (schoolToken) startSchoolHeartbeat();

        // ====================== تواصل الطلاب مع الأدمن ======================
        // نقطة مهمة جدًا لازم تتحترم في التنفيذ ده: لو الطالب اختار "من غير اسمي"، مبنبعتش
        // أي هيدر Authorization ولا أي معرّف تاني مع الطلب — يعني السيرفر نفسه معندوش وسيلة
        // تقنية يعرف بيها مين بعت الرسالة، مش بس إحنا "بنخفي" الاسم في الواجهة. لو بعتنا
        // التوكن مع الرسالة حتى لو مكتوب عليها "مجهول"، يبقى الوعد للطالب كذب — وده حاجة
        // خطيرة لو استخدم الميزة عشان يبلّغ عن حاجة حساسة على أساس إنه محمي فعلاً.
        async function sendAdminMessage() {
            const textEl = document.getElementById('adminMsgText');
            const statusEl = document.getElementById('adminMsgStatus');
            const text = textEl.value.trim();
            if (!text) {
                statusEl.innerHTML = '<span style="color:var(--danger)">اكتب رسالتك الأول</span>';
                return;
            }
            if (!schoolToken) {
                statusEl.innerHTML = '<span style="color:var(--danger)">لازم تكون مسجل دخول في School X عشان تبعت رسالة</span>';
                return;
            }
            const identity = document.querySelector('input[name="adminMsgIdentity"]:checked')?.value || 'named';
            const isAnonymous = identity === 'anonymous';

            statusEl.innerHTML = '<span style="color:var(--text-3)">جارٍ الإرسال...</span>';
            try {
                const headers = { 'Content-Type': 'application/json' };
                // الشرط ده هو جوهر الأمانة في الميزة: التوكن بيتبعت بس لو الطالب اختار "باسمي"
                if (!isAnonymous) headers['Authorization'] = `Bearer ${schoolToken}`;

                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ text, anonymous: isAnonymous })
                });
                if (!res.ok) throw new Error('failed');
                textEl.value = '';
                statusEl.innerHTML = '<span style="color:var(--success)">تم إرسال رسالتك ✓</span>';
                showToast('اتبعتت رسالتك للأدمن', 'success');
            } catch (e) {
                statusEl.innerHTML = '<span style="color:var(--danger)">تعذر الإرسال — جرب تاني كمان شوية. لو المشكلة استمرت يبقى endpoint الرسايل لسه مش متاح على سيرفر School X.</span>';
            }
        }

        // ====================== كشف مشاركة الحسابات (أدمن فقط) ======================
        async function loadAccountSharingReport() {
            const listEl = document.getElementById('adminSharingList');
            if (!schoolToken || !listEl) return;
            listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحليل...</div>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin/account-sharing?days=14`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const students = data.students || [];
                if (!students.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش حسابات مشبوهة في آخر 14 يوم</div>';
                    return;
                }
                listEl.innerHTML = students.map(s => {
                    const riskColor = s.riskScore >= 10 ? 'var(--danger)' : s.riskScore >= 5 ? 'var(--warning)' : 'var(--text-3)';
                    const devicesHtml = s.deviceList.map(d => `<span style="display:inline-block;background:var(--bg-2);border:1px solid var(--border);border-radius: var(--radius-lg);padding:2px 10px;font-size:10.5px;margin:2px;">${escapeHtml(d)}</span>`).join('');
                    return `
                        <div style="background:var(--bg-glass);border:1px solid var(--border);border-right:3px solid ${riskColor};border-radius: var(--radius-sm);padding:12px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <b style="font-size:13px;">${escapeHtml(s.username)}</b>
                                <span style="font-size:11px;font-weight:700;color:${riskColor};">درجة شك: ${s.riskScore}</span>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:var(--text-2);margin-bottom:8px;">
                                <span>🚫 محاولات اتمنعت: <b>${s.blockedAttempts}</b></span>
                                <span>⚠️ اختلاف بصمة: <b>${s.sessionMismatches}</b></span>
                                <span>📱 أجهزة مختلفة: <b>${s.distinctFingerprints}</b></span>
                                <span>🕐 آخر ظهور: ${new Date(s.lastSeen).toLocaleString('ar-EG')}</span>
                            </div>
                            <div>${devicesHtml}</div>
                        </div>
                    `;
                }).join('');
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">تعذر تحميل التقرير</div>';
            }
        }

        // بيظهر بس للأدمن (schoolUser.type === 'admin') — بيجيب كل الرسايل المتبعتة
        let lastAdminInboxMessages = [];
        async function loadAdminInbox() {
            const listEl = document.getElementById('adminInboxList');
            if (!schoolToken) return;
            listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                lastAdminInboxMessages = data.messages || [];
                const searchInput = document.getElementById('adminInboxSearch');
                renderAdminInboxList(searchInput ? searchInput.value : '');
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل الرسايل — endpoint الرسايل لسه مش متاح على سيرفر School X</div>';
            }
        }

        // بيفلتر الرسايل المحمّلة بالفعل (من غير ما نعيد النداء على السيرفر) بالاسم أو
        // بنص الرسالة نفسه — بيتنادى مباشرة كل ما الأدمن يكتب في مربع البحث.
        function filterAdminInbox(query) {
            renderAdminInboxList(query);
        }

        function renderAdminInboxList(query) {
            const listEl = document.getElementById('adminInboxList');
            if (!listEl) return;
            const q = (query || '').trim().toLowerCase();
            const messages = q
                ? lastAdminInboxMessages.filter(m =>
                    (m.senderName || '').toLowerCase().includes(q) ||
                    (m.text || '').toLowerCase().includes(q))
                : lastAdminInboxMessages;

            if (!lastAdminInboxMessages.length) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش رسايل لسه</div>';
                return;
            }
            if (!messages.length) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش نتايج تطابق البحث</div>';
                return;
            }
            listEl.innerHTML = '';
            messages.slice().reverse().forEach(m => {
                const item = document.createElement('div');
                item.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius: var(--radius-sm);background:var(--bg-glass);';
                const badge = m.senderVerified ? ` ${verifiedBadgeIconHtml(12)}` : '';
                const senderLabel = m.anonymous
                    ? '<span style="color:var(--text-3);"><i class="fas fa-user-secret"></i> طالب مجهول</span>'
                    : `<span style="color:var(--text-1);font-weight:700;"><i class="fas fa-user"></i> ${escapeHtml(m.senderName || 'غير معروف')}${badge}</span>`;
                const date = m.createdAt ? new Date(m.createdAt).toLocaleString('ar-EG') : '';
                const isPremiumRequest = m.requestType === 'premium_feature' && m.requestFeatureKey;
                const featureTitle = isPremiumRequest ? (PREMIUM_LABELS[m.requestFeatureKey]?.title || m.requestFeatureKey) : '';
                let approveHtml = '';
                if (isPremiumRequest) {
                    approveHtml = m.requestHandled
                        ? `<div style="margin-top:8px;font-size:11px;color:var(--success);"><i class="fas fa-circle-check"></i> اتفعّلت الميزة دي بالفعل</div>`
                        : `<button class="btn-calc" style="margin-top:8px;width:100%;background:var(--success);color:#fff;font-size:12px;padding:7px;" onclick="approvePremiumRequest('${m._id}', this)"><i class="fas fa-check"></i> وافق وفعّل "${escapeHtml(featureTitle)}"</button>`;
                }
                item.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11.5px;gap:8px;">
                        ${senderLabel}
                        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                            <span style="color:var(--text-3);">${date}</span>
                            <button aria-label="حذف الرسالة" title="حذف الرسالة" onclick="deleteAdminMessage('${m._id}')" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:13px;padding:2px 4px;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(m.text || '')}</div>
                    ${approveHtml}
                `;
                listEl.appendChild(item);
            });
        }

        // ====================== سجل عمليات الأدمن (Audit Log) ======================
        // بيعرض للأدمن آخر الإجراءات الحساسة اللي اتعملت في الموقع (حذف رسايل، تفعيل
        // Premium، تفعيل/إلغاء توثيق) — للشفافية والمراجعة، مش قابل للتعديل من الواجهة.
        const AUDIT_ACTION_LABELS = {
            delete_admin_message: { icon: '🗑️', label: 'حذف رسالة طالب' },
            delete_all_admin_messages: { icon: '🗑️', label: 'حذف كل رسايل الطلاب' },
            update_premium_features: { icon: '👑', label: 'تعديل مميزات Premium' },
            toggle_student_verification: { icon: '✅', label: 'تعديل حالة التوثيق' },
            approve_premium_request: { icon: '🎉', label: 'الموافقة على طلب تفعيل Premium' }
        };
        async function loadAdminAuditLog() {
            const listEl = document.getElementById('adminAuditLogList');
            if (!schoolToken || !listEl) return;
            listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-audit-log`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const logs = data.logs || [];
                if (!logs.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش عمليات مسجّلة لسه</div>';
                    return;
                }
                listEl.innerHTML = logs.map(l => {
                    const meta = AUDIT_ACTION_LABELS[l.action] || { icon: '📌', label: l.action };
                    const date = l.createdAt ? new Date(l.createdAt).toLocaleString('ar-EG') : '';
                    let detailsLine = '';
                    if (l.details) {
                        if (l.details.studentUsername) detailsLine = `الطالب: @${escapeHtml(l.details.studentUsername)}`;
                        else if (l.details.senderName) detailsLine = `المرسل: ${escapeHtml(l.details.senderName)}`;
                        else if (typeof l.details.deletedCount === 'number') detailsLine = `عدد الرسايل: ${l.details.deletedCount}`;
                        if (l.details.featureKey) {
                            const featureTitle = PREMIUM_LABELS[l.details.featureKey]?.title || l.details.featureKey;
                            detailsLine += (detailsLine ? ' · ' : '') + `الميزة: ${escapeHtml(featureTitle)}`;
                        }
                    }
                    return `
                        <div style="padding:8px 10px;border:1px solid var(--border);border-radius: var(--radius-xs);background:var(--bg-glass);font-size:11.5px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                                <span style="font-weight:700;">${meta.icon} ${meta.label}</span>
                                <span style="color:var(--text-3);">${date}</span>
                            </div>
                            <div style="color:var(--text-2);margin-top:3px;">بواسطة: ${escapeHtml(l.adminUsername || 'غير معروف')}${detailsLine ? ' · ' + detailsLine : ''}</div>
                        </div>`;
                }).join('');
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل السجل — endpoint سجل العمليات لسه مش متاح على سيرفر School X</div>';
            }
        }

        // بيحذف رسالة واحدة بعينها من رسايل الطلاب (بعد تأكيد من الأدمن) وبيحدّث القايمة
        async function deleteAdminMessage(id) {
            if (!schoolToken || !id) return;
            if (!confirm('تحذف الرسالة دي نهائيًا؟')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                showToast('اتحذفت الرسالة', 'success');
                loadAdminInbox();
            } catch (e) {
                showToast('تعذر حذف الرسالة، جرب تاني', 'error');
            }
        }

        // بيوافق على طلب تفعيل ميزة Premium مباشرة من صندوق الرسايل — بيفعّل الميزة
        // للطالب فورًا على السيرفر من غير ما الأدمن يحتاج يفتح لوحة تحكم Premium
        // المنفصلة ويدوّر على الطالب بنفسه.
        async function approvePremiumRequest(messageId, btnEl) {
            if (!schoolToken || !messageId) return;
            if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = 'جارٍ التفعيل...'; }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages/${messageId}/approve-premium`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'failed');
                showToast(`اتفعّلت الميزة لـ ${data.student?.username || 'الطالب'} ✓`, 'success');
                loadAdminInbox();
            } catch (e) {
                showToast(e.message === 'failed' ? 'تعذر تفعيل الميزة، جرب تاني' : e.message, 'error');
                if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-check"></i> إعادة المحاولة'; }
            }
        }

        // بيحذف كل رسايل الطلاب دفعة واحدة — لازم الأدمن يكتب "تأكيد" حرفيًا الأول عشان
        // نتجنب حذف كل الرسايل بالغلط بدوسة واحدة (الإجراء ده نهائي ومينفعش يترجع فيه).
        async function deleteAllAdminMessages() {
            if (!schoolToken) return;
            const typed = prompt('الإجراء ده هيحذف كل رسايل الطلاب نهائيًا ومينفعش يترجع فيه.\nاكتب "تأكيد" عشان تكمل:');
            if (typed === null) return;
            if (typed.trim() !== 'تأكيد') {
                showToast('اتلغى الحذف — لازم تكتب "تأكيد" بالظبط', 'error');
                return;
            }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/admin-messages`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                showToast('اتحذفت كل الرسايل', 'success');
                loadAdminInbox();
            } catch (e) {
                showToast('تعذر حذف الرسايل، جرب تاني', 'error');
            }
        }

        // ====================== مراجعة ملخصات المكتبة المشتركة (أدمن فقط) ======================
        // ملخص تقييمات الردود لكل موديل — للأدمن بس. بيوري كل موديل (👍/👎/الإجمالي/نسبة
        // الرضا)، وتحته آخر 15 تقييم سلبي كأمثلة حقيقية سريعة من غير ما يفتح كل رسالة لوحدها.
        const RATING_MODEL_NAMES = {
            groq: 'Groq', gemini: 'Gemini', 'german-teacher': 'معلم الألماني', openrouter: 'OpenRouter',
            cerebras: 'Cerebras', 'claude-opus': 'Claude', mistral: 'Mistral', sambanova: 'SambaNova',
            qwen: 'Qwen', onehop: 'DeepSeek/OpenRouter', zimage: 'تحليل الصور', local: 'محلي', unknown: 'غير معروف'
        };
        async function loadAdminRatingsSummary() {
            const summaryEl = document.getElementById('adminRatingsSummary');
            const negativeEl = document.getElementById('adminRatingsNegative');
            if (!summaryEl || !negativeEl || !schoolToken) return;
            summaryEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            negativeEl.innerHTML = '';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/message-ratings/summary`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();

                if (!data.summary.length) {
                    summaryEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش تقييمات لسه</div>';
                } else {
                    summaryEl.innerHTML = data.summary.map(s => {
                        const name = RATING_MODEL_NAMES[s.model] || s.model;
                        const rateColor = s.approvalRate === null ? 'var(--text-3)' : (s.approvalRate >= 70 ? 'var(--success)' : s.approvalRate >= 40 ? 'var(--warning)' : 'var(--danger)');
                        return `
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg-2);border-radius: var(--radius-sm);padding:9px 12px;">
                                <div style="font-size:12.5px;font-weight:700;">${escapeHtml(name)}</div>
                                <div style="display:flex;align-items:center;gap:10px;font-size:11.5px;color:var(--text-2);">
                                    <span><i class="fas fa-thumbs-up" style="color:var(--success);"></i> ${s.up}</span>
                                    <span><i class="fas fa-thumbs-down" style="color:var(--danger);"></i> ${s.down}</span>
                                    <span style="font-weight:700;color:${rateColor};">${s.approvalRate === null ? '—' : s.approvalRate + '%'}</span>
                                </div>
                            </div>`;
                    }).join('');
                }

                if (!data.recentNegative.length) {
                    negativeEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش تقييمات سلبية 👍</div>';
                } else {
                    negativeEl.innerHTML = data.recentNegative.map(r => `
                        <div style="padding:9px 12px;border:1px solid var(--border);border-radius: var(--radius-sm);background:var(--bg-glass);">
                            <div style="font-size:11px;color:var(--text-3);margin-bottom:4px;">
                                ${escapeHtml(RATING_MODEL_NAMES[r.model] || r.model)} · ${escapeHtml(r.studentCode)} · ${new Date(r.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                            <div style="font-size:12px;line-height:1.6;">${escapeHtml(r.excerpt) || '<span style="color:var(--text-3);">(بدون نص)</span>'}</div>
                        </div>`).join('');
                }
            } catch (e) {
                summaryEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل التقييمات</div>';
            }
        }

        // ====================== شارة التوثيق (الصح الزرقاء) + الصورة الشخصية ======================
        // نفس فكرة العلامة الزرقاء في فيسبوك/إنستجرام/تويتر — دايرة الصورة (أو حرف
        // أول الاسم لو مفيش صورة) وشارة صغيرة فوق طرفها لو الحساب موثّق. مستخدمة في
        // البروفايل الأكاديمي وأعلى صفحة الإعدادات وقائمة الحسابات الموثقة.
        // شارة التوثيق الرسمية (أيقونة الشارة الزرقاء) — Data URI عشان تشتغل أوفلاين
        // ومتوافقة مع الـ CSP من غير أي طلب شبكة إضافي.
        const VERIFIED_BADGE_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAWN0lEQVR42u1de5RdVXn/fXufc+6de28mL/KmxBDkMUFiYUlR2yasLlCihhackcSIAZVQHrIsKEWKM4MCFbXLqCRAeQVCbGfAlvBul5KsoksWVR41I6TENCrkMQQyj/s65+zv6x/n3Jk7SWYymfuYe4fzy9rrJrkz++yzv8f+vm9/+9tAhAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAh1ARGCCNVt/xHGhuYO0UMI0yoKHaLL9oAO0WgVVcwIzeXsP8KYRZKCFqDpOUmd9qwkh3xfCqE6RBf3f9qzkmx6TlLDPb8eUb+DFyEQCQCc9KysFo3Pi4+TiGCgsY0Y975+LnUOEHIbBO3Eo+q7VRQWgdBCBgBO+qk0i+ALMFgkDEU2tpPBhtc/Rg8cPJaIAaol+QJq6oTlTcJGqxHN4gLiBW9EdvDJLrYaH207zqMtANAsojsBHpZYIrSkDXprO/kAcMJ/yBIFtKkYlkIAccNJswFyAL8XnXYfVnUBBi1goP6YoD4ZoEM0Wsic8IT5rj1dXeu9wy4ATQIVsgcTFFQDtBiAGT+GwbfeWEZdALDkObG2ng0zSDAhPAeNswPCn/iMnCyEm4iwkiyAszACRnH/AIw9TTleN3/vjeX6usKYIgaoBvGbwSc8jVNI8StgBTBrENFhJNpAoNQkRZJHhhnrOIPv/O5C2je4xgMFwp3Q0TuDJiWvBeEqFVdJ7mdBoDH0YfoWKGVIMUxefXDH+ehCB1S9MYFVn5YLCTab2yilLE6zAVEgk4f+nAYA08eGlEroJK6D8KoTnvK/Dej1byyjPAA0dYjjpcwaIX29asA8Tge/A5AGQQ/TN8EwUVxp5Pk2QC8H6s8MoLqT/hYyC5+Qs7WDn3GeDYDRWfkCEcAoS1mqAeA8XuUcbiLyGY76po6rD3IOYI99ghxeoxweRsWURtb/q+3n2z+rt6WgvhhAAl984WbzS9WgP8Q5Ywikj7IPEYBVXA9KtgY4awwB6igIX+Aro+Jac5Zf3LFcnRVqB44YoPzE1yAyCx7zV1lJ/ZDpN4aIdAn9MQq0FgGI1Ni7EqNTWksan3vjfNpYGGvEAOX0+dtAZ5yB+AE228im+eKxAKTG9goSvroUTYNg7H0Jk61IfNmV7NGnvroDWbRB6iE2MH4M0NGhl8xopq3dR7acmgDd1ULugp+4N+hG+1bu9Q1Kkf7KMKnRjZb2e72v77zAua2pQ5wu4IhaYMkM0NbuTkFLi3nvMECrqFFH5UIc/6jMhDavQ1EjfCaAqNbUFCwlEOmFr08acDUrOCd1rQHmP+qepbVeLswLIFDDqmAiAsSA6UQV06dL3hcoojFr7IrQPhwLi1DMIs6bX0PJdoA0RGTYXyAwKbXTGLN514XOLye4BgjCtwDo+Ef9HyBmXaEcQEbJ8+IDkvfkaK30cVAEQjGbaJQRFlIAuwBcf/3vpj3/ZSxdyiBItcLKVMWJUSDi93Xk11nTnb8173pGBEKjGgMJIKoUS73KTMAA8Wh2CgUQIiI91dL+fnf9/7XErijM1cRhgDA4sqAjfSZiiRfE9f3QVYqSK0KtASJDjmUh65258yLnRXR06GoYhtUJBc8IGI3FulDbEM4ZECmCSET8gopjA2VbYnLyaQAvYkZzVYSjOgwQunoEOg4GRBJJ/qGqWAEGRKDjiudsYjBAQdMxlAgiwT/8MkAiwRxV87FV3g3kIjcowqGuYfEcTUAGkML7Meo5Ga1yk8PVFw2r2gpAIvk/soBMWAYQCTkgYoFamRurygogCOlE9D+s+ItUXQFUfwmI1oAR9L9M5CWgVRSQI4kYYEQNAICGnEKqMCr/IBHCblhoJ4YgH/yXRO0wLWSEPNqJsRtWNc4hVpYBOkSDSHAN5Wffk5kPpU8R19TSRm4tgcQ1AtJNsx7MLsA1lAeRoMJnEKlihG9RBhBMe+jtxgSnrhFSXyGlp4qbEyhF0TJwGEowC8XiJMwHwP7afs59v+eSqQcG57T8eYblZYBWUWhDmBUrdOwD7mpRdKOK2wsl60J8LyB+hBEMZRZom1TCAee9nWTMrX988vH70dliBmyDMmYOlYkYQsWnYubckz1XWVYbxawPi8cQL+cD0DTBt38PXtvGnGYaGASG7LhFjgLn/ReY/bY9lzQ8M6gNynMWkcpC/HAg8+7tXyzK/gZZ9gUgguTSwakd1EkiR4nQBBgBfAYcXY64jjBEhOJJDRGIn39MXHPz7jWpXx889+PEAEIQ4Iy7Yb2lM7eRZV+lbDvG2TQHufbqPUH4AvF7XUHSJjQ6wN4MYKmQEUqVU2EGEVRDUrHnesT+D2Z7iRt+dRn8gIJjZ4LSGCBck+bMS3eoKckLuScjwWDVe6p6hqWA/TnB8gUWvn6mjblJwgt7GF973sXejJSHCYK1wYCg9OQkmQPZR3e/2dBSqk0wdgYIrdJZd/evtiYl7+e+tAvArr107coTvzsr+MyJFu47J4ZiE/fZXQYXPZVD0iZw2bweEQCempR0TH969Z4vpTaU4iGMXUVvC7N8BF8UDwwRHTBUIdQ3cZsgCNxYStCdYXzmRI17z4mBQhuAJfg8a7bCrATBNRIk+palgSCixQOD5UvFtBgTA485ukfEM34kKUj/QnFdJcG8vKckf19acNFJFu49Jx5IvgwagpqAPRnBgZxAA+DyxvgVXJcAHD/rQUnuvZjSYy1TU5KRZtngQBwI7zXid2dC4p87SHyiQEGrkAlu+rmLjCfQ5V4UJXQAGKKypc382DQAkaBV1O41lJm5rvc1ZdmzxcsxRntWv45hFyT/ZPuwxEf4+cVnc3h8h4dpcYLPZZYOEYZlK/Zzr+1bQxm0jv0cwdh3AxcFBqSA1wM4+72gAYqJf9/Hhif+F57NYdNvPcxIEPxKbO+Gu4YifGcxLcbHDWyHzPxR739RQ+qjkk2Xdma/RqN7A8TPCFacYuO+jw9P/EufCYg/M0HwuGzRtuIooaF4Sku2/xf7rpr052gDleIGlpYPsAgEEAtlvka+93xgoE48VTBg8B2J+E9nByTfM3IIE5UHBBhXRPC1cLewJDuutEhdCxl0iO6+MvELzuc7qSGlwWwmktdnEdAdqv37z2s4lPgYJP7DXR5mNBB8U6HxMBtqSGnOZzu7v9z483LsEJYeqt0GgQhByY2cy2ZFWSQSbGeUfQ7kCP8u87OKJf/+ZQ1hkcChxGcAlzwVEH9mguCZCr23iIiyiHPZLBTdCBEqxf8vHwO0E6MTqvuqKW+Il7uD4kkFETMgGmWcBQrdDF3sbpSdC4LcrMDgY6woJj4OknwAlz6VwaYuFzMbCmq/AuMJw8AUTyrx3Du6r5ryBjpRloIS5THYmkBYuoUsx/1vZdxLSDspsC/lCgtLyKkeAz15Qd4X5HxBXA9+T2V6TrHBt7LJxv2fSAxL/NVPZrCpq3IGX9HIGNpRks9253X/CvfMSXl0bwG2bq0BDQAA7e0MbFG91055R4zcDKeBhMNloAxNAcj5wJQY4Za/jOPBTyXwhcUO0l5Y4AvleQ4EsClQ+ytOGZ74DGD1Exls2uaFkj8osVKJxiJwGojFfLPv6mP3A0tVMOdlMSnLxqWEVlATYO2b3PMyxZKniJsOqm2WOEBGEFp9+jNJnD57sLv7XnFx1bNZJB0aQqCS/PwMY8UiBw98cgTJfyKDh7e5mJVQA5JfQUfUkJPUkk+/NrNn8uIuwEd7+SqIlHG/ngSLQF3t5ELMdSKGRYRKzZQlCPryjLOP0zh9tobLQcKFz8Clix2s+3gD+vIM5uBnx/ociwR70owVTUcg/uMZPPybYM13TVWyhUnEMISu7WonN3S9y+ZZVuhcgFW+uxSoYFfRAMdaIXV8Blaf5gACXP5MBimboAhHvfVqK2BvWrBykYMHPhUQXxDE9IcQf3Mg+QVrvzqo7J0UqqxLwDYIWsUxwt8VkCpHVMgwkLIJP9vp4eW9BpbCQHi18PfVix2s/3gC/XkBF9kER9xPCV29vWnGykUONiwflHx10Jr/+c1pbPxNHjMSBNdUce9LRASkDPP30CFO4PqVjyPKxwCtWzTaiac17L9MNUw5RbJ9RgAtLCi1KRLkPEHzI/147e3DM8Elix2sX5YIloNw6RipT7DAVoK9/UOJL4dT+4+lsfF/Qsn3C4f4Sn+vUTVAS7bPqMSUk6ftevcytBOjdYsuo34pB/FbFdCGxsaeKVqoi5SeCeNJORlME9DvCuZOUnjyohROOkbD56HLgaWAB15xsebJNFLOyMtBQe1/9lQHG/46Oaza/3xI/FlJqoLBNywY2iZhv9t3qakv/0/vDnpftaABFrUR2omV699A8cZZ4rlGZLAcTDmab4CUQ3izl/GJHw+vCVYvdnDnsiT68gLDh3cRLQL29gtWHoH4F/97GhtfDSTfNRVy8UbXlHiuofjkmVqbv0d7O2NRG9WGBggOg0jjbT0Lta1eBTgGY6hSJeAsBfTlBfMmKTyxchJOHkYT3P9yHmueOFQTFLZ0V37AwYN/kxqB+P14+FUXM8dX8ofYAtBaAJ03ypzW+3eTd5S6E1geDbAIBCJR8G8hJ9kgfhgBrFCQ3itogj7GJzb1DW8TfDCGuz6ZDAzDUBNYBOwLJX9E4v9bPx5+xR00+GphYwpE4vtCTqJBuf4toMDtHl8NEO5GTf3Hno+Itp6H7zJQ+QsVJZTkPjfQBE9+dgRN8FIelz2exuQ4YX9GsOIDDh66YBTErxXJP5RkBpajyM39xbs3Ti95R7A0DRDuBDJ7t5OyCFKdhZJE4BnBJBuBTbBxBE3wpzHcszyJ/X2MFac6eGgkyf9JPx5+OY8ZCQQbO1KLzYCURQy+vRw7giWfC5j8rf3N1NDYIbme6tfwF8DSoU3QqPHUqkM1QSFD9z93ePjocRYSYY5+wS4oXBXxuUf7sOlVF8ckwyBPLZ9uEDEUn6wl29vS8w/TO8f1XIAAlwcxSwyWgKtWA+D7wCSH8GaPwbKHDtUEOiT0OQttJGwaIvmDxO/HppddHJMgeD4wLu9yNE0KASJcXkyLKmqA4FDinFZJpK13/pcsey78fFjKncZBIASWJvTnBfMaFZ76XCNOnnGoJlA0NErIAC5+pA+bXsljelLB40KNlpoW//CFYyS++1bSz79/d/u8zFgPilpjHQMI8LFPQbQaSP8Z+LL68Iwg5QB/7DE478EePH3x5CFMoIvuhxpC/JfzmJ48OIevxvMaBxNXFKfmUjFNqrMEhOcCuttn9QOyg3SMIeDxdJModBGD5YBx3oZevNYdLAdeWKDScJHB19mHTS/lMT0xdD+/ThqTjjGAHXu/SunwXMCYuHbsNsDAuQB9t+iYEsAM5AIObGVW10AO4gSClEOBJtjQg992G9jh3WI6vJhmVWcvNr2Uw7RE8ZYuargVj1FEACM6poT5n4tpUf04QBgFnNTW/a/UOKNZ+roluI9v/I+HD0QMJyus/WQKHznOwZu9Bm0/TeOxbS6mJsPs3XqCcHDRQmoGSV93Zx/uuAhoG6fj4QVjUACs+ZWVmnv8raStq2HFYpLtYUBA41ggQkKJz3mAL4LZKYWenCDtCibHB0/s1MNZdpEglkkNjQpezhPmtf1v/e7ruOuMcS4QUeQRAEDi5ncWk6hvkLIuICKI228AIhCpIXc0VpELCuf1XRZYRNAqtAVqlfJD7rIUBkTISQUFZ3zvMSPezZn2mbVSIqaonw4ZKBKVaH37XEW6jeyGD4ufB/ygSNR43hFEqKMDzGGRKFgxi+wGiJt5QQm39bZPLyoSRVyOVyp/mTggXJOEEm0HVpPgRnKSCyXfB7AnoKhM3BHWeYGyiWKNELdvJxm5tf/1n9Z6mbiD0CwanUGhSLRub0zJMdcI8BWQngo/GzHBSMS3GwgsByBmrdXb+/2etQsODM5prReKPBhFMer4jW/N1yr2KJR1Orys1M0dgFW09ALi+y/57H46f8ucnQfPYSVQWSK0kAGEcPX2WO6WubvEuL+FjlGhNnLUhjSBjpEYtyt/y5yduHp7DBCqJPHHHgo+OiUj2CM+WkXB3RsDS1QufjjrnwUQiqFVFLrgV+P62Oqp4XZiYYS1pKI/w/5hSDVvEbeqzunRrWEjaIDqP1aNx3tGqJ25qe6lUcyg6OrQ4byAwBLkCXxx5ACbR/SvmXmxqv2S0aVRR2AAmcgMwDJY0iXCYRhAAJ7AF0cKiCm6OXS4yZHwGDxPPAZoCrOHBL8HVPCqkRt4qBEYHKfcVTxnE8MN7OoUALAUHoGXI0ABPE6p5LWY4s1hJSQvR5aPR4vnrNKonhy2ikI7sX3NH+6g1JwrJL3XhPveoxgDCSCqbjaQRBgItsRHtzISUWKmlvRb67y1868szNXEYoCwiBS6QPbcvWuh7SthxwHhIxtHBMC4gJep/a1kYYGdIGhndKnapAA/Bxh3nffm7C+jCVLOIlA1xAAHGR/X/OHPSMWXi/EWjHiglEBgGJCcSDp+ek3nEwgLrDiJyf8aQtuhoEc+ZECGtN4pzJv9tXNeGI8hj89EjkXFXf7GTMtJvA5SjWCPau9uIhEoWyDS67s4CXfO2VfxOam7OEAB7cRhepNC1yiiAk3QaKd9uHLX7WiYfiuy71T/IOpo1v1YSiO7/3bcOX8frt4ew573+6PykLo6Be1k3jsaYKz2A96K67d5G3R8Pvxc7WQViTCsOMHkd5kefSoWzs5Wcx2vfTewdD4NqmG0z8sI4yZohwZCikdTvqP4CBEzQyRozHzI96PtrxDC0w4JyU3YOCdd7mKOkQYoXicBqL2//yXFUh+CN4ZStEEyGsNOaYRFzUEa8PoNQOroU9fFwE5qyfe/yLOOO2tgiasT1FdiZldQFIlZXS8cXFNwNAWXhcUX5ZDEpmox5lV47vnw3E8Jm5clNlWLckhY/KMrdE0QFjCp69FOjK76Eqr6C8iG6dG0ZudjFJu6HPlRVCYRMVBKw5kMuP17oOTbrNLr8cMT80Gfv3HUMVPXgNT1sJPz4PYCbEbXb2yyltyBzXL3+86vVOr2xPMCSkInACHBrhvgZpaBNCBmmLsJxECgEJus4ecyyKfXCTLfwR0n7BtgJgDoJJeBH+KS7f9CItcC6io4qSTyPQICH36ZEQFpgZf1hZwbgqhfZ93NZn1uyRS0wBd3fgepOdchs88Ng0kKQkEVKQCwUxrsASI/FpFv4a65XQCAJc9Z2LrUDBpqQliyRWPr2YHbdtmbJxOpm6BoJZQd2gdDlkwGyCAx00H/7u/KPQu+Wo/SX78MACE0dypMbVaEP2xEfFoL/BzAXvC1jgWffn6rwG/DXX+yZZBxwMNb6Acxwpd+v4S01QYdXwoAMPlg4dcOYMWB3LsdgmNX4d1ORmcz14vlPwEYICRWYcLX/HE1oC4G+++HgKHtbYDch7vmPhIQvkOjqXn06dZBXj4NSPRlu5tBdCnYPRWAgrJeh/AG3H3shkPGEqHaTFC047ZqdxJfkYYh/N3cMfaIYXOHPqT/K/amhn1+hHG0CaSIEK2iBgy8cvXfWnRBowiVtf8IFdIIddd/hAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAhlxP8D+w0x2wetFoQAAAAASUVORK5CYII=';

        function renderVerifiedAvatar(name, avatarUrl, isVerified, size) {
            size = size || 56;
            const initial = (name || '?').trim().charAt(0) || '?';
            const badgeSize = Math.max(16, Math.round(size * 0.4));
            const inner = avatarUrl
                ? `<img src="${escapeHtml(avatarUrl)}" alt="الصورة الشخصية" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:${Math.round(size * 0.4)}px;">${escapeHtml(initial)}</div>`;
            const badge = isVerified ? `
                <div style="position:absolute;bottom:-1px;inset-inline-end:-1px;width:${badgeSize}px;height:${badgeSize}px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35));">
                    <img src="${VERIFIED_BADGE_ICON}" alt="حساب موثّق" style="width:100%;height:100%;object-fit:contain;display:block;">
                </div>` : '';
            return `<div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0;">${inner}${badge}</div>`;
        }

        // أيقونة صغيرة جاهزة للاستخدام جنب العناوين/الأزرار بدل fa-circle-check
        function verifiedBadgeIconHtml(size) {
            size = size || 16;
            return `<img src="${VERIFIED_BADGE_ICON}" alt="موثّق" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:-3px;">`;
        }

        // بيتحمّل أول ما صفحة الإعدادات تتفتح — بيعرض صورة/اسم/شارة توثيق الحساب
        // المسجّل دخوله دلوقتي (أدمن أو طالب)، وزرار رفع صورة لو الحساب موثّق.
        async function loadSettingsProfileBadge() {
            const area = document.getElementById('settingsProfileBadgeArea');
            if (!area) return;
            if (!schoolToken) {
                area.innerHTML = 'سجّل دخولك بحساب School X (من تحت) عشان تشوف صورتك وحالة التوثيق.';
                return;
            }
            area.innerHTML = 'جارٍ التحميل...';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/me`, { headers: { 'Authorization': `Bearer ${schoolToken}` } });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const p = data.profile || {};
                const isVerified = !!p.isVerified;
                area.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        ${renderVerifiedAvatar(p.fullName, p.avatarUrl, isVerified, 56)}
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:14px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(p.fullName || p.username || '')}</div>
                            <div style="font-size:11px;color:var(--text-3);margin-top:2px;display:flex;align-items:center;gap:4px;">${data.type === 'admin' ? 'حساب أدمن' : 'طالب'} · @${escapeHtml(p.username || '')}${isVerified ? verifiedBadgeIconHtml(12) : ''}</div>
                        </div>
                    </div>
                    ${isVerified ? `
                        <div style="margin-top:10px;">
                            <input type="file" id="avatarUploadInput" accept="image/*" hidden onchange="uploadProfileAvatar(event)">
                            <button class="btn-calc" style="width:100%;" onclick="document.getElementById('avatarUploadInput').click()"><i class="fas fa-camera"></i> ${p.avatarUrl ? 'تغيير الصورة الشخصية' : 'إضافة صورة شخصية'}</button>
                            <div id="avatarUploadStatus" style="margin-top:6px;font-size:11px;"></div>
                        </div>
                    ` : `<div style="margin-top:8px;font-size:10.5px;color:var(--text-3);line-height:1.7;">التوثيق مش مفعّل لحسابك — لازم الأدمن يفعّله الأول عشان تقدر تضيف صورة شخصية.</div>`}
                    <button class="btn-calc" style="width:100%;margin-top:8px;background:var(--bg-2);color:var(--text-2);display:flex;align-items:center;justify-content:center;gap:7px;" onclick="openVerifiedAccountsModal()">${verifiedBadgeIconHtml(16)} عرض الحسابات الموثقة</button>
                `;
            } catch (e) {
                area.innerHTML = '<span style="color:var(--danger);">تعذر تحميل بيانات حسابك.</span>';
            }
        }

        async function uploadProfileAvatar(event) {
            const file = event.target.files[0];
            if (!file) return;
            const status = document.getElementById('avatarUploadStatus');
            if (status) { status.textContent = 'جارٍ الرفع...'; status.style.color = 'var(--text-3)'; }
            try {
                const form = new FormData();
                form.append('avatar', file);
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/profile/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` },
                    body: form
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'فشل الرفع');
                loadSettingsProfileBadge();
                fetchSchoolProfile(true); // يحدّث currentUserProfile فورًا عشان الصورة تظهر جنب اسمه وفي رسايله على طول
                showToast('اتحفظت الصورة الشخصية ✓', 'success');
            } catch (e) {
                if (status) { status.textContent = e.message; status.style.color = 'var(--danger)'; }
                else showToast(e.message, 'error');
            }
        }

        // كاش بسيط لقائمة الحسابات الموثقة عشان البحث الفوري يشتغل من غير طلب جديد للسيرفر
        let _verifiedAccountsCache = [];

        async function openVerifiedAccountsModal() {
            openModal('verifiedAccountsModal');
            const el = document.getElementById('verifiedAccountsContent');
            if (!schoolToken) {
                el.innerHTML = `
                    <div style="text-align:center;padding:34px 16px;color:var(--text-3);">
                        <img src="${VERIFIED_BADGE_ICON}" alt="" style="width:40px;height:40px;opacity:0.35;margin-bottom:10px;">
                        <div style="font-size:12.5px;">لازم تسجّل دخول بحساب School X الأول عشان تشوف الحسابات الموثقة.</div>
                    </div>`;
                return;
            }
            el.innerHTML = `
                <div style="text-align:center;padding:30px 10px;color:var(--text-3);font-size:12px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:18px;margin-bottom:8px;display:block;"></i>
                    جارٍ التحميل...
                </div>`;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/verified-accounts`, { headers: { 'Authorization': `Bearer ${schoolToken}` } });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                _verifiedAccountsCache = data.accounts || [];
                renderVerifiedAccountsList(_verifiedAccountsCache, '');
            } catch (e) {
                el.innerHTML = `
                    <div style="text-align:center;padding:30px 10px;color:var(--danger);">
                        <i class="fas fa-triangle-exclamation" style="font-size:18px;margin-bottom:8px;display:block;"></i>
                        <div style="font-size:12.5px;">تعذر تحميل القائمة، حاول تاني.</div>
                    </div>`;
            }
        }

        // كارت مفرد لحساب موثّق — دايرة صورة + شارة زرقاء + اسم + يوزر نيم + تصنيف
        function renderVerifiedAccountCard(a) {
            const roleLabel = a.type === 'admin' ? 'أدمن' : 'طالب';
            const roleColor = a.type === 'admin' ? 'var(--accent-3)' : 'var(--accent)';
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius: var(--radius-md);transition: background var(--transition-base);" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
                    ${renderVerifiedAvatar(a.fullName, a.avatarUrl, true, 44)}
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:4px;">
                            <div style="font-size:13.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.fullName || a.username)}</div>
                        </div>
                        <div style="font-size:10.5px;color:var(--text-3);margin-top:1px;display:flex;align-items:center;gap:4px;">@${escapeHtml(a.username)}${verifiedBadgeIconHtml(11)}</div>
                    </div>
                    <div style="font-size:10px;font-weight:700;color:${roleColor};background:color-mix(in srgb, ${roleColor} 14%, transparent);padding:4px 9px;border-radius: var(--radius-lg);flex-shrink:0;">${roleLabel}</div>
                </div>`;
        }

        // بيعرض القائمة مقسّمة (أدمنز ثم طلاب) مع دعم فلترة بالاسم/اليوزر نيم
        function renderVerifiedAccountsList(accounts, query) {
            const el = document.getElementById('verifiedAccountsContent');
            if (!el) return;
            const q = (query || '').trim().toLowerCase();
            const filtered = q
                ? accounts.filter(a => (a.fullName || '').toLowerCase().includes(q) || (a.username || '').toLowerCase().includes(q))
                : accounts;

            const searchBar = `
                <div style="position:relative;margin-bottom:12px;">
                    <i class="fas fa-search" style="position:absolute;inset-inline-start:12px;top:50%;transform:translateY(-50%);color:var(--text-3);font-size:12px;"></i>
                    <input type="text" id="verifiedAccountsSearch" class="tool-input" placeholder="دوّر بالاسم أو اليوزر نيم..." value="${escapeHtml(query || '')}"
                        style="padding-inline-start:34px;"
                        oninput="renderVerifiedAccountsList(_verifiedAccountsCache, this.value)">
                </div>`;

            if (!accounts.length) {
                el.innerHTML = searchBar + `
                    <div style="text-align:center;padding:26px 10px;color:var(--text-3);">
                        <img src="${VERIFIED_BADGE_ICON}" alt="" style="width:40px;height:40px;opacity:0.35;margin-bottom:10px;">
                        <div style="font-size:12.5px;">مفيش حسابات موثقة لسه.</div>
                    </div>`;
                return;
            }

            if (!filtered.length) {
                el.innerHTML = searchBar + `
                    <div style="text-align:center;padding:22px 10px;color:var(--text-3);font-size:12px;">مفيش نتائج مطابقة لـ «${escapeHtml(query)}».</div>`;
                return;
            }

            const admins = filtered.filter(a => a.type === 'admin');
            const students = filtered.filter(a => a.type !== 'admin');

            const sectionHtml = (title, list) => {
                if (!list.length) return '';
                return `
                    <div style="font-size:10.5px;font-weight:700;color:var(--text-3);margin:14px 4px 4px;text-transform:uppercase;letter-spacing:0.3px;">${title} · ${list.length}</div>
                    <div>${list.map(renderVerifiedAccountCard).join('')}</div>`;
            };

            el.innerHTML = searchBar +
                `<div style="font-size:11px;color:var(--text-3);margin-bottom:2px;">إجمالي الحسابات الموثقة: ${accounts.length}</div>` +
                sectionHtml('الأدمنز', admins) +
                sectionHtml('الطلاب', students);
        }

        // ====================== زرار الحسابات الموثقة في شريط الأدوات + تلميح "جديد" ======================
        // فكرة بسيطة: نقطة حمراء صغيرة على الأيقونة + بابوفر تلميح بيظهر مرة واحدة بس
        // (متخزن في localStorage) عشان يلفت نظر الطالب للميزة الجديدة من غير ما يضايقه
        // في كل مرة يفتح فيها الشات، ومن غير ما يأثر على استايل صندوق المحادثة نفسه.
        const VERIFIED_TIP_KEY = 'sx_verified_tip_seen';

        function handleVerifiedTopBtnClick() {
            dismissVerifiedTip(false);
            openVerifiedAccountsModal();
        }

        function positionVerifiedTip() {
            const btn = document.getElementById('verifiedAccountsTopBtn');
            const tip = document.getElementById('verifiedTipPopover');
            if (!btn || !tip) return;
            const r = btn.getBoundingClientRect();
            const tipWidth = tip.offsetWidth || 260;
            let left = r.left + r.width / 2 - tipWidth / 2;
            left = Math.max(10, Math.min(left, window.innerWidth - tipWidth - 10));
            tip.style.top = (r.bottom + 12) + 'px';
            tip.style.left = left + 'px';
            // السهم لازم يفضل مركّز فوق منتصف الزرار بالظبط حتى لو البابوفر اتزحزح لحواف الشاشة
            const arrow = tip.querySelector('.vt-arrow');
            if (arrow) {
                const arrowOffset = (r.left + r.width / 2) - left - 6;
                arrow.style.insetInlineEnd = 'auto';
                arrow.style.left = Math.max(12, Math.min(arrowOffset, tipWidth - 24)) + 'px';
            }
        }

        // بيرجع true لو تلميح الحسابات الموثقة ظاهر دلوقتي — مستخدمة عشان أوفرلايز
        // تانية (زي "لحظة مع الله" وتنبيه الواجبات) تأجّل نفسها بدل ما تغطّي عليه.
        function isVerifiedTipShowing() {
            const tip = document.getElementById('verifiedTipPopover');
            return !!(tip && tip.classList.contains('show'));
        }

        function maybeShowVerifiedAccountsTip() {
            const btn = document.getElementById('verifiedAccountsTopBtn');
            const tip = document.getElementById('verifiedTipPopover');
            if (!btn || !tip) return;
            if (localStorage.getItem(VERIFIED_TIP_KEY) === '1') {
                const dot = document.getElementById('verifiedNewDot');
                if (dot) dot.style.display = 'none';
                return;
            }
            // مانوريهوش وهو مودال تاني (زي الترحيب) أو أوفرلاي "لحظة مع الله" فاتح فوقه —
            // نأجّله شوية بدل ما نضايقه أو نخليه يظهر تحت حاجة تانية من غير ما حد ياخد باله.
            if (document.querySelector('.modal-overlay.active') || document.querySelector('.dua-overlay.show')) {
                setTimeout(maybeShowVerifiedAccountsTip, 1500);
                return;
            }
            positionVerifiedTip();
            tip.classList.add('show');
            window.addEventListener('resize', positionVerifiedTip);
            setTimeout(() => {
                document.addEventListener('click', verifiedTipOutsideClick, { capture: true });
            }, 50);
        }

        function verifiedTipOutsideClick(e) {
            const tip = document.getElementById('verifiedTipPopover');
            const btn = document.getElementById('verifiedAccountsTopBtn');
            if (!tip || tip.contains(e.target) || (btn && btn.contains(e.target))) return;
            // كليك جوه أوفرلاي تاني (زي تذكير "لحظة مع الله" أو أي مودال) مش قصده يقفل
            // التلميح ده — ده مجرد تفاعل مع حاجة تانية ظهرت فوقه بالصدفة، فمنعتبروش
            // "كليك بره" يقفل التلميح ويسجّله كـ"اتشاف" نهائيًا.
            if (e.target.closest('.dua-overlay') || e.target.closest('.modal-overlay')) return;
            dismissVerifiedTip(false);
        }

        function dismissVerifiedTip(openIt) {
            const tip = document.getElementById('verifiedTipPopover');
            const dot = document.getElementById('verifiedNewDot');
            if (tip) tip.classList.remove('show');
            if (dot) dot.style.display = 'none';
            localStorage.setItem(VERIFIED_TIP_KEY, '1');
            document.removeEventListener('click', verifiedTipOutsideClick, { capture: true });
            window.removeEventListener('resize', positionVerifiedTip);
            if (openIt) openVerifiedAccountsModal();
        }

        // البروفايل الأكاديمي الموحّد (Premium) — بيستخدم نفس /api/me الموجود أصلاً (مفيش
        // endpoint جديد)، وبيجمع كل حاجة عن أداء الطالب في شاشة واحدة. بيعمل نداء تاني
        // لطلب بيانات محدّثة كل مرة يتفتح فيها (بدل ما يعتمد على schoolContext النصي
        // المخزّن من fetchSchoolProfile، اللي بيلخّص البيانات كنص مش بيحتفظ بيها منظّمة).
        const ACADEMIC_GRADE_LABELS = { first: 'الأول الثانوي', second: 'الثاني الثانوي', third: 'الثالث الثانوي' };
        async function openAcademicProfile() {
            const contentEl = document.getElementById('academicProfileContent');
            if (!contentEl) return;
            reportFeatureUsage('premium_academic_profile');
            openModal('academicProfileModal');
            if (!schoolToken) {
                contentEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px;">لازم تكون مسجّل دخول بحساب School X عشان تشوف البروفايل ده.</div>';
                return;
            }
            contentEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/me`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                if (data.type !== 'student') {
                    contentEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px;">البروفايل ده للطلاب بس.</div>';
                    return;
                }
                renderAcademicProfile(data);
            } catch (e) {
                contentEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);font-size:12px;">تعذر تحميل البيانات — جرّب تاني.</div>';
            }
        }

        function renderAcademicProfile(data) {
            const contentEl = document.getElementById('academicProfileContent');
            const p = data.profile || {};
            const attendance = data.attendance || [];
            const examResults = data.examResults || [];
            const violations = data.violations || [];
            const pendingHomework = data.pendingHomework || [];

            // إحصائيات الحضور — نفس منطق الحساب المستخدم في باقي السيرفر (present/absent/late)
            const presentCount = attendance.filter(a => a.status === 'present').length;
            const absentCount = attendance.filter(a => a.status === 'absent').length;
            const lateCount = attendance.filter(a => a.status === 'late').length;
            const attendanceTotal = attendance.length;
            const attendancePct = attendanceTotal > 0 ? Math.round((presentCount / attendanceTotal) * 100) : null;
            const attendanceColor = attendancePct === null ? 'var(--text-3)' : (attendancePct >= 85 ? 'var(--success)' : attendancePct >= 65 ? 'var(--warning)' : 'var(--danger)');

            // متوسط درجات الامتحانات (كنسبة مئوية، لأن كل امتحان عدد أسئلته مختلف)
            const scoredResults = examResults.filter(r => r.totalQuestions);
            const avgPct = scoredResults.length
                ? Math.round(scoredResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / scoredResults.length)
                : null;

            let html = `
                <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:16px;">
                    ${renderVerifiedAvatar(p.fullName, p.avatarUrl, !!p.isVerified, 60)}
                    <div style="text-align:start;">
                        <div style="font-size:15px;font-weight:800;">${escapeHtml(p.fullName || '')}</div>
                        <div style="font-size:11.5px;color:var(--text-3);margin-top:2px;">${escapeHtml(ACADEMIC_GRADE_LABELS[p.grade] || p.grade || '')} · كود ${escapeHtml(p.studentCode || '')}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
                    <div style="background:var(--bg-2);border-radius: var(--radius-sm);padding:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:${attendanceColor};">${attendancePct === null ? '—' : attendancePct + '%'}</div>
                        <div style="font-size:10.5px;color:var(--text-3);margin-top:2px;">نسبة الحضور (آخر ${attendanceTotal} يوم)</div>
                    </div>
                    <div style="background:var(--bg-2);border-radius: var(--radius-sm);padding:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:${avgPct === null ? 'var(--text-3)' : avgPct >= 60 ? 'var(--success)' : 'var(--danger)'};">${avgPct === null ? '—' : avgPct + '%'}</div>
                        <div style="font-size:10.5px;color:var(--text-3);margin-top:2px;">متوسط الامتحانات (آخر ${examResults.length})</div>
                    </div>
                    <div style="background:var(--bg-2);border-radius: var(--radius-sm);padding:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;">${pendingHomework.length}</div>
                        <div style="font-size:10.5px;color:var(--text-3);margin-top:2px;">واجبات مستحقة</div>
                    </div>
                    <div style="background:var(--bg-2);border-radius: var(--radius-sm);padding:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:${violations.length ? 'var(--danger)' : 'var(--success)'};">${violations.length}</div>
                        <div style="font-size:10.5px;color:var(--text-3);margin-top:2px;">مخالفات مسجّلة</div>
                    </div>
                </div>`;

            html += `<div class="tool-title"><i class="fas fa-calendar-days"></i> آخر أيام الحضور</div>`;
            if (!attendance.length) {
                html += `<div style="text-align:center;padding:10px;color:var(--text-3);font-size:11.5px;">مفيش سجلات حضور لسه</div>`;
            } else {
                const statusLabels = { present: 'حاضر', absent: 'غايب', late: 'متأخر' };
                const statusColors = { present: 'var(--success)', absent: 'var(--danger)', late: 'var(--warning)' };
                html += `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:16px;">` +
                    attendance.slice(0, 8).map(a => `
                        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-2);border-radius: var(--radius-xs);padding:7px 10px;font-size:11.5px;">
                            <span>${escapeHtml(a.date)}</span>
                            <span style="color:${statusColors[a.status] || 'var(--text-3)'};font-weight:700;">${statusLabels[a.status] || a.status}</span>
                        </div>`).join('') +
                    `</div>`;
            }

            html += `<div class="tool-title"><i class="fas fa-file-lines"></i> آخر نتائج الامتحانات</div>`;
            if (!examResults.length) {
                html += `<div style="text-align:center;padding:10px;color:var(--text-3);font-size:11.5px;">مفيش امتحانات متسجّلة لسه</div>`;
            } else {
                html += `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:16px;">` +
                    examResults.slice(0, 8).map(r => `
                        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-2);border-radius: var(--radius-xs);padding:7px 10px;font-size:11.5px;gap:8px;">
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(r.examName || r.examCode)}</span>
                            <span style="font-weight:700;flex-shrink:0;">${r.score}${r.totalQuestions ? ' / ' + r.totalQuestions : ''}</span>
                        </div>`).join('') +
                    `</div>`;
            }

            if (violations.length) {
                html += `<div class="tool-title"><i class="fas fa-triangle-exclamation"></i> المخالفات</div>
                    <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:16px;">` +
                    violations.slice(0, 8).map(v => `
                        <div style="background:var(--bg-2);border-radius: var(--radius-xs);padding:7px 10px;font-size:11.5px;">
                            <div style="font-weight:700;">${escapeHtml(v.type || 'مخالفة')}</div>
                            <div style="color:var(--text-3);margin-top:2px;">${escapeHtml(v.reason || '')} ${v.date ? '· ' + escapeHtml(v.date) : ''}</div>
                        </div>`).join('') +
                    `</div>`;
            }

            if (pendingHomework.length) {
                html += `<div class="tool-title"><i class="fas fa-list-check"></i> واجبات لسه ماسلمتهاش</div>
                    <div style="display:flex;flex-direction:column;gap:5px;">` +
                    pendingHomework.slice(0, 8).map(h => `
                        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-2);border-radius: var(--radius-xs);padding:7px 10px;font-size:11.5px;gap:8px;">
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(h.title)}</span>
                            <span style="color:var(--warning);flex-shrink:0;">حتى ${escapeHtml(h.deadline)}</span>
                        </div>`).join('') +
                    `</div>`;
            }

            contentEl.innerHTML = html;
        }

        async function loadAdminReviewQueue() {
            const listEl = document.getElementById('adminReviewList');
            if (!listEl || !schoolToken) return;
            listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/pending`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const files = await res.json();
                if (!files.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش ملفات محتاجة مراجعة دلوقتي 👍</div>';
                    return;
                }
                const gradeLabels = { first: 'الأول الثانوي', second: 'الثاني الثانوي', third: 'الثالث الثانوي' };
                listEl.innerHTML = '';
                files.forEach(f => {
                    registerPreviewFile(f._id, f.url, f.name);
                    const item = document.createElement('div');
                    item.id = `reviewItem_${f._id}`;
                    item.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius: var(--radius-sm);background:var(--bg-glass);';
                    item.innerHTML = `
                        <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${escapeHtml(f.topic)}</div>
                        <div style="font-size:11px;color:var(--text-3);margin-bottom:8px;">
                            ${escapeHtml(f.subject)} · ${gradeLabels[f.grade] || f.grade} · رفعه ${escapeHtml(f.uploadedByName || f.uploadedBy)}
                        </div>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                            <button onclick="openFilePreview('${f._id}')" style="font-size:11.5px;color:var(--accent);background:none;border:none;text-decoration:underline;cursor:pointer;padding:0;"><i class="fas fa-eye"></i> معاينة الملف</button>
                            <button onclick="checkSummarySimilarity('${f._id}')" style="font-size:11.5px;color:var(--accent);background:none;border:none;text-decoration:underline;cursor:pointer;padding:0;"><i class="fas fa-clone"></i> فحص التشابه</button>
                        </div>
                        <div id="simResult_${f._id}" style="display:none;font-size:11px;background:var(--bg-2);border-radius: var(--radius-xs);padding:8px 10px;margin-bottom:6px;line-height:1.8;"></div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-calc" style="flex:1;background:var(--success);" onclick="reviewSharedSummary('${f._id}', 'approve')"><i class="fas fa-check"></i> قبول</button>
                            <button class="btn-calc" style="flex:1;background:var(--danger);" onclick="reviewSharedSummary('${f._id}', 'reject')"><i class="fas fa-times"></i> رفض</button>
                        </div>
                    `;
                    listEl.appendChild(item);
                });
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل قائمة المراجعة</div>';
            }
        }

        // فيتشر 6: فحص تشابه الملف اللي بيراجعه الأدمن مع باقي ملفات نفس الصف
        // والمادة (TF-IDF عن طريق خدمة بايثون) — بيساعد يكتشف نسخ/تكرار قبل القبول.
        async function checkSummarySimilarity(id) {
            const box = document.getElementById(`simResult_${id}`);
            if (!box) return;
            box.style.display = 'block';
            box.innerHTML = '<span style="color:var(--text-3);"><span class="btn-spinner"></span> جارٍ فحص التشابه...</span>';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/${id}/check-similarity`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'فشل الفحص');

                if (data.note) { box.innerHTML = `<span style="color:var(--text-3);">${escapeHtml(data.note)}</span>`; return; }
                if (!data.matches || !data.matches.length) {
                    box.innerHTML = '<span style="color:var(--success);"><i class="fas fa-check"></i> مفيش تشابه ملحوظ مع ملفات تانية</span>';
                    return;
                }
                const statusLabels = { pending: 'تحت المراجعة', approved: 'معتمد' };
                box.innerHTML = '<div style="font-weight:700;margin-bottom:4px;color:var(--warning);"><i class="fas fa-triangle-exclamation"></i> فيه تشابه مع:</div>' +
                    data.matches.map(m => `
                        <div style="display:flex;justify-content:space-between;gap:8px;padding:2px 0;">
                            <span>${escapeHtml(m.topic)} <span style="color:var(--text-3);">(${escapeHtml(statusLabels[m.status] || m.status)})</span></span>
                            <span style="font-weight:700;color:${m.score >= 0.6 ? 'var(--danger)' : 'var(--warning)'};">${Math.round(m.score * 100)}%</span>
                        </div>`).join('');
            } catch (e) {
                box.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر فحص التشابه')}</span>`;
            }
        }

        async function reviewSharedSummary(id, action) {
            let reason = '';
            if (action === 'reject') {
                reason = prompt('سبب الرفض (اختياري، هيتبعت للطالب):') || '';
            }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/${id}/${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: action === 'reject' ? JSON.stringify({ reason }) : undefined
                });
                if (!res.ok) throw new Error('failed');
                const item = document.getElementById(`reviewItem_${id}`);
                if (item) item.remove();
                showToast(action === 'approve' ? 'تم قبول الملف ✅' : 'تم رفض الملف', 'success');
            } catch (e) {
                showToast('تعذر تنفيذ العملية، حاول تاني', 'error');
            }
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // ====================== لوحة الصدارة الأسبوعية ======================
        // بيتنادى بس لو الطالب مسجل دخول School X. بنبعت "ping" كل ما الطالب يبعت
        // رسالة أو يحل سؤال من بنك الأسئلة، مش على كل تفاعل صغير — عشان منزنقش السيرفر.
        let lastActivityPingAt = 0;
        async function pingActivity() {
            if (!schoolToken) return;
            const now = Date.now();
            if (now - lastActivityPingAt < 60 * 1000) return; // حد أقصى مرة كل دقيقة
            // بنبعت وقت الفجوة الفعلي من آخر ping (السيرفر بيقصّه أقصى 120 ثانية بنفسه)
            const elapsedSeconds = lastActivityPingAt ? Math.round((now - lastActivityPingAt) / 1000) : 30;
            lastActivityPingAt = now;
            try {
                await fetch(`${FIXED_SCHOOL_API_URL}/api/presence/heartbeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({
                        messages: 1,
                        questions: 0,
                        seconds: elapsedSeconds,
                        fullName: schoolUser?.fullName
                    })
                });
            } catch (e) { /* متجاهلينها بهدوء لو حصل خطأ شبكة */ }
        }

        // ====================== تتبّع استخدام الميزات (للوحة متابعة الأدمن) ======================
        // بتبعت "استخدمت الميزة دي" للسيرفر — نفس فلسفة pingActivity بالظبط (fire & forget،
        // مفيش تأثير على تجربة الطالب لو الطلب فشل أو اتأخر). متقيّدة بحد أقصى مرة كل 15 ثانية
        // لنفس (الميزة+الموديل) عشان منزنقش السيرفر لو الطالب بيستخدم الميزة بسرعة ومتكرر.
        let lastUsageReportAt = {};
        function reportFeatureUsage(feature, model) {
            if (!schoolToken) return;
            const key = feature + '|' + (model || '');
            const now = Date.now();
            if (lastUsageReportAt[key] && now - lastUsageReportAt[key] < 15000) return;
            lastUsageReportAt[key] = now;
            fetch(`${FIXED_SCHOOL_API_URL}/api/usage/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                body: JSON.stringify({ feature, model: model || undefined })
            }).catch(() => {});
        }

        function openLeaderboard() {
            openModal('leaderboardModal');
            loadWeeklyLeaderboard();
        }

        // بيحول ثواني لصيغة "س دقيقة" مختصرة للعرض
        function formatDurationShort(seconds) {
            const totalMinutes = Math.round((seconds || 0) / 60);
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            if (h > 0) return `${h}س ${m}د`;
            return `${m}د`;
        }

        async function loadWeeklyLeaderboard() {
            const listEl = document.getElementById('leaderboardList');
            const rankText = document.getElementById('myRankText');
            const rewardsBox = document.getElementById('myRewardsBox');
            listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            rewardsBox.style.display = 'none';
            if (!schoolToken) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لازم تسجّل دخول School X الأول</div>';
                return;
            }
            try {
                const headers = { 'Authorization': `Bearer ${schoolToken}` };
                const [lbRes, rwRes] = await Promise.all([
                    fetch(`${FIXED_SCHOOL_API_URL}/api/leaderboard/live`, { headers }),
                    fetch(`${FIXED_SCHOOL_API_URL}/api/leaderboard/rewards`, { headers }).catch(() => null)
                ]);
                if (!lbRes.ok) throw new Error('failed');
                const data = await lbRes.json();
                const top = data.weeklyTop || [];
                const onlineUsernames = new Set((data.online || []).map(u => u.username));
                const myRank = data.me && data.me.rank;
                const myStats = data.me && data.me.stats;
                rankText.textContent = myRank ? `#${myRank}${myStats ? ' — ' + formatDurationShort(myStats.timeSpentSeconds) : ''}` : 'لسه معملتش نشاط الأسبوع ده';

                // مزايا "بطل الأسبوع" الخاصة بيا (لو مستحقّها)
                if (rwRes && rwRes.ok) {
                    const rw = await rwRes.json();
                    if (rw.isChampion) {
                        document.getElementById('myRewardsMessage').textContent = rw.message || '👑 أنت بطل الأسبوع!';
                        const rewardsListEl = document.getElementById('myRewardsList');
                        rewardsListEl.innerHTML = (rw.rewards || []).map(r =>
                            `<span title="${escapeHtml(r.desc)}" style="font-size:11px;background:var(--bg-glass);border:1px solid var(--border);border-radius: var(--radius-lg);padding:4px 10px;">${r.icon} ${escapeHtml(r.name)}</span>`
                        ).join('');
                        rewardsBox.style.display = 'block';
                    }
                }

                if (!top.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش بيانات لسه</div>';
                    return;
                }
                listEl.innerHTML = '';
                top.forEach((s, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                    const isMe = schoolUser && s.username === schoolUser.username;
                    const isOnline = onlineUsernames.has(s.username);
                    const championBadge = i === 0 ? ' <span title="المتصدر الحالي" style="filter:drop-shadow(0 0 3px gold);">👑</span>' : '';
                    const row = document.createElement('div');
                    row.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius: var(--radius-sm);background:${i === 0 ? 'linear-gradient(135deg, rgba(255,215,0,0.14), var(--bg-glass))' : (isMe ? 'var(--accent-glow)' : 'var(--bg-glass)')};border:1px solid ${i === 0 ? 'rgba(255,215,0,0.5)' : (isMe ? 'var(--border-accent)' : 'var(--border)')};`;
                    row.innerHTML = `
                        <div style="width:26px;text-align:center;font-weight:800;font-size:13px;">${medal}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:13px;font-weight:${isMe ? '800' : '600'};">${escapeHtml(s.fullName || s.username)}${championBadge}</div>
                            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">
                                ${isOnline ? '🟢 أونلاين' : '⚪ أوفلاين'} • نشاط: ${formatDurationShort(s.timeSpentSeconds)} • أسئلة: ${s.questionsCount || 0}
                            </div>
                        </div>
                    `;
                    listEl.appendChild(row);
                });
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل لوحة الصدارة</div>';
            }
        }

        // ====================== غرف المذاكرة الجماعية ======================
        let mentionSearchToken = 0;
        let activeGroupChatId = null;
        let groupChatPollTimer = null;
        // حالة "طلب المحادثة" بتاعة الغرفة المفتوحة دلوقتي — 'accepted' يعني
        // اتقبلت وعادية، 'pending' يعني لسه مستنية موافقة الطرف اللي مبدأش الطلب.
        let activeGroupChatStatus = 'accepted';
        let activeGroupChatRequestedBy = null;

        function openGroupChatList() {
            openModal('groupChatListModal');
            document.getElementById('mentionSearchInput').value = '';
            document.getElementById('mentionSuggestions').style.display = 'none';
            loadMyGroupChats();
        }

        let mentionSearchDebounceTimer = null;
        function handleMentionSearch(value) {
            // Debounce 350ms — من غير كده كانت بتبعت طلب مع كل حرف، وده اللي كان حاسسه إن
            // البحث "بيعلق" (كذا طلب متراكم بيتسابقوا على بعض).
            clearTimeout(mentionSearchDebounceTimer);
            mentionSearchDebounceTimer = setTimeout(() => performMentionSearch(value), 350);
        }
        async function performMentionSearch(value) {
            const box = document.getElementById('mentionSuggestions');
            const statusEl = document.getElementById('mentionSearchStatus');
            const atIndex = value.lastIndexOf('@');
            if (atIndex === -1) { box.style.display = 'none'; return; }
            const q = value.slice(atIndex + 1).trim();
            if (q.length < 2) { box.style.display = 'none'; statusEl.textContent = 'اكتب حرفين على الأقل بعد @'; return; }
            statusEl.textContent = 'جارٍ البحث...';
            const myToken = ++mentionSearchToken;
            if (!schoolToken) { statusEl.textContent = 'لازم تسجّل دخول School X الأول'; return; }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/rooms/search-friends?q=${encodeURIComponent(q)}`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (myToken !== mentionSearchToken) return;
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const users = data.results || [];
                if (!users.length) { box.style.display = 'none'; statusEl.textContent = 'مفيش نتايج'; return; }
                box.innerHTML = '';
                users.forEach(u => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding:10px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:8px;';
                    item.innerHTML = `
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:600;">${escapeHtml(u.fullName || u.username)}</div>
                            <div style="font-size:11px;color:var(--text-3);display:flex;align-items:center;gap:4px;">@${u.username}${u.isVerified ? verifiedBadgeIconHtml(11) : ''}</div>
                        </div>
                        <div style="font-size:15px;">${u.online ? '🟢' : '⚪'}</div>
                    `;
                    item.onclick = () => startGroupChatWith(u.username);
                    box.appendChild(item);
                });
                box.style.display = 'block';
            } catch (e) {
                statusEl.textContent = 'تعذر البحث، حاول تاني';
            }
        }

        // ====================== المكتبة المشتركة (ملخصات الطلاب) ======================
        const filePreviewRegistry = {};
        function registerPreviewFile(id, url, name) { filePreviewRegistry[id] = { url, name }; }
        function openFilePreview(id) {
            const f = filePreviewRegistry[id];
            if (!f) return;
            previewFile(f.url, f.name, id);
        }

        // معاينة فعلية للملف حسب نوعه (مش مجرد رابط تحميل).
        // بيرندر الـ PDF صفحة صفحة على canvas داخل مودال المعاينة — بديل عن iframe
        // عشان كروم بالموبايل بيرفض يعرض PDF جوه iframe وبيوجّه لتحميل بدل كده.
        // بنجيب بايتس الملف عن طريق بروكسي السيرفر بتاعنا (/api/shared-summaries/preview/:id)
        // مش من رابط R2 مباشرة — كده معتمدين على CORS الخاص بدومين الـ API بتاعنا
        // (اللي أصلاً بيشتغل مع باقي الموقع) بدل ما نعتمد على إعدادات CORS في باكت
        // R2 نفسه واللي ممكن تكون مش مضبوطة. لو مفيش id (حالة نادرة)، بنرجع لمحاولة
        // الرابط المباشر كـ fallback أخير.
        async function renderPdfPreview(url, name, id) {
            const body = document.getElementById('filePreviewBody');
            body.innerHTML = '<div style="color:var(--text-3);font-size:12px;text-align:center;padding:20px;">جارٍ تحميل الـ PDF...</div>';

            if (!window.pdfjsLib) {
                body.innerHTML = `<div style="text-align:center;color:var(--text-2);font-size:13px;line-height:2;">
                    تعذر تحميل عارض PDF.<br>
                    <a href="${url}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:700;">افتح الملف في تاب جديد</a>
                </div>`;
                return;
            }
            try {
                if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }

                let pdf;
                if (id) {
                    // بنجيب البايتس من السيرفر بتاعنا (نفس الدومين اللي كل الـ API
                    // بيشتغل عليه) بدل ما نطلب من pdf.js يجيبها هو من R2 مباشرة —
                    // كده مش محتاجين R2 يبقى مضبوط عليه CORS خالص.
                    const fileRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/preview/${id}`, {
                        headers: { 'Authorization': `Bearer ${schoolToken}` }
                    });
                    if (!fileRes.ok) {
                        let msg = 'تعذر تحميل الملف للمعاينة';
                        try { const d = await fileRes.json(); if (d?.error) msg = d.error; } catch (_) {}
                        throw new Error(msg);
                    }
                    const buffer = await fileRes.arrayBuffer();
                    pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
                } else {
                    // fallback نادر — مفيش id (ملف مش من المكتبة المشتركة مثلًا)،
                    // نرجع للمحاولة القديمة بالرابط المباشر.
                    pdf = await pdfjsLib.getDocument({ url }).promise;
                }

                const wrap = document.createElement('div');
                wrap.style.cssText = 'width:100%;height:100%;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px 0;';
                const statusEl = document.createElement('div');
                statusEl.style.cssText = 'color:var(--text-3);font-size:11.5px;';
                wrap.appendChild(statusEl);
                body.innerHTML = '';
                body.appendChild(wrap);

                const maxPages = Math.min(pdf.numPages, 60);
                for (let i = 1; i <= maxPages; i++) {
                    statusEl.textContent = `جارٍ عرض صفحة ${i} من ${maxPages}...`;
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.4 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.style.cssText = 'max-width:100%;height:auto;box-shadow:0 2px 12px rgba(0,0,0,0.25);border-radius:4px;background:#fff;';
                    wrap.appendChild(canvas);
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                }
                statusEl.remove();

                if (pdf.numPages > maxPages) {
                    const note = document.createElement('div');
                    note.style.cssText = 'color:var(--text-3);font-size:12px;padding:6px 0 12px;';
                    note.textContent = `تم عرض أول ${maxPages} صفحة من إجمالي ${pdf.numPages} صفحة`;
                    wrap.appendChild(note);
                }
            } catch (e) {
                console.error('PDF preview failed:', e);
                body.innerHTML = `<div style="text-align:center;color:var(--text-2);font-size:13px;line-height:2;">
                    ${escapeHtml(e.message && e.message !== 'Failed to fetch' ? e.message : 'تعذرت معاينة الملف جوه التطبيق')}.<br>
                    <a href="${url}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:700;">افتح الملف في تاب جديد</a>
                </div>`;
            }
        }

        function previewFile(url, name, id) {
            const body = document.getElementById('filePreviewBody');
            const titleEl = document.getElementById('filePreviewTitle');
            titleEl.innerHTML = `<i class="fas fa-eye"></i> ${escapeHtml(name || 'معاينة الملف')}`;
            const cleanUrl = url.split('?')[0];
            const ext = (cleanUrl.split('.').pop() || '').toLowerCase();
            body.innerHTML = '';

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
                body.innerHTML = `<img src="${url}" alt="${escapeHtml(name || '')}">`;
            } else if (ext === 'pdf') {
                // ملحوظة: iframe عادي بيوجّه لتحميل الملف بدل عرضه على متصفح كروم
                // للموبايل (بيعتبره "ملف يتحمّل" مش صفحة تتعرض). عشان كده بنرندر
                // الـ PDF بنفسنا على canvas بمكتبة pdf.js (موجودة أصلاً في المشروع) —
                // كده العرض مضمون في أي متصفح، من غير ما نعتمد على سلوك المتصفح نفسه.
                renderPdfPreview(url, name, id);
            } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
                // معاينة ملفات الأوفيس عن طريق Google Docs Viewer (محتاج الرابط يكون عام — وهو كذلك)
                const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
                body.innerHTML = `<iframe src="${viewerUrl}"></iframe>`;
            } else if (ext === 'txt') {
                body.innerHTML = '<div style="color:var(--text-3);font-size:12px;">جارٍ تحميل النص...</div>';
                fetch(url).then(r => r.text()).then(text => {
                    body.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
                }).catch(() => {
                    body.innerHTML = '<div style="color:var(--danger);font-size:12px;">تعذرت معاينة الملف</div>';
                });
            } else {
                body.innerHTML = `<div style="text-align:center;color:var(--text-2);font-size:13px;line-height:2;">
                    معاينة النوع ده مش مدعومة مباشرة جوه التطبيق.<br>
                    <a href="${url}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:700;">افتح الملف في تاب جديد</a>
                </div>`;
            }
            openModal('filePreviewModal');
        }

        let currentLibraryTab = 'all';

        function switchLibraryTab(tab) {
            currentLibraryTab = tab;
            document.getElementById('libTabAll').classList.toggle('active', tab === 'all');
            document.getElementById('libTabMine').classList.toggle('active', tab === 'mine');
            // فلتر الصف ومعاه زرار "شارك ملخص" منطقيين بس في تبويب المكتبة العامة —
            // في "ملفاتي" الطالب أصلاً شايف كل ملفاته هو بغض النظر عن الصف.
            document.getElementById('libraryFiltersRow').style.display = tab === 'all' ? 'flex' : 'none';
            if (tab === 'all') loadSharedLibrary(); else loadMySummaries();
        }

        // بترجع HTML صف واحد للملف — بتتستخدم في المكتبة العامة و"ملفاتي" مع بعض
        // عشان زراير الأسئلة/التلخيص تفضل واحدة في المكانين (مفيش تكرار كود).
        function buildLibraryRowHtml(f, opts) {
            opts = opts || {};
            const statusBadges = {
                pending: '<span class="lib-status-badge lib-status-pending"><i class="fas fa-clock"></i> تحت المراجعة</span>',
                approved: '<span class="lib-status-badge lib-status-approved"><i class="fas fa-check"></i> معتمد</span>',
                rejected: '<span class="lib-status-badge lib-status-rejected"><i class="fas fa-xmark"></i> مرفوض</span>'
            };
            const gradeLabels = { first: 'الأول الثانوي', second: 'الثاني الثانوي', third: 'الثالث الثانوي' };
            return `
                <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${escapeHtml(f.topic)} ${opts.showStatus ? (statusBadges[f.status] || '') : ''}</div>
                <div style="font-size:11px;color:var(--text-3);margin-bottom:8px;">
                    ${escapeHtml(f.subject)} · ${gradeLabels[f.grade] || f.grade}${opts.showStatus ? '' : ' · رفعه ' + escapeHtml(f.uploadedByName || f.uploadedBy)}
                </div>
                ${f.status === 'rejected' && f.rejectionReason ? `<div style="font-size:11px;color:var(--danger);margin-bottom:8px;"><i class="fas fa-circle-info"></i> سبب الرفض: ${escapeHtml(f.rejectionReason)}</div>` : ''}
                <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <button class="btn-calc" style="flex:1;background:var(--bg-2);color:var(--text-2);padding:6px 10px;font-size:12px;" onclick="openFilePreview('${f._id}')"><i class="fas fa-eye"></i> معاينة</button>
                    <button class="btn-calc" style="flex:1;padding:6px 10px;font-size:12px;" id="dlBtn_${f._id}" onclick="downloadSharedSummary('${f._id}', '${escapeAttr(f.name)}')"><i class="fas fa-download"></i> تحميل</button>
                    ${schoolUser?.type === 'admin' && !opts.hideAdminDelete ? `<button class="btn-calc" aria-label="حذف الملف" title="حذف الملف" style="flex:none;width:auto;padding:6px 10px;font-size:12px;background:var(--danger);color:#fff;" onclick="deleteLibraryFile('${f._id}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="btn-calc" style="flex:1;background:var(--bg-2);color:var(--text-2);padding:6px 10px;font-size:12px;" onclick="openSummaryQuiz('${f._id}', '${escapeAttr(f.topic)}')"><i class="fas fa-list-check"></i> اختبرني</button>
                    <button class="btn-calc" style="flex:1;background:var(--bg-2);color:var(--text-2);padding:6px 10px;font-size:12px;" onclick="openSummaryTLDR('${f._id}', '${escapeAttr(f.topic)}')"><i class="fas fa-wand-magic-sparkles"></i> لخّصهولي</button>
                </div>
                <div class="upload-progress-wrap" id="dlProgressWrap_${f._id}"><div class="upload-progress-bar" id="dlProgressBar_${f._id}"></div></div>
                <div class="upload-progress-text" id="dlProgressText_${f._id}"></div>
            `;
        }

        async function loadSharedLibrary() {
            const listEl = document.getElementById('sharedLibraryList');
            document.getElementById('libTabMine').style.display = schoolUser?.type === 'student' ? '' : 'none';
            if (!schoolToken) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لازم تسجّل دخول School X الأول</div>';
                return;
            }
            const grade = document.getElementById('libraryGradeFilter').value;
            listEl.innerHTML = Array.from({ length: 4 }).map(() =>
                `<div class="skeleton-row"><div class="skeleton-line long"></div><div class="skeleton-line short"></div></div>`
            ).join('');
            try {
                const qs = grade ? `?grade=${encodeURIComponent(grade)}` : '';
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries${qs}`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const files = await res.json();
                if (!files.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لسه مفيش ملخصات متاحة في القسم ده</div>';
                    return;
                }
                listEl.innerHTML = '';
                files.forEach(f => {
                    registerPreviewFile(f._id, f.url, f.name);
                    const row = document.createElement('div');
                    row.id = `libItem_${f._id}`;
                    row.style.cssText = 'padding:12px;border:1px solid var(--border);border-radius: var(--radius-sm);margin-bottom:10px;';
                    row.innerHTML = buildLibraryRowHtml(f, { showStatus: false });
                    listEl.appendChild(row);
                });
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل المكتبة المشتركة</div>';
            }
        }

        // ====================== "ملفاتي" — ملفات الطالب نفسه بكل حالاتها ======================
        // ده اللي بيسمح للطالب يطلّع أسئلة/تلخيص من ملف رفعه هو بنفسه حتى لو
        // لسه تحت مراجعة الأدمن (مش لازم يستنى الموافقة عشان يستفيد من محتواه).
        async function loadMySummaries() {
            const listEl = document.getElementById('sharedLibraryList');
            if (!schoolToken) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لازم تسجّل دخول School X الأول</div>';
                return;
            }
            listEl.innerHTML = Array.from({ length: 3 }).map(() =>
                `<div class="skeleton-row"><div class="skeleton-line long"></div><div class="skeleton-line short"></div></div>`
            ).join('');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/mine`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const files = await res.json();
                const countEl = document.getElementById('libMineCount');
                if (files.length) { countEl.textContent = `(${files.length})`; countEl.style.display = ''; }
                else countEl.style.display = 'none';

                if (!files.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لسه مارفعتش أي ملف — دوس "شارك ملخص" عشان تبدأ</div>';
                    return;
                }
                listEl.innerHTML = '';
                files.forEach(f => {
                    registerPreviewFile(f._id, f.url, f.name);
                    const row = document.createElement('div');
                    row.id = `libItem_${f._id}`;
                    row.style.cssText = 'padding:12px;border:1px solid var(--border);border-radius: var(--radius-sm);margin-bottom:10px;';
                    row.innerHTML = buildLibraryRowHtml(f, { showStatus: true, hideAdminDelete: true });
                    listEl.appendChild(row);
                });
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل ملفاتك</div>';
            }
        }

        // عشان نحط اسم فيه " أو ' جوه onclick="" من غير ما يبوظ الـ HTML
        function escapeAttr(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        }

        // ====================== فيتشر 1: اختبار سريع مُولّد تلقائيًا من ملف ======================
        let sqCurrentQuestions = [];
        let sqCurrentIndex = 0;
        let sqScore = 0;
        let sqAnswered = false;

        async function openSummaryQuiz(summaryId, topic) {
            document.getElementById('sqTitle').textContent = `اختبار: ${topic}`;
            const body = document.getElementById('sqBody');
            body.innerHTML = '<div style="text-align:center;padding:30px 10px;color:var(--text-3);font-size:12.5px;"><span class="btn-spinner"></span><br><br>جارٍ توليد الأسئلة من الملف...</div>';
            openModal('summaryQuizModal');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/gemini/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ summaryId, count: 5 })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'فشل توليد الأسئلة');
                if (!data.questions || !data.questions.length) throw new Error('مفيش أسئلة اتولّدت من الملف ده');
                sqCurrentQuestions = data.questions;
                sqCurrentIndex = 0;
                sqScore = 0;
                renderSqQuestion();
            } catch (e) {
                body.innerHTML = `<div style="text-align:center;padding:30px 10px;color:var(--danger);font-size:12.5px;">${escapeHtml(e.message || 'تعذر توليد الأسئلة')}</div>`;
            }
        }

        function renderSqQuestion() {
            const body = document.getElementById('sqBody');
            if (sqCurrentIndex >= sqCurrentQuestions.length) {
                const pct = Math.round((sqScore / sqCurrentQuestions.length) * 100);
                body.innerHTML = `
                    <div style="text-align:center;padding:24px 10px;">
                        <div style="font-size:34px;margin-bottom:6px;">${pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '📚'}</div>
                        <div style="font-size:16px;font-weight:800;">نتيجتك: ${sqScore} من ${sqCurrentQuestions.length}</div>
                        <div style="font-size:12.5px;color:var(--text-3);margin-top:4px;">${pct}%</div>
                        <button class="btn-calc" style="margin-top:16px;" onclick="closeModal('summaryQuizModal')">تمام</button>
                    </div>`;
                return;
            }
            sqAnswered = false;
            const q = sqCurrentQuestions[sqCurrentIndex];
            body.innerHTML = `
                <div style="padding:4px 2px 14px;">
                    <div style="font-size:11px;color:var(--text-3);margin-bottom:8px;">سؤال ${sqCurrentIndex + 1} من ${sqCurrentQuestions.length}</div>
                    <div style="font-size:14px;font-weight:700;margin-bottom:12px;line-height:1.7;">${escapeHtml(q.q)}</div>
                    <div id="sqOptions" style="display:flex;flex-direction:column;gap:8px;"></div>
                    <div id="sqExplain" style="display:none;margin-top:10px;font-size:12px;color:var(--text-2);background:var(--bg-2);border-radius: var(--radius-xs);padding:8px 10px;line-height:1.7;"></div>
                    <button class="btn-calc" id="sqNextBtn" style="margin-top:14px;display:none;" onclick="sqNext()">${sqCurrentIndex === sqCurrentQuestions.length - 1 ? 'إنهاء' : 'التالي'}</button>
                </div>`;
            const optsEl = document.getElementById('sqOptions');
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn-calc';
                btn.style.cssText = 'background:var(--bg-2);color:var(--text-1);text-align:right;padding:10px 12px;font-size:12.5px;';
                btn.textContent = opt;
                btn.onclick = () => sqSelectOption(i);
                optsEl.appendChild(btn);
            });
        }

        function sqSelectOption(index) {
            if (sqAnswered) return;
            sqAnswered = true;
            const q = sqCurrentQuestions[sqCurrentIndex];
            if (index === q.correctIndex) sqScore++;
            Array.from(document.getElementById('sqOptions').children).forEach((b, i) => {
                b.disabled = true;
                if (i === q.correctIndex) { b.style.background = 'var(--success)'; b.style.color = '#fff'; }
                else if (i === index) { b.style.background = 'var(--danger)'; b.style.color = '#fff'; }
            });
            if (q.explanation) {
                const exp = document.getElementById('sqExplain');
                exp.style.display = 'block';
                exp.innerHTML = `<i class="fas fa-circle-info"></i> ${escapeHtml(q.explanation)}`;
            }
            document.getElementById('sqNextBtn').style.display = 'block';
        }

        function sqNext() {
            sqCurrentIndex++;
            renderSqQuestion();
        }

        // ====================== فيتشر 5: تلخيص تلقائي لملف ======================
        async function openSummaryTLDR(summaryId, topic) {
            document.getElementById('stTitle').textContent = `تلخيص: ${topic}`;
            const body = document.getElementById('stBody');
            body.innerHTML = '<div style="text-align:center;padding:30px 10px;color:var(--text-3);font-size:12.5px;"><span class="btn-spinner"></span><br><br>جارٍ تلخيص الملف...</div>';
            openModal('summaryTLDRModal');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/gemini/file`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ summaryId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'فشل التلخيص');
                let html = '<div style="padding:4px 2px;">';
                if (data.bulletPoints?.length) {
                    html += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--text-2);">أهم النقط:</div><ul style="margin:0 0 14px;padding-inline-start:20px;font-size:13px;line-height:2;">' +
                        data.bulletPoints.map(b => `<li>${escapeHtml(b)}</li>`).join('') + '</ul>';
                }
                if (data.keyTerms?.length) {
                    html += '<div style="font-size:12px;font-weight:700;margin-bottom:6px;color:var(--text-2);">مصطلحات مهمة:</div><div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                        data.keyTerms.map(t => `<span style="background:var(--bg-2);border-radius: var(--radius-lg);padding:4px 10px;font-size:11.5px;">${escapeHtml(t)}</span>`).join('') + '</div>';
                }
                html += '</div>';
                body.innerHTML = html || '<div style="text-align:center;padding:30px 10px;color:var(--text-3);font-size:12.5px;">مفيش تلخيص متاح</div>';
            } catch (e) {
                body.innerHTML = `<div style="text-align:center;padding:30px 10px;color:var(--danger);font-size:12.5px;">${escapeHtml(e.message || 'تعذر تلخيص الملف')}</div>`;
            }
        }

        async function downloadSharedSummary(id, displayName) {
            if (!schoolToken) { showToast('لازم تسجّل دخول School X الأول', 'error'); return; }
            const btn = document.getElementById(`dlBtn_${id}`);
            const wrap = document.getElementById(`dlProgressWrap_${id}`);
            const bar = document.getElementById(`dlProgressBar_${id}`);
            const text = document.getElementById(`dlProgressText_${id}`);
            const originalBtnHtml = btn ? btn.innerHTML : '';

            if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> جارٍ التحميل...'; }
            if (wrap) wrap.style.display = 'block';
            if (bar) bar.style.width = '0%';
            if (text) text.textContent = '0%';

            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/download/${id}`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) {
                    // نحاول نقرا رسالة الخطأ الحقيقية من السيرفر بدل ما نقول "تعذر" بشكل عام
                    let msg = 'تعذر تحميل الملف';
                    try { const errData = await res.json(); if (errData?.error) msg = errData.error; } catch (_) {}
                    throw new Error(msg);
                }

                const totalSize = Number(res.headers.get('Content-Length')) || 0;
                const cd = res.headers.get('Content-Disposition') || '';
                const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/);
                const fileName = match ? decodeURIComponent(match[1]) : (displayName || 'file');

                // قراءة الملف على دفعات عشان نحسب نسبة التقدم الحقيقية (مش ممكن بـ res.blob() العادي)
                const reader = res.body.getReader();
                const chunks = [];
                let received = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    if (totalSize && bar && text) {
                        const pct = Math.min(100, Math.round((received / totalSize) * 100));
                        bar.style.width = pct + '%';
                        text.textContent = pct + '%';
                    }
                }
                const blob = new Blob(chunks);
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl; a.download = fileName;
                document.body.appendChild(a); a.click(); a.remove();
                URL.revokeObjectURL(blobUrl);

                if (bar) bar.style.width = '100%';
                if (text) text.textContent = 'تم التحميل ✅';
                setTimeout(() => { if (wrap) wrap.style.display = 'none'; if (text) text.textContent = ''; }, 1500);
            } catch (e) {
                showToast(e.message || 'تعذر تحميل الملف', 'error');
                if (wrap) wrap.style.display = 'none';
                if (text) text.textContent = '';
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; }
            }
        }

        // حذف ملف من المكتبة المشتركة — الأدمن بس هو اللي بيشوف زرار المسح ده،
        // وبيقدر يمسح أي ملف بغض النظر عن حالته (معتمد/مرفوض/تحت المراجعة)،
        // لأن /api/shared-summaries/:id على السيرفر بتسمح للأدمن بمسح أي ملف
        // في أي وقت (على عكس الطالب اللي بيقدر يمسح بس ملفه هو ولو لسه pending).
        async function deleteLibraryFile(id) {
            if (!schoolToken) { showToast('لازم تسجّل دخول School X الأول', 'error'); return; }
            if (!confirm('متأكد إنك عايز تمسح الملف ده نهائيًا من المكتبة؟')) return;
            const row = document.getElementById(`libItem_${id}`);
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) {
                    let msg = 'تعذر حذف الملف';
                    try { const errData = await res.json(); if (errData?.error) msg = errData.error; } catch (_) {}
                    throw new Error(msg);
                }
                if (row) row.remove();
                delete filePreviewRegistry[id];
                showToast('تم حذف الملف من المكتبة', 'success');
            } catch (e) {
                showToast(e.message || 'تعذر حذف الملف', 'error');
            }
        }

        // رفع الملف على R2 بـ XMLHttpRequest بدل fetch — عشان fetch مالوش دعم موثوق
        // لتتبع نسبة تقدم الرفع (upload progress) في كل المتصفحات، وxhr.upload.onprogress بييجي جاهز.
        function uploadFileWithProgress(url, file, onProgress, contentType) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url);
                // لازم نبعت نفس الـ Content-Type بالظبط اللي السيرفر وقّعه في الرابط،
                // وإلا التوقيع (signature) هيفشل ويرجع خطأ.
                if (contentType) xhr.setRequestHeader('Content-Type', contentType);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve();
                    else reject(new Error('فشل رفع الملف على التخزين (كود ' + xhr.status + ')'));
                };
                xhr.onerror = () => reject(new Error('تعذر الرفع مباشرة على التخزين — الاحتمال الأكبر إن إعدادات CORS في باكت R2 مش سامحة بطلبات PUT من دومين الموقع ده (افتح Console في المتصفح هتلاقي سطر أحمر بيقول CORS policy لو ده السبب)'));
                xhr.send(file);
            });
        }

        async function uploadSharedSummary() {
            const fileInput = document.getElementById('summaryFileInput');
            const topic = document.getElementById('summaryTopicInput').value.trim();
            const subject = document.getElementById('summarySubjectInput').value.trim();
            const grade = document.getElementById('summaryGradeSelect').value;
            const statusEl = document.getElementById('summaryUploadStatus');
            const btn = document.getElementById('summaryUploadBtn');
            const wrap = document.getElementById('summaryUploadProgressWrap');
            const bar = document.getElementById('summaryUploadProgressBar');
            const progText = document.getElementById('summaryUploadProgressText');

            // statusEl عنده class="calc-result" واللي افتراضيًا display:none، ومحتاج
            // class="show" عشان يظهر (زي أي عنصر calc-result تاني في الموقع). ده
            // اللي كان بيخلي رسائل الخطأ/النجاح كلها تتكتب فعليًا بس متبقاش ظاهرة
            // على الشاشة — يعني دوسة "رفع" كانت بتبان وكأنها "مش بتعمل حاجة".
            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };

            if (!schoolToken) { showStatus('<span style="color:var(--danger);">لازم تسجّل دخول School X الأول</span>'); return; }
            const file = fileInput.files[0];
            if (!file) { showStatus('<span style="color:var(--danger);">اختار ملف الأول</span>'); return; }
            if (!topic) { showStatus('<span style="color:var(--danger);">اكتب موضوع الملف</span>'); return; }
            if (!subject) { showStatus('<span style="color:var(--danger);">اكتب اسم المادة</span>'); return; }
            if (file.size > 500 * 1024 * 1024) { showStatus('<span style="color:var(--danger);">حجم الملف كبير جدًا</span>'); return; }

            btn.disabled = true;
            statusEl.innerHTML = '';
            statusEl.classList.remove('show');
            wrap.style.display = 'block';
            bar.style.width = '0%';
            progText.textContent = 'جارٍ التحضير...';
            try {
                // 1. هات رابط رفع موقّع من R2 مباشرة
                const urlRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/upload-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ fileName: file.name, grade, subject })
                });
                if (!urlRes.ok) throw new Error('تعذر تجهيز رابط الرفع');
                const { path, uploadUrl, publicUrl, contentType } = await urlRes.json();

                // 2. ارفع الملف مباشرة على R2 مع تتبع نسبة التقدم (وبنفس الـ Content-Type اللي السيرفر وقّعه)
                await uploadFileWithProgress(uploadUrl, file, (pct) => {
                    bar.style.width = pct + '%';
                    progText.textContent = `جارٍ الرفع... ${pct}%`;
                }, contentType);

                progText.textContent = 'جارٍ حفظ البيانات...';

                // 3. سجّل معلومات الملف في الداتابيز (بيتسجل status: pending تلقائي على السيرفر)
                const saveRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/shared-summaries/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({
                        name: file.name, url: publicUrl, publicId: path,
                        size: file.size, type: file.name.split('.').pop().toLowerCase(),
                        topic, subject, grade
                    })
                });
                if (!saveRes.ok) {
                    let msg = 'تعذر حفظ معلومات الملف';
                    try { const errData = await saveRes.json(); if (errData?.error) msg = errData.error; } catch (_) {}
                    throw new Error(msg);
                }

                bar.style.width = '100%';
                progText.textContent = 'تم الرفع بنجاح ✅';
                showStatus('<span style="color:var(--success);">تم رفع الملف بنجاح، هيتم مراجعة محتواه لكي يظهر على الصفحة من قبل الأدمن ✅</span>');
                fileInput.value = '';
                document.getElementById('summaryTopicInput').value = '';
                document.getElementById('summarySubjectInput').value = '';
                showToast('تم الرفع، هيتم مراجعته من الأدمن قبل ما يظهر', 'success');
                setTimeout(() => { wrap.style.display = 'none'; progText.textContent = ''; bar.style.width = '0%'; }, 2000);
            } catch (e) {
                showStatus(`<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر رفع الملف، حاول تاني')}</span>`);
                wrap.style.display = 'none';
                progText.textContent = '';
            } finally {
                btn.disabled = false;
            }
        }

        // ====================== فيديوهات شرح المنصة (Tutorial Videos) ======================
        let tvAllVideos = [];
        let currentTvPlayerId = null;
        let tvSortMode = 'newest'; // 'newest' | 'views'
        const TV_NEW_SEEN_KEY = 'tvTutorialFeatureSeen';

        // مفيش داعي نتحمّل زحمة الأرقام الطويلة في الكروت — 1200 → 1.2K
        function formatCompactNumber(n) {
            const num = Number(n) || 0;
            if (num < 1000) return String(num);
            if (num < 1000000) return (num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0) + 'K';
            return (num / 1000000).toFixed(1) + 'M';
        }

        // نقطة "جديد" على زرار فيديوهات الشرح (في الشريط وفي السايدبار) — بتظهر لحد
        // ما حد يفتح القسم أول مرة وبعدين بتختفي للأبد (localStorage) زي نقطة
        // الحسابات الموثقة بالظبط.
        function maybeShowTvNewDot() {
            if (localStorage.getItem(TV_NEW_SEEN_KEY) === '1') return;
            const dot1 = document.getElementById('tvNewDot');
            const dot2 = document.getElementById('tvNewDotSidebar');
            if (dot1) dot1.style.display = 'block';
            if (dot2) dot2.style.display = 'block';
        }
        function dismissTvNewDot() {
            localStorage.setItem(TV_NEW_SEEN_KEY, '1');
            const dot1 = document.getElementById('tvNewDot');
            const dot2 = document.getElementById('tvNewDotSidebar');
            if (dot1) dot1.style.display = 'none';
            if (dot2) dot2.style.display = 'none';
        }

        // mm:ss (أو h:mm:ss لو الفيديو أطول من ساعة)
        function formatVideoDuration(totalSeconds) {
            const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;
            const pad = (n) => String(n).padStart(2, '0');
            return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
        }

        // "من ساعتين" / "من 3 أيام" ... تاريخ نسبي بسيط بالعربي
        function formatRelativeArabic(dateStr) {
            const diffMs = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diffMs / 60000);
            if (mins < 1) return 'دلوقتي';
            if (mins < 60) return `من ${mins} دقيقة`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `من ${hours} ساعة`;
            const days = Math.floor(hours / 24);
            if (days < 30) return `من ${days} يوم`;
            const months = Math.floor(days / 30);
            if (months < 12) return `من ${months} شهر`;
            return `من ${Math.floor(months / 12)} سنة`;
        }

        function renderTvSkeletons() {
            const grid = document.getElementById('tvGrid');
            grid.innerHTML = Array.from({ length: 6 }).map(() => `
                <div class="tv-skeleton-card">
                    <div class="tv-skeleton-thumb"></div>
                    <div class="tv-skeleton-body">
                        <div class="skeleton-line long"></div>
                        <div class="skeleton-line short"></div>
                    </div>
                </div>
            `).join('');
        }

        function buildTvCardHtml(v, index) {
            const isAdmin = schoolUser?.type === 'admin';
            const thumb = v.thumbnailUrl
                ? `<img src="${v.thumbnailUrl}" alt="${escapeAttr(v.title)}" loading="lazy" onload="this.classList.add('loaded')">`
                : '';
            return `
                <div class="tv-thumb">
                    ${thumb}
                    <div class="tv-thumb-play"><i class="fas fa-play"></i></div>
                    ${v.duration ? `<div class="tv-duration">${formatVideoDuration(v.duration)}</div>` : ''}
                    ${isAdmin ? `<button class="tv-delete-btn" title="حذف الفيديو" onclick="event.stopPropagation(); deleteTutorialVideo('${v._id}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div class="tv-body">
                    <div class="tv-title">${escapeHtml(v.title)}</div>
                    <div class="tv-meta">
                        <span><i class="fas fa-user-pen"></i> ${escapeHtml(v.creatorName || '')}</span>
                        <span>·</span>
                        <span class="tv-views-chip"><i class="fas fa-eye"></i> ${formatCompactNumber(v.views || 0)}</span>
                        <span>·</span>
                        <span>${formatRelativeArabic(v.createdAt)}</span>
                    </div>
                </div>
            `;
        }

        function sortTvVideos(videos) {
            const list = [...videos];
            if (tvSortMode === 'views') list.sort((a, b) => (b.views || 0) - (a.views || 0));
            else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return list;
        }

        function renderTvGrid(videos) {
            const grid = document.getElementById('tvGrid');
            const emptyState = document.getElementById('tvEmptyState');
            const noResults = document.getElementById('tvNoResults');
            grid.innerHTML = '';
            emptyState.style.display = 'none';
            noResults.style.display = 'none';

            document.getElementById('tvCountText').textContent = tvAllVideos.length ? `${tvAllVideos.length} فيديو` : '';

            if (!tvAllVideos.length) { emptyState.style.display = 'block'; return; }
            if (!videos.length) { noResults.style.display = 'block'; return; }

            const sorted = sortTvVideos(videos);
            sorted.forEach((v, i) => {
                const card = document.createElement('div');
                card.className = 'tv-card';
                card.style.animationDelay = `${Math.min(i, 10) * 35}ms`;
                card.innerHTML = buildTvCardHtml(v, i);
                card.onclick = () => openTutorialVideoPlayer(v._id);
                grid.appendChild(card);
            });
        }

        function setTvSort(mode) {
            tvSortMode = mode;
            document.getElementById('tvSortNewest').classList.toggle('active', mode === 'newest');
            document.getElementById('tvSortViews').classList.toggle('active', mode === 'views');
            filterTutorialVideos(document.getElementById('tvSearchInput').value);
        }

        function filterTutorialVideos(query) {
            const q = (query || '').trim().toLowerCase();
            if (!q) { renderTvGrid(tvAllVideos); return; }
            const filtered = tvAllVideos.filter(v =>
                (v.title || '').toLowerCase().includes(q) ||
                (v.creatorName || '').toLowerCase().includes(q) ||
                (v.description || '').toLowerCase().includes(q)
            );
            renderTvGrid(filtered);
        }

        async function loadTutorialVideos() {
            dismissTvNewDot();
            document.getElementById('tvUploadOpenBtn').style.display = schoolUser?.type === 'admin' ? '' : 'none';
            if (!schoolToken) {
                document.getElementById('tvGrid').innerHTML = '';
                document.getElementById('tvCountText').textContent = '';
                document.getElementById('tvEmptyState').style.display = 'none';
                document.getElementById('tvNoResults').innerHTML = 'لازم تسجّل دخول School X الأول عشان تتفرج على الفيديوهات';
                document.getElementById('tvNoResults').style.display = 'block';
                return;
            }
            renderTvSkeletons();
            document.getElementById('tvEmptyState').style.display = 'none';
            document.getElementById('tvNoResults').style.display = 'none';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                tvAllVideos = await res.json();
                filterTutorialVideos(document.getElementById('tvSearchInput').value);
            } catch (e) {
                document.getElementById('tvGrid').innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:24px 10px;color:var(--danger);font-size:12px;">
                        تعذر تحميل فيديوهات الشرح — تأكد من الاتصال بالنت
                        <br>
                        <button class="btn-calc" style="margin-top:12px;width:auto;padding:7px 18px;" onclick="loadTutorialVideos()"><i class="fas fa-rotate-right"></i> إعادة المحاولة</button>
                    </div>`;
            }
        }

        function tvPlayerEscHandler(e) { if (e.key === 'Escape') closeTutorialVideoPlayer(); }

        function openTutorialVideoPlayer(id) {
            const v = tvAllVideos.find(x => x._id === id);
            if (!v) return;
            currentTvPlayerId = id;
            document.getElementById('tvPlayerVideo').src = v.url;
            document.getElementById('tvPlayerTitle').textContent = v.title;
            document.getElementById('tvPlayerCreator').textContent = v.creatorName || '';
            document.getElementById('tvPlayerViews').textContent = formatCompactNumber((v.views || 0) + 1);
            const descEl = document.getElementById('tvPlayerDesc');
            descEl.textContent = v.description || '';
            descEl.style.display = v.description ? 'block' : 'none';
            document.getElementById('tvPlayerDownload').href = v.url;
            document.getElementById('tvPlayerDownload').download = `${v.title || 'video'}.mp4`;
            document.getElementById('tvPlayerDeleteBtn').style.display = schoolUser?.type === 'admin' ? '' : 'none';
            openModal('videoPlayerModal');
            document.addEventListener('keydown', tvPlayerEscHandler);

            // تحديث عدد المشاهدات (best effort — منستناش النتيجة عشان مانأخرش فتح المشغّل)
            fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos/${id}/view`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${schoolToken}` }
            }).then(() => { v.views = (v.views || 0) + 1; }).catch(() => {});
        }

        function closeTutorialVideoPlayer() {
            const player = document.getElementById('tvPlayerVideo');
            player.pause();
            player.removeAttribute('src');
            player.load();
            closeModal('videoPlayerModal');
            document.removeEventListener('keydown', tvPlayerEscHandler);
        }

        async function deleteTutorialVideo(id) {
            if (!schoolToken) return;
            if (!confirm('متأكد إنك عايز تمسح الفيديو ده نهائيًا؟')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) {
                    let msg = 'تعذر حذف الفيديو';
                    try { const errData = await res.json(); if (errData?.error) msg = errData.error; } catch (_) {}
                    throw new Error(msg);
                }
                tvAllVideos = tvAllVideos.filter(v => v._id !== id);
                if (currentTvPlayerId === id) closeTutorialVideoPlayer();
                filterTutorialVideos(document.getElementById('tvSearchInput').value);
                showToast('تم حذف الفيديو', 'success');
            } catch (e) {
                showToast(e.message || 'تعذر حذف الفيديو', 'error');
            }
        }

        // بتاخد أول فريم من الفيديو وتحوّله لصورة JPEG (Blob) + مدة الفيديو بالثواني —
        // كله جوه المتصفح من غير أي مكتبة خارجية (video + canvas بس). لو فشلت لأي
        // سبب (متصفح قديم مثلًا)، بترجع thumbnailBlob: null والفيديو لسه بيترفع عادي
        // (هيظهر بخلفية متدرّجة بدل الصورة المصغّرة في الكارت).
        function generateVideoThumbnail(file) {
            return new Promise((resolve) => {
                try {
                    const videoEl = document.createElement('video');
                    videoEl.muted = true;
                    videoEl.playsInline = true;
                    videoEl.preload = 'metadata';
                    videoEl.src = URL.createObjectURL(file);

                    const cleanup = () => URL.revokeObjectURL(videoEl.src);
                    const fail = () => { cleanup(); resolve({ thumbnailBlob: null, duration: 0 }); };

                    videoEl.onloadedmetadata = () => {
                        // ثانية واحدة جوه الفيديو (مش الفريم الأول اللي غالبًا بيكون أسود) —
                        // أو نص المدة لو الفيديو أقصر من ثانيتين
                        videoEl.currentTime = Math.min(1, (videoEl.duration || 2) / 2);
                    };
                    videoEl.onseeked = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = videoEl.videoWidth || 320;
                            canvas.height = videoEl.videoHeight || 180;
                            canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                            canvas.toBlob((blob) => {
                                cleanup();
                                resolve({ thumbnailBlob: blob, duration: videoEl.duration || 0 });
                            }, 'image/jpeg', 0.82);
                        } catch (e) { fail(); }
                    };
                    videoEl.onerror = fail;
                    setTimeout(fail, 8000); // مهلة أمان لو الفيديو تقيل أو فيه مشكلة
                } catch (e) {
                    resolve({ thumbnailBlob: null, duration: 0 });
                }
            });
        }

        // ====================== التحكم الإداري في Deep Thinking ======================
        let dtaLocalEnabled = true; // حالة الزرار محليًا قبل الحفظ (عشان يستجيب فورًا وهو بيدوس)

        function toggleDtaEnabled() {
            dtaLocalEnabled = !dtaLocalEnabled;
            document.getElementById('dtaEnabledSwitch').classList.toggle('active', dtaLocalEnabled);
        }

        async function loadDeepThinkAdminConfig() {
            const section = document.getElementById('deepThinkAdminSection');
            if (!section) return;
            if (schoolUser?.type !== 'admin') { section.style.display = 'none'; return; }
            section.style.display = '';
            if (!schoolToken) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/deep-think/admin-config`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) return;
                const cfg = await res.json();
                dtaLocalEnabled = !!cfg.enabled;
                document.getElementById('dtaEnabledSwitch').classList.toggle('active', dtaLocalEnabled);
                document.getElementById('dtaDailyLimitInput').value = cfg.dailyLimitPerStudent;
            } catch (e) { /* لو فشل الجلب، الأدمن لسه يقدر يحفظ إعدادات جديدة عادي */ }
        }

        async function saveDeepThinkAdminConfig() {
            const statusEl = document.getElementById('dtaSaveStatus');
            const limitVal = document.getElementById('dtaDailyLimitInput').value;
            const limit = limitVal === '' ? undefined : Number(limitVal);
            if (limit !== undefined && (!Number.isFinite(limit) || limit < 0)) {
                statusEl.innerHTML = '<span style="color:var(--danger);">الحد اليومي لازم يكون رقم صحيح 0 أو أكبر</span>';
                statusEl.classList.add('show');
                return;
            }
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/deep-think/admin-config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ enabled: dtaLocalEnabled, dailyLimitPerStudent: limit })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر الحفظ');
                statusEl.innerHTML = '<span style="color:var(--success);">تم حفظ الإعدادات ✅</span>';
                statusEl.classList.add('show');
                showToast('تم تحديث إعدادات Deep Thinking', 'success');
            } catch (e) {
                statusEl.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر الحفظ')}</span>`;
                statusEl.classList.add('show');
            }
        }

        async function uploadTutorialVideo() {
            const fileInput = document.getElementById('tvFileInput');
            const title = document.getElementById('tvTitleInput').value.trim();
            const description = document.getElementById('tvDescInput').value.trim();
            const creatorName = document.getElementById('tvCreatorInput').value.trim();
            const statusEl = document.getElementById('tvUploadStatus');
            const btn = document.getElementById('tvUploadBtn');
            const wrap = document.getElementById('tvUploadProgressWrap');
            const bar = document.getElementById('tvUploadProgressBar');
            const progText = document.getElementById('tvUploadProgressText');

            const showStatus = (html) => { statusEl.innerHTML = html; statusEl.classList.add('show'); };

            // حماية إضافية: حتى لو حد وصل للفورم ده بأي طريقة، السيرفر برضه هيرفض
            // أي حد مش أدمن (isAdmin middleware)، لكن نتأكد من هنا كمان قبل ما نتعب
            // في رفع فيديو هيترفض في الآخر.
            if (schoolUser?.type !== 'admin') { showStatus('<span style="color:var(--danger);">رفع فيديوهات الشرح متاح للأدمن بس</span>'); return; }
            if (!schoolToken) { showStatus('<span style="color:var(--danger);">لازم تسجّل دخول School X الأول</span>'); return; }
            const file = fileInput.files[0];
            if (!file) { showStatus('<span style="color:var(--danger);">اختار ملف الفيديو الأول</span>'); return; }
            if (!title) { showStatus('<span style="color:var(--danger);">اكتب عنوان الفيديو</span>'); return; }
            if (!creatorName) { showStatus('<span style="color:var(--danger);">اكتب اسم اللي عمل الفيديو</span>'); return; }
            if (file.size > 500 * 1024 * 1024) { showStatus('<span style="color:var(--danger);">حجم الفيديو كبير جدًا (الحد الأقصى 500 ميجا)</span>'); return; }

            btn.disabled = true;
            statusEl.innerHTML = '';
            statusEl.classList.remove('show');
            wrap.style.display = 'block';
            bar.style.width = '0%';
            progText.textContent = 'جارٍ تجهيز الصورة المصغّرة...';
            try {
                // 0. جهّز ثمبنيل (أول فريم) ومدة الفيديو جوه المتصفح — best effort
                const { thumbnailBlob, duration } = await generateVideoThumbnail(file);

                // 1. رابط رفع موقّع للفيديو نفسه
                progText.textContent = 'جارٍ التحضير...';
                const urlRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos/upload-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ fileName: file.name, fileType: file.type || 'video/mp4' })
                });
                if (!urlRes.ok) throw new Error('تعذر تجهيز رابط الرفع');
                const { path, uploadUrl, publicUrl, contentType } = await urlRes.json();

                // 2. ارفع الفيديو مباشرة على R2 مع تتبع نسبة التقدم
                await uploadFileWithProgress(uploadUrl, file, (pct) => {
                    bar.style.width = pct + '%';
                    progText.textContent = `جارٍ رفع الفيديو... ${pct}%`;
                }, contentType);

                // 3. لو نجح توليد الثمبنيل، ارفعه هو كمان على R2 (اختياري تمامًا)
                let thumbnailUrl = '', thumbnailPublicId = '';
                if (thumbnailBlob) {
                    try {
                        progText.textContent = 'جارٍ رفع الصورة المصغّرة...';
                        const thumbUrlRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos/upload-url`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                            body: JSON.stringify({ fileName: `${Date.now()}-thumb.jpg`, fileType: 'image/jpeg', kind: 'thumbnail' })
                        });
                        if (thumbUrlRes.ok) {
                            const thumbData = await thumbUrlRes.json();
                            await uploadFileWithProgress(thumbData.uploadUrl, thumbnailBlob, null, thumbData.contentType);
                            thumbnailUrl = thumbData.publicUrl;
                            thumbnailPublicId = thumbData.path;
                        }
                    } catch (e) { /* الثمبنيل مش أساسي — تجاهل أي فشل هنا */ }
                }

                // 4. سجّل بيانات الفيديو في الداتابيز
                progText.textContent = 'جارٍ حفظ البيانات...';
                const saveRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/tutorial-videos/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({
                        title, description, creatorName,
                        url: publicUrl, publicId: path,
                        size: file.size, mimeType: file.type || 'video/mp4', duration,
                        thumbnailUrl, thumbnailPublicId
                    })
                });
                if (!saveRes.ok) {
                    let msg = 'تعذر حفظ بيانات الفيديو';
                    try { const errData = await saveRes.json(); if (errData?.error) msg = errData.error; } catch (_) {}
                    throw new Error(msg);
                }
                const { video } = await saveRes.json();

                bar.style.width = '100%';
                progText.textContent = 'تم الرفع بنجاح ✅';
                showStatus('<span style="color:var(--success);">تم رفع الفيديو بنجاح ✅</span>');
                fileInput.value = '';
                document.getElementById('tvTitleInput').value = '';
                document.getElementById('tvDescInput').value = '';
                document.getElementById('tvCreatorInput').value = '';
                showToast('تم رفع الفيديو بنجاح', 'success');

                tvAllVideos.unshift(video);
                filterTutorialVideos(document.getElementById('tvSearchInput').value);

                setTimeout(() => {
                    wrap.style.display = 'none'; progText.textContent = ''; bar.style.width = '0%';
                    statusEl.classList.remove('show');
                    closeModal('uploadTutorialVideoModal');
                }, 1200);
            } catch (e) {
                showStatus(`<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر رفع الفيديو، حاول تاني')}</span>`);
                wrap.style.display = 'none';
                progText.textContent = '';
            } finally {
                btn.disabled = false;
            }
        }

        async function startGroupChatWith(memberUsername) {
            document.getElementById('mentionSuggestions').style.display = 'none';
            document.getElementById('mentionSearchInput').value = '';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ memberUsername })
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                openGroupChatRoom(data.chatId, memberUsername, memberUsername, data.status || 'accepted', data.requestedBy || null);
                loadMyGroupChats();
            } catch (e) {
                showToast('تعذر إنشاء المحادثة — endpoint غرف المذاكرة لسه مش متاح على سيرفر School X', 'error');
            }
        }

        async function loadMyGroupChats() {
            const listEl = document.getElementById('groupChatsList');
            if (!schoolToken) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">لازم تسجّل دخول School X الأول</div>';
                return;
            }
            listEl.innerHTML = Array.from({ length: 4 }).map(() =>
                `<div class="skeleton-row"><div class="skeleton-line long"></div><div class="skeleton-line short"></div></div>`
            ).join('');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const chatsList = data.chats || [];
                if (!chatsList.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش محادثات لسه — دور على زميلك بـ @ فوق</div>';
                    return;
                }
                listEl.innerHTML = '';
                chatsList.forEach(c => {
                    const otherName = (c.memberUsernames || []).filter(u => u !== schoolUser?.username).join(', ');
                    const isPending = (c.status || 'accepted') === 'pending';
                    const iAmRequester = isPending && c.requestedBy === schoolUser?.username;
                    const row = document.createElement('div');
                    row.style.cssText = 'padding:10px 12px;border:1px solid var(--border);border-radius: var(--radius-sm);cursor:pointer;display:flex;justify-content:space-between;align-items:center;';
                    // لو أنا اللي بدأت الطلب: بنوريه "مستني الموافقة". لو أنا المُستقبِل
                    // وطلب جديد مستني ردي: بنوريه بلون تنبيه عشان يلاحظه ويفتح الغرفة يقبل/يرفض.
                    const subtitle = isPending
                        ? (iAmRequester ? '⏳ في انتظار موافقة الطرف التاني' : '📩 طلب محادثة جديد — افتح عشان تقبل أو ترفض')
                        : (c.lastMessage || 'ابدأ المذاكرة...');
                    const subtitleColor = (isPending && !iAmRequester) ? 'var(--warning, #f59e0b)' : 'var(--text-3)';
                    row.innerHTML = `<div><div style="font-size:13px;font-weight:700;">${escapeHtml(otherName)}</div><div style="font-size:11px;color:${subtitleColor};margin-top:2px;">${escapeHtml(subtitle)}</div></div><i class="fas fa-chevron-left" style="color:var(--text-3);"></i>`;
                    row.onclick = () => openGroupChatRoom(c.id, otherName, otherName, c.status || 'accepted', c.requestedBy || null);
                    listEl.appendChild(row);
                });
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل المحادثات — endpoint غرف المذاكرة لسه مش متاح على سيرفر School X</div>';
            }
        }

        function openGroupChatRoom(chatId, title, otherUsername, status, requestedBy) {
            activeGroupChatId = chatId;
            currentGroupChatOtherUsername = otherUsername || title || null;
            activeGroupChatStatus = status || 'accepted';
            activeGroupChatRequestedBy = requestedBy || null;
            lastKnownReadBy = {};
            document.getElementById('groupChatRoomTitle').textContent = title || 'غرفة مذاكرة';
            document.getElementById('groupChatMessages').innerHTML = '';
            document.getElementById('groupChatInput').value = '';
            removeGroupPendingImage();
            updateGroupChatSendButton();
            applyGroupChatTheme(getSavedGroupChatTheme());
            renderGroupChatRequestBanner();
            closeModal('groupChatListModal');
            openModal('groupChatRoomModal');
            loadGroupChatMessages(true);
            if (groupChatPollTimer) clearInterval(groupChatPollTimer);
            groupChatPollTimer = setInterval(() => loadGroupChatMessages(false), 2000);
        }

        function closeGroupChatRoom() {
            closeModal('groupChatRoomModal');
            document.getElementById('groupChatThemeMenu').classList.remove('active');
            if (groupChatPollTimer) { clearInterval(groupChatPollTimer); groupChatPollTimer = null; }
            cancelGroupVoiceRecording(); // لو الطالب قفل الغرفة وهو لسه بيسجّل، نوقف الميكروفون ونلغي بهدوء
            activeGroupChatId = null;
            currentGroupChatOtherUsername = null;
            activeGroupChatStatus = 'accepted';
            activeGroupChatRequestedBy = null;
            lastKnownReadBy = {};
            updateTypingIndicator([]);
            const statusEl = document.getElementById('groupChatOnlineStatus');
            if (statusEl) statusEl.innerHTML = '';
        }

        // بيبني/يحدّث بانر "طلب محادثة" فوق صندوق الكتابة، وبيتحكم في تفعيل/تعطيل
        // الكتابة حسب حالة الغرفة: لو الطلب لسه pending وأنا مش اللي بدأه، لازم
        // أقبل أو أرفض الأول قبل ما أقدر أبعت أي رسالة.
        function renderGroupChatRequestBanner() {
            let banner = document.getElementById('groupChatRequestBanner');
            const inputRow = document.getElementById('groupChatInputRow');
            const isPending = activeGroupChatStatus === 'pending';
            const iAmRequester = isPending && activeGroupChatRequestedBy === schoolUser?.username;
            const iMustDecide = isPending && !iAmRequester;

            if (!banner) return; // العنصر لازم يكون متعرّف في الـ HTML

            if (iMustDecide) {
                banner.style.display = 'flex';
                banner.innerHTML = `
                    <span style="flex:1;font-size:12px;">📩 ${escapeHtml(currentGroupChatOtherUsername || 'زميل')} عايز يبدأ محادثة معاك</span>
                    <button class="btn-calc" style="width:auto;padding:6px 14px;font-size:12px;" onclick="acceptGroupChatRequest()">قبول</button>
                    <button class="action-btn" style="width:auto;padding:6px 14px;font-size:12px;color:var(--danger);" onclick="declineGroupChatRequest()">رفض</button>
                `;
            } else if (isPending && iAmRequester) {
                banner.style.display = 'flex';
                banner.innerHTML = `<span style="flex:1;font-size:12px;color:var(--text-3);">⏳ في انتظار موافقة الطرف التاني على المحادثة</span>`;
            } else {
                banner.style.display = 'none';
                banner.innerHTML = '';
            }

            // تعطيل الكتابة والإرسال والتسجيل الصوتي لحد ما يتحدد قرار الطلب
            if (inputRow) inputRow.style.opacity = iMustDecide ? '0.5' : '1';
            ['groupChatInput', 'groupChatSendBtn', 'groupChatMicBtn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = iMustDecide;
            });
        }

        async function acceptGroupChatRequest() {
            if (!activeGroupChatId) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/accept`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                activeGroupChatStatus = 'accepted';
                renderGroupChatRequestBanner();
                loadMyGroupChats();
                showToast('اتقبل الطلب، اتفضل ابدأ المذاكرة 🎉', 'success');
            } catch (e) {
                showToast('تعذر قبول الطلب', 'error');
            }
        }

        async function declineGroupChatRequest() {
            if (!activeGroupChatId) return;
            if (!confirm('متأكد إنك عايز ترفض طلب المحادثة ده؟')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/decline`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                showToast('اترفض الطلب', 'success');
                closeGroupChatRoom();
                loadMyGroupChats();
            } catch (e) {
                showToast('تعذر رفض الطلب', 'error');
            }
        }

        // ====================== ثيمات غرفة المذاكرة ======================
        const GROUP_CHAT_THEME_KEY = 'groupChatThemeV1';
        const GROUP_CHAT_THEME_CLASSES = ['gc-theme-whatsapp', 'gc-theme-midnight', 'gc-theme-sunset', 'gc-theme-ocean'];

        function getSavedGroupChatTheme() {
            try { return localStorage.getItem(GROUP_CHAT_THEME_KEY) || 'default'; } catch (e) { return 'default'; }
        }

        function applyGroupChatTheme(theme) {
            const modal = document.getElementById('groupChatRoomModal');
            if (!modal) return;
            modal.classList.remove(...GROUP_CHAT_THEME_CLASSES);
            if (theme && theme !== 'default') modal.classList.add(`gc-theme-${theme}`);
        }

        function setGroupChatTheme(theme) {
            applyGroupChatTheme(theme);
            try { localStorage.setItem(GROUP_CHAT_THEME_KEY, theme); } catch (e) { /* localStorage ممكن يكون متعطّل، مش مشكلة */ }
            document.getElementById('groupChatThemeMenu').classList.remove('active');
            showToast('اتغيّر شكل الشات', 'success');
        }

        function toggleGroupChatThemeMenu() {
            document.getElementById('groupChatThemeMenu').classList.toggle('active');
        }

        // قفل قائمة الثيمات لو المستخدم داس بره منها
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('groupChatThemeMenu');
            const btn = e.target.closest('[aria-label="ثيمات الشات"]');
            if (!menu || !menu.classList.contains('active')) return;
            if (!menu.contains(e.target) && !btn) menu.classList.remove('active');
        });

        let lastGroupMsgAt = 0;
        let lastKnownReadBy = {};
        let currentGroupChatOtherUsername = null;
        let notifyAudioCtx = null;
        function playGroupChatNotifySound() {
            try {
                if (!notifyAudioCtx) notifyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const ctx = notifyAudioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.0001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.26);
            } catch (e) { /* المتصفح مانعش الصوت (autoplay policy) قبل أول تفاعل، مش مشكلة */ }
        }
        function formatMsgTime(ts) {
            return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }

        const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

        // ====================== عارض الصور بملء الشاشة (Lightbox) ======================
        // بديل window.open(dataURL) اللي المتصفحات الحديثة بترفضه كـ navigation مباشر
        // لـ data: URL وبترجع صفحة سودة فاضية بدل الصورة — العرض هنا داخل نفس الصفحة.
        function openImageLightbox(src) {
            const modal = document.getElementById('imageLightbox');
            const img = document.getElementById('imageLightboxImg');
            if (!modal || !img) { window.open(src, '_blank'); return; } // fallback نادر جدًا لو الـ HTML مش موجود لأي سبب
            img.src = src;
            modal.style.display = 'flex';
            document.addEventListener('keydown', imageLightboxEscHandler);
        }
        function closeImageLightbox() {
            const modal = document.getElementById('imageLightbox');
            if (modal) modal.style.display = 'none';
            document.removeEventListener('keydown', imageLightboxEscHandler);
        }
        function imageLightboxEscHandler(e) { if (e.key === 'Escape') closeImageLightbox(); }

        // مشغّل رسالة صوتية بسيط (زر تشغيل/إيقاف + شريط تقدّم + المدة) — زي واتساب،
        // مبني على عنصر <audio> حقيقي بس بواجهة مخصصة بدل الكونترولز الافتراضية.
        function buildVoiceMessagePlayer(src, durationSeconds, isMe) {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;align-items:center;gap:10px;min-width:190px;padding:2px 4px;';

            const audio = new Audio(src);
            const playBtn = document.createElement('button');
            playBtn.type = 'button';
            playBtn.style.cssText = `width:34px;height:34px;border-radius:50%;border:none;flex-shrink:0;cursor:pointer;background:${isMe ? 'rgba(255,255,255,.22)' : 'var(--bg-3)'};color:inherit;display:flex;align-items:center;justify-content:center;font-size:13px;`;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';

            const barOuter = document.createElement('div');
            barOuter.style.cssText = `flex:1;height:4px;border-radius:4px;background:${isMe ? 'rgba(255,255,255,.3)' : 'var(--border)'};overflow:hidden;cursor:pointer;`;
            const barInner = document.createElement('div');
            barInner.style.cssText = `height:100%;width:0%;background:${isMe ? '#fff' : 'var(--accent-2)'};transition:width .1s linear;`;
            barOuter.appendChild(barInner);

            const timeLabel = document.createElement('span');
            timeLabel.style.cssText = 'font-size:10.5px;font-variant-numeric:tabular-nums;flex-shrink:0;min-width:32px;';
            const fmtTime = (s) => { s = Math.max(0, Math.round(s || 0)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
            timeLabel.textContent = fmtTime(durationSeconds);

            playBtn.onclick = () => {
                // نوقف أي رسالة صوتية تانية شغالة دلوقتي — زي واتساب بالظبط (تشغيل واحد بس في المرة)
                document.querySelectorAll('audio[data-group-voice="1"]').forEach(a => { if (a !== audio) a.pause(); });
                if (audio.paused) audio.play().catch(() => showToast('تعذر تشغيل الرسالة الصوتية', 'error'));
                else audio.pause();
            };
            audio.dataset.groupVoice = '1';
            audio.addEventListener('play', () => { playBtn.innerHTML = '<i class="fas fa-pause"></i>'; });
            audio.addEventListener('pause', () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; });
            audio.addEventListener('ended', () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; barInner.style.width = '0%'; });
            audio.addEventListener('timeupdate', () => {
                if (audio.duration) barInner.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                timeLabel.textContent = fmtTime(audio.duration ? (audio.duration - audio.currentTime) : durationSeconds);
            });
            barOuter.addEventListener('click', (e) => {
                if (!audio.duration) return;
                const rect = barOuter.getBoundingClientRect();
                const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                audio.currentTime = ratio * audio.duration;
            });

            wrap.appendChild(playBtn);
            wrap.appendChild(barOuter);
            wrap.appendChild(timeLabel);
            return wrap;
        }

        function buildGroupChatBubble(m, isMe) {
            const bubble = document.createElement('div');
            bubble.dataset.isMe = isMe ? '1' : '0';
            bubble.dataset.createdAt = m.createdAt;
            bubble.dataset.msgId = m.id || '';

            // رسالة محذوفة — بنعرض مكانها placeholder بس، من غير محتوى ولا ريأكشنز
            // ولا إمكانية حذف/رد تاني عليها.
            if (m.deleted) {
                bubble.dataset.deleted = '1';
                bubble.style.cssText = `max-width:78%;align-self:${isMe ? 'flex-end' : 'flex-start'};padding:8px 14px;border-radius:14px;background:transparent;border:1px dashed var(--border);color:var(--text-3);font-size:12px;font-style:italic;display:flex;align-items:center;gap:6px;`;
                const icon = document.createElement('i');
                icon.className = 'fas fa-ban';
                icon.style.fontSize = '11px';
                bubble.appendChild(icon);
                const label = document.createElement('span');
                label.textContent = isMe ? 'تم حذف الرسالة' : `تم حذف الرسالة بواسطة ${m.deletedByName || 'الطرف التاني'}`;
                bubble.appendChild(label);
                return bubble;
            }

            const hasMedia = (m.image && m.image.base64) || (m.audio && m.audio.base64);
            bubble.style.cssText = `position:relative;max-width:${hasMedia ? '82%' : '78%'};align-self:${isMe ? 'flex-end' : 'flex-start'};padding:${m.image && m.image.base64 ? '6px' : '10px 14px'};border-radius:14px;background:${isMe ? 'var(--gc-out-bg, var(--grad-bold))' : 'var(--gc-in-bg, var(--bg-2))'};color:${isMe ? 'var(--gc-out-text, #fff)' : 'var(--gc-in-text, var(--text-1))'};font-size:13px;line-height:1.7;`;

            if (m.image && m.image.base64) {
                const imgSrc = `data:${m.image.mimeType || 'image/jpeg'};base64,${m.image.base64}`;
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = m.image.name || 'صورة';
                img.loading = 'lazy';
                img.style.cssText = 'max-width:100%;max-height:320px;border-radius: var(--radius-sm);display:block;cursor:zoom-in;object-fit:cover;';
                img.addEventListener('click', () => openImageLightbox(imgSrc));
                bubble.appendChild(img);
            }

            if (m.audio && m.audio.base64) {
                const audioSrc = `data:${m.audio.mimeType || 'audio/webm'};base64,${m.audio.base64}`;
                bubble.appendChild(buildVoiceMessagePlayer(audioSrc, m.audio.durationSeconds || 0, isMe));
            }

            if (m.text) {
                const textSpan = document.createElement('span');
                textSpan.textContent = m.text;
                textSpan.style.cssText = (m.image && m.image.base64) ? 'display:block;padding:8px 8px 0;' : '';
                bubble.appendChild(textSpan);
            }

            const metaRow = document.createElement('div');
            metaRow.style.cssText = `display:flex;gap:6px;align-items:center;margin-top:3px;font-size:10px;opacity:.75;${isMe ? 'justify-content:flex-end;' : ''}${(m.image && m.image.base64) ? 'padding:0 8px 4px;' : ''}`;
            const timeSpan = document.createElement('span');
            timeSpan.textContent = formatMsgTime(m.createdAt);
            metaRow.appendChild(timeSpan);
            if (isMe) {
                const tick = document.createElement('span');
                tick.className = 'read-receipt-tick';
                metaRow.appendChild(tick);
            }
            bubble.appendChild(metaRow);

            const reactionsRow = document.createElement('div');
            reactionsRow.className = 'msg-reactions-row';
            reactionsRow.style.cssText = 'display:flex;gap:3px;margin-top:4px;flex-wrap:wrap;';
            bubble.appendChild(reactionsRow);
            renderMessageReactions(reactionsRow, m.reactions || {});

            // الضغط المطول بيفتح شريط الإيموجيات زي ما كان، وبيضيف زرار حذف كمان
            // بس لو الرسالة دي رسالتي أنا (isMe) — محدش يقدر يحذف رسالة غير رسايله هو.
            if (m.id) attachLongPressReaction(bubble, m.id, isMe);
            return bubble;
        }

        function renderMessageReactions(container, reactionsMap) {
            container.innerHTML = '';
            const counts = {};
            Object.values(reactionsMap).forEach(emoji => { counts[emoji] = (counts[emoji] || 0) + 1; });
            Object.entries(counts).forEach(([emoji, count]) => {
                const chip = document.createElement('span');
                chip.style.cssText = 'background:rgba(0,0,0,0.15);border-radius: var(--radius-sm);padding:1px 6px;font-size:11px;';
                chip.textContent = count > 1 ? `${emoji} ${count}` : emoji;
                container.appendChild(chip);
            });
        }

        // ضغطة مطولة (500ms) على أي رسالة بتفتح شريط إيموجيات سريع للرد عليها —
        // زي واتساب. شغالة بالتاتش (موبايل) وبرضه بالماوس (اختبار من الديسكتوب).
        function attachLongPressReaction(bubble, messageId, isMe) {
            let pressTimer = null;
            const start = () => {
                pressTimer = setTimeout(() => showReactionPicker(bubble, messageId, isMe), 500);
            };
            const cancel = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
            bubble.addEventListener('touchstart', start, { passive: true });
            bubble.addEventListener('touchend', cancel);
            bubble.addEventListener('touchmove', cancel);
            bubble.addEventListener('mousedown', start);
            bubble.addEventListener('mouseup', cancel);
            bubble.addEventListener('mouseleave', cancel);
        }

        function showReactionPicker(bubble, messageId, isMe) {
            document.querySelectorAll('.reaction-picker').forEach(el => el.remove());
            const picker = document.createElement('div');
            picker.className = 'reaction-picker';
            // لو الرسالة قريبة من أعلى صندوق الشات (زي أول رسالة)، مفيش مساحة كفاية فوقها
            // تعرض فيها القائمة (position:absolute بيتقص برا الـ overflow:auto فيختفي تمامًا)،
            // فنعرضها تحت الرسالة بدل فوقها في الحالة دي.
            const scrollBox = document.getElementById('groupChatMessages');
            const bubbleRect = bubble.getBoundingClientRect();
            const boxRect = scrollBox ? scrollBox.getBoundingClientRect() : { top: 0 };
            const showBelow = (bubbleRect.top - boxRect.top) < 46;
            const vertical = showBelow ? 'top:calc(100% + 6px);' : 'top:-40px;';
            picker.style.cssText = `position:absolute;${vertical}${bubble.dataset.isMe === '1' ? 'left:0;' : 'right:0;'}background:var(--bg-glass-heavy);border:1px solid var(--border);border-radius: var(--radius-lg);padding:6px 8px;display:flex;gap:6px;z-index:20;box-shadow:0 6px 20px rgba(0,0,0,.3);animation:floatIn .15s ease;`;
            QUICK_REACTIONS.forEach(emoji => {
                const btn = document.createElement('span');
                btn.textContent = emoji;
                btn.style.cssText = 'cursor:pointer;font-size:18px;transition:transform .15s;';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    sendReaction(messageId, emoji);
                    picker.remove();
                };
                picker.appendChild(btn);
            });
            // زرار حذف — بيظهر بس لو الرسالة دي رسالتي أنا. محدش يقدر يحذف رسالة
            // غير رسايله هو (الفرونت إند هنا بس تسهيل — السيرفر بيمنع أي حد تاني بردو).
            if (isMe) {
                const delBtn = document.createElement('span');
                delBtn.innerHTML = '<i class="fas fa-trash"></i>';
                delBtn.style.cssText = 'cursor:pointer;font-size:16px;color:var(--danger);display:flex;align-items:center;padding:0 2px;border-inline-start:1px solid var(--border);padding-inline-start:8px;';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    picker.remove();
                    deleteGroupChatMessage(messageId);
                };
                picker.appendChild(delBtn);
            }
            bubble.appendChild(picker);
            setTimeout(() => {
                document.addEventListener('click', function closePicker(e) {
                    if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', closePicker); }
                });
            }, 50);
        }

        // حذف رسالة واحدة — بس السيرفر هو اللي بيتأكد فعليًا إن اللي بيحذف هو نفسه
        // اللي بعتها؛ هنا بنستبدل الفقاعة فورًا بنسخة "محذوفة" (optimistic) وبعدين
        // بنأكد من رد السيرفر.
        async function deleteGroupChatMessage(messageId) {
            if (!activeGroupChatId || !messageId) return;
            if (!confirm('تمسح الرسالة دي؟ الطرف التاني هيشوف إنها اتمسحت.')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages/${messageId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'failed');
                }
                const bubble = document.querySelector(`#groupChatMessages [data-msg-id="${CSS.escape(String(messageId))}"]`);
                if (bubble) {
                    const isMe = bubble.dataset.isMe === '1';
                    bubble.replaceWith(buildGroupChatBubble({ id: messageId, deleted: true, senderUsername: schoolUser?.username, deletedByName: schoolUser?.fullName || schoolUser?.username, createdAt: Number(bubble.dataset.createdAt) || Date.now() }, isMe));
                }
            } catch (e) {
                showToast(e.message === 'تقدر تحذف رسايلك انت بس' ? e.message : 'تعذر حذف الرسالة', 'error');
            }
        }

        async function sendReaction(messageId, emoji) {
            if (!activeGroupChatId) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages/${messageId}/react`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ emoji })
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const bubble = document.querySelector(`#groupChatMessages [data-msg-id="${messageId}"]`);
                const row = bubble?.querySelector('.msg-reactions-row');
                if (row) renderMessageReactions(row, data.reactions || {});
            } catch (e) {
                showToast('تعذر إضافة الرد', 'error');
            }
        }

        // بيمنع تشغيل أكتر من نداء لـ loadGroupChatMessages في نفس الوقت. من غيرها، لو الـ
        // poll التلقائي (كل 2 ثانية) اشتغل في نفس لحظة نداء تاني (زي اللي بيحصل فورًا بعد
        // إرسال رسالة)، الاتنين ممكن يجيبوا نفس الرسالة من السيرفر ويضيفوها كل واحد لوحده —
        // وده اللي كان بيخلي الرسالة تظهر مكررة على الشاشة.
        let isLoadingGroupMessages = false;
        async function loadGroupChatMessages(isFirstLoad) {
            if (!activeGroupChatId || isLoadingGroupMessages) return;
            isLoadingGroupMessages = true;
            try {
                const since = isFirstLoad ? 0 : lastGroupMsgAt;
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages?since=${since}`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const msgs = data.messages || [];
                lastKnownReadBy = data.lastReadBy || lastKnownReadBy;
                // تحديث حالة الطلب لحظيًا — لو الطرف التاني قبل الطلب وأنا لسه فاتح
                // الغرفة، أو لو أنا فتحتها وقبلت الطلب من جهاز تاني، البانر يتحدّث تلقائي.
                if (typeof data.chatStatus === 'string' && (data.chatStatus !== activeGroupChatStatus || data.requestedBy !== activeGroupChatRequestedBy)) {
                    activeGroupChatStatus = data.chatStatus;
                    activeGroupChatRequestedBy = data.requestedBy || null;
                    renderGroupChatRequestBanner();
                }
                const box = document.getElementById('groupChatMessages');
                // بنسجّل هل المستخدم كان "تحت" أصلاً (قريب من آخر الشات) قبل ما نضيف أي حاجة —
                // ده اللي بيحدد هل نعمل auto-scroll بعدين ولا لأ. الفرق (80px) بيسمح بهامش
                // بسيط عشان مايتصرفش وكأنه "مش تحت" لمجرد بكسل واحد فرق.
                const wasNearBottom = (box.scrollHeight - box.scrollTop - box.clientHeight) < 80;
                let receivedNewFromOther = false;
                let appendedAny = false;
                msgs.forEach(m => {
                    // حماية إضافية: لو الرسالة دي (بنفس الـ id) موجودة على الشاشة أصلاً،
                    // منضيفهاش تاني — إلا لو اتحذفت دلوقتي (m.deleted) وكانت لسه ظاهرة
                    // بمحتواها الأصلي، وقتها نستبدل الفقاعة بنسخة "محذوفة" بدلها.
                    const existingEl = m.id ? box.querySelector(`[data-msg-id="${CSS.escape(String(m.id))}"]`) : null;
                    if (existingEl) {
                        if (m.deleted && existingEl.dataset.deleted !== '1') {
                            const isMeUpd = m.senderUsername === schoolUser?.username;
                            existingEl.replaceWith(buildGroupChatBubble(m, isMeUpd));
                        }
                        lastGroupMsgAt = Math.max(lastGroupMsgAt, m.createdAt || 0);
                        return;
                    }
                    const isMe = m.senderUsername === schoolUser?.username;
                    if (!isMe && !isFirstLoad) receivedNewFromOther = true;
                    // 🔍 لوج تشخيصي مؤقت — بيوريني هل GET رجّع الميديا فعلاً ولا الرسالة وصلت
                    // من غير base64 خالص (يعني المشكلة في التخزين/القراءة مش في العرض). شيله بعدين.
                    console.log('📥 incoming group-chat msg:', { id: m.id, isMe, hasText: !!m.text, hasImage: !!(m.image && m.image.base64), hasAudio: !!(m.audio && m.audio.base64) });
                    // لو الرسالة دي كانت optimistic (اتبعتت محليًا واستنينا تأكيد السيرفر)، امسح النسخة
                    // المؤقتة واستبدلها بالنسخة الحقيقية بدل ما تتكرر على الشاشة.
                    if (isMe) {
                        const optimisticEl = box.querySelector(`[data-optimistic-text="${CSS.escape(m.text)}"]`);
                        if (optimisticEl) optimisticEl.remove();
                    }
                    box.appendChild(buildGroupChatBubble(m, isMe));
                    appendedAny = true;
                    lastGroupMsgAt = Math.max(lastGroupMsgAt, m.createdAt || 0);
                });
                // ننزّل تلقائيًا لآخر الشات بس لو: أول فتح للغرفة، أو المستخدم كان أصلاً
                // قريب من الآخر (يعني بيتابع لحظيًا)، أو الرسالة الجديدة هي رسالتي أنا
                // (بعتّها وطبيعي أشوفها). لو المستخدم طالع فوق يقرا رسايل قديمة، منلمسوش.
                if (appendedAny && (isFirstLoad || wasNearBottom)) {
                    box.scrollTop = box.scrollHeight;
                }
                if (receivedNewFromOther) playGroupChatNotifySound();
                updateReadReceiptTicks();
                updateTypingIndicator(data.typingUsernames || []);
                updateOnlineStatus(data.onlineUsernames || []);
                // مجرد إن الطالب فاتح غرفة المذاكرة (حتى لو مش بيكتب) نشاط حقيقي، ولازم يفضل
                // "متصل" طول الوقت اللي هو موجود فيها — pingActivity نفسها بتحدد بحد أقصى مرة
                // كل دقيقة، فمفيش مشكلة إننا ننادي عليها في كل poll (كل ثانيتين).
                pingActivity();
            } catch (e) { /* هنحاول تاني في الـ poll الجاي */ }
            finally { isLoadingGroupMessages = false; }
        }

        function updateOnlineStatus(onlineUsernames) {
            const el = document.getElementById('groupChatOnlineStatus');
            if (!el || !currentGroupChatOtherUsername) return;
            const isOnline = onlineUsernames.includes(currentGroupChatOtherUsername);
            el.innerHTML = isOnline
                ? '<span style="color:#34d399;">🟢 متصل الآن</span>'
                : '<span style="color:var(--text-3);">⚪ غير متصل</span>';
        }

        let lastTypingSentAt = 0;
        function notifyTypingInGroupChat() {
            if (!activeGroupChatId || !schoolToken) return;
            const now = Date.now();
            // نبعت إشارة كتابة كل 3 ثواني بالكتير، مش مع كل حرف — عشان منضربش السيرفر بطلبات كتير
            if (now - lastTypingSentAt < 3000) return;
            lastTypingSentAt = now;
            fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/typing`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${schoolToken}` }
            }).catch(() => {});
        }

        function updateTypingIndicator(typingUsernames) {
            const el = document.getElementById('groupChatTypingIndicator');
            if (!el) return;
            if (typingUsernames.length > 0) {
                el.innerHTML = '<div class="typing-dots" style="padding:8px 12px;display:inline-flex;"><span></span><span></span><span></span><svg viewBox="0 0 64 22" xmlns="http://www.w3.org/2000/svg"><path class="ecg-line" d="M0,11 L14,11 L18,4 L22,18 L26,11 L40,11 L44,6 L48,16 L52,11 L64,11"/><circle class="ecg-dot" cx="22" cy="18" r="2"/></svg></div>';
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }

        // بيحدّث علامات ✓ / ✓✓ على كل رسايلي بناءً على آخر وقت الطرف التاني فتح فيه الغرفة
        // (lastKnownReadBy)، من غير ما يحتاج يعيد بناء الفقاعات نفسها.
        function updateReadReceiptTicks() {
            if (!currentGroupChatOtherUsername) return;
            const otherReadAt = lastKnownReadBy[currentGroupChatOtherUsername] || 0;
            document.querySelectorAll('#groupChatMessages [data-is-me="1"]').forEach(bubble => {
                const tick = bubble.querySelector('.read-receipt-tick');
                if (!tick) return;
                const wasRead = Number(bubble.dataset.createdAt) <= otherReadAt;
                tick.textContent = wasRead ? '✓✓ اتقرت' : '✓ اترسلت';
                tick.style.color = wasRead ? '#a7f3d0' : 'inherit';
            });
        }

        async function clearGroupChat() {
            if (!activeGroupChatId) return;
            if (!confirm('هتمسح كل رسايل الغرفة دي نهائيًا — الإجراء ده مش هيتراجع. متأكد؟')) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                document.getElementById('groupChatMessages').innerHTML = '';
                lastGroupMsgAt = 0;
                showToast('اتمسحت كل الرسايل', 'success');
            } catch (e) {
                showToast('تعذر مسح الشات', 'error');
            }
        }

        // ====================== إرفاق صورة في المحادثة الجماعية ======================
        let pendingGroupImage = null; // { base64, mimeType, name } — الصورة المختارة قبل الإرسال

        // سقف أمان لطول الـ base64 (بالحروف) قبل الإرسال. حاطينه أقل بكتير من حد
        // الـ 8 مليون حرف المسموح في السيرفر، عشان نضمن إن حجم الـ request body
        // (JSON) يفضل تحت سقف Vercel الصارم للـ Serverless Functions (4.5MB) —
        // 3 مليون حرف base64 ≈ 2.2MB بيانات فعلية، ده هيسيب هامش أمان كويس حتى
        // مع أي overhead تاني في الـ request.
        const GROUP_MEDIA_BASE64_SAFE_LIMIT = 3_000_000;

        function updateGroupChatSendButton() {
            const hasText = document.getElementById('groupChatInput').value.trim().length > 0;
            const showSend = hasText || !!pendingGroupImage;
            document.getElementById('groupChatSendBtn').style.display = showSend ? '' : 'none';
            document.getElementById('groupChatMicBtn').style.display = showSend ? 'none' : '';
        }

        function handleGroupChatImageSelect(file) {
            if (!file) return;
            // ضغط أقوى شوية من الافتراضي (كان 1600px/0.82) عشان نقلل احتمال تخطي حد
            // الـ body بتاع Vercel — 1280px وجودة 0.72 كافيين جدًا لمحادثة نصية وبيقللوا
            // حجم الصورة بشكل ملحوظ من غير ما الجودة تبقى واضحة إنها ضعيفة.
            // بدل ما نبعتها على طول، بنفتح محرر بسيط (تدوير/عكس/سطوع/قص) قبل التأكيد.
            compressImageFile(file, 1280, 0.72).then((compressedFile) => {
                openGroupImageEditor(compressedFile, file.name);
            });
        }

        // بيتنادى من المحرر (giConfirmEdit) وبردو ممكن يتنادى مباشرة لو حبينا نتخطى
        // التعديل — بيعمل نفس فحص الحجم الأمان اللي كان في handleGroupChatImageSelect
        // الأصلية، وبيحدّث الـ chip اللي فيه معاينة الصورة وزرار تعديل/إلغاء.
        function finalizePendingGroupImage(base64, mimeType, name, previewDataUrl) {
            if (base64.length > GROUP_MEDIA_BASE64_SAFE_LIMIT) {
                showToast('الصورة كبيرة قوي حتى بعد التعديل — جرب تصغّر منطقة القص', 'error');
                return false;
            }
            pendingGroupImage = { base64, mimeType, name };
            const chip = document.getElementById('groupChatPendingImageChip');
            chip.style.display = 'flex';
            chip.innerHTML = `
                <img src="${previewDataUrl}" alt="معاينة الملف المرفق" style="width:44px;height:44px;border-radius: var(--radius-xs);object-fit:cover;">
                <span style="font-size:11.5px;color:var(--text-2);flex:1;">جاهزة للإرسال</span>
                <button onclick="reopenGroupImageEditor()" aria-label="تعديل الصورة" style="background:none;border:none;color:var(--text-3);font-size:14px;cursor:pointer;padding:6px;"><i class="fas fa-crop-simple"></i></button>
                <button onclick="removeGroupPendingImage()" aria-label="إلغاء الصورة" style="background:none;border:none;color:var(--text-3);font-size:15px;cursor:pointer;padding:6px;"><i class="fas fa-times"></i></button>`;
            updateGroupChatSendButton();
            return true;
        }

        function removeGroupPendingImage() {
            pendingGroupImage = null;
            const chip = document.getElementById('groupChatPendingImageChip');
            chip.style.display = 'none';
            chip.innerHTML = '';
            updateGroupChatSendButton();
        }

        // ====================== محرر تعديل الصورة (تدوير / عكس / سطوع / قص) ======================
        let giSourceImg = null;       // عنصر Image محمّل بالصورة الأصلية (بعد الضغط)
        let giRotation = 0;           // 0 / 90 / 180 / 270
        let giFlipH = false;
        let giBrightness = 0;         // -60..60
        let giOriginalName = 'image.jpg';
        let giCrop = { x: 0.06, y: 0.06, w: 0.88, h: 0.88 }; // نسب من أبعاد الكانفاس (0..1)
        let giDrag = null;

        function giClamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

        function openGroupImageEditor(file, originalName) {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                giSourceImg = img;
                giOriginalName = originalName || 'image.jpg';
                giRotation = 0; giFlipH = false; giBrightness = 0;
                giCrop = { x: 0.06, y: 0.06, w: 0.88, h: 0.88 };
                document.getElementById('giBrightnessRange').value = 0;
                openModal('groupImageEditModal');
                requestAnimationFrame(() => { giRedrawCanvas(); giSyncCropBoxUI(); });
            };
            img.onerror = () => { URL.revokeObjectURL(url); showToast('تعذر فتح الصورة للتعديل', 'error'); };
            img.src = url;
        }

        // بيسمح للطالب يفتح نفس الصورة اللي جاهزة للإرسال تاني عشان يعدّل فيها زودة
        function reopenGroupImageEditor() {
            if (!pendingGroupImage) return;
            const dataUrl = `data:${pendingGroupImage.mimeType};base64,${pendingGroupImage.base64}`;
            const img = new Image();
            img.onload = () => {
                giSourceImg = img;
                giOriginalName = pendingGroupImage.name || 'image.jpg';
                giRotation = 0; giFlipH = false; giBrightness = 0;
                giCrop = { x: 0.04, y: 0.04, w: 0.92, h: 0.92 };
                document.getElementById('giBrightnessRange').value = 0;
                openModal('groupImageEditModal');
                requestAnimationFrame(() => { giRedrawCanvas(); giSyncCropBoxUI(); });
            };
            img.onerror = () => showToast('تعذر فتح الصورة للتعديل', 'error');
            img.src = dataUrl;
        }

        function giRedrawCanvas() {
            if (!giSourceImg) return;
            const canvas = document.getElementById('giCanvas');
            const swap = (giRotation === 90 || giRotation === 270);
            const iw = giSourceImg.naturalWidth, ih = giSourceImg.naturalHeight;
            canvas.width = swap ? ih : iw;
            canvas.height = swap ? iw : ih;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(giRotation * Math.PI / 180);
            if (giFlipH) ctx.scale(-1, 1);
            ctx.drawImage(giSourceImg, -iw / 2, -ih / 2, iw, ih);
            ctx.restore();
            canvas.style.filter = `brightness(${100 + giBrightness}%)`;
        }

        function giSyncCropBoxUI() {
            const canvas = document.getElementById('giCanvas');
            const box = document.getElementById('giCropBox');
            const stage = document.getElementById('giEditorStage');
            const rect = canvas.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const offX = rect.left - stageRect.left, offY = rect.top - stageRect.top;
            box.style.left = (offX + giCrop.x * rect.width) + 'px';
            box.style.top = (offY + giCrop.y * rect.height) + 'px';
            box.style.width = (giCrop.w * rect.width) + 'px';
            box.style.height = (giCrop.h * rect.height) + 'px';
        }

        function giRotateLeft() {
            giRotation = (giRotation + 270) % 360;
            giCrop = { x: 0.06, y: 0.06, w: 0.88, h: 0.88 };
            giRedrawCanvas(); giSyncCropBoxUI();
        }
        function giRotateRight() {
            giRotation = (giRotation + 90) % 360;
            giCrop = { x: 0.06, y: 0.06, w: 0.88, h: 0.88 };
            giRedrawCanvas(); giSyncCropBoxUI();
        }
        function giToggleFlip() { giFlipH = !giFlipH; giRedrawCanvas(); }
        function giSetBrightness(val) {
            giBrightness = Number(val);
            document.getElementById('giCanvas').style.filter = `brightness(${100 + giBrightness}%)`;
        }
        function giResetEdits() {
            giRotation = 0; giFlipH = false; giBrightness = 0;
            giCrop = { x: 0.06, y: 0.06, w: 0.88, h: 0.88 };
            document.getElementById('giBrightnessRange').value = 0;
            giRedrawCanvas(); giSyncCropBoxUI();
        }

        function giCropPointerDown(e, mode) {
            e.preventDefault();
            e.stopPropagation();
            const canvas = document.getElementById('giCanvas');
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            giDrag = {
                mode,
                startX: e.clientX, startY: e.clientY,
                startCrop: { ...giCrop },
                rectW: rect.width, rectH: rect.height
            };
            document.addEventListener('pointermove', giCropPointerMove);
            document.addEventListener('pointerup', giCropPointerUp);
        }
        function giCropPointerMove(e) {
            if (!giDrag) return;
            const dxFrac = (e.clientX - giDrag.startX) / giDrag.rectW;
            const dyFrac = (e.clientY - giDrag.startY) / giDrag.rectH;
            let { x, y, w, h } = giDrag.startCrop;
            const minSize = 0.12;
            if (giDrag.mode === 'move') {
                x = giClamp(x + dxFrac, 0, 1 - w);
                y = giClamp(y + dyFrac, 0, 1 - h);
            } else {
                if (giDrag.mode.includes('w')) {
                    const newX = giClamp(x + dxFrac, 0, x + w - minSize);
                    w = (x + w) - newX; x = newX;
                }
                if (giDrag.mode.includes('e')) {
                    w = giClamp(w + dxFrac, minSize, 1 - x);
                }
                if (giDrag.mode.includes('n')) {
                    const newY = giClamp(y + dyFrac, 0, y + h - minSize);
                    h = (y + h) - newY; y = newY;
                }
                if (giDrag.mode.includes('s')) {
                    h = giClamp(h + dyFrac, minSize, 1 - y);
                }
            }
            giCrop = { x, y, w, h };
            giSyncCropBoxUI();
        }
        function giCropPointerUp() {
            giDrag = null;
            document.removeEventListener('pointermove', giCropPointerMove);
            document.removeEventListener('pointerup', giCropPointerUp);
        }
        window.addEventListener('resize', () => {
            const modal = document.getElementById('groupImageEditModal');
            if (modal && modal.classList.contains('active')) giSyncCropBoxUI();
        });

        function giConfirmEdit() {
            const canvas = document.getElementById('giCanvas');
            const sx = Math.round(giCrop.x * canvas.width);
            const sy = Math.round(giCrop.y * canvas.height);
            const sw = Math.max(1, Math.round(giCrop.w * canvas.width));
            const sh = Math.max(1, Math.round(giCrop.h * canvas.height));
            const outCanvas = document.createElement('canvas');
            outCanvas.width = sw; outCanvas.height = sh;
            const outCtx = outCanvas.getContext('2d');
            // بنطبّق السطوع فعليًا هنا (مش بس preview بصري) عشان يتحفظ داخل الصورة النهائية.
            outCtx.filter = `brightness(${100 + giBrightness}%)`;
            outCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
            outCanvas.toBlob((blob) => {
                if (!blob) { showToast('تعذر حفظ التعديلات', 'error'); return; }
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    const ok = finalizePendingGroupImage(base64, 'image/jpeg', giOriginalName, reader.result);
                    if (ok) closeModal('groupImageEditModal');
                };
                reader.onerror = () => showToast('تعذر حفظ التعديلات', 'error');
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.85);
        }

        function giCancelEdit() {
            closeModal('groupImageEditModal');
            giSourceImg = null;
            // لو كانت دي أول صورة للطالب ومفيش صورة سابقة جاهزة، سيبها من غير حاجة معلّقة.
            if (!pendingGroupImage) removeGroupPendingImage();
        }

        async function sendGroupChatMessage() {
            const input = document.getElementById('groupChatInput');
            const text = input.value.trim();
            const image = pendingGroupImage;
            if (!text && !image) return;
            if (!activeGroupChatId) return;
            // لسه محتاج أقبل/أرفض طلب المحادثة الأول — منمنعش بس بتعطيل الزرار،
            // فحص كمان هنا احتياطًا.
            if (activeGroupChatStatus === 'pending' && activeGroupChatRequestedBy !== schoolUser?.username) {
                showToast('لازم تقبل طلب المحادثة الأول', 'error');
                return;
            }
            input.value = '';
            removeGroupPendingImage();
            updateGroupChatSendButton();

            // Optimistic UI: نضيف الرسالة على الشاشة فورًا من غير ما نستنى رد السيرفر —
            // ده اللي بيخلي الإرسال حاسس إنه فوري. لما رد السيرفر يوصل، بنشيل النسخة
            // المؤقتة دي بالـ id بتاعها مباشرة (مش هنستنى تلقيها تاني من الـ poll).
            const box = document.getElementById('groupChatMessages');
            const optimisticId = 'opt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const optimisticBubble = buildGroupChatBubble(
                { text, image, createdAt: Date.now(), senderUsername: schoolUser?.username, reactions: {} },
                true
            );
            optimisticBubble.dataset.optimisticId = optimisticId;
            optimisticBubble.dataset.optimisticText = text;
            optimisticBubble.style.opacity = '0.6';
            box.appendChild(optimisticBubble);
            box.scrollTop = box.scrollHeight;

            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ text, image: image || undefined })
                });
                if (!res.ok) {
                    // 🔍 لوج تشخيصي مؤقت — بيوريني status code والرد الحقيقي من السيرفر/Vercel
                    // بدل ما الخطأ يتبلع في رسالة عامة. شيله بعد حل المشكلة.
                    console.error('group-chat send failed:', res.status, await res.text().catch(() => '(no body)'));
                    throw new Error('failed');
                }
                document.querySelector(`[data-optimistic-id="${CSS.escape(optimisticId)}"]`)?.remove();
                await loadGroupChatMessages(false); // بيجيب النسخة الحقيقية (فيها الـ id وread receipts)
                pingActivity(); // إرسال رسالة في الغرفة = نشاط حقيقي، لازم يحدّث حالة "متصل"
            } catch (e) {
                optimisticBubble.remove();
                input.value = text; // نرجّع النص للمستخدم بدل ما يضيع لو الإرسال فشل
                if (image) { pendingGroupImage = image; document.getElementById('groupChatPendingImageChip').style.display = 'flex'; }
                updateGroupChatSendButton();
                showToast('تعذر إرسال الرسالة', 'error');
            }
        }

        // ====================== تسجيل رسالة صوتية في المحادثة الجماعية (زي واتساب) ======================
        let groupVoiceRecorder = null;
        let groupVoiceChunks = [];
        let groupVoiceStream = null;
        let groupVoiceSeconds = 0;
        let groupVoiceTimerInterval = null;
        // نزّلنا الحد الأقصى من 180 ثانية (3 دقايق) لـ 90 ثانية (دقيقة ونص) — التسجيل
        // الطويل كان بيقرّب أوي من (أو بيعدي) حد الـ 4.5MB بتاع Vercel لطلبات الـ
        // Serverless Functions، فكان بيتسبب في رفض الطلب بصمت من غير ما السيرفر يشوفه
        // أصلاً. دقيقة ونص كافية جدًا لرسالة صوتية عادية.
        const GROUP_VOICE_MAX_SECONDS = 90;
        // بت ريت ثابت ومنخفض للتسجيل (24kbps) بدل ما نسيب المتصفح يختار bitrate
        // افتراضي (بيختلف من متصفح لمتصفح وممكن يوصل 64-128kbps) — ده بيقلل حجم
        // التسجيل بشكل كبير وبيضمن إننا تحت سقف Vercel حتى لو المستخدم سجل لآخر وقت.
        const GROUP_VOICE_BITRATE = 24000;

        async function startGroupVoiceRecording() {
            if (!activeGroupChatId) return;
            try {
                groupVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                showToast('محتاجين إذن الميكروفون عشان تبعت رسالة صوتية', 'error');
                return;
            }
            groupVoiceChunks = [];
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
            groupVoiceRecorder = new MediaRecorder(groupVoiceStream, {
                ...(mimeType ? { mimeType } : {}),
                audioBitsPerSecond: GROUP_VOICE_BITRATE
            });
            groupVoiceRecorder.ondataavailable = (e) => { if (e.data.size > 0) groupVoiceChunks.push(e.data); };
            groupVoiceRecorder.start();

            groupVoiceSeconds = 0;
            document.getElementById('groupChatRecTimer').textContent = '00:00';
            document.getElementById('groupChatInputRow').style.display = 'none';
            document.getElementById('groupChatRecordingRow').style.display = 'flex';
            groupVoiceTimerInterval = setInterval(() => {
                groupVoiceSeconds++;
                const m = String(Math.floor(groupVoiceSeconds / 60)).padStart(2, '0');
                const s = String(groupVoiceSeconds % 60).padStart(2, '0');
                document.getElementById('groupChatRecTimer').textContent = `${m}:${s}`;
                if (groupVoiceSeconds >= GROUP_VOICE_MAX_SECONDS) {
                    showToast('وصلت للحد الأقصى (دقيقة ونص) — هيتبعت التسجيل تلقائي', 'error');
                    stopAndSendGroupVoiceRecording();
                }
            }, 1000);
        }

        function stopGroupVoiceRecordingInternal() {
            if (groupVoiceTimerInterval) { clearInterval(groupVoiceTimerInterval); groupVoiceTimerInterval = null; }
            if (groupVoiceStream) { groupVoiceStream.getTracks().forEach(t => t.stop()); groupVoiceStream = null; }
            document.getElementById('groupChatRecordingRow').style.display = 'none';
            document.getElementById('groupChatInputRow').style.display = 'flex';
        }

        function cancelGroupVoiceRecording() {
            if (groupVoiceRecorder && groupVoiceRecorder.state !== 'inactive') {
                groupVoiceRecorder.onstop = null;
                groupVoiceRecorder.stop();
            }
            stopGroupVoiceRecordingInternal();
        }

        function stopAndSendGroupVoiceRecording() {
            if (!groupVoiceRecorder || groupVoiceRecorder.state === 'inactive') { stopGroupVoiceRecordingInternal(); return; }
            const finalSeconds = groupVoiceSeconds;
            groupVoiceRecorder.onstop = async () => {
                stopGroupVoiceRecordingInternal();
                const blob = new Blob(groupVoiceChunks, { type: groupVoiceRecorder.mimeType || 'audio/webm' });
                if (blob.size < 800) { showToast('التسجيل قصير جدًا، جرب تاني', 'error'); return; }
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    // نفس سقف الأمان اللي في الصور — حماية إضافية لو الـ bitrate الفعلي
                    // طلع أعلى من المتوقع لأي سبب (بعض المتصفحات مبتحترمش audioBitsPerSecond
                    // بدقة كاملة).
                    if (base64.length > GROUP_MEDIA_BASE64_SAFE_LIMIT) {
                        showToast('التسجيل كبير قوي — جرب تسجيل أقصر', 'error');
                        return;
                    }
                    sendGroupVoiceMessage(base64, blob.type, finalSeconds);
                };
                reader.onerror = () => showToast('تعذر تجهيز التسجيل', 'error');
                reader.readAsDataURL(blob);
            };
            groupVoiceRecorder.stop();
        }

        async function sendGroupVoiceMessage(base64, mimeType, durationSeconds) {
            if (!activeGroupChatId) return;
            const box = document.getElementById('groupChatMessages');
            const optimisticId = 'opt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const audioObj = { base64, mimeType, durationSeconds };
            const optimisticBubble = buildGroupChatBubble(
                { audio: audioObj, createdAt: Date.now(), senderUsername: schoolUser?.username, reactions: {} },
                true
            );
            optimisticBubble.dataset.optimisticId = optimisticId;
            optimisticBubble.style.opacity = '0.6';
            box.appendChild(optimisticBubble);
            box.scrollTop = box.scrollHeight;

            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/group-chats/${activeGroupChatId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ audio: audioObj })
                });
                if (!res.ok) {
                    // 🔍 لوج تشخيصي مؤقت — نفس فكرة الصور. شيله بعد حل المشكلة.
                    console.error('group-chat voice send failed:', res.status, await res.text().catch(() => '(no body)'));
                    throw new Error('failed');
                }
                document.querySelector(`[data-optimistic-id="${CSS.escape(optimisticId)}"]`)?.remove();
                await loadGroupChatMessages(false);
                pingActivity();
            } catch (e) {
                console.error('group-chat voice send exception:', e);
                optimisticBubble.remove();
                showToast('تعذر إرسال الرسالة الصوتية', 'error');
            }
        }

        // ====================== إشعارات البوش (Firebase Cloud Messaging) ======================

        // ⚠️ محتاج تحط بيانات مشروع Firebase بتاعك هنا (Project settings → General → Web app)
        // وتحط VAPID key اللي هتجيبه من Project settings → Cloud Messaging.
        const FIREBASE_CONFIG = {
            apiKey: "AIzaSyCL6EePGDEgk03Il3V8WtngziaqcRhnuIg",
            authDomain: "chat-x-school.firebaseapp.com",
            projectId: "chat-x-school",
            messagingSenderId: "288505551281",
            appId: "1:288505551281:web:a73ef0ca5f91b1b6124590"
        };
        const FIREBASE_VAPID_KEY = "BKnW1R_cQxU4fuDX3iJiC9UFU0i4vlagq_Kd2HJq-1E4_ILfb9RW-NH2Muevv6KjGZZ0ZEvQAAVLKQDmXxVvePM";

        // ====================== كشف "أيفون بدون تثبيت PWA" ======================
        // السبب الأشهر لشكوى "الإشعارات مش بتوصل والتطبيق مقفول": أبل بتمنع Web Push
        // نهائيًا في تاب سفاري عادي — لازم الموقع يتثبّت كـ"تطبيق" (إضافة للشاشة
        // الرئيسية) الأول. طلب الإذن (Notification.requestPermission) ممكن حتى ينجح
        // ظاهريًا في تاب عادي من غير ما يوصل أي إشعار فعلي وقت الخلفية — فبنكشف الحالة
        // دي ونوجّه الطالب للخطوة الصح بدل ما نسيبه يفتكر إن الإشعار "اتفعّل" وهو
        // مش هيوصله حاجة فعلاً.
        function isIOSDevice() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // آيباد حديث بيبعت User-Agent ماك
        }
        // ⚠️ ملحوظة أمانة: مفيش طريقة موثوقة نكتشف بيها ماركة الجهاز (Xiaomi/Huawei/...)
        // من الـ User-Agent — كروم بيوحّد الـ UA بغض النظر عن نظام تخصيص الشركة المصنّعة
        // (MIUI, EMUI...)، فمحاولة الفلترة بالماركة هتفوّت معظم الأجهزة فعليًا. بدل ما
        // نخمّن، بنعرض التلميح ده لكل أجهزة الأندرويد عمومًا — مفيدة لأي حد بغض النظر
        // عن ماركة جهازه، وده أدق من محاولة فلترة غير موثوقة.
        function isAndroidDevice() {
            return /Android/i.test(navigator.userAgent || '');
        }
        function isStandalonePWA() {
            return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
        }
        function iosInstallInstructionsHTML() {
            return `📲 <b>الإشعارات على الأيفون محتاجة خطوة واحدة الأول:</b><br>
                1. دوس على أيقونة المشاركة <i class="fas fa-arrow-up-from-bracket"></i> تحت في سفاري<br>
                2. اختار <b>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</b><br>
                3. افتح Chat X من الأيقونة الجديدة اللي هتظهر في شاشتك، وفعّل الإشعارات من جوّه`;
        }

        // بانر بسيط قابل للإغلاق بيفضل معروض لحد ما الطالب يقفله بنفسه (وبعدين مابيرجعش
        // يظهر إلا بعد أسبوع) — عشان نوصل لأكبر عدد ممكن من طلاب الأيفون اللي أصلاً
        // هيفوتهم زرار "تفعيل الإشعارات" في الإعدادات لو ماشافوش البانر ده.
        function maybeShowIOSInstallBanner() {
            if (!isIOSDevice() || isStandalonePWA()) return;
            if (document.getElementById('iosInstallBanner')) return;
            const dismissedAt = Number(localStorage.getItem('sx_ios_install_banner_dismissed') || 0);
            if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

            const el = document.createElement('div');
            el.id = 'iosInstallBanner';
            el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--bg-2,#131827);border-top:1px solid var(--border,rgba(255,255,255,.1));padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 -4px 20px rgba(0,0,0,.25);';
            el.innerHTML = `
                <div style="font-size:20px;flex-shrink:0;">📲</div>
                <div style="flex:1;font-size:11.5px;line-height:1.7;color:var(--text-1,#fff);">
                    <b>عشان توصلك الإشعارات حتى لو التطبيق مقفول:</b>
                    دوس على أيقونة المشاركة <i class="fas fa-arrow-up-from-bracket"></i> تحت في سفاري، واختار
                    <b>"إضافة إلى الشاشة الرئيسية"</b>.
                </div>
                <button onclick="dismissIOSInstallBanner()" aria-label="إغلاق تنبيه التثبيت" style="background:none;border:none;color:var(--text-2,#94a3b8);font-size:16px;cursor:pointer;padding:6px;flex-shrink:0;">
                    <i class="fas fa-times"></i>
                </button>`;
            document.body.appendChild(el);
        }
        function dismissIOSInstallBanner() {
            localStorage.setItem('sx_ios_install_banner_dismissed', String(Date.now()));
            const el = document.getElementById('iosInstallBanner');
            if (el) el.remove();
        }

        // إشعارات الفوجراوند: Service Worker (sw.js → onBackgroundMessage) بيتصرف بس لما التاب
        // مقفول/في الخلفية تمامًا. لكن لو الطالب فاتح التطبيق فعلاً بس مش داخل غرفة المذاكرة
        // المحددة اللي جاتله فيها رسالة (زي ما اتوصف: "برة غرفة المذاكرة")، المتصفح بيوجّه
        // الرسالة لـ onMessage هنا بدل الـ service worker — ولو معندناش الهاندلر ده، الرسالة
        // بتتجاهل بصمت من غير أي إشعار. الدالة دي بتضيف الهاندلر المفقود ده.
        let foregroundPushListenerRegistered = false;
        function registerForegroundPushListener(messaging) {
            if (foregroundPushListenerRegistered) return;
            foregroundPushListenerRegistered = true;
            messaging.onMessage((payload) => {
                const isReaction = payload.data?.type === 'reaction';
                const title = payload.notification?.title || payload.data?.title
                    || (isReaction ? 'ريأكشن جديد' : 'رسالة جديدة من زميلك');
                const body = payload.notification?.body || payload.data?.body || '';
                const chatId = payload.data?.chatId || null;

                // لو هو أصلاً فاتح نفس غرفة المذاكرة دي دلوقتي، الـ polling هيجيبها له عادي
                // من غير ما نزعجه بإشعار مكرر لحاجة شايفها قدامه أصلاً.
                const roomModal = document.getElementById('groupChatRoomModal');
                const alreadyInThisRoom = chatId && chatId === activeGroupChatId && roomModal && roomModal.classList.contains('active');
                if (alreadyInThisRoom) return;

                playGroupChatNotifySound();
                if (window.Notification && Notification.permission === 'granted') {
                    const notif = new Notification(title, { body, icon: '/icons/favicon-32.png' });
                    notif.onclick = () => {
                        window.focus();
                        if (chatId) openGroupChatRoom(chatId, payload.data?.senderName || '', payload.data?.senderUsername || '');
                        notif.close();
                    };
                } else {
                    showToast(body ? `${title}: ${body}` : title, 'success');
                }
            });
        }

        async function enablePushNotifications() {
            const statusEl = document.getElementById('pushNotifStatus');
            if (!FIREBASE_CONFIG.apiKey) {
                statusEl.innerHTML = '<span style="color:var(--danger)">لسه محتاج تحط بيانات Firebase في الكود (FIREBASE_CONFIG) قبل ما الزرار ده يشتغل</span>';
                return;
            }
            // لازم قبل أي حاجة تانية: طلب الإذن جوه تاب سفاري عادي (مش تطبيق مثبّت) ممكن
            // "ينجح" ظاهريًا من غير ما يوصّل أي إشعار فعلي وقت التطبيق مقفول — فبنوقف هنا
            // ونوضح السبب الحقيقي بدل ما نسيب الطالب يفتكر إن التفعيل "نجح" ورايح ماشي.
            if (isIOSDevice() && !isStandalonePWA()) {
                statusEl.innerHTML = `<div style="color:var(--warning);line-height:1.7;">${iosInstallInstructionsHTML()}</div>`;
                return;
            }
            if (!('Notification' in window)) {
                statusEl.innerHTML = '<span style="color:var(--danger)">المتصفح ده مش بيدعم الإشعارات</span>';
                return;
            }
            statusEl.textContent = 'جارٍ الطلب...';
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    statusEl.innerHTML = '<span style="color:var(--warning)">محتاج توافق على إذن الإشعارات من المتصفح</span>';
                    return;
                }
                // Firebase SDK لازم يتحمّل قبل استدعاء الدالة دي (v9 compat عبر CDN، مضاف في <head>)
                if (!window.firebase) {
                    statusEl.innerHTML = '<span style="color:var(--danger)">مكتبة Firebase مش متحملة — راجع ملف الـ spec</span>';
                    return;
                }
                if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                const messaging = firebase.messaging();
                registerForegroundPushListener(messaging);
                const reg = await navigator.serviceWorker.register('/sw.js');
                const token = await messaging.getToken({ vapidKey: FIREBASE_VAPID_KEY, serviceWorkerRegistration: reg });
                if (!token) throw new Error('لم يتم الحصول على توكن FCM من المتصفح (getToken رجع فاضي)');
                const subRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/push/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ fcmToken: token })
                });
                if (!subRes.ok) {
                    let serverMsg = '';
                    try { serverMsg = (await subRes.json()).error || ''; } catch (_) {}
                    throw new Error(`السيرفر رفض الطلب (${subRes.status}) ${serverMsg}`);
                }
                const androidBatteryTip = isAndroidDevice()
                    ? `<div style="margin-top:8px;font-size:11px;color:var(--text-2);line-height:1.7;">
                        💡 لو حسّيت إن الإشعارات بتتأخر أو مش بتوصل والموبايل قافل فترة طويلة:
                        بعض الأندرويدات (Xiaomi، Huawei، Samsung...) بتوقف المتصفح تلقائيًا في
                        الخلفية لتوفير البطارية. روح إعدادات الموبايل → البطارية → استثنِ المتصفح
                        (Chrome مثلًا) من "تحسين البطارية" عشان يفضل يستقبل الإشعارات دايمًا.
                       </div>`
                    : '';
                statusEl.innerHTML = `<span style="color:var(--success)">تم تفعيل الإشعارات ✓</span>${androidBatteryTip}`;
            } catch (e) {
                console.error('enablePushNotifications error:', e);
                // "Registration failed - push service error" مش باج في الكود بتاعنا — ده قيد معروف
                // في متصفحات مبنية على Chromium من غير مفاتيح Google الرسمية (Kiwi, Brave, بعض
                // متصفحات الأندرويد المعدّلة)، فبتفشل PushManager.subscribe() جوه المتصفح نفسه
                // مهما كان السيرفر والكود مظبوطين. بنوضحلها للطالب بدل ما يفضل يفتكرها مشكلة في التطبيق.
                const isPushServiceIssue = /push service error|AbortError/i.test(e.message || e.name || '');
                if (isPushServiceIssue) {
                    statusEl.innerHTML = '<span style="color:var(--warning)">المتصفح ده مش بيدعم الإشعارات بشكل كامل (مشكلة معروفة في Kiwi/Brave وبعض متصفحات الأندرويد المعدّلة). جرب تفتح الموقع من Chrome أو Samsung Internet وفعّل الإشعارات من هناك.</span>';
                } else {
                    statusEl.innerHTML = `<span style="color:var(--danger)">تعذر تفعيل الإشعارات — السبب الحقيقي: ${escapeHtml(e.message || String(e))}</span>`;
                }
            }
        }

        // بيجيب بيانات المستخدم كاملة من سيرفر School X وبيبني منها ملخص نصي
        // بيتحط كـ "سياق" جوه الـ system prompt عشان المساعد يعرف يجاوب عليه
        // بيتجدد تلقائيًا كل 3 دقايق (مش في كل رسالة) عشان البيانات (واجبات/غياب/درجات) تفضل حديثة
        let schoolContextFetchedAt = Number(localStorage.getItem('sx_school_context_at') || 0);
        async function fetchSchoolProfile(force) {
            const apiUrl = FIXED_SCHOOL_API_URL;
            if (!schoolToken) return;
            if (!force && schoolContext && (Date.now() - schoolContextFetchedAt) < 3 * 60 * 1000) return;
            try {
                const res = await fetch(`${apiUrl}/api/me`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (res.status === 401) { schoolLogout(); return; }
                const data = await res.json();
                if (!res.ok) return;
                schoolContext = buildSchoolContextText(data);
                schoolContextFetchedAt = Date.now();
                localStorage.setItem('sx_school_context', schoolContext);
                localStorage.setItem('sx_school_context_at', String(schoolContextFetchedAt));
                // بنحتفظ بالبروفايل كامل (فيه isVerified وavatarUrl) عشان نحدّث بيه شارة
                // التوثيق جنب اسم الطالب في السايدبار، وصورته في فقاعات رسايله في الشات.
                currentUserProfile = { ...(data.profile || {}), type: data.type };
                applySidebarIdentity();
                refreshRenderedUserAvatars();
                if (data.type === 'student') {
                    checkUpcomingHomeworkAlert(data.pendingHomework || []);
                    handlePremiumFeaturesUpdate(data.profile?.premiumFeatures || []);
                }
                loadDeepThinkStatus();
                refreshTelegramLinkUI();
            } catch (e) { /* السيرفر مش متاح دلوقتي، هنستخدم آخر نسخة متخزنة */ }
        }

        // بتحدّث دايرة الصورة وشارة التوثيق جنب اسم الطالب في أسفل السايدبار، بناءً على
        // آخر بروفايل معروف (currentUserProfile). بترجع للحالة الافتراضية (أيقونة الكاب،
        // من غير شارة) لو مفيش تسجيل دخول أو الحساب لسه مش موثّق.
        function applySidebarIdentity() {
            const nameTextEl = document.getElementById('sbUserNameText');
            const badgeEl = document.getElementById('sbUserNameBadge');
            const avatarBox = document.getElementById('sbUserAvatarBox');
            if (!nameTextEl) return;
            const p = currentUserProfile;
            if (schoolToken && p) {
                const name = p.fullName || (schoolUser && (schoolUser.fullName || schoolUser.username)) || 'طالب Chat X';
                nameTextEl.textContent = name;
                if (badgeEl) {
                    if (p.isVerified) { badgeEl.innerHTML = verifiedBadgeIconHtml(13); badgeEl.style.display = 'inline-flex'; }
                    else { badgeEl.style.display = 'none'; badgeEl.innerHTML = ''; }
                }
                if (avatarBox) {
                    avatarBox.innerHTML = p.avatarUrl
                        ? `<img src="${escapeHtml(p.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius: var(--radius-sm);">`
                        : '<i class="fas fa-user-graduate"></i>';
                }
            } else {
                if (badgeEl) { badgeEl.style.display = 'none'; badgeEl.innerHTML = ''; }
                if (avatarBox) avatarBox.innerHTML = '<i class="fas fa-user-graduate"></i>';
            }
        }

        // بتحدّث كل صور المستخدم (الأفاتار) المرسومة بالفعل جوه الشات الحالي فورًا لما
        // بروفايله يتحدّث (بعد تسجيل الدخول، رفع صورة، أو تفعيل/إلغاء التوثيق) — من غير
        // ما نحتاج نعيد رسم الشات كله. ده اللي بيضمن إن صورة الحساب الموثّق تفضل ظاهرة
        // في كل رسايله (القديمة والجديدة) دايمًا، حتى لو الطالب راح صفحة الإعدادات
        // ورجع تاني، من غير ما تتفقد أو ترجع لأيقونة الكاب الافتراضية غلط.
        function refreshRenderedUserAvatars() {
            const container = document.getElementById('chatContainer');
            if (!container) return;
            const p = currentUserProfile;
            const isVerified = !!(p && p.isVerified);
            container.querySelectorAll('.message.user .msg-avatar').forEach(avatar => {
                if (isVerified) {
                    avatar.style.background = 'transparent';
                    avatar.style.border = 'none';
                    avatar.innerHTML = renderVerifiedAvatar(p.fullName, p.avatarUrl, true, 34);
                } else {
                    avatar.style.background = '';
                    avatar.style.border = '';
                    avatar.innerHTML = '<i class="fas fa-user"></i>';
                }
            });
        }


        // بتستخدم /api/notifications الموجود أصلاً (endpoint عام، من غير أي شرط
        // ربط بحساب School X — الإعلانات عامة لكل الطلاب بغض النظر عن حالة الربط).
        let announcementsCache = [];
        async function fetchAnnouncements() {
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/notifications`);
                if (!res.ok) return;
                const list = await res.json();
                announcementsCache = Array.isArray(list) ? list : [];
                updateAnnouncementsBadge();
            } catch (e) { /* السيرفر مش متاح دلوقتي — الجرس هيفضل عادي من غير نقطة */ }
        }
        function updateAnnouncementsBadge() {
            if (!announcementsCache.length) return;
            const lastSeenAt = localStorage.getItem('sx_last_seen_announcement_at') || '';
            const newest = announcementsCache[0]; // الـ API بيرجعهم الأحدث الأول (sort createdAt: -1)
            const hasNew = newest && newest.createdAt && newest.createdAt > lastSeenAt;
            const badge = document.getElementById('announcementsBadge');
            if (badge) badge.style.display = hasNew ? 'block' : 'none';
        }
        function renderAnnouncementsList() {
            const container = document.getElementById('announcementsList');
            if (!announcementsCache.length) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-3);font-size:12.5px;">مفيش إعلانات دلوقتي</p>';
                return;
            }
            container.innerHTML = announcementsCache.slice(0, 30).map((n, i) => `
                <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius: var(--radius-md);padding:12px 14px;">
                    <p style="font-size:13px;line-height:1.7;margin-bottom:8px;white-space:pre-wrap;">${escapeHtml(n.text || '')}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:10.5px;color:var(--text-3);">${escapeHtml(n.date || '')}</span>
                        <button class="icon-btn announcement-speak-btn" style="width:30px;height:30px;font-size:12px;" aria-label="استماع للإعلان" data-text="${escapeHtml(n.text || '')}"><i class="fas fa-volume-high"></i></button>
                    </div>
                </div>
            `).join('');
            // بنربط زرار الاستماع بـ addEventListener بدل onclick inline: أي إعلان فيه علامة تنصيص
            // كان بيكسر الـ onclick لأن JSON.stringify بيحط " حوالين النص فيتقفل الخاصية بدري
            // ويعطل الزرار تمامًا من غير ما يبين أي خطأ — الطريقة دي بتستخدم data-text وبتشتغل مضمون مهما كان محتوى الإعلان.
            container.querySelectorAll('.announcement-speak-btn').forEach(btn => {
                btn.addEventListener('click', () => speakText(btn.dataset.text, btn));
            });
            // آخر إعلان اتفتح له اللستة يتعتبر "مقروء" — بيشيل نقطة التنبيه الحمرا
            if (announcementsCache[0]?.createdAt) {
                localStorage.setItem('sx_last_seen_announcement_at', announcementsCache[0].createdAt);
                updateAnnouncementsBadge();
            }
        }
        function openAnnouncementsModal() {
            openModal('announcementsModal');
            renderAnnouncementsList();
            fetchAnnouncements().then(renderAnnouncementsList); // نحدّث اللستة لو فيه جديد من وقت آخر تحميل
        }
        // نجيب الإعلانات مرة عند فتح التطبيق عشان نقطة التنبيه تبان لو فيه جديد،
        // من غير ما الطالب يحتاج يفتح الجرس الأول عشان يعرف.
        fetchAnnouncements();

        // ====================== Premium: تتبّع المميزات المفعّلة وتهنئة الطالب لما ميزة جديدة تتفتحله ======================
        function handlePremiumFeaturesUpdate(newFeatures) {
            const previouslyKnown = new Set(myPremiumFeatures);
            const justUnlocked = newFeatures.filter(f => !previouslyKnown.has(f) && PREMIUM_LABELS[f]);
            myPremiumFeatures = newFeatures;
            localStorage.setItem('sx_premium_features', JSON.stringify(myPremiumFeatures));
            applyPremiumGatesUI();
            justUnlocked.forEach(key => announcePremiumUnlock(key));
        }

        // بيوري/يخفي أي عنصر جوه data-premium-feature حسب استحقاق الطالب، وبيفعّل ثيم
        // البريميوم الذهبي لو الميزة دي مفعّلة (والطالب مسيبش الثيم متقفل يدويًا من الإعدادات).
        function applyPremiumGatesUI() {
            document.querySelectorAll('[data-premium-feature]').forEach(el => {
                const key = el.dataset.premiumFeature;
                el.classList.toggle('premium-locked', !hasPremium(key));
            });
            const themeManuallyOff = localStorage.getItem('sx_premium_theme_off') === '1';
            document.body.classList.toggle('premium-theme-on', hasPremium('premium_theme') && !themeManuallyOff);

            // زرار البروفايل الأكاديمي الموحّد في السايدبار — لطلاب premium_academic_profile
            // بس (زي باقي أزرار السايدبار المشروطة بلوجن، ده مشروط بالميزة كمان فوق اللوجن).
            const academicProfileBtn = document.getElementById('academicProfileBtn');
            if (academicProfileBtn) academicProfileBtn.style.display = hasPremium('premium_academic_profile') ? 'flex' : 'none';
            const germanProBtn = document.getElementById('germanProBtn');
            if (germanProBtn) germanProBtn.style.display = hasPremium('premium_german_pro') ? 'flex' : 'none';
            const englishProBtn = document.getElementById('englishProBtn');
            if (englishProBtn) englishProBtn.style.display = hasPremium('premium_english_pro') ? 'flex' : 'none';

            // قسم موديلات Premium (Cerebras و Claude Opus): بنخفي القسم كله من القايمة
            // لو الطالب مش مستحق (اسم القسم نفسه بيختفي كمان، مش بس الموديلات جواه)،
            // وأي اختيار قديم متخزّن لأي موديل منهم (من قبل ما نقفله) بنرجعه لـ "تلقائي"
            // بدل ما يفضل عالق عليه.
            const premiumGroup = document.getElementById('premiumModelsGroup');
            const cerebrasOpt = document.getElementById('cerebrasModelOption');
            const claudeOpusOpt = document.getElementById('claudeOpusModelOption');
            const examinerOpt = document.getElementById('examinerModelOption');
            const entitled = hasPremium('premium_ai');
            if (premiumGroup) premiumGroup.style.display = entitled ? '' : 'none';
            if (cerebrasOpt) cerebrasOpt.style.display = entitled ? '' : 'none';
            if (claudeOpusOpt) claudeOpusOpt.style.display = entitled ? '' : 'none';
            if (examinerOpt) examinerOpt.style.display = entitled ? '' : 'none';
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect && (modelSelect.value === 'cerebras' || modelSelect.value === 'claude-opus' || modelSelect.value === 'examiner') && !entitled) {
                modelSelect.value = 'auto';
                saveModelChoice();
            }
        }

        // بيبعت رسالة "تهنئة" في الشات الحالي زي أي رسالة من Chat X عادية، باللهجة المصرية،
        // بدل نداء AI فعلي — عشان تبقى موثوقة ومضمونة 100% ومتعتمدش على تفسير الموديل.
        function announcePremiumUnlock(key) {
            const info = PREMIUM_LABELS[key];
            if (!info) return;
            const chat = chats.find(c => c.id === currentChatId) || chats[0];
            if (!chat) return;
            const msg = {
                role: 'bot',
                content: `🎉 **مبروك يا بطل!**\nالأدمن دلوقتي فعّلّك ميزة بريميوم جديدة:\n\n### ${info.icon} ${info.title}\n${info.desc}\n\nجرّبها وقولّي رأيك فيها، وأي وقت تحب تعرف تفاصيل أكتر اسألني براحتك 🙌`,
                source: 'local', timestamp: Date.now(), id: `msg-${Date.now()}-premium-${key}`
            };
            chat.messages.push(msg);
            if (chat.id === currentChatId) {
                appendMessageToDOM(msg);
                document.getElementById('welcomeScreen').style.display = 'none';
            }
            saveData();
            showToast(`اتفتحلك: ${info.icon} ${info.title}`, 'success');
        }

        function togglePremiumTheme() {
            const isOff = localStorage.getItem('sx_premium_theme_off') === '1';
            if (isOff) { localStorage.removeItem('sx_premium_theme_off'); reportFeatureUsage('premium_theme'); }
            else localStorage.setItem('sx_premium_theme_off', '1');
            applyPremiumGatesUI();
        }

        // خريطة: مفتاح الميزة الكامل → اللاحقة المستخدمة في الـ ids جوه HTML (premium-<suffix>-...)
        const PREMIUM_UI_MAP = {
            premium_ai: 'ai', premium_mock_exams: 'mock', premium_prompts: 'prompts',
            premium_theme: 'theme', premium_drug_library: 'drugs',
            premium_clinical_sim: 'clinical', premium_lecture_audio: 'lecture',
            premium_video_sim: 'videosim', premium_voice: 'voice', premium_skills: 'skills',
            premium_academic_profile: 'academic'
        };
        function openPremiumHub() {
            Object.entries(PREMIUM_UI_MAP).forEach(([key, suffix]) => {
                const unlocked = hasPremium(key);
                const badge = document.getElementById(`premium-${suffix}-badge`);
                if (badge) { badge.textContent = unlocked ? 'مفعّل ✓' : 'مقفول 🔒'; badge.className = unlocked ? 'premium-badge-on' : 'premium-badge-locked'; }
                const action = document.getElementById(`premium-${suffix}-action`);
                const lockNote = document.getElementById(`premium-${suffix}-locknote`);
                if (action) action.style.display = unlocked ? '' : 'none';
                if (lockNote) lockNote.style.display = unlocked ? 'none' : 'block';
            });
            document.getElementById('premiumThemeCheckbox').checked = localStorage.getItem('sx_premium_theme_off') !== '1';
            openModal('premiumHubModal');
            // أول مرة الطالب يفتح الـ Hub، نفتحله الجولة تلقائي بعد نص ثانية (بعد ما يشوف
            // الشاشة نفسها الأول) — من غير ما نضايقه في المرات اللي بعد كده.
            if (localStorage.getItem('sx_premium_guide_seen') !== '1') {
                setTimeout(() => openPremiumGuide(), 500);
            }
        }

        const PREMIUM_GUIDE_STEPS = [
            {
                icon: '👑', title: 'أهلاً بيك في Premium',
                body: 'دي مميزات إضافية بيفعّلها الأدمن لحسابك واحدة واحدة حسب مجهودك ومستواك. اللي مقفول مش عيب فيك — بس محتاج تطلب من الأدمن يفعّله ليك، وهنشرحلك كل ميزة تعمل إيه بالظبط عشان تعرف تطلب الصح.'
            },
            {
                icon: '🧠', title: 'الذكاء الاصطناعي المتقدم',
                body: 'لو مفعّلة، هيظهرلك قسم جديد اسمه "موديلات Premium" فوق قايمة الموديلات فيه Cerebras (أسرع) وClaude Opus (أدق وأعمق في التحليل) — وتقدر تختار أي موديل تحبه من القسم ده أو من الموديلات العامة براحتك في كل رسالة، وحد الرسايل بتاعك بيزيد من 15 لـ 60 رسالة في الدقيقة.'
            },
            {
                icon: '📝', title: 'امتحانات المحاكاة',
                body: 'من الـ Hub دوس "ابدأ امتحان محاكاة" — هيجمّعلك أسئلة من أكتر من فصل زي امتحان حقيقي، وبعد ما تخلص هيديك تقرير أداء وخطة مذاكرة مبنية على نقط ضعفك.'
            },
            {
                icon: '⚡', title: 'مكتبة البرومبتس',
                body: 'دوس "افتح المكتبة" وهتلاقي برومبتس جاهزة ومُختارة (زي "لخصلي المحاضرة دي" أو "اعملي أسئلة مراجعة") — دوس على أي واحد وهيتحط جاهز في صندوق الكتابة تعدّله أو تبعته على طول.'
            },
            {
                icon: '💊', title: 'مكتبة الأدوية الشخصية',
                body: 'لما تفحص علبة دواء بالكاميرا (من أداة فحص الأدوية)، الفحص بيتحفظلك تلقائيًا هنا. دوس "افتح مكتبتي" في أي وقت تراجع كل الأدوية اللي فحصتها قبل كده من غير ما تدور في المحادثات.'
            },
            {
                icon: '🩺', title: 'محاكي المواقف الإكلينيكية',
                body: 'دوس "ابدأ محاكاة جديدة"، اختار التخصص (باطنة، جراحة، طوارئ...)، وهيقدملك حالة مريض واقعية. جاوب زي ما هتتصرف فعليًا خطوة بخطوة، والمحاكي هيكمل معاك الموقف وفي الآخر هيديك تقييم لقراراتك.'
            },
            {
                icon: '🎙️', title: 'ملخص صوتي للمحاضرات',
                body: 'دوس "سجّل محاضرة"، سجّل صوت المحاضر بموبايلك، ولما تخلص دوس إيقاف — هيتحول تلقائيًا لنص كامل، وبعدها لملخص منظم بالنقاط تقدر تراجع بيه بسرعة قبل الامتحان.'
            },
            {
                icon: '🎬', title: 'الفيديو المتفرّع',
                body: 'دوس "ابدأ مشهد جديد"، اختار الحالة، وهتلاقي مشهد سريري بمونيتور وصوت بيوصفلك الموقف. كل ما تختار قرار، الحالة بتتفرّع لمسار مختلف — ممكن توصل لنهاية ممتازة أو نهاية حرجة حسب قراراتك. بعد ما توصل لنهاية، دوس "قيّم قراراتي" عشان الذكاء الاصطناعي يحللّك مسارك بالتفصيل، وجرّب تاني عشان تكتشف باقي النهايات.'
            },
            {
                icon: '🎧', title: 'صوت واقعي فائق',
                body: 'مفيش زرار تدوسه — لو مفعّلة، أي صوت في التطبيق (قراءة الردود، محاكي المواقف، الملخصات الصوتية) بيتحول تلقائيًا لأعلى جودة صوت متاحة، تحس إنه شخص حقيقي بيتكلم مش صوت آلي.'
            },
            {
                icon: '👑', title: 'الشكل الذهبي',
                body: 'لو مفعّلة، تقدر تشغّلها وتطفّيها براحتك من نفس صفحة Premium — فارق شكلي بس، مفيهاش أي تأثير على باقي المميزات.'
            }
        ];
        let premiumGuideIndex = 0;
        function openPremiumGuide() {
            premiumGuideIndex = 0;
            renderPremiumGuideStep();
            openModal('premiumGuideModal');
            localStorage.setItem('sx_premium_guide_seen', '1');
        }
        function renderPremiumGuideStep() {
            const step = PREMIUM_GUIDE_STEPS[premiumGuideIndex];
            const box = document.getElementById('premiumGuideStepBox');
            box.innerHTML = `
                <div style="font-size:44px;margin-bottom:10px;">${step.icon}</div>
                <div style="font-weight:800;font-size:15px;margin-bottom:8px;">${step.title}</div>
                <div style="font-size:12.5px;color:var(--text-2);line-height:1.8;">${step.body}</div>
            `;
            const dots = document.getElementById('premiumGuideDots');
            dots.innerHTML = PREMIUM_GUIDE_STEPS.map((_, i) =>
                `<span style="width:6px;height:6px;border-radius:50%;background:${i === premiumGuideIndex ? 'var(--accent)' : 'var(--border)'};transition: background var(--transition-base);"></span>`
            ).join('');
            document.getElementById('premiumGuidePrevBtn').style.visibility = premiumGuideIndex === 0 ? 'hidden' : 'visible';
            document.getElementById('premiumGuideNextBtn').textContent = premiumGuideIndex === PREMIUM_GUIDE_STEPS.length - 1 ? 'تمام، فهمت!' : 'التالي';
        }
        function premiumGuideStep(direction) {
            if (direction > 0 && premiumGuideIndex === PREMIUM_GUIDE_STEPS.length - 1) {
                closeModal('premiumGuideModal');
                return;
            }
            premiumGuideIndex = Math.max(0, Math.min(PREMIUM_GUIDE_STEPS.length - 1, premiumGuideIndex + direction));
            renderPremiumGuideStep();
        }

        // بيحلل نتائج الطالب مجمّعة حسب اسم كل امتحان (زي "امتحان باطنة"، "امتحان جراحة")
        // ويقارن آخر 3 نتائج بيه في كل مادة مع بعض عشان يعرف هل بيتحسن ولا ثابت ولا بيتراجع.
        // ده تحليل حقيقي مبني على أرقامه هو بس، مش مقارنة بحد تاني.
        function buildPerformanceTrendText(examResults) {
            if (!examResults || examResults.length < 2) return '';
            const groups = {};
            examResults.forEach(r => {
                const key = r.examName || 'اختبارات عامة';
                if (!groups[key]) groups[key] = [];
                groups[key].push(r);
            });

            const lines = [];
            Object.entries(groups).forEach(([subject, results]) => {
                if (results.length < 2) return;
                // الأحدث أولًا في البيانات الأصلية، فبنقلبها عشان نرتبها من الأقدم للأحدث زمنيًا
                const chrono = [...results].sort((a, b) => new Date(a.completionTime) - new Date(b.completionTime));
                const last3 = chrono.slice(-3);
                const toPercent = r => (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : r.score);
                const first = toPercent(last3[0]);
                const last = toPercent(last3[last3.length - 1]);
                const diff = last - first;
                let verdict;
                if (last3.length < 2) return;
                if (diff > 5) verdict = `في تحسّن ملحوظ (كان حواليه ${Math.round(first)}% وبقى ${Math.round(last)}%)`;
                else if (diff < -5) verdict = `في تراجع مؤخرًا (كان حواليه ${Math.round(first)}% ودلوقتي ${Math.round(last)}%)`;
                else verdict = `مستوى ثابت تقريبًا (حوالين ${Math.round(last)}%)`;
                lines.push(`- ${subject}: ${verdict}`);
            });

            if (!lines.length) return '';
            return `تحليل أداء الطالب بمرور الوقت (مقارنة بنفسه هو بس، مش بزمايله):\n${lines.join('\n')}\nاستخدم التحليل ده لو الطالب سأل عن مستواه أو طلب نصيحة للمذاكرة، وشجّعه لو بيتحسن ونبّهه بلطف لو في تراجع من غير ما تحبطه.`;
        }

        function buildSchoolContextText(data) {
            if (data.type === 'admin') {
                const a = data.profile;
                return `المستخدم مسجل دخوله كأدمن في منصة School X.\nالاسم: ${a.fullName}\nاسم المستخدم: ${a.username}`;
            }
            const s = data.profile;
            let text = `المستخدم مسجل دخوله كطالب في منصة School X، وده بياناته الحقيقية والدقيقة من قاعدة البيانات مباشرة (مفيش رقم هنا تقديري أو تخميني):\n`;
            text += `الاسم: ${s.fullName}\nكود الطالب: ${s.studentCode}\nالصف: ${s.grade}\n`;
            if (s.subjects && s.subjects.length) text += `المواد: ${s.subjects.join('، ')}\n`;

            // نتائج الاختبارات - بنذكر صراحة لو مفيش نتايج خالص عشان منسيبش فراغ يتفسر غلط
            if (data.examResults && data.examResults.length) {
                text += `\nنتائج آخر اختبارات (${data.examResults.length}):\n` + data.examResults.slice(0, 10).map(r => {
                    const label = r.examName || `كود ${r.examCode}`;
                    const outOf = r.totalQuestions ? ` من ${r.totalQuestions}` : '';
                    return `- ${label}: ${r.score}${outOf}`;
                }).join('\n') + '\n';

                const trendText = buildPerformanceTrendText(data.examResults);
                if (trendText) text += `\n${trendText}\n`;
            } else {
                text += `\nنتائج الاختبارات: لا توجد أي نتائج اختبارات مسجلة لهذا الطالب في قاعدة البيانات (العدد = 0).\n`;
            }

            // الحضور - أهم حاجة نوضحها بالراحة بالأرقام صراحة عشان محدش يحزر رقم غلط
            const totalAttRecords = (data.attendance && data.attendance.length) || 0;
            if (totalAttRecords > 0) {
                const present = data.attendance.filter(x => x.status === 'present').length;
                const absent = data.attendance.filter(x => x.status === 'absent').length;
                const late = data.attendance.filter(x => x.status === 'late').length;
                text += `\nسجل الحضور (آخر ${totalAttRecords} سجل مأخوذين من قاعدة البيانات مباشرة):\nعدد أيام الحضور = ${present}\nعدد أيام الغياب = ${absent}\nعدد أيام التأخير = ${late}\nهذه الأرقام دقيقة ونهائية، استخدمها كما هي بدون أي تقريب أو تخمين.\n`;
            } else {
                text += `\nسجل الحضور: لا يوجد أي سجل حضور أو غياب مسجل لهذا الطالب في قاعدة البيانات إطلاقًا (لا حضور ولا غياب ولا تأخير مسجل = 0 سجلات). لو الطالب سأل عن غيابه، قوله بوضوح إن مفيش سجل غياب متسجل ليه خالص، ومتقولوش رقم من عندك.\n`;
            }

            // المخالفات - نفس المبدأ: نص صريح حتى لو العدد صفر
            if (data.violations && data.violations.length) {
                text += `\nمخالفات مسجلة (${data.violations.length}):\n` + data.violations.slice(0, 10).map(v => `- ${v.type || ''}: ${v.reason || ''}`).join('\n') + '\n';
            } else {
                text += `\nالمخالفات: لا توجد أي مخالفات مسجلة على هذا الطالب (العدد = 0).\n`;
            }

            if (data.pendingHomework && data.pendingHomework.length) {
                text += `\nواجبات لسه مسلمهاش (${data.pendingHomework.length}):\n` + data.pendingHomework.slice(0, 10).map(h => `- ${h.title} (${h.chapterName}) - آخر موعد: ${h.deadline}`).join('\n') + '\n';
            } else {
                text += `\nمفيش واجبات معلقة عليه دلوقتي (العدد = 0).\n`;
            }
            if (data.activeTournaments && data.activeTournaments.length) {
                text += `\nبطولات نشطة حاليًا:\n` + data.activeTournaments.map(t => `- ${t.title} (كود ${t.code}) - تنتهي ${t.endDate}${t.alreadyJoined ? ' - مشارك فيها بالفعل' : ' - لسه مشاركش فيها'}`).join('\n') + '\n';
            } else {
                text += `\nمفيش بطولات نشطة حاليًا (العدد = 0).\n`;
            }
            return text;
        }

        // بيتضاف قبل الـ system prompt الثابت في كل نداء للـ AI
        function getSystemPrompt(base) {
            base = base || 'أنت مساعد أكاديمي ذكي.';
            let extra = `

معلومات ثابتة عن هويتك — التزم بيها حرفيًا في أي وقت حد يسأل عنها:
- اسم المنصة اللي بتشتغل جواها هو "Chat X"، وده اسمك الرسمي. لو حد سألك "مين عملك؟" أو "مين المطور بتاعك؟" أو "مين صنعك؟" أو "مين الشركة بتاعتك؟" أو أي سؤال مشابه عن هويتك أو هوية Chat X أو مين طوّرها، جاوبه إنك اتصنعت بواسطة web developer اسمه Ahmed Moussa Ahmed Hussin (أحمد موسى أحمد حسين)، وهو من محافظة الأقصر، بأسلوب طبيعي ومختصر.
- "School X" منصة مختلفة تمامًا ومنفصلة عن Chat X — هي منصة مدرسية بيربط الطالب بيها حسابه عشان تجيب بياناته الحقيقية (درجات، حضور، بنك أسئلة). متلخبطش بينها وبين اسمك إنت (Chat X)؛ لو الطالب سأل عن هوية School X أو مين عملها بلاش تتكلم نيابة عنها، وركّز إجابتك على إنك إنت (Chat X) صنعك Ahmed Moussa Ahmed Hussin من محافظة الأقصر.`;
            if (schoolContext) {
                extra += `

أنت مساعد شخصي متكامل للمستخدم، متصل ببيانات حقيقية له من منصة School X. القاعدة الأهم: البيانات المكتوبة تحت في قسم "بيانات المستخدم الحقيقية" هي أرقام نهائية وموثوقة 100% لأنها جاية مباشرة من قاعدة بيانات المدرسة، فالتزم بيها حرفيًا:
- ممنوع منعًا باتًا إنك تخترع أو تقدّر أو "تحزر" أي رقم (زي عدد أيام الغياب أو الدرجات أو عدد المخالفات) من عندك تحت أي ظرف. لو مش متأكد، ارجع اقرأ الرقم من البيانات تحت بالظبط.
- قبل ما ترد على أي سؤال شخصي عن الطالب (غياب، درجات، مخالفات، واجبات)، راجع قسم البيانات تحت أولًا وانقل الرقم المكتوب فيه حرفيًا زي ما هو، متغيرهوش ولا تقربّه.
- كل قسم من البيانات تحت مكتوب فيه رقم صريح حتى لو كان صفر (يعني لو مكتوب "العدد = 0" ده معناه فعلاً صفر وأكيد، مش إن البيانات ناقصة) — استخدم الصفر ده زي ما هو، ومتقولش رقم تاني.
- لو سأل عن نفسه (درجاته، غيابه، مخالفاته، واجباته، البطولات المتاحة) جاوبه منها مباشرة وبالأرقام الحقيقية المكتوبة تحت بالظبط.
- لو عنده واجبات لسه متسلمتش أو بطولة نشطة لسه مشاركش فيها ومناسب تفتكّره، اذكرها له بشكل طبيعي في سياق الكلام لو مناسب.
- لو طلب مساعدة في مذاكرة أو حل واجب أو مراجعة، خد في اعتبارك صفه الدراسي ومستواه من نتائجه لتخصيص المساعدة (لو درجاته ضعيفة في مادة معينة ركز فيها، ولو ممتاز قدّم له تحديات أصعب).
- لو الكلام مش له علاقة ببياناته، اتصرف كمساعد أكاديمي عادي من غير ما تقحم بياناته في الكلام.
- متقولش "مش عندي بيانات عنك" أو حاجة زي كده — البيانات دي معاك فعلاً وموضحة تحت بالتفصيل، حتى لو كانت أصفار.

بيانات المستخدم الحقيقية:
${schoolContext}`;
            }
            extra += `

لو الطالب طلب منك تعمل له اختبار أو تجيب أسئلة من بنك معين، متختلقش أسئلة من عندك — قوله يفتح "🧰 الأدوات" (زرار الآلة الحاسبة) ويختار "بنك الأسئلة" ويحدد المادة والفصل ونوع الأسئلة وعددها، وهيطلعله اختبار حقيقي من بنك المدرسة الفعلي، وبعد ما يجاوب عليه ويبعتلك إجاباته هتصححها له وتشرحله غلطه.`;
            if (hasPremium('premium_ai')) {
                extra += `

الطالب ده مشترك في خطة Premium مفعّلة من الأدمن (متقولوش ده صراحة في كل رد، هو عارف أصلاً وسبق واتهنّى بيها) — بس فعليًا خليك أذكى وأعمق وأشمل معاه من وضعك المعتاد: قدّم شرح أدق وأشمل، اربط المعلومة بسياقات وأمثلة سريرية مفيدة، اقترح خطوات عملية جاهزة بدل الكلام العام، ولو السؤال فيه احتمالات متعددة غطّي أهمها بدل ما تكتفي بسؤاله يوضح. خليك دقيق علميًا ومنظم ومختصر رغم العمق، من غير حشو.`;
            }
            extra += getActiveSkillsPromptBlock();
            if (pendingSkillContext) extra += `\n\n${pendingSkillContext}`;
            if (pendingQuizContext) extra += `\n\n${pendingQuizContext}`;
            const currentChatForSim = chats.find(c => c.id === currentChatId);
            if (currentChatForSim && currentChatForSim.clinicalSimSpecialty) {
                extra += `

المحادثة دي وضعها الخاص "محاكي مواقف إكلينيكية" — التخصص المختار: ${currentChatForSim.clinicalSimSpecialty}. اتصرف كمحرك محاكاة سريرية تفاعلي بالقواعد دي بالظبط:
- اختلق حالة مريض واقعية ومفصّلة تناسب التخصص ده (الاسم، العمر، الشكوى الرئيسية، العلامات الحيوية، التاريخ المرضي المختصر) في أول رد بس.
- بعد عرض الحالة، اسأل الطالب "إيه أول خطوة هتعملها؟" ومتكملش الحالة إلا لما يرد.
- كل رد من الطالب، قيّم قراره بصراحة (صح/فيه خطر/ينفع أحسن)، وكمّل الحالة بناءً على قراره (يتحسن، يتدهور، أو يحصل تعقيد) — خليك واقعي، مش كل حاجة تمشي تمام.
- بعد 4-6 تبادلات (أو لو الطالب قال "خلصنا"/"قيّمني")، اقفل المحاكاة بتقرير تقييم منظم: القرارات الصح، القرارات اللي كانت محتاجة تحسين، ودرجة تقديرية من 10.
- ابدأ من غير أي مقدمة زيادة — اعرض الحالة على طول من أول رد.`;
            }
            if (currentChatForSim && currentChatForSim.videoSimResult) {
                const r = currentChatForSim.videoSimResult;
                extra += `

الطالب لسه خلص "الفيديو المتفرّع" (محاكاة قرارات بمشاهد وصوت) اسمها "${r.scenarioTitle}"، وخد سلسلة قرارات إكلينيكية ووصل لنهاية بمستوى "${r.endingQuality}" (excellent/good/risky/critical). دورك دلوقتي إنك تقيّم قراراته بالتفصيل وبأسلوب مصري صريح ومباشر:
- مسار القرارات اللي اخده بالترتيب:
${r.pathSummary}
- وصف النهاية اللي وصلها: ${r.endingText}
قيّمه: إيه القرارات الصح وليه، إيه اللي كان ممكن يتعمل أحسن وليه بالظبط، درجة تقديرية من 10، وفي الآخر نصيحة عملية واحدة بس يفتكرها المرة الجاية. ابدأ من غير مقدمة زيادة.`;
            }
            if (activeStudyChapterContext) {
                extra += `\n\nالطالب حاليًا "مركّز" على مذاكرة الفصل ده بالذات من بنك المدرسة الحقيقي، فاستخدم محتواه الفعلي في كل شرح أو سؤال بدل معلومات عامة من عندك، وميجيبش حاجة من برا الفصل ده إلا لو الطالب سأل عن حاجة تانية صراحة:\n${activeStudyChapterContext}`;
            }
            // Deep Thinking مفعّل: نضيف تعليمات التركيز والدقة، وكمان نتيجة التحليل
            // الداخلي الحقيقي اللي عمله الموديل في نداء منفصل قبل كده (لو نجح) — شوف
            // runDeepThinkingPass. الهدف إن الإجابة النهائية تتبني فعلاً على تفكير أعمق.
            if (settings.deepThink) {
                extra += DEEP_THINK_FINAL_ANSWER_INSTRUCTION;
                if (deepThinkReasoningContext) {
                    extra += `\n\nده تحليلك الداخلي اللي عملته بنفسك من شوية على نفس سؤال الطالب ده — استخدمه عشان تجاوب بدقة وتركيز، من غير ما تكرره أو تشير إنه موجود:\n${deepThinkReasoningContext}`;
                }
            }
            return base + extra;
        }

        // ====================== بنك الأسئلة (School X) — جلب أسئلة حقيقية وإنشاء اختبارات ======================
        // البنوك دي ملفات ثابتة عامة على سيرفر school x (نفس رابط تسجيل الدخول)، كل ملف فيه
        // متغيّر JS واحد شكله { name, mcq: [{text, options, correct, correctTranslation}, ...], ... }
        const BANK_CATALOG = [
            { subject: 'باطنة وجراحة (بنك 1)', prefix: 'chap', ids: [1,2,3,4,5,6,7,8,10] },
            { subject: 'رعاية التمريض (Nursing Care)', prefix: 'chapter', ids: [1,2,3,4,5,6,7,8,9,10,11] },
            { subject: 'الجراحة العامة (General Surgery)', prefix: 'gs_chapter', ids: [1,2,3,4,5,6,7,8] },
            { subject: 'التشريح (Anatomy)', prefix: 'an1_chapter', ids: [1,2,3,4,5,6,7,8,9,10] },
            { subject: 'تمريض صحة المجتمع (Community Health)', prefix: 'comm1_chapter', ids: [1,2,3,4,5] }
        ];
        let bankChaptersCache = {}; // key: "prefixN" -> {name, mcq:[...]} بعد أول تحميل

        function populateBankSubjects() {
            const sel = document.getElementById('bankSubjectSelect');
            if (!sel || sel.dataset.filled) return;
            sel.dataset.filled = '1';
            BANK_CATALOG.forEach((s, i) => {
                const opt = document.createElement('option');
                opt.value = i; opt.textContent = s.subject;
                sel.appendChild(opt);
            });
        }

        async function populateBankChapters() {
            const subjIdx = document.getElementById('bankSubjectSelect').value;
            const chapSel = document.getElementById('bankChapterSelect');
            chapSel.innerHTML = '<option value="">جاري التحميل...</option>';
            if (subjIdx === '') { chapSel.innerHTML = '<option value="">اختر الفصل...</option>'; return; }
            const subj = BANK_CATALOG[subjIdx];
            const apiUrl = FIXED_SCHOOL_API_URL;
            chapSel.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = ''; defaultOpt.textContent = 'اختر الفصل...';
            chapSel.appendChild(defaultOpt);
            for (const id of subj.ids) {
                const file = `${subj.prefix}${id}.js`;
                const varName = `${subj.prefix}${id}`;
                const cacheKey = varName;
                let data = bankChaptersCache[cacheKey];
                if (!data) {
                    data = await fetchBankFile(apiUrl, file, varName);
                    if (data) bankChaptersCache[cacheKey] = data;
                }
                const opt = document.createElement('option');
                opt.value = cacheKey;
                opt.textContent = data ? (data.name || file) : `${file} (تعذر التحميل)`;
                if (!data) opt.disabled = true;
                chapSel.appendChild(opt);
            }
        }

        // بيجيب كود الملف وينفذه بأمان جوه Web Worker معزول تمامًا عن صفحة الشات — مش زي
        // new Function القديمة اللي كانت بتنفذ الكود بكل صلاحيات الصفحة (وصول لـ localStorage
        // وتوكن تسجيل الدخول وكل حاجة). الـ Worker معندوش أي وصول لـ DOM ولا localStorage
        // ولا الـ cookies بتاعة الصفحة، فحتى لو ملف البنك اتلاعب فيه (سيرفر مخترق أو اعتراض
        // اتصال)، أقصى ضرر ممكن يحصل إنه يرجع بيانات غلط — مش إنه يسرق بيانات الطالب.
        function runInSandboxWorker(code, varName) {
            return new Promise((resolve) => {
                const workerSrc = `
                    self.onmessage = function() {
                        try {
                            ${code}
                            self.postMessage({ ok: true, data: ${varName} });
                        } catch (e) {
                            self.postMessage({ ok: false });
                        }
                    };
                `;
                let worker;
                try {
                    const blob = new Blob([workerSrc], { type: 'application/javascript' });
                    const url = URL.createObjectURL(blob);
                    worker = new Worker(url);
                    const timeout = setTimeout(() => { worker.terminate(); URL.revokeObjectURL(url); resolve(null); }, 5000);
                    worker.onmessage = (e) => {
                        clearTimeout(timeout);
                        worker.terminate();
                        URL.revokeObjectURL(url);
                        resolve(e.data && e.data.ok ? e.data.data : null);
                    };
                    worker.onerror = () => {
                        clearTimeout(timeout);
                        worker.terminate();
                        URL.revokeObjectURL(url);
                        resolve(null);
                    };
                    worker.postMessage('run');
                } catch (e) {
                    resolve(null);
                }
            });
        }

        async function fetchBankFile(apiUrl, file, varName) {
            try {
                const res = await fetch(`${apiUrl}/${file}`);
                if (!res.ok) return null;
                const code = await res.text();
                return await runInSandboxWorker(code, varName);
            } catch (e) { return null; }
        }

        let activeQuiz = null; // {chapterName, questions:[{type, text, options?, correct, completion?}], isMockExam?, timers?}
        // بيتسجل true لما tryGradeActiveQuiz يكون فعلاً صحح إجابات اختبار في الرسالة
        // دي — عشان ميحصلش تعارض مع الكاشف الذكي لأخطاء الشات العادي (detectMistakeInBackground)
        // اللي مايتفعّلش إلا لو الرسالة مش إجابة اختبار رسمي أصلاً.
        let lastTurnWasGradedQuiz = false;
        let mockExamChapters = []; // {cacheKey, subjectName, chapterName} — "عربية" الفصول المضافة لامتحان المحاكاة قبل ما يبدأ
        let mockExamTimers = []; // setTimeout ids لتنبيهات وقت امتحان المحاكاة، بنمسحهم لو الامتحان اتصحح قبل الوقت
        let pendingQuizContext = ''; // بيتحط في الـ system prompt مرة واحدة بعد التصحيح عشان الـ AI يشرح الأخطاء
        let pendingSkillContext = ''; // بيتحط مرة واحدة لما الطالب يختار مهارة بالـ / من زرار الإرفاق
        let activeStudyChapterContext = ''; // محتوى الفصل اللي الطالب "مركّز" عليه دلوقتي
        let activeStudyChapterName = '';

        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // بيوضّح للمستخدم كام سؤال متاح فعليًا من كل نوع في الفصل المختار
        function updateBankTypeCheckboxes() {
            const cacheKey = document.getElementById('bankChapterSelect').value;
            const data = bankChaptersCache[cacheKey];
            const box = document.getElementById('bankTypeChecks');
            if (!box) return;
            const labels = { mcq: 'اختيار من متعدد', truefalse: 'صح / خطأ', complete: 'إكمال الفراغ' };
            box.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                const key = cb.value;
                const n = data && Array.isArray(data[key]) ? data[key].length : 0;
                const labelEl = cb.parentElement;
                labelEl.lastChild.textContent = ` ${labels[key]} (${n})`;
                cb.disabled = n === 0;
                if (n === 0) cb.checked = false;
            });
        }

        function getSelectedBankTypes() {
            return [...document.querySelectorAll('#bankTypeChecks input[type="checkbox"]:checked')].map(cb => cb.value);
        }

        async function generateBankQuiz() {
            const status = document.getElementById('bankQuizStatus');
            const cacheKey = document.getElementById('bankChapterSelect').value;
            const countRaw = parseInt(document.getElementById('bankQuestionCount').value);
            const count = (!countRaw || countRaw <= 0) ? Infinity : countRaw; // 0 أو فاضي = كل الأسئلة المتاحة
            const types = getSelectedBankTypes();
            if (!cacheKey) { status.innerHTML = '<span style="color:var(--danger)">اختر الفصل الأول</span>'; return; }
            if (!types.length) { status.innerHTML = '<span style="color:var(--danger)">اختر نوع سؤال واحد على الأقل</span>'; return; }
            const data = bankChaptersCache[cacheKey];
            if (!data) { status.innerHTML = '<span style="color:var(--danger)">تعذر تحميل بيانات الفصل</span>'; return; }

            // بنجمع الأنواع المختارة كلها في مجموعة واحدة، كل عنصر بياخد نوعه معاه
            let pool = [];
            types.forEach(t => {
                const arr = Array.isArray(data[t]) ? data[t] : [];
                arr.forEach(item => pool.push({ type: t, ...item }));
            });
            if (!pool.length) { status.innerHTML = '<span style="color:var(--danger)">مفيش أسئلة من الأنواع دي في الفصل ده</span>'; return; }

            const picked = shuffleArray(pool).slice(0, Math.min(count, pool.length));
            activeQuiz = { chapterName: data.name, questions: picked };

            let msg = `📚 **اختبار: ${data.name}** (${picked.length} سؤال)\n\n`;
            picked.forEach((q, i) => {
                if (q.type === 'mcq') {
                    msg += `**${i + 1}. [اختيار من متعدد] ${q.text}**\n`;
                    (q.options || []).forEach(o => { msg += `${o}\n`; });
                } else if (q.type === 'truefalse') {
                    msg += `**${i + 1}. [صح / خطأ] ${q.text}**\n`;
                } else if (q.type === 'complete') {
                    msg += `**${i + 1}. [إكمال] ${q.text}**\n`;
                }
                msg += '\n';
            });
            msg += `---\nلما تخلص، اكتبلي إجاباتك سطر لكل سؤال بالشكل ده:\n`;
            msg += `\`1: B\` (لو اختيار من متعدد)\n\`2: صح\` أو \`2: خطأ\`\n\`3: الكلمة الناقصة\`\n\nوأنا هصححها فعليًا وأشرحلك أي غلط.`;

            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                const botMsg = { role: 'bot', content: msg, source: 'local', timestamp: Date.now(), id: `msg-${Date.now()}-quiz` };
                chat.messages.push(botMsg);
                appendMessageToDOM(botMsg);
                saveData();
            }
            closeModal('toolsModal');
            showToast('اتعمل الاختبار — جاوب عليه في الشات', 'success');
        }

        // بتتنادى قبل ما نبعت رسالة المستخدم للـ AI: لو فيه اختبار نشط وجت إجابات فيها
        // شكل "رقم: إجابة"، بيتم تصحيحها فعليًا هنا (مش بالذكاء الاصطناعي) عشان النتيجة تبقى دقيقة 100%،
        // وبعدين بنسيب الـ AI يشرح الأخطاء بس.
        function tryGradeActiveQuiz(userText) {
            lastTurnWasGradedQuiz = false;
            if (!activeQuiz || !activeQuiz.questions.length) return;
            const lines = userText.split('\n').map(l => l.trim()).filter(Boolean);
            const answerMap = {};
            lines.forEach(line => {
                const m = line.match(/^(\d+)\s*[-:]\s*(.+)$/);
                if (m) answerMap[parseInt(m[1])] = m[2].trim();
            });
            const answeredCount = Object.keys(answerMap).length;
            if (answeredCount < Math.ceil(activeQuiz.questions.length / 2)) return; // مش شكل إجابة اختبار، سيبها عادي
            lastTurnWasGradedQuiz = true;

            let correctCount = 0;
            const details = [];
            const arToEn = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };
            Object.entries(answerMap).forEach(([qNumStr, rawAns]) => {
                const qNum = parseInt(qNumStr);
                const q = activeQuiz.questions[qNum - 1];
                if (!q) return;
                let isCorrect = false;
                let correctLabel = '';
                if (q.type === 'mcq') {
                    let ans = rawAns.trim().charAt(0).toUpperCase();
                    if (arToEn[rawAns.trim().charAt(0)]) ans = arToEn[rawAns.trim().charAt(0)];
                    isCorrect = ans === (q.correct || '').toUpperCase();
                    correctLabel = q.correct;
                } else if (q.type === 'truefalse') {
                    const norm = rawAns.trim().toLowerCase();
                    const saidTrue = ['صح', 'صحيح', 't', 'true'].includes(norm);
                    const saidFalse = ['خطأ', 'خطا', 'غلط', 'f', 'false'].includes(norm);
                    if (saidTrue) isCorrect = q.correct === true;
                    else if (saidFalse) isCorrect = q.correct === false;
                    correctLabel = q.correct ? 'صح' : 'خطأ';
                } else if (q.type === 'complete') {
                    const norm = s => (s || '').toString().trim().toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');
                    isCorrect = norm(rawAns) === norm(q.completion);
                    correctLabel = q.completion;
                } else if (q.type === 'chat') {
                    // أسئلة اكتشفها الذكاء الاصطناعي من شات عادي (مش من بنك الأسئلة الرسمي)،
                    // فمفيش خيارات محددة — تصحيح بمطابقة نصية مرنة (مش حرفية 100%) لأن
                    // صياغة الطالب ممكن تختلف عن الصياغة الأصلية حتى لو المعنى صح.
                    const norm = s => (s || '').toString().trim().toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');
                    const a = norm(rawAns), c = norm(q.correct);
                    isCorrect = !!a && !!c && (a === c || a.includes(c) || c.includes(a));
                    correctLabel = q.correct;
                }
                if (isCorrect) correctCount++;
                details.push(`سؤال ${qNum} (${q.type}): إجابة الطالب "${rawAns}" — ${isCorrect ? 'صح ✅' : `غلط ❌ (الصح: ${correctLabel})`}`);

                // بنك أخطائي: لو غلط، يتسجل تلقائي؛ ولو ده كان سؤال من "مراجعة بنك
                // الأخطاء" وجاوبه صح، يتشال من البنك لأنه بقى متقن له.
                // ترتيب الأولوية: sourceChapter (بيجي من امتحان المحاكاة الشامل) ثم
                // chapterName الأصلي بتاع السؤال نفسه (بيجي لو السؤال ده أصلاً راجع
                // من بنك أخطائي وقاعدين بنراجعه تاني) ثم اسم الاختبار الحالي كحل أخير.
                const mistakeChapter = q.sourceChapter || q.chapterName || activeQuiz.chapterName;
                if (!isCorrect) {
                    addMistakeToBank(q, mistakeChapter, rawAns);
                } else if (activeQuiz.isMistakeReview && q.id) {
                    removeMistakeFromBank(q.id);
                }
            });

            const total = activeQuiz.questions.length;
            if (activeQuiz.isMockExam) {
                // تقرير أداء شامل: نجمع عدد الأسئلة المجاوَبة لكل فصل على حدة (مش رقم إجمالي بس)
                // عشان الموديل يقدر يحدد نقط الضعف الحقيقية ويبني خطة مذاكرة عليها.
                // correctCount/details اتحسبوا بالفعل في الحلقة فوق — هنا بس بنجمع توزيع الأسئلة.
                const perChapter = {};
                Object.keys(answerMap).forEach(qNumStr => {
                    const q = activeQuiz.questions[parseInt(qNumStr) - 1];
                    if (!q) return;
                    const key = q.sourceChapter || activeQuiz.chapterName;
                    perChapter[key] = (perChapter[key] || 0) + 1;
                });
                const breakdownLines = Object.entries(perChapter).map(([ch, n]) => `- ${ch}: ${n} سؤال`);
                pendingQuizContext = `نتيجة "امتحان محاكاة شامل": ${correctCount} من ${total} (${Math.round(correctCount / total * 100)}%).\nتوزيع الأسئلة على الفصول:\n${breakdownLines.join('\n')}\n\nتفاصيل كل سؤال (الأرقام دي مرتبطة بترتيب الأسئلة في الامتحان):\n${details.join('\n')}\n\nمطلوب منك دلوقتي: اكتب "تقرير امتحان محاكاة" منظم فيه: (1) الدرجة الكلية والنسبة المئوية، (2) أداء الطالب في كل فصل على حدة (كويس/متوسط/ضعيف) بناءً على أخطاءه الموزعة عليهم، (3) أهم ٢-٣ نقط ضعف حقيقية ظاهرة من الأخطاء، (4) خطة مذاكرة عملية ومختصرة للأيام الجاية تركز على النقط دي بالذات. خليك متحمس ومشجع بس صريح وواقعي.`;
            } else {
                pendingQuizContext = `نتيجة تصحيح اختبار "${activeQuiz.chapterName}": ${correctCount} من ${total}.\nتفاصيل التصحيح (استخدمها عشان تشرح للطالب أخطاءه فقط بأسلوب تعليمي مبسط، ومتكررش كل التفاصيل لو مش لازم):\n${details.join('\n')}`;
            }
            if (activeQuiz.isMockExam) { mockExamTimers.forEach(id => clearTimeout(id)); mockExamTimers = []; }
            activeQuiz = null; // خلصنا الاختبار ده
        }

        // ====================== وضع "التركيز" على فصل معين — المساعد يذاكره مع الطالب بمحتواه الحقيقي ======================
        function buildChapterStudyText(data) {
            let t = `اسم الفصل: ${data.name}\n`;
            if (data.definitions && data.definitions.length) {
                t += `\nالتعريفات (${data.definitions.length}):\n` + data.definitions.map(d => `- ${d.text}${d.translation ? ' | ' + d.translation : ''}`).join('\n') + '\n';
            }
            if (data.explain && data.explain.length) {
                t += `\nأسئلة شرح ومقالية (${data.explain.length}):\n` + data.explain.map(e => `- س: ${e.text}\n  ج: ${e.answer}`).join('\n') + '\n';
            }
            if (data.list && data.list.length) {
                t += `\nقوائم/خطوات (${data.list.length}):\n` + data.list.map(l => `- ${l.text}: ${(l.items || []).join(' | ')}`).join('\n') + '\n';
            }
            if (data.mcq && data.mcq.length) {
                t += `\nأمثلة أسئلة اختيار من متعدد (${data.mcq.length} سؤال متاح، دي عينة بس):\n` + data.mcq.slice(0, 15).map(q => `- ${q.text} → الإجابة: ${q.correct}`).join('\n') + '\n';
            }
            if (data.truefalse && data.truefalse.length) {
                t += `\nأمثلة صح/خطأ (${data.truefalse.length} متاح):\n` + data.truefalse.slice(0, 10).map(q => `- ${q.text} → ${q.correct ? 'صح' : 'خطأ'}`).join('\n') + '\n';
            }
            return t;
        }

        async function focusOnBankChapter() {
            const status = document.getElementById('bankFocusStatus');
            const cacheKey = document.getElementById('bankChapterSelect').value;
            if (!cacheKey) { status.innerHTML = '<span style="color:var(--danger)">اختر الفصل الأول</span>'; return; }
            const data = bankChaptersCache[cacheKey];
            if (!data) { status.innerHTML = '<span style="color:var(--danger)">تعذر تحميل بيانات الفصل</span>'; return; }
            activeStudyChapterContext = buildChapterStudyText(data);
            activeStudyChapterName = data.name;
            status.innerHTML = `<span style="color:var(--success)">تمام ✓ المساعد بقى مركّز على: ${data.name}</span>`;
            showToast(`المساعد دلوقتي بيذاكرلك: ${data.name}`, 'success');
            closeModal('toolsModal');
        }

        function clearBankChapterFocus() {
            activeStudyChapterContext = '';
            activeStudyChapterName = '';
            const status = document.getElementById('bankFocusStatus');
            if (status) status.innerHTML = 'اتلغى التركيز';
            showToast('اتلغى تركيز المساعد على الفصل', 'success');
        }

        // ====================== Premium: مكتبة البرومبتس الذكية ======================
        const PREMIUM_PROMPTS = [
            // ===== مذاكرة =====
            { cat: 'مذاكرة', label: 'اشرحلي بالتشبيه', text: 'اشرحلي [الموضوع] بطريقة مبسطة جدًا باستخدام تشبيه من الحياة اليومية، وبعدها اديني مثال سريري واقعي عليه.' },
            { cat: 'مذاكرة', label: 'خريطة ذهنية نصية', text: 'اعملي خريطة ذهنية نصية (تسلسل هرمي بالنقط) لموضوع [الموضوع]، تجمع فيها كل الأفكار الفرعية والعلاقة بينها.' },
            { cat: 'مذاكرة', label: 'قارن بين حاجتين', text: 'اعملي جدول مقارنة تفصيلي بين [الحاجة الأولى] و[الحاجة التانية] من ناحية الأسباب والأعراض والعلاج والفرق الأساسي بينهم.' },
            { cat: 'مذاكرة', label: 'ملخص من محاضرة طويلة', text: 'هبعتلك محتوى محاضرة [الموضوع] كامل، لخصهولي في نقط مرتبة حسب الأهمية، وحط تحت كل نقطة سطر واحد يشرحها ببساطة.' },
            { cat: 'مذاكرة', label: 'اسألني زي الامتحان', text: 'اسألني سؤال سؤال عن [الموضوع] زي ما هيجيلي في الامتحان بالظبط، واستنى إجابتي قبل ما تنتقل للسؤال اللي بعده وصححلي فورًا.' },
            { cat: 'مذاكرة', label: 'اشرح بالعكس', text: 'ابدأ من النتيجة أو المضاعفات بتاعة [الحالة/المرض]، وارجعلي خطوة خطوة لحد السبب الأصلي، عشان أفهم الترابط.' },
            { cat: 'مذاكرة', label: 'جدول مذاكرة أسبوعي', text: 'اعملي جدول مذاكرة أسبوعي لمادة [المادة] موزّع على [عدد] أيام، آخد بالي فيه من وقت المحاضرات والراحة، وحدد أولوية كل موضوع.' },
            { cat: 'مذاكرة', label: 'اختصر بالاختصارات', text: 'اديني طريقة تذكر (mnemonic) أو اختصار بالحروف يساعدني أفتكر [الموضوع] بسهولة وقت الامتحان.' },
            { cat: 'مذاكرة', label: 'اشرحلي زي إني في أول سنة', text: 'اشرحلي [الموضوع] من الصفر تمامًا، زي إني ماخدتش أي خلفية عنه قبل كده، وابدأ بأبسط تعريف ممكن.' },
            { cat: 'مذاكرة', label: 'لخص في جملة واحدة', text: 'لخصلي كل نقطة من نقط [الموضوع] في جملة واحدة بس قصيرة وواضحة، عشان أراجعها بسرعة قبل الامتحان.' },

            // ===== امتحانات =====
            { cat: 'امتحانات', label: 'أسئلة تركيز أخير', text: 'أنا هدخل امتحان في [المادة] بعد كام ساعة، اديني ٥ أسئلة سريعة على أكتر نقط بيتكرر ذكرها في امتحانات المادة دي، وصححلي بعد ما أجاوب.' },
            { cat: 'امتحانات', label: 'فخاخ الأسئلة الشائعة', text: 'إيه أكتر ٥ أخطاء شائعة بيقع فيها طلاب التمريض وقت الإجابة على أسئلة [الموضوع]؟ وضحلي ليه بالظبط بيغلطوا فيها.' },
            { cat: 'امتحانات', label: 'اختبار MCQ سريع', text: 'اعملي اختبار من ١٠ أسئلة اختيار من متعدد على موضوع [الموضوع]، وبعد ما أجاوب عليهم كلهم اديني النتيجة وشرح لكل إجابة غلط.' },
            { cat: 'امتحانات', label: 'سؤال مقالي وتقييمه', text: 'اديني سؤال مقالي (Essay) زي أسئلة امتحان [المادة]، وبعد ما أكتب إجابتي قيّمها زي ما المصحح هيعمل بالظبط وقولي هعدي بيها كام.' },
            { cat: 'امتحانات', label: 'تجهيز ليوم قبل الامتحان', text: 'حطلي خطة مراجعة ليوم واحد قبل امتحان [المادة]، مقسّمة بالساعة، تركز بس على أهم النقط اللي المفروض ماتفوتنيش.' },
            { cat: 'امتحانات', label: 'أسئلة NCLEX-style', text: 'اديني ٥ أسئلة بستايل NCLEX (اختيار من متعدد سريري) عن [الموضوع]، وبعد إجابتي اشرحلي المنطق الإكلينيكي وراء الإجابة الصح.' },
            { cat: 'امتحانات', label: 'ترتيب أولويات (Priority)', text: 'اديني سؤال "ترتيب الأولويات" (زي إيه أول إجراء تعمله) في حالة [الحالة]، وبعد ما أرتب اشرحلي ليه الترتيب ده هو الصح.' },
            { cat: 'امتحانات', label: 'تحليل سؤال معقد', text: 'ده نص سؤال امتحان معقد وطويل: [الصق السؤال هنا]. ساعدني أحلله خطوة خطوة عشان أوصل للإجابة الصح من غير ما أستعجل.' },
            { cat: 'امتحانات', label: 'مراجعة قبل الفاينال', text: 'اعملي خطة مراجعة شاملة لمادة [المادة] كلها قبل الفاينال، تجمع فيها أهم المواضيع اللي شكلها هتيجي بقوة، مرتبة حسب الأولوية.' },
            { cat: 'امتحانات', label: 'تدريب على الوقت', text: 'اديني ٥ أسئلة متنوعة عن [الموضوع] وحطلي مؤقّت افتراضي دقيقة لكل سؤال، وقولي بعدين هل سرعتي في التفكير كانت مناسبة ولا لأ.' },

            // ===== سريري =====
            { cat: 'سريري', label: 'خطة رعاية تمريضية', text: 'اكتبلي خطة رعاية تمريضية (Nursing Care Plan) كاملة لمريض حالته [الحالة]، شاملة nursing diagnosis وgoals وinterventions وevaluation.' },
            { cat: 'سريري', label: 'خطوات إجراء عملي', text: 'اديني خطوات إجراء [اسم الإجراء] بالترتيب الصح خطوة خطوة، وأهم نقطة أمان وسلامة (safety) في كل خطوة.' },
            { cat: 'سريري', label: 'قراءة العلامات الحيوية', text: 'العلامات الحيوية لمريضي كانت [القيم]، فسّرلي إيه اللي طبيعي وإيه اللي مش طبيعي، وإيه أول حاجة المفروض أعملها لو فيه خطر.' },
            { cat: 'سريري', label: 'تشخيص تمريضي مناسب', text: 'المريض عنده [الأعراض/الحالة]، اديني أكتر ٣ تشخيصات تمريضية (Nursing Diagnosis) مناسبة له مرتبة حسب الأولوية، مع سبب اختيار كل واحدة.' },
            { cat: 'سريري', label: 'تفسير نتيجة تحليل', text: 'نتيجة تحليل [اسم التحليل] بتاعت المريض كانت [القيمة]، اشرحلي المعنى الإكلينيكي وإيه اللي المفروض أراقبه أو أبلغ عنه.' },
            { cat: 'سريري', label: 'قراءة رسم القلب ECG', text: 'اشرحلي إزاي أقرأ رسم قلب (ECG) بشكل منظم خطوة بخطوة، وإيه علامات [نوع اضطراب معين] بالتحديد لو ظهرت فيه.' },
            { cat: 'سريري', label: 'خطوات التعامل مع طوارئ', text: 'لو المريض حصله فجأة [الموقف الطارئ]، اديني الخطوات المفروض أعملها بالترتيب من ثانية واحدة، وإيه أهم حاجة متعملهاش.' },
            { cat: 'سريري', label: 'تقييم شامل للمريض (Assessment)', text: 'ساعدني أعمل head-to-toe assessment كامل لمريض حالته [الحالة]، ووضحلي إيه اللي المفروض أركز عليه أكتر بسبب حالته دي.' },
            { cat: 'سريري', label: 'مقارنة بين تشخيصين متشابهين', text: 'إزاي أفرّق سريريًا بين [الحالة الأولى] و[الحالة التانية]؟ الاتنين أعراضهم متشابهة وعايز أعرف علامات التفريق الدقيقة.' },
            { cat: 'سريري', label: 'التعامل مع مضاعفات', text: 'إيه أهم المضاعفات المحتملة لحالة [الحالة/الإجراء]، وإزاي أراقب المريض عشان أكتشفها بدري قبل ما تتفاقم؟' },

            // ===== أدوية =====
            { cat: 'أدوية', label: 'ملخص دوا كامل', text: 'اديني ملخص شامل عن دواء [اسم الدواء]: الفئة، الآلية، الجرعة، أهم التداخلات الدوائية، والـ nursing considerations المهمة.' },
            { cat: 'أدوية', label: 'مقارنة بين دوائين', text: 'قارن لي بين [الدواء الأول] و[الدواء التاني] من ناحية الآلية والاستخدام والفرق الجوهري بينهم، عشان أفرق بينهم في الامتحان.' },
            { cat: 'أدوية', label: 'الآثار الجانبية الخطيرة', text: 'إيه أخطر الآثار الجانبية لدواء [اسم الدواء] اللي المفروض أراقبها في المريض فورًا وأبلغ عنها لو ظهرت؟' },
            { cat: 'أدوية', label: 'حساب الجرعة', text: 'ساعدني أحسب الجرعة الصح لدواء [اسم الدواء] لمريض وزنه [الوزن]، ووريني خطوات الحساب كاملة عشان أفهم الطريقة مش بس الرقم.' },
            { cat: 'أدوية', label: 'قبل ما أدّي الدوا', text: 'إيه أهم ٥ حاجات المفروض أتأكد منها قبل ما أدّي دواء [اسم الدواء] للمريض (checks قبل الإعطاء)؟' },
            { cat: 'أدوية', label: 'أدوية فئة معينة', text: 'اديني قائمة بأهم أدوية فئة [اسم الفئة الدوائية] مع أهم فرق واحد بين كل دوا والتاني في الفئة دي.' },
            { cat: 'أدوية', label: 'تداخلات دوائية خطيرة', text: 'المريض بياخد [الدواء الأول] و[الدواء التاني] مع بعض، فيه تداخل دوائي خطير بينهم؟ ولو فيه، إزاي أتصرف كممرض؟' },
            { cat: 'أدوية', label: 'دوا في حالات خاصة', text: 'هل دواء [اسم الدواء] آمن لمريض عنده [حالة خاصة زي الحمل/الفشل الكلوي]؟ اشرحلي السبب والاحتياطات المطلوبة.' },
            { cat: 'أدوية', label: 'طرق الإعطاء المختلفة', text: 'اشرحلي الفرق بين إعطاء دواء [اسم الدواء] بطريقة [IV/IM/PO...]، ومميزات وعيوب كل طريقة في الحالة دي.' },
            { cat: 'أدوية', label: 'التسمم الدوائي وعلاجه', text: 'إيه علامات جرعة زيادة (Overdose/Toxicity) من دواء [اسم الدواء]، وإيه الترياق أو التدخل المطلوب فورًا؟' },

            // ===== مهارات عملية =====
            { cat: 'مهارات عملية', label: 'تحضير لتقديم كيس (Case)', text: 'هقدم case presentation عن مريض بحالة [الحالة]، اديني تقسيم منظم للعرض (تاريخ مرضي، فحص، تشخيص، خطة علاج) وأهم الأسئلة المتوقعة من الدكتور.' },
            { cat: 'مهارات عملية', label: 'خطوات مهارة عملية بالتفصيل', text: 'اشرحلي مهارة [اسم المهارة، زي تركيب كانيولا أو قسطرة] خطوة بخطوة زي ما هينفذها في السكيل لاب بالظبط، مع نقط الأمان.' },
            { cat: 'مهارات عملية', label: 'تحضير للامتحان العملي (OSCE)', text: 'هدخل امتحان عملي (OSCE) على مهارة [اسم المهارة]، اديني الخطوات اللي المفروض ألتزم بيها وإيه أكتر حاجة بتفصّل الطلاب فيها.' },
            { cat: 'مهارات عملية', label: 'أدوات ومستلزمات إجراء', text: 'إيه كل الأدوات والمستلزمات اللي محتاجها قبل ما أبدأ إجراء [اسم الإجراء]، عشان أجهزها كلها الأول من غير ما أفوّت حاجة.' },
            { cat: 'مهارات عملية', label: 'كيف أتعامل مع مريض قلقان', text: 'المريض قلقان جدًا وخايف من إجراء [اسم الإجراء]، اديني كلام أقوله له عشان أطمّنه وأشرحله بأسلوب بسيط قبل ما أبدأ.' },
            { cat: 'مهارات عملية', label: 'خطأ حصل أثناء إجراء', text: 'حصل [وصف الموقف/الخطأ] أثناء إجراء [اسم الإجراء]، إيه الخطوة الصح اللي المفروض أعملها دلوقتي فورًا؟' },
            { cat: 'مهارات عملية', label: 'تجهيز غرفة/سرير المريض', text: 'اديني checklist لتجهيز [غرفة العمليات/سرير المريض] قبل استقبال حالة [الحالة]، عشان مافيش حاجة تفوتني.' },
            { cat: 'مهارات عملية', label: 'تعقيم ومنع العدوى', text: 'إيه خطوات التعقيم الصح ومنع العدوى المطلوبة أثناء تنفيذ [اسم الإجراء]، وإيه أكتر غلطة شائعة بتحصل فيها؟' },
            { cat: 'مهارات عملية', label: 'تدريب سؤال وجواب على مهارة', text: 'اسألني أسئلة سريعة عن خطوات مهارة [اسم المهارة] زي ما الدكتور هيسألني في الامتحان الشفوي، وصححلي أول بأول.' },
            { cat: 'مهارات عملية', label: 'الفرق بين طريقتين لنفس الإجراء', text: 'إيه الفرق بين طريقة [الطريقة الأولى] و[الطريقة التانية] لتنفيذ [اسم الإجراء]، ومتى بستخدم كل واحدة فيهم؟' },

            // ===== لغة =====
            { cat: 'لغة', label: 'مصطلحات طبية بالعربي والإنجليزي', text: 'اديني أهم ١٠ مصطلحات طبية خاصة بموضوع [الموضوع] بالإنجليزي مع نطقها والمعنى بالعربي البسيط.' },
            { cat: 'لغة', label: 'فك تحليل مصطلح مركب', text: 'المصطلح ده [اكتب المصطلح] مركب من أكتر من جزء، فكّهولي جزء جزء (prefix/root/suffix) واشرحلي معنى كل جزء عشان أفهمه من جذوره.' },
            { cat: 'لغة', label: 'اختصارات طبية شائعة', text: 'اديني قائمة بأكتر الاختصارات الطبية استخدامًا في قسم [اسم القسم، زي ICU أو ER] مع المعنى الكامل بالإنجليزي والعربي.' },
            { cat: 'لغة', label: 'ترجمة تقرير طبي', text: 'ده تقرير/ملاحظة طبية بالإنجليزي: [الصق النص]. ترجملي المعنى بالعربي المبسط وفسّر أي مصطلح صعب فيه.' },
            { cat: 'لغة', label: 'الفرق بين مصطلحين متشابهين', text: 'إيه الفرق بالظبط بين [مصطلح أول] و[مصطلح تاني]؟ بيتلخبطوا مع بعض كتير وعايز أفهم الفرق الدقيق بينهم.' },
            { cat: 'لغة', label: 'جملة إنجليزي للتواصل مع مريض', text: 'اديني جمل إنجليزي بسيطة وشائعة أقولها لمريض متكلمش عربي وأنا بعمل معاه [الإجراء/الموقف].' },
            { cat: 'لغة', label: 'تدريب نطق مصطلحات', text: 'اديني ٥ مصطلحات طبية صعبة النطق في موضوع [الموضوع]، واكتب النطق الصوتي لكل واحد بالعربي عشان أتمرن عليه.' },
            { cat: 'لغة', label: 'كتابة ملاحظة تمريضية بالإنجليزي', text: 'ساعدني أكتب nursing note بالإنجليزي بصيغة احترافية عن الموقف ده: [وصف الموقف]، بنفس الأسلوب المستخدم في التقارير الطبية.' },
            { cat: 'لغة', label: 'قاموس مصطلحات قسم كامل', text: 'اعملي قاموس مصغّر بأهم ١٥ مصطلح لازم أعرفهم قبل ما أبدأ تدريب في قسم [اسم القسم]، مرتبين حسب الأهمية.' },
            { cat: 'لغة', label: 'فهم سؤال بالإنجليزي معقد', text: 'مش فاهم السؤال ده بالإنجليزي كويس: [الصق السؤال]، اشرحلي المطلوب بالظبط بالعربي المبسط من غير ما تجاوب عني.' },

            // ===== تمريض الطوارئ =====
            { cat: 'تمريض الطوارئ', label: 'أولويات في حالة طوارئ', text: 'مريض دخل الطوارئ بحالة [وصف الحالة]، رتبلي أولويات التعامل معاه من أول ثانية باستخدام مبدأ ABCDE بالتفصيل.' },
            { cat: 'تمريض الطوارئ', label: 'خطوات الإنعاش القلبي الرئوي', text: 'اشرحلي خطوات CPR كاملة بالترتيب الصح حسب أحدث الإرشادات، ووضحلي الفرق لو المريض بالغ أو طفل.' },
            { cat: 'تمريض الطوارئ', label: 'Triage وتصنيف الحالات', text: 'إزاي أصنّف حالة [وصف الحالة] في نظام الفرز (Triage) في الطوارئ، وإيه اللون/الأولوية المفروض تاخدها؟' },
            { cat: 'تمريض الطوارئ', label: 'التعامل مع نزيف حاد', text: 'المريض عنده نزيف حاد من [مكان النزيف]، إيه الخطوات الفورية اللي المفروض أعملها لوقف النزيف واستقرار حالته؟' },
            { cat: 'تمريض الطوارئ', label: 'التعامل مع تسمم أو جرعة زيادة', text: 'مريض جاله جرعة زيادة أو تسمم من [المادة]، إيه أول تدخل تمريضي والخطوات اللي المفروض أتابعها؟' },
            { cat: 'تمريض الطوارئ', label: 'التعامل مع صدمة (Shock)', text: 'المريض عنده علامات [نوع الصدمة]، اشرحلي إزاي أتعرف عليها بدري وإيه التدخلات التمريضية الفورية المطلوبة.' },
            { cat: 'تمريض الطوارئ', label: 'حالة تنفسية حرجة', text: 'مريض بيعاني من ضيق تنفس حاد بسبب [السبب]، إيه الخطوات اللي المفروض أعملها فورًا قبل وصول الطبيب؟' },
            { cat: 'تمريض الطوارئ', label: 'إصابات وكسور', text: 'إزاي أتعامل تمريضيًا مع مريض عنده [نوع إصابة/كسر] لحد ما ينقل لقسم متخصص، وإيه اللي متمنوعش أعمله؟' },
            { cat: 'تمريض الطوارئ', label: 'حالة تشنجات (Seizure)', text: 'المريض بيعمل تشنجات دلوقتي قدامي، إيه الخطوات المفروض أعملها لحمايته لحد ما التشنج يخلص؟' },
            { cat: 'تمريض الطوارئ', label: 'تجهيز عربة الطوارئ', text: 'اديني قائمة بمحتويات عربة الطوارئ (Crash Cart) الأساسية ودور كل قسم فيها وقت الحالات الحرجة.' },

            // ===== رعاية الأطفال والولادة =====
            { cat: 'رعاية الأطفال والولادة', label: 'تقييم علامات حيوية لطفل', text: 'اشرحلي المعدل الطبيعي للعلامات الحيوية لطفل عمره [العمر]، وإيه اللي يعتبر غير طبيعي ومحتاج تنبيه فوري.' },
            { cat: 'رعاية الأطفال والولادة', label: 'حساب جرعة دوا للأطفال', text: 'ساعدني أحسب جرعة دواء [اسم الدواء] المناسبة لطفل وزنه [الوزن]، ووريني طريقة الحساب كاملة خطوة بخطوة.' },
            { cat: 'رعاية الأطفال والولادة', label: 'التعامل مع طفل خايف من الإجراء', text: 'الطفل خايف جدًا من [الإجراء]، اديني أسلوب تواصل مناسب لعمره عشان أهدّيه وأخلّيه يتعاون من غير ترويع.' },
            { cat: 'رعاية الأطفال والولادة', label: 'رعاية ما بعد الولادة', text: 'اديني أهم نقط الرعاية التمريضية للأم في أول ٢٤ ساعة بعد الولادة، وإيه علامات الخطر اللي المفروض أراقبها.' },
            { cat: 'رعاية الأطفال والولادة', label: 'رعاية المولود حديث الولادة', text: 'إيه أهم فحوصات وتقييمات المولود حديث الولادة (Newborn Assessment) في أول ساعات بعد الولادة؟' },
            { cat: 'رعاية الأطفال والولادة', label: 'مراحل نمو الطفل', text: 'إيه العلامات التنموية الطبيعية (Milestones) المتوقعة لطفل عمره [العمر]، وإيه اللي لو اتأخر يعتبر مؤشر خطر؟' },
            { cat: 'رعاية الأطفال والولادة', label: 'تثقيف الأم الجديدة', text: 'حضّرلي نقط تثقيف صحي بسيطة أقولها لأم جديدة عن [موضوع، زي الرضاعة الطبيعية أو العناية بالسرة].' },
            { cat: 'رعاية الأطفال والولادة', label: 'مضاعفات الحمل', text: 'إيه علامات الخطر اللي المفروض أراقبها عند حامل عندها [حالة، زي تسمم الحمل]، وإيه دوري التمريضي في متابعتها؟' },
            { cat: 'رعاية الأطفال والولادة', label: 'التطعيمات حسب العمر', text: 'اديني جدول التطعيمات المفروضة لطفل عمره [العمر]، وإيه الآثار الجانبية الطبيعية اللي أطمّن الأهل بيها.' },
            { cat: 'رعاية الأطفال والولادة', label: 'أمراض الأطفال الشائعة', text: 'اشرحلي أهم أعراض وعلامات [مرض شائع عند الأطفال] وإزاي تختلف الرعاية التمريضية له عن حالة نفسها عند الكبار.' },

            // ===== التواصل والتوثيق =====
            { cat: 'التواصل والتوثيق', label: 'كتابة تقرير تمريضي', text: 'ساعدني أكتب تقرير تمريضي (Nursing Report) منظم عن نوبتي اليوم، هقولك التفاصيل وأنت رتبها بالصيغة الاحترافية الصح.' },
            { cat: 'التواصل والتوثيق', label: 'تسليم مناوبة (Handover)', text: 'حضّرلي طريقة تسليم مناوبة منظمة (زي SBAR) عن مريض حالته [الحالة]، عشان أوصّل المعلومة كاملة وواضحة للزميلة الجاية.' },
            { cat: 'التواصل والتوثيق', label: 'التعامل مع أهل قلقانين', text: 'أهل المريض قلقانين وبيسألوا أسئلة كتير عن حالته، اديني أسلوب أرد بيه بهدوء ووضوح من غير ما أطلع بره حدود دوري.' },
            { cat: 'التواصل والتوثيق', label: 'توصيل خبر صعب بأسلوب مناسب', text: 'محتاج أوصّل معلومة صعبة/حساسة للمريض أو أهله عن [الموقف]، اديني أسلوب تواصل تمريضي مناسب ومتعاطف.' },
            { cat: 'التواصل والتوثيق', label: 'توثيق موقف حرج قانونيًا', text: 'حصل [وصف الموقف] وعايز أوثقه صح في ملف المريض بطريقة دقيقة ومهنية تحميني قانونيًا وتوضح اللي حصل بالظبط.' },
            { cat: 'التواصل والتوثيق', label: 'التعامل مع مريض غاضب', text: 'المريض غاضب وبيتكلم بعصبية معايا، اديني طريقة أتعامل بيها معاه وأهدّي الموقف من غير ما أفقد احترافيتي.' },
            { cat: 'التواصل والتوثيق', label: 'أسئلة تقييم نفسي/اجتماعي', text: 'اديني أسئلة مناسبة أسألها للمريض عشان أعمل تقييم نفسي واجتماعي بسيط ضمن التقييم الشامل بتاعه.' },
            { cat: 'التواصل والتوثيق', label: 'صياغة خطة تثقيف صحي', text: 'ساعدني أجهز خطة تثقيف صحي (Health Education) للمريض عن [الموضوع] قبل خروجه من المستشفى.' },
            { cat: 'التواصل والتوثيق', label: 'التواصل مع فريق طبي', text: 'محتاج أبلّغ الطبيب المسؤول عن تغيّر مفاجئ في حالة المريض ([الوصف])، اديني الصيغة الصح والمختصرة لتوصيل المعلومة بسرعة ووضوح.' },
            { cat: 'التواصل والتوثيق', label: 'أخلاقيات وحدود مهنية', text: 'حصل معايا موقف [وصف الموقف الأخلاقي/المهني]، إيه الصح إني أعمله من ناحية أخلاقيات المهنة وحدود دوري كممرض؟' },

            // ===== تنظيم المذاكرة والتحفيز =====
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'خطة مذاكرة شاملة للفصل', text: 'عندي [عدد] مواد الفصل ده، ساعدني أوزّعهم على أيام الأسبوع بشكل متوازن بدون ما أحرق نفسي أو أتأخر في مادة.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'إني مركزش وقت المذاكرة', text: 'بلاقي صعوبة إني أركز وقت المذاكرة وبتشتت بسرعة، اديني نصايح عملية تناسب طبيعة مذاكرة مادة زي [المادة].' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'حافز قبل امتحان صعب', text: 'حاسس بضغط وقلق قبل امتحان [المادة]، اديني كلام تحفيزي بسيط وواقعي يساعدني أهدى وأركز في المذاكرة.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'تقسيم موضوع كبير لأجزاء', text: 'موضوع [الموضوع] كبير جدًا وحاسس إني تايه فيه، ساعدني أقسّمه لأجزاء صغيرة أقدر أذاكرها واحدة واحدة بالترتيب المنطقي.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'مراجعة سريعة قبل النوم', text: 'اديني ملخص سريع جدًا (٥ نقط بس) لموضوع [الموضوع] أقدر أراجعه قبل النوم في ٥ دقايق.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'تنظيم وقت التدريب العملي والمذاكرة', text: 'عندي تدريب عملي في المستشفى وكمان محتاج أذاكر لامتحان [المادة]، ساعدني أنظم وقتي بين الاتنين من غير ما حاجة تتأثر.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'التعامل مع الإرهاق الدراسي', text: 'حاسس بإرهاق شديد من كتر المذاكرة والتدريب العملي، اديني نصايح عملية أقدر أطبقها من غير ما أقصّر في التزاماتي.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'مقارنة طرق المذاكرة', text: 'إيه أنسب طريقة مذاكرة (فلاش كاردز، تلخيص، شرح لنفسي بصوت عالي...) لموضوع عملي/تطبيقي زي [الموضوع]؟' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'خطة تعويض مذاكرة فايتة', text: 'فاتني مذاكرة [عدد] محاضرات في مادة [المادة]، ساعدني أحط خطة واقعية أعوّض بيها من غير ما أضغط على نفسي أكتر من اللازم.' },
            { cat: 'تنظيم المذاكرة والتحفيز', label: 'تحديد أولويات وقت الامتحانات', text: 'عندي كذا امتحان قريب من بعض ([المواد])، ساعدني أحدد إيه المادة اللي المفروض أبدأ بيها الأول وليه.' }
        ];
        function openPremiumPrompts() {
            const list = document.getElementById('premiumPromptsList');
            if (!list.dataset.filled) {
                list.dataset.filled = '1';
                let html = '', lastCat = '';
                PREMIUM_PROMPTS.forEach((p, i) => {
                    if (p.cat !== lastCat) { html += `<div class="prompt-cat-title">${escapeHtml(p.cat)}</div>`; lastCat = p.cat; }
                    html += `<div class="prompt-card" onclick="usePromptTemplate(${i})"><div class="prompt-card-label">${escapeHtml(p.label)}</div><div class="prompt-card-text">${escapeHtml(p.text)}</div></div>`;
                });
                list.innerHTML = html;
            }
            openModal('premiumPromptsModal');
        }
        function usePromptTemplate(i) {
            const p = PREMIUM_PROMPTS[i];
            if (!p) return;
            reportFeatureUsage('premium_prompts');
            const input = document.getElementById('messageInput');
            input.value = p.text;
            autoResize(input);
            updateCharCount();
            closeModal('premiumPromptsModal');
            input.focus();
            // نحدد أول جزء بين قوسين [...] عشان يبقى سهل عليه يعدله بسرعة قبل ما يبعت
            const match = p.text.match(/\[[^\]]+\]/);
            if (match) input.setSelectionRange(match.index, match.index + match[0].length);
            showToast('اتحط البرومبت — عدّل الجزء المحدد وابعت', 'success');
        }

        // ====================== Premium: مهارات مخصصة (Skills) ======================
        // فكرة الميزة: نفس فكرة "Skills" في Claude — تعليمات ثابتة مخزّنة بأسماء ووصف،
        // وأي مهارة "مفعّلة" (active) بتتحط تلقائي جوه الـ system prompt في كل رسالة
        // جديدة، فالمساعد يلتزم بيها من غير ما الطالب يكررها كل مرة. كل حاجة متخزنة
        // محليًا على جهاز الطالب بس (localStorage) — مفيش سيرفر لازم نضيفه عشان الميزة دي.
        function getCustomSkills() {
            try { return JSON.parse(localStorage.getItem('sx_custom_skills') || '[]'); }
            catch (e) { return []; }
        }
        function saveCustomSkills(skills) {
            localStorage.setItem('sx_custom_skills', JSON.stringify(skills));
        }
        // ====================== استوديو الصور الذكي (Premium): تحليل + إنشاء ======================
        let isAnalyzeImage = null; // { base64, mimeType } للصورة المختارة للتحليل

        function openImageStudio() {
            if (!hasPremium('premium_image_studio')) {
                closeModal('toolsModal');
                requestPremiumFeatureFromAdmin('premium_image_studio');
                return;
            }
            if (!schoolToken) { showToast('لازم تسجّل دخول School X الأول', 'error'); return; }
            // تصفير الحالة كل ما نفتح الاستوديو من جديد
            isAnalyzeImage = null;
            document.getElementById('isAnalyzePreviewWrap').style.display = 'none';
            document.getElementById('isAnalyzeQuestion').value = '';
            document.getElementById('isAnalyzeResult').classList.remove('show');
            document.getElementById('isAnalyzeResult').innerHTML = '';
            document.getElementById('isGeneratePrompt').value = '';
            document.getElementById('isGenerateProvider').value = 'auto';
            document.getElementById('isGenerateSize').value = '1024x1024';
            document.getElementById('isGenerateStyle').value = 'none';
            document.getElementById('isImprovedPromptWrap').style.display = 'none';
            lastImprovedPromptText = '';
            document.getElementById('isQuotaBadge').style.display = 'none';
            document.getElementById('isQuotaBadge').innerHTML = '';
            document.getElementById('isGenerateResultWrap').style.display = 'none';
            document.getElementById('isGenerateStatus').classList.remove('show');
            document.getElementById('isLibraryGrid').innerHTML = '';
            document.getElementById('isLibraryEmpty').style.display = 'none';
            document.getElementById('isVideoPrompt').value = '';
            document.getElementById('isVideoAspectRatio').value = '16:9';
            document.getElementById('isVideoResultWrap').style.display = 'none';
            document.getElementById('isVideoStatus').classList.remove('show');
            document.getElementById('isVideoQuotaBadge').style.display = 'none';
            document.getElementById('isVideoQuotaBadge').innerHTML = '';
            document.getElementById('isVideoLibraryGrid').innerHTML = '';
            document.getElementById('isVideoLibraryEmpty').style.display = 'none';
            clearVideoSourceImage();
            switchImageStudioTab('analyze');
            openModal('imageStudioModal');
        }

        function switchImageStudioTab(tab) {
            document.getElementById('isTabAnalyze').classList.toggle('active', tab === 'analyze');
            document.getElementById('isTabGenerate').classList.toggle('active', tab === 'generate');
            document.getElementById('isTabVideo').classList.toggle('active', tab === 'video');
            document.getElementById('isTabLibrary').classList.toggle('active', tab === 'library');
            document.getElementById('isPaneAnalyze').style.display = tab === 'analyze' ? 'block' : 'none';
            document.getElementById('isPaneGenerate').style.display = tab === 'generate' ? 'block' : 'none';
            document.getElementById('isPaneVideo').style.display = tab === 'video' ? 'block' : 'none';
            document.getElementById('isPaneLibrary').style.display = tab === 'library' ? 'block' : 'none';
            if (tab === 'library') { loadImageLibrary(); loadVideoLibrary(); }
            if (tab === 'generate') refreshImageQuotaBadge();
            if (tab === 'video') refreshVideoQuotaBadge();
        }

        // قوالب برومبت جاهزة — بتحط نص scaffold في الخانة والطالب يكمّل الموضوع بعدها
        const IMAGE_PROMPT_TEMPLATES = {
            illustration: 'رسم توضيحي علمي دقيق وواضح يشرح: ',
            mindmap: 'خريطة ذهنية منظمة وملوّنة توضح العلاقة بين عناصر: ',
            comparison: 'جدول مقارنة واضح بعمودين يقارن بين: '
        };
        function applyImagePromptTemplate(key) {
            const input = document.getElementById('isGeneratePrompt');
            input.value = IMAGE_PROMPT_TEMPLATES[key] || '';
            document.getElementById('isImprovedPromptWrap').style.display = 'none';
            input.focus();
            // نخلي مكان الكتابة في آخر النص عشان الطالب يكمل مباشرة
            input.setSelectionRange(input.value.length, input.value.length);
        }

        // بادئة (مش لاحقة) بتتحط في أول وصف الصورة حسب الأسلوب المختار — بادئة
        // عشان: (1) الموديلات بتدي وزن أعلى للكلمات الأولى في الوصف عادةً،
        // و(2) لو الوصف طويل واتقطع بسبب حد أقصى لعدد الحروف، الأسلوب يفضل
        // موجود بدل ما يكون آخر حاجة في النص فيروح لو حصل قطع. كل أسلوب فيه
        // وصف عربي + كلمات مفتاحية إنجليزية (الموديلات بتستجيب لها بدقة أعلى).
        const IMAGE_STYLE_SUFFIXES = {
            none: '',
            cartoon: 'بأسلوب كرتوني ملوّن، ألوان مسطحة وخطوط سميكة واضحة (cartoon style, flat colors, bold outlines)، ',
            scientific: 'بأسلوب رسم علمي تشريحي دقيق وواقعي بكل التفاصيل (scientific anatomical illustration, highly detailed, labeled)، ',
            photographic: 'بأسلوب فوتوغرافي واقعي عالي الجودة، إضاءة طبيعية احترافية (photorealistic, professional photography)، ',
            sketch: 'بأسلوب رسم يدوي بالقلم الرصاص (سكتش)، خطوط تظليل على ورق أبيض (pencil sketch, hand-drawn, black and white)، ',
            handmade: 'بأسلوب حرفي يدوي الصنع، مجسمات مصنوعة يدويًا من ورق مقصوص أو لباد أو صلصال (handmade craft style, paper cutout / felt / clay diorama, textured)، ',
            watercolor: 'بأسلوب ألوان مائية ناعمة، تدرجات شفافة وحواف طبيعية (soft watercolor painting, artistic)، ',
            render3d: 'بأسلوب رندر ثلاثي الأبعاد ناعم وحديث (3D render, Pixar-style, soft lighting, smooth shading)، ',
            oil: 'بأسلوب لوحة زيتية كلاسيكية بضربات فرشاة واضحة (classical oil painting, visible brush strokes)، ',
            infographic: 'بأسلوب إنفوجرافيك تعليمي مبسّط وواضح، تنظيم بصري مرتّب (flat educational infographic, minimal, clean layout)، '
        };

        let lastImprovedPromptText = ''; // آخر وصف محسّن — بنستخدمه لو الطالب دوس "استخدم هذا الوصف"

        async function runImproveImagePrompt() {
            const input = document.getElementById('isGeneratePrompt');
            const prompt = input.value.trim();
            if (!prompt) { showToast('اكتب وصف الصورة الأول', 'error'); return; }
            const btn = document.getElementById('isImproveBtn');
            const wrap = document.getElementById('isImprovedPromptWrap');
            btn.disabled = true;
            wrap.style.display = 'none';
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="btn-spinner"></span> جارٍ تحسين الوصف...';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/improve-image-prompt`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر تحسين الوصف');
                lastImprovedPromptText = data.improved;
                document.getElementById('isImprovedPromptText').textContent = data.improved;
                wrap.style.display = 'block';
            } catch (e) {
                showToast(e.message || 'تعذر تحسين الوصف', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        }

        function useImprovedImagePrompt() {
            if (!lastImprovedPromptText) return;
            document.getElementById('isGeneratePrompt').value = lastImprovedPromptText;
            document.getElementById('isImprovedPromptWrap').style.display = 'none';
            showToast('تم تطبيق الوصف المحسّن', 'success');
        }

        function dismissImprovedImagePrompt() {
            document.getElementById('isImprovedPromptWrap').style.display = 'none';
        }

        // ====================== الحد اليومي لإنشاء الصور ======================
        let lastImageQuotaEmpty = false; // آخر حالة معروفة للحد اليومي — بتستخدم عشان منفكّش الأزرار غلط في finally
        function renderImageQuotaBadge(quota) {
            const badge = document.getElementById('isQuotaBadge');
            const genBtn = document.getElementById('isGenerateBtn');
            const regenBtn = document.getElementById('isRegenerateBtn');
            if (!quota || quota.unlimited) {
                badge.style.display = 'none';
                lastImageQuotaEmpty = false;
                return;
            }
            badge.style.display = 'block';
            const low = quota.remaining <= 2 && quota.remaining > 0;
            const empty = quota.remaining <= 0;
            lastImageQuotaEmpty = empty;
            badge.style.color = empty ? 'var(--danger)' : low ? '#e67e22' : 'var(--text-3)';
            badge.innerHTML = empty
                ? `⚠️ وصلت للحد الأقصى (${quota.limit} صور اليوم) — هيتجدد بكرة`
                : `متبقّي <b>${quota.remaining}</b> من ${quota.limit} صور النهاردة${low ? ' ⚠️ اقتربت من الحد' : ''}`;
            if (genBtn) genBtn.disabled = empty;
            if (regenBtn) regenBtn.disabled = empty;
        }

        async function refreshImageQuotaBadge() {
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/image-quota`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (res.ok) renderImageQuotaBadge(data);
            } catch (e) { /* غير حرج — لو فشل الطلب الطالب هيعرف من رد التوليد نفسه */ }
        }

        function handleImageStudioFileSelect(file) {
            if (!file) return;
            // نفس الضغط المستخدم في كل مكان تاني بالموقع — كافي جدًا لدقة تحليل عالية
            // ومنيّح لينا حجم الـ request للـ API.
            compressImageFile(file, 1280, 0.8).then((compressedFile) => {
                const reader = new FileReader();
                reader.onload = () => {
                    isAnalyzeImage = { base64: reader.result.split(',')[1], mimeType: compressedFile.type };
                    document.getElementById('isAnalyzePreviewImg').src = reader.result;
                    document.getElementById('isAnalyzePreviewWrap').style.display = 'block';
                };
                reader.onerror = () => showToast('تعذرت قراءة الصورة', 'error');
                reader.readAsDataURL(compressedFile);
            });
        }

        async function runImageStudioAnalyze() {
            if (!isAnalyzeImage) { showToast('اختار صورة الأول', 'error'); return; }
            const btn = document.getElementById('isAnalyzeBtn');
            const resultEl = document.getElementById('isAnalyzeResult');
            const question = document.getElementById('isAnalyzeQuestion').value.trim();
            btn.disabled = true;
            resultEl.innerHTML = '<span class="btn-spinner"></span> جارٍ تحليل الصورة بدقة...';
            resultEl.classList.add('show');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/vision-analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ image: isAnalyzeImage, question })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'فشل تحليل الصورة');
                const modelLabels = { gemini: 'Gemini', deepseek: 'DeepSeek', qwen: 'Qwen' };
                const usedLabel = modelLabels[data.usedModel] || '';
                resultEl.innerHTML = escapeHtml(data.analysis).replace(/\n/g, '<br>')
                    + (usedLabel ? `<div style="margin-top:8px;font-size:10px;color:var(--text-3);">تم التحليل عن طريق: ${usedLabel}</div>` : '');
            } catch (e) {
                resultEl.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر تحليل الصورة')}</span>`;
            } finally {
                btn.disabled = false;
            }
        }

        function handleImageStudioGenerateError() {
            document.getElementById('isGenerateResultWrap').style.display = 'none';
            const statusEl = document.getElementById('isGenerateStatus');
            statusEl.classList.add('show');
            statusEl.innerHTML = '<span style="color:var(--danger);">تعذر تحميل الصورة، جرب تاني</span>';
        }

        let isLastGeneratedUrl = null; // لازم يكون رابط عام (مش base64) عشان التعديل يشتغل عليه
        let isLastGeneratedProvider = null; // المزوّد اللي أنشأ الصورة (لازم نستخدم نفسه في التعديل)
        let isLastGeneratedSize = null; // { width, height } — بنستخدمها تاني وقت التعديل عشان الأبعاد تفضل زي ما هي
        const EDIT_CAPABLE_PROVIDERS = ['grok', 'flux']; // مطابق لـ EDIT_PROVIDERS في index.js

        async function runImageStudioGenerate() {
            const rawPrompt = document.getElementById('isGeneratePrompt').value.trim();
            if (!rawPrompt) { showToast('اكتب وصف الصورة الأول', 'error'); return; }
            const provider = document.getElementById('isGenerateProvider').value;
            const style = document.getElementById('isGenerateStyle').value;
            const prompt = (IMAGE_STYLE_SUFFIXES[style] || '') + rawPrompt;
            const [sizeWidth, sizeHeight] = document.getElementById('isGenerateSize').value.split('x').map(Number);
            const btn = document.getElementById('isGenerateBtn');
            const regenBtn = document.getElementById('isRegenerateBtn');
            const statusEl = document.getElementById('isGenerateStatus');
            const resultWrap = document.getElementById('isGenerateResultWrap');
            const editSection = document.getElementById('isEditSection');
            btn.disabled = true;
            if (regenBtn) regenBtn.disabled = true;
            resultWrap.style.display = 'none';
            editSection.style.display = 'none';
            isLastGeneratedUrl = null;
            isLastGeneratedProvider = null;
            isLastGeneratedSize = null;
            statusEl.innerHTML = '<span class="btn-spinner"></span> جارٍ إنشاء الصورة... (ممكن تاخد لحظات)';
            statusEl.classList.add('show');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/generate-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ prompt, provider, width: sizeWidth, height: sizeHeight })
                });
                const data = await res.json();
                if (typeof data.quotaRemaining === 'number') renderImageQuotaBadge({ used: data.quotaLimit - data.quotaRemaining, remaining: data.quotaRemaining, limit: data.quotaLimit });
                if (!res.ok) {
                    // لو الطالب اختار مزوّد بعينه وفشل، منعملش أي fallback تلقائي —
                    // نوريه الخطأ صراحة عشان يقرر هو يجرب مزوّد تاني ولا لأ.
                    const err = new Error(data.error || 'فشل إنشاء الصورة');
                    if (data.debugAttempts) err.debugAttempts = data.debugAttempts;
                    throw err;
                }
                // Qwen بيرجّع رابط جاهز، Grok وFlux ممكن يرجّعوا رابط أو بايتس
                // (base64) حسب الرد — نتعامل مع الاتنين.
                const src = data.imageBase64 ? `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}` : data.imageUrl;
                document.getElementById('isGenerateResultImg').src = src;
                document.getElementById('isGenerateDownloadLink').href = src;
                resultWrap.style.display = 'block';
                statusEl.classList.remove('show');
                const providerLabels = { qwen: 'Qwen', grok: 'Grok', flux: 'Flux 2 Max' };
                const usedLabel = providerLabels[data.usedProvider] || data.usedProvider;
                const savedNote = data.savedToLibrary ? ' • 📥 اتحفظت في مكتبتي' : '';
                statusEl.innerHTML = usedLabel
                    ? `<span style="color:var(--text-3);font-size:11px;">تم الإنشاء عن طريق: ${usedLabel}${data.fallback ? ' (الموديل الأساسي كان مش متاح)' : ''}${savedNote}</span>`
                    : '';
                if (usedLabel) statusEl.classList.add('show');
                // تعديل الصورة متاح بس للمزوّدين اللي بيدعموا التعديل (Grok وFlux)
                // ولازم يكون رجّع رابط عام (مش base64) — endpoint التعديل محتاج
                // رابط يقدر المزوّد يوصله.
                if (EDIT_CAPABLE_PROVIDERS.includes(data.usedProvider) && data.imageUrl) {
                    isLastGeneratedUrl = data.imageUrl;
                    isLastGeneratedProvider = data.usedProvider;
                    isLastGeneratedSize = { width: sizeWidth, height: sizeHeight };
                    editSection.style.display = 'block';
                }
            } catch (e) {
                statusEl.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر إنشاء الصورة')}</span>`;
                // 🔍 تشخيصي (بيظهر للأدمن بس عن طريق debugAttempts القادمة من
                // السيرفر) — بيوضح بالظبط ليه كل مزوّد فشل بدل ما نفضل نخمّن.
                if (e.debugAttempts) {
                    const debugHtml = e.debugAttempts.map(a =>
                        `<div>• ${a.provider}: ${a.reason || ('status ' + a.status)}${a.detail ? ' — ' + escapeHtml(a.detail) : ''}</div>`
                    ).join('');
                    statusEl.innerHTML += `<div style="margin-top:8px;font-size:10px;color:var(--text-3);text-align:right;direction:ltr;">${debugHtml}</div>`;
                }
                statusEl.classList.add('show');
            } finally {
                btn.disabled = lastImageQuotaEmpty;
                if (regenBtn) regenBtn.disabled = lastImageQuotaEmpty;
            }
        }

        async function runImageStudioEdit() {
            const editPrompt = document.getElementById('isEditPrompt').value.trim();
            if (!editPrompt) { showToast('اكتب وصف التعديل الأول', 'error'); return; }
            if (!isLastGeneratedUrl) { showToast('مفيش صورة متاحة للتعديل عليها', 'error'); return; }
            const btn = document.getElementById('isEditBtn');
            const statusEl = document.getElementById('isGenerateStatus');
            btn.disabled = true;
            statusEl.innerHTML = '<span class="btn-spinner"></span> جارٍ تعديل الصورة...';
            statusEl.classList.add('show');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/edit-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({
                        imageUrl: isLastGeneratedUrl, prompt: editPrompt, provider: isLastGeneratedProvider || 'grok',
                        width: isLastGeneratedSize?.width, height: isLastGeneratedSize?.height
                    })
                });
                const data = await res.json();
                if (typeof data.quotaRemaining === 'number') renderImageQuotaBadge({ used: data.quotaLimit - data.quotaRemaining, remaining: data.quotaRemaining, limit: data.quotaLimit });
                if (!res.ok) throw new Error(data.error || 'فشل تعديل الصورة');
                const src = data.imageBase64 ? `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}` : data.imageUrl;
                document.getElementById('isGenerateResultImg').src = src;
                document.getElementById('isGenerateDownloadLink').href = src;
                // لو الرد رجّع رابط جديد، نسمح بتعديل تاني فوق النسخة المعدّلة نفسها
                if (data.imageUrl) isLastGeneratedUrl = data.imageUrl;
                statusEl.innerHTML = `<span style="color:var(--success);font-size:11px;">تم التعديل ✅${data.savedToLibrary ? ' • اتحفظت في مكتبتي' : ''}</span>`;
                statusEl.classList.add('show');
                document.getElementById('isEditPrompt').value = '';
            } catch (e) {
                statusEl.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر تعديل الصورة')}</span>`;
                statusEl.classList.add('show');
            } finally {
                btn.disabled = lastImageQuotaEmpty;
            }
        }

        // ====================== مكتبة صور استوديو الصور ======================
        let currentLibraryViewId = null; // الصورة المفتوحة حاليًا في مودال العرض الكامل

        async function loadImageLibrary() {
            const grid = document.getElementById('isLibraryGrid');
            const emptyEl = document.getElementById('isLibraryEmpty');
            const loadingEl = document.getElementById('isLibraryLoading');
            grid.innerHTML = '';
            emptyEl.style.display = 'none';
            loadingEl.style.display = 'block';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/image-library`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر تحميل المكتبة');
                loadingEl.style.display = 'none';
                if (!data.images || !data.images.length) {
                    emptyEl.style.display = 'block';
                    return;
                }
                grid.innerHTML = data.images.map(img => `
                    <div style="cursor:pointer;border-radius: var(--radius-xs);overflow:hidden;background:var(--bg-2);" title="${escapeHtml(img.prompt || '')}" onclick='openLibraryImageView(${JSON.stringify(img).replace(/'/g, "&apos;")})'>
                        <img src="${img.imageUrl}" alt="${escapeAttr(img.prompt || 'صورة مولّدة بالذكاء الاصطناعي')}" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;">
                    </div>
                `).join('');
            } catch (e) {
                loadingEl.style.display = 'none';
                emptyEl.style.display = 'block';
                emptyEl.textContent = e.message || 'تعذر تحميل المكتبة';
            }
        }

        const IMAGE_PROVIDER_LABELS = { qwen: 'Qwen', grok: 'Grok', flux: 'Flux 2 Max' };

        function openLibraryImageView(img) {
            currentLibraryViewId = img._id;
            document.getElementById('libraryImageViewImg').src = img.imageUrl;
            document.getElementById('libraryImageViewDownload').href = img.imageUrl;
            const providerLabel = IMAGE_PROVIDER_LABELS[img.provider] || img.provider || '';
            const meta = [providerLabel, img.source === 'edit' ? 'معدّلة' : ''].filter(Boolean).join(' • ');
            document.getElementById('libraryImageViewPrompt').innerHTML = `
                ${escapeHtml(img.prompt || '')}
                ${meta ? `<div style="margin-top:4px;font-size:10px;">${escapeHtml(meta)}</div>` : ''}
            `;
            openModal('libraryImageViewModal');
        }

        async function deleteLibraryImage(id) {
            if (!id) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/image-library/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر حذف الصورة');
                closeModal('libraryImageViewModal');
                showToast('تم حذف الصورة', 'success');
                loadImageLibrary();
            } catch (e) {
                showToast(e.message || 'تعذر حذف الصورة', 'error');
            }
        }

        // ====================== إنشاء فيديو (Grok Imagine Video) ======================
        let selectedVideoSourceImageUrl = null; // رابط الصورة المختارة كمصدر للفيديو (اختياري)
        let lastVideoQuotaEmpty = false; // آخر حالة معروفة للحد اليومي — بتستخدم عشان منفكّش الزرار غلط في finally

        function renderVideoQuotaBadge(quota) {
            const badge = document.getElementById('isVideoQuotaBadge');
            const genBtn = document.getElementById('isVideoGenerateBtn');
            if (!quota || quota.unlimited) {
                badge.style.display = 'none';
                lastVideoQuotaEmpty = false;
                return;
            }
            badge.style.display = 'block';
            const empty = quota.remaining <= 0;
            lastVideoQuotaEmpty = empty;
            badge.style.color = empty ? 'var(--danger)' : 'var(--text-3)';
            badge.innerHTML = empty
                ? `⚠️ وصلت للحد الأقصى (${quota.limit} فيديوهات اليوم) — هيتجدد بكرة`
                : `متبقّي <b>${quota.remaining}</b> من ${quota.limit} فيديوهات النهاردة`;
            if (genBtn) genBtn.disabled = empty;
        }

        async function refreshVideoQuotaBadge() {
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/video-quota`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (res.ok) renderVideoQuotaBadge(data);
            } catch (e) { /* غير حرج */ }
        }

        function clearVideoSourceImage() {
            selectedVideoSourceImageUrl = null;
            document.getElementById('isVideoImagePreviewWrap').style.display = 'none';
            document.getElementById('isVideoImagePreview').src = '';
        }

        function selectVideoSourceImage(url) {
            selectedVideoSourceImageUrl = url;
            document.getElementById('isVideoImagePreview').src = url;
            document.getElementById('isVideoImagePreviewWrap').style.display = 'block';
            closeModal('videoImagePickerModal');
        }

        async function openVideoImagePicker() {
            openModal('videoImagePickerModal');
            const grid = document.getElementById('isVideoPickerGrid');
            const emptyEl = document.getElementById('isVideoPickerEmpty');
            const loadingEl = document.getElementById('isVideoPickerLoading');
            grid.innerHTML = '';
            emptyEl.style.display = 'none';
            loadingEl.style.display = 'block';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/image-library`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر تحميل الصور');
                loadingEl.style.display = 'none';
                if (!data.images || !data.images.length) { emptyEl.style.display = 'block'; return; }
                grid.innerHTML = data.images.map(img => `
                    <div style="cursor:pointer;border-radius: var(--radius-xs);overflow:hidden;" onclick="selectVideoSourceImage('${img.imageUrl.replace(/'/g, "\\'")}')">
                        <img src="${img.imageUrl}" alt="صورة من مكتبتي لاستخدامها في الفيديو" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;">
                    </div>
                `).join('');
            } catch (e) {
                loadingEl.style.display = 'none';
                emptyEl.style.display = 'block';
                emptyEl.textContent = e.message || 'تعذر تحميل الصور';
            }
        }

        async function runVideoStudioGenerate() {
            const prompt = document.getElementById('isVideoPrompt').value.trim();
            if (!prompt) { showToast('اكتب وصف الفيديو الأول', 'error'); return; }
            const aspectRatio = document.getElementById('isVideoAspectRatio').value;
            const btn = document.getElementById('isVideoGenerateBtn');
            const statusEl = document.getElementById('isVideoStatus');
            const resultWrap = document.getElementById('isVideoResultWrap');
            btn.disabled = true;
            resultWrap.style.display = 'none';
            statusEl.innerHTML = '<span class="btn-spinner"></span> جارٍ إنشاء الفيديو... ممكن ياخد دقيقة لكذا دقيقة، سيب الصفحة مفتوحة ولا تقفلها';
            statusEl.classList.add('show');
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/generate-video`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ prompt, imageUrl: selectedVideoSourceImageUrl, aspectRatio })
                });
                const data = await res.json();
                if (typeof data.quotaRemaining === 'number') renderVideoQuotaBadge({ used: data.quotaLimit - data.quotaRemaining, remaining: data.quotaRemaining, limit: data.quotaLimit });
                if (!res.ok) throw new Error(data.error || 'فشل إنشاء الفيديو');
                document.getElementById('isVideoResultPlayer').src = data.videoUrl;
                document.getElementById('isVideoDownloadLink').href = data.videoUrl;
                resultWrap.style.display = 'block';
                statusEl.classList.remove('show');
                statusEl.innerHTML = data.savedToLibrary ? '<span style="color:var(--text-3);font-size:11px;">📥 اتحفظ في مكتبتي</span>' : '';
                if (data.savedToLibrary) statusEl.classList.add('show');
            } catch (e) {
                statusEl.innerHTML = `<span style="color:var(--danger);">${escapeHtml(e.message || 'تعذر إنشاء الفيديو')}</span>`;
                statusEl.classList.add('show');
            } finally {
                btn.disabled = lastVideoQuotaEmpty;
            }
        }

        // ====================== مكتبة الفيديو ======================
        let currentLibraryVideoViewId = null;

        async function loadVideoLibrary() {
            const grid = document.getElementById('isVideoLibraryGrid');
            const emptyEl = document.getElementById('isVideoLibraryEmpty');
            const loadingEl = document.getElementById('isVideoLibraryLoading');
            grid.innerHTML = '';
            emptyEl.style.display = 'none';
            loadingEl.style.display = 'block';
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/video-library`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر تحميل مكتبة الفيديو');
                loadingEl.style.display = 'none';
                if (!data.videos || !data.videos.length) { emptyEl.style.display = 'block'; return; }
                grid.innerHTML = data.videos.map(vid => `
                    <div style="cursor:pointer;border-radius: var(--radius-xs);overflow:hidden;background:var(--bg-2);" title="${escapeHtml(vid.prompt || '')}" onclick='openLibraryVideoView(${JSON.stringify(vid).replace(/'/g, "&apos;")})'>
                        <video src="${vid.videoUrl}" muted style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;pointer-events:none;"></video>
                    </div>
                `).join('');
            } catch (e) {
                loadingEl.style.display = 'none';
                emptyEl.style.display = 'block';
                emptyEl.textContent = e.message || 'تعذر تحميل مكتبة الفيديو';
            }
        }

        function openLibraryVideoView(vid) {
            currentLibraryVideoViewId = vid._id;
            document.getElementById('libraryVideoViewPlayer').src = vid.videoUrl;
            document.getElementById('libraryVideoViewDownload').href = vid.videoUrl;
            document.getElementById('libraryVideoViewPrompt').textContent = vid.prompt || '';
            openModal('libraryVideoViewModal');
        }

        async function deleteLibraryVideo(id) {
            if (!id) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/premium/video-library/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'تعذر حذف الفيديو');
                document.getElementById('libraryVideoViewPlayer').pause();
                closeModal('libraryVideoViewModal');
                showToast('تم حذف الفيديو', 'success');
                loadVideoLibrary();
            } catch (e) {
                showToast(e.message || 'تعذر حذف الفيديو', 'error');
            }
        }

        function openPremiumSkills() {
            renderSkillsList();
            openModal('premiumSkillsModal');
        }
        function renderSkillsList() {
            const skills = getCustomSkills();
            const list = document.getElementById('premiumSkillsList');
            if (skills.length === 0) {
                list.innerHTML = '<div style="text-align:center;color:var(--text-3);font-size:12px;padding:20px 0;">لسه معملتش أي مهارة. دوس "مهارة جديدة" عشان تبدأ.</div>';
                return;
            }
            list.innerHTML = skills.map(s => `
                <div class="prompt-card" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
                    <div style="flex:1;min-width:0;cursor:pointer;" onclick="openSkillEditor('${s.id}')">
                        <div class="prompt-card-label">${escapeHtml(s.name)}</div>
                        <div class="prompt-card-text">${escapeHtml((s.instructions || '').slice(0, 90))}${(s.instructions || '').length > 90 ? '…' : ''}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;">
                        <label style="cursor:pointer;" title="${s.active ? 'مفعّلة' : 'متوقفة'}">
                            <input type="checkbox" ${s.active ? 'checked' : ''} onchange="toggleSkillActive('${s.id}')">
                        </label>
                        <button style="background:none;border:none;color:var(--danger,#e5484d);cursor:pointer;font-size:14px;" title="حذف" onclick="deleteSkill('${s.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
        function openSkillEditor(id) {
            document.getElementById('skillEditorId').value = id || '';
            if (id) {
                const skill = getCustomSkills().find(s => s.id === id);
                document.getElementById('skillEditorTitle').textContent = 'تعديل المهارة';
                document.getElementById('skillNameInput').value = skill ? skill.name : '';
                document.getElementById('skillInstructionsInput').value = skill ? skill.instructions : '';
            } else {
                document.getElementById('skillEditorTitle').textContent = 'مهارة جديدة';
                document.getElementById('skillNameInput').value = '';
                document.getElementById('skillInstructionsInput').value = '';
            }
            document.getElementById('skillFileInput').value = '';
            openModal('skillEditorModal');
        }
        // بيقرا أي ملف .txt/.md ترفعه ويحط محتواه في خانة التعليمات مباشرة — مفيد لو
        // الطالب عنده ملف تعليمات جاهز (زي قالب تلخيص أو أسلوب رد اتفق عليه) وعايز
        // يرفعه بدل ما يلزق النص يدوي.
        function handleSkillFileUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            if (file.size > 200 * 1024) { showToast('الملف كبير أوي (حد أقصى 200KB)', 'error'); return; }
            const reader = new FileReader();
            reader.onload = () => {
                document.getElementById('skillInstructionsInput').value = String(reader.result || '').slice(0, 6000);
                showToast('اتحط محتوى الملف في خانة التعليمات', 'success');
            };
            reader.onerror = () => showToast('تعذر قراءة الملف', 'error');
            reader.readAsText(file, 'utf-8');
        }
        function saveSkill() {
            const id = document.getElementById('skillEditorId').value;
            const name = document.getElementById('skillNameInput').value.trim();
            const instructions = document.getElementById('skillInstructionsInput').value.trim().slice(0, 6000);
            if (!name || !instructions) { showToast('لازم تكتب اسم وتعليمات للمهارة', 'error'); return; }
            let skills = getCustomSkills();
            if (id) {
                skills = skills.map(s => s.id === id ? { ...s, name, instructions } : s);
            } else {
                // حد أقصى 12 مهارة عشان الـ system prompt مايتضخمش ويأثر على جودة وسرعة الرد
                if (skills.length >= 12) { showToast('وصلت لأقصى عدد مهارات (12) — احذف مهارة قديمة الأول', 'error'); return; }
                skills.push({ id: `skill-${Date.now()}`, name, instructions, active: true, createdAt: Date.now() });
            }
            saveCustomSkills(skills);
            closeModal('skillEditorModal');
            renderSkillsList();
            showToast('اتحفظت المهارة ✓', 'success');
        }
        function toggleSkillActive(id) {
            const skills = getCustomSkills().map(s => s.id === id ? { ...s, active: !s.active } : s);
            saveCustomSkills(skills);
            renderSkillsList();
        }
        function deleteSkill(id) {
            if (!confirm('تحذف المهارة دي؟')) return;
            saveCustomSkills(getCustomSkills().filter(s => s.id !== id));
            renderSkillsList();
            showToast('اتحذفت المهارة', 'success');
        }
        // بيرجع النص اللي بيتضاف جوه الـ system prompt لكل المهارات المفعّلة — بيتنادى من
        // getSystemPrompt() لو الطالب معاه ميزة premium_skills. لو مفيش مهارات مفعّلة
        // بيرجع نص فاضي (يعني مفيش تأثير خالص على الردود العادية).
        function getActiveSkillsPromptBlock() {
            if (!hasPremium('premium_skills')) return '';
            const active = getCustomSkills().filter(s => s.active);
            if (active.length === 0) return '';
            return `

الطالب عنده "مهارات مخصصة" مفعّلة (تعليمات ثابتة اتفق هو عليها بنفسه) — التزم بيها بدقة في أي رد مرتبط بموضوعها، من غير ما تذكر للطالب إنك "قريت مهارة" أو حاجة تقنية زي كده، فقط اتصرف بمقتضاها بشكل طبيعي:
${active.map(s => `### مهارة: ${s.name}\n${s.instructions}`).join('\n\n')}`;
        }

        // ====================== زرار الإرفاق: ملف أو مهارة (Skill) ======================
        function openAttachMenu() {
            openModal('attachMenuModal');
        }
        // بيحول اسم المهارة لـ "سلاج" آمن يظهر بعد الـ / في مربع الكتابة (فراغات تبقى
        // شرطة، وأي حاجة غريبة تتشال) — نفس السلاج ده بيتستخدم بعدين للتعرف على المهارة
        // وقت الإرسال حتى لو الطالب عدّل حروف كبيرة/صغيرة أو مسافات حوالين الجزء ده.
        function slugifySkillName(name) {
            return (name || '').trim().replace(/\s+/g, '-');
        }
        function openSkillPicker() {
            if (!hasPremium('premium_skills')) {
                closeModal('attachMenuModal');
                requestPremiumFeatureFromAdmin('premium_skills');
                return;
            }
            const skills = getCustomSkills();
            const list = document.getElementById('skillPickerList');
            if (skills.length === 0) {
                list.innerHTML = '<div style="text-align:center;color:var(--text-3);font-size:12px;padding:16px 0;">لسه معملتش أي مهارة. دوس "إدارة / إضافة مهارات" تحت وابدأ.</div>';
            } else {
                list.innerHTML = skills.map(s => `
                    <div class="prompt-card" onclick="insertSkillTag('${s.id}')">
                        <div class="prompt-card-label"><i class="fas fa-puzzle-piece" style="margin-left:6px;opacity:.7;"></i>${escapeHtml(s.name)}</div>
                        <div class="prompt-card-text">${escapeHtml((s.instructions || '').slice(0, 80))}${(s.instructions || '').length > 80 ? '…' : ''}</div>
                    </div>
                `).join('');
            }
            closeModal('attachMenuModal');
            openModal('skillPickerModal');
        }
        // بيحط "/اسم-المهارة" في مربع الكتابة (في أول الرسالة) ويسيب مكان الكتابة بعده،
        // عشان الطالب يكمل يكتب سؤاله بعد التاج مباشرة.
        function insertSkillTag(id) {
            const skill = getCustomSkills().find(s => s.id === id);
            if (!skill) return;
            reportFeatureUsage('premium_skills');
            const input = document.getElementById('messageInput');
            const tag = `/${slugifySkillName(skill.name)} `;
            const already = input.value.trim();
            input.value = already ? `${tag}${already}` : tag;
            autoResize(input);
            updateCharCount();
            closeModal('skillPickerModal');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
        // بيدوّر في نص الرسالة على "/اسم-مهارة" في الأول وبيرجع سياق التعليمات المرتبط
        // بيها لو لاقاها، عشان تتضاف لـ system prompt الرد ده بس. مش بيشيل التاج من
        // نص الرسالة (بيفضل ظاهر للطالب في المحادثة كتذكير إنه استخدم المهارة دي).
        function buildSkillTagContext(text) {
            if (!hasPremium('premium_skills')) return '';
            const match = /^\/(\S+)/.exec((text || '').trim());
            if (!match) return '';
            const tagSlug = match[1];
            const skill = getCustomSkills().find(s => slugifySkillName(s.name) === tagSlug);
            if (!skill) return '';
            return `الطالب استخدم مهارة "${skill.name}" صراحة على الرسالة دي (اختارها بنفسه من قائمة المهارات) — التزم بالتعليمات دي بدقة كاملة في ردك على الرسالة دي تحديدًا:\n${skill.instructions}`;
        }

        // ====================== Premium: امتحان محاكاة شامل (كذا فصل مع بعض + تقرير أداء) ======================
        function openMockExamBuilder() {
            if (!hasPremium('premium_mock_exams')) { requestPremiumFeatureFromAdmin('premium_mock_exams'); return; }
            reportFeatureUsage('premium_mock_exams');
            populateMockSubjects();
            renderMockExamChapterList();
            document.getElementById('mockExamStatus').innerHTML = '';
            openModal('mockExamModal');
        }

        function populateMockSubjects() {
            const sel = document.getElementById('mockSubjectSelect');
            if (sel.dataset.filled) return;
            sel.dataset.filled = '1';
            BANK_CATALOG.forEach((s, i) => {
                const opt = document.createElement('option');
                opt.value = i; opt.textContent = s.subject;
                sel.appendChild(opt);
            });
        }

        // بتعمل نفس حاجة populateBankChapters بالظبط بس على selects منفصلة خاصة بامتحان
        // المحاكاة، عشان اختيار الطالب هنا ميتلخبطش مع اختيار الاختبار العادي (فصل واحد).
        async function populateMockChapters() {
            const subjIdx = document.getElementById('mockSubjectSelect').value;
            const chapSel = document.getElementById('mockChapterSelect');
            chapSel.innerHTML = '<option value="">جاري التحميل...</option>';
            if (subjIdx === '') { chapSel.innerHTML = '<option value="">اختر الفصل...</option>'; return; }
            const subj = BANK_CATALOG[subjIdx];
            const apiUrl = FIXED_SCHOOL_API_URL;
            chapSel.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = ''; defaultOpt.textContent = 'اختر الفصل...';
            chapSel.appendChild(defaultOpt);
            for (const id of subj.ids) {
                const file = `${subj.prefix}${id}.js`;
                const varName = `${subj.prefix}${id}`;
                const cacheKey = varName;
                let data = bankChaptersCache[cacheKey];
                if (!data) {
                    data = await fetchBankFile(apiUrl, file, varName);
                    if (data) bankChaptersCache[cacheKey] = data;
                }
                const opt = document.createElement('option');
                opt.value = cacheKey;
                opt.textContent = data ? (data.name || file) : `${file} (تعذر التحميل)`;
                opt.dataset.subjectName = subj.subject;
                if (!data) opt.disabled = true;
                chapSel.appendChild(opt);
            }
        }

        function addChapterToMockExam() {
            const chapSel = document.getElementById('mockChapterSelect');
            const cacheKey = chapSel.value;
            const status = document.getElementById('mockExamStatus');
            if (!cacheKey) { status.innerHTML = '<span style="color:var(--danger)">اختر الفصل الأول</span>'; return; }
            if (mockExamChapters.some(c => c.cacheKey === cacheKey)) { status.innerHTML = '<span style="color:var(--warning)">الفصل ده مضاف بالفعل</span>'; return; }
            const data = bankChaptersCache[cacheKey];
            if (!data) { status.innerHTML = '<span style="color:var(--danger)">تعذر تحميل بيانات الفصل</span>'; return; }
            const subjectName = chapSel.selectedOptions[0]?.dataset.subjectName || '';
            mockExamChapters.push({ cacheKey, subjectName, chapterName: data.name });
            status.innerHTML = '';
            renderMockExamChapterList();
        }

        function removeMockExamChapter(cacheKey) {
            mockExamChapters = mockExamChapters.filter(c => c.cacheKey !== cacheKey);
            renderMockExamChapterList();
        }

        function renderMockExamChapterList() {
            const el = document.getElementById('mockExamChapterListEl');
            if (!mockExamChapters.length) {
                el.innerHTML = '<div style="font-size:11px;color:var(--text-3);text-align:center;">لسه معملتش أي فصل للامتحان</div>';
                return;
            }
            el.innerHTML = mockExamChapters.map(c => `
                <div class="mock-exam-chapter-chip">
                    <span>${escapeHtml(c.subjectName)} — ${escapeHtml(c.chapterName)}</span>
                    <button aria-label="إزالة الفصل" title="إزالة" onclick="removeMockExamChapter('${c.cacheKey.replace(/'/g, "\\'")}')"><i class="fas fa-times"></i></button>
                </div>
            `).join('');
        }

        function startMockExam() {
            if (!hasPremium('premium_mock_exams')) { requestPremiumFeatureFromAdmin('premium_mock_exams'); return; }
            const status = document.getElementById('mockExamStatus');
            if (mockExamChapters.length < 1) { status.innerHTML = '<span style="color:var(--danger)">ضيف فصل واحد على الأقل</span>'; return; }
            const countRaw = parseInt(document.getElementById('mockExamQuestionCount').value);
            const count = (!countRaw || countRaw <= 0) ? 30 : Math.min(countRaw, 100);
            const durationRaw = parseInt(document.getElementById('mockExamDuration').value);
            const duration = (!durationRaw || durationRaw <= 0) ? 45 : Math.min(durationRaw, 180);

            // بنجمع كل أنواع الأسئلة المتاحة من كل الفصول المختارة (مش نوع معين — امتحان شامل حقيقي)
            let pool = [];
            mockExamChapters.forEach(({ cacheKey, subjectName, chapterName }) => {
                const data = bankChaptersCache[cacheKey];
                if (!data) return;
                ['mcq', 'truefalse', 'complete'].forEach(t => {
                    const arr = Array.isArray(data[t]) ? data[t] : [];
                    arr.forEach(item => pool.push({ type: t, ...item, sourceSubject: subjectName, sourceChapter: chapterName }));
                });
            });
            if (!pool.length) { status.innerHTML = '<span style="color:var(--danger)">مفيش أسئلة كفاية في الفصول دي</span>'; return; }

            const picked = shuffleArray(pool).slice(0, Math.min(count, pool.length));
            mockExamTimers.forEach(id => clearTimeout(id)); // نلغي أي مؤقتات امتحان سابق لسه شغالة
            mockExamTimers = [];
            activeQuiz = { chapterName: 'امتحان محاكاة شامل', questions: picked, isMockExam: true, durationMinutes: duration };

            let msg = `📝 **امتحان محاكاة شامل** (${picked.length} سؤال، ${duration} دقيقة)\n`;
            msg += `الفصول: ${mockExamChapters.map(c => c.chapterName).join(' • ')}\n\n`;
            picked.forEach((q, i) => {
                if (q.type === 'mcq') {
                    msg += `**${i + 1}. [اختيار من متعدد] ${q.text}**\n`;
                    (q.options || []).forEach(o => { msg += `${o}\n`; });
                } else if (q.type === 'truefalse') {
                    msg += `**${i + 1}. [صح / خطأ] ${q.text}**\n`;
                } else if (q.type === 'complete') {
                    msg += `**${i + 1}. [إكمال] ${q.text}**\n`;
                }
                msg += '\n';
            });
            msg += `---\n⏰ عندك ${duration} دقيقة. لما تخلص، اكتبلي إجاباتك سطر لكل سؤال بالشكل ده:\n`;
            msg += `\`1: B\` (لو اختيار من متعدد)\n\`2: صح\` أو \`2: خطأ\`\n\`3: الكلمة الناقصة\`\n\nوهبعتلك تقرير أداء شامل بعد التصحيح.`;

            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                const botMsg = { role: 'bot', content: msg, source: 'local', timestamp: Date.now(), id: `msg-${Date.now()}-mockexam` };
                chat.messages.push(botMsg);
                appendMessageToDOM(botMsg);
                saveData();
            }

            // تنبيهات وقت الامتحان: قبل النهاية بـ ٥ دقايق، وعند انتهاء الوقت تمامًا. بنتأكد
            // وقت التنفيذ إن نفس الامتحان لسه نشط (مش اتصحح أو اتلغى) قبل ما نبعت التنبيه.
            const scheduleReminder = (minutesFromNow, text) => {
                if (minutesFromNow <= 0) return;
                const id = setTimeout(() => {
                    const c = chats.find(c => c.id === currentChatId);
                    if (!c || !activeQuiz || !activeQuiz.isMockExam) return;
                    const reminderMsg = { role: 'bot', content: text, source: 'local', timestamp: Date.now(), id: `msg-${Date.now()}-mockreminder` };
                    c.messages.push(reminderMsg);
                    if (c.id === currentChatId) appendMessageToDOM(reminderMsg);
                    saveData();
                }, minutesFromNow * 60000);
                mockExamTimers.push(id);
            };
            if (duration > 5) scheduleReminder(duration - 5, '⏰ باقي ٥ دقايق بس على وقت الامتحان — ابدأ تجهّز إجاباتك.');
            scheduleReminder(duration, '⏰ خلص وقت الامتحان! ابعتلي إجاباتك دلوقتي زي ما هي عشان أصححها.');

            closeModal('mockExamModal');
            mockExamChapters = [];
            showToast('بدأ امتحان المحاكاة — جاوب في الشات', 'success');
        }

        // ====================== Premium: مكتبة الأدوية الشخصية ======================
        let drugLibrary = JSON.parse(localStorage.getItem('sx_drug_library') || '[]');
        function saveDrugToLibrary(dataUrl) {
            const img = new Image();
            img.onload = () => {
                const maxDim = 240;
                let w = img.width, h = img.height;
                if (Math.max(w, h) > maxDim) {
                    const scale = maxDim / Math.max(w, h);
                    w = Math.round(w * scale); h = Math.round(h * scale);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const thumb = canvas.toDataURL('image/jpeg', 0.7);
                drugLibrary.unshift({ thumb, timestamp: Date.now() });
                drugLibrary = drugLibrary.slice(0, 60); // حد أقصى معقول عشان مساحة localStorage متخلصش
                try { localStorage.setItem('sx_drug_library', JSON.stringify(drugLibrary)); } catch (e) { /* المساحة خلصت، هنتجاهل بهدوء */ }
            };
            img.src = dataUrl;
        }
        function openDrugLibrary() {
            if (!hasPremium('premium_drug_library')) { requestPremiumFeatureFromAdmin('premium_drug_library'); return; }
            reportFeatureUsage('premium_drug_library');
            const grid = document.getElementById('drugLibraryGrid');
            const empty = document.getElementById('drugLibraryEmpty');
            if (!drugLibrary.length) { grid.innerHTML = ''; empty.style.display = 'block'; }
            else {
                empty.style.display = 'none';
                grid.innerHTML = drugLibrary.map((d, i) => `
                    <div class="drug-lib-item" onclick="viewDrugLibItem(${i})">
                        <img src="${d.thumb}" alt="دواء محفوظ" loading="lazy">
                        <div class="date">${new Date(d.timestamp).toLocaleDateString('ar-EG')}</div>
                    </div>
                `).join('');
            }
            openModal('drugLibraryModal');
        }
        function viewDrugLibItem(i) {
            const d = drugLibrary[i];
            if (d) window.open(d.thumb, '_blank');
        }


        function calculatePercentage() {
            const v = parseFloat(document.getElementById('percValue').value);
            const t = parseFloat(document.getElementById('percTotal').value);
            const resDiv = document.getElementById('percResult');
            if (!v || !t) { resDiv.innerHTML = 'أدخل القيم'; resDiv.classList.add('show'); return; }
            resDiv.innerHTML = `${((v / t) * 100).toFixed(1)}%`;
            resDiv.classList.add('show');
        }

        function calculateBMI() {
            const w = parseFloat(document.getElementById('bmiWeight').value);
            const h = parseFloat(document.getElementById('bmiHeight').value) / 100;
            const resDiv = document.getElementById('bmiResult');
            if (!w || !h) { resDiv.innerHTML = 'أدخل القيم'; resDiv.classList.add('show'); return; }
            const bmi = (w / (h * h)).toFixed(1);
            resDiv.innerHTML = `${bmi}`;
            resDiv.classList.add('show');
        }

        if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Tracks the upload "session" so a stale async extraction (PDF/OCR) can't
        // overwrite a newer attachment or resurrect one the user already removed.
        let attachmentToken = 0;

        async function extractPdfText(file, onStatus) {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            // Large/"ضخمة" PDFs: read up to 80 pages and up to ~25k characters — enough for
            // most textbooks/chapters — instead of bailing out early on big files.
            const TEXT_CHAR_CAP = 25000;
            const maxPages = Math.min(pdf.numPages, 80);
            let text = '';
            for (let i = 1; i <= maxPages; i++) {
                if (onStatus && maxPages > 8 && (i % 5 === 0 || i === maxPages)) {
                    onStatus(`جارٍ استخراج النص... صفحة ${i} من ${maxPages}`);
                }
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(it => it.str).join(' ') + '\n';
                if (text.length > TEXT_CHAR_CAP) break;
            }
            text = text.trim();

            // A real text layer came back — most PDFs (Word exports, typed docs, etc).
            if (text.replace(/\s/g, '').length >= 30) {
                const truncated = text.length > TEXT_CHAR_CAP;
                const out = text.slice(0, TEXT_CHAR_CAP);
                return truncated ? `${out}\n\n[...تم اقتطاع باقي النص لأن الملف طويل جدًا...]` : out;
            }

            // Almost nothing extracted — this is a scanned/image-based PDF with no text
            // layer, which is exactly the case that used to fail outright. Instead of
            // giving up, render each page to a canvas and run OCR on the image, the same
            // way we already do for uploaded photos.
            if (!window.Tesseract) throw new Error('empty');

            const OCR_CHAR_CAP = 25000;
            const ocrPages = Math.min(pdf.numPages, 15); // OCR is slow client-side — cap pages
            let ocrText = '';
            for (let i = 1; i <= ocrPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;
                try {
                    // logger بيدينا نسبة تقدم حقيقية (0 إلى 1) بدل ما تفضل الرسالة ثابتة —
                    // الطالب يشوف فعلاً إن في تقدم حقيقي وإن الصفحة مش عالقة.
                    const { data } = await Tesseract.recognize(canvas, 'ara+eng', {
                        logger: (m) => {
                            if (onStatus && m.status === 'recognizing text') {
                                const pct = Math.round((m.progress || 0) * 100);
                                onStatus(`جارٍ تحليل صفحة ${i} من ${ocrPages} بالـ OCR... ${pct}%`);
                            } else if (onStatus) {
                                onStatus(`جارٍ تحليل صفحة ${i} من ${ocrPages} بالـ OCR...`);
                            }
                        }
                    });
                    ocrText += (data.text || '') + '\n';
                } catch (e) {}
                if (ocrText.length > OCR_CHAR_CAP) break;
            }
            ocrText = ocrText.trim();
            if (!ocrText) throw new Error('empty');
            const truncated = ocrText.length > OCR_CHAR_CAP;
            const out = ocrText.slice(0, OCR_CHAR_CAP);
            return truncated ? `${out}\n\n[...تم اقتطاع باقي النص لأن الملف طويل جدًا...]` : out;
        }

        // Cleans up raw extracted text (collapses repeated spaces/blank lines from PDF/OCR
        // extraction) and wraps it in a clearly delimited, nicely formatted block so both the
        // AI model and the person reading the chat can tell exactly what came from the file.
        function formatAttachmentForMessage(name, textContent, kind) {
            const cleaned = (textContent || '')
                .replace(/[ \t]{2,}/g, ' ')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            const icon = kind === 'pdf' ? '📄' : kind === 'image' ? '🖼️' : '📎';
            const label = kind === 'pdf' ? 'ملف PDF' : kind === 'image' ? 'صورة' : 'ملف';
            const body = cleaned || '(لم يتم العثور على نص قابل للقراءة في الملف)';
            return `${icon} **مرفق (${label}): ${name}**\n> تم استخراج النص التالي تلقائيًا وتنسيقه:\n\n---\n${body}\n---`;
        }

        // بيصغّر الصورة وبيضغطها قبل الرفع (أبعاد أقصاها 1600px، جودة JPEG 82%) —
        // بيوفر باندويدث وسرعة رفع كبيرة على نت الموبايل، خصوصًا لصور الكاميرا اللي
        // بتيجي غالبًا 3000+ px. بيتخطى الضغط لو الملف أصلاً صغير (أقل من 300KB).
        function compressImageFile(file, maxDim = 1600, quality = 0.82) {
            return new Promise((resolve) => {
                if (file.size < 300 * 1024) { resolve(file); return; }
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    let { width, height } = img;
                    if (width <= maxDim && height <= maxDim) { resolve(file); return; }
                    const scale = maxDim / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (!blob) { resolve(file); return; }
                        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); }; // فشل الضغط؟ نكمل بالملف الأصلي بدل ما نوقف الرفع
                img.src = objectUrl;
            });
        }

        // ====================== فحص الدواء بالكاميرا ======================
        // بيفتح الكاميرا (html5-qrcode) ويحاول يقرا أي باركود/كيوركود/DataMatrix على علبة
        // الدواء بشكل حي. لو قرا كود، بيسيبه معروض فوق الشاشة وبيكمل يصور عادي. الطالب
        // بيلتقط صورة العلبة (يدويًا)، وبعدين بترسل الصورة + أي كود اتقرا كمرفق صورة عادي
        // لنفس مسار الشات اللي بيحلل الصور (zimage) مع سؤال جاهز مخصص لطالب تمريض متدرب.
        const DRUG_SCAN_PROMPT = 'أنا طالب تمريض بتدرب في الصيدلية، ودي صورة لعلبة دواء أو محلول أو أمبولة. من فضلك حدد لي:\n1) اسم الدواء (العلمي والتجاري لو ظاهر في الصورة)\n2) الفئة الدوائية\n3) دواعي الاستعمال\n4) الجرعة الشائعة وطريقة الإعطاء\n5) أهم الأعراض الجانبية والتحذيرات\n6) ملاحظات مهمة للتمريض عند إعطاء الدواء\nاشرح بنقاط منظمة ومبسطة، وأضف في الآخر تنبيه واضح إن ده للمساعدة التعليمية بس ولازم تأكيد المشرف/الصيدلي قبل أي صرف أو إعطاء فعلي للدواء.';

        // ====================== محاكي المواقف الإكلينيكية ======================
        function openClinicalSimPicker() {
            if (!hasPremium('premium_clinical_sim')) { requestPremiumFeatureFromAdmin('premium_clinical_sim'); return; }
            reportFeatureUsage('premium_clinical_sim');
            openModal('clinicalSimPickerModal');
        }
        function startClinicalSim(specialty) {
            closeModal('clinicalSimPickerModal');
            const newChat = { id: 'chat_' + Date.now(), title: `🩺 محاكاة: ${specialty}`, messages: [], timestamp: Date.now(), clinicalSimSpecialty: specialty };
            chats.unshift(newChat);
            currentChatId = newChat.id;
            saveData();
            renderChatList();
            renderChat(currentChatId);
            if (window.innerWidth < 768) closeSidebar();
            sendQuick('ابدأ المحاكاة');
        }

        // ====================== الفيديو المتفرّع (محاكاة قرارات بمشاهد وصوت) ======================
        // كل سيناريو شجرة عُقد ثابتة (مش AI حرّ زي محاكي المواقف) — كل عقدة فيها: مود المشهد
        // (بيلوّن المونيتور)، علامات حيوية، نص سردي بيتقرا بالصوت (نفس /api/tts)، واختيارات
        // بتودّي لعقدة تانية. عقدة "ending: true" هي نهاية مسار. لإضافة سيناريو جديد، زوّد
        // عنصر جديد في المصفوفة دي بنفس الشكل — مفيش أي حاجة تانية محتاجة تتغيّر.
        const VIDEO_SCENARIOS = [
            {
                id: 'chest_pain', icon: '🫀', title: 'ألم صدر مفاجئ', specialty: 'باطنة وطوارئ', difficulty: 'متوسط',
                startNode: 'n1',
                nodes: {
                    n1: {
                        mood: 'normal', vitals: { hr: 92, spo2: 97, bp: '130/85' },
                        narration: 'انت الممرض المناوب في الطوارئ. راجل عمره 58 سنة داخل ماسك صدره وبيقول إن في ألم شديد بادئ من عشر دقايق، وعرقان بارد ولونه شاحب.',
                        choices: [
                            { text: 'أقيس العلامات الحيوية وأعمل ECG فورًا وأنده الدكتور', next: 'n2' },
                            { text: 'أديله أكسجين وأسكّنله الألم الأول من غير أي تقييم', next: 'n2b' },
                            { text: 'أنده الدكتور بس وأستنى وصوله من غير ما أعمل حاجة', next: 'n2c' }
                        ]
                    },
                    n2: {
                        mood: 'tense', vitals: { hr: 104, spo2: 94, bp: '110/70' },
                        narration: 'الـ ECG طلع فيه ST elevation واضح. الدكتور جه وشكّل احتمال جلطة قلبية (MI)، وطلب أسبرين فورًا وتجهيز المريض لنقله لقسطرة القلب.',
                        choices: [
                            { text: 'أديله الأسبرين على طول حسب بروتوكول الطوارئ وأجهّز النقل', next: 'n3' },
                            { text: 'أستنى توقيع مكتوب من الدكتور الأول قبل أي دواء', next: 'n3b' }
                        ]
                    },
                    n2b: {
                        mood: 'tense', vitals: { hr: 110, spo2: 91, bp: '105/65' },
                        narration: 'الألم هدى شوية بس الأكسجين لسه نازل والدكتور جه مستغرب إن مفيش ECG اتعمل خالص — دلوقتي في وقت ضاع كان ممكن يتستغل.',
                        choices: [
                            { text: 'أعترف بالتأخير وأعمل ECG دلوقتي على طول', next: 'n3c' },
                            { text: 'أكمل نفس الخطة وأأجل الـ ECG لحد ما المريض يهدى أكتر', next: 'end_critical1' }
                        ]
                    },
                    n2c: {
                        mood: 'critical', vitals: { hr: 128, spo2: 88, bp: '90/60' },
                        narration: 'وانت مستني، ضغط المريض بدأ ينزل وبقى شارد الذهن وعرقان أكتر — الوقت اللي ضاع كان حرج.',
                        choices: [
                            { text: 'أبدأ تقييم طوارئ فوري (ABC) وأطلب مساعدة دلوقتي', next: 'n3c' },
                            { text: 'أكمل انتظار الدكتور من غير أي تدخل', next: 'end_critical2' }
                        ]
                    },
                    n3: {
                        mood: 'normal', vitals: { hr: 88, spo2: 98, bp: '125/80' }, ending: true, quality: 'excellent',
                        narration: 'اتاخد الأسبرين في وقته والمريض اتنقل لقسطرة القلب في التوقيت المثالي (door-to-balloon قصير). القرارات كلها كانت سريعة وصح — ده أفضل مسار ممكن للحالة دي.'
                    },
                    n3b: {
                        mood: 'tense', vitals: { hr: 98, spo2: 95, bp: '115/75' }, ending: true, quality: 'good',
                        narration: 'التوقيع المكتوب اتأخر شوية والأسبرين اتاخد متأخر عن الوقت المثالي، بس قبل ما يحصل أي تدهور خطير. الحالة استقرت في النهاية بس الالتزام الحرفي بالورق كلّف وقت كان ممكن يتستغل أحسن.'
                    },
                    n3c: {
                        mood: 'tense', vitals: { hr: 106, spo2: 93, bp: '108/68' }, ending: true, quality: 'risky',
                        narration: 'التقييم الصح حصل في الآخر والحالة استقرت، بس التأخير الأول كان ممكن يكلّف حياة المريض لو كمّل شوية كمان. نجاة الحالة هنا كانت بفارق ضيق مش بسبب القرار الأول.'
                    },
                    end_critical1: {
                        mood: 'critical', vitals: { hr: 140, spo2: 82, bp: '80/50' }, ending: true, quality: 'critical',
                        narration: 'المريض دخل في تدهور حاد (احتمال arrest) بسبب تأخير التشخيص والعلاج — الفريق اضطر ينده كود طوارئ كامل. التأخير في التقييم الأولي كان السبب المباشر.'
                    },
                    end_critical2: {
                        mood: 'critical', vitals: { hr: 145, spo2: 80, bp: '75/45' }, ending: true, quality: 'critical',
                        narration: 'الانتظار السلبي من غير أي تقييم أو تدخل خلّى الحالة توصل لتدهور حرج قبل ما الدكتور يوصل أصلًا — في حالات زي دي، التقييم الأولي والتدخل بيبدأ من الممرض على طول، مش بعد ما الدكتور يوصل.'
                    }
                }
            }
        ];

        let currentVideoSim = null;   // { scenario, nodeId, path: [{nodeId, choiceText}, ...] }

        // ====================== محرك ECG حي (Canvas) — بيرسم موجة قلب متحركة فعليًا
        // (مش أيقونة نابضة ثابتة)، السرعة والانتظام بيتغيّروا حسب mood العقدة الحالية:
        // normal = نبضة منتظمة هادية، tense = أسرع، critical = أسرع وغير منتظمة (jitter).
        let simEcgRAF = null;
        function stopSimEcg() {
            if (simEcgRAF) cancelAnimationFrame(simEcgRAF);
            simEcgRAF = null;
        }
        function startSimEcg(mood) {
            stopSimEcg();
            const canvas = document.getElementById('simEcgCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth || 280;
            const cssH = canvas.clientHeight || 58;
            canvas.width = cssW * dpr;
            canvas.height = cssH * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const speedMap = { normal: 1, tense: 1.6, critical: 2.3 };
            const colorMap = { normal: '#34d399', tense: '#f59e0b', critical: '#ef4444' };
            const speed = speedMap[mood] || 1;
            const color = colorMap[mood] || colorMap.normal;
            const maxPoints = Math.max(60, Math.floor(cssW));
            const points = [];
            let i = 0;

            // شكل موجة QRS مبسّط: خط شبه مستوي، ثم انخفاض بسيط، ثم قمة حادة، ثم هبوط تحت
            // الخط، ثم رجوع — تقريبًا نفس شكل موجة القلب الحقيقية على أي مونيتور.
            function nextY(step) {
                const beatLen = Math.max(16, 42 / speed);
                const t = (step % beatLen) / beatLen;
                let y;
                if (t > 0.40 && t < 0.48) y = -10 * ((t - 0.40) / 0.08);
                else if (t >= 0.48 && t < 0.54) y = 26 - (46 * ((t - 0.48) / 0.06));
                else if (t >= 0.54 && t < 0.62) y = -20 + (20 * ((t - 0.54) / 0.08));
                else y = Math.sin(t * Math.PI * 2) * 1.2;
                if (mood === 'critical') y += (Math.random() - 0.5) * 7;
                return y;
            }

            function draw() {
                i += speed;
                points.push(nextY(i));
                if (points.length > maxPoints) points.shift();
                ctx.clearRect(0, 0, cssW, cssH);
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.6;
                ctx.shadowColor = color;
                ctx.shadowBlur = 5;
                const midY = cssH / 2;
                const step = cssW / maxPoints;
                points.forEach((py, idx) => {
                    const px = idx * step;
                    const y = midY - py;
                    if (idx === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
                });
                ctx.stroke();
                simEcgRAF = requestAnimationFrame(draw);
            }
            draw();
        }

        // مؤشر "بيتكلم" الصغير جنب النص — شغال بس وقت ما الصوت فعليًا بيتشغّل
        function setSimTalking(active) {
            const el = document.getElementById('simTalkIndicator');
            if (el) el.classList.toggle('active', Boolean(active));
        }

        let currentSimAudio = null;
        let simSpeakToken = 0;
        let customScenariosCache = null; // null = لسه معملناش fetch، array = اتحمّلت

        function scenarioEndingCount(scenario) { return Object.values(scenario.nodes).filter(n => n.ending).length; }

        // بيرجّع كل السيناريوهات (الجاهزة + اللي اتضافت بالاستوديو)، ويحمّل المخصصة من
        // السيرفر أول مرة بس (مش كل فتحة قائمة) عشان السرعة.
        async function getAllScenarios() {
            if (customScenariosCache === null) {
                try {
                    const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/scenarios`, { headers: { 'Authorization': `Bearer ${schoolToken}` } });
                    const data = res.ok ? await res.json() : { scenarios: [] };
                    customScenariosCache = data.scenarios || [];
                } catch (e) { customScenariosCache = []; }
            }
            return [...VIDEO_SCENARIOS, ...customScenariosCache];
        }
        function findScenarioById(id) {
            return [...VIDEO_SCENARIOS, ...(customScenariosCache || [])].find(s => s.id === id);
        }

        async function openVideoSimList() {
            if (!hasPremium('premium_video_sim')) { requestPremiumFeatureFromAdmin('premium_video_sim'); return; }
            reportFeatureUsage('premium_video_sim');
            const seen = JSON.parse(localStorage.getItem('sx_video_sim_endings') || '{}');
            const wrap = document.getElementById('videoSimListWrap');
            wrap.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px;">جارٍ التحميل...</div>';
            const all = await getAllScenarios();
            openModal('videoSimListModal');
            wrap.innerHTML = all.map(s => {
                const discovered = (seen[s.id] || []).length;
                return `<div class="premium-card" style="cursor:pointer;" onclick="startVideoSim('${s.id}')">
                    <div class="premium-card-head">
                        <span class="premium-card-icon">${s.icon}</span>
                        <span class="premium-card-title">${s.title}${s.custom ? ' <span style="font-size:10px;color:var(--accent);">(مضافة)</span>' : ''}</span>
                    </div>
                    <div class="premium-card-desc">${s.specialty} · صعوبة ${s.difficulty}</div>
                    <div style="font-size:11px;color:var(--text-3);">نهايات مكتشفة: ${discovered}/${scenarioEndingCount(s)}</div>
                </div>`;
            }).join('');
        }

        // بيرقّع أي عقدة ناقصها بيانات أساسية (حصل مع حالات مولّدة بالذكاء الاصطناعي فاتها
        // "vitals" أو "mood" في عقدة معينة جوه الشجرة) — بدل ما التطبيق يتجمد على شاشة
        // فاضية لما يوصل لعقدة زي دي. عقدة مش نهاية وناقصها "choices" بنحوّلها لنهاية آمنة
        // (quality: good) بدل ما تكسر التجربة تمامًا.
        function normalizeScenarioClient(scenario) {
            const moods = ['normal', 'tense', 'critical'];
            const qualities = ['excellent', 'good', 'risky', 'critical'];
            const vDefaults = {
                normal: { hr: 88, spo2: 97, bp: '120/80' },
                tense: { hr: 108, spo2: 93, bp: '105/70' },
                critical: { hr: 130, spo2: 85, bp: '85/55' }
            };
            Object.values(scenario.nodes || {}).forEach(node => {
                if (!moods.includes(node.mood)) node.mood = 'normal';
                const d = vDefaults[node.mood];
                if (!node.vitals || typeof node.vitals !== 'object') node.vitals = { ...d };
                else {
                    if (typeof node.vitals.hr !== 'number') node.vitals.hr = d.hr;
                    if (typeof node.vitals.spo2 !== 'number') node.vitals.spo2 = d.spo2;
                    if (!node.vitals.bp) node.vitals.bp = d.bp;
                }
                if (node.ending) {
                    if (!qualities.includes(node.quality)) node.quality = 'good';
                } else if (!Array.isArray(node.choices) || !node.choices.length) {
                    node.ending = true;
                    node.quality = qualities.includes(node.quality) ? node.quality : 'good';
                }
            });
            return scenario;
        }

        function startVideoSim(scenarioId) {
            const scenario = findScenarioById(scenarioId);
            if (!scenario) return;
            normalizeScenarioClient(scenario);
            currentVideoSim = { scenario, nodeId: scenario.startNode, path: [] };
            closeModal('videoSimListModal');
            openModal('videoSimPlayerModal');
            document.getElementById('simEndingWrap').style.display = 'none';
            renderSimNode();
        }

        // ====================== استوديو الحالات ======================
        let scenarioFormAiRandom = false;
        function openCustomScenarioForm(aiRandom) {
            if (!hasPremium('premium_video_sim')) { requestPremiumFeatureFromAdmin('premium_video_sim'); return; }
            reportFeatureUsage('premium_video_sim');
            scenarioFormAiRandom = Boolean(aiRandom);
            closeModal('scenarioStudioModal');
            document.getElementById('customScenarioFormTitle').textContent = scenarioFormAiRandom ? 'توليد حالة عشوائية' : 'أضف حالة بنفسك';
            document.getElementById('scenarioFormDescWrap').style.display = scenarioFormAiRandom ? 'none' : 'block';
            document.getElementById('scenarioFormDesc').value = '';
            document.getElementById('scenarioFormStatus').textContent = '';
            openModal('customScenarioFormModal');
        }

        async function submitCustomScenarioForm() {
            const specialty = document.getElementById('scenarioFormSpecialty').value;
            const difficulty = document.getElementById('scenarioFormDifficulty').value;
            const desc = document.getElementById('scenarioFormDesc').value.trim();
            if (!scenarioFormAiRandom && !desc) {
                document.getElementById('scenarioFormStatus').innerHTML = '<span style="color:var(--danger)">اكتب وصف الحالة الأول</span>';
                return;
            }
            const seedPrompt = scenarioFormAiRandom
                ? `ولّد حالة إكلينيكية واقعية ومناسبة تعليميًا لطالب تمريض في تخصص ${specialty}، من غير أي قيود تانية — اختار إنت أنسب موقف.`
                : desc;
            closeModal('customScenarioFormModal');
            await generateAndSaveScenario(seedPrompt, specialty, difficulty, scenarioFormAiRandom ? 'ai_random' : 'custom');
        }

        // ====================== استخراج من بنك أسئلة المواقف ======================
        function openBankScenarioPicker() {
            if (!hasPremium('premium_video_sim')) { requestPremiumFeatureFromAdmin('premium_video_sim'); return; }
            reportFeatureUsage('premium_video_sim');
            closeModal('scenarioStudioModal');
            const sel = document.getElementById('bankScenarioSubjectSelect');
            if (!sel.dataset.filled) {
                sel.dataset.filled = '1';
                BANK_CATALOG.forEach((s, i) => {
                    const opt = document.createElement('option');
                    opt.value = i; opt.textContent = s.subject;
                    sel.appendChild(opt);
                });
            }
            document.getElementById('bankScenarioQuestionsList').innerHTML = '';
            document.getElementById('bankScenarioStatus').textContent = '';
            openModal('bankScenarioPickerModal');
        }

        async function populateBankScenarioChapters() {
            const subjIdx = document.getElementById('bankScenarioSubjectSelect').value;
            const chapSel = document.getElementById('bankScenarioChapterSelect');
            document.getElementById('bankScenarioQuestionsList').innerHTML = '';
            if (subjIdx === '') { chapSel.innerHTML = '<option value="">اختر الفصل...</option>'; return; }
            const subj = BANK_CATALOG[subjIdx];
            const apiUrl = FIXED_SCHOOL_API_URL;
            chapSel.innerHTML = '<option value="">اختر الفصل...</option>';
            for (const id of subj.ids) {
                const file = `${subj.prefix}${id}.js`;
                const varName = `${subj.prefix}${id}`;
                const cacheKey = varName;
                let data = bankChaptersCache[cacheKey];
                if (!data) {
                    data = await fetchBankFile(apiUrl, file, varName);
                    if (data) bankChaptersCache[cacheKey] = data;
                }
                const opt = document.createElement('option');
                opt.value = cacheKey;
                opt.textContent = data ? (data.name || file) : `${file} (تعذر التحميل)`;
                if (!data || !Array.isArray(data.situations) || !data.situations.length) opt.disabled = true;
                chapSel.appendChild(opt);
            }
        }

        function loadBankScenarioQuestions() {
            const cacheKey = document.getElementById('bankScenarioChapterSelect').value;
            const listEl = document.getElementById('bankScenarioQuestionsList');
            if (!cacheKey) { listEl.innerHTML = ''; return; }
            const data = bankChaptersCache[cacheKey];
            const situations = (data && Array.isArray(data.situations)) ? data.situations : [];
            if (!situations.length) {
                listEl.innerHTML = '<div style="font-size:12px;color:var(--text-3);text-align:center;padding:12px;">مفيش أسئلة مواقف في الفصل ده</div>';
                return;
            }
            listEl.innerHTML = situations.map((q, i) =>
                `<button class="btn-calc" style="background:var(--bg-2);color:var(--text-1);text-align:right;justify-content:flex-start;font-size:12px;line-height:1.6;height:auto;padding:10px 12px;" onclick="pickBankScenarioQuestion(${i}, '${cacheKey}')">${(q.text || '').slice(0, 140)}</button>`
            ).join('');
        }

        async function pickBankScenarioQuestion(index, cacheKey) {
            const data = bankChaptersCache[cacheKey];
            const q = data?.situations?.[index];
            if (!q) return;
            closeModal('bankScenarioPickerModal');
            const seedPrompt = `حوّل سؤال الموقف الحقيقي ده من بنك الأسئلة لسيناريو تفاعلي متفرّع كامل بنفس المضمون الطبي بتاعه:\n"${q.text}"${q.answer ? `\n(الإجابة النموذجية الأصلية للسؤال، استخدمها كمرجع لتحديد مين القرار الصح: ${q.answer})` : ''}`;
            await generateAndSaveScenario(seedPrompt, data.name || 'عام', 'متوسط', 'question_bank');
        }

        // ====================== المولّد المشترك (بيخدم الطرق التلاتة) ======================
        async function generateAndSaveScenario(seedPrompt, specialty, difficulty, source) {
            showToast('بيولّد الحالة بالذكاء الاصطناعي، استنى شوية...', 'success');
            try {
                const res = await fetch(`${settings.backendUrl}/api/generate-scenario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ seedPrompt, specialty, difficulty })
                });
                const data = await res.json();
                if (!res.ok || !data.scenario) throw new Error(data.error || 'فشل توليد الحالة');

                const saveRes = await fetch(`${FIXED_SCHOOL_API_URL}/api/scenarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolToken}` },
                    body: JSON.stringify({ ...data.scenario, source })
                });
                if (!saveRes.ok) throw new Error('اتولّدت الحالة بس تعذر حفظها');

                // نحدّث الكاش المحلي فورًا بالحالة الجديدة (بدل ما نصفّره ونضطر ننتظر إعادة
                // تحميل من السيرفر) عشان startVideoSim يلاقيها ويشغّلها على طول من غير تأخير.
                if (!Array.isArray(customScenariosCache)) customScenariosCache = [];
                customScenariosCache.push({ ...data.scenario, custom: true });
                showToast('الحالة جاهزة!', 'success');
                startVideoSim(data.scenario.id);
            } catch (e) {
                showToast(e.message || 'حصل خطأ أثناء توليد الحالة', 'error');
            }
        }


        // بيحدد شكل "غرفة" المسرح حسب تخصص الحالة — تخمين بسيط بالكلمات المفتاحية، مش
        // بيانات صريحة لكل سيناريو (عشان يشتغل مع الحالات الجاهزة والمولّدة كلها من غير
        // ما نحتاج نعدّل بياناتها).
        function getRoomClassForSpecialty(specialty) {
            const s = (specialty || '').toLowerCase();
            if (s.includes('جراح') || s.includes('عمليات')) return 'room-or';
            if (s.includes('طوارئ')) return 'room-er';
            if (s.includes('عناية') || s.includes('مركزة')) return 'room-icu';
            if (s.includes('أطفال') || s.includes('اطفال')) return 'room-peds';
            return 'room-ward';
        }
        const SIM_ROOM_LABELS = {
            'room-or': '🔪 غرفة العمليات', 'room-er': '🚑 قسم الطوارئ', 'room-icu': '🫁 العناية المركزة',
            'room-peds': '🧒 جناح الأطفال', 'room-ward': '🏥 الجناح الداخلي'
        };
        function renderSimStage(scenario, node) {
            const roomClass = getRoomClassForSpecialty(scenario.specialty);
            const bg = document.getElementById('simStageBg');
            bg.className = 'sim-stage-bg ' + roomClass;

            const tag = document.getElementById('simSpeakerTag');
            tag.textContent = SIM_ROOM_LABELS[roomClass] || '';
            tag.style.display = 'inline-block';

            // شخصيات ثابتة (المريض / أنت كممرض مناوب / الطبيب المسؤول) — بتوهج الأفاتار
            // المناسب حسب خطورة اللحظة (mood العقدة الحالية) عشان يحس إنه "مشهد حي".
            const chars = [
                { icon: '🧑‍⚕️', label: 'أنت (الممرض)', active: node.mood === 'normal' },
                { icon: '🧑‍🦱', label: 'المريض', active: node.mood === 'critical', breathing: true },
                { icon: '🩺', label: 'الطبيب', active: node.mood === 'tense' }
            ];
            document.getElementById('simStageCharacters').innerHTML = chars.map(c => `
                <div class="sim-char ${c.active ? 'speaking' : ''} ${c.breathing ? 'breathing' : ''} ${c.breathing && node.mood === 'critical' ? 'breathing-fast' : ''}">
                    <div class="sim-char-avatar">${c.icon}</div>
                    <div class="sim-char-label">${c.label}</div>
                </div>
            `).join('');

            // دقائق غبار/إضاءة عائمة — بنولّدها من جديد كل مشهد بموضع/توقيت عشوائي
            // عشان تحس إن كل "لقطة" مختلفة عن اللي قبلها، مش نفس الحركة بالظبط.
            const particlesEl = document.getElementById('simStageParticles');
            if (particlesEl) {
                particlesEl.innerHTML = Array.from({ length: 10 }).map(() => {
                    const left = Math.round(Math.random() * 100);
                    const duration = (4 + Math.random() * 4).toFixed(1);
                    const delay = (Math.random() * 4).toFixed(1);
                    return `<span style="left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;"></span>`;
                }).join('');
            }
        }

        function renderSimNode() {
            const { scenario, nodeId } = currentVideoSim;
            const node = scenario.nodes[nodeId];

            // كروس-فيد: نغمّق المسرح والمونيتور ونص الحوار سريعًا، نبدّل المحتوى وهو مختفي،
            // وبعدين نرجّعه — بيحس المستخدم إنه "قطع مشهد" حقيقي مش تبديل نص فجائي.
            const fadeEls = [
                document.getElementById('simStageBg'),
                document.getElementById('simStageCharacters'),
                document.getElementById('simMonitor'),
                document.querySelector('.sim-narration-box')
            ].filter(Boolean);
            fadeEls.forEach(el => el.classList.add('sim-scene-fading'));

            setTimeout(() => {
                try {
                    document.getElementById('simTitle').innerHTML = `<i class="fas fa-clapperboard"></i> ${scenario.title}`;
                    document.getElementById('simNarration').textContent = node.narration;
                    renderSimStage(scenario, node);
                    const monitor = document.getElementById('simMonitor');
                    monitor.className = 'sim-monitor sim-mood-' + node.mood;
                    document.getElementById('simHr').textContent = node.vitals.hr;
                    document.getElementById('simSpo2').textContent = node.vitals.spo2;
                    document.getElementById('simBp').textContent = node.vitals.bp;
                    startSimEcg(node.mood);

                    document.getElementById('simChoicesWrap').style.display = 'none';
                    document.getElementById('simChoicesWrap').innerHTML = '';
                    document.getElementById('simEndingWrap').style.display = 'none';
                    document.getElementById('simSkipBtn').style.display = '';

                    fadeEls.forEach(el => el.classList.remove('sim-scene-fading'));
                    speakSimNarration(node.narration);
                } catch (err) {
                    // آخر خط دفاع: أي مشكلة غير متوقعة في بيانات العقدة متسيبش المشهد
                    // عالق فاضي — بنرجّع كل حاجة تبان ونطلع بدل ما نجمّد التجربة.
                    fadeEls.forEach(el => el.classList.remove('sim-scene-fading'));
                    showToast('حصلت مشكلة في بيانات الحالة دي — جرب حالة تانية', 'error');
                    exitVideoSim();
                }
            }, 220);
        }

        // 3 طبقات صوت بالترتيب: (1) الصوت الطبيعي الجديد /api/tts-neural (Microsoft Edge
        // Neural)، ولو فشل لأي سبب — (2) /api/tts القديم (Google Translate)، ولو فشل برضه —
        // (3) صوت المتصفح المدمج (speechSynthesis) كملاذ أخير عشان التجربة متتقطعش خالص.
        async function speakSimNarration(text) {
            const myToken = ++simSpeakToken;
            if (currentSimAudio) { currentSimAudio.pause(); currentSimAudio = null; }

            try {
                const blob = await fetchTtsAudioBlob(text);
                if (myToken !== simSpeakToken) return;
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                currentSimAudio = audio;
                const done = () => { URL.revokeObjectURL(url); setSimTalking(false); if (myToken === simSpeakToken) revealSimNode(); };
                audio.onended = done;
                audio.onerror = done;
                setSimTalking(true);
                await audio.play();
                return;
            } catch (err) { setSimTalking(false); /* هنجرب صوت المتصفح كملاذ أخير */ }

            try {
                if ('speechSynthesis' in window) {
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.lang = 'ar-EG';
                    utter.onend = () => { setSimTalking(false); if (myToken === simSpeakToken) revealSimNode(); };
                    utter.onerror = () => { setSimTalking(false); if (myToken === simSpeakToken) revealSimNode(); };
                    setSimTalking(true);
                    window.speechSynthesis.speak(utter);
                    return;
                }
            } catch (err) { setSimTalking(false); /* هنكمل بالنص بس */ }

            if (myToken === simSpeakToken) revealSimNode(); // مفيش صوت متاح خالص؟ نكمل بالنص بس من غير ما نوقّف التجربة
        }

        function skipSimNarration() {
            simSpeakToken++;
            if (currentSimAudio) { currentSimAudio.pause(); currentSimAudio = null; }
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setSimTalking(false);
            revealSimNode();
        }

        function revealSimNode() {
            document.getElementById('simSkipBtn').style.display = 'none';
            const node = currentVideoSim.scenario.nodes[currentVideoSim.nodeId];
            if (node.ending) { renderSimEnding(node); return; }
            const wrap = document.getElementById('simChoicesWrap');
            wrap.innerHTML = node.choices.map((c, i) => `<button class="sim-choice-btn" onclick="pickSimChoice(${i})">${c.text}</button>`).join('');
            wrap.style.display = 'flex';
        }

        function pickSimChoice(i) {
            const node = currentVideoSim.scenario.nodes[currentVideoSim.nodeId];
            const choice = node.choices?.[i];
            // خط دفاع أخير: لو الاختيار ده بيشاور على عقدة مش موجودة أصلاً في الشجرة
            // (رابط مكسور من توليد ناقص)، منكسرش — نطلع برسالة واضحة بدل تجمّد صامت.
            if (!choice || !choice.next || !currentVideoSim.scenario.nodes[choice.next]) {
                showToast('حصلت مشكلة في مسار الحالة دي — جرب حالة تانية', 'error');
                exitVideoSim();
                return;
            }
            currentVideoSim.path.push({ nodeId: currentVideoSim.nodeId, choiceText: choice.text });
            currentVideoSim.nodeId = choice.next;
            renderSimNode();
        }

        const SIM_QUALITY_MAP = {
            excellent: { label: 'ممتاز 🌟', color: 'var(--success)' },
            good: { label: 'جيد 👍', color: 'var(--gold, var(--accent-2))' },
            risky: { label: 'محفوف بالمخاطر ⚠️', color: 'var(--warning)' },
            critical: { label: 'حرج 🚨', color: 'var(--danger)' }
        };

        function renderSimEnding(node) {
            document.getElementById('simChoicesWrap').style.display = 'none';
            const q = SIM_QUALITY_MAP[node.quality] || SIM_QUALITY_MAP.good;
            const badge = document.getElementById('simEndingBadge');
            badge.textContent = q.label;
            badge.style.background = q.color;
            document.getElementById('simEndingText').textContent = node.narration;
            document.getElementById('simEndingWrap').style.display = 'block';

            const seen = JSON.parse(localStorage.getItem('sx_video_sim_endings') || '{}');
            const sid = currentVideoSim.scenario.id;
            seen[sid] = [...new Set([...(seen[sid] || []), currentVideoSim.nodeId])];
            localStorage.setItem('sx_video_sim_endings', JSON.stringify(seen));
        }

        function replayVideoSim() {
            if (!currentVideoSim) return;
            startVideoSim(currentVideoSim.scenario.id);
        }

        function exitVideoSim() {
            simSpeakToken++;
            if (currentSimAudio) { currentSimAudio.pause(); currentSimAudio = null; }
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setSimTalking(false);
            stopSimEcg();
            closeModal('videoSimPlayerModal');
            currentVideoSim = null;
        }

        // بعد ما يوصل لنهاية، بنفتحله شات جديد فيه سياق المسار اللي مشيه (نفس أسلوب محاكي
        // المواقف الإكلينيكية) والـ AI هو اللي بيدّيله التقييم النصي المفصّل — مفيش تكرار
        // لمنطق استدعاء الموديلات، بنستخدم نفس مسار الشات العادي.
        function requestSimAIFeedback() {
            const { scenario, nodeId, path } = currentVideoSim;
            const endingNode = scenario.nodes[nodeId];
            const pathSummary = path.map((p, i) => `${i + 1}) ${p.choiceText}`).join('\n');
            exitVideoSim();
            const newChat = {
                id: 'chat_' + Date.now(), title: `🎬 تقييم: ${scenario.title}`, messages: [], timestamp: Date.now(),
                videoSimResult: { scenarioTitle: scenario.title, pathSummary, endingQuality: endingNode.quality, endingText: endingNode.narration }
            };
            chats.unshift(newChat);
            currentChatId = newChat.id;
            saveData();
            renderChatList();
            renderChat(currentChatId);
            if (window.innerWidth < 768) closeSidebar();
            sendQuick('قيّم قراراتي في المحاكاة دي');
        }

        // ====================== ملخص صوتي للمحاضرات ======================
        let lectureMediaRecorder = null;
        let lectureRecordedChunks = [];
        let lectureRecTimerInterval = null;
        let lectureRecSeconds = 0;
        let lectureRecStream = null;

        function openLectureRecorder() {
            if (!hasPremium('premium_lecture_audio')) { requestPremiumFeatureFromAdmin('premium_lecture_audio'); return; }
            reportFeatureUsage('premium_lecture_audio');
            lectureRecSeconds = 0;
            document.getElementById('lectureRecTimer').textContent = '00:00';
            document.getElementById('lectureRecStatus').textContent = 'دوس تسجيل وابدأ سجّل صوت المحاضر';
            document.getElementById('lectureRecStartBtn').style.display = '';
            document.getElementById('lectureRecStopBtn').style.display = 'none';
            document.getElementById('lectureRecIndicator').style.cssText = 'width:90px;height:90px;border-radius:50%;background:var(--bg-2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;color:var(--text-3);';
            openModal('lectureRecorderModal');
        }
        function closeLectureRecorder() {
            if (lectureMediaRecorder && lectureMediaRecorder.state !== 'inactive') {
                lectureMediaRecorder.stop();
            }
            if (lectureRecStream) { lectureRecStream.getTracks().forEach(t => t.stop()); lectureRecStream = null; }
            if (lectureRecTimerInterval) { clearInterval(lectureRecTimerInterval); lectureRecTimerInterval = null; }
            closeModal('lectureRecorderModal');
        }

        async function startLectureRecording() {
            try {
                lectureRecStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                showToast('محتاجين إذن الميكروفون عشان تسجّل', 'error');
                return;
            }
            lectureRecordedChunks = [];
            // webm/opus مدعوم في كل متصفحات الموبايل الحديثة، وGroq Whisper بيقبله على طول
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
            lectureMediaRecorder = new MediaRecorder(lectureRecStream, mimeType ? { mimeType } : undefined);
            lectureMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) lectureRecordedChunks.push(e.data); };
            lectureMediaRecorder.start();

            lectureRecSeconds = 0;
            lectureRecTimerInterval = setInterval(() => {
                lectureRecSeconds++;
                const m = String(Math.floor(lectureRecSeconds / 60)).padStart(2, '0');
                const s = String(lectureRecSeconds % 60).padStart(2, '0');
                document.getElementById('lectureRecTimer').textContent = `${m}:${s}`;
            }, 1000);

            document.getElementById('lectureRecStartBtn').style.display = 'none';
            document.getElementById('lectureRecStopBtn').style.display = '';
            document.getElementById('lectureRecStatus').textContent = 'بيسجّل دلوقتي... قرّب الموبايل من المحاضر';
            document.getElementById('lectureRecIndicator').style.cssText = 'width:90px;height:90px;border-radius:50%;background:rgba(239,68,68,.15);border:2px solid var(--danger);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;color:var(--danger);animation:glowPulse 1.5s ease-in-out infinite;';
        }

        function stopLectureRecording() {
            if (!lectureMediaRecorder || lectureMediaRecorder.state === 'inactive') return;
            if (lectureRecTimerInterval) { clearInterval(lectureRecTimerInterval); lectureRecTimerInterval = null; }
            document.getElementById('lectureRecStatus').textContent = 'بيجهّز التسجيل...';
            document.getElementById('lectureRecStopBtn').disabled = true;

            lectureMediaRecorder.onstop = async () => {
                if (lectureRecStream) { lectureRecStream.getTracks().forEach(t => t.stop()); lectureRecStream = null; }
                document.getElementById('lectureRecStopBtn').disabled = false;
                const blob = new Blob(lectureRecordedChunks, { type: lectureMediaRecorder.mimeType || 'audio/webm' });
                if (blob.size < 1000) {
                    showToast('التسجيل قصير جدًا، جرب تاني', 'error');
                    closeLectureRecorder();
                    return;
                }
                closeLectureRecorder();
                await transcribeAndSummarizeLecture(blob);
            };
            lectureMediaRecorder.stop();
        }

        async function transcribeAndSummarizeLecture(audioBlob) {
            showToast('بيحوّل الصوت لنص، استنى شوية...', 'success');
            try {
                const form = new FormData();
                form.append('audio', audioBlob, 'lecture.webm');
                const res = await fetch(`${settings.backendUrl}/api/transcribe`, { method: 'POST', body: form });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'فشل تحويل الصوت لنص');
                }
                const data = await res.json();
                const transcript = (data.text || '').trim();
                if (!transcript) {
                    showToast('مفيش كلام واضح اتعرف من التسجيل', 'error');
                    return;
                }
                // بنبدأ شات جديد فيه النص المستخرج كامل + طلب تلخيص، عشان الطالب يقدر
                // يرجع لنص المحاضرة الكامل وقت ما يحب مش بس الملخص.
                const newChat = { id: 'chat_' + Date.now(), title: '🎙️ ملخص محاضرة', messages: [], timestamp: Date.now() };
                chats.unshift(newChat);
                currentChatId = newChat.id;
                saveData();
                renderChatList();
                renderChat(currentChatId);
                sendQuick(`ده نص محاضرة سجّلته بصوتي وتحول لنص تلقائيًا، ممكن تلخصهولي في نقاط منظمة وواضحة (العناوين الرئيسية، أهم المعلومات، أي حاجة يبدو إنها مهمة للامتحان)؟\n\n--- نص المحاضرة ---\n${transcript}`);
            } catch (e) {
                showToast(e.message || 'حصل خطأ أثناء تحويل الصوت', 'error');
            }
        }

        function openDrugScanner() {
            // تنظيف احترازي: لو فيه جلسة كاميرا قديمة اتسابت شغالة من غير إغلاق صحيح
            // (مثلاً الطالب بدّل تطبيق فجأة من غير ما يقفل المودال بالزرار)، الكاميرا
            // بتفضل ماسكة الجهاز فعليًا، وأي محاولة فتح جديدة بترجع خطأ "مرفوض" وهمي —
            // فبنقفل أي حاجة قديمة الأول قبل ما نبدأ من جديد.
            stopDrugScanner();
            drugScanCapturedImage = null;
            drugScanDecodedCode = null;
            document.getElementById('drugScanLiveWrap').style.display = 'block';
            document.getElementById('drugScanPreviewWrap').style.display = 'none';
            document.getElementById('drugScanCodeBadge').classList.remove('show');
            document.getElementById('drugScanConfirmStatus').textContent = '';
            openModal('drugScanModal');
            startDrugScanner();
        }

        function closeDrugScanner() {
            stopDrugScanner();
            closeModal('drugScanModal');
        }

        function startDrugScanner() {
            const statusEl = document.getElementById('drugScanStatus');
            if (!window.Html5Qrcode) {
                statusEl.textContent = 'تعذر تحميل مكتبة قراءة الباركود — لسه ممكن تلتقط الصورة يدويًا وهيتم تحليلها.';
                return;
            }
            try {
                drugScannerInstance = new Html5Qrcode('drugScannerView', {
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.DATA_MATRIX,
                        Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E
                    ],
                    verbose: false
                });
                drugScannerInstance.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 230, height: 230 } },
                    (decodedText) => {
                        drugScanDecodedCode = decodedText;
                        const badge = document.getElementById('drugScanCodeBadge');
                        badge.textContent = `✓ تم قراءة كود: ${decodedText.slice(0, 40)}`;
                        badge.classList.add('show');
                    },
                    () => { /* بيتنادى باستمرار وقت الفشل الطبيعي في القراءة — نتجاهله */ }
                ).then(() => {
                    drugScannerActive = true;
                    statusEl.textContent = 'الكاميرا شغالة — لما الكود يتقرا هيظهر فوق. اضغط "التقط صورة" في أي وقت.';
                }).catch((err) => {
                    // الرسالة القديمة كانت بتقول "تأكد إنك سمحت" لأي خطأ يحصل — حتى لو الإذن
                    // ممنوح فعلاً والمشكلة إن الكاميرا مستخدمة في تاب/تطبيق تاني دلوقتي (السبب
                    // الأشهر عمليًا). دلوقتي بنفرّق حسب النوع الحقيقي للخطأ اللي المتصفح بيرجّعه.
                    const name = (err && (err.name || err)) + '';
                    let msg = 'تعذر فتح الكاميرا. جرب تاني أو من متصفح تاني.';
                    if (/NotAllowedError|Permission/i.test(name)) {
                        msg = 'الإذن مرفوض لموقع Chat X تحديدًا — دوس على أيقونة 🔒 أو (i) جنب رابط الموقع فوق ← إعدادات الموقع ← الكاميرا ← اسمح، وبعدها اعمل تحديث للصفحة';
                    } else if (/NotReadableError|TrackStartError/i.test(name)) {
                        msg = 'الكاميرا مستخدمة دلوقتي في تاب أو تطبيق تاني على جهازك — اقفله وجرب تاني';
                    } else if (/NotFoundError|OverconstrainedError/i.test(name)) {
                        msg = 'مفيش كاميرا خلفية متاحة على الجهاز ده';
                    }
                    statusEl.textContent = msg;
                });
            } catch (e) {
                statusEl.textContent = 'تعذر تشغيل الماسح. لسه ممكن تلتقط الصورة يدويًا.';
            }
        }

        function stopDrugScanner() {
            if (drugScannerInstance && drugScannerActive) {
                drugScannerInstance.stop().then(() => drugScannerInstance.clear()).catch(() => {});
            }
            drugScannerActive = false;
            drugScannerInstance = null;
        }

        // لو الطالب بدّل تطبيق أو تاب والكاميرا لسه شغالة، بنقفلها بنفسنا — غير كده ممكن
        // تفضل ماسكة الجهاز في الخلفية وأي محاولة فتح جديدة بعدين ترجع "مرفوض" وهمي.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && drugScannerActive) stopDrugScanner();
        });

        // بياخد فريم من فيديو الكاميرا الحالي (اللي المكتبة نفسها حاطاه جوه drugScannerView)
        // ويحوله لصورة JPEG مضغوطة، بنفس منطق الأبعاد/الجودة المستخدم في رفع الصور العادي.
        function captureDrugPhoto() {
            const container = document.getElementById('drugScannerView');
            const video = container ? container.querySelector('video') : null;
            if (!video || !video.videoWidth) {
                showToast('الكاميرا لسه بتفتح، استنى ثانية وحاول تاني', 'error');
                return;
            }
            const maxDim = 1600;
            let width = video.videoWidth, height = video.videoHeight;
            if (Math.max(width, height) > maxDim) {
                const scale = maxDim / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            drugScanCapturedImage = { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };

            stopDrugScanner();
            document.getElementById('drugScanPreviewImg').src = dataUrl;
            document.getElementById('drugScanLiveWrap').style.display = 'none';
            document.getElementById('drugScanPreviewWrap').style.display = 'block';
            document.getElementById('drugScanConfirmStatus').textContent = drugScanDecodedCode
                ? `تم قراءة كود من العلبة: ${drugScanDecodedCode.slice(0, 60)}`
                : 'ملقيش كود مقروء — مش مشكلة، المساعد هيحاول يتعرف على الدواء من شكل العلبة والاسم المكتوب عليها.';
        }

        function retryDrugScan() {
            drugScanCapturedImage = null;
            drugScanDecodedCode = null;
            document.getElementById('drugScanCodeBadge').classList.remove('show');
            document.getElementById('drugScanLiveWrap').style.display = 'block';
            document.getElementById('drugScanPreviewWrap').style.display = 'none';
            startDrugScanner();
        }

        // بيقفل المودال، ويحط الصورة الملتقطة كمرفق عادي (زي أي صورة مرفقة يدويًا) مع
        // سؤال جاهز، وبعدين يبعت الرسالة على نفس مسار sendMessage — فهيتوجه تلقائيًا
        // لموديل تحليل الصور (zimage) لأن فيه صورة مرفقة.
        function confirmDrugScan() {
            if (!drugScanCapturedImage) { showToast('التقط صورة العلبة لأول', 'error'); return; }

            let promptText = DRUG_SCAN_PROMPT;
            if (drugScanDecodedCode) {
                promptText += `\n\nكود الباركود/الكيوركود اللي اتقرا من العلبة: ${drugScanDecodedCode}`;
            }

            // مكتبة الأدوية الشخصية (Premium): بنحفظ ثمبنيل الصورة قبل ما نصفّر drugScanCapturedImage
            if (hasPremium('premium_drug_library')) {
                saveDrugToLibrary(`data:${drugScanCapturedImage.mimeType};base64,${drugScanCapturedImage.base64}`);
            }

            pendingAttachment = {
                name: 'drug-scan.jpg',
                base64: drugScanCapturedImage.base64,
                mimeType: drugScanCapturedImage.mimeType,
                processing: false
            };
            showAttachmentChip();

            const input = document.getElementById('messageInput');
            input.value = promptText;
            autoResize(input);
            updateCharCount();

            closeModal('drugScanModal');
            drugScanCapturedImage = null;
            drugScanDecodedCode = null;
            sendMessage();
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const isText = /\.(txt|md)$/i.test(file.name) || file.type.startsWith('text/');
            const isImage = file.type.startsWith('image/');
            const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
            const myToken = ++attachmentToken;

            if (isText) {
                const reader = new FileReader();
                reader.onload = () => {
                    if (myToken !== attachmentToken) return;
                    pendingAttachment = { name: file.name, textContent: reader.result.slice(0, 6000) };
                    showAttachmentChip();
                    showToast(`تم إرفاق: ${file.name}`, 'success');
                };
                reader.onerror = () => showToast('تعذرت قراءة الملف', 'error');
                reader.readAsText(file);
            } else if (isPdf) {
                pendingAttachment = { name: file.name, processing: true, status: 'جارٍ استخراج النص من الـ PDF...' };
                showAttachmentChip();
                extractPdfText(file, (status) => {
                    if (myToken !== attachmentToken || !pendingAttachment) return;
                    pendingAttachment.status = status;
                    showAttachmentChip();
                }).then(text => {
                    if (myToken !== attachmentToken) return;
                    pendingAttachment = { name: file.name, textContent: text };
                    showAttachmentChip();
                    showToast(`تم تحليل الملف: ${file.name}`, 'success');
                }).catch(() => {
                    if (myToken !== attachmentToken) return;
                    pendingAttachment = { name: file.name };
                    showAttachmentChip();
                    showToast('تعذر استخراج أي نص من هذا الملف حتى بعد محاولة الـ OCR', 'error');
                });
            } else if (isImage) {
                pendingAttachment = { name: file.name, processing: true, status: 'جارٍ تجهيز الصورة...' };
                showAttachmentChip();
                compressImageFile(file).then((compressedFile) => {
                    if (myToken !== attachmentToken) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (myToken !== attachmentToken) return;
                        const base64 = reader.result.split(',')[1];
                        pendingAttachment = {
                            name: file.name, base64, mimeType: compressedFile.type,
                            processing: true, status: 'جارٍ تحليل النص داخل الصورة...'
                        };
                        showAttachmentChip();
                        showToast(`تم إرفاق: ${file.name}`, 'success');

                        if (window.Tesseract) {
                            Tesseract.recognize(compressedFile, 'ara+eng', {
                                logger: (m) => {
                                    if (myToken !== attachmentToken || !pendingAttachment) return;
                                    if (m.status === 'recognizing text') {
                                        const pct = Math.round((m.progress || 0) * 100);
                                        pendingAttachment.status = `جارٍ تحليل النص داخل الصورة... ${pct}%`;
                                        showAttachmentChip();
                                    }
                                }
                            }).then(({ data }) => {
                                if (myToken !== attachmentToken || !pendingAttachment) return;
                                const ocrText = (data.text || '').trim();
                                pendingAttachment.textContent = ocrText.slice(0, 6000);
                                pendingAttachment.processing = false;
                                pendingAttachment.status = ocrText ? 'تم استخراج النص من الصورة ✓' : 'لم يتم العثور على نص في الصورة';
                                showAttachmentChip();
                            }).catch(() => {
                                if (myToken !== attachmentToken || !pendingAttachment) return;
                                pendingAttachment.processing = false;
                                pendingAttachment.status = null;
                                showAttachmentChip();
                            });
                        } else {
                            pendingAttachment.processing = false;
                            pendingAttachment.status = null;
                            showAttachmentChip();
                        }
                    };
                    reader.onerror = () => showToast('تعذرت قراءة الملف', 'error');
                    reader.readAsDataURL(compressedFile);
                });
            } else {
                showToast('نوع الملف غير مدعوم لعرض المحتوى، سيتم إرفاق الاسم فقط', 'error');
                pendingAttachment = { name: file.name };
                showAttachmentChip();
            }
            event.target.value = '';
        }

        function showAttachmentChip() {
            let chip = document.getElementById('attachmentChip');
            if (chip) chip.remove();
            if (!pendingAttachment) return;
            chip = document.createElement('div');
            chip.className = 'attachment-chip';
            chip.id = 'attachmentChip';
            const icon = pendingAttachment.processing ? 'fa-spinner fa-spin' : 'fa-paperclip';
            chip.innerHTML = `<i class="fas ${icon}"></i><span></span>`;
            const label = pendingAttachment.status ? `${pendingAttachment.name} — ${pendingAttachment.status}` : pendingAttachment.name;
            chip.querySelector('span').textContent = label;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', clearAttachment);
            chip.appendChild(removeBtn);
            document.querySelector('.input-area').insertBefore(chip, document.getElementById('smartSuggestions'));
            updateCharCount();
        }

        function clearAttachment() {
            attachmentToken++;
            pendingAttachment = null;
            const chip = document.getElementById('attachmentChip');
            if (chip) chip.remove();
            updateCharCount();
        }

        function exportPDF() {
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat || chat.messages.length === 0) {
                showToast('لا توجد محادثة لتصديرها', 'error');
                return;
            }
            showToast('جاري التصدير...', 'success');

            const printable = document.createElement('div');
            printable.style.cssText = 'direction:rtl;font-family:Cairo,sans-serif;padding:20px;color:#0f172a;background:#ffffff;';
            printable.innerHTML = `<h2 style="margin-bottom:16px;">${chat.title}</h2>`;
            chat.messages.forEach(msg => {
                const block = document.createElement('div');
                block.style.cssText = 'margin-bottom:14px;padding:10px 14px;border-radius: var(--radius-sm);background:' + (msg.role === 'user' ? '#eef2ff' : '#f8fafc') + ';border:1px solid #e2e8f0;';
                block.innerHTML = `<strong>${msg.role === 'user' ? 'أنت' : 'Chat X'}:</strong><div>${DOMPurify.sanitize(marked.parse(msg.content))}</div>`;
                printable.appendChild(block);
            });

            html2pdf().set({
                margin: 10,
                filename: `${chat.title || 'chat'}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(printable).save().then(() => {
                showToast('تم التصدير', 'success');
            }).catch(() => {
                showToast('تعذر تصدير PDF', 'error');
            });
        }

        // ====================== مين فاتح دلوقتي (Live Now) ======================
        // مبني فوق نفس endpoint بتاع لوحة الصدارة (/api/leaderboard/live) اللي أصلًا بيرجع
        // مصفوفة "online" — إحنا هنا بس بنعرضها بشكل حي ولطيف مع إخفاء جزء من الاسم.
        let liveNowRefreshTimer = null;

        // بيسيب أول حرفين وآخر حرف من الاسم بس ويحط نجوم بينهم، عشان يبان "مين تقريبًا"
        // من غير ما يفضح هوية الزميل بالكامل قدام كل اللي فاتحين.
        function maskLiveName(name) {
            const clean = (name || '').trim();
            if (!clean) return 'طالب';
            if (clean.length <= 3) return clean[0] + '*'.repeat(Math.max(clean.length - 1, 1));
            const first = clean.slice(0, 2);
            const last = clean.slice(-1);
            const stars = '*'.repeat(Math.min(Math.max(clean.length - 3, 2), 6));
            return `${first}${stars}${last}`;
        }

        function openLiveNowPanel() {
            if (!schoolToken) {
                showToast('لازم تسجّل دخول School X الأول عشان تشوف مين فاتح دلوقتي', 'error');
                return;
            }
            openModal('liveNowModal');
            loadLiveNowUsers();
            clearInterval(liveNowRefreshTimer);
            liveNowRefreshTimer = setInterval(loadLiveNowUsers, 20000); // تحديث حي كل 20 ثانية
        }

        function closeLiveNowPanel() {
            closeModal('liveNowModal');
            clearInterval(liveNowRefreshTimer);
            liveNowRefreshTimer = null;
        }

        async function loadLiveNowUsers() {
            const listEl = document.getElementById('liveNowList');
            if (!schoolToken || !listEl) return;
            try {
                const res = await fetch(`${FIXED_SCHOOL_API_URL}/api/leaderboard/live`, {
                    headers: { 'Authorization': `Bearer ${schoolToken}` }
                });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                const online = data.online || [];

                const badge = document.getElementById('liveNowDotBadge');
                if (badge) badge.style.display = online.length ? 'block' : 'none';

                if (!online.length) {
                    listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-3);font-size:12px;">مفيش حد فاتح دلوقتي</div>';
                    return;
                }
                listEl.innerHTML = online.map(u => {
                    const displayName = u.fullName || u.username || 'طالب';
                    const masked = maskLiveName(displayName);
                    const initial = displayName.trim().charAt(0) || '؟';
                    return `
                        <div class="live-now-row">
                            <div class="live-now-avatar">${escapeHtml(initial)}<span class="live-now-dot"></span></div>
                            <div style="flex:1;min-width:0;">
                                <div class="live-now-name">${escapeHtml(masked)}</div>
                                <div class="live-now-meta">🟢 أونلاين الآن • ${u.questionsToday || 0} سؤال النهاردة</div>
                            </div>
                        </div>`;
                }).join('');
            } catch (e) {
                listEl.innerHTML = '<div style="text-align:center;padding:14px;color:var(--danger);font-size:12px;">تعذر تحميل القائمة</div>';
            }
        }

        // ====================== مكالمة صوتية حية مع المساعد (Live Voice Call) ======================
        // الفرق عن زرار المايك العادي: هنا مش "سجّل جملة واحدة وابعتها" — دي محادثة صوتية
        // مستمرة زي مكالمة تليفون: بتتكلم، سكوتك بعد ما تخلص كلامك بيبعت السؤال تلقائيًا،
        // والرد بييجي صوت جملة جملة أول ما تتجهز عشان تحس فعلًا إنها مكالمة حية.
        //
        // نظام التعرف على الصوت اتغيّر بالكامل: بدل الاعتماد على SpeechRecognition
        // المدمجة في المتصفح (اللي كانت بتفتح وتقفل "جلسة" جديدة كل شوية وده اللي كان
        // بيسبب المشاكل زي صوت "تيت تيت" المتكرر والتعليق)، دلوقتي بنفتح المايك مرة واحدة
        // بس لطول المكالمة، وبنراقب شدة الصوت لحظة بلحظة (Voice Activity Detection) عشان
        // نعرف بالظبط إمتى الطالب بيتكلم وإمتى بيسكت، وبنسجّل المقطع ده بس ونبعته لـ
        // Whisper (نظام تفريغ صوت أقوى بكتير ودقة أعلى من المدمج في المتصفح، خصوصًا مع
        // اللهجة المصرية) عن طريق Groq. مفيش جلسات بتتفتح وتتقفل كل شوية، فمفيش سبب
        // للصوت المتكرر أصلًا.
        let callActive = false;
        let callMuted = false;
        let callState = 'idle'; // idle | listening | thinking | speaking
        let callHistory = [];
        let callActiveSystemPrompt = ''; // CALL_SYSTEM_PROMPT + سياق آخر كام رسالة من الشات المكتوب، بيتبني تاني كل مكالمة
        let callAbortController = null;
        let callAudioQueue = [];
        let callQueueRunning = false;
        let callCurrentAudio = null;
        let callLastActivityAt = Date.now();
        let callWatchdogTimer = null;

        let callMicStream = null;
        let callAudioAnalyserCtx = null;
        let callAnalyser = null;
        let callVadRafId = null;
        let callMediaRecorder = null;
        let callRecordedChunks = [];
        let callIsRecordingSpeech = false;
        let callSpeechStartAt = 0;
        let callLastVoiceAt = 0;
        let callRecordingPeakRms = 0; // أعلى مستوى صوت اتسجّل في المقطع الحالي — بنستخدمه
                                      // كحماية إضافية ضد إرسال مقطع شبه فاضي/ضوضاء لـ Whisper
                                      // (اللي بيميل "يهلوس" كلام وهمي من الصمت أو الضوضاء الخفيفة).

        const CALL_VAD_THRESHOLD = 0.025;   // حساسية كشف الكلام (أعلى = محتاج صوت أوضح عشان يبدأ يسجّل)
        const CALL_VAD_SILENCE_MS = 900;    // سكوت بعد الكلام قبل ما نعتبر إن الطالب خلص كلامه — زودناها
                                             // من 700 لـ 900 عشان مايتقطعش كلامه وهو لسه بيفكر وسط الجملة
        const CALL_VAD_SILENCE_MS_LONG = 1400; // لو الطالب فضل يتكلم متواصل فترة طويلة (سؤال مركب أو
                                                // شرح)، بندي مساحة أكبر للسكتة قبل ما نقفل عليه — الكلام
                                                // الطويل بيكون فيه وقفات تفكير طبيعية أكتر من جملة قصيرة.
        const CALL_LONG_UTTERANCE_MS = 3000;   // بعد 3 ثواني كلام متواصل، نعتبره "كلام طويل" ونستخدم
                                                // مهلة السكوت الأطول بدل العادية.
        const CALL_MIN_SPEECH_MS = 380;     // أقل مدة كلام عشان منبعتش نفخة أو ضوضاء بسيطة لـ Whisper
        const CALL_MIN_PEAK_RMS_MULTIPLIER = 1.4; // لازم يوصل الصوت لمستوى أعلى من عتبة الكشف بهامش
                                                    // معقول (مش بس يلمسها لحظة) عشان نعتبره كلام حقيقي
                                                    // يستاهل نبعته لـ Whisper.

        // لو الكلام رجع فاضي أو حرف واحد كذا مرة ورا بعض (صوت مش واضح، ضوضاء خلفية
        // عالية، مايك بعيد)، بنطلع تلميح للطالب بدل ما نفضل ساكتين من غير سبب واضح.
        let callConsecutiveUnclear = 0;

        // كاشف الصوت بيتكيّف مع ضوضاء الخلفية بدل ما يعتمد على رقم ثابت بس — لو الطالب
        // في مكان فيه ضوضاء خلفية دايمة (مروحة، شارع..)، عتبة ثابتة صغيرة كانت بتخلي
        // المكالمة "تفتح وتقفل مع نفسها" (بتحس إن الضوضاء دي كلام). دلوقتي بنراقب متوسط
        // شدة الصوت وقت السكوت الفعلي، والعتبة الحقيقية بتبقى أعلى من الضوضاء دي بمسافة
        // واضحة، مش رقم ثابت للجميع.
        let callNoiseFloor = 0.01;
        const CALL_NOISE_FLOOR_SMOOTHING = 0.05;
        const CALL_NOISE_FLOOR_MULTIPLIER = 2.4;

        function startCallWatchdog() {
            stopCallWatchdog();
            callWatchdogTimer = setInterval(() => {
                if (!callActive || callMuted) return;
                const stuckMs = Date.now() - callLastActivityAt;
                // لو المكالمة فضلت في حالة "بيفكر/بيتكلم" أكتر من 25 ثانية من غير أي تقدم
                // فعلي (شبكة معلّقة تمامًا، رد اتقطع بصمت..)، نلغي أي طلب شغال ونرجّعها
                // تسمع تاني بالقوة بدل ما تفضل واقفة للأبد.
                if (stuckMs > 25000 && (callState === 'thinking' || callState === 'speaking')) {
                    if (callAbortController) callAbortController.abort();
                    callAudioQueue = [];
                    callQueueRunning = false;
                    callState = 'idle';
                    updateCallUI();
                }
            }, 6000);
        }

        function stopCallWatchdog() {
            if (callWatchdogTimer) { clearInterval(callWatchdogTimer); callWatchdogTimer = null; }
        }

        const CALL_SYSTEM_PROMPT = `إنت "Chat X"، مساعد أكاديمي ذكي وفاهم بتتكلم دلوقتي مع طالب تمريض في مكالمة تليفون صوتية حية مش شات مكتوب.
قواعد صارمة لازم تلتزم بيها:
- رد بلهجة مصرية عامية طبيعية جدًا، زي ما بتتكلم مع زميلك في التليفون.
- افهم قصد الطالب من أول مرة وردّ على السؤال بالظبط من غير لف ودوران، وجملة لحد 3 جمل بالكتير في كل رد — إنت في مكالمة، مش بتكتب مقال.
- الكلام اللي بيوصلك جاي من تفريغ صوتي (Speech-to-Text) وممكن يبقى فيه كلمة ناقصة، غلط إملائي، أو جملة متقطعة وسط الكلام. لو حسّيت إن الكلام مش مفهوم، ناقص، أو معناه مش واضح، **متخمّنش ومتجاوبش على حاجة تانية غير اللي هو قاصده** — اسأله سؤال قصير جدًا يوضح بيه قصده أو يعيد كلامه، زي "معلش متسمعتكش كويس، تقدر تعيد السؤال؟" أو "تقصد كذا ولا كذا؟" لو كان فيه احتمالين واضحين.
- ممنوع تمامًا أي رموز ماركداون أو نجوم أو عناوين أو قوائم مرقمة أو أقواس — الكلام هيتحول صوت حرفيًا زي ما هو.
- لو السؤال محتاج شرح طويل فعلاً، اديله الفكرة الأهم بس دلوقتي واسأله لو عايز يكمل في التفاصيل.
- ابدأ بالإجابة على طول من غير مقدمات زي "بالطبع" أو "تمام".`;

        function updateCallUI() {
            callLastActivityAt = Date.now();
            const orb = document.getElementById('callOrb');
            const statusText = document.getElementById('callStatusText');
            if (!orb || !statusText) return;
            orb.classList.remove('listening', 'speaking', 'thinking');
            if (callState === 'thinking') { orb.classList.add('thinking'); statusText.textContent = 'بفكر...'; }
            else if (callState === 'speaking') { orb.classList.add('speaking'); statusText.textContent = 'بيتكلم — دوس على الدائرة لو عايز تقاطعه'; }
            else { orb.classList.add('listening'); statusText.textContent = 'بسمعك...'; } // idle/listening = المايك بيراقب منتظر كلامك
        }

        // ====================== سجل محادثة المكالمة (شكل فقاعات زي أي تطبيق مكالمات
        // احترافي، بدل سطر نص واحد بيتمسح ويتكتب فوقه كل شوية) ======================
        function clearCallTranscriptLog() {
            const log = document.getElementById('callTranscriptLog');
            if (log) log.innerHTML = '';
        }
        function addCallBubble(role, text) {
            const log = document.getElementById('callTranscriptLog');
            if (!log) return null;
            const bubble = document.createElement('div');
            bubble.className = `call-bubble ${role}`;
            bubble.textContent = text;
            log.appendChild(bubble);
            log.scrollTop = log.scrollHeight;
            return bubble;
        }

        // ثيم شاشة المكالمة (غامق افتراضيًا / أبيض أنيق اختياري) — متخزن في localStorage
        // ومستقل تمامًا عن ثيم باقي التطبيق.
        function getSelectedCallTheme() {
            return localStorage.getItem('chatx_call_theme') || 'dark';
        }
        function applyCallTheme(theme) {
            const overlay = document.getElementById('voiceCallOverlay');
            const icon = document.getElementById('callThemeIcon');
            if (!overlay) return;
            overlay.classList.toggle('call-light', theme === 'light');
            if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        function toggleCallTheme() {
            const next = getSelectedCallTheme() === 'light' ? 'dark' : 'light';
            localStorage.setItem('chatx_call_theme', next);
            applyCallTheme(next);
        }

        // بيلمّ آخر كام رسالة من الشات المكتوب الحالي (لو موجود) عشان المكالمة تبدأ
        // وهي عارفة عن إيه كانت الدردشة قبلها بالظبط — بدل ما تحس إنها "أول مرة"
        // كل ما تفتح مكالمة، حتى لو إنت لسه بتكمل نفس الموضوع اللي كنت بتكتب فيه.
        function buildCallContextPrimer() {
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat || !Array.isArray(chat.messages) || !chat.messages.length) return '';
            const recent = chat.messages.slice(-6); // آخر 3 تبادلات كافية كسياق من غير ما تطوّل الـ prompt أوي
            const lines = recent
                .filter(m => m.role === 'user' || m.role === 'bot')
                .map(m => `${m.role === 'user' ? 'الطالب' : 'المساعد'}: ${(m.content || '').replace(/\s+/g, ' ').trim().slice(0, 220)}`)
                .filter(Boolean);
            if (!lines.length) return '';
            return `\n\nسياق من الشات المكتوب اللي كان بين الطالب والمساعد قبل ما المكالمة دي تبدأ — استخدمه عشان تكمل الموضوع من غير ما تسأله يعيد اللي قاله قبل كده:\n${lines.join('\n')}`;
        }

        async function openVoiceCallScreen() {
            if (!window.isSecureContext) { showToast('المكالمة الصوتية محتاجة HTTPS', 'error'); return; }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
                showToast('متصفحك مش بيدعم التسجيل الصوتي، جرب Chrome أو Edge', 'error');
                return;
            }

            applyCallTheme(getSelectedCallTheme());
            document.getElementById('voiceCallOverlay').classList.add('active');
            callHistory = [];
            callActiveSystemPrompt = CALL_SYSTEM_PROMPT + buildCallContextPrimer();
            callActive = true;
            callMuted = false;
            callConsecutiveUnclear = 0;
            document.getElementById('callMuteIcon').className = 'fas fa-microphone';
            document.getElementById('callMuteBtn').classList.remove('on');
            clearCallTranscriptLog();
            callState = 'idle';
            updateCallUI();
            const statusEl = document.getElementById('callStatusText');
            if (statusEl) statusEl.textContent = 'اتكلم براحتك، وهسمعك وأرد عليك زي المكالمة العادية 🎧';

            const micOk = await initCallMic();
            if (!micOk) return; // initCallMic بيقفل المكالمة ويبلّغ المستخدم لو رفض إذن المايك

            startCallWatchdog();
            runCallVadLoop();
        }

        // بيفتح المايك مرة واحدة بس لطول المكالمة، وبيجهّز محلّل صوت (Analyser) عشان
        // نقدر نقيس شدة الصوت لحظة بلحظة من غير أي "جلسات" بتتفتح وتتقفل.
        async function initCallMic() {
            try {
                callMicStream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
            } catch (e) {
                showToast('لازم تسمح باستخدام المايك عشان المكالمة تشتغل', 'error');
                endVoiceCall();
                return false;
            }
            callAudioAnalyserCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = callAudioAnalyserCtx.createMediaStreamSource(callMicStream);
            callAnalyser = callAudioAnalyserCtx.createAnalyser();
            callAnalyser.fftSize = 512;
            source.connect(callAnalyser);
            return true;
        }

        function stopCallMic() {
            if (callVadRafId) { cancelAnimationFrame(callVadRafId); callVadRafId = null; }
            if (callMediaRecorder && callMediaRecorder.state !== 'inactive') { try { callMediaRecorder.stop(); } catch (e) {} }
            callMediaRecorder = null;
            callIsRecordingSpeech = false;
            if (callMicStream) { callMicStream.getTracks().forEach(t => t.stop()); callMicStream = null; }
            if (callAudioAnalyserCtx) { try { callAudioAnalyserCtx.close(); } catch (e) {} callAudioAnalyserCtx = null; }
            callAnalyser = null;
        }

        // كاشف نشاط صوتي (VAD) شغّال طول المكالمة عن طريق requestAnimationFrame: بيبدأ
        // يسجّل أول ما يحس بكلام فعلي، ويوقف ويبعت أول ما يحس بسكوت قصير بعده. أسرع
        // وأثبت بكتير من نظام "جلسة تعرف على صوت" بيتقفل ويتفتح كل شوية.
        //
        // ملحوظة مهمة: وقت "بيفكر/بيتكلم" مبنسجلش من المايك خالص (غير لو المستخدم
        // دوس يدويًا على الدائرة عشان يقاطع). كان فيه محاولة سابقة لمقاطعة تلقائية
        // بالصوت وقت رد المساعد، لكن اتلغت لأنها كانت بتلتقط صدى صوت المساعد نفسه
        // من السماعة (echo cancellation في المتصفح مش كافي على معظم الموبايلات)،
        // وده كان بيسبب: (1) قطع رد المساعد الحقيقي فجأة، و(2) تسجيل مقطع فاضي/صدى
        // بيتبعت لـ Whisper وبيرجع كلام مش حقيقي (Hallucination)، وده بالظبط سبب
        // إحساس "بيرد بحاجة تانية خالص" و"مش فاهم سياق المحادثة" (لأن الكلام الوهمي
        // ده كان بيتسجل في التاريخ وكأنه كلام حقيقي من الطالب). المقاطعة اليدوية
        // (دوسة على الدائرة) أكيدة 100% إن الطالب فعلاً قاصد يقاطع، فهي الطريقة
        // المعتمدة دلوقتي.
        function runCallVadLoop() {
            if (!callActive) return;
            callVadRafId = requestAnimationFrame(runCallVadLoop);
            if (!callAnalyser || callMuted || callState === 'thinking' || callState === 'speaking') {
                if (callIsRecordingSpeech) stopCallRecordingAndSend(true); // المايك اتقفل فجأة (كتم/بدأ رد) — اتجاهل أي تسجيل ناقص
                return;
            }

            const data = new Uint8Array(callAnalyser.fftSize);
            callAnalyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
            const rms = Math.sqrt(sum / data.length);
            const now = performance.now();
            const effectiveThreshold = Math.max(CALL_VAD_THRESHOLD, callNoiseFloor * CALL_NOISE_FLOOR_MULTIPLIER);

            if (rms > effectiveThreshold) {
                callLastVoiceAt = now;
                if (rms > callRecordingPeakRms) callRecordingPeakRms = rms;
                if (!callIsRecordingSpeech) startCallRecording();
            } else {
                // مبنحدّثش متوسط الضوضاء وإحنا بنسجّل كلام فعلي — بس وقت السكوت الحقيقي،
                // عشان صوت الطالب نفسه ميرفعش تقدير "الضوضاء" غلط.
                if (!callIsRecordingSpeech) {
                    callNoiseFloor += (rms - callNoiseFloor) * CALL_NOISE_FLOOR_SMOOTHING;
                } else {
                    // كلام طويل متواصل بياخد مهلة سكوت أطول قبل ما نقفل عليه — وقفات
                    // التفكير وسط شرح طويل بتبقى أطول من وقفة وسط جملة قصيرة.
                    const speechSoFarMs = now - callSpeechStartAt;
                    const silenceNeeded = speechSoFarMs > CALL_LONG_UTTERANCE_MS ? CALL_VAD_SILENCE_MS_LONG : CALL_VAD_SILENCE_MS;
                    if (now - callLastVoiceAt > silenceNeeded) {
                        stopCallRecordingAndSend(false);
                    }
                }
            }
        }

        function startCallRecording() {
            if (!callMicStream) return;
            callIsRecordingSpeech = true;
            callSpeechStartAt = performance.now();
            callLastVoiceAt = callSpeechStartAt;
            callRecordedChunks = [];
            callRecordingPeakRms = 0;
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
            try { callMediaRecorder = new MediaRecorder(callMicStream, { mimeType }); }
            catch (e) { callMediaRecorder = new MediaRecorder(callMicStream); }
            callMediaRecorder.ondataavailable = (e) => { if (e.data.size) callRecordedChunks.push(e.data); };
            try { callMediaRecorder.start(); } catch (e) { callIsRecordingSpeech = false; return; }
            callState = 'listening';
            updateCallUI();
        }

        // بيوقف التسجيل الحالي؛ لو discard=true (المايك اتقفل بكتم أو بمقاطعة) بيرمي
        // المقطع من غير ما يبعته. غير كده بيبعته لـ Whisper يتفرّغ نص، وبعدين يبعت
        // السؤال فعليًا لأقوى الموديلات.
        async function stopCallRecordingAndSend(discard) {
            if (!callIsRecordingSpeech || !callMediaRecorder) { callIsRecordingSpeech = false; return; }
            const duration = performance.now() - callSpeechStartAt;
            const peakRms = callRecordingPeakRms; // نلقطها هنا فورًا قبل ما تسجيل جديد يصفّرها
            callIsRecordingSpeech = false;
            const recorder = callMediaRecorder;
            callMediaRecorder = null;

            await new Promise((resolve) => {
                if (recorder.state === 'inactive') return resolve();
                recorder.onstop = resolve;
                try { recorder.stop(); } catch (e) { resolve(); }
            });

            if (discard || duration < CALL_MIN_SPEECH_MS) { callRecordedChunks = []; return; }

            // لو أعلى مستوى صوت في المقطع كله بالكاد لمس عتبة الكشف (مش هامش واضح
            // فوقها)، الأغلب إنه مقطع ضوضاء/صدى مش كلام حقيقي — بنرميه من غير ما
            // نضيّع طلب Whisper عليه أو نخاطر بكلام وهمي (Hallucination) يتسجل
            // كأنه كلام الطالب ويبوّظ سياق المحادثة.
            const effectiveThreshold = Math.max(CALL_VAD_THRESHOLD, callNoiseFloor * CALL_NOISE_FLOOR_MULTIPLIER);
            if (peakRms < effectiveThreshold * CALL_MIN_PEAK_RMS_MULTIPLIER) { callRecordedChunks = []; return; }

            const blob = new Blob(callRecordedChunks, { type: recorder.mimeType || 'audio/webm' });
            callRecordedChunks = [];
            if (!blob.size) return;

            callState = 'thinking';
            updateCallUI();
            const statusEl = document.getElementById('callStatusText');
            if (statusEl) statusEl.textContent = 'بنفهم كلامك...';

            // نظام التعرف الأساسي: Whisper بتاع Groq (أسرع وأدق نظام للتفريغ الفوري).
            // لو فشل لأي سبب (السيرفر واقع، الشبكة اتقطعت..)، بنجرب فورًا نظام تاني
            // (فهم الصوت المباشر بتاع Gemini) كشبكة أمان بدل ما المكالمة تفضل من غير
            // رد خالص — أقوى من الاعتماد على مزوّد واحد بس.
            // بنبعت language=ar صراحة عشان نجنّب أي كشف لغة تلقائي غلط لو السيرفر
            // بيقرا الحقل ده (خصوصًا مع مصطلحات إنجليزية طبية جوه كلام عربي).
            async function tryTranscribe(endpoint) {
                const form = new FormData();
                form.append('audio', blob, 'speech.webm');
                form.append('language', 'ar');
                const res = await fetch(`${settings.backendUrl}${endpoint}`, { method: 'POST', body: form });
                if (!res.ok) throw new Error('transcribe-failed');
                const data = await res.json();
                return (data.text || '').trim();
            }

            try {
                let text = '';
                try {
                    text = await tryTranscribe('/api/groq-whisper');
                } catch (primaryErr) {
                    text = await tryTranscribe('/api/gemini-transcribe'); // شبكة أمان لو Whisper وقع
                }
                // كلام فاضي أو حرف/حرفين بس (ضوضاء، نفخة، صوت مش واضح) — منبعتوش
                // للموديل كأنه سؤال حقيقي؛ لو تكرر كذا مرة ورا بعض نطلع تلميح للطالب.
                if (!text || text.length < 2) {
                    callConsecutiveUnclear++;
                    callState = 'idle';
                    updateCallUI();
                    if (callConsecutiveUnclear >= 2 && statusEl) {
                        statusEl.textContent = 'مسمعتكش كويس، جرب تتكلم أوضح شوية أو قرّب من المايك';
                        callConsecutiveUnclear = 0;
                    }
                    return;
                }
                callConsecutiveUnclear = 0;
                handleCallUserTurn(text);
            } catch (e) {
                callState = 'idle';
                updateCallUI();
            }
        }

        // ترتيب الموديلات اللي بترد في المكالمة الحية: Groq الأول لأنه الأسرع (مهم جدًا
        // في مكالمة حية)، ولو وقع أو اتأخر بننتقل تلقائيًا لأقوى الموديلات التانية
        // (Gemini، DeepSeek، Qwen، OpenRouter) بدل ما المكالمة تقف أو تتعلق.
        const CALL_PROVIDER_CHAIN = ['groq', 'gemini', 'deepseek', 'qwen', 'openrouter'];
        // لو الموديل ماردش ولا حرف خلال المدة دي، نعتبره واقع وننتقل للي بعده فورًا
        // (ماحدش بدأ يتكلم لسه، فمفيش خطورة تكرار كلام). قللناها عشان الاستجابة تبقى
        // سريعة زي المكالمات الاحترافية بدل ما الطالب يستنى قبل ما نكتشف إن الموديل بطيء.
        const CALL_FIRST_CHUNK_TIMEOUT_MS = 4500;
        // لو الرد ابتدا وبعدين سكت فجأة لمدة طويلة (شبكة اتقطعت نص الرد)، بنقفل الرد
        // بأدب باللي اتقال لحد دلوقتي بدل ما نستنى للأبد ونعلّق المكالمة كلها.
        const CALL_STALL_TIMEOUT_MS = 9000;
        // gpt-oss-120b هو أقوى موديل إنتاجي متاح على Groq دلوقتي (فهم واستدلال أعلى بكتير
        // من الـ 20b القديم)، وبرضو سريع جدًا بفضل هاردوير Groq المتخصص — يعني فهم أدق
        // للطالب من غير ما نضحي بسرعة الرد اللي المكالمة الحية محتاجاها.
        const CALL_OPENAI_STYLE_MODELS = { groq: 'openai/gpt-oss-120b', deepseek: 'deepseek-chat', qwen: 'qwen-plus', openrouter: 'openrouter/free' };

        // بيجهّز رابط الطلب وجسمه وطريقة قراءة القطعة النصية من كل سطر SSE، حسب شكل
        // كل مزوّد (Gemini شكله مختلف عن باقي المزودين اللي بيتبعوا شكل OpenAI).
        function callBuildRequest(provider, systemPrompt, history) {
            if (provider === 'gemini') {
                return {
                    url: `${settings.backendUrl}/api/gemini`,
                    body: {
                        contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
                        systemInstruction: { parts: [{ text: systemPrompt }] }
                    },
                    parseLine: (line) => {
                        if (!line.startsWith('data: ')) return '';
                        try { return JSON.parse(line.slice(6)).candidates?.[0]?.content?.parts?.[0]?.text || ''; } catch (e) { return ''; }
                    }
                };
            }
            return {
                url: `${settings.backendUrl}/api/${provider}`,
                body: {
                    model: CALL_OPENAI_STYLE_MODELS[provider],
                    messages: [{ role: 'system', content: systemPrompt }, ...history],
                    stream: true,
                    temperature: 0.7
                },
                parseLine: (line) => {
                    if (!line.startsWith('data: ')) return '';
                    const payload = line.slice(6).trim();
                    if (payload === '[DONE]') return '';
                    try { return JSON.parse(payload).choices?.[0]?.delta?.content || ''; } catch (e) { return ''; }
                }
            };
        }

        // بيقرا استريم رد موديل واحد قطعة قطعة وبيحدّث الفقاعة + طابور الصوت أول
        // بأول (نفس منطق القراءة اللي كان متكرر قبل كده، دلوقتي في مكان واحد
        // يُستخدم سواء مع الموديل الفايز في السباق أو أي موديل احتياطي بعده).
        // state = { fullText, spokenSoFar, anySpoken, assistantBubbleEl, gotFirstChunk }
        async function consumeProviderStream(reader, decoder, initialBuffer, parseLine, mySignal, state) {
            let buffer = initialBuffer || '';
            while (true) {
                const stallMs = state.gotFirstChunk ? CALL_STALL_TIMEOUT_MS : CALL_FIRST_CHUNK_TIMEOUT_MS;
                let readResult;
                try {
                    readResult = await Promise.race([
                        reader.read(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('call-stall')), stallMs))
                    ]);
                } catch (stallErr) {
                    try { reader.cancel(); } catch (e) {}
                    if (mySignal.aborted) throw stallErr; // إنهاء/قطع مقصود من المستخدم
                    return; // تعليق فعلي — رجّع اللي وصلنا له لحد دلوقتي (الأصل هيقرر لو يجرب موديل تاني)
                }
                const { done, value } = readResult;
                if (done) return;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    const piece = parseLine(line);
                    if (piece) {
                        if (!state.gotFirstChunk) {
                            state.gotFirstChunk = true;
                            callState = 'speaking';
                            updateCallUI();
                            state.assistantBubbleEl = addCallBubble('assistant', '');
                        }
                        state.fullText += piece;
                        if (state.assistantBubbleEl) {
                            state.assistantBubbleEl.textContent = state.fullText;
                            const log = document.getElementById('callTranscriptLog');
                            if (log) log.scrollTop = log.scrollHeight;
                        }
                    }
                }
                const rest = state.fullText.slice(state.spokenSoFar.length);
                const match = rest.match(/^[\s\S]*?[.!؟?]+(\s|$)/);
                if (match) {
                    state.spokenSoFar += match[0];
                    const sentence = match[0].trim();
                    if (sentence) { state.anySpoken = true; queueCallSpeech(sentence); }
                }
            }
        }

        // بيسابق كذا مزوّد مع بعض في نفس اللحظة (مش واحد وراء التاني) لأول "قطعة كلام
        // حقيقية" — أول مزوّد يرد بيها بيكسب، وبنلغي الباقيين فورًا. ده بيقلل زمن
        // الانتظار الفعلي جدًا (بدل ما نستنى مزوّد يفشل/يبطئ الأول قبل ما نجرب التاني،
        // بنجربهم مع بعض من الأول) — من غير ما نضحي بالموثوقية لو واحد فيهم واقع.
        // بيرجّع null لو كل المزودين المتسابقين فشلوا، عشان الكود اللي بينادي عليه
        // يقدر يكمل على باقي السلسلة بالطريقة العادية (شبكة أمان).
        function raceCallProviders(providers, systemPrompt, history, mySignal) {
            return new Promise((resolve) => {
                let settled = false, remaining = providers.length;
                const controllers = [];

                function finishWith(result) {
                    if (settled) return;
                    settled = true;
                    resolve(result);
                }

                providers.forEach((provider) => {
                    const controller = new AbortController();
                    controllers.push(controller);
                    const onOuterAbort = () => controller.abort();
                    mySignal.addEventListener('abort', onOuterAbort);
                    let iWon = false;

                    (async () => {
                        try {
                            const { url, body, parseLine } = callBuildRequest(provider, systemPrompt, history);
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                                signal: controller.signal
                            });
                            if (!response.ok || !response.body) throw new Error('bad-response');
                            const reader = response.body.getReader();
                            const decoder = new TextDecoder();
                            let buffer = '';
                            while (true) {
                                const readResult = await Promise.race([
                                    reader.read(),
                                    new Promise((_, rej) => setTimeout(() => rej(new Error('race-timeout')), CALL_FIRST_CHUNK_TIMEOUT_MS))
                                ]);
                                const { done, value } = readResult;
                                if (done) throw new Error('ended-with-no-content');
                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop();
                                let firstPiece = '';
                                for (const line of lines) {
                                    const piece = parseLine(line);
                                    if (piece) firstPiece += piece;
                                }
                                if (firstPiece) {
                                    iWon = true;
                                    controllers.forEach(c => { if (c !== controller) c.abort(); }); // الباقيين خسروا
                                    finishWith({ provider, reader, decoder, buffer, parseLine, firstPiece });
                                    return;
                                }
                                if (controller.signal.aborted) return; // خسر أو المستخدم قاطع فعلاً
                            }
                        } catch (e) {
                            // المزوّد ده فشل أو اتلغى — ممكن مزوّد تاني يكسب، مفيش داعي نعمل حاجة
                        } finally {
                            // مهم: مبنشيلش المستمع (listener) بتاع الفايز — لسه محتاجينه شغّال
                            // طول ما consumeProviderStream مستمر بيقرا من الـ stream بتاعه بعد
                            // كده، عشان لو المستخدم قفل المكالمة أو قاطع، الإلغاء يوصله صح. غير
                            // كده (خسران/فشل)، منضمن تسريب استماع (listener) على إشارة هتتلغي
                            // أو تتبدّل على أي حال في الدور اللي بعده.
                            if (!iWon) mySignal.removeEventListener('abort', onOuterAbort);
                            remaining--;
                            if (remaining === 0) finishWith(null); // كل المتسابقين فشلوا/اتلغوا من غير فايز
                        }
                    })();
                });
            });
        }

        async function handleCallUserTurn(text) {
            if (!callActive) return;
            callState = 'thinking';
            updateCallUI();
            addCallBubble('user', text);
            callHistory.push({ role: 'user', content: text });
            if (callHistory.length > 12) callHistory = callHistory.slice(-12); // آخر ستة تبادلات كافية لسياق المكالمة

            if (callAbortController) callAbortController.abort();
            callAbortController = new AbortController();
            const mySignal = callAbortController.signal;

            const state = { fullText: '', spokenSoFar: '', anySpoken: false, assistantBubbleEl: null, gotFirstChunk: false };

            try {
                const systemPrompt = callActiveSystemPrompt || CALL_SYSTEM_PROMPT;
                // أسرع اتنين مزوّدين (Groq وGemini) بيتسابقوا مع بعض؛ الباقي شبكة أمان
                // تتابعية لو السباق فشل تمامًا.
                const raceProviders = CALL_PROVIDER_CHAIN.slice(0, 2);
                const restProviders = CALL_PROVIDER_CHAIN.slice(2);

                let won = null;
                if (!mySignal.aborted) {
                    won = await raceCallProviders(raceProviders, systemPrompt, callHistory, mySignal);
                }

                if (won) {
                    if (won.firstPiece) {
                        state.gotFirstChunk = true;
                        callState = 'speaking';
                        updateCallUI();
                        state.assistantBubbleEl = addCallBubble('assistant', '');
                        state.fullText += won.firstPiece;
                        state.assistantBubbleEl.textContent = state.fullText;
                        // نفس فحص "نهاية جملة" اللي بيحصل جوه consumeProviderStream — عشان
                        // لو القطعة الأولى اللي كسبت بيها السباق كانت فيها جملة كاملة
                        // (نادر بس ممكن)، متتأخرش لحد آخر الرد عشان تتقال بالصوت.
                        const rest = state.fullText.slice(state.spokenSoFar.length);
                        const match = rest.match(/^[\s\S]*?[.!؟?]+(\s|$)/);
                        if (match) {
                            state.spokenSoFar += match[0];
                            const sentence = match[0].trim();
                            if (sentence) { state.anySpoken = true; queueCallSpeech(sentence); }
                        }
                    }
                    await consumeProviderStream(won.reader, won.decoder, won.buffer, won.parseLine, mySignal, state);
                }

                // لو السباق ماجابش أي رد خالص، نكمل بالطريقة التتابعية القديمة على باقي
                // السلسلة (شبكة أمان أخيرة) — من غير ما نكرر المزودين اللي اتسابقوا فعلاً.
                if (!state.gotFirstChunk && !mySignal.aborted) {
                    for (const provider of restProviders) {
                        if (mySignal.aborted) break;
                        const { url, body, parseLine } = callBuildRequest(provider, systemPrompt, callHistory);
                        let response;
                        try {
                            response = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                                signal: mySignal
                            });
                        } catch (e) {
                            if (mySignal.aborted) throw e;
                            continue;
                        }
                        if (!response.ok || !response.body) continue;
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        await consumeProviderStream(reader, decoder, '', parseLine, mySignal, state);
                        if (state.gotFirstChunk) break;
                    }
                }

                if (!mySignal.aborted) {
                    const remaining = state.fullText.slice(state.spokenSoFar.length).trim();
                    if (remaining) { state.anySpoken = true; queueCallSpeech(remaining); }
                    if (!state.anySpoken) {
                        const fallbackMsg = 'معلش، الاتصال بالموديلات بطيء دلوقتي، ممكن تعيد سؤالك تاني؟';
                        addCallBubble('assistant', fallbackMsg);
                        queueCallSpeech(fallbackMsg);
                    }
                    if (state.fullText.trim()) callHistory.push({ role: 'assistant', content: state.fullText });
                }
            } catch (err) {
                if (!mySignal.aborted) {
                    const errMsg = 'حصل عطل بسيط في الاتصال، جرب تاني.';
                    addCallBubble('assistant', errMsg);
                    queueCallSpeech(errMsg);
                }
            } finally {
                // شبكة أمان أخيرة: مهما حصل فوق، لازم المكالمة ترجع تسمع تاني ولا تفضل
                // عالقة في "بفكر" من غير حد يرد عليها. مفيش داعي لأي "إعادة تشغيل" يدوية
                // هنا — كاشف الصوت (VAD) شغّال طول الوقت وبيرجع يراقب المايك تلقائيًا أول
                // ما الحالة تبقى غير "بيفكر/بيتكلم".
                if (callActive && !callMuted && !callQueueRunning && callAudioQueue.length === 0) {
                    callState = 'idle';
                    updateCallUI();
                }
            }
        }

        // طابور تشغيل صوتي: كل جملة بتتحول صوت وتتشغّل بالترتيب عشان متتعملش فوق بعض.
        // أول ما الطابور يخلص كله، المايك بيرجع يراقب تلقائيًا (كاشف الصوت شغّال طول الوقت).
        //
        // ⚡ Pipelining: بنبدأ نجهّز صوت الجملة الجاية وإحنا لسه بنشغّل الجملة الحالية
        // (بدل ما ننتظر تشغيل الحالية يخلص وبعدين نبدأ نطلب صوت التانية). ده بيشيل
        // "السكوت الميت" اللي كان بيحصل بين كل جملة والتانية وقت انتظار تحويل النص
        // لصوت — أكبر سبب لإحساس إن الرد "بيمل" أو بيقف كل شوية في الرد الطويل.
        let callQueueGeneration = 0;

        function queueCallSpeech(text) {
            callAudioQueue.push(text);
            if (!callQueueRunning) runCallSpeechQueue();
        }

        async function runCallSpeechQueue() {
            callQueueRunning = true;
            callState = 'speaking';
            updateCallUI();
            const myGeneration = callQueueGeneration;

            let nextPromise = callAudioQueue.length ? fetchTtsAudioBlob(callAudioQueue.shift()) : null;

            while (nextPromise) {
                let blob = null;
                try { blob = await nextPromise; } catch (e) { /* فشلت هذه الجملة بس — نتجاهلها ونكمل اللي بعدها */ }

                // اطلب صوت الجملة الجاية دلوقتي فورًا (لو موجودة) — من غير ما تستنى تشغيل
                // الجملة الحالية، عشان تكون جاهزة أول ما الحالية تخلص بالظبط.
                nextPromise = callAudioQueue.length ? fetchTtsAudioBlob(callAudioQueue.shift()) : null;

                // لو حصلت مقاطعة (barge-in) أو المكالمة اتقفلت وإحنا مستنيين، منشغّلش
                // صوت بقى قديم/مش مطلوب.
                if (myGeneration !== callQueueGeneration || !callActive) break;
                if (blob) { try { await playCallAudioBlob(blob); } catch (e) {} }
                if (myGeneration !== callQueueGeneration || !callActive) break;
            }

            if (myGeneration === callQueueGeneration) {
                callQueueRunning = false;
                if (callActive && !callMuted) {
                    callState = 'idle';
                    updateCallUI();
                }
            }
        }

        function playCallAudioBlob(blob) {
            return new Promise((resolve) => {
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                callCurrentAudio = audio;
                const cleanup = () => { URL.revokeObjectURL(url); if (callCurrentAudio === audio) callCurrentAudio = null; resolve(); };
                audio.onended = cleanup;
                audio.onerror = cleanup;
                audio.play().catch(cleanup);
            });
        }

        // "قاطعني" — بيوقف أي صوت شغال دلوقتي وأي رد لسه بيتولّد، وبيرجّع الحالة لـ"بيسمع"
        // فورًا عشان كاشف الصوت يمسك كلام الطالب من أول لحظة، زي أي مكالمة حقيقية.
        // بتتنادى يدويًا بس (دوسة على الدائرة) — مفيش مقاطعة تلقائية بالصوت وقت رد
        // المساعد عمدًا، لأن المايك بيلقط صدى صوت المساعد نفسه من السماعة على أغلب
        // الموبايلات (echo cancellation المتصفح مش كافي)، وده كان بيسبب قطع الرد
        // غلط وتسجيل كلام وهمي (Hallucination من Whisper) بيتحط في تاريخ المحادثة
        // وكأنه كلام حقيقي من الطالب — فبيبوّظ فهم السياق بالكامل.
        function callBargeIn() {
            if (!callActive) return;
            callQueueGeneration++; // يلغي أي صوت متجهّز مسبقًا (pipelined) من الرد اللي اتقاطع
            callAudioQueue = [];
            if (callCurrentAudio) { try { callCurrentAudio.pause(); } catch (e) {} callCurrentAudio = null; }
            if (callAbortController) callAbortController.abort();
            callQueueRunning = false;
            callState = 'idle';
            updateCallUI();
            const statusEl = document.getElementById('callStatusText');
            if (statusEl) statusEl.textContent = 'تمام، قول اللي عايزه...';
        }

        function toggleCallMute() {
            callMuted = !callMuted;
            document.getElementById('callMuteIcon').className = callMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
            document.getElementById('callMuteBtn').classList.toggle('on', callMuted);
            // مفيش أي جلسة "تعرف على صوت" بتتفتح أو تتقفل هنا خالص — المايك فاتح طول
            // المكالمة والكتم بس بيوقف كاشف الصوت من إنه يسجّل، فمفيش أي احتمال لصوت
            // "تيت تيت" المتكرر اللي كان بيحصل قبل كده.
            if (callMuted && callIsRecordingSpeech) {
                stopCallRecordingAndSend(true); // نلغي أي تسجيل ناقص كان شغال وقت الكتم من غير ما نبعته
            } else if (!callMuted && callState !== 'speaking' && callState !== 'thinking') {
                callState = 'idle';
                updateCallUI();
            }
        }

        // بعد ما المكالمة تخلص، بننقل كل الكلام اللي اتقال فيها لنفس الشات المكتوب
        // اللي المكالمة اتفتحت من جواه — عشان المكالمة متبقاش حاجة مؤقتة بتتنسى أول
        // ما تقفل، الطالب يقدر يرجع يقرا اللي اتقال أو يكمل يسأل بالكتابة عادي وكأنه
        // فعلاً استمرار لنفس المحادثة (لأنه فعلاً بقى كذلك في تاريخ الشات).
        function persistCallTranscriptToChat() {
            if (!callHistory.length) return;
            const chat = chats.find(c => c.id === currentChatId);
            if (!chat) return;

            const startMarker = { role: 'bot', content: '📞 مكالمة صوتية', source: 'call-marker', timestamp: Date.now(), id: `msg-${Date.now()}-callstart` };
            chat.messages.push(startMarker);
            callHistory.forEach((turn, i) => {
                const msg = {
                    role: turn.role === 'user' ? 'user' : 'bot',
                    content: turn.content,
                    timestamp: Date.now() + i + 1,
                    id: `msg-${Date.now()}-call-${i}`
                };
                if (msg.role === 'bot') msg.source = 'call';
                chat.messages.push(msg);
            });

            if (!chat.title || chat.title === 'محادثة جديدة') {
                const firstUserTurn = callHistory.find(t => t.role === 'user');
                if (firstUserTurn) chat.title = firstUserTurn.content.substring(0, 35) + (firstUserTurn.content.length > 35 ? '...' : '');
            }

            saveData();
            renderChatList();
            if (currentChatId === chat.id) renderChat(chat.id);
        }

        function endVoiceCall() {
            callActive = false;
            callMuted = false;
            callQueueGeneration++;
            callAudioQueue = [];
            callQueueRunning = false;
            stopCallWatchdog();
            stopCallMic();
            if (callCurrentAudio) { try { callCurrentAudio.pause(); } catch (e) {} callCurrentAudio = null; }
            if (callAbortController) callAbortController.abort();
            persistCallTranscriptToChat();
            document.getElementById('voiceCallOverlay').classList.remove('active');
        }

        // ====================== استوديو الفيديو التلقائي (ملخص → فيديو بصوت وشرائح متحركة) ======================
        let vsSelectedSlideCount = 4;
        let vsGeneratedVideoUrl = null;

        function vsSetSlideCount(n, btn) {
            vsSelectedSlideCount = n;
            document.querySelectorAll('#vsSlideCountOpt button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function vsResetStudio() {
            document.getElementById('vsInputSection').style.display = 'block';
            document.getElementById('vsProgressSection').style.display = 'none';
            document.getElementById('vsResultSection').style.display = 'none';
            if (vsGeneratedVideoUrl) { URL.revokeObjectURL(vsGeneratedVideoUrl); vsGeneratedVideoUrl = null; }
        }

        function vsSetProgress(pct, text) {
            document.getElementById('vsProgressBar').style.width = pct + '%';
            if (text) document.getElementById('vsProgressText').textContent = text;
        }

        // ترتيب الموديلات اللي بيتحاول بيها فهم النص وتقسيمه لشرائح: بنبدأ بأقوى موديل
        // فهم (Gemini)، ولو وقع أو اتأخر أو رجّع رد فاضي بننتقل تلقائيًا للي بعده من غير
        // ما نوقف الميزة؛ Groq آخر واحد لأنه الأسرع بس أضعف في فهم النصوص الطويلة.
        const VS_MODEL_CHAIN = ['gemini', 'deepseek', 'qwen', 'openrouter', 'groq'];
        const VS_MODEL_TIMEOUT_MS = 12000; // مهلة قصوى لكل موديل — لو علّق منستناهوش، ننتقل للي بعده فورًا
        const VS_PROVIDER_LABELS = { gemini: 'Gemini', deepseek: 'DeepSeek', qwen: 'Qwen', openrouter: 'OpenRouter', groq: 'Groq' };

        // ====================== مجموعات الأفاتارات (يختار منها الطالب قبل إنشاء الفيديو) ======================
        // كل مجموعة فيها مجموعة كبيرة من الأيقونات بفكرة موحّدة، عشان يبقى فيه اختيار
        // واسع فعلًا مش شكل واحد بس. الاختيار بيتحفظ في vsSelectedAvatarEmoji ويتستخدم
        // وقت رسم الفيديو (vsDrawAvatar).
        const VS_AVATAR_GROUPS = {
            'طبي وتمريض': ['🩺', '👩‍⚕️', '👨‍⚕️', '🧑‍⚕️', '💉', '🧬', '🔬', '🚑', '🩹', '💊', '🦴', '🫀'],
            'حيوانات': ['🐱', '🐶', '🦁', '🐼', '🐨', '🦊', '🐸', '🐧', '🦉', '🐰', '🐻', '🐯', '🐵', '🐮', '🐷', '🦄'],
            'روبوتات وفضاء': ['🤖', '👾', '👽', '🛸', '🦾', '🧑‍🚀', '⚙️', '🛰️', '🔋', '💾'],
            'تعبيرات': ['😀', '😎', '🤓', '🥳', '😇', '🤠', '🥸', '🧐', '🙂', '😊', '🤗', '🤩'],
            'شخصيات خيالية': ['🧙', '🧚', '🦸', '🦹', '🧛', '🧜', '🧝', '🥷', '🧞', '🧟', '👑', '🎭'],
            'طبيعة وطاقة': ['🌟', '🌙', '⚡', '🔥', '🌈', '❄️', '🌊', '🍀', '☀️', '🌸', '🌵', '🍎']
        };
        let vsSelectedAvatarEmoji = '🤖';
        let vsActiveAvatarGroup = Object.keys(VS_AVATAR_GROUPS)[0];

        function vsRenderAvatarPicker() {
            const groupsEl = document.getElementById('vsAvatarGroups');
            const gridEl = document.getElementById('vsAvatarGrid');
            if (!groupsEl || !gridEl) return;
            groupsEl.innerHTML = Object.keys(VS_AVATAR_GROUPS).map(name =>
                `<button type="button" class="${name === vsActiveAvatarGroup ? 'active' : ''}" onclick="vsSetAvatarGroup('${name}')">${name}</button>`
            ).join('');
            gridEl.innerHTML = VS_AVATAR_GROUPS[vsActiveAvatarGroup].map(emoji =>
                `<button type="button" class="${emoji === vsSelectedAvatarEmoji ? 'selected' : ''}" onclick="vsSetAvatarEmoji('${emoji.replace(/'/g, "\\'")}', this)">${emoji}</button>`
            ).join('');
        }

        function vsSetAvatarGroup(name) {
            vsActiveAvatarGroup = name;
            vsRenderAvatarPicker();
        }

        function vsSetAvatarEmoji(emoji, btn) {
            vsSelectedAvatarEmoji = emoji;
            document.querySelectorAll('#vsAvatarGrid button').forEach(b => b.classList.remove('selected'));
            if (btn) btn.classList.add('selected');
        }

        vsRenderAvatarPicker();

        async function vsCallProviderOnce(provider, prompt, signal) {
            if (provider === 'gemini') {
                const res = await fetch(`${settings.backendUrl}/api/gemini`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
                    signal
                });
                if (!res.ok || !res.body) throw new Error('vs-gemini-failed');
                const reader = res.body.getReader(); const decoder = new TextDecoder();
                let buffer = '', text = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n'); buffer = lines.pop();
                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try { text += JSON.parse(line.slice(6)).candidates?.[0]?.content?.parts?.[0]?.text || ''; } catch (e) {}
                    }
                }
                if (!text.trim()) throw new Error('vs-gemini-empty');
                return text;
            }
            const models = { deepseek: 'deepseek-chat', qwen: 'qwen-plus', openrouter: 'openrouter/free', groq: 'openai/gpt-oss-20b' };
            const res = await fetch(`${settings.backendUrl}/api/${provider}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: models[provider], messages: [{ role: 'user', content: prompt }], stream: false, temperature: 0.4 }),
                signal
            });
            if (!res.ok) throw new Error('vs-' + provider + '-failed');
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || '';
            if (!text.trim()) throw new Error('vs-' + provider + '-empty');
            return text;
        }

        // بيجرب كل موديل بالترتيب لحد ما واحد ينجح؛ كل موديل ليه مهلة قصوى منفصلة عشان
        // لو موديل معلّق أو بطيء جدًا منستناهوش للأبد — بننتقل للي بعده فورًا. لو كل
        // الموديلات وقعت بيرجع null والدالة اللي بتناديه بترجع للتقسيم المحلي.
        async function vsAskWithFallback(prompt, onProviderResult) {
            for (const provider of VS_MODEL_CHAIN) {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), VS_MODEL_TIMEOUT_MS);
                try {
                    const text = await vsCallProviderOnce(provider, prompt, controller.signal);
                    clearTimeout(timer);
                    if (onProviderResult) onProviderResult(provider, true);
                    return text;
                } catch (e) {
                    clearTimeout(timer);
                    if (onProviderResult) onProviderResult(provider, false);
                }
            }
            return null;
        }

        // بيقسّم أي نص لشرائح { title, bullets[] } بالذكاء الاصطناعي (فهم فعلي للمحتوى)،
        // بيجرب أقوى الموديلات بالترتيب أعلاه، ولو كل واحد فيهم وقع أو رجّع رد مش JSON
        // بيرجع لتقسيم محلي بسيط عشان الميزة تفضل شغالة حتى من غير AI خالص.
        async function vsBuildSlides(rawText, targetCount) {
            const prompt = `قسّم النص التعليمي ده لعدد ${targetCount} شرائح فيديو تعليمي مختصرة. رجّعلي JSON بس من غير أي كلام تاني ومن غير markdown، بالشكل ده بالظبط:
[{"title":"عنوان قصير للشريحة","bullets":["نقطة قصيرة 1","نقطة قصيرة 2"]}]
كل شريحة لازم يكون فيها لحد 3 نقاط قصيرة جدًا (كل نقطة أقل من 12 كلمة) مناسبة إنها تتقال بصوت وتتقرأ على الشاشة في نفس الوقت. النص:
"""${rawText.slice(0, 6000)}"""`;
            try {
                const content = await vsAskWithFallback(prompt, (provider, ok) => {
                    vsSetProgress(8, ok ? `بنفهم النص عن طريق ${VS_PROVIDER_LABELS[provider] || provider}...` : `${VS_PROVIDER_LABELS[provider] || provider} مش متاح دلوقتي، بنجرب موديل تاني...`);
                });
                if (!content) throw new Error('vs-all-providers-failed');
                const cleaned = content.replace(/```json|```/g, '').trim();
                const jsonStart = cleaned.indexOf('[');
                const jsonEnd = cleaned.lastIndexOf(']');
                if (jsonStart === -1 || jsonEnd === -1) throw new Error('vs-no-json');
                const slides = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
                if (!Array.isArray(slides) || !slides.length) throw new Error('vs-empty');
                return slides.map(s => ({
                    title: (s.title || '').toString().slice(0, 60),
                    bullets: Array.isArray(s.bullets) ? s.bullets.slice(0, 4).map(b => b.toString().slice(0, 90)) : []
                })).filter(s => s.title || s.bullets.length);
            } catch (e) {
                return vsBuildSlidesLocally(rawText, targetCount);
            }
        }

        // تقسيم احتياطي محلي من غير AI: بيقسّم النص لجمل، وبيوزّعها بالتساوي على عدد الشرائح.
        function vsBuildSlidesLocally(rawText, targetCount) {
            const sentences = rawText.replace(/\s+/g, ' ').trim().split(/(?<=[.!؟?])\s+/).filter(Boolean);
            if (!sentences.length) return [{ title: 'ملخص', bullets: [rawText.slice(0, 90)] }];
            const perSlide = Math.max(1, Math.ceil(sentences.length / targetCount));
            const slides = [];
            for (let i = 0; i < sentences.length; i += perSlide) {
                const group = sentences.slice(i, i + perSlide);
                slides.push({ title: `نقطة ${slides.length + 1}`, bullets: group.map(s => s.slice(0, 90)) });
            }
            return slides;
        }

        // بيرسم نص متعدد الأسطر جوه عرض معيّن (canvas مفيهوش wrap تلقائي زي HTML).
        function vsWrapText(ctx2, text, x, y, maxWidth, lineHeight) {
            const words = (text || '').split(' ');
            let line = '';
            const lines = [];
            words.forEach(w => {
                const test = line ? line + ' ' + w : w;
                if (ctx2.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
                else line = test;
            });
            if (line) lines.push(line);
            const startY = y - (lines.length - 1) * lineHeight / 2;
            lines.forEach((l, i) => ctx2.fillText(l, x, startY + i * lineHeight));
        }

        // ====================== فلاتر شكل الفيديو (20 استايل) + أيقونات موضوعية موزّعة بأماكن مناسبة ======================
        // كل فلتر لوحده كامل: تدرّج ألوان مختلف تمامًا + نوع زخرفة خلفية مختلف (نقط/مويجات/
        // خطوط/حلقات/فقاعات) — عشان يكون فيه تنوع بصري حقيقي مش مجرد تغيير لون واحد.
        // مفيش أي فلتر لونه أساسي أبيض أو أسود خالص — كلها ألوان وتدرجات حيّة.
        const VS_FILTERS = [
            { name: 'ليلي بنفسجي', bgFrom: '#2b1055', bgTo: '#7597de', avatarLight: '#ffd3a5', avatarDark: '#fd6585', accent: '#fd9a8f', bullet: '#ffe8d6', pattern: 'blobs' },
            { name: 'محيط هادئ', bgFrom: '#0f2027', bgTo: '#2c5364', avatarLight: '#89f7fe', avatarDark: '#3a7bd5', accent: '#66a6ff', bullet: '#d4f1ff', pattern: 'waves' },
            { name: 'غروب دافئ', bgFrom: '#41295a', bgTo: '#5b1e59', avatarLight: '#f6d365', avatarDark: '#fda085', accent: '#ffb997', bullet: '#ffe9d6', pattern: 'rings' },
            { name: 'غابة خضراء', bgFrom: '#134e5e', bgTo: '#4c8577', avatarLight: '#c2e9fb', avatarDark: '#38ef7d', accent: '#7bf1a8', bullet: '#e4fff0', pattern: 'grid' },
            { name: 'وردي ناعم', bgFrom: '#5f0a87', bgTo: '#a4508b', avatarLight: '#f6d5f7', avatarDark: '#be93c5', accent: '#f7979d', bullet: '#ffe1f0', pattern: 'stars' },
            { name: 'سماء زرقاء', bgFrom: '#1a2980', bgTo: '#26869c', avatarLight: '#a1ffce', avatarDark: '#4facfe', accent: '#7dd8ff', bullet: '#dffaff', pattern: 'stripes' },
            { name: 'نيون ليلي', bgFrom: '#1a1440', bgTo: '#3d2b73', avatarLight: '#00f5ff', avatarDark: '#ff00c8', accent: '#00f5ff', bullet: '#e0e0ff', pattern: 'grid' },
            { name: 'رمال ذهبية', bgFrom: '#7a4a1e', bgTo: '#c78a3f', avatarLight: '#fff2c2', avatarDark: '#e08a2b', accent: '#ffdd99', bullet: '#fff3d6', pattern: 'stripes' },
            { name: 'ثلجي بارد', bgFrom: '#1e3c72', bgTo: '#2a5298', avatarLight: '#e0f7ff', avatarDark: '#a1c4fd', accent: '#bde0ff', bullet: '#eaf6ff', pattern: 'stars' },
            { name: 'فضائي', bgFrom: '#1a0533', bgTo: '#4a1a73', avatarLight: '#c9a7ff', avatarDark: '#7b2ff7', accent: '#b16cff', bullet: '#e6d9ff', pattern: 'stars' },
            { name: 'مرجاني', bgFrom: '#ff6a88', bgTo: '#ff9a8b', avatarLight: '#fff1e6', avatarDark: '#ff6a88', accent: '#ffd3c6', bullet: '#fff0ea', pattern: 'blobs' },
            { name: 'نعناعي', bgFrom: '#0ba360', bgTo: '#3cba92', avatarLight: '#e6fff5', avatarDark: '#0ba360', accent: '#a0ffd8', bullet: '#e6fff2', pattern: 'waves' },
            { name: 'عنابي أنيق', bgFrom: '#4a0e28', bgTo: '#7b1e3a', avatarLight: '#ffd9e0', avatarDark: '#ff6f91', accent: '#ff9fb4', bullet: '#ffe3ea', pattern: 'rings' },
            { name: 'برتقالي حيوي', bgFrom: '#f2994a', bgTo: '#f2c94c', avatarLight: '#fff7e0', avatarDark: '#f2994a', accent: '#ffe1a8', bullet: '#fff6e0', pattern: 'grid' },
            { name: 'أزرق ملكي', bgFrom: '#0f2447', bgTo: '#1b4b91', avatarLight: '#cfe3ff', avatarDark: '#4a7fd6', accent: '#8ab4ff', bullet: '#e3edff', pattern: 'stripes' },
            { name: 'خوخي', bgFrom: '#ffafbd', bgTo: '#ffc3a0', avatarLight: '#fff3ec', avatarDark: '#ff9a8b', accent: '#ffd9c9', bullet: '#fff4ee', pattern: 'blobs' },
            { name: 'غابة ليلية', bgFrom: '#0b3d2e', bgTo: '#1f6f5c', avatarLight: '#c9ffe5', avatarDark: '#2ecc91', accent: '#7cffcb', bullet: '#e2fff2', pattern: 'stars' },
            { name: 'بنفسجي ملكي', bgFrom: '#4a1258', bgTo: '#7b2ff7', avatarLight: '#f0d9ff', avatarDark: '#c56cf0', accent: '#e6b8ff', bullet: '#f4e6ff', pattern: 'rings' },
            { name: 'رمادي دافئ', bgFrom: '#3a3d5c', bgTo: '#6a6f9e', avatarLight: '#e8e9f7', avatarDark: '#8f94c9', accent: '#c2c6ec', bullet: '#eef0fb', pattern: 'grid' },
            { name: 'توتي', bgFrom: '#6a0572', bgTo: '#ab206b', avatarLight: '#ffd6ec', avatarDark: '#ff5da2', accent: '#ff9fd0', bullet: '#ffe6f4', pattern: 'waves' }
        ];

        // بيختار فلتر تلقائي ثابت حسب النص (نفس النص هيرجّع نفس الفلتر دايمًا) — بيتستخدم
        // بس لو الطالب سايب الاختيار على "تلقائي" وماحددش فلتر بنفسه.
        function vsAutoFilterIndex(text) {
            let hash = 0;
            for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
            return hash % VS_FILTERS.length;
        }

        // ====================== أنيميشن ظهور النص والأفاتار (20+ حركة) ======================
        // كل حركة بترجع إزاحة/تكبير/دوران/شفافية حسب نسبة تقدّم الظهور (0 → 1)، وبتتطبّق
        // بنفس المنطق على العنوان والنقاط والأفاتار — عشان اختيار واحد يغيّر شكل الفيديو كله.
        const VS_ANIMATIONS = [
            { id: 'fade', name: 'تلاشي' }, { id: 'slide-up', name: 'صعود لأعلى' },
            { id: 'slide-down', name: 'نزول لأسفل' }, { id: 'slide-left', name: 'انزلاق لليسار' },
            { id: 'slide-right', name: 'انزلاق لليمين' }, { id: 'zoom-in', name: 'تكبير تدريجي' },
            { id: 'zoom-out', name: 'تصغير تدريجي' }, { id: 'pop', name: 'قفزة مرنة' },
            { id: 'bounce', name: 'ارتداد' }, { id: 'rotate-in', name: 'دوران بسيط' },
            { id: 'swing', name: 'تأرجح' }, { id: 'drop', name: 'سقوط من فوق' },
            { id: 'rise', name: 'طلوع من تحت' }, { id: 'shake-settle', name: 'اهتزاز خفيف' },
            { id: 'wave', name: 'تموّج' }, { id: 'spiral', name: 'دوامة' },
            { id: 'elastic', name: 'مطاطي' }, { id: 'blur-pop', name: 'ظهور ناعم' },
            { id: 'corner-in', name: 'دخول قطري' }, { id: 'flip-swing', name: 'ميلان خفيف' },
            { id: 'settle-large', name: 'استقرار من كبير' }
        ];

        function vsEase(p, type) {
            if (type === 'outCubic') return 1 - Math.pow(1 - p, 3);
            if (type === 'outBack') { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
            if (type === 'outElastic') { const c4 = (2 * Math.PI) / 3; return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1; }
            return p;
        }

        function vsApplyAnimation(id, p) {
            p = Math.max(0, Math.min(1, p));
            const eC = vsEase(p, 'outCubic');
            const t = { dx: 0, dy: 0, scale: 1, rot: 0, alpha: p };
            switch (id) {
                case 'slide-up': t.dy = (1 - eC) * 50; break;
                case 'slide-down': t.dy = -(1 - eC) * 50; break;
                case 'slide-left': t.dx = (1 - eC) * 70; break;
                case 'slide-right': t.dx = -(1 - eC) * 70; break;
                case 'zoom-in': t.scale = 0.5 + 0.5 * eC; break;
                case 'zoom-out': t.scale = 1.4 - 0.4 * eC; break;
                case 'pop': t.scale = vsEase(p, 'outBack'); t.alpha = Math.min(1, p * 2); break;
                case 'bounce': t.dy = -30 * Math.exp(-4 * p) * Math.sin(p * 10); break;
                case 'rotate-in': t.rot = (1 - eC) * 20; break;
                case 'swing': t.rot = Math.sin(p * 10) * 15 * (1 - p); break;
                case 'drop': t.dy = -(1 - eC) * 120; break;
                case 'rise': t.dy = (1 - eC) * 120; break;
                case 'shake-settle': t.dx = Math.sin(p * 20) * 10 * (1 - p); break;
                case 'wave': t.dy = Math.sin(p * 6) * 15 * (1 - p); break;
                case 'spiral': t.rot = (1 - eC) * 180; t.scale = 0.3 + 0.7 * eC; break;
                case 'elastic': t.scale = vsEase(p, 'outElastic'); break;
                case 'blur-pop': t.scale = 0.9 + 0.1 * eC; break;
                case 'corner-in': t.dx = (1 - eC) * 40; t.dy = (1 - eC) * 40; break;
                case 'flip-swing': t.rot = (1 - eC) * -25; t.scale = 0.85 + 0.15 * eC; break;
                case 'settle-large': t.scale = 1.3 - 0.3 * eC; t.dy = (1 - eC) * 20; break;
                default: break; // fade
            }
            return t;
        }

        let vsSelectedFilterIndex = null; // null = تلقائي حسب النص
        let vsSelectedAnimationId = 'fade';

        function vsRenderFilterPicker() {
            const el = document.getElementById('vsFilterChips');
            if (!el) return;
            let html = `<button type="button" class="vs-filter-chip auto ${vsSelectedFilterIndex === null ? 'active' : ''}" onclick="vsSetFilter(null, this)">🎲 تلقائي حسب النص</button>`;
            html += VS_FILTERS.map((f, i) =>
                `<button type="button" class="vs-filter-chip ${i === vsSelectedFilterIndex ? 'active' : ''}" style="background:linear-gradient(135deg, ${f.bgFrom}, ${f.bgTo});" onclick="vsSetFilter(${i}, this)">${f.name}</button>`
            ).join('');
            el.innerHTML = html;
        }
        function vsSetFilter(i, btn) {
            vsSelectedFilterIndex = i;
            document.querySelectorAll('#vsFilterChips button').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
        }
        function vsRenderAnimationPicker() {
            const el = document.getElementById('vsAnimationChips');
            if (!el) return;
            el.innerHTML = VS_ANIMATIONS.map(a =>
                `<button type="button" class="vs-anim-chip ${a.id === vsSelectedAnimationId ? 'active' : ''}" onclick="vsSetAnimation('${a.id}', this)">${a.name}</button>`
            ).join('');
        }
        function vsSetAnimation(id, btn) {
            vsSelectedAnimationId = id;
            document.querySelectorAll('#vsAnimationChips button').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
        }
        vsRenderFilterPicker();
        vsRenderAnimationPicker();

        // بيحاول يلاقي رمز بصري يعبّر عن موضوع أي نص (مصطلحات تمريضية شائعة)، وبيتستخدم
        // مرتين: مرة للخلفية العامة، ومرة جنب كل نقطة على حدة عشان الأيقونة تكون في مكانها
        // المناسب المرتبط فعليًا بمحتوى النقطة دي مش مجرد ديكور عشوائي.
        function vsDetectTopicIcon(text) {
            const map = [
                [/قلب|شريان|ضغط الدم|دوري/i, '🫀'], [/رئ|تنفس|ربو/i, '🫁'],
                [/دم\b|دموي|أنيميا|فقر الدم/i, '🩸'], [/عظم|عظام|كسر|مفصل/i, '🦴'],
                [/مخ|دماغ|عصب/i, '🧠'], [/جلد|جرح|حرق/i, '🩹'],
                [/عين|بصر|نظر/i, '👁️'], [/معدة|هضم|أمعاء|كبد/i, '🍽️'],
                [/كلي|كلى|بول/i, '🩺'], [/دوا|علاج|جرعة|حقن/i, '💊'],
                [/حمل|ولاد|جنين/i, '🤰'], [/طفل|أطفال|رضيع/i, '👶']
            ];
            for (const [re, icon] of map) if (re.test(text)) return icon;
            return '📘';
        }

        // بيحسب متوسط شدة الصوت (RMS) حوالين لحظة زمنية معيّنة من الـ audio buffer
        // المفكوك مسبقًا، عشان نحرّك بيها الأفاتار بالظبط مع الكلام الفعلي (مش حركة عشوائية).
        function vsGetAmplitudeAt(audioBuffer, t) {
            if (!audioBuffer) return 0;
            const data = audioBuffer.getChannelData(0);
            const sampleRate = audioBuffer.sampleRate;
            const windowSize = Math.floor(sampleRate * 0.05);
            const centerIdx = Math.floor(t * sampleRate);
            let sum = 0, count = 0;
            for (let i = Math.max(0, centerIdx - windowSize); i < Math.min(data.length, centerIdx + windowSize); i++) {
                sum += data[i] * data[i]; count++;
            }
            if (!count) return 0;
            return Math.min(1, Math.sqrt(sum / count) * 4.5);
        }

        function vsDrawPatternBlobs(ctx, canvas, t) {
            [[0.22, 0.22, 260], [0.85, 0.7, 230], [0.5, 0.92, 200]].forEach(([fx, fy, r], i) => {
                const ox = Math.sin(t * 0.15 + i * 2) * 40, oy = Math.cos(t * 0.12 + i * 3) * 40;
                const blob = ctx.createRadialGradient(canvas.width * fx + ox, canvas.height * fy + oy, 0, canvas.width * fx + ox, canvas.height * fy + oy, r);
                blob.addColorStop(0, 'rgba(255,255,255,0.16)'); blob.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = blob; ctx.fillRect(0, 0, canvas.width, canvas.height);
            });
        }
        function vsDrawPatternGrid(ctx, canvas, t) {
            ctx.save(); ctx.globalAlpha = 0.10; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
            const gap = 70, offset = (t * 12) % gap;
            for (let x = -gap; x < canvas.width + gap; x += gap) { ctx.beginPath(); ctx.moveTo(x + offset, 0); ctx.lineTo(x + offset, canvas.height); ctx.stroke(); }
            for (let y = -gap; y < canvas.height + gap; y += gap) { ctx.beginPath(); ctx.moveTo(0, y + offset * 0.5); ctx.lineTo(canvas.width, y + offset * 0.5); ctx.stroke(); }
            ctx.restore();
        }
        function vsDrawPatternStars(ctx, canvas, t, seedText) {
            ctx.save();
            let seed = 0;
            for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
            for (let i = 0; i < 40; i++) {
                seed = (seed * 1103515245 + 12345) >>> 0; const x = (seed % 1000) / 1000 * canvas.width;
                seed = (seed * 1103515245 + 12345) >>> 0; const y = (seed % 1000) / 1000 * canvas.height;
                const twinkle = 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i));
                ctx.globalAlpha = twinkle * 0.5; ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
        function vsDrawPatternWaves(ctx, canvas, t) {
            ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff';
            for (let band = 0; band < 3; band++) {
                ctx.beginPath();
                const baseY = canvas.height * (0.3 + band * 0.25);
                ctx.moveTo(0, baseY);
                for (let x = 0; x <= canvas.width; x += 20) ctx.lineTo(x, baseY + Math.sin(x * 0.01 + t * 1.2 + band) * 18);
                ctx.lineTo(canvas.width, baseY + 60); ctx.lineTo(0, baseY + 60);
                ctx.closePath(); ctx.fill();
            }
            ctx.restore();
        }
        function vsDrawPatternStripes(ctx, canvas, t) {
            ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = '#ffffff';
            const gap = 90, offset = (t * 25) % (gap * 2);
            for (let x = -canvas.height; x < canvas.width + canvas.height; x += gap) {
                ctx.beginPath();
                ctx.moveTo(x + offset, 0); ctx.lineTo(x + offset + 40, 0);
                ctx.lineTo(x + offset + 40 - canvas.height, canvas.height); ctx.lineTo(x + offset - canvas.height, canvas.height);
                ctx.closePath(); ctx.fill();
            }
            ctx.restore();
        }
        function vsDrawPatternRings(ctx, canvas, t) {
            ctx.save();
            const cx = canvas.width * 0.5, cy = canvas.height * 0.35;
            for (let i = 0; i < 4; i++) {
                ctx.globalAlpha = 0.08; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx, cy, 100 + i * 90 + Math.sin(t * 0.5 + i) * 10, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        }

        // خلفية الفيديو: تدرّج لوني حسب الفلتر المختار + زخرفة متحركة + أيقونات الموضوع
        // موزّعة في أماكن مناسبة (ركنين علويين فاضيين + وسط أسفل النص) بدل ما تتكدس فوق بعض.
        function vsDrawBackground(ctx, canvas, filter, t, topicIcon, seedText) {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, filter.bgFrom); grad.addColorStop(1, filter.bgTo);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (filter.pattern === 'grid') vsDrawPatternGrid(ctx, canvas, t);
            else if (filter.pattern === 'stars') vsDrawPatternStars(ctx, canvas, t, seedText);
            else if (filter.pattern === 'waves') vsDrawPatternWaves(ctx, canvas, t);
            else if (filter.pattern === 'stripes') vsDrawPatternStripes(ctx, canvas, t);
            else if (filter.pattern === 'rings') vsDrawPatternRings(ctx, canvas, t);
            else vsDrawPatternBlobs(ctx, canvas, t);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.12; ctx.font = '200px sans-serif';
            ctx.fillText(topicIcon, canvas.width * 0.5, canvas.height * 0.62);
            ctx.globalAlpha = 0.17; ctx.font = '60px sans-serif';
            ctx.fillText(topicIcon, canvas.width * 0.13, canvas.height * 0.09);
            ctx.fillText(topicIcon, canvas.width * 0.87, canvas.height * 0.09);
            ctx.restore();
        }

        // أفاتار الطالب المُختار — بيتحط جوه دائرة متوهجة، وبيكبر شوية مع شدة الصوت عشان
        // يدّي إحساس إنه بيتكلم فعلًا، وبياخد نفس أنيميشن الظهور المختار زي باقي عناصر الشريحة.
        function vsDrawAvatar(ctx, canvas, filter, amplitude, t, avatarEmoji, anim) {
            anim = anim || { dx: 0, dy: 0, scale: 1, rot: 0, alpha: 1 };
            const bob = Math.sin(t * 2.2) * 6;
            const r = 90;
            ctx.save();
            ctx.globalAlpha = anim.alpha;
            ctx.translate(canvas.width / 2 + anim.dx, canvas.height - 210 + bob + anim.dy);
            ctx.rotate(anim.rot * Math.PI / 180);
            ctx.scale(anim.scale, anim.scale);

            ctx.save();
            ctx.globalAlpha = 0.4 + amplitude * 0.35;
            const glowR = r * 1.5 + amplitude * 30;
            const glow = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, glowR);
            glow.addColorStop(0, filter.accent); glow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            const bodyGrad = ctx.createLinearGradient(-r, -r, r, r);
            bodyGrad.addColorStop(0, filter.avatarLight); bodyGrad.addColorStop(1, filter.avatarDark);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

            const pulse = 1 + amplitude * 0.18;
            ctx.save();
            ctx.scale(pulse, pulse);
            ctx.font = '92px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(avatarEmoji || '🤖', 0, 4);
            ctx.restore();
            ctx.restore();
        }

        async function generateVideoFromSummary() {
            const rawText = document.getElementById('vsSummaryInput').value.trim();
            if (!rawText) { showToast('اكتب أو الصق نص الأول', 'error'); return; }
            if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
                showToast('متصفحك مش بيدعم تسجيل الفيديو، جرب Chrome أو Edge', 'error');
                return;
            }

            document.getElementById('vsInputSection').style.display = 'none';
            document.getElementById('vsProgressSection').style.display = 'block';
            document.getElementById('vsResultSection').style.display = 'none';
            vsSetProgress(4, 'بنفهم النص ونقسّمه لشرائح...');

            try {
                const chosenFilter = VS_FILTERS[vsSelectedFilterIndex !== null ? vsSelectedFilterIndex : vsAutoFilterIndex(rawText)];
                const chosenAnimation = vsSelectedAnimationId || 'fade';
                const topicIcon = vsDetectTopicIcon(rawText);
                const chosenAvatar = vsSelectedAvatarEmoji;
                const slides = await vsBuildSlides(rawText, vsSelectedSlideCount);
                vsSetProgress(20, `جاهز ${slides.length} شرائح — بنولّد الصوت...`);

                const audioBuffers = [];
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                for (let i = 0; i < slides.length; i++) {
                    const s = slides[i];
                    const narration = [s.title, ...(s.bullets || [])].filter(Boolean).join('. ');
                    const blob = await fetchTtsAudioBlob(narration || 'لا يوجد نص');
                    const arrBuf = await blob.arrayBuffer();
                    const audioBuf = await audioCtx.decodeAudioData(arrBuf);
                    audioBuffers.push(audioBuf);
                    vsSetProgress(20 + Math.round((i + 1) / slides.length * 35), `بنولّد صوت الشريحة ${i + 1} من ${slides.length}...`);
                }

                vsSetProgress(58, 'بنجهّز التسجيل...');

                const canvas = document.createElement('canvas');
                canvas.width = 720; canvas.height = 1280;
                const ctx = canvas.getContext('2d');

                const destination = audioCtx.createMediaStreamDestination();
                const canvasStream = canvas.captureStream(30);
                const combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...destination.stream.getAudioTracks()
                ]);

                let mimeType = 'video/webm;codecs=vp9,opus';
                if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
                const recorder = new MediaRecorder(combinedStream, { mimeType });
                const chunks = [];
                recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

                const totalDuration = audioBuffers.reduce((a, b) => a + b.duration, 0) + 0.4;
                const slideStarts = [];
                let acc = 0;
                audioBuffers.forEach(b => { slideStarts.push(acc); acc += b.duration; });

                function drawSlide(slideIndex, tInSlide, tGlobal) {
                    const s = slides[slideIndex] || { title: '', bullets: [] };
                    vsDrawBackground(ctx, canvas, chosenFilter, tGlobal, topicIcon, rawText);

                    ctx.fillStyle = 'rgba(255,255,255,.7)';
                    ctx.font = '700 26px Cairo, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Chat X', canvas.width / 2, 90);

                    const titleP = Math.min(1, tInSlide / 0.5);
                    const titleAnim = vsApplyAnimation(chosenAnimation, titleP);
                    ctx.save();
                    ctx.globalAlpha = titleAnim.alpha;
                    ctx.translate(canvas.width / 2 + titleAnim.dx, 260 + titleAnim.dy);
                    ctx.rotate(titleAnim.rot * Math.PI / 180);
                    ctx.scale(titleAnim.scale, titleAnim.scale);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '800 44px Cairo, sans-serif';
                    ctx.textAlign = 'center';
                    vsWrapText(ctx, s.title || '', 0, 0, 620, 54);
                    ctx.restore();

                    const bullets = s.bullets || [];
                    const perBulletDelay = 0.4;
                    bullets.forEach((b, bi) => {
                        const bp = Math.min(1, Math.max(0, (tInSlide - bi * perBulletDelay) / 0.5));
                        if (bp <= 0) return;
                        const anim = vsApplyAnimation(chosenAnimation, bp);
                        const icon = vsDetectTopicIcon(b); // أيقونة النقطة دي بالذات — في مكانها الصح جنب كلامها
                        ctx.save();
                        ctx.globalAlpha = anim.alpha;
                        ctx.translate(canvas.width / 2 + anim.dx, 390 + bi * 100 + anim.dy);
                        ctx.rotate(anim.rot * Math.PI / 180);
                        ctx.scale(anim.scale, anim.scale);
                        ctx.font = '600 30px Cairo, sans-serif';
                        ctx.fillStyle = chosenFilter.bullet;
                        ctx.textAlign = 'center';
                        vsWrapText(ctx, icon + ' ' + b, 0, 0, 600, 38);
                        ctx.restore();
                    });

                    const amplitude = vsGetAmplitudeAt(audioBuffers[slideIndex], tInSlide);
                    const avatarP = Math.min(1, tInSlide / 0.6);
                    const avatarAnim = vsApplyAnimation(chosenAnimation, avatarP);
                    avatarAnim.alpha = Math.max(avatarAnim.alpha, 0.92); // الأفاتار يفضل واضح حتى لو الحركة بتقلل الشفافية بسرعة
                    vsDrawAvatar(ctx, canvas, chosenFilter, amplitude, tGlobal, chosenAvatar, avatarAnim);

                    const overallT = slideStarts[slideIndex] + tInSlide;
                    const progress = Math.min(1, overallT / totalDuration);
                    ctx.fillStyle = 'rgba(255,255,255,.2)';
                    ctx.fillRect(60, canvas.height - 40, canvas.width - 120, 6);
                    ctx.fillStyle = chosenFilter.accent;
                    ctx.fillRect(60, canvas.height - 40, (canvas.width - 120) * progress, 6);
                }

                drawSlide(0, 0, 0); // فريم أول ملوّن فورًا قبل بدء التسجيل، عشان أول لحظة في الفيديو متبقاش سودة أو فاضية
                recorder.start(200);
                const startTime = audioCtx.currentTime + 0.15;
                audioBuffers.forEach((buf, i) => {
                    const src = audioCtx.createBufferSource();
                    src.buffer = buf;
                    src.connect(destination);
                    src.start(startTime + slideStarts[i]);
                });

                await new Promise((resolve) => {
                    function frame() {
                        const elapsed = audioCtx.currentTime - startTime;
                        let idx = slideStarts.findIndex((s, i) => elapsed < s + audioBuffers[i].duration);
                        if (idx === -1) idx = slides.length - 1;
                        const tInSlide = Math.max(0, elapsed - slideStarts[idx]);
                        drawSlide(idx, tInSlide, elapsed);
                        vsSetProgress(58 + Math.min(40, Math.round((elapsed / totalDuration) * 40)), `بنسجّل الفيديو... ${Math.min(100, Math.round(elapsed / totalDuration * 100))}%`);
                        if (elapsed < totalDuration) requestAnimationFrame(frame);
                        else resolve();
                    }
                    requestAnimationFrame(frame);
                });

                await new Promise(r => setTimeout(r, 250));
                recorder.stop();
                await new Promise(resolve => { recorder.onstop = resolve; });

                const videoBlob = new Blob(chunks, { type: mimeType.split(';')[0] });
                vsGeneratedVideoUrl = URL.createObjectURL(videoBlob);
                document.getElementById('vsPreviewVideo').src = vsGeneratedVideoUrl;

                document.getElementById('vsDownloadBtn').onclick = () => {
                    const a = document.createElement('a');
                    a.href = vsGeneratedVideoUrl;
                    a.download = `فيديو-تلقائي-${Date.now()}.webm`;
                    document.body.appendChild(a); a.click(); a.remove();
                };

                document.getElementById('vsProgressSection').style.display = 'none';
                document.getElementById('vsResultSection').style.display = 'block';
                showToast('الفيديو جاهز ✓', 'success');
            } catch (err) {
                console.error('video studio error', err);
                showToast('حصل عطل أثناء توليد الفيديو، حاول تاني', 'error');
                vsResetStudio();
            }
        }

        // ====================== إشعارات بأسلوب الأيفون (iOS-style toast queue) ======================
        // بدل ما كل الإشعارات تظهر مرة واحدة فوق بعض (زي ما كان بيحصل بعد ربط
        // School X — كذا showToast بيتنادوا في نفس اللحظة تقريبًا)، هنا كل إشعار
        // بيدخل طابور، وبيظهر واحد بس في كل لحظة زي بانر إشعارات الأيفون بالظبط،
        // وبعدين اللي بعده يظهر — ده اللي بيخلي الترتيب واضح ومريح مهما كان
        // عدد الإشعارات اللي جت مع بعض.
        let toastQueue = [];
        let toastActiveId = null;

        // options اختياري: { title, icon (اسم كلاس Font Awesome من غير fa-)، duration بالميلي ثانية }
        function showToast(message, type = 'success', options = {}) {
            const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
            toastQueue.push({ id, message, type, options: options || {} });
            // لو حصل "طوفان" إشعارات سريع (زي كذا تهنئة بريميوم ورا بعض وقت ربط
            // School X)، منسيبش الطابور يكبر من غير حدود — بنفضّل آخر 4 بس عشان
            // الطالب ميستناش يشوف رسايل قديمة كتير وهو مركّز في حاجة تانية دلوقتي.
            if (toastQueue.length > 4) toastQueue.splice(0, toastQueue.length - 4);
            processToastQueue();
        }

        function processToastQueue() {
            if (toastActiveId || toastQueue.length === 0) return;
            const item = toastQueue.shift();
            toastActiveId = item.id;
            renderIOSToast(item);
        }

        function renderIOSToast({ id, message, type, options }) {
            const container = document.getElementById('toastContainer');
            if (!container) { toastActiveId = null; return; }
            const iconMap = { success: 'fa-circle-check', error: 'fa-triangle-exclamation', info: 'fa-circle-info' };
            const icon = options.icon || iconMap[type] || iconMap.success;
            const title = options.title || (type === 'error' ? 'تنبيه' : 'Chat X');

            const el = document.createElement('div');
            el.className = `ios-toast ${type}`;
            el.id = id;
            el.innerHTML = `
                <div class="ios-toast-icon"><i class="fas ${icon}"></i></div>
                <div class="ios-toast-body">
                    <div class="ios-toast-top-row">
                        <span class="ios-toast-app">${escapeHtml(title)}</span>
                        <span class="ios-toast-time">الآن</span>
                    </div>
                    <div class="ios-toast-msg">${escapeHtml(message)}</div>
                </div>`;
            container.appendChild(el);
            requestAnimationFrame(() => el.classList.add('show'));

            attachToastSwipeDismiss(el, () => dismissIOSToast(id));
            el.addEventListener('click', () => { if (!el._toastDragged) dismissIOSToast(id); });

            const duration = options.duration || (type === 'error' ? 4200 : 3000);
            el._dismissTimer = setTimeout(() => dismissIOSToast(id), duration);
        }

        function dismissIOSToast(id) {
            if (toastActiveId === id) toastActiveId = null;
            const el = document.getElementById(id);
            if (!el) { processToastQueue(); return; }
            clearTimeout(el._dismissTimer);
            el.classList.remove('show');
            el.classList.add('hide');
            setTimeout(() => {
                el.remove();
                processToastQueue();
            }, 260);
        }

        // سحب الإشعار لفوق زي بانر الأيفون بالظبط عشان يتقفل بإيده لو مش عايز
        // يستناه لحد ما يختفي لوحده — بيشتغل باللمس وبالماوس.
        function attachToastSwipeDismiss(el, onDismiss) {
            let startY = null, dragging = false, moved = false;
            const threshold = 34;
            const onStart = (y) => { startY = y; dragging = true; moved = false; el.style.transition = 'none'; };
            const onMove = (y) => {
                if (!dragging) return;
                const dy = Math.min(0, y - startY); // بس لفوق
                if (Math.abs(dy) > 6) moved = true;
                el.style.transform = `translateY(${dy}px)`;
                el.style.opacity = String(Math.max(0.25, 1 - Math.abs(dy) / 70));
            };
            const onEnd = (y) => {
                if (!dragging) return;
                dragging = false;
                el.style.transition = '';
                const dy = (typeof y === 'number' && startY != null) ? (y - startY) : 0;
                if (dy < -threshold) {
                    el.style.transform = 'translateY(-60px)';
                    el.style.opacity = '0';
                    el._toastDragged = true;
                    onDismiss();
                } else {
                    el.style.transform = '';
                    el.style.opacity = '';
                    setTimeout(() => { el._toastDragged = false; }, 0);
                }
            };
            el.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
            el.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
            el.addEventListener('touchend', (e) => onEnd((e.changedTouches[0] || {}).clientY));
            el.addEventListener('mousedown', (e) => onStart(e.clientY));
            window.addEventListener('mousemove', (e) => { if (dragging) onMove(e.clientY); });
            window.addEventListener('mouseup', (e) => { if (dragging) onEnd(e.clientY); });
        }

        // ====================== إعادة محاولة تلقائية لو النت اتقطع أثناء الرد ======================
        // بيفرّق بين خطأ شبكة فعلي (النت مقطوع/فشل الاتصال) وأي خطأ تاني (زي رفض
        // من السيرفر أو مشكلة في المفتاح) — عشان منعملش retry لا نهاية له على خطأ
        // مش هيتحل بمجرد إعادة المحاولة.
        function isConnectivityError(error) {
            if (!error) return false;
            if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
            const msg = (error.message || '').toLowerCase();
            return (error instanceof TypeError) && (
                msg.includes('failed to fetch') ||
                msg.includes('network') ||
                msg.includes('load failed') // Safari
            );
        }

        // بيستنى رجوع النت (أو يدي فرصة محاولة سريعة تانية لو الخطأ كان عابر ومش
        // قطع فعلي) قبل ما يوافق على إعادة توليد الرد تلقائيًا. بيوقف فورًا لو
        // الطالب دوس "إيقاف" بنفسه وهو مستني، ومش بيستنى أكتر من نص دقيقة.
        function waitForReconnectAndRetry(signal, attempt, maxAttempts) {
            return new Promise((resolve) => {
                if (signal.aborted) { resolve({ shouldRetry: false, userCancelled: true }); return; }
                let settled = false;
                let giveUpTimer = null;
                const onOnline = () => finishRetry();
                const onAbort = () => {
                    if (settled) return; settled = true;
                    cleanup();
                    resolve({ shouldRetry: false, userCancelled: true });
                };
                function cleanup() {
                    window.removeEventListener('online', onOnline);
                    signal.removeEventListener('abort', onAbort);
                    clearTimeout(giveUpTimer);
                }
                function finishRetry() {
                    if (settled) return; settled = true;
                    cleanup();
                    showToast(`رجع الاتصال بالنت — جاري إعادة المحاولة (${attempt}/${maxAttempts})`, 'success', { title: 'Chat X', icon: 'fa-wifi' });
                    resolve({ shouldRetry: true, userCancelled: false });
                }
                function giveUp() {
                    if (settled) return; settled = true;
                    cleanup();
                    resolve({ shouldRetry: false, userCancelled: false });
                }
                signal.addEventListener('abort', onAbort);
                if (navigator.onLine === false) {
                    showToast('قطع الاتصال بالنت — هنحاول تاني تلقائيًا أول ما يرجع', 'error', { title: 'مفيش إنترنت', icon: 'fa-wifi' });
                    window.addEventListener('online', onOnline);
                    giveUpTimer = setTimeout(giveUp, 25000);
                } else {
                    showToast(`حصلت مشكلة مؤقتة في الاتصال — بنحاول تاني (${attempt}/${maxAttempts})`, 'error', { title: 'Chat X', icon: 'fa-arrows-rotate' });
                    giveUpTimer = setTimeout(finishRetry, 1500 * attempt);
                }
            });
        }

        // ====================== إشعار "الرد جاهز" لو الطالب مبعّد عن التاب ======================
        // بيشتغل بس لو الطالب أصلاً موافق على إذن الإشعارات من قبل (من إعدادات
        // "تفعيل الإشعارات") — منطلبش إذن جديد هنا عشان منقاطعوش في لحظة مش
        // مناسبة. لو موافق ومبعّد عن الصفحة (تاب تاني/تطبيق تاني)، بيوصله إشعار
        // حقيقي من نظام التشغيل بمجرد ما الرد يخلص.
        function notifyResponseReadyIfHidden(chat) {
            try {
                if (document.visibilityState !== 'hidden') return;
                if (!window.Notification || Notification.permission !== 'granted') return;
                const lastMsg = chat && chat.messages && chat.messages[chat.messages.length - 1];
                const preview = (lastMsg && lastMsg.role === 'bot' && lastMsg.content)
                    ? stripMarkdownForSpeech(lastMsg.content).slice(0, 120)
                    : 'ردّك جاهز، ارجع شوف';
                const notif = new Notification('✅ الرد جاهز', { body: preview, icon: '/icons/favicon-32.png', tag: 'chatx-response-ready' });
                notif.onclick = () => { window.focus(); notif.close(); };
            } catch (e) { /* إشعار إضافي مش أساسي — أي فشل هنا منسيبوش يأثر على أي حاجة تانية */ }
        }

        window.onclick = (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                if (e.target.id === 'drugScanModal') stopDrugScanner();
                if (e.target.id === 'liveNowModal') { clearInterval(liveNowRefreshTimer); liveNowRefreshTimer = null; }
                if (e.target.id === 'videoPlayerModal') { document.getElementById('tvPlayerVideo').pause(); document.removeEventListener('keydown', tvPlayerEscHandler); }
                if (e.target.id === 'telegramLinkModal') { stopTelegramLinkPoll(); }
                if (e.target.id === 'passwordResetModal') { stopResetTelegramLinkPoll(); }
                e.target.classList.remove('active');
            }
        };
        // ====================== تنبيه عام لقطع/رجوع النت ======================
        // منفصل عن إعادة المحاولة التلقائية بتاعة الشات فوق — ده بيغطي باقي أجزاء
        // التطبيق (المكتبة، فيديوهات الشرح، إلخ) اللي مفيهاش retry تلقائي، عشان
        // الطالب يفهم إن سبب فشل أي طلب هو النت مش عطل في الموقع.
        window.addEventListener('offline', () => showToast('قطع الاتصال بالنت — تأكد من الشبكة وحاول تاني', 'error', { title: 'مفيش إنترنت', icon: 'fa-wifi' }));
        window.addEventListener('online', () => showToast('رجع الاتصال بالنت ✅', 'success', { title: 'Chat X', icon: 'fa-wifi' }));
