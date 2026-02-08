/**
 * Web Push Notification utilities
 */
import { apiClient } from '@/lib/api-client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Convert a URL-safe base64 string to a Uint8Array (for applicationServerKey).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Request notification permission from the user.
 * Returns the permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return Notification.requestPermission();
}

/**
 * Get the current notification permission state.
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isPushSupported()) return null;
  return Notification.permission;
}

/**
 * Register the push service worker and subscribe to push.
 * Sends the subscription to the backend.
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    console.warn('Push not supported or VAPID key missing');
    return false;
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return false;

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw-push.js');
    await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    // Extract keys
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (!key || !auth) {
      console.error('Missing subscription keys');
      return false;
    }

    // Send to backend
    await apiClient.post('/notifications/subscribe', {
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
      auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
    });

    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications and notify the backend.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
    if (!registration) return true;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Notify backend
    await apiClient.delete('/notifications/unsubscribe');
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}
