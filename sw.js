
const CACHE_NAME = 'queen-helper-v8';
const OFFLINE_URL = 'index.html';

// 仅预缓存关键的本地资源，避免跨域请求阻塞安装
const PRE_CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './types.ts'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 allSettled 逐个添加，容忍部分资源（如 TSX）在非标准环境下的 fetch 失败
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => 
          cache.add(url).catch(err => console.warn(`SW: Failed to cache ${url}`, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      
      return fetch(event.request).then(response => {
        // 动态缓存：仅缓存同源的成功请求，避免跨域 opaque 响应问题
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
