#!/usr/bin/env node
/* ============================================================================
   tools/extract-assets.js — استخراج الملفات الثقيلة من النسخة القديمة (مرة واحدة بس)
   ============================================================================
   ليه الأداة دي موجودة؟
   النسخة القديمة كانت حاطة ملفين ثقيلين جوه الكود كنص base64:
     • الخط FodaKufi  (جوه styles.css القديم، أول @font-face)   ← حوالي 40 ألف حرف
     • أيقونة علامة التوثيق الزرقاء (جوه index.html القديم، 3 مرات)
   في النسخة الجديدة الاتنين بقوا ملفات عادية:
     • fonts/FodaKufi-Regular.otf
     • icons/verified-badge.png
   والأداة دي بتسحبهم من ملفاتك القديمة بنفس البايتات بالظبط (من غير ما أعيد كتابتهم
   بإيدي عشان أي حرف غلط في base64 كان هيبوّظ الملف).

   الاستخدام (شغّلها قبل ما تستبدل ملفاتك القديمة):
       node tools/extract-assets.js <مسار index.html القديم> <مسار styles.css القديم>
   مثال:
       node tools/extract-assets.js ../old/index.html ../old/styles.css

   الأداة بتتحقق إن الخط فعلًا OpenType (بيبدأ بـ OTTO) وإن الصورة PNG حقيقية
   قبل ما تكتبهم، ولو لقت ملف موجود بالفعل بتسيبه وتقولك (استخدم --force للاستبدال).
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const force = process.argv.includes('--force');
const [oldHtmlPath, oldCssPath] = args;

if (!oldHtmlPath || !oldCssPath) {
    console.error('الاستخدام: node tools/extract-assets.js <old index.html> <old styles.css> [--force]');
    process.exit(1);
}

const root = path.resolve(__dirname, '..');
let failed = false;

/** بيكتب ملف بعد ما يتأكد إنه مش موجود (إلا مع --force) */
function save(relPath, buffer) {
    const target = path.join(root, relPath);
    if (fs.existsSync(target) && !force) {
        console.log(`⏭  ${relPath} موجود بالفعل — اتسبته (استخدم --force للاستبدال)`);
        return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);
    console.log(`✅ ${relPath}  (${buffer.length} بايت)`);
}

/** بيفك أول data-URI بالنوع المطلوب من نص معيّن ويرجّع Buffer أو null */
function firstDataUri(text, mimeRegex) {
    const re = new RegExp('data:(?:' + mimeRegex + ');base64,([A-Za-z0-9+/=]+)');
    const m = text.match(re);
    return m ? Buffer.from(m[1], 'base64') : null;
}

/* ---------- 1) الخط من styles.css القديم ---------- */
const oldCss = fs.readFileSync(oldCssPath, 'utf8');
const font = firstDataUri(oldCss, 'font/(?:otf|ttf|woff2?)|application/(?:font-\\w+|x-font-\\w+)');
if (!font) {
    console.error('❌ ملقيتش خط base64 في ' + oldCssPath);
    failed = true;
} else if (font.slice(0, 4).toString('latin1') !== 'OTTO') {
    console.error('❌ الخط اللي لقيته مش OpenType/CFF (مفيش OTTO في أول الملف) — اتوقفت عشان ما أكتبش ملف بايظ');
    failed = true;
} else {
    save('fonts/FodaKufi-Regular.otf', font);
}

/* ---------- 2) أيقونة التوثيق من index.html القديم ---------- */
const oldHtml = fs.readFileSync(oldHtmlPath, 'utf8');
const png = firstDataUri(oldHtml, 'image/png');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png) {
    console.error('❌ ملقيتش صورة PNG base64 في ' + oldHtmlPath);
    failed = true;
} else if (!png.slice(0, 8).equals(PNG_SIGNATURE)) {
    console.error('❌ الصورة اللي لقيتها مش PNG سليمة — اتوقفت');
    failed = true;
} else {
    save('icons/verified-badge.png', png);
}

process.exit(failed ? 1 : 0);
