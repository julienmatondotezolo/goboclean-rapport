// @ts-nocheck
/**
 * User Activity Tracking Service
 * Tracks user logins and logouts
 * TODO: Remove or replace with backend API calls
 */

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

class UserActivityService {
  async logActivity(
    userId: string,
    activityType: 'login' | 'logout',
    additionalData?: any
  ): Promise<boolean> {
    // TODO: Replace with backend API call
    console.log('Activity logged (mock):', { userId, activityType, additionalData });
    return true;
  }

  async getActivityHistory(userId: string): Promise<ActivityLog[]> {
    // TODO: Replace with backend API call
    console.log('Getting activity history (mock):', userId);
    return [];
  }

  async cleanupOldActivities(): Promise<number> {
    // TODO: Replace with backend API call
    console.log('Cleaning up old activities (mock)');
    return 0;
  }

  async logLogin(userId: string): Promise<boolean> {
    return this.logActivity(userId, 'login');
  }

  async logLogout(userId: string): Promise<boolean> {
    return this.logActivity(userId, 'logout');
  }
}

export const userActivityService = new UserActivityService();