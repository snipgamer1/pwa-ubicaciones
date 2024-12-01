const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const MAPS_CACHE = 'maps-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/App.css',
  '/manifest.json',
  '/vite.svg',
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Cache addAll failed:', error);
            // Log which specific files failed
            return Promise.all(
              urlsToCache.map(url =>
                cache.add(url).catch(err => 
                  console.error('Failed to cache:', url, err)
                )
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, MAPS_CACHE];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Manejar solicitudes de Google Maps
  if (event.request.url.includes('maps.googleapis.com') || event.request.url.includes('maps.gstatic.com')) {
    event.respondWith(
      caches.open(MAPS_CACHE)
        .then(cache => {
          return fetch(event.request)
            .then(networkResponse => {
              if (event.request.method === 'GET') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cache.match(event.request));
        })
    );
    return;
  }

  // Manejar otras solicitudes
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Retorna desde la caché si está disponible
        }

        if (event.request.method !== 'GET') {
          // Si no es GET, simplemente pasa la solicitud al network
          return fetch(event.request);
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response; // No cacheamos respuestas no válidas
            }

            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});
