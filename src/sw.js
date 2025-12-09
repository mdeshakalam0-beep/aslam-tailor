// src/sw.js
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';

// Step 1: Skip waiting and claim clients immediately
self.skipWaiting();
clientsClaim();

// Step 2: Handle the injected manifest safely
// Hum directly self.__WB_MANIFEST ko assign nahi kar sakte, isliye naya variable banayenge
let manifest = self.__WB_MANIFEST;

if (!manifest) {
  manifest = [];
}

// Step 3: Explicitly add /index.html if not present (User's logic preserved)
const indexHtmlEntry = manifest.find(entry => 
  typeof entry === 'string' ? entry === '/index.html' : entry.url === '/index.html'
);

if (!indexHtmlEntry) {
  manifest.push({ url: '/index.html', revision: null });
}

// Step 4: Precache assets
precacheAndRoute(manifest);

// Step 5: Clean up old caches
cleanupOutdatedCaches();

// Step 6: Setup Navigation Route (SPA fallback to index.html)
try {
  const handler = createHandlerBoundToURL('/index.html');
  const navRoute = new NavigationRoute(handler, {
    allowlist: [/./],
  });
  registerRoute(navRoute);
} catch (error) {
  console.warn('Error setting up navigation fallback:', error);
}

// Log for debugging
console.log('Service Worker loaded successfully with manifest:', manifest);