'use strict';
const PREFIX = 'nasa-explorer-';
const SHELL = PREFIX + 'shell-v1';
const API = PREFIX + 'api-v1';
const IMAGES = PREFIX + 'images-v1';
const scopeUrl = new URL(self.registration.scope);
const shellPaths = ['./', './index.html', './style.css', './script.js?v=20261106-3', './pwa.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
const shellUrls = new Set(shellPaths.map(path => new URL(path, scopeUrl).href));
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(shellPaths.map(path => new Request(new URL(path, scopeUrl), {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && ![SHELL, API, IMAGES].includes(name)) await caches.delete(name);
    await self.clients.claim();
  })());
});
async function trim(cache, max) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}
async function nasaNetworkFirst(request, event) {
  const cache = await caches.open(API);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(request, {signal:controller.signal});
    if (!response.ok) throw new Error('NASA unavailable');
    const data = await response.clone().json();
    if (!data.date || !data.media_type) throw new Error('Invalid NASA response');
    try { await cache.put(request, response.clone()); await trim(cache, 90); } catch { /* A full cache must not prevent online use. */ }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      event.waitUntil(self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage({type:'NASA_CACHE_FALLBACK'}))));
      return cached;
    }
    return new Response(JSON.stringify({error:'This date has not been saved. Connect to load it.'}), {status:503, headers:{'Content-Type':'application/json'}});
  } finally { clearTimeout(timer); }
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === 'https://science.nasa.gov' && url.pathname.startsWith('/wp-json/wp/v2/apod-basic/')) {
    event.respondWith(nasaNetworkFirst(request, event));
    return;
  }
  if (url.origin === scopeUrl.origin && url.pathname.startsWith(scopeUrl.pathname) && (request.mode === 'navigate' || shellUrls.has(url.href))) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      return await cache.match(request) || (request.mode === 'navigate' && await cache.match(new URL('./index.html', scopeUrl))) || fetch(request);
    })());
    return;
  }
  if (request.destination === 'image' && url.protocol === 'https:') {
    event.respondWith((async () => {
      const cache = await caches.open(IMAGES);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        event.waitUntil((async () => { try { await cache.put(request, response.clone()); await trim(cache, 30); } catch {} })());
      }
      return response;
    })());
  }
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    const app = clients.find(client => client.url.startsWith(self.registration.scope));
    if (app) return app.focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});
