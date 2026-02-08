'use client';

import { useEffect } from 'react';
import { initializeOfflineDB } from '@/lib/offline-store';
import { initializeSyncManager } from '@/lib/sync-manager';

/**
 * Component that initializes offline functionality
 * Should be mounted once at the app level
 */
export function OfflineInitializer() {
  useEffect(() => {
    let cleanupSync: (() => void) | undefined;

    const initializeOffline = async () => {
      try {
        // Initialize IndexedDB with timeout
        await Promise.race([
          initializeOfflineDB(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
          )
        ]);
        
        console.log('✓ Offline database initialized successfully');
        
        // Initialize sync manager with event listeners
        cleanupSync = initializeSyncManager();
        
        // Register service worker if supported
        if ('serviceWorker' in navigator && 'caches' in window) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
            });
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is available
                    // Could show update notification here
                  }
                });
              }
            });

            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
              const { type } = event.data || {};
              
              if (type === 'BACKGROUND_SYNC') {
                // Service worker triggered background sync
                // Sync manager will handle this automatically
              }
            });

            // Register for background sync if supported
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
              try {
                // Type assertion because TypeScript doesn't know about the sync property
                const syncRegistration = registration as any;
                await syncRegistration.sync?.register('background-sync');
              } catch (error) {
                // Background sync not available, sync manager will handle periodic sync
              }
            }

          } catch (error) {
            // Service worker registration failed, app will work without offline features
          }
        }
        
      } catch (error) {
        // Offline features failed to initialize
        // App will continue to work but without offline functionality
        console.error('Offline initialization failed:', error);
        console.log('💡 To fix database issues, open DevTools Console and run:');
        console.log('   indexedDB.deleteDatabase("GobocleanOfflineDB").onsuccess = () => location.reload()');
      }
    };

    initializeOffline();

    // Cleanup function
    return () => {
      cleanupSync?.();
    };
  }, []); // Run once on mount

  // This component doesn't render anything
  return null;
}