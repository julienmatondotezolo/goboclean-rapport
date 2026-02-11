import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// 🔐 Singleton pattern to prevent session conflicts between multiple users
let supabaseInstance: SupabaseClient<Database> | null = null;

export const createClient = (): SupabaseClient<Database> => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 🧹 Migration: Clear old localStorage-based session
  // This ensures users with old sessions will need to re-login with the new cookie-based system
  if (typeof window !== "undefined") {
    try {
      const oldStorageKey = "goboclean-auth-token";
      if (localStorage.getItem(oldStorageKey)) {
        console.log("🔄 Migrating from localStorage to cookie-based auth");
        localStorage.removeItem(oldStorageKey);
      }
    } catch (error) {
      console.warn("Failed to clear old auth storage:", error);
    }
  }

  // Create new instance with proper session isolation
  // Use default cookie storage so middleware can read the session
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 🔄 Global error handling for session issues
  supabaseInstance.auth.onAuthStateChange((event: string, session: any) => {
    if (event === "SIGNED_OUT" && !session) {
      console.log("🔐 Session ended globally");
    }
    if (event === "TOKEN_REFRESHED") {
      console.log("🔄 Token refreshed globally");
    }
  });

  return supabaseInstance;
};

// 🧹 Reset client instance (for testing or logout)
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
