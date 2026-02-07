import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types/report';

interface UseAuthOptions {
  requireAuth?: boolean;
  requiredRole?: 'worker' | 'admin';
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, requiredRole } = options;
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            
            // Check role if required
            if (requiredRole) {
              setHasRequiredRole(profile.role === requiredRole);
            } else {
              setHasRequiredRole(true);
            }
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setHasRequiredRole(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Refresh user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            setHasRequiredRole(
              requiredRole ? profile.role === requiredRole : true
            );
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth, requiredRole]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
  };
}
