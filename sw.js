// لازم يتحط في جذر الموقع (نفس مكان sw.js): /firebase-messaging-sw.js
// بيستقبل الإشعارات وقت ما الموقع مقفول أو التاب مش فاتح.
// ⚠️ حط نفس بيانات FIREBASE_CONFIG اللي حطيتها في chat-x-7.html هنا كمان (لازم تتطابق).

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

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Chat X';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/favicon-32.png'
  };
  self.registration.showNotification(title, options);
});
