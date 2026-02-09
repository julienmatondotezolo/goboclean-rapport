import { createBrowserClient, SupabaseClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// 🔐 Singleton pattern to prevent session conflicts between multiple users
let supabaseInstance: SupabaseClient<Database> | null = null;

export const createClient = (): SupabaseClient<Database> => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance with proper session isolation
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // 🎯 Enable automatic session refresh
        autoRefreshToken: true,
        // 🔒 Persist session across page reloads
        persistSession: true,
        // 🏠 Detect session changes across tabs
        detectSessionInUrl: true,
        // 📱 Storage key for session isolation
        storageKey: 'goboclean-auth-token',
      },
      cookies: {
        get(name: string) {
          // Safely parse cookies with error handling
          try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [key, value] = cookie.trim().split('=');
              if (key === name) {
                return decodeURIComponent(value);
              }
            }
            return null;
          } catch (error) {
            console.warn('Cookie parse error:', error);
            return null;
          }
        },
        set(name: string, value: string, options: any = {}) {
          try {
            let cookie = `${name}=${encodeURIComponent(value)}`;
            
            // Default options for security
            const defaultOptions = {
              path: '/',
              sameSite: 'lax',
              secure: window.location.protocol === 'https:',
              maxAge: 86400 * 30, // 30 days
            };

            const finalOptions = { ...defaultOptions, ...options };
            
            if (finalOptions.maxAge) {
              cookie += `; max-age=${finalOptions.maxAge}`;
            }
            if (finalOptions.path) {
              cookie += `; path=${finalOptions.path}`;
            }
            if (finalOptions.domain) {
              cookie += `; domain=${finalOptions.domain}`;
            }
            if (finalOptions.sameSite) {
              cookie += `; samesite=${finalOptions.sameSite}`;
            }
            if (finalOptions.secure) {
              cookie += '; secure';
            }
            
            document.cookie = cookie;
          } catch (error) {
            console.warn('Cookie set error:', error);
          }
        },
        remove(name: string, options: any = {}) {
          try {
            this.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.warn('Cookie remove error:', error);
          }
        },
      },
    }
  );

  // 🔄 Global error handling for session issues
  supabaseInstance.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' && !session) {
      console.log('🔐 Session ended globally');
    }
    if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed globally');
    }
  });

  return supabaseInstance;
};

// 🧹 Reset client instance (for testing or logout)
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
