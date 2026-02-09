'use client';

import { useEffect, useState } from 'react';
import { initializeOfflineDB } from '@/lib/offline-store';
import { initializeSyncManager } from '@/lib/sync-manager';

/**
 * Component that initializes offline functionality
 * Should be mounted once at the app level
 */
export function OfflineInitializer() {
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    let cleanupSync: (() => void) | undefined;
    let isMounted = true;

    const initializeOffline = async () => {
      if (!isMounted) return;
      
      setInitStatus('loading');
      
      try {
        console.log('🚀 Initializing offline functionality...');
        
        // Initialize IndexedDB with timeout
        await Promise.race([
          initializeOfflineDB(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database initialization timeout')), 10000)
          )
        ]);
        
        if (!isMounted) return;
        console.log('✓ Offline database initialized successfully');
        
        // Initialize sync manager with event listeners
        cleanupSync = initializeSyncManager();
        
        // Basic service worker handling (no aggressive updates)
        if ('serviceWorker' in navigator) {
          try {
            // Check if service worker is already registered
            const registration = await navigator.serviceWorker.getRegistration();
            
            if (registration) {
              console.log('✓ Service worker found:', registration.scope);
              
              // Listen for service worker messages
              navigator.serviceWorker.addEventListener('message', (event) => {
                const { type } = event.data || {};
                
                if (type === 'BACKGROUND_SYNC') {
                  console.log('📡 Background sync triggered');
                }
              });

              // Register for background sync when ready
              navigator.serviceWorker.ready.then(async (reg) => {
                if ('sync' in window.ServiceWorkerRegistration.prototype) {
                  try {
                    await (reg as any).sync?.register('background-sync');
                    console.log('✓ Background sync registered');
                  } catch (error) {
                    console.log('ℹ️ Background sync not available, using periodic sync');
                  }
                }
              });
            } else {
              console.log('ℹ️ No service worker registered (running in browser)');
            }
          } catch (error) {
            console.warn('Service worker check failed:', error);
          }
        } else {
          console.log('ℹ️ Service workers not supported');
        }
        
        if (!isMounted) return;
        setInitStatus('success');
        console.log('🎉 Offline initialization complete');
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('❌ Offline initialization failed:', error);
        setInitStatus('error');
        
        // Don't show scary error messages - app can work without offline features
        console.log('💡 App will continue to work without offline features');
        
        // Provide helpful debugging info in console only
        if (error instanceof Error && error.message.includes('Database')) {
          console.log('🔧 To fix database issues:');
          console.log('   1. Open DevTools Application tab');
          console.log('   2. Clear Storage > Clear site data');
          console.log('   3. Reload the page');
        }
      }
    };

    // Start initialization after a small delay to let the app load first
    const timeoutId = setTimeout(initializeOffline, 1000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      cleanupSync?.();
    };
  }, []); // Run once on mount

  // This component doesn't render anything visible
  // Status is logged to console for debugging
  return null;
}