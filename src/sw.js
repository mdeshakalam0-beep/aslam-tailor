// src/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js'); // Updated version

// Ensure workbox is available
if (workbox) {
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

  // Optional: Force the waiting service worker to activate and replace the current active service worker.
  self.addEventListener('install', () => self.skipWaiting());
  // Optional: Claim control of any currently open clients that are within the service worker's scope.
  self.addEventListener('activate', () => clients.claim());

  // Add further caching rules below if you need
} else {
  console.error('Workbox failed to load.');
}