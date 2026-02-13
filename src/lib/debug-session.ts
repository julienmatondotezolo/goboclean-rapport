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
      'supabase.auth.token': localStorage.getItem('supabase.auth.token'),
      keys: Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('supabase'))
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
        if (key && (key.includes('auth') || key.includes('supabase') || key.includes('session'))) {
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
      if (key.includes('auth') || key.includes('supabase') || key.includes('session')) {
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
      if (name && (name.includes('auth') || name.includes('supabase') || name.includes('session'))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`Cleared cookie: ${name}`);
      }
    });
    
    console.log('✅ [DEBUG] All session data cleared');
  },

  // Simulate login flow for testing
  simulateLogin: async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    console.log('🔑 [DEBUG] Getting current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [DEBUG] Session error:', error);
      return;
    }
    
    if (session) {
      console.log('✅ [DEBUG] Session found:', {
        userId: session.user.id.slice(0, 8) + '...',
        email: session.user.email,
        expiresAt: session.expires_at,
        accessToken: session.access_token?.slice(0, 20) + '...'
      });
    } else {
      console.log('❌ [DEBUG] No session found');
    }
    
    return session;
  },

  // Test redirect logic
  testRedirect: (path: string = '/fr/dashboard') => {
    console.log(`🔄 [DEBUG] Testing redirect to: ${path}`);
    window.location.href = path;
  },

  // Monitor auth events
  monitorAuth: () => {
    if (typeof window === 'undefined') return;

    const events = [
      'supabase:session-updated',
      'supabase:signed-in',
      'supabase:signed-out'
    ];

    events.forEach(event => {
      window.addEventListener(event, (e) => {
        console.log(`🔔 [DEBUG] Auth event: ${event}`, e);
      });
    });

    console.log('🔔 [DEBUG] Monitoring auth events:', events);
  }
};

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugSession = debugSession;
  console.log('🔍 [DEBUG] Session debug utility available as window.debugSession');
}