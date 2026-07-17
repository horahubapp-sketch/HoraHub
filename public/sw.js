const CACHE_NAME = 'encaixe-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Evento Install: Cria o cache e armazena os assets estáticos iniciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Encaixe PWA] Salvando assets estáticos no cache...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento Activate: Limpa caches antigos se houver atualização de versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Encaixe PWA] Deletando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch: Intercepta requisições de rede
self.addEventListener('fetch', event => {
  // Apenas intercepta requisições GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora requisições de APIs externas (ex: Supabase) para evitar cachear dados em tempo real
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Retorna do cache se encontrado
          return cachedResponse;
        }

        // Caso contrário, busca na rede
        return fetch(event.request)
          .then(response => {
            // Se for uma resposta válida, coloca no cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Se falhar a rede (offline) e for uma rota de navegação, retorna a index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
