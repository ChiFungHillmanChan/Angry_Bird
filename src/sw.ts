const CACHE_VERSION = 'v0.1.0';
const STATIC_CACHE = `sc-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `sc-dyn-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => (self as ServiceWorkerGlobalScope).skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, DYNAMIC_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => (self as ServiceWorkerGlobalScope).clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request;
  const url = new URL(req.url);
  // Cache-first for static assets
  if (url.origin === location.origin && (url.pathname.startsWith('/assets') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg'))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
        return res;
      }))
    );
    return;
  }
  // Network-first for level JSON
  if (url.pathname.includes('/levels/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
});

// Notify clients when a new SW is installed
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data === 'SKIP_WAITING') {
    (self as ServiceWorkerGlobalScope).skipWaiting();
  }
});


