// Service Worker para GANADERO ÉLITE PWA
var CACHE_NAME = 'ganadero-elite-v1';
var urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalación
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Estrategia: Cache First (carga rápido, actualiza en segundo plano)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Devuelve del cache si existe
      if (response) {
        // Actualiza el cache en segundo plano
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            var responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
        }).catch(function() {
          // Sin conexión, usar cache
        });
        return response;
      }
      // Si no está en cache, va a la red
      return fetch(event.request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    }).catch(function() {
      // Si no hay red y no está en cache, devolver página offline
      return new Response('Sin conexión. La app funciona offline con datos guardados.', {
        status: 503,
        statusText: 'Sin conexión'
      });
    })
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
