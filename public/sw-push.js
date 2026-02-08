/**
 * Push Notification Service Worker
 * Handles incoming push events and notification clicks.
 */

/* eslint-disable no-restricted-globals */

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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { missionId, url } = event.notification.data || {};

  // Determine where to navigate
  let targetUrl = '/dashboard';
  if (url) {
    targetUrl = url;
  } else if (missionId) {
    targetUrl = `/mission/${missionId}`;
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
