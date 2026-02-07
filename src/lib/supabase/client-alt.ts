/**
 * Alternative Supabase client configuration
 * Use this if the default client has issues
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export const createClient = () => {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  client = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
        },
      },
    }
  );

  return client;
};
