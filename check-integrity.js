#!/usr/bin/env node
/* ============================================================================
   tools/check-integrity.js — فحص إن index.html + styles.css + script.js شغالين مع بعض
   ============================================================================
   بيعمل فحص "ثابت" (من غير ما يشغّل المتصفح) على الملفات الثلاثة ويطبع تقرير:

   ❌ أخطاء (لازم تتصلّح — غالبًا معناها زرار أو ميزة مش هتشتغل):
     1. IDs مكررة في index.html.
     2. دالة بتتنادى من onclick/oninput... في index.html مش معرّفة في script.js.
     3. ملف محلي بيتحمّل من index.html (script/css/img/link) مش موجود.
     4. أقواس {} في styles.css مش متوازنة.
     5. متغير CSS var(--x) مستخدم من غير تعريف ومن غير قيمة احتياطية.

   ⚠️ تحذيرات (راجعها، ممكن تكون سليمة):
     6. id بيتقرا في script.js (getElementById / querySelector('#..')) مش موجود في
        index.html ومش بيتولّد جوه script.js نفسه.
     7. كلاس بيتضاف في script.js بـ classList.add/toggle مفيش له أي قاعدة في styles.css.

   الاستخدام (من فولدر المشروع):
       node tools/check-integrity.js
   أو بمسارات مخصصة:
       node tools/check-integrity.js path/index.html path/styles.css path/script.js

   الخروج: كود 0 لو مفيش أخطاء (❌)، وكود 1 لو فيه. التحذيرات (⚠️) مش بتفشّل الفحص.
   ملحوظة: ده فحص نصّي بيلقط الأخطاء الشائعة، مش بديل عن تجربة الصفحة فعليًا في المتصفح.
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const defaultRoot = path.resolve(__dirname, '..');
const [htmlArg, cssArg, jsArg] = process.argv.slice(2);
const htmlPath = htmlArg ? path.resolve(htmlArg) : path.join(defaultRoot, 'index.html');
const projectRoot = path.dirname(htmlPath);
const cssPath = cssArg ? path.resolve(cssArg) : path.join(projectRoot, 'styles.css');
const jsPath = jsArg ? path.resolve(jsArg) : path.join(projectRoot, 'script.js');

const errors = [];
const warnings = [];

function read(p, label) {
    if (!fs.existsSync(p)) { if (label !== 'script.js') errors.push(`ملف ${label} مش موجود: ${p}`); return ''; }
    return fs.readFileSync(p, 'utf8');
}

const html = read(htmlPath, 'index.html');
const cssRaw = read(cssPath, 'styles.css');
const js = read(jsPath, 'script.js');
const css = cssRaw.replace(/\/\*[\s\S]*?\*\//g, ''); // شيل التعليقات

/* ---------- 1) IDs مكررة في HTML ---------- */
const htmlIds = new Map();
for (const m of html.matchAll(/\sid="([^"]+)"/g)) htmlIds.set(m[1], (htmlIds.get(m[1]) || 0) + 1);
for (const [id, n] of htmlIds) if (n > 1) errors.push(`id مكرر في index.html: "${id}" (${n} مرات)`);

