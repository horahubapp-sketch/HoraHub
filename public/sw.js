const CACHE_NAME = 'encaixe-cache-v3';

// Evento Install: Força a atualização imediata do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Evento Activate: Limpa todos os caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          console.log('[Encaixe PWA] Limpando cache antigo:', cache);
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch: Estratégia Network-First (Rede Primeiro, Cache apenas para Offline)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora requisições de APIs externas (ex: Supabase)
  if (url.origin !== self.location.origin) return;

  // Busca sempre da rede primeiro para garantir código atualizado
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback para o cache apenas se estiver totalmente offline
        return caches.match(event.request);
      })
  );
}
);
