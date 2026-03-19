const CACHE = 'utvonal-v5';
const STATIC = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/app.js',
  './js/map.js',
  './js/places.js',
  './js/routing.js',
  './js/storage.js',
  './js/speech.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API hívásokat (ORS, Overpass, Nominatim) mindig hálózatról
  const url = e.request.url;
  if (url.includes('openrouteservice') || url.includes('overpass') || url.includes('nominatim')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Egyéb kérések: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
