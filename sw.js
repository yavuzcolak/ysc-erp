/* Çolak Hane — service worker
 * Her güncellemede SURUM artırılır; eski önbellek silinir. */
var SURUM = 'colakhane-v1';
var KABUK = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(KABUK); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (a) { return a !== SURUM; }).map(function (a) { return caches.delete(a); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Yalnızca kendi dosyalarımız: önce ağ, olmazsa önbellek.
 * Apps Script istekleri (başka alan adı) hiç önbelleğe alınmaz. */
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var kopya = r.clone();
    caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
