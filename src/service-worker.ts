/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<any> };

self.skipWaiting();
clientsClaim();

// This is the placeholder for the manifest that vite-plugin-pwa will inject.
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches.
cleanupOutdatedCaches();

// Example: A navigation route for your single-page application.
// This ensures that all navigation requests (e.g., direct URL access)
// are served by your index.html, which then handles client-side routing.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    allowlist: [/^\/$/], // Allow only the root path for navigation
  })
);

// Add any other custom routes or caching strategies here if needed.