'use client';

import { useEffect, useState } from 'react';

/**
 * Cache Migration Component
 * 
 * Automatically clears old cache when app version changes
 * This ensures users don't have stale data from the old sync manager
 */
export function CacheMigration() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'done'>('idle');
  
  useEffect(() => {
    const APP_VERSION = '2.0.1'; // Increment this when you need to clear cache
    const VERSION_KEY = 'goboclean-app-version';
    
    const migrate = async () => {
      try {
        const currentVersion = localStorage.getItem(VERSION_KEY);
        
        // If version matches, no migration needed
        if (currentVersion === APP_VERSION) {
          setMigrationStatus('done');
          return;
        }
        
        console.log('🔄 Starting cache migration to v' + APP_VERSION + '...');
        console.log('💡 This will clear old IndexedDB cache that was blocking queries');
        setMigrationStatus('migrating');
        
        // Clear IndexedDB
        if (typeof indexedDB !== 'undefined') {
          try {
            await new Promise<void>((resolve, reject) => {
              const request = indexedDB.deleteDatabase('GobocleanOfflineDB');
              request.onsuccess = () => {
                console.log('✓ Old cache cleared');
                resolve();
              };
              request.onerror = () => {
                console.warn('⚠️ Could not clear cache:', request.error);
                resolve(); // Continue anyway
              };
              request.onblocked = () => {
                console.warn('⚠️ Cache clearing blocked - will clear on next reload');
                resolve();
              };
              
              // Timeout after 5 seconds
              setTimeout(() => {
                console.warn('⚠️ Cache clearing timeout');
                resolve();
              }, 5000);
            });
          } catch (error) {
            console.warn('Cache clearing failed:', error);
          }
        }
        
        // Update version
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        console.log(`✅ Migrated to version ${APP_VERSION}`);
        setMigrationStatus('done');
        
      } catch (error) {
        console.error('Migration failed:', error);
        setMigrationStatus('done'); // Continue anyway
      }
    };
    
    migrate();
  }, []);
  
  // Don't render anything - this is a background process
  // You could show a loading indicator if migrationStatus === 'migrating'
  return null;
}
