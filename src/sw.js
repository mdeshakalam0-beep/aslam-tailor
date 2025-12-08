// src/sw.js

// Ensure self.__WB_MANIFEST is defined as an array, even if empty,
// before Workbox attempts to use it.
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js'); // Updated version

try {
  if (workbox) {
    console.log('Workbox loaded successfully.');
    
    // Ensure index.html is explicitly precached if not already in the manifest
    // This is a workaround if vite-plugin-pwa doesn't inject it correctly.
    const indexHtmlEntry = self.__WB_MANIFEST.find(entry => entry.url === '/index.html');
    if (!indexHtmlEntry) {
      self.__WB_MANIFEST.push({ url: '/index.html', revision: '1' }); // Add with a dummy revision
    }

    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

    workbox.precaching.cleanupOutdatedCaches();

    const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
    const navRoute = new workbox.routing.NavigationRoute(handler, {
      allowlist: [/./],
    });
    workbox.routing.registerRoute(navRoute);

    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', () => clients.claim());

    // Add further caching rules below if you need
  } else {
    console.error('Workbox failed to load in Service Worker.');
  }
} catch (e) {
  console.error('Service Worker initialization failed:', e);
}