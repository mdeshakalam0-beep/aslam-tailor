// src/sw.js  (paste EXACTLY this plain JS file)
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

// Workbox will inject the manifest array here at build time
precacheAndRoute(self.__WB_MANIFEST || []);

// Clean up old caches automatically
cleanupOutdatedCaches();

// SPA navigation route: serve index.html for navigation requests
const handler = createHandlerBoundToURL('/index.html');
const navRoute = new NavigationRoute(handler, {
  // allow all navigation paths (you can narrow this if needed)
  allowlist: [/./],
});
registerRoute(navRoute);

// Add further caching rules below if you need