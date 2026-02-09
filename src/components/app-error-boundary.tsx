'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logger from '@/lib/logger';

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
      const errorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        url: window.location.href,
      };
      
      // Log the error
      logger.error('Global JavaScript Error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: event.target ? window.location.href : undefined,
        errorType: 'javascript',
      });
      
      setError(errorInfo);
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo = {
        message: `Unhandled promise rejection: ${event.reason}`,
        timestamp: new Date(),
        url: window.location.href,
      };
      
      // Log the promise rejection
      logger.error('Unhandled Promise Rejection', 
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        reason: event.reason,
        errorType: 'promise_rejection',
      });
      
      setError(errorInfo);
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
    logger.userAction('retry_after_error', 'app_error_boundary', {
      originalError: error?.message,
      errorTimestamp: error?.timestamp,
    });
    
    try {
      // Clear any stuck states
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        logger.info('Service workers cleared during retry');
      }
      
      // Reload the page
      window.location.reload();
    } catch (err) {
      logger.error('Retry failed', err instanceof Error ? err : new Error(String(err)));
      setIsRetrying(false);
    }
  };

  const handleClearData = async () => {
    logger.userAction('clear_data_after_error', 'app_error_boundary', {
      originalError: error?.message,
      errorTimestamp: error?.timestamp,
    });
    
    try {
      // Clear localStorage
      localStorage.clear();
      logger.info('localStorage cleared');
      
      // Clear sessionStorage
      sessionStorage.clear();
      logger.info('sessionStorage cleared');
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          await new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase('GobocleanOfflineDB');
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => reject(deleteReq.error);
          });
          logger.info('IndexedDB cleared successfully');
        } catch (err) {
          logger.warn('IndexedDB clear failed (might not exist)', err instanceof Error ? err : new Error(String(err)));
        }
      }
      
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        logger.info('Service worker caches cleared', { cacheCount: cacheNames.length });
      }
      
      // Reload
      window.location.reload();
    } catch (err) {
      logger.error('Clear data failed', err instanceof Error ? err : new Error(String(err)));
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