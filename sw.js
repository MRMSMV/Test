/* CandySky admin — service worker.
   Задача одна: принимать Web Push и показывать уведомление.
   Страницы НЕ кэшируются (чтобы не залипала старая версия админки). */

const VERSION = "2026-11-04-1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Пустой fetch-обработчик: нужен Chrome/Android для установки PWA, ничего не кэширует.
self.addEventListener("fetch", () => {});

function parse(event) {
  if (!event.data) return {};
  try { return event.data.json(); } catch (e) { return { body: event.data.text() }; }
}

self.addEventListener("push", (event) => {
  const d = parse(event);
  const title = d.title || "CandySky";
  const opts = {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "badge-96.png",
    tag: d.tag || (d.order_id ? "order-" + d.order_id : "candysky"),
    renotify: true,
    requireInteraction: !!d.urgent,
    timestamp: d.ts || Date.now(),
    data: { url: d.url || "./", order_id: d.order_id || null },
  };
  const jobs = [self.registration.showNotification(title, opts)];
  if (typeof d.badge_count === "number" && self.navigator && self.navigator.setAppBadge) {
    jobs.push(self.navigator.setAppBadge(d.badge_count).catch(() => {}));
  }
  event.waitUntil(Promise.all(jobs));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || "./", self.registration.scope);
  if (data.order_id) target.searchParams.set("order", data.order_id);
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if ("focus" in c) {
        await c.focus();
        c.postMessage({ type: "open-order", order_id: data.order_id || null });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target.href);
  })());
});

// Подписка протухла (браузер сам её сменил) — сообщаем странице, она переподпишется и отправит новую на сервер
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    all.forEach((c) => c.postMessage({ type: "resubscribe" }));
  })());
});
