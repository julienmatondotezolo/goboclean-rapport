'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface APIErrorHandlerProps {
  error?: Error | null;
  isLoading?: boolean;
  isOnline?: boolean;
  onRetry?: () => void;
  onClearCache?: () => void;
  children?: React.ReactNode;
  fallbackMessage?: string;
}

export function APIErrorHandler({
  error,
  isLoading = false,
  isOnline = true,
  onRetry,
  onClearCache,
  children,
  fallbackMessage = "Something went wrong. Please try again."
}: APIErrorHandlerProps) {

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show offline state
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>You're offline</CardTitle>
            <CardDescription>
              Check your internet connection and try again.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <Wifi className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <p className="text-xs text-center text-muted-foreground">
              Some features may be available offline.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
    const isTimeoutError = error.message.includes('timeout');
    const isServerError = error.message.includes('500') || error.message.includes('502') || error.message.includes('503');

    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>
              {isNetworkError ? 'Connection Error' : 
               isTimeoutError ? 'Request Timeout' :
               isServerError ? 'Server Error' : 
               'Error'}
            </CardTitle>
            <CardDescription>
              {isNetworkError ? 'Unable to connect to the server.' :
               isTimeoutError ? 'The request took too long to complete.' :
               isServerError ? 'The server is experiencing issues.' :
               fallbackMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error.message}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              {onClearCache && (
                <Button onClick={onClearCache} variant="outline" className="w-full">
                  Clear Cache & Retry
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              {isNetworkError && (
                <p>• Check your internet connection</p>
              )}
              {isTimeoutError && (
                <p>• Try again in a few moments</p>
              )}
              {isServerError && (
                <p>• The server will be back online shortly</p>
              )}
              <p>• If the problem persists, contact support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show children if no error
  return <>{children}</>;
}

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}