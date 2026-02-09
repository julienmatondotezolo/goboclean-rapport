'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
}

export function AppErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      setError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        url: window.location.href,
      });
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError({
        message: `Unhandled promise rejection: ${event.reason}`,
        timestamp: new Date(),
        url: window.location.href,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Clear any stuck states
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Reload the page
      window.location.reload();
    } catch (err) {
      console.error('Retry failed:', err);
      setIsRetrying(false);
    }
  };

  const handleClearData = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          await new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase('GobocleanOfflineDB');
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        } catch (err) {
          console.log('IndexedDB clear failed (might not exist):', err);
        }
      }
      
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Reload
      window.location.reload();
    } catch (err) {
      console.error('Clear data failed:', err);
      alert('Clear data failed. Please manually clear your browser cache and reload.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
            <CardDescription>
              The app encountered an error and needs to be restarted.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
              <p className="font-medium text-red-600">Error:</p>
              <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {error.timestamp.toLocaleString()}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
              
              <Button 
                onClick={handleClearData}
                variant="outline"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data & Reload
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              If the problem persists, try closing the app completely and reopening it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}