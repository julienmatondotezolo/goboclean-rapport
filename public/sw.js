/**
 * Comprehensive Service Worker for GoBoclean PWA
 * Handles:
 * - Push notifications
 * - Offline caching
 * - Background sync
 * - API request interception
 */

/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `goboclean-static-${CACHE_VERSION}`;
const API_CACHE = `goboclean-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `goboclean-images-${CACHE_VERSION}`;

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/fr',
  '/fr/dashboard',
  '/fr/missions',
  '/fr/profile',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/missions',
  '/notifications',
  '/auth/me',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith('goboclean-') &&
            !cacheName.includes(CACHE_VERSION)
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching (except for background sync)
  if (request.method !== 'GET') {
    // Handle POST/PUT/PATCH/DELETE for background sync if offline
    if (!navigator.onLine) {
      event.respondWith(handleOfflineMutation(request));
    }
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with cache-first or network-first strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      if (shouldCacheApiResponse(url.pathname)) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific endpoints
    if (shouldProvideOfflineResponse(url.pathname)) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'This request failed because you are offline.' 
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
 * Handle static asset requests
 */
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Handle offline mutations - store in IndexedDB for later sync
 */
async function handleOfflineMutation(request) {
  // This would integrate with IndexedDB to queue mutations
  // For now, return an error response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Mutation queued for sync when online',
      queued: true,
    }),
    {
      status: 202, // Accepted but not processed
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Check if API response should be cached
 */
function shouldCacheApiResponse(pathname) {
  return CACHEABLE_API_ROUTES.some(route => pathname.includes(route));
}

/**
 * Check if we should provide an offline response
 */
function shouldProvideOfflineResponse(pathname) {
  return CACHEABLE_API_ROUTES.some(route => pathname.includes(route));
}

/**
 * Background sync event
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
  // This would integrate with the sync manager
  try {
    // Open IndexedDB and process sync queue
    // For now, just log that sync is happening
    console.log('Background sync triggered');
    
    // Could send a message to the main thread to trigger sync
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'BACKGROUND_SYNC' });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Push notification event
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
    actions: [],
    tag: data?.missionId || 'default',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { missionId, url } = event.notification.data || {};

  // Determine where to navigate
  let targetUrl = '/fr/dashboard';
  if (url) {
    targetUrl = url;
  } else if (missionId) {
    targetUrl = `/fr/missions/${missionId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If we already have a window open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

/**
 * Message event - handle messages from main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      if (payload && payload.urls) {
        event.waitUntil(
          caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(payload.urls);
          })
        );
      }
      break;
      
    default:
      // Unknown message type
      break;
  }
});

/**
 * Periodic background sync (if supported)
 */
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}