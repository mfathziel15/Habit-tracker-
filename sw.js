const CACHE_NAME = 'synapse-tracker-v2'; // Ingat, ubah angka ini tiap kali ada update fitur!
const urlsToCache = [
  './',
  './index.html',
  './profile.html',
  './styles.css',
  './icon.svg'
];

// Install versi baru
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Hapus versi lama secara otomatis
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Membuang cache v1 jika v2 muncul
          }
        })
      );
    })
  );
});

// Ambil data (Offline mode)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
