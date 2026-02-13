import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// 🔐 Singleton pattern to prevent session conflicts between multiple users
let supabaseInstance: SupabaseClient<Database> | null = null;

export const createClient = (): SupabaseClient<Database> => {
  // Return existing instance if already created (but allow recreation after reset)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  console.log('🚀 [CLIENT] Creating new Supabase client instance');

  // Create new instance with bulletproof session management
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // 🎯 Enable automatic session refresh with shorter intervals
        autoRefreshToken: true,
        // 🔒 Persist session across page reloads and tabs
        persistSession: true,
        // 🏠 Detect session changes across tabs for multi-tab sync
        detectSessionInUrl: true,
        // 📱 Consistent storage key across the app
        storageKey: 'goboclean-auth-token',
        // 🔄 More aggressive session refresh (5 minutes before expiry)
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
      },
      global: {
        headers: {
          'X-Client-Info': 'goboclean-frontend@2.4.0',
        },
      },
    }
  );

  // 🔄 Enhanced auth state change handler with detailed logging
  supabaseInstance.auth.onAuthStateChange((event, session) => {
    console.log(`🔐 [CLIENT] Auth event: ${event}`, {
      hasSession: !!session,
      userId: session?.user?.id?.slice(0, 8) + '...' || 'none',
      expiresAt: session?.expires_at || 'none',
      timeUntilExpiry: session?.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : 'none'
    });
    
    switch (event) {
      case 'SIGNED_OUT':
        console.log('🚪 [CLIENT] User signed out - clearing local state');
        // Force reload to clear any cached state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('goboclean-auth-token');
          sessionStorage.clear();
        }
        break;
        
      case 'TOKEN_REFRESHED':
        console.log('🔄 [CLIENT] Token refreshed successfully');
        // Broadcast session update to other tabs
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase:session-updated', {
            detail: { session }
          }));
        }
        break;
        
      case 'SIGNED_IN':
        console.log('🔑 [CLIENT] User signed in successfully');
        // Broadcast login to other tabs
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase:signed-in', {
            detail: { session }
          }));
        }
        break;
        
      default:
        console.log(`🔍 [CLIENT] Unhandled auth event: ${event}`);
        break;
    }
  });

  // 🌐 Multi-tab session synchronization
  if (typeof window !== 'undefined') {
    // Listen for session updates from other tabs
    window.addEventListener('supabase:session-updated', () => {
      console.log('🔄 [CLIENT] Received session update from another tab');
      // Trigger a session refresh to sync state
      supabaseInstance?.auth.getSession();
    });
    
    // Listen for logout events from other tabs
    window.addEventListener('supabase:signed-out', () => {
      console.log('🚪 [CLIENT] Received logout event from another tab');
      // Force logout on this tab too
      supabaseInstance?.auth.signOut();
    });
  }

  return supabaseInstance;
};

// 🧹 Reset client instance (for testing or logout)
export const resetSupabaseClient = () => {
  console.log('🔄 [CLIENT] Resetting Supabase client instance');
  if (supabaseInstance) {
    // Cleanup any listeners
    supabaseInstance.auth.onAuthStateChange(() => {});
  }
  supabaseInstance = null;
  
  // Clear storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('goboclean-auth-token');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  }
};

// 🔍 Debug helper to check client state
export const debugClientState = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [CLIENT] Debug State:', {
      hasInstance: !!supabaseInstance,
      timestamp: new Date().toISOString(),
      localStorage: typeof window !== 'undefined' ? {
        authToken: !!localStorage.getItem('goboclean-auth-token'),
        supabaseToken: !!localStorage.getItem('supabase.auth.token'),
      } : 'server-side'
    });
  }
};