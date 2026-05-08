var CACHE_NAME = 'ganadero-v14';

// Solo archivos locales - los CDN se cachean automáticamente al usarlos
var urlsLocales = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsLocales);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            // Si está en caché, devolverlo
            if (cached) return cached;
            
            // Si no, ir a la red
            return fetch(e.request).then(function(response) {
                // Guardar en caché para la próxima
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                // Si falla la red y es navegación, devolver index.html
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', {status: 200});
            });
        })
    );
});
