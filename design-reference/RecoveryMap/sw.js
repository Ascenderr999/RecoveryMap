/** Versioned offline shell. Never substitute HTML for missing images or scripts. */
const CACHE = 'recoverymap-improved-v3';
const SHELL = ['./', './index.html', './style.css', './csv.js', './app.js', './assets/earth-mission.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('recoverymap-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const saved = await cache.match(request);
      if (saved) return saved;
      if (request.mode === 'navigate') {
        const page = await cache.match('./index.html');
        if (page) return page;
      }
      return new Response('Offline resource unavailable', { status: 503 });
    }
  })());
});
