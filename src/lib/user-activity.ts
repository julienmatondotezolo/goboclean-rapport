// @ts-nocheck
/**
 * User Activity Tracking Service
 * Tracks user logins and logouts
 */

import { createClient } from './supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: any;
}

export interface UserStats {
  login_count: number;
  last_login_at: string | null;
  last_logout_at: string | null;
  is_onboarded: boolean;
}

/**
 * Log user login activity
 */
export async function logUserLogin() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    // Get device info
    const deviceInfo = {
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Log the activity
    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: session.user.id,
        activity_type: 'login',
        user_agent: navigator.userAgent,
        device_info: deviceInfo,
      });

    if (error) {
      console.error('Failed to log login activity:', error);
    }
  } catch (error) {
    console.error('Error logging login:', error);
  }
}

/**
 * Log user logout activity
 */
export async function logUserLogout() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    // Log the activity
    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: session.user.id,
        activity_type: 'logout',
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Failed to log logout activity:', error);
    }
  } catch (error) {
    console.error('Error logging logout:', error);
  }
}

/**
 * Get user activity statistics
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('login_count, last_login_at, last_logout_at, is_onboarded')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

/**
 * Get user activity history
 */
export async function getUserActivityHistory(
  userId: string,
  limit: number = 10
): Promise<ActivityLog[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting activity history:', error);
    return [];
  }
}

/**
 * Check if this is user's first login
 */
export async function isFirstLogin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('login_count, is_onboarded')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // First login if login_count is 0 or 1 (just logged in) and not onboarded
    return (data.login_count <= 1 && !data.is_onboarded);
  } catch (error) {
    console.error('Error checking first login:', error);
    return false;
  }
}

/**
 * Mark user as onboarded
 */
export async function markUserAsOnboarded(userId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({ is_onboarded: true })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking user as onboarded:', error);
    throw error;
  }
}
