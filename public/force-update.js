/**
 * Force PWA Update Script
 * Run this in browser console to fix PWA endless loading
 */

(function() {
  console.log('🔄 Force PWA Update Starting...');
  
  // 1. Clear all caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('📦 Found caches:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ All caches cleared');
    });
  }
  
  // 2. Clear IndexedDB
  if ('indexedDB' in window) {
    console.log('🗑️ Clearing IndexedDB...');
    indexedDB.deleteDatabase('GobocleanOfflineDB');
    console.log('✅ IndexedDB cleared');
  }
  
  // 3. Unregister service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('🛠️ Found SW registrations:', registrations.length);
      return Promise.all(
        registrations.map(registration => {
          console.log('🗑️ Unregistering SW:', registration.scope);
          return registration.unregister();
        })
      );
    }).then(() => {
      console.log('✅ All service workers unregistered');
    });
  }
  
  // 4. Clear local storage
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storage cleared');
  
  // 5. Force reload
  setTimeout(() => {
    console.log('🔄 Force reloading in 2 seconds...');
    window.location.reload(true);
  }, 2000);
  
  console.log('💡 Manual fix: Delete PWA from home screen, clear Safari cache, reinstall');
})();