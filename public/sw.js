const CACHE = 'read-ipynb-v1';

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.json']))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets: cache-first (they have content hashes, safe to cache forever)
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(CACHE).then((c) => c.put(request, res.clone()));
            return res;
          })
      )
    );
  } else if (request.mode === 'navigate') {
    // Navigation: network-first, fall back to cached '/'
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
  }
});
