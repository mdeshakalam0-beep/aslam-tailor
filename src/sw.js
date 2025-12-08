// src/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.2.0/workbox-sw.js');

// Ensure workbox is available globally after importScripts
declare const workbox: any;

workbox.core.clientsClaim();
self.skipWaiting();

// Workbox will inject the manifest array here at build time
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Clean up old caches automatically
workbox.precaching.cleanupOutdatedCaches();

// SPA navigation route: serve index.html for navigation requests
const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
const navRoute = new workbox.routing.NavigationRoute(handler, {
  // allow all navigation paths (you can narrow this if needed)
  allowlist: [/./],
});
workbox.routing.registerRoute(navRoute);

// Add further caching rules below if you need