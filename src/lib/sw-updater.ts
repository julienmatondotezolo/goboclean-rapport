/**
 * Service Worker Update Manager
 * Forces update for existing PWA installations to fix Safari redirect issues
 */

let updateCheckInterval: NodeJS.Timeout | null = null;

/**
 * Force service worker update for existing installations
 */
export async function forceServiceWorkerUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Updater] Service workers not supported');
    return false;
  }

  try {
    // Get current registration
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.log('[SW Updater] No existing registration found');
      return false;
    }

    console.log('[SW Updater] Forcing service worker update...');

    // Force update check
    await registration.update();

    // If there's a waiting service worker, activate it immediately
    if (registration.waiting) {
      console.log('[SW Updater] Activating waiting service worker');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the service worker to become active
      return new Promise((resolve) => {
        const checkActive = () => {
          if (registration.active) {
            console.log('[SW Updater] Service worker activated successfully');
            resolve(true);
          } else {
            setTimeout(checkActive, 100);
          }
        };
        checkActive();
      });
    }

    // If there's an installing service worker, wait for it
    if (registration.installing) {
      console.log('[SW Updater] Waiting for service worker installation');
      
      return new Promise((resolve) => {
        const handleStateChange = () => {
          if (registration.installing?.state === 'installed') {
            console.log('[SW Updater] Service worker installed, activating...');
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            resolve(true);
          } else if (registration.installing?.state === 'activated') {
            console.log('[SW Updater] Service worker activated');
            resolve(true);
          }
        };

        registration.installing?.addEventListener('statechange', handleStateChange);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          registration.installing?.removeEventListener('statechange', handleStateChange);
          resolve(false);
        }, 10000);
      });
    }

    console.log('[SW Updater] Service worker is already up to date');
    return true;

  } catch (error) {
    console.error('[SW Updater] Failed to update service worker:', error);
    return false;
  }
}

/**
 * Initialize service worker update checking
 */
export function initializeServiceWorkerUpdater(): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }

  // Force immediate update on first load
  setTimeout(() => {
    forceServiceWorkerUpdate();
  }, 1000);

  // Check for updates very frequently for critical fixes
  updateCheckInterval = setInterval(() => {
    forceServiceWorkerUpdate();
  }, 5 * 60 * 1000); // Check every 5 minutes for faster updates

  // Listen for page visibility changes to check for updates
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      forceServiceWorkerUpdate();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Listen for service worker updates and force reload when ready
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Updater] New service worker activated, reloading page...');
      window.location.reload();
    });

    // Also listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[SW Updater] Service worker updated, forcing reload...');
        window.location.reload();
      }
    });
  }

  // Cleanup function
  return () => {
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval);
      updateCheckInterval = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Get service worker registration info for debugging
 */
export async function getServiceWorkerInfo(): Promise<any> {
  if (!('serviceWorker' in navigator)) {
    return { supported: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { supported: true, registered: false };
    }

    return {
      supported: true,
      registered: true,
      scope: registration.scope,
      updateViaCache: registration.updateViaCache,
      active: {
        state: registration.active?.state,
        scriptURL: registration.active?.scriptURL,
      },
      waiting: {
        state: registration.waiting?.state,
        scriptURL: registration.waiting?.scriptURL,
      },
      installing: {
        state: registration.installing?.state,
        scriptURL: registration.installing?.scriptURL,
      },
    };
  } catch (error) {
    return { supported: true, registered: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}