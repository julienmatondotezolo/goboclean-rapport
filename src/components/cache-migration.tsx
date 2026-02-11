'use client';

import { useEffect } from 'react';

/**
 * Cache Cleanup Component
 * 
 * Clears old IndexedDB cache once (from removed offline functionality)
 * After this runs once, it won't run again
 */
export function CacheMigration() {
  useEffect(() => {
    const CLEANUP_KEY = 'goboclean-indexeddb-cleaned';
    
    const cleanup = async () => {
      try {
        // Check if already cleaned
        if (localStorage.getItem(CLEANUP_KEY) === 'true') {
          return;
        }
        
        console.log('🧹 Cleaning up old IndexedDB cache...');
        
        // Clear IndexedDB
        if (typeof indexedDB !== 'undefined') {
          try {
            await new Promise<void>((resolve) => {
              const request = indexedDB.deleteDatabase('GobocleanOfflineDB');
              request.onsuccess = () => {
                console.log('✓ Old IndexedDB cache cleared');
                resolve();
              };
              request.onerror = () => {
                console.warn('⚠️ Could not clear cache, continuing anyway');
                resolve();
              };
              request.onblocked = () => {
                console.warn('⚠️ Cache clearing blocked, will try on next reload');
                resolve();
              };
              
              // Timeout after 3 seconds
              setTimeout(() => {
                resolve();
              }, 3000);
            });
          } catch (error) {
            console.warn('Cache clearing failed:', error);
          }
        }
        
        // Mark as cleaned
        localStorage.setItem(CLEANUP_KEY, 'true');
        console.log('✅ Cache cleanup complete');
        
      } catch (error) {
        console.error('Cleanup failed:', error);
        // Mark as cleaned anyway to avoid retrying
        localStorage.setItem(CLEANUP_KEY, 'true');
      }
    };
    
    cleanup();
  }, []);
  
  return null;
}
