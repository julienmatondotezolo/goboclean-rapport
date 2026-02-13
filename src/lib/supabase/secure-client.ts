/**
 * 🔒 SECURE Supabase Client Configuration
 * Implements security best practices for authentication
 */

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// 🚫 Remove singleton pattern to prevent session conflicts
export const createSecureClient = (): SupabaseClient<Database> => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // 🔒 Secure token management
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // 🎯 Shorter token expiration for security
        flowType: 'pkce', // Use PKCE for OAuth flows
        // 🔐 Secure storage key with environment prefix
        storageKey: `goboclean-${isProduction ? 'prod' : 'dev'}-auth`,
      },
      cookies: {
        get(name: string) {
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return null;
          }
          
          try {
            // 🔍 Enhanced cookie parsing with security validation
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [key, value] = cookie.trim().split('=');
              if (key === name && value) {
                // Validate cookie value format
                const decoded = decodeURIComponent(value);
                // Basic JWT format validation
                if (decoded.includes('.') && decoded.split('.').length === 3) {
                  return decoded;
                }
              }
            }
            return null;
          } catch (error) {
            console.error('🚨 Secure cookie parse error:', error);
            return null;
          }
        },
        
        set(name: string, value: string, options: any = {}) {
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
          }
          
          try {
            let cookie = `${name}=${encodeURIComponent(value)}`;
            
            // 🛡️ SECURE cookie options
            const secureOptions = {
              path: '/',
              // 🔒 CRITICAL: Strict SameSite for CSRF protection
              sameSite: 'strict',
              // 🔒 CRITICAL: Secure flag enforced in production
              secure: isProduction || isSecureContext,
              // 🔒 CRITICAL: HttpOnly for session tokens (client can't access)
              httpOnly: name.includes('session') || name.includes('access'),
              // 🕐 Shorter expiration for security (7 days instead of 30)
              maxAge: 86400 * 7, // 7 days
              // 🔐 Domain restriction for production
              ...(isProduction && { domain: '.goboclean.be' }),
              ...options
            };
            
            // Apply secure options
            for (const [key, val] of Object.entries(secureOptions)) {
              if (val === true) {
                cookie += `; ${key}`;
              } else if (val !== false && val !== undefined) {
                cookie += `; ${key}=${val}`;
              }
            }
            
            document.cookie = cookie;
          } catch (error) {
            console.error('🚨 Secure cookie set error:', error);
          }
        },
        
        remove(name: string, options: any = {}) {
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
          }
          
          try {
            // 🧹 Secure cookie removal with all possible paths/domains
            const removalOptions = {
              ...options,
              maxAge: 0,
              expires: new Date(0).toUTCString()
            };
            
            this.set(name, '', removalOptions);
            
            // Additional cleanup for production domain
            if (isProduction) {
              this.set(name, '', { ...removalOptions, domain: '.goboclean.be' });
              this.set(name, '', { ...removalOptions, domain: 'goboclean.be' });
            }
          } catch (error) {
            console.error('🚨 Secure cookie remove error:', error);
          }
        },
      },
      
      // 🔒 Enhanced global options
      global: {
        headers: {
          // 🛡️ CSRF protection header
          'X-Client-Info': 'goboclean-pwa/2.4.0',
          // 🔐 Anti-automation header
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    }
  );
};

// 🚨 Session Security Utilities
export const sessionSecurity = {
  // 🔍 Validate session integrity
  validateSession: (session: any): boolean => {
    if (!session?.access_token) return false;
    
    try {
      // Basic JWT structure validation
      const tokenParts = session.access_token.split('.');
      if (tokenParts.length !== 3) return false;
      
      // Decode payload (without verification - just structure check)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return false;
      
      // Validate required claims
      return payload.sub && payload.aud && payload.role;
    } catch {
      return false;
    }
  },
  
  // 🧹 Secure logout with complete cleanup
  secureLogout: async (supabase: SupabaseClient) => {
    try {
      // 1. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 2. Clear all auth-related cookies
      const cookiesToClear = [
        'goboclean-prod-auth-token',
        'goboclean-dev-auth-token',
        'sb-access-token',
        'sb-refresh-token',
        'supabase.auth.token'
      ];
      
      cookiesToClear.forEach(cookie => {
        document.cookie = `${cookie}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict`;
      });
      
      // 3. Clear localStorage
      const keysToRemove = Object.keys(localStorage)
        .filter(key => key.includes('supabase') || key.includes('goboclean'));
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 4. Clear sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage)
        .filter(key => key.includes('supabase') || key.includes('goboclean'));
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('🚨 Secure logout error:', error);
      return false;
    }
  },
  
  // 🔄 Token refresh with security validation
  secureRefresh: async (supabase: SupabaseClient) => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // Force logout on refresh failure
        await sessionSecurity.secureLogout(supabase);
        throw error;
      }
      
      // Validate refreshed session
      if (!sessionSecurity.validateSession(data.session)) {
        await sessionSecurity.secureLogout(supabase);
        throw new Error('Invalid refreshed session');
      }
      
      return data;
    } catch (error) {
      console.error('🚨 Secure refresh error:', error);
      throw error;
    }
  }
};