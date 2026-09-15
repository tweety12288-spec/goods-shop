// turingshop 서비스워커: 앱 셸 프리캐시 + 방문한 페이지 오프라인 캐시
// 전략: 동일 출처 GET 요청만 network-first, 실패(오프라인) 시 캐시 폴백.
// Supabase/토스 같은 cross-origin 요청은 절대 가로채거나 캐시하지 않는다
// (세션/결제 관련 응답이 Cache Storage에 남지 않도록).

const CACHE_NAME = "turingshop-v1";

const APP_SHELL = [
  "./",
  "index.html",
  "login.html",
  "shop.html",
  "orders.html",
  "admin.html",
  "css/style.css",
  "js/supabaseClient.js",
  "js/auth.js",
  "js/landing.js",
  "js/login.js",
  "js/shop.js",
  "js/orders.js",
  "js/admin.js",
  "js/pwa.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