/* ---------- 2) الدوال المستدعاة من HTML لازم تكون معرّفة في script.js ---------- */
const IGNORE = new Set(['if', 'for', 'while', 'switch', 'return', 'function', 'typeof', 'new', 'catch', 'event',
    'this', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Math', 'Date']);
const handlerFns = new Map(); // اسم الدالة → أول مكان
for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/g)) {
    const code = m[1];
    for (const f of code.matchAll(/(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g)) {
        const name = f[2];
        if (!IGNORE.has(name) && !handlerFns.has(name)) handlerFns.set(name, code.slice(0, 50));
    }
}
function isDefinedInJs(name) {
    const n = name.replace(/\$/g, '\\$');
    const patterns = [
        new RegExp(`function\\s*\\*?\\s+${n}\\s*\\(`),                       // function name(
        new RegExp(`(?:window|self|globalThis)\\.${n}\\s*=`),               // window.name =
        new RegExp(`(?:const|let|var)\\s+${n}\\s*=`),                       // const name =
        new RegExp(`window\\[\\s*['"]${n}['"]\\s*\\]\\s*=`),                // window['name'] =
        new RegExp(`(?:^|[\\s;,{])${n}\\s*=\\s*(?:async\\s*)?(?:function|\\()`, 'm') // name = function / name = (
    ];
    return patterns.some(re => re.test(js));
}
if (js) {
    for (const [name, sample] of handlerFns) {
        if (!isDefinedInJs(name)) errors.push(`الدالة ${name}() بتتنادى من index.html (مثال: ${sample}…) ومش معرّفة في script.js`);
    }
}

/* ---------- 3) الملفات المحلية المشار إليها من HTML ---------- */
const refs = new Set();
for (const m of html.matchAll(/\s(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (/^(https?:|data:|mailto:|tel:|javascript:|blob:)/i.test(u)) continue;
    refs.add(u);
}
for (const u of refs) {
    // المسار اللي بيبدأ بـ / بيتدوّر عليه في جذر المشروع وفي فولدر public (شائع مع Vercel)
    const candidates = u.startsWith('/')
        ? [path.join(projectRoot, u), path.join(projectRoot, 'public', u)]
        : [path.join(path.dirname(htmlPath), u)];
    if (candidates.some(f => fs.existsSync(f))) continue;
    const critical = /(^|\/)(script\.js|styles\.css)$/.test(u);
    if (critical) errors.push(`ملف أساسي مش موجود: ${u}`);
    else warnings.push(`ملف مشار إليه مش لاقيه جوار المشروع: ${u} (لو مرفوع على السيرفر من مكان تاني تجاهل التحذير)`);
}
// الخط المشار إليه من CSS
for (const m of cssRaw.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const u = m[1];
    if (/^(https?:|data:|#)/i.test(u)) continue;
    const file = path.join(path.dirname(cssPath), u);
    if (!fs.existsSync(file)) errors.push(`styles.css بيشير لملف مش موجود: ${u}  (شغّل tools/extract-assets.js)`);
}

/* ---------- 4) توازن الأقواس في CSS ---------- */
const open = (css.match(/{/g) || []).length, close = (css.match(/}/g) || []).length;
if (open !== close) errors.push(`أقواس {} في styles.css مش متوازنة: فتح=${open} قفل=${close}`);

/* ---------- 5) متغيرات CSS من غير تعريف ---------- */
const definedVars = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
const jsSetVars = new Set([...js.matchAll(/setProperty\(\s*['"](--[\w-]+)['"]/g)].map(m => m[1])); // بتتحط من JS
const undefinedVars = new Set();
for (const m of (css + html).matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
    if (!m[2] && !definedVars.has(m[1]) && !jsSetVars.has(m[1])) undefinedVars.add(m[1]);
}
for (const v of undefinedVars) errors.push(`متغير CSS مستخدم من غير تعريف ولا قيمة احتياطية: ${v}`);

/* ---------- 6) ids بيقراها script.js ---------- */
if (js) {
    const dynamicIds = new Set();
    for (const m of js.matchAll(/\bid\s*=\s*\\?["']([\w-]+)\\?["']/g)) dynamicIds.add(m[1]);        // id="x" جوه نصوص HTML مولّدة
    for (const m of js.matchAll(/\.id\s*=\s*['"]([\w-]+)['"]/g)) dynamicIds.add(m[1]);              // el.id = 'x'
    const wanted = new Set();
    for (const m of js.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)) wanted.add(m[1]);
    for (const m of js.matchAll(/querySelector(?:All)?\(\s*['"]#([\w-]+)/g)) wanted.add(m[1]);
    for (const id of wanted) {
        if (!htmlIds.has(id) && !dynamicIds.has(id)) warnings.push(`script.js بيدوّر على id="${id}" ومش موجود في index.html (ولا بيتولّد في script.js)`);
    }
}

/* ---------- 7) كلاسات بيضيفها script.js ومفيش لها CSS ---------- */
if (js) {
    const cssClasses = new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(m => m[1]));
    const seen = new Set();
    const intentionalDynamicClasses = new Set(['up','down','clinical','quick','deep','paper','all','mine','newest','views','premium-locked','premium_theme','analyze','generate','video','library']);
    for (const m of js.matchAll(/classList\.(?:add|toggle|replace)\(\s*([^)]*)\)/g)) {
        for (const c of m[1].matchAll(/['"]([A-Za-z_][\w-]*)['"]/g)) {
            const cls = c[1];
            if (!cssClasses.has(cls) && !intentionalDynamicClasses.has(cls) && !seen.has(cls)) { seen.add(cls); warnings.push(`script.js بيضيف الكلاس "${cls}" ومفيش له قاعدة في styles.css`); }
        }
    }
}

/* ---------- التقرير ---------- */
console.log('— فحص التكامل: index.html + styles.css + script.js —');
console.log(`HTML: ${htmlIds.size} id، ${handlerFns.size} دالة بتتنادى من الـ handlers`);
if (!js) console.log('⚠️ script.js مش موجود جنب الملفات — اتخطّيت فحص الدوال والـ ids (ده أهم جزء في الفحص، حطه في الفولدر وشغّل الأداة تاني)');
for (const w of warnings) console.log('⚠️ ' + w);
for (const e of errors) console.log('❌ ' + e);
console.log(errors.length ? `\nالنتيجة: ${errors.length} خطأ، ${warnings.length} تحذير` : `\n✅ مفيش أخطاء (${warnings.length} تحذير)`);
process.exit(errors.length ? 1 : 0);
