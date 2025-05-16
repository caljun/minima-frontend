const CACHE_NAME = 'minima-cache-v2';

const urlsToCache = [
  '/index.html',
  '/login.html',
  '/register.html',
  '/home.html',
  '/post.html',
  '/post_detail.html',
  '/post_edit.html',
  '/notification.html',
  '/profile.html',
  '/search.html',
  '/cancel.html',
  '/success.html',

  // CSS
  '/css/cancel.css',
  '/css/home.css',
  '/css/index.css',
  '/css/login.css',
  '/css/notification.css',
  '/css/post.css',
  '/css/post_detail.css',
  '/css/profile.css',
  '/css/register.css',
  '/css/search.css',
  '/css/success.css',

  // JS
  '/scripts/auth.js',
  '/scripts/home.js',
  '/scripts/notification.js',
  '/scripts/post.js',
  '/scripts/post_detail.js',
  '/scripts/post_edit.js',
  '/scripts/profile.js',
  '/scripts/search.js',
  '/scripts/success.js',

  // PWA関連
  '/manifest.json',
  '/icons/minima-icon-192.png',
  '/icons/minima-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});
