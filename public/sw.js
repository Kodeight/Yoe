const CACHE_NAME = 'yoe-pwa-v2';
const LESSONS_CACHE = 'yoe-lessons-offline-v2';

self.addEventListener('install', (e) => {
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

// Listener for caching learned lessons, vocabulary, and grammar
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

  // 1. Navigation Requests (HTML App Shell): Network-First Strategy
  // Guarantees newly deployed application builds are served immediately without stale shell caching!
  if (e.request.mode === 'navigate' || url.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  // 2. Offline Lessons / Vocabulary / API content: Network-First with Offline Cache Fallback
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
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
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

  // Skip other non-GET or dynamic API routes (e.g. streaming WebSocket or POST)
  if (e.request.method !== 'GET' || url.includes('/api/')) {
    return;
  }

  // 3. Static Assets (/assets/*.js, /assets/*.css, icons): Cache-First with Network Fallback
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && (url.includes('/assets/') || url.includes('/icons/'))) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkRes;
      });
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

// Notification click
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
