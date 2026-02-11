// Manual cache clearing utility
// Run window.clearCache() in console to clear IndexedDB

window.clearCache = async function() {
  console.log('🧹 Clearing IndexedDB cache...');
  
  try {
    // Delete the database
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('GobocleanOfflineDB');
      
      request.onsuccess = () => {
        console.log('✅ IndexedDB cleared successfully');
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to clear IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onblocked = () => {
        console.warn('⚠️ Cache clearing blocked - close all tabs and try again');
        resolve();
      };
      
      // Timeout
      setTimeout(() => {
        console.warn('⚠️ Timeout - database might still be clearing');
        resolve();
      }, 5000);
    });
    
    // Clear localStorage keys related to offline
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('goboclean') || key.includes('offline') || key.includes('sync'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✓ Removed localStorage key: ${key}`);
    });
    
    console.log('✅ Cache cleared! Reloading page...');
    setTimeout(() => location.reload(), 1000);
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

console.log('💡 Run window.clearCache() to clear IndexedDB and reload');
