import { createClient } from './supabase/client';

/**
 * Check if user is authenticated (client-side only)
 * Returns null if checking, true if authenticated, false if not
 */
export async function checkAuthStatus(): Promise<boolean | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth status check error:', error);
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
}

/**
 * Force logout and cleanup
 */
export async function forceLogout(): Promise<void> {
  try {
    const supabase = createClient();
    
    // Sign out
    await supabase.auth.signOut();
    
    // Clear any localStorage auth data
    if (typeof window !== 'undefined') {
      // Clear common auth storage keys
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('token')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    console.log('🔐 Force logout completed');
  } catch (error) {
    console.error('Force logout error:', error);
  }
}

/**
 * Get redirect URL for login
 */
export function getLoginRedirectUrl(currentPath?: string): string {
  const redirectPath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // Don't redirect back to auth pages
  const authPages = ['/login', '/signup', '/auth/callback', '/set-password'];
  const isAuthPage = authPages.some(page => redirectPath.startsWith(page));
  
  if (isAuthPage || !redirectPath || redirectPath === '/') {
    return '/login';
  }
  
  return `/login?redirect=${encodeURIComponent(redirectPath)}`;
}

/**
 * Handle auth errors consistently
 */
export function handleAuthError(error: any): string {
  console.error('Auth error:', error);
  
  if (!error?.message) return 'An unknown error occurred';
  
  // Common Supabase auth errors with user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please check your email and click the confirmation link',
    'User not found': 'No account found with this email address',
    'Too many requests': 'Too many login attempts. Please try again later',
    'Signup disabled': 'Account creation is currently disabled',
    'Weak password': 'Please choose a stronger password',
  };
  
  return errorMappings[error.message] || error.message;
}

/**
 * Check if we're on the server side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}