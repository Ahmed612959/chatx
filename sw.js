// Service Worker لـ School X PRO
// 1) تخزين هيكل الصفحة الأساسي (App Shell) عشان الموقع يفتح حتى لو النت بطيء/مقطوع
// 2) استقبال إشعارات البوش (Firebase Cloud Messaging) وقت ما التاب مقفول
// ⚠️ الاتنين لازم يكونوا في نفس الملف ده — مينفعش يتسجلوا كـ Service Workers منفصلة
// على نفس الـ scope، لأن المتصفح بيدّي التحكم لواحد بس.

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

// ====================== Firebase Cloud Messaging (إشعارات البوش) ======================
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCL6EePGDEgk03Il3V8WtngziaqcRhnuIg",
    authDomain: "chat-x-school.firebaseapp.com",
    projectId: "chat-x-school",
    messagingSenderId: "288505551281",
    appId: "1:288505551281:web:a73ef0ca5f91b1b6124590"
});

const messaging = firebase.messaging();

// بيتنفذ لما توصل رسالة/إشعار والتاب مقفول أو في الخلفية
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Chat X';
    const options = {
        body: payload.notification?.body || '',
        icon: '/icons/favicon-32.png'
    };
    self.registration.showNotification(title, options);
});
