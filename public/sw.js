// Lucky Nexus - Service Worker
// Caches everything for full offline use

const CACHE_NAME = 'lucky-nexus-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './assets/index-BfLTwKyq.js',
        './assets/index-2PY9t1zB.css',
        './data/lotto_data.json',
        './data/plus1_data.json',
        './data/plus2_data.json',
        './data/powerball_data.json',
        './icon-192.png',
        './icon-512.png',
        './logo.png',
        './noise-texture.jpg'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
