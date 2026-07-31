// Service Worker بسيط لـ School X PRO
// الهدف: تخزين هيكل الصفحة الأساسي (index.html) عشان الموقع يفتح حتى لو النت بطيء/مقطوع،
// ومكانش الهدف تخزين ردود الشات أو بيانات الطالب (دي لازم تكون فريش دايمًا من السيرفر).

const CACHE_NAME = 'schoolx-pro-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // منتحطش في الكاش أبدًا: أي طلب لـ API (شات، تسجيل دخول، بيانات المدرسة، بنك الأسئلة)
    // عشان الطالب يشوف دايمًا بيانات حقيقية وفريش، مش نسخة قديمة مخزنة.
    if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
        return; // سيبها تروح للنت عادي من غير تدخل من الـ service worker
    }

    // Network-first مع fallback للكاش: نحاول النت الأول عشان يكون فريش،
    // ولو النت فشل (أوفلاين) نرجع للنسخة المخزنة كحل احتياطي بس.
    event.respondWith(
        fetch(event.request)
            .then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
                return res;
            })
            .catch(() => caches.match(event.request))
    );
});
