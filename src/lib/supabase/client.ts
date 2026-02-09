import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Check if we're in the browser
          if (typeof document === 'undefined') {
            return null;
          }
          
          // Use document.cookie instead of trying to parse
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
              return decodeURIComponent(value);
            }
          }
          return null;
        },
        set(name: string, value: string, options: any) {
          // Check if we're in the browser
          if (typeof document === 'undefined') {
            return;
          }
          
          let cookie = `${name}=${encodeURIComponent(value)}`;
          
          if (options.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options.path) {
            cookie += `; path=${options.path}`;
          }
          if (options.domain) {
            cookie += `; domain=${options.domain}`;
          }
          if (options.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          }
          if (options.secure) {
            cookie += '; secure';
          }
          
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          this.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};
