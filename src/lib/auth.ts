import { backendAuth } from './backend-auth';
import { User } from '@/types/report';

// Debug utilities for development
if (process.env.NODE_ENV === 'development') {
  import('./debug-session');
  // test-session-helper removed (was Supabase-dependent)
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'worker' | 'admin';
}

/**
 * Modern authentication service using Supabase SSR patterns
 * Handles login/logout with proper session management
 */
export const authService = {
  /**
   * Sign in user with email/password
   * Returns user data on success, throws on error
   */
  async login(credentials: LoginCredentials) {
    console.log('🔐 AUTH: Starting login for:', credentials.email);
    
    const data = await backendAuth.login(credentials.email, credentials.password);
    const user = await backendAuth.getCurrentUser();

    console.log('✅ AUTH: Login successful for:', user.email);
    
    return { 
      user,
      session: { access_token: backendAuth.getToken() }
    };
  },

  /**
   * Sign up new user (not implemented for backend auth)
   */
  async signup(signupData: SignupData) {
    throw new Error('Signup not implemented for backend auth');
  },

  /**
   * Sign out user
   * Clears session and redirects to login
   */
  async logout() {
    console.log('🔐 AUTH: Starting logout');
    
    await backendAuth.logout();

    console.log('✅ AUTH: Logout successful');
    
    // Force page reload to clear all state
    window.location.href = '/fr/login';
  },

  /**
   * Get current user with profile data
   * Returns null if not authenticated or profile not found
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!backendAuth.isAuthenticated()) {
        return null;
      }

      return await backendAuth.getCurrentUser();
      
    } catch (error) {
      console.error('❌ AUTH: getCurrentUser error:', error);
      return null;
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    const token = backendAuth.getToken();
    if (!token) return null;
    
    return { access_token: token };
  },

  /**
   * Update user password (not implemented for backend auth)
   */
  async updatePassword(newPassword: string) {
    throw new Error('Password update not implemented for backend auth');
  },

  /**
   * Reset password via email (not implemented for backend auth)
   */
  async resetPassword(email: string) {
    throw new Error('Password reset not implemented for backend auth');
  },

  /**
   * Refresh current session
   */
  async refreshSession() {
    // For backend auth, just check if token is still valid
    const user = await backendAuth.getCurrentUser();
    return { user, session: { access_token: backendAuth.getToken() } };
  },
};