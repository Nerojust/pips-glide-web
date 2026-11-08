// Offline support for the installed web app.
// Every file the game loads from this site is kept in a cache. The page itself is fetched fresh
// whenever there's a connection, so an update shows on the next load; the cached copy is the
// fallback offline. Everything else (code, art, fonts: their names change with their content)
// comes from the cache at once, with a fresh copy fetched in the background.
// The build (vite.config.ts) fills in the version and the list of every file, so the whole game
// is stored on the first visit and each release gets a fresh cache (older ones are deleted).
const CACHE = 'pips-glide-0.1.0-8bc47330';
const FILES = ["./","./index.html","./loader.js","./manifest.webmanifest","./page.css","./privacy.html","./support.html","./assets/consent-status.enum-CdMsqkrY.js","./assets/definitions-BdWVgBTV.js","./assets/dist-WmVykzCl.js","./assets/fredoka-hebrew-500-normal-BtShCMVp.woff","./assets/fredoka-hebrew-500-normal-DdMTjgiE.woff2","./assets/fredoka-hebrew-600-normal-BiVDObXj.woff","./assets/fredoka-hebrew-600-normal-CTBxhdlE.woff2","./assets/fredoka-latin-500-normal-B0JifZgm.woff2","./assets/fredoka-latin-500-normal-BL692wg7.woff","./assets/fredoka-latin-600-normal-C4zohCW5.woff2","./assets/fredoka-latin-600-normal-CcrEjrB4.woff","./assets/friends-pc7c630W.js","./assets/icons-D-sfqVkv.js","./assets/index-6Eo_oXvA.js","./assets/index-BsMWCaH0.css","./assets/web-CP-JMXCX.js","./assets/web-D580glcS.js","./assets/web-Dq0TPAkx.js","./assets/web-Dtog8Y8Q.js","./assets/window-CTbE_3ou.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const page = request.mode === 'navigate';
      const cached = await cache.match(request, { ignoreSearch: page });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) void cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached ?? Response.error());
      return page ? fresh : (cached ?? fresh);
    }),
  );
});
