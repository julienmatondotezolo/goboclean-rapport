import { createClient } from './supabase/client';
import { User } from '@/types/report';

// Debug utilities for development
if (process.env.NODE_ENV === 'development') {
  import('./debug-session');
  import('./test-session-helper');
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
    const supabase = createClient();
    
    console.log('🔐 AUTH: Starting login for:', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('❌ AUTH: Login failed:', error.message);
      throw error;
    }

    if (!data.user || !data.session) {
      console.error('❌ AUTH: No user/session returned');
      throw new Error('Authentication failed - no session created');
    }

    console.log('✅ AUTH: Login successful for:', data.user.email);
    
    // Session is automatically handled by Supabase SSR
    // Middleware will handle the redirect
    return { 
      user: data.user,
      session: data.session 
    };
  },

  /**
   * Sign up new user
   */
  async signup(signupData: SignupData) {
    const supabase = createClient();
    
    console.log('🔐 AUTH: Starting signup for:', signupData.email);
    
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          phone: signupData.phone,
          role: signupData.role || 'worker',
        },
      },
    });

    if (error) {
      console.error('❌ AUTH: Signup failed:', error.message);
      throw error;
    }

    console.log('✅ AUTH: Signup successful');
    return data;
  },

  /**
   * Sign out user
   * Clears session and redirects to login
   */
  async logout() {
    const supabase = createClient();
    
    console.log('🔐 AUTH: Starting logout');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ AUTH: Logout failed:', error.message);
      throw error;
    }

    console.log('✅ AUTH: Logout successful');
    
    // Force page reload to clear all state
    window.location.href = '/fr/login';
  },

  /**
   * Get current user with profile data
   * Returns null if not authenticated or profile not found
   */
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AUTH: Session error:', sessionError.message);
        return null;
      }
      
      if (!session?.user) {
        return null;
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ AUTH: Profile fetch error:', profileError.message);
        return null;
      }

      return profile;
      
    } catch (error) {
      console.error('❌ AUTH: getCurrentUser error:', error);
      return null;
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    const supabase = createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ AUTH: Get session error:', error.message);
      return null;
    }
    
    return session;
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string) {
    const supabase = createClient();
    
    console.log('🔐 AUTH: Updating password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('❌ AUTH: Password update failed:', error.message);
      throw error;
    }

    console.log('✅ AUTH: Password updated successfully');
  },

  /**
   * Reset password via email
   */
  async resetPassword(email: string) {
    const supabase = createClient();
    
    console.log('🔐 AUTH: Sending password reset for:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    
    if (error) {
      console.error('❌ AUTH: Password reset failed:', error.message);
      throw error;
    }

    console.log('✅ AUTH: Password reset email sent');
  },

  /**
   * Refresh current session
   */
  async refreshSession() {
    const supabase = createClient();
    
    console.log('🔄 AUTH: Refreshing session');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ AUTH: Session refresh failed:', error.message);
      throw error;
    }

    console.log('✅ AUTH: Session refreshed');
    return data;
  },
};