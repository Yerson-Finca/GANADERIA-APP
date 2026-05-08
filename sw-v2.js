var CACHE_NAME = 'ganadero-v15';

// Archivos locales
var urlsLocales = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Archivos CDN que se descargan automáticamente
var urlsCDN = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            // Cachear locales
            var localesPromise = cache.addAll(urlsLocales);
            
            // Cachear CDNs uno por uno (sin que fallen los demás si uno falla)
            var cdnPromises = urlsCDN.map(function(url) {
                return fetch(url, { mode: 'cors' }).then(function(response) {
                    if (response.ok) {
                        return cache.put(url, response);
                    }
                }).catch(function() {
                    console.log('No se pudo precachear:', url);
                });
            });
            
            return Promise.all([localesPromise].concat(cdnPromises));
        }).then(function() {
            console.log('✅ Todos los archivos cacheados');
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
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', {status: 200});
            });
        })
    );
});
