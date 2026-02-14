import { useEffect, useState, useCallback } from 'react';
import { backendAuth } from '@/lib/backend-auth';
import { User } from '@/types/report';

interface UseAuthOptions {
  requireAuth?: boolean;
  requiredRole?: 'worker' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
  error: string | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, requiredRole } = options;
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasRequiredRole: false,
    error: null,
  });

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data = await backendAuth.login(email, password);
      const user = await backendAuth.getCurrentUser();
      
      const hasRole = requiredRole ? user?.role === requiredRole : true;
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        hasRequiredRole: hasRole,
        error: null,
      });
      
      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      throw error;
    }
  }, [requiredRole]);

  // Logout function  
  const logout = useCallback(async () => {
    try {
      await backendAuth.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasRequiredRole: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout request fails
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasRequiredRole: false,
        error: null,
      });
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (backendAuth.isAuthenticated()) {
          const user = await backendAuth.getCurrentUser();
          const hasRole = requiredRole ? user?.role === requiredRole : true;
          
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            hasRequiredRole: hasRole,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasRequiredRole: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        await backendAuth.logout();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasRequiredRole: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    };

    initAuth();
  }, [requiredRole]);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasRequiredRole: state.hasRequiredRole,
    isAdmin: state.user?.role === 'admin',
    isWorker: state.user?.role === 'worker',
    error: state.error,
    
    // Actions
    login,
    logout,
  };
}