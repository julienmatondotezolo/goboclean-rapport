import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  console.log('🚀 [SERVER] Creating server Supabase client');

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          console.log(`🍪 [SERVER] GET Cookie ${name}: ${cookie ? 'EXISTS' : 'MISSING'}`);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`🍪 [SERVER] SET Cookie ${name}: ${value ? 'SETTING' : 'CLEARING'}`);
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(`⚠️ [SERVER] Failed to set cookie ${name}:`, error);
            // This can happen in middleware when cookies are already sent
          }
        },
        remove(name: string, options: CookieOptions) {
          console.log(`🍪 [SERVER] REMOVE Cookie ${name}`);
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn(`⚠️ [SERVER] Failed to remove cookie ${name}:`, error);
          }
        },
      },
      auth: {
        debug: process.env.NODE_ENV === 'development',
        flowType: 'pkce',
      },
    }
  );
};

// Legacy alias for backward compatibility
export const createServerClient = createServerSupabaseClient;

// Helper function to get session with error handling
export const getServerSession = async () => {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [SERVER] Session error:', error.message);
      return null;
    }
    
    console.log('✅ [SERVER] Session retrieved:', {
      hasSession: !!session,
      userId: session?.user?.id?.slice(0, 8) + '...' || 'none',
      expiresAt: session?.expires_at || 'none',
      isExpired: session?.expires_at ? session.expires_at <= Date.now() / 1000 : 'unknown'
    });
    
    return session;
  } catch (error) {
    console.error('❌ [SERVER] Failed to get session:', error);
    return null;
  }
};

// Helper function to get user profile with session
export const getServerUser = async () => {
  try {
    const session = await getServerSession();
    if (!session) return null;
    
    const supabase = await createServerSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('❌ [SERVER] User profile error:', error.message);
      return null;
    }
    
    console.log('✅ [SERVER] User profile retrieved:', {
      userId: user?.id?.slice(0, 8) + '...' || 'none',
      email: user?.email || 'none',
      role: user?.role || 'none',
      isOnboarded: user?.is_onboarded || false
    });
    
    return user;
  } catch (error) {
    console.error('❌ [SERVER] Failed to get user:', error);
    return null;
  }
};