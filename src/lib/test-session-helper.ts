// E2E Test Session Helper
// This utility helps E2E tests work with the new session management

export const testSessionHelper = {
  // Wait for session to be established
  waitForSession: async (timeoutMs = 10000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token && session.expires_at && session.expires_at > Date.now() / 1000) {
          console.log('✅ [TEST] Session established:', {
            userId: session.user.id.slice(0, 8) + '...',
            email: session.user.email,
            hasValidToken: !!session.access_token
          });
          return true;
        }
      } catch (error) {
        console.warn('⚠️ [TEST] Session check failed:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error('❌ [TEST] Session not established within timeout');
    return false;
  },

  // Wait for redirect to complete
  waitForRedirect: async (expectedPath: string, timeoutMs = 5000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (window.location.pathname.includes(expectedPath)) {
        console.log(`✅ [TEST] Redirected to: ${window.location.pathname}`);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error(`❌ [TEST] Redirect to ${expectedPath} not completed within timeout. Current: ${window.location.pathname}`);
    return false;
  },

  // Clear session for testing
  clearSessionForTest: async () => {
    try {
      const { createClient, resetSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Sign out
      await supabase.auth.signOut();
      
      // Reset client
      resetSupabaseClient();
      
      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
      }
      
      console.log('✅ [TEST] Session cleared for testing');
    } catch (error) {
      console.error('❌ [TEST] Failed to clear session:', error);
    }
  },

  // Test login flow
  testLogin: async (email: string, password: string): Promise<boolean> => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      console.log('🔑 [TEST] Attempting login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ [TEST] Login failed:', error.message);
        return false;
      }
      
      if (data.session) {
        console.log('✅ [TEST] Login successful');
        
        // Wait for session to be fully established
        return await this.waitForSession();
      }
      
      return false;
    } catch (error) {
      console.error('❌ [TEST] Login error:', error);
      return false;
    }
  },

  // Check if redirect loop is resolved
  checkRedirectLoop: () => {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('redirect');
    
    // If we're on login with a redirect param that matches current pathname, it's a loop
    if (url.pathname.includes('/login') && redirect && redirect === url.pathname) {
      console.error('❌ [TEST] Redirect loop detected:', {
        currentPath: url.pathname,
        redirectParam: redirect
      });
      return false;
    }
    
    console.log('✅ [TEST] No redirect loop detected');
    return true;
  },

  // Get current session state for debugging
  getSessionState: async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      return {
        hasSession: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        expiresAt: session?.expires_at || null,
        isExpired: session?.expires_at ? session.expires_at <= Date.now() / 1000 : null,
        currentUrl: window.location.href,
        cookies: document.cookie,
        localStorage: {
          authToken: localStorage.getItem('goboclean-auth-token'),
          supabaseToken: localStorage.getItem('supabase.auth.token'),
        }
      };
    } catch (error) {
      console.error('❌ [TEST] Failed to get session state:', error);
      return null;
    }
  }
};

// Make available for E2E tests
if (typeof window !== 'undefined') {
  (window as any).testSessionHelper = testSessionHelper;
}