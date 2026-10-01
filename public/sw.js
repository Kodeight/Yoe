const CACHE_NAME = 'yoe-pwa-v1';
const LESSONS_CACHE = 'yoe-lessons-offline-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== LESSONS_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listener for caching previously learned lessons, vocabulary, and grammar
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type, payload } = event.data;

  if (type === 'CACHE_LEARNED_LESSONS') {
    event.waitUntil(
      caches.open(LESSONS_CACHE).then(async (cache) => {
        try {
          if (payload.vocabularyUrl && payload.vocabulary) {
            await cache.put(
              new Request(payload.vocabularyUrl),
              new Response(JSON.stringify({ vocabulary: payload.vocabulary }), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
          }

          if (payload.mistakesUrl && payload.mistakes) {
            await cache.put(
              new Request(payload.mistakesUrl),
              new Response(JSON.stringify({ mistakes: payload.mistakes }), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
          }

          if (payload.scenariosUrl && payload.scenarios) {
            await cache.put(
              new Request(payload.scenariosUrl),
              new Response(JSON.stringify({ scenarios: payload.scenarios }), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
          }

          // Also store all-in-one bundle for offline recovery
          await cache.put(
            new Request('/api/offline-lessons-bundle'),
            new Response(JSON.stringify(payload), {
              headers: { 'Content-Type': 'application/json' }
            })
          );
        } catch (err) {
          console.warn('[SW] Error caching learned lessons:', err);
        }
      })
    );
  }
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Cache-first / Network-fallback for learnable offline content: vocabulary, grammar, scenarios, journeys
  if (
    e.request.method === 'GET' &&
    (url.includes('/api/vocabulary') ||
     url.includes('/api/mistakes') ||
     url.includes('/api/scenarios') ||
     url.includes('/api/journeys') ||
     url.includes('/api/offline-lessons-bundle'))
  ) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(LESSONS_CACHE).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Internet unavailable: serve cached lessons, vocabulary, and grammar
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return empty fallback array rather than failing
            if (url.includes('/api/vocabulary')) {
              return new Response(JSON.stringify({ vocabulary: [], offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            if (url.includes('/api/mistakes')) {
              return new Response(JSON.stringify({ mistakes: [], offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return new Response(JSON.stringify({ error: 'offline', offline: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Skip other API routes (e.g. streaming AI chat or POST routes)
  if (e.request.method !== 'GET' || url.includes('/api/')) {
    return;
  }

  // Standard static assets caching
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request).catch(() => {
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
      );
    })
  );
});

// Push notification received
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Yoe - Daily Speaking Reminder! 🔥',
    body: 'Keep your streak going! Practice a quick 3-minute conversation now.',
    icon: '/icon-192.png',
    badge: '/favicon.png'
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/favicon.png',
      vibrate: [120, 60, 120],
      data: { url: payload.url || '/' }
    })
  );
});

// Notification click to bring app to focus
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

