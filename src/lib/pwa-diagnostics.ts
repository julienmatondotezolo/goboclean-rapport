/**
 * PWA Diagnostics - Debug endless loading issues
 */

export function runPWADiagnostics() {
  console.log('🔍 PWA Diagnostics Starting...');
  
  // Check if running in PWA mode
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  console.log('📱 PWA Mode:', isPWA ? 'YES' : 'NO');
  
  // Check service worker status
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      console.log('🛠️ SW Active:', registration.active?.scriptURL);
      console.log('🛠️ SW Waiting:', registration.waiting?.scriptURL);
      console.log('🛠️ SW Installing:', registration.installing?.scriptURL);
    });
  }
  
  // Test API connectivity
  console.log('🌐 Testing API connectivity...');
  fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Headers:', [...response.headers.entries()]);
    return response.text();
  })
  .then(text => {
    console.log('✅ API Response Body:', text);
  })
  .catch(error => {
    console.error('❌ API Request Failed:', error);
    console.error('❌ Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });
  
  // Check authentication state
  const token = localStorage.getItem('access_token');
  console.log('🔑 Auth Token:', token ? 'EXISTS (' + token.length + ' chars)' : 'MISSING');
  
  // Check cache status
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('📦 Active Caches:', cacheNames);
      cacheNames.forEach(name => {
        caches.open(name).then(cache => {
          cache.keys().then(keys => {
            console.log(`📦 Cache "${name}" has ${keys.length} entries`);
          });
        });
      });
    });
  }
  
  // Monitor network requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('🌐 Fetch Request:', args[0], args[1]?.method || 'GET');
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('🌐 Fetch Response:', args[0], response.status);
        return response;
      })
      .catch(error => {
        console.error('🌐 Fetch Error:', args[0], error.message);
        throw error;
      });
  };
  
  console.log('✅ PWA Diagnostics Complete - Check console for details');
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(runPWADiagnostics, 1000);
}

// Make available globally for manual debugging
if (typeof window !== 'undefined') {
  (window as any).runPWADiagnostics = runPWADiagnostics;
}