/**
 * App Reset Utilities
 * 
 * Use these functions to reset the app state when debugging issues
 */

/**
 * Clear all offline data and caches
 */
export async function clearAllData(): Promise<void> {
  console.log('🧹 Clearing all app data...');

  try {
    // 1. Clear IndexedDB
    if (typeof indexedDB !== 'undefined') {
      try {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase('GobocleanOfflineDB');
          request.onsuccess = () => {
            console.log('✓ IndexedDB cleared');
            resolve();
          };
          request.onerror = () => reject(request.error);
          request.onblocked = () => {
            console.warn('⚠️ IndexedDB deletion blocked - close all tabs');
            resolve(); // Continue anyway
          };
        });
      } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
      }
    }

    // 2. Clear localStorage
    if (typeof localStorage !== 'undefined') {
      const keysToKeep = ['NEXT_LOCALE']; // Keep language preference
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      console.log('✓ localStorage cleared');
    }

    // 3. Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      console.log('✓ sessionStorage cleared');
    }

    // 4. Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✓ Service worker caches cleared');
    }

    console.log('✅ All data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

/**
 * Reset React Query cache
 */
export async function resetQueryCache(): Promise<void> {
  console.log('🔄 Resetting React Query cache...');
  
  try {
    // This will be called from a component that has access to queryClient
    const event = new CustomEvent('reset-query-cache');
    window.dispatchEvent(event);
    console.log('✓ Query cache reset event dispatched');
  } catch (error) {
    console.error('❌ Error resetting query cache:', error);
  }
}

/**
 * Full app reset - clears everything and reloads
 */
export async function resetApp(): Promise<void> {
  console.log('🔄 Performing full app reset...');
  
  try {
    await clearAllData();
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload the page
    console.log('🔄 Reloading app...');
    window.location.reload();
  } catch (error) {
    console.error('❌ Error during app reset:', error);
    // Reload anyway
    window.location.reload();
  }
}

/**
 * Clear only IndexedDB (keep other data)
 */
export async function clearOfflineCache(): Promise<void> {
  console.log('🧹 Clearing offline cache...');
  
  try {
    if (typeof indexedDB !== 'undefined') {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('GobocleanOfflineDB');
        request.onsuccess = () => {
          console.log('✓ Offline cache cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
          console.warn('⚠️ Database deletion blocked');
          resolve();
        };
      });
    }
  } catch (error) {
    console.error('❌ Error clearing offline cache:', error);
    throw error;
  }
}

/**
 * Check app health
 */
export async function checkAppHealth(): Promise<{
  online: boolean;
  hasSession: boolean;
  indexedDBReady: boolean;
  queryClientActive: boolean;
  recentAPICall: boolean;
}> {
  const health = {
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasSession: false,
    indexedDBReady: false,
    queryClientActive: false,
    recentAPICall: false,
  };

  // Check session
  try {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    health.hasSession = !!session;
  } catch (error) {
    console.error('Session check failed:', error);
  }

  // Check IndexedDB
  try {
    const { isDatabaseReady } = await import('./offline-store');
    health.indexedDBReady = isDatabaseReady();
  } catch (error) {
    console.error('IndexedDB check failed:', error);
  }

  // Check for recent API calls
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:3001';
    const recentCalls = entries.filter(e => 
      e.name.includes(backendUrl) && 
      (Date.now() - (e.startTime + performance.timeOrigin)) < 60000 // Last minute
    );
    health.recentAPICall = recentCalls.length > 0;
  }

  return health;
}

/**
 * Print app health to console
 */
export async function printAppHealth(): Promise<void> {
  console.group('🏥 App Health Check');
  
  const health = await checkAppHealth();
  
  console.log('📡 Online:', health.online ? '✅' : '❌');
  console.log('🔐 Has Session:', health.hasSession ? '✅' : '❌');
  console.log('💾 IndexedDB Ready:', health.indexedDBReady ? '✅' : '⚠️');
  console.log('📊 Query Client Active:', health.queryClientActive ? '✅' : '⚠️');
  console.log('🌐 Recent API Call:', health.recentAPICall ? '✅' : '❌ NO API CALLS');
  
  const isHealthy = health.online && health.hasSession && health.recentAPICall;
  
  if (isHealthy) {
    console.log('✅ App is healthy');
  } else {
    console.warn('⚠️ App may have issues');
    
    if (!health.online) {
      console.log('💡 Tip: Check your internet connection');
    }
    if (!health.hasSession) {
      console.log('💡 Tip: Try logging out and back in');
    }
    if (!health.recentAPICall) {
      console.log('💡 Tip: App is not making API calls - this is the bug!');
      console.log('   Try: window.clearOfflineCache() then reload');
    }
  }
  
  console.groupEnd();
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllData;
  (window as any).clearOfflineCache = clearOfflineCache;
  (window as any).resetApp = resetApp;
  (window as any).resetQueryCache = resetQueryCache;
  (window as any).checkAppHealth = checkAppHealth;
  (window as any).printAppHealth = printAppHealth;
  
  console.log('🛠️ Debug utilities loaded. Available commands:');
  console.log('  - window.printAppHealth() - Check app health');
  console.log('  - window.clearOfflineCache() - Clear IndexedDB only');
  console.log('  - window.clearAllData() - Clear all caches');
  console.log('  - window.resetApp() - Full reset and reload');
}
