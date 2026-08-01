const CACHE_NAME = 'synapse-tracker-v6'; 
const urlsToCache = [
  './',
  './index.html',
  './habits.html',
  './profile.html',
  './stats.html',
  './styles.css',
  './app.js',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => {
    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
  }))));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
