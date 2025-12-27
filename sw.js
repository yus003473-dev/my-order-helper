
const CACHE_NAME = 'queen-helper-v9';
const OFFLINE_URL = 'index.html';

// 预缓存关键静态资源（打包后的 JS/CSS 会由 Vite 自动处理，这里只缓存基础文件）
const PRE_CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
  
  // 排除对 TSX 等源码文件的缓存干预，让浏览器/构建工具自行处理
  if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      
      return fetch(event.request).then(response => {
        // 仅缓存同源的成功响应
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
