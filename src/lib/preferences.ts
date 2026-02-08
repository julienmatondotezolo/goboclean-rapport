import { createClient } from "@/lib/supabase/client";

export type Language = "en" | "fr" | "nl";

export interface UserPreferences {
  language: Language;
  push_notifications_enabled: boolean;
  stay_connected: boolean;
}

const PREFERENCES_KEY = "user_preferences";
const LAST_SYNC_KEY = "preferences_last_sync";
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Preferences Service
 * Uses hybrid storage: Database as source of truth, localStorage for caching
 */
export class PreferencesService {
  /**
   * Get user preferences (from cache or database)
   */
  static async getPreferences(): Promise<UserPreferences | null> {
    try {
      // Try to get from cache first
      const cached = this.getCachedPreferences();
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      const now = Date.now();

      // If cache is recent (< 5 minutes), use it
      if (cached && lastSync && now - parseInt(lastSync) < SYNC_INTERVAL) {
        return cached;
      }

      // Otherwise, fetch from database
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("language, push_notifications_enabled, stay_connected")
        .eq("id", session.user.id)
        .single() as { data: any; error: any };

      if (error || !user) {
        console.error("Failed to fetch preferences:", error);
        return cached; // Return cached if available
      }

      const preferences: UserPreferences = {
        language: user.language as Language,
        push_notifications_enabled: user.push_notifications_enabled,
        stay_connected: user.stay_connected,
      };

      // Update cache
      this.setCachedPreferences(preferences);

      return preferences;
    } catch (error) {
      console.error("Error getting preferences:", error);
      return this.getCachedPreferences();
    }
  }

  /**
   * Update user preferences (updates both database and cache)
   */
  static async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: "No active session" };
      }

      // Call backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/auth/preferences`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || "Failed to update preferences" };
      }

      const result = await response.json();

      // Update cache
      if (result.preferences) {
        this.setCachedPreferences(result.preferences);
      }

      return { success: true, preferences: result.preferences };
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update language preference
   */
  static async updateLanguage(language: Language): Promise<boolean> {
    const result = await this.updatePreferences({ language });
    return result.success;
  }

  /**
   * Update push notifications preference
   */
  static async updatePushNotifications(enabled: boolean): Promise<boolean> {
    const result = await this.updatePreferences({ push_notifications_enabled: enabled });
    return result.success;
  }

  /**
   * Update stay connected preference
   */
  static async updateStayConnected(enabled: boolean): Promise<boolean> {
    const result = await this.updatePreferences({ stay_connected: enabled });
    return result.success;
  }

  /**
   * Get cached preferences from localStorage
   */
  private static getCachedPreferences(): UserPreferences | null {
    try {
      const cached = localStorage.getItem(PREFERENCES_KEY);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error("Error reading cached preferences:", error);
      return null;
    }
  }

  /**
   * Set cached preferences in localStorage
   */
  private static setCachedPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error caching preferences:", error);
    }
  }

  /**
   * Clear cached preferences
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem(LAST_SYNC_KEY);
    } catch (error) {
      console.error("Error clearing preferences cache:", error);
    }
  }

  /**
   * Force sync preferences from database
   */
  static async forceSync(): Promise<UserPreferences | null> {
    this.clearCache();
    return this.getPreferences();
  }
}
