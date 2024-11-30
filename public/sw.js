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
  // Handle Google Maps requests
  if (event.request.url.includes('maps.googleapis.com') || event.request.url.includes('maps.gstatic.com')) {
    event.respondWith(
      caches.open(MAPS_CACHE)
        .then(cache => {
          return fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              }
              throw new Error('Network response was not ok');
            })
            .catch(error => {
              console.error('Fetching failed:', error);
              return cache.match(event.request);
            });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
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