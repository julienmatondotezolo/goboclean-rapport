/**
 * GoBoclean Service Worker - Safari Compatible
 * Version 1.1.0 - Forces update for existing installations
 */

/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v1.1.0'; // Incremented to force update
const STATIC_CACHE = `goboclean-static-${CACHE_VERSION}`;
const API_CACHE = `goboclean-api-${CACHE_VERSION}`;

// Minimal static assets for offline use
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

/**
 * Install event - force immediate activation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v1.1.0');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Force immediate activation
  );
});

/**
 * Activate event - clean old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v1.1.0');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              (cacheName.startsWith('goboclean-') || 
               cacheName.startsWith('workbox-') || 
               cacheName.includes('precache')) &&
              !cacheName.includes(CACHE_VERSION)
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] v1.1.0 activated and controlling all clients');
    })
  );
});

/**
 * Fetch event - simplified, Safari-compatible handling
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests entirely - let them pass through
  if (request.method !== 'GET') {
    return;
  }

  // Skip navigation requests to avoid Safari redirect issues
  if (request.destination === 'document' || request.mode === 'navigate') {
    return;
  }

  // Skip Chrome extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Only handle specific static assets and API requests
  if (shouldHandle(url)) {
    event.respondWith(handleRequest(request));
  }
});

/**
 * Determine if we should handle this request
 */
function shouldHandle(url) {
  // Handle our static assets
  if (url.pathname.includes('/icons/') || 
      url.pathname === '/manifest.json') {
    return true;
  }

  // Handle API requests from same origin only
  if (url.pathname.startsWith('/api/') && url.hostname === self.location.hostname) {
    return true;
  }

  return false;
}

/**
 * Handle requests with simple cache-first strategy
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first for static assets
    if (!url.pathname.startsWith('/api/')) {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
    }

    // Try network
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok && response.status < 300) {
      const cache = await caches.open(
        url.pathname.startsWith('/api/') ? API_CACHE : STATIC_CACHE
      );
      // Clone before caching
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Fetch failed:', error);
    
    // Try cache as fallback
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return network error for API requests
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'Network unavailable' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw error;
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'GoBoclean',
      body: event.data.text(),
    };
  }

  const { title = 'GoBoclean Rapport', body, icon, data } = payload;

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data || {},
    tag: data?.missionId || 'default',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { missionId, url } = event.notification.data || {};
  let targetUrl = '/dashboard';
  
  if (url) {
    targetUrl = url;
  } else if (missionId) {
    targetUrl = `/mission/${missionId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Message handling - force update for existing installations
 */
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'SKIP_WAITING') {
    console.log('[SW] Forced update via message');
    self.skipWaiting();
    return;
  }
});

// Log that the service worker is loaded
console.log('[SW] GoBoclean Service Worker v1.1.0 loaded');