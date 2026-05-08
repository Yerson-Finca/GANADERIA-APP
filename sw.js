// Service Worker para GANADERO ÉLITE - Modo Offline Completo
var CACHE_NAME = 'ganadero-elite-v6';

// Archivos que se guardan para funcionar sin internet
var urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2'
];

// Instalación - guardar todo en caché
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Cacheando archivos para modo offline...');
            return cache.addAll(urlsToCache).catch(function(error) {
                console.log('Algunos archivos no se pudieron cachear:', error);
            });
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activación - limpiar cachés viejos
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando caché viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Estrategia: Cache First (carga desde caché, actualiza en segundo plano)
self.addEventListener('fetch', function(event) {
    // Solo manejar peticiones GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                // Actualizar caché en segundo plano
                fetch(event.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        var responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                }).catch(function() {
                    // Sin conexión, usar caché
                });
                return cachedResponse;
            }

            // No está en caché, intentar de la red
            return fetch(event.request).then(function(networkResponse) {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                var responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            }).catch(function() {
                // Si es una página HTML, devolver la página principal
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
                // Si no, devolver respuesta vacía
                return new Response('', { status: 503 });
            });
        })
    );
});
