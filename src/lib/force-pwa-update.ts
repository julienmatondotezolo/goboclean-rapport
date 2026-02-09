/**
 * Force PWA Update for Existing Installations
 * This runs immediately on page load to fix critical PWA issues
 */

export async function forcePWAUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[Force PWA Update] Service workers not supported');
    return;
  }

  console.log('[Force PWA Update] Starting aggressive update check...');

  try {
    // 1. Get current registration
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('[Force PWA Update] No registration found');
      return;
    }

    // 2. Force update check
    console.log('[Force PWA Update] Forcing service worker update...');
    await registration.update();

    // 3. If there's a waiting service worker, activate immediately
    if (registration.waiting) {
      console.log('[Force PWA Update] Activating waiting service worker...');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for activation and reload
      const activationPromise = new Promise<void>((resolve) => {
        const checkActivation = () => {
          if (registration.active && registration.active !== registration.waiting) {
            console.log('[Force PWA Update] Service worker activated, reloading...');
            setTimeout(() => window.location.reload(), 500);
            resolve();
          } else {
            setTimeout(checkActivation, 100);
          }
        };
        checkActivation();
      });

      return activationPromise;
    }

    // 4. If installing, wait for it to complete
    if (registration.installing) {
      console.log('[Force PWA Update] Waiting for service worker installation...');
      
      const installPromise = new Promise<void>((resolve) => {
        const worker = registration.installing!;
        
        const handleStateChange = () => {
          if (worker.state === 'installed') {
            console.log('[Force PWA Update] Installation complete, activating...');
            worker.postMessage({ type: 'SKIP_WAITING' });
            setTimeout(() => window.location.reload(), 500);
            resolve();
          }
        };

        worker.addEventListener('statechange', handleStateChange);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          worker.removeEventListener('statechange', handleStateChange);
          resolve();
        }, 10000);
      });

      return installPromise;
    }

    console.log('[Force PWA Update] Service worker is up to date');

  } catch (error) {
    console.error('[Force PWA Update] Error during update:', error);
  }
}

/**
 * Check if PWA needs update based on version
 */
export function checkPWAVersion(): boolean {
  const currentVersion = 'v1.2.0';
  const lastKnownVersion = localStorage.getItem('pwa-version');
  
  if (lastKnownVersion !== currentVersion) {
    localStorage.setItem('pwa-version', currentVersion);
    console.log(`[PWA Version] Updated from ${lastKnownVersion || 'unknown'} to ${currentVersion}`);
    return true; // Update needed
  }
  
  return false; // No update needed
}

/**
 * Initialize force update on critical pages
 */
export function initializeForcePWAUpdate(): void {
  // Run immediately
  forcePWAUpdate();
  
  // Check version
  if (checkPWAVersion()) {
    console.log('[PWA Version] Version mismatch detected, forcing update...');
    setTimeout(forcePWAUpdate, 2000);
  }
  
  // Run on focus (when user returns to app)
  window.addEventListener('focus', forcePWAUpdate);
  
  // Run when online
  window.addEventListener('online', forcePWAUpdate);
}