import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/report";
import { Session } from "@supabase/supabase-js";

interface UseAuthOptions {
  requireAuth?: boolean;
  requiredRole?: "worker" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
  session: Session | null;
  lastTokenRefresh: number | null;
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
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());
  const componentIdRef = useRef(`auth-${Math.random().toString(36).slice(2, 9)}`); // Unique ID for this hook instance

  // Clear any existing refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(
    (session: Session) => {
      clearRefreshTimeout();

      if (!session.access_token) return;

      // Calculate time until token expires (refresh 5 minutes before expiry)
      const expiresAt = session.expires_at || 0;
      const now = Math.floor(Date.now() / 1000);
      const refreshIn = Math.max((expiresAt - now - 300) * 1000, 60000); // Min 1 minute

      console.log(`🔄 [${componentIdRef.current}] Scheduling token refresh in ${Math.floor(refreshIn / 1000)}s`);

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          console.log(`🔄 [${componentIdRef.current}] Refreshing token...`);
          const { data, error } = await supabaseRef.current.auth.refreshSession();

          if (error) {
            console.error(`❌ [${componentIdRef.current}] Token refresh failed:`, error.message);
            // Force logout on refresh failure
            await supabaseRef.current.auth.signOut();
            return;
          }

          if (data.session) {
            console.log(`✅ [${componentIdRef.current}] Token refreshed successfully`);
            setState((prev) => ({
              ...prev,
              session: data.session,
              lastTokenRefresh: Date.now(),
            }));

            // Schedule next refresh
            scheduleTokenRefresh(data.session);
          }
        } catch (error) {
          console.error(`❌ [${componentIdRef.current}] Token refresh error:`, error);
          await supabaseRef.current.auth.signOut();
        }
      }, refreshIn);
    },
    [clearRefreshTimeout],
  );

  // Update auth state from session
  const updateAuthState = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasRequiredRole: false,
          session: null,
          lastTokenRefresh: null,
        });
        clearRefreshTimeout();
        return;
      }

      try {
        // Get user profile with consistent RLS context
        const { data: profile, error: profileError } = (await supabaseRef.current
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()) as { data: any; error: any };

        if (profileError) {
          console.error("❌ Profile fetch failed:", profileError.message);
          // Don't logout on profile error, user might not be in database yet
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: true, // Still authenticated with Supabase
            isLoading: false,
            hasRequiredRole: false,
            session,
          }));
          scheduleTokenRefresh(session);
          return;
        }

        // Check role authorization
        const hasRole = requiredRole ? profile.role === requiredRole : true;

        setState({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
          hasRequiredRole: hasRole,
          session,
          lastTokenRefresh: Date.now(),
        });

        // Schedule token refresh
        scheduleTokenRefresh(session);
      } catch (error) {
        console.error("❌ Auth state update error:", error);
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasRequiredRole: false,
          session: null,
          lastTokenRefresh: null,
        }));
        clearRefreshTimeout();
      }
    },
    [requiredRole, scheduleTokenRefresh, clearRefreshTimeout],
  );

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabaseRef.current.auth.getSession();

        if (cancelled) return;

        await updateAuthState(session);
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes with automatic refresh handling
    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange(async (event: any, session: Session | null) => {
      if (cancelled) return;

      console.log(`🔐 [${componentIdRef.current}] Auth event: ${event}`, session?.user?.email || "no-user");

      switch (event) {
        case "SIGNED_OUT":
          console.log(`🚪 [${componentIdRef.current}] User signed out`);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasRequiredRole: false,
            session: null,
            lastTokenRefresh: null,
          });
          clearRefreshTimeout();
          
          // Clear all browser storage on sign out
          if (typeof window !== 'undefined') {
            // Clear localStorage (except language preference)
            const savedLanguage = localStorage.getItem('preferred-language');
            localStorage.clear();
            if (savedLanguage) {
              localStorage.setItem('preferred-language', savedLanguage);
            }
            
            // Clear sessionStorage
            sessionStorage.clear();
          }
          break;

        case "SIGNED_IN":
          console.log(`🔑 [${componentIdRef.current}] User signed in:`, session?.user?.email);
          await updateAuthState(session);
          break;

        case "TOKEN_REFRESHED":
          console.log(`🔄 [${componentIdRef.current}] Token refreshed for:`, session?.user?.email);
          await updateAuthState(session);
          break;

        default:
          // Handle INITIAL_SESSION and other events
          if (event === "INITIAL_SESSION") {
            await updateAuthState(session);
          }
          break;
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearRefreshTimeout();
    };
  }, [updateAuthState, clearRefreshTimeout]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasRequiredRole: state.hasRequiredRole,
    session: state.session,
    isAdmin: state.user?.role === "admin",
    isWorker: state.user?.role === "worker",
    lastTokenRefresh: state.lastTokenRefresh,

    // Helper methods
    refresh: useCallback(async () => {
      const { data, error } = await supabaseRef.current.auth.refreshSession();
      if (error) throw error;
      return data;
    }, []),

    logout: useCallback(async () => {
      clearRefreshTimeout();
      const { error } = await supabaseRef.current.auth.signOut();
      if (error) throw error;
    }, [clearRefreshTimeout]),
  };
}
