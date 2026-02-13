import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient, debugClientState } from '@/lib/supabase/client';
import { User } from '@/types/report';
import { Session } from '@supabase/supabase-js';

interface UseAuthOptions {
  requireAuth?: boolean;
  requiredRole?: 'worker' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
  session: Session | null;
  lastTokenRefresh: number | null;
  error: string | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, requiredRole } = options;
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasRequiredRole: false,
    session: null,
    lastTokenRefresh: null,
    error: null,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());
  const componentIdRef = useRef(`auth-${Math.random().toString(36).slice(2, 9)}`);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  console.log(`🔄 [useAuth-${componentIdRef.current}] Hook initialized`);

  // Clear any existing refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Schedule automatic token refresh with exponential backoff
  const scheduleTokenRefresh = useCallback((session: Session) => {
    clearRefreshTimeout();

    if (!session.access_token) {
      console.warn(`⚠️ [useAuth-${componentIdRef.current}] No access token, cannot schedule refresh`);
      return;
    }

    // Calculate time until token expires (refresh 5 minutes before expiry)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const refreshIn = Math.max((expiresAt - now - 300) * 1000, 60000); // Min 1 minute

    console.log(`🔄 [useAuth-${componentIdRef.current}] Scheduling token refresh in ${Math.floor(refreshIn / 1000)}s`);

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log(`🔄 [useAuth-${componentIdRef.current}] Refreshing token...`);
        const { data, error } = await supabaseRef.current.auth.refreshSession();
        
        if (error) {
          console.error(`❌ [useAuth-${componentIdRef.current}] Token refresh failed:`, error.message);
          
          // Retry with exponential backoff
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const retryDelay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
            console.log(`🔄 [useAuth-${componentIdRef.current}] Retrying refresh in ${retryDelay}ms (attempt ${retryCountRef.current})`);
            
            setTimeout(() => {
              scheduleTokenRefresh(session);
            }, retryDelay);
            return;
          }
          
          // Force logout after max retries
          console.error(`❌ [useAuth-${componentIdRef.current}] Max retries exceeded, forcing logout`);
          await supabaseRef.current.auth.signOut();
          return;
        }

        if (data.session) {
          console.log(`✅ [useAuth-${componentIdRef.current}] Token refreshed successfully`);
          retryCountRef.current = 0; // Reset retry count on success
          setState(prev => ({ 
            ...prev, 
            session: data.session,
            lastTokenRefresh: Date.now(),
            error: null
          }));
          
          // Schedule next refresh
          scheduleTokenRefresh(data.session);
        }
      } catch (error) {
        console.error(`❌ [useAuth-${componentIdRef.current}] Token refresh error:`, error);
        setState(prev => ({
          ...prev,
          error: 'Failed to refresh authentication token'
        }));
        
        // Try to logout gracefully
        try {
          await supabaseRef.current.auth.signOut();
        } catch (logoutError) {
          console.error(`❌ [useAuth-${componentIdRef.current}] Logout after refresh error failed:`, logoutError);
        }
      }
    }, refreshIn);
  }, [clearRefreshTimeout]);

  // Update auth state from session with comprehensive error handling
  const updateAuthState = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      console.log(`🚪 [useAuth-${componentIdRef.current}] No session, clearing auth state`);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasRequiredRole: false,
        session: null,
        lastTokenRefresh: null,
        error: null,
      });
      clearRefreshTimeout();
      return;
    }

    try {
      console.log(`👤 [useAuth-${componentIdRef.current}] Updating auth state for user: ${session.user.email}`);
      
      // Get user profile with retry logic
      let profile = null;
      let profileError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabaseRef.current
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single() as { data: any; error: any };

        if (!error) {
          profile = data;
          break;
        }
        
        profileError = error;
        if (attempt < 2) {
          console.warn(`⚠️ [useAuth-${componentIdRef.current}] Profile fetch attempt ${attempt + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      if (profileError && !profile) {
        console.error(`❌ [useAuth-${componentIdRef.current}] Profile fetch failed after retries:`, profileError.message);
        // Still set as authenticated with Supabase, but no profile
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: true,
          isLoading: false,
          hasRequiredRole: false,
          session,
          error: `Failed to load user profile: ${profileError.message}`
        }));
        scheduleTokenRefresh(session);
        return;
      }

      // Check role authorization
      const hasRole = requiredRole ? profile?.role === requiredRole : true;

      setState({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        hasRequiredRole: hasRole,
        session,
        lastTokenRefresh: Date.now(),
        error: null,
      });

      console.log(`✅ [useAuth-${componentIdRef.current}] Auth state updated successfully:`, {
        userId: profile?.id?.slice(0, 8) + '...',
        email: profile?.email,
        role: profile?.role,
        hasRequiredRole: hasRole
      });

      // Schedule token refresh
      scheduleTokenRefresh(session);

    } catch (error) {
      console.error(`❌ [useAuth-${componentIdRef.current}] Auth state update error:`, error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasRequiredRole: false,
        session: null,
        lastTokenRefresh: null,
        error: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      clearRefreshTimeout();
    }
  }, [requiredRole, scheduleTokenRefresh, clearRefreshTimeout]);

  // Multi-tab session synchronization
  useEffect(() => {
    const handleSessionUpdate = () => {
      console.log(`🔄 [useAuth-${componentIdRef.current}] Session updated in another tab, syncing...`);
      supabaseRef.current.auth.getSession().then(({ data: { session } }) => {
        updateAuthState(session);
      });
    };

    const handleSignOut = () => {
      console.log(`🚪 [useAuth-${componentIdRef.current}] Sign out detected in another tab`);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasRequiredRole: false,
        session: null,
        lastTokenRefresh: null,
        error: null,
      });
      clearRefreshTimeout();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('supabase:session-updated', handleSessionUpdate);
      window.addEventListener('supabase:signed-out', handleSignOut);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('supabase:session-updated', handleSessionUpdate);
        window.removeEventListener('supabase:signed-out', handleSignOut);
      }
    };
  }, [updateAuthState, clearRefreshTimeout]);

  // Main auth initialization effect
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        console.log(`🚀 [useAuth-${componentIdRef.current}] Initializing auth...`);
        
        if (process.env.NODE_ENV === 'development') {
          debugClientState();
        }

        const { data: { session }, error } = await supabaseRef.current.auth.getSession();
        
        if (cancelled) return;
        
        if (error) {
          console.error(`❌ [useAuth-${componentIdRef.current}] Session initialization error:`, error.message);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: `Session initialization failed: ${error.message}` 
          }));
          return;
        }
        
        await updateAuthState(session);
      } catch (error) {
        console.error(`❌ [useAuth-${componentIdRef.current}] Auth initialization error:`, error);
        if (!cancelled) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: `Authentication initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes with enhanced error handling
    const { data: { subscription } } = supabaseRef.current.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (cancelled) return;

        console.log(`🔐 [useAuth-${componentIdRef.current}] Auth event: ${event}`, {
          hasSession: !!session,
          userId: session?.user?.id?.slice(0, 8) + '...' || 'none',
          email: session?.user?.email || 'none'
        });
        
        switch (event) {
          case 'SIGNED_OUT':
            console.log(`🚪 [useAuth-${componentIdRef.current}] User signed out`);
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              hasRequiredRole: false,
              session: null,
              lastTokenRefresh: null,
              error: null,
            });
            clearRefreshTimeout();
            
            // Broadcast to other tabs
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('supabase:signed-out'));
            }
            break;
            
          case 'SIGNED_IN':
            console.log(`🔑 [useAuth-${componentIdRef.current}] User signed in:`, session?.user?.email);
            await updateAuthState(session);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log(`🔄 [useAuth-${componentIdRef.current}] Token refreshed for:`, session?.user?.email);
            await updateAuthState(session);
            break;
            
          default:
            console.log(`🔍 [useAuth-${componentIdRef.current}] Unhandled auth event: ${event}`);
            break;
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearRefreshTimeout();
    };
  }, [updateAuthState, clearRefreshTimeout]);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasRequiredRole: state.hasRequiredRole,
    session: state.session,
    isAdmin: state.user?.role === 'admin',
    isWorker: state.user?.role === 'worker',
    lastTokenRefresh: state.lastTokenRefresh,
    error: state.error,
    
    // Helper methods
    refresh: useCallback(async () => {
      try {
        console.log(`🔄 [useAuth-${componentIdRef.current}] Manual refresh requested`);
        const { data, error } = await supabaseRef.current.auth.refreshSession();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`❌ [useAuth-${componentIdRef.current}] Manual refresh failed:`, error);
        throw error;
      }
    }, []),
    
    logout: useCallback(async () => {
      try {
        console.log(`🚪 [useAuth-${componentIdRef.current}] Manual logout requested`);
        clearRefreshTimeout();
        const { error } = await supabaseRef.current.auth.signOut();
        if (error) throw error;
        
        // Clear all storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('goboclean-auth-token');
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        }
      } catch (error) {
        console.error(`❌ [useAuth-${componentIdRef.current}] Logout failed:`, error);
        throw error;
      }
    }, [clearRefreshTimeout]),

    // Debug helper
    debug: useCallback(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [useAuth-${componentIdRef.current}] Debug Info:`, {
          state,
          hasRefreshTimeout: !!refreshTimeoutRef.current,
          retryCount: retryCountRef.current
        });
        debugClientState();
      }
    }, [state]),
  };
}