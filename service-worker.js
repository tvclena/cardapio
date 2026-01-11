const CACHE_NAME = "cardapio-v1";

const OFFLINE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  /* Não cacheia Supabase */
  if (req.url.includes("supabase")) return;

  event.respondWith(
    caches.match(req).then(res => {
      return (
        res ||
        fetch(req)
          .then(net => {
            const clone = net.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
            return net;
          })
          .catch(() => caches.match("/index.html"))
      );
    })
  );
});
