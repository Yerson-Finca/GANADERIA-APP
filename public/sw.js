const CACHE_NAME = 'ganadero-elite-v6';
const CORE_FILES = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => n !== CACHE_NAME ? caches.delete(n) : null))).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                fetch(event.request).then((resp) => { if (resp?.status === 200) caches.open(CACHE_NAME).then((c) => c.put(event.request, resp.clone())); }).catch(() => {});
                return cached;
            }
            return fetch(event.request).then((resp) => {
                if (resp?.status === 200) { const clone = resp.clone(); caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)); }
                return resp;
            }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : new Response('Offline', { status: 503 }));
        })
    );
});
