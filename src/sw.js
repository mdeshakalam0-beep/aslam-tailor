// src/sw.js

// Ensure self.__WB_MANIFEST is defined as an array, even if empty,
// before Workbox attempts to use it.
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Explicitly add /index.html to the precache manifest if not already present.
// This is a fallback to ensure it's always precached for navigation.
const indexHtmlEntry = self.__WB_MANIFEST.find(entry => 
  typeof entry === 'string' ? entry === '/index.html' : entry.url === '/index.html'
);
if (!indexHtmlEntry) {
  self.__WB_MANIFEST.push({ url: '/index.html', revision: null }); // Use null revision for simplicity if not versioned
}

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js'); // Updated version

try {
  if (workbox) {
    console.log('Workbox loaded successfully.');
    
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