'use client';

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: 'worker' | 'admin';
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that only renders children if user is authenticated
 * Middleware handles the redirect, this is for UI protection
 * 
 * Usage:
 * <RequireAuth>
 *   <ProtectedContent />
 * </RequireAuth>
 * 
 * <RequireAuth requiredRole="admin">
 *   <AdminOnlyContent />
 * </RequireAuth>
 */
export function RequireAuth({
  children,
  requiredRole,
  fallback = null,
  loadingFallback,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading, hasRequiredRole } = useAuth({
    requireAuth: true,
    requiredRole,
  });

  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand-emerald" />
        </div>
      )
    );
  }

  if (!isAuthenticated || (requiredRole && !hasRequiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
