/* =========================================================================
   cloud-sync.js — مزامنة بيانات الطالب مع السيرفر (Chat X)
   -------------------------------------------------------------------------
   بيتحمّل بعد script.js مباشرة:   <script src="cloud-sync.js"></script>

   بيعمل إيه؟
   • أول ما الطالب يربط حسابه: بيحمّل محادثاته ومهاراته وتقدّمه من السيرفر
     مع شاشة تحميل وعدّاد، والصفحات بتتحمّل بالتوازي (3 طلبات مع بعض).
   • أي تغيير بعد كده (رسالة، مهارة، إحصائية...) بيتحفظ على السيرفر لوحده
     بعد ثانية ونص من آخر تغيير، ومن غير ما تلمس أي كود في script.js.
   • فتح الموقع تاني على نفس الحساب: بيظهر كل حاجة فورًا من الجهاز
     (كاش)، والتحديث من السيرفر بيحصل في الخلفية ومش بيستنّاه أحد.
   • الجهاز اللي بيتشارك بين طلبة: بيانات كل طالب بتتفصل عن التاني.

   شكل الـ API المطلوب من السيرفر (كل الطلبات بـ Authorization: Bearer <token>):
     GET  /api/user-data?since=<ms>&until=<ms>&offset=<n>&limit=<n>
          → { success, serverTime, total, items:[{k, v, t, d?}] }
     PUT  /api/user-data     body: { items:[{k, v, t, d?}] }
          → { success, serverTime, stale:[k, ...] }
   k = مفتاح ("chat:<id>" للمحادثة، أو اسم المفتاح للباقي)
   v = نص (JSON مُسلسَل)     t = وقت التعديل بالميلي ثانية     d = true للمحذوف
   ========================================================================= */
(function () {
  'use strict';
  if (window.__cloudSyncLoaded) return;
  window.__cloudSyncLoaded = true;

  // ------------------------------------------------------------------ إعدادات
  var CFG = {
    endpoint: '/api/user-data',
    pageSize: 30,            // عدد العناصر في الصفحة الواحدة عند التحميل (السيرفر بيقصّها على ~2.5MB)
    parallel: 4,             // كام صفحة تتحمّل في نفس الوقت
    pushDebounceMs: 1500,    // بنستنى كام ms بعد آخر تغيير قبل الرفع
    maxPushChars: 700000,    // أقصى حجم للدفعة الواحدة عند الرفع (بعيد عن حد 4.5MB بتاع Vercel)
    maxDocChars: 1000000,    // أقصى حجم لمحادثة واحدة (الأقدم بيتشال من نسخة السيرفر بس)
    keepaliveLimit: 60000,   // حد الطلب اللي بيكمّل حتى لو الصفحة اتقفلت
    refreshEveryMs: 15000,   // أقل فاصل بين تحديثين تلقائيين عند الرجوع للتاب
    wipeOnLogout: true       // مسح بيانات الطالب من الجهاز بعد تسجيل الخروج (لو اترفعت كلها)
  };

  // المفاتيح اللي بتتزامن (غير المحادثات اللي بتتزامن كل محادثة لوحدها)
  var KV_KEYS = {
    sx_settings: 1,          // بنشيل منها الثيم والروابط (خاصة بالجهاز)
    sx_stats: 1,             // السلسلة والإحصائيات
    sx_mistakes_bank: 1,     // بنك أخطائي
    sx_study_schedule: 1,    // جدول المذاكرة
    sx_custom_skills: 1,     // المهارات
    sx_drug_library: 1,      // مكتبة الأدوية
    sx_tasbih: 1,
    sx_video_sim_endings: 1, // نهايات محاكاة الفيديو
    sx_duo_tree_v1: 1,       // شجرة التقدّم
    chatx_tool_usage_v1: 1,
    sx_quran_last: 1
  };
  var KV_PREFIXES = ['sx_adhkar_'];
  var UNION_KEYS = { sx_custom_skills: 1, sx_mistakes_bank: 1 }; // لما بنضم بيانات جهاز لحساب
  var META_KEY = 'sx_sync_meta';

  // ------------------------------------------------------------------ حالة
  var S = {
    ready: false,       // مسموح نرفع؟
    applying: false,    // احنا اللي بنكتب في localStorage دلوقتي (متعتبرش تغيير من الطالب)
    startedFor: null,   // التوكن اللي بدأنا عليه
    timer: null,
    pushP: null,
    again: false,
    pulling: null,
    pushFailed: false,
    failCount: 0,
    skew: 0,
    lastPullAt: 0,
    abort: false,
    force: {}
  };
  var meta = freshMeta(null);

  // ------------------------------------------------------------------ أدوات صغيرة
  function freshMeta(owner) { return { v: 1, owner: owner || null, init: false, mode: null, since: 0, kv: {}, chats: {} }; }
  function now() { return Date.now() + S.skew; }
  function hash(s) {
    var h1 = 5381, h2 = 52711, i = s.length;
    while (i) { var c = s.charCodeAt(--i); h1 = (h1 * 33) ^ c; h2 = (h2 * 33) ^ c; }
    return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + s.length.toString(36);
  }
  function safeStringify(o) { try { return JSON.stringify(o); } catch (e) { return ''; } }
  function parse(s, fallback) { try { var v = JSON.parse(s); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function tok() { try { return schoolToken || null; } catch (e) { return null; } }
  function usr() { try { return schoolUser || null; } catch (e) { return null; } }
  function base() { try { return FIXED_SCHOOL_API_URL; } catch (e) { return ''; } }
  function ownerOf(u) { return u && u.username ? String(u.username).toLowerCase() : null; }
  function isKvKey(k) {
    if (!k) return false;
    if (KV_KEYS[k]) return true;
    for (var i = 0; i < KV_PREFIXES.length; i++) if (k.indexOf(KV_PREFIXES[i]) === 0) return true;
    return false;
  }
  function isSynced(k) { return k === 'sx_chats' || isKvKey(k); }
  function callFn(name) {
    try { var f = window[name]; if (typeof f === 'function') return f.apply(window, Array.prototype.slice.call(arguments, 1)); } catch (e) {}
  }
  function loadMeta() {
    var m = parse(localStorage.getItem(META_KEY), null);
    return (m && m.v === 1) ? m : freshMeta(null);
  }
  function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {} }

  // الوصول للمتغيرات العامة اللي في script.js (كلها let على مستوى الصفحة)
  var MEM = {
    chats: function () { try { return Array.isArray(chats) ? chats : []; } catch (e) { return []; } },
    currentId: function () { try { return currentChatId; } catch (e) { return null; } },
    setCurrentId: function (v) { try { currentChatId = v; } catch (e) {} },
    generating: function () { try { return !!isGenerating; } catch (e) { return false; } }
  };
  function chatTs(c) {
    var m = c && c.messages && c.messages.length ? c.messages[c.messages.length - 1] : null;
    return (m && m.timestamp) || (c && c.timestamp) || 0;
  }

  // ------------------------------------------------------------------ الواجهة (شاشة تحميل + شريط حالة)
  var UI = (function () {
    var els = null, hideT = null, loading = false;
    var ICONS = { loading: 'fa-cloud-arrow-down', ok: 'fa-circle-check', err: 'fa-triangle-exclamation', save: 'fa-cloud-arrow-up' };
    var CSS = '' +
      '#cxSyncOverlay{position:fixed;inset:0;z-index:99990;display:none;align-items:center;justify-content:center;background:var(--bg-glass-heavy,rgba(10,14,26,.96));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);direction:rtl;font-family:var(--font,inherit)}' +
      '#cxSyncOverlay.cx-on{display:flex}' +
      '#cxSyncOverlay .cx-card{width:min(86vw,340px);text-align:center;color:var(--text-1,#f1f5f9)}' +
      '#cxSyncOverlay .cx-spin{width:46px;height:46px;margin:0 auto 18px;border-radius:50%;border:4px solid var(--border,rgba(255,255,255,.12));border-top-color:var(--accent,#6366f1);animation:cxspin .8s linear infinite}' +
      '#cxSyncOverlay .cx-title{font-size:17px;font-weight:800;margin-bottom:6px}' +
      '#cxSyncOverlay .cx-sub{font-size:12.5px;color:var(--text-2,#94a3b8);min-height:18px;margin-bottom:16px}' +
      '#cxSyncOverlay .cx-bar{height:6px;border-radius:99px;background:var(--border,rgba(255,255,255,.1));overflow:hidden}' +
      '#cxSyncOverlay .cx-bar i{display:block;height:100%;width:8%;border-radius:99px;background:var(--grad-bold,linear-gradient(90deg,#6366f1,#ec4899));transition:width .25s ease}' +
      '#cxSyncOverlay .cx-bar.cx-indet i{width:35%;animation:cxindet 1.1s ease-in-out infinite alternate}' +
      '#cxSyncPill{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);left:50%;z-index:99991;display:flex;align-items:center;gap:8px;max-width:90vw;padding:8px 15px;border-radius:999px;background:var(--bg-2,#131827);color:var(--text-1,#f1f5f9);border:1px solid var(--border,rgba(255,255,255,.1));box-shadow:0 8px 28px rgba(0,0,0,.35);font-size:12.5px;font-weight:700;direction:rtl;font-family:var(--font,inherit);transform:translate(-50%,-160%);opacity:0;pointer-events:none;transition:transform .35s cubic-bezier(.2,.9,.3,1.1),opacity .25s ease}' +
      '#cxSyncPill.cx-show{transform:translate(-50%,0);opacity:1;pointer-events:auto}' +
      '#cxSyncPill.cx-loading i{color:var(--accent,#6366f1);animation:cxpulse 1.1s ease-in-out infinite}' +
      '#cxSyncPill.cx-ok i{color:var(--success,#10b981)}' +
      '#cxSyncPill.cx-err{cursor:pointer;border-color:var(--danger,#ef4444)}#cxSyncPill.cx-err i{color:var(--danger,#ef4444)}' +
      '@keyframes cxspin{to{transform:rotate(360deg)}}' +
      '@keyframes cxpulse{50%{opacity:.35}}' +
      '@keyframes cxindet{from{margin-inline-start:0}to{margin-inline-start:65%}}';

    function ensure() {
      if (els) return els;
      var st = document.createElement('style');
      st.id = 'cxSyncStyle';
      st.textContent = CSS;
      document.head.appendChild(st);
      var ov = document.createElement('div');
      ov.id = 'cxSyncOverlay';
      ov.setAttribute('role', 'status');
      ov.setAttribute('aria-live', 'polite');
      ov.innerHTML = '<div class="cx-card"><div class="cx-spin"></div><div class="cx-title"></div><div class="cx-sub"></div><div class="cx-bar cx-indet"><i></i></div></div>';
      var pill = document.createElement('div');
      pill.id = 'cxSyncPill';
      pill.setAttribute('role', 'status');
      pill.setAttribute('aria-live', 'polite');
      pill.innerHTML = '<i class="fas"></i><span></span>';
      document.body.appendChild(ov);
      document.body.appendChild(pill);
      els = {
        ov: ov, pill: pill,
        title: ov.querySelector('.cx-title'), sub: ov.querySelector('.cx-sub'),
        bar: ov.querySelector('.cx-bar'), barFill: ov.querySelector('.cx-bar i'),
        pillIcon: pill.querySelector('i'), pillText: pill.querySelector('span')
      };
      pill.addEventListener('click', function () { if (pill._click) pill._click(); });
      return els;
    }
    return {
      overlay: function (on, title, sub) {
        var e = ensure();
        if (!on) { e.ov.classList.remove('cx-on'); return; }
        e.title.textContent = title || 'جارٍ تحميل بياناتك…';
        e.sub.textContent = sub || 'محادثاتك ومهاراتك وتقدّمك من حسابك';
        e.bar.classList.add('cx-indet');
        e.barFill.style.width = '';
        e.ov.classList.add('cx-on');
      },
      pill: function (kind, text, onClick) {
        var e = ensure();
        clearTimeout(hideT);
        loading = (kind === 'loading');
        e.pill.className = 'cx-show cx-' + kind;
        e.pillIcon.className = 'fas ' + (ICONS[kind] || ICONS.ok);
        e.pillText.textContent = text;
        e.pill._click = onClick || null;
        if (kind === 'ok') hideT = setTimeout(function () { e.pill.classList.remove('cx-show'); }, 2600);
      },
      hidePill: function () { if (els) { clearTimeout(hideT); els.pill.classList.remove('cx-show'); loading = false; } },
      progress: function (loaded, total) {
        var e = ensure();
        var pct = total ? Math.max(6, Math.min(100, Math.round(loaded / total * 100))) : 0;
        if (e.ov.classList.contains('cx-on')) {
          if (total) { e.bar.classList.remove('cx-indet'); e.barFill.style.width = pct + '%'; e.sub.textContent = loaded + ' / ' + total; }
        }
        if (loading && total) e.pillText.textContent = 'جارٍ تحميل بياناتك… ' + Math.min(loaded, total) + ' / ' + total;
      }
    };
  })();

  // ------------------------------------------------------------------ الشبكة
  function api(method, query, body, o) {
    var t = tok();
    if (!t) return Promise.reject({ status: 401, noToken: true });
    var init = { method: method, headers: { 'Authorization': 'Bearer ' + t }, cache: 'no-store' };
    if (body) {
      var s = JSON.stringify(body);
      init.headers['Content-Type'] = 'application/json';
      init.body = s;
      if (o && o.keepalive && s.length < CFG.keepaliveLimit) init.keepalive = true;
    }
    return fetch(base() + CFG.endpoint + (query || ''), init).then(function (r) {
      if (r.status === 401) throw { status: 401 };
      return r.json().then(function (j) {
        if (!r.ok || !j || j.success === false) throw { status: r.status, message: j && j.error };
        return j;
      }, function () { throw { status: r.status }; });
    });
  }
  function syncClock(serverTime) { if (typeof serverTime === 'number') S.skew = serverTime - Date.now(); }

  // ------------------------------------------------------------------ تجميع التغييرات (الرفع)
  function serializeKv(k, raw) {
    if (k === 'sx_settings') {
      var o = parse(raw, null);
      if (o && typeof o === 'object') { delete o.backendUrl; delete o.schoolApiUrl; delete o.theme; return JSON.stringify(o); }
    }
    return raw;
  }
  function listKvKeys() {
    var out = [], i, k;
    for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (isKvKey(k)) out.push(k); }
    return out;
  }
  // بيشيل أي نص ضخم (صورة/صوت base64) من كائن — النص العادي بيفضل زي ما هو
  var HEAVY = 20000;
  function stripHeavy(v) {
    if (typeof v === 'string') return v.length > HEAVY ? '' : v;
    if (Array.isArray(v)) return v.map(stripHeavy);
    if (v && typeof v === 'object') { var o = {}; for (var p in v) o[p] = stripHeavy(v[p]); return o; }
    return v;
  }
  // المحادثة الكبيرة جدًا: نسخة السيرفر بتشيل صور الرسايل القديمة الأول (النص كله بيفضل)،
  // ولو لسه كبيرة بنشيل أقدم الرسايل. نسخة الجهاز بتفضل كاملة.
  function trimChatJson(c) {
    var budget = CFG.maxDocChars * 0.9;
    var msgs = c.messages.slice(), sizes = msgs.map(function (m) { return safeStringify(m).length; });
    var total = sizes.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; i < msgs.length && total > budget; i++) {
      if (sizes[i] <= HEAVY) continue;
      var lighter = stripHeavy(msgs[i]); lighter.syncStripped = true;
      var n = safeStringify(lighter).length;
      total -= (sizes[i] - n); sizes[i] = n; msgs[i] = lighter;
    }
    var start = 0;
    while (start < msgs.length - 1 && total > budget) { total -= sizes[start]; start++; }
    var copy = {}; for (var p in c) copy[p] = c[p];
    copy.messages = msgs.slice(start); copy.syncTruncated = true;
    return JSON.stringify(copy);
  }
  // بيقارن الحالة الحالية على الجهاز بآخر حالة اتزامنت (meta) ويرجّع اللي اتغيّر بس
  function collectChanges() {
    var out = [], T = now(), seen = {}, i;
    listKvKeys().forEach(function (k) {
      var raw = localStorage.getItem(k);
      if (raw == null) return;
      var v = serializeKv(k, raw), h = hash(v), m = meta.kv[k];
      seen[k] = 1;
      if (!m || m.h !== h) out.push({ k: k, v: v, t: T, h: h });
    });
    Object.keys(meta.kv).forEach(function (k) {
      if (!seen[k] && localStorage.getItem(k) == null) out.push({ k: k, d: true, t: T, h: '' });
    });
    var list = MEM.chats(), seenChat = {};
    for (i = 0; i < list.length; i++) {
      var c = list[i];
      if (!c || !c.id || !c.messages || !c.messages.length) continue; // المحادثة الفاضية مش بتتزامن
      seenChat[c.id] = 1;
      var json = safeStringify(c);
      if (!json) continue;
      var ch = hash(json), cm = meta.chats[c.id];
      if (!cm || cm.h !== ch) {
        var sent = json.length > CFG.maxDocChars ? trimChatJson(c) : json;
        out.push({ k: 'chat:' + c.id, v: sent, t: T, h: ch, rh: sent === json ? ch : hash(sent) });
      }
    }
    Object.keys(meta.chats).forEach(function (id) {
      if (!seenChat[id]) out.push({ k: 'chat:' + id, d: true, t: T, h: '' });
    });
    return out;
  }
  function batchItems(items) {
    var batches = [], cur = [], size = 0;
    items.forEach(function (it) {
      var n = (it.v ? it.v.length : 0) + it.k.length + 40;
      if (cur.length && size + n > CFG.maxPushChars) { batches.push(cur); cur = []; size = 0; }
      cur.push(it); size += n;
    });
    if (cur.length) batches.push(cur);
    return batches;
  }
  function markSynced(it) {
    if (it.k.indexOf('chat:') === 0) {
      var id = it.k.slice(5);
      if (it.d) delete meta.chats[id]; else meta.chats[id] = { h: it.h, t: it.t, rh: it.rh || it.h };
    } else {
      if (it.d) delete meta.kv[it.k]; else meta.kv[it.k] = { h: it.h, t: it.t };
    }
  }

  async function doPush(o) {
    var changes = collectChanges();
    if (!changes.length) { S.pushFailed = false; return; }
    var needPull = false;
    try {
      var batches = batchItems(changes);
      for (var b = 0; b < batches.length; b++) {
        var batch = batches[b];
        var res = await api('PUT', '', { items: batch.map(function (it) { return it.d ? { k: it.k, d: true, t: it.t } : { k: it.k, v: it.v, t: it.t }; }) }, o);
        syncClock(res.serverTime);
        var stale = {};
        (res.stale || []).forEach(function (k) { stale[k] = 1; });
        batch.forEach(function (it) {
          if (stale[it.k]) { S.force[it.k] = true; needPull = true; }
          else markSynced(it);
        });
        saveMeta();
      }
      S.pushFailed = false; S.failCount = 0;
      if (S.failed) { S.failed = false; UI.hidePill(); }
    } catch (e) {
      S.pushFailed = true;
      if (e && e.status === 401) return;           // الجلسة خلصت — الكود الأصلي هيتصرف
      S.failCount++;
      if (S.failCount >= 2) { S.failed = true; UI.pill('err', 'تعذّر حفظ بياناتك — هنعيد المحاولة', function () { syncNow(); }); }
      var wait = Math.min(120000, 4000 * Math.pow(3, Math.min(S.failCount - 1, 3)));
      schedule(wait);
    }
    if (needPull) { try { await pull({ full: false, quiet: true }); } catch (e2) {} schedule(); }
  }
  function pushChanges(o) {
    if (!S.ready || !tok()) return Promise.resolve();
    if (S.pushP) { S.again = true; return S.pushP; }
    S.pushP = doPush(o || {}).then(function () { S.pushP = null; if (S.again) { S.again = false; schedule(); } },
                                  function () { S.pushP = null; });
    return S.pushP;
  }
  function schedule(delay) {
    if (!S.ready) return;
    clearTimeout(S.timer);
    S.timer = setTimeout(function () { pushChanges(); }, typeof delay === 'number' ? delay : CFG.pushDebounceMs);
  }
  function flushNow() {
    clearTimeout(S.timer);
    return (S.pushP || Promise.resolve()).then(function () { return pushChanges({}); }).then(function () { return !S.pushFailed; });
  }

  // ------------------------------------------------------------------ تطبيق اللي جاي من السيرفر
  function indexOfChat(list, id) { for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return i; return -1; }

  // بترجّع true لو غيّرت حاجة فعلًا على الجهاز
  function applyChatItem(it, ctx) {
    var id = it.k.slice(5), list = MEM.chats(), idx = indexOfChat(list, id);
    var local = idx >= 0 ? list[idx] : null, m = meta.chats[id], cur = MEM.currentId();
    var busy = !!local && id === cur && MEM.generating();
    if (it.d) {
      if (!local) { delete meta.chats[id]; return false; }
      if (busy) return false;
      var lh0 = hash(safeStringify(local)), dirty0 = !m || lh0 !== m.h;
      if (dirty0 && !S.force[it.k] && !(it.t > chatTs(local))) return false;
      list.splice(idx, 1); delete meta.chats[id];
      ctx.chats = true; if (id === cur) ctx.current = true;
      return true;
    }
    var rh = hash(it.v);
    if (m && (m.h === rh || m.rh === rh) && m.t >= it.t) return false;        // صدى رفعنا إحنا — مفيش جديد
    if (local) {
      var lh = hash(safeStringify(local));
      if (lh === rh) { meta.chats[id] = { h: rh, t: it.t }; return false; }   // نفس المحتوى
      var dirty = !m || lh !== m.h;
      if (dirty && !S.force[it.k] && !(it.t > chatTs(local))) return false;    // نسخة الجهاز أحدث — هترفع
      if (busy) return false;                                                  // الرد شغال دلوقتي، هنحدّثها المرة الجاية
    }
    var obj = parse(it.v, null);
    if (!obj || obj.id !== id || !Array.isArray(obj.messages)) return false;
    if (idx >= 0) list[idx] = obj; else list.push(obj);
    meta.chats[id] = { h: rh, t: it.t };
    ctx.chats = true; if (id === cur) ctx.current = true;
    return true;
  }

  function unionJson(remoteStr, localStr) {
    var r = parse(remoteStr, null), l = parse(localStr, null);
    if (!Array.isArray(r) || !Array.isArray(l)) return null;
    var keyOf = function (x) { return (x && x.id != null) ? 'i' + x.id : 'j' + safeStringify(x); };
    var seen = {}; r.forEach(function (x) { seen[keyOf(x)] = 1; });
    var out = r.slice();
    l.forEach(function (x) { if (!seen[keyOf(x)]) out.push(x); });
    return JSON.stringify(out);
  }

  function memReload(k, ctx) {
    var raw = localStorage.getItem(k);
    try {
      if (k === 'sx_stats') { stats = parse(raw, stats); callFn('renderStats'); }
      else if (k === 'sx_mistakes_bank') { mistakesBank = parse(raw, []); callFn('updateMistakesBankBadge'); }
      else if (k === 'sx_study_schedule') { studySchedule = parse(raw, []); callFn('renderStudySchedule'); }
      else if (k === 'sx_drug_library') { drugLibrary = parse(raw, []); }
      else if (k === 'sx_tasbih') { tasbihState = parse(raw, {}); }
      else if (k === 'sx_settings') { ctx.settings = true; }
    } catch (e) {}
  }

  function applyKvItem(it, ctx, opts) {
    var k = it.k, m = meta.kv[k];
    if (m && it.t <= m.t && !S.force[k]) return false;
    S.applying = true;
    try {
      if (it.d) {
        var existed = localStorage.getItem(k) != null;
        localStorage.removeItem(k); delete meta.kv[k];
        if (k !== 'sx_settings') memReload(k, ctx);
        return existed;
      }
      var lraw = localStorage.getItem(k);
      if (k === 'sx_settings') {
        var remote = parse(it.v, {});
        var keep = { backendUrl: settings.backendUrl, schoolApiUrl: base(), theme: settings.theme };
        settings = Object.assign({}, settings, remote, keep);
        localStorage.setItem(k, JSON.stringify(settings));
        ctx.settings = true;
      } else {
        var value = it.v;
        if (opts.adopt && lraw != null && UNION_KEYS[k]) { var u = unionJson(it.v, lraw); if (u != null) value = u; }
        if (lraw === value) { meta.kv[k] = { h: hash(serializeKv(k, it.v)), t: it.t }; return false; }
        localStorage.setItem(k, value);
        memReload(k, ctx);
      }
      meta.kv[k] = { h: hash(serializeKv(k, it.v)), t: it.t };
      return true;
    } finally { S.applying = false; }
  }

  var persistT = null;
  function persistChats(now_) {
    var run = function () {
      persistT = null;
      S.applying = true;
      try { localStorage.setItem('sx_chats', JSON.stringify(MEM.chats())); } catch (e) {}
      finally { S.applying = false; }
    };
    if (now_) { clearTimeout(persistT); run(); } else if (!persistT) persistT = setTimeout(run, 250);
  }

  function finalizePage(ctx, opts) {
    var list = MEM.chats(), cur = MEM.currentId();
    if (ctx.chats) {
      list.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
      if (opts.initial) {
        // المحادثة الفاضية اللي التطبيق بيفتحها لوحده متلزمش تفضل لو عندنا محادثات حقيقية
        for (var i = list.length - 1; i >= 0; i--) {
          if (list.length > 1 && (!list[i].messages || !list[i].messages.length)) { list.splice(i, 1); }
        }
      }
      persistChats();
    }
    if (ctx.chats || ctx.current) {
      if (list.length && indexOfChat(list, cur) < 0) {
        MEM.setCurrentId(list[0].id); ctx.current = true;
        S.applying = true; try { localStorage.setItem('sx_current_chat', list[0].id); } catch (e) {} finally { S.applying = false; }
      }
      callFn('renderChatList');
      if (ctx.current && !MEM.generating() && MEM.currentId()) callFn('renderChat', MEM.currentId());
    }
    if (ctx.settings) {
      try {
        callFn('applyTheme', settings.theme);
        var sel = document.getElementById('modelSelect'); if (sel && settings.model) sel.value = settings.model;
        callFn('applyDeepThinkBtnState');
      } catch (e) {}
    }
  }

  function applyPage(items, opts) {
    var ctx = { chats: false, current: false, settings: false };
    var n = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || typeof it.k !== 'string') continue;
      try {
        if (!it.d && typeof it.v !== 'string') it.v = safeStringify(it.v);
        var changed = false;
        if (it.k.indexOf('chat:') === 0) changed = applyChatItem(it, ctx);
        else if (isKvKey(it.k)) changed = applyKvItem(it, ctx, opts);
        if (changed) n++;
      } catch (e) { /* عنصر واحد بايظ ميوقفش الباقي */ }
      delete S.force[it.k];
    }
    finalizePage(ctx, opts);
    return n;
  }

  // ------------------------------------------------------------------ السحب (التحميل)
  function pull(opts) {
    opts = opts || {};
    if (S.pulling) return S.pulling;
    S.pulling = (async function () {
      var since = opts.full ? 0 : (meta.since || 0), lim = CFG.pageSize, applied = 0;
      var first = await api('GET', '?since=' + since + '&offset=0&limit=' + lim);
      syncClock(first.serverTime);
      var until = first.serverTime, total = first.total || 0, items = first.items || [], loaded = items.length;
      applied += applyPage(items, opts);
      UI.progress(loaded, total);
      if (opts.onFirstPage) opts.onFirstPage(total, loaded);

      var queue = [], next = items.length;
      while (next < total) { queue.push(next); next += lim; }
      var active = 0, err = null;
      await new Promise(function (resolve) {
        function spawn() {
          if (S.abort) { queue.length = 0; }
          while (active < CFG.parallel && queue.length && !err) {
            (function (off) {
              active++;
              api('GET', '?since=' + since + '&until=' + until + '&offset=' + off + '&limit=' + lim).then(function (r) {
                var its = r.items || [];
                applied += applyPage(its, opts);
                loaded += its.length;
                UI.progress(loaded, total);
                // السيرفر قصّ الصفحة بسبب الحجم → نكمّل من آخر عنصر وصلنا
                if (its.length && its.length < lim && off + its.length < total) queue.push(off + its.length);
              }).catch(function (e) { err = err || e; queue.length = 0; })
                .then(function () { active--; spawn(); });
            })(queue.shift());
          }
          if (!active && (!queue.length || err)) resolve();
        }
        spawn();
      });
      if (err) throw err;
      if (persistT) persistChats(true);
      if (!S.abort) { meta.since = until; saveMeta(); }
      S.lastPullAt = Date.now();
      return applied;
    })().then(function (n) { S.pulling = null; return n; }, function (e) { S.pulling = null; throw e; });
    return S.pulling;
  }

  // ------------------------------------------------------------------ ربط الحساب / بدء المزامنة
  function hasLocalData() {
    var list = MEM.chats(), i;
    for (i = 0; i < list.length; i++) if (list[i] && list[i].messages && list[i].messages.length) return true;
    return ['sx_custom_skills', 'sx_mistakes_bank', 'sx_study_schedule'].some(function (k) {
      var a = parse(localStorage.getItem(k), []);
      return Array.isArray(a) && a.length > 0;
    });
  }
  function wipeLocalData() {
    S.applying = true;
    try {
      var rm = [], i, k;
      for (i = 0; i < localStorage.length; i++) {
        k = localStorage.key(i);
        if ((isKvKey(k) && k !== 'sx_settings') || k === 'sx_chats' || k === 'sx_current_chat') rm.push(k);
      }
      rm.forEach(function (x) { localStorage.removeItem(x); });
    } finally { S.applying = false; }
    try {
      chats = []; currentChatId = null;
      stats = { streak: 0, lastActiveDay: null, todayCount: 0 };
      mistakesBank = []; studySchedule = []; drugLibrary = []; tasbihState = {};
    } catch (e) {}
    meta = freshMeta(null);
    saveMeta();
  }
  function confirmAdopt() {
    try {
      return window.confirm('لقينا بيانات (محادثات / مهارات) محفوظة على الجهاز ده من قبل ما تربط حسابك.\n\n' +
        'موافق  ←  تتضاف لحسابك وتتحفظ على السيرفر.\n' +
        'إلغاء  ←  هتتمسح من الجهاز ده (هننزّل لك نسخة احتياطية الأول)، وتحمّل بيانات حسابك بس.');
    } catch (e) { return true; }
  }

  function start() {
    var token = tok(), owner = ownerOf(usr());
    if (!token || !owner || S.startedFor === token) return;
    meta = loadMeta();
    var mode;
    if (meta.owner === owner) mode = meta.init ? 'resume' : (meta.mode || 'fresh'); // لو أول تحميل اتقطع بنكمّله بنفس الوضع
    else if (meta.owner) { wipeLocalData(); mode = 'fresh'; }        // بيانات طالب تاني على نفس الجهاز
    else if (hasLocalData()) {                                        // بيانات قبل الربط (ضيف / نسخة قديمة)
      if (document.readyState !== 'complete') {                       // منعرضش confirm والصفحة لسه بتتحمل
        window.addEventListener('load', function () { setTimeout(start, 400); }, { once: true });
        return;
      }
      if (confirmAdopt()) mode = 'adopt';
      else { try { callFn('exportAllData'); } catch (e) {} wipeLocalData(); mode = 'fresh'; }
    } else mode = 'fresh';
    S.startedFor = token; S.abort = false;
    meta.owner = owner;
    if (mode !== 'resume') { meta.init = false; meta.mode = mode; }
    saveMeta();
    run(mode);
  }

  async function run(mode) {
    S.ready = (mode === 'resume');           // في وضع الاستكمال بنسمح بالرفع فورًا
    if (mode === 'fresh' && !hasLocalData()) UI.overlay(true);
    try {
      var n = await pull({
        full: mode !== 'resume', initial: mode !== 'resume', adopt: mode === 'adopt',
        onFirstPage: function (total, loaded) {
          UI.overlay(false);
          if (mode !== 'resume' && total > loaded) UI.pill('loading', 'جارٍ تحميل بياناتك… ' + loaded + ' / ' + total);
        }
      });
      S.ready = true;
      if (mode !== 'resume') { meta.init = true; saveMeta(); }
      if (mode !== 'resume') UI.pill('ok', n > 0 ? 'تم تحميل بياناتك ✓' : 'حسابك جاهز ✓');
      else if (n > 0) UI.pill('ok', 'اتحدّثت بياناتك من حسابك ✓');
      else UI.hidePill();
    } catch (e) {
      UI.overlay(false);
      if (e && e.status === 401) { UI.hidePill(); S.startedFor = null; return; }
      if (mode === 'resume') S.ready = true;
      else UI.pill('err', 'تعذّر تحميل بياناتك — اضغط للمحاولة تاني', function () { S.startedFor = null; start(); });
      if (mode === 'resume') UI.hidePill();
    }
    schedule(200);
  }

  // ------------------------------------------------------------------ تسجيل الخروج
  function afterLogoutWipe() { setTimeout(function () { try { location.reload(); } catch (e) {} }, 650); }
  function hookLogout() {
    var orig = window.schoolLogout;
    if (typeof orig !== 'function') return;
    window.schoolLogout = function () {
      var self = this, args = arguments;
      var linked = !!tok() && S.ready && S.startedFor;
      if (!linked || !CFG.wipeOnLogout) {
        S.abort = true; S.ready = false; S.startedFor = null;
        return orig.apply(self, args);
      }
      var pending = collectChanges().length;
      var finish = function (ok) {
        S.ready = false; S.startedFor = null; clearTimeout(S.timer);
        var clean = ok && collectChanges().length === 0;
        if (clean) wipeLocalData();
        var r = orig.apply(self, args);
        if (clean) afterLogoutWipe();
        else { try { showToast('في تغييرات لسه ما اترفعتش — سبناها على الجهاز لحد ما ترجع تدخل', 'error'); } catch (e) {} }
        return r;
      };
      if (!pending) { finish(true); return; }
      UI.overlay(true, 'جارٍ حفظ بياناتك…', 'ثواني وهنسجّل خروجك');
      flushNow().then(function (ok) { UI.overlay(false); finish(ok); }, function () { UI.overlay(false); finish(false); });
    };
  }
  function hookLogin() {
    var origHb = window.startSchoolHeartbeat;
    if (typeof origHb === 'function') {
      window.startSchoolHeartbeat = function () {
        var r = origHb.apply(this, arguments);
        setTimeout(start, 0);           // أسرع نقطة ممكنة بعد نجاح تسجيل الدخول
        return r;
      };
    }
    var origLogin = window.schoolLogin;
    if (typeof origLogin === 'function') {
      window.schoolLogin = async function () {
        var r = await origLogin.apply(this, arguments);
        start();                        // احتياطي لو النقطة اللي فوق ما اتنادتش
        return r;
      };
    }
  }

  // ------------------------------------------------------------------ اعتراض الكتابة في localStorage
  function hookStorage() {
    var origSet = Storage.prototype.setItem, origRem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k) {
      var r = origSet.apply(this, arguments);
      if (!S.applying && S.ready && this === window.localStorage && isSynced(k)) schedule();
      return r;
    };
    Storage.prototype.removeItem = function (k) {
      var r = origRem.apply(this, arguments);
      if (!S.applying && S.ready && this === window.localStorage && isSynced(k)) schedule();
      return r;
    };
  }

  function refreshIfStale(force) {
    if (!S.ready || !tok() || S.pulling) return;
    if (!force && Date.now() - S.lastPullAt < CFG.refreshEveryMs) return;
    pull({ full: false, quiet: true }).catch(function () {});
  }
  function flushOnHide() {
    if (S.ready && tok() && !S.pushP) { clearTimeout(S.timer); pushChanges({ keepalive: true }); }
  }
  function syncNow() { return flushNow().then(function () { return pull({ full: false }); }); }

  // ------------------------------------------------------------------ تشغيل
  hookStorage();
  hookLogin();
  hookLogout();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushOnHide(); else refreshIfStale(false);
  });
  window.addEventListener('pagehide', flushOnHide);
  window.addEventListener('online', function () { schedule(300); refreshIfStale(true); });

  window.CloudSync = {
    syncNow: syncNow,
    pull: pull,
    push: flushNow,
    status: function () { return { ready: S.ready, owner: meta.owner, since: meta.since, pendingChanges: collectChanges().length }; }
  };

  // بيانات طالب تاني على الجهاز لازم تتمسح قبل ما الصفحة تترسم (قبل window.onload)
  // أما الباقي (استكمال / ضم بيانات ضيف) فبيبدأ بعد الرسم.
  start();
})();
