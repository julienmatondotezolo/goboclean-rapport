// Session debugging utility for development
export const debugSession = {
  // Check all session-related storage
  checkStorage: () => {
    if (typeof window === 'undefined') {
      console.log('🔍 [DEBUG] Running on server, no storage access');
      return;
    }

    console.log('🔍 [DEBUG] Session Storage Analysis:');
    console.log('localStorage:', {
      'goboclean-auth-token': localStorage.getItem('goboclean-auth-token'),
      'auth-token': localStorage.getItem('auth-token'),
      keys: Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('goboclean'))
    });
    
    console.log('sessionStorage:', {
      keys: Object.keys(sessionStorage),
      values: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>)
    });

    console.log('cookies:', {
      all: document.cookie,
      parsed: document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && (key.includes('auth') || key.includes('goboclean') || key.includes('session'))) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>)
    });
  },

  // Clear all session data
  clearAll: () => {
    if (typeof window === 'undefined') return;
    
    console.log('🧹 [DEBUG] Clearing all session data...');
    
    // Clear localStorage
    const lsKeys = Object.keys(localStorage);
    lsKeys.forEach(key => {
      if (key.includes('auth') || key.includes('goboclean') || key.includes('session')) {
        localStorage.removeItem(key);
        console.log(`Removed localStorage: ${key}`);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('Cleared sessionStorage');
    
    // Clear cookies (best effort)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name && (name.includes('auth') || name.includes('goboclean') || name.includes('session'))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`Cleared cookie: ${name}`);
      }
    });
    
    console.log('✅ [DEBUG] All session data cleared');
  },

  // Simulate login flow for testing (MOCK VERSION)
  simulateLogin: async () => {
    console.log('🔑 [DEBUG] Getting current session (mock)...');
    
    // Check localStorage for token
    const token = localStorage.getItem('goboclean-auth-token') || localStorage.getItem('auth-token');
    
    if (token) {
      console.log('✅ [DEBUG] Token found:', {
        token: token.slice(0, 20) + '...',
        length: token.length
      });
      return { access_token: token };
    } else {
      console.log('❌ [DEBUG] No token found in localStorage');
      return null;
    }
  },

  // Test redirect logic
  testRedirect: (path: string = '/fr/dashboard') => {
    console.log(`🔄 [DEBUG] Testing redirect to: ${path}`);
    window.location.href = path;
  },

  // Monitor auth events (MOCK VERSION)
  monitorAuth: () => {
    if (typeof window === 'undefined') return;

    const events = [
      'backend:session-updated',
      'backend:signed-in', 
      'backend:signed-out'
    ];

    events.forEach(event => {
      window.addEventListener(event, (e) => {
        console.log(`🔔 [DEBUG] Auth event: ${event}`, e);
      });
    });

    console.log('🔔 [DEBUG] Monitoring auth events (mock):', events);
  },

  // Quick session debug
  debug: () => {
    debugSession.checkStorage();
    debugSession.simulateLogin();
    debugSession.monitorAuth();
  }
};