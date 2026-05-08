var CACHE_NAME = 'ganadero-v9';

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll([
                './',
                './index.html',
                './styles.css',
                './app.js',
                './manifest.json'
            ]).catch(function() {});
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(k) {
                if (k !== CACHE_NAME) return caches.delete(k);
            }));
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) return cached;

            return fetch(e.request).then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                // Si falla la red, devolver index.html para navegación
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', {status: 200});
            });
        })
    );
});
