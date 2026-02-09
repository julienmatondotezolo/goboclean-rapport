'use client';

import { useEffect, useState } from 'react';
import { APIErrorHandler, useOnlineStatus } from './api-error-handler';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface PageLoaderProps {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  timeout?: number; // milliseconds
}

export function PageLoader({ 
  isLoading, 
  error, 
  onRetry, 
  children, 
  timeout = 15000 // 15 seconds default
}: PageLoaderProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setHasTimedOut(true);
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeout]);

  // Handle timeout as an error
  const displayError = error || (hasTimedOut ? new Error('Request timed out. Please check your connection and try again.') : null);

  // Handle cache clearing
  const handleClearCache = async () => {
    try {
      // Clear React Query cache
      if (window.location.pathname) {
        localStorage.removeItem('goboclean-auth');
        localStorage.removeItem('goboclean-user');
        sessionStorage.clear();
      }
      
      // Reload the page
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear cache:', err);
      if (onRetry) onRetry();
    }
  };

  return (
    <APIErrorHandler
      error={displayError}
      isLoading={isLoading && !hasTimedOut}
      isOnline={isOnline}
      onRetry={onRetry}
      onClearCache={handleClearCache}
    >
      {children}
    </APIErrorHandler>
  );
}

/**
 * Loading skeleton for dashboard pages
 */
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse mb-3" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for lists
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
  );
}

/**
 * Simple retry button component
 */
export function RetryButton({ onRetry, isLoading = false }: { onRetry: () => void; isLoading?: boolean }) {
  return (
    <Button
      onClick={onRetry}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Retrying...' : 'Retry'}
    </Button>
  );
}