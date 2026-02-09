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
        
        // Service worker is automatically registered by Next.js PWA
        // Listen for service worker messages if available
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            const { type } = event.data || {};
            
            if (type === 'BACKGROUND_SYNC') {
              // Service worker triggered background sync
              // Sync manager will handle this automatically
            }
          });

          // Register for background sync when service worker is ready
          navigator.serviceWorker.ready.then(async (registration) => {
            if ('sync' in window.ServiceWorkerRegistration.prototype) {
              try {
                await (registration as any).sync?.register('background-sync');
              } catch (error) {
                // Background sync not available, sync manager will handle periodic sync
              }
            }
          });
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