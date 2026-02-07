import { createClient } from './supabase/client';
import { User } from '@/types/report';

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

export const authService = {
  async login(credentials: LoginCredentials) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    // Don't fetch profile here - let the app fetch it after redirect
    // This avoids RLS issues during the login flow
    return { user: data.user };
  },

  async signup(signupData: SignupData) {
    const supabase = createClient();
    
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

    if (error) throw error;

    return data;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) return null;

    return profile;
  },

  async updatePassword(newPassword: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },
};
