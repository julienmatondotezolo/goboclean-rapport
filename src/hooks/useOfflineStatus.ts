import { useState, useEffect } from 'react';
import { syncManager, type SyncStatus, type SyncResult } from '@/lib/sync-manager';

export interface OfflineStatusInfo {
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncResult?: SyncResult;
  pendingSyncCount: number;
  lastSyncAt?: string;
}

/**
 * Hook for monitoring online/offline status and sync state
 */
export function useOfflineStatus(): OfflineStatusInfo {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult>();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string>();

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor sync status
  useEffect(() => {
    syncManager.onSyncStatusChange((status, result) => {
      setSyncStatus(status);
      if (result) {
        setLastSyncResult(result);
        if (status === 'completed') {
          setLastSyncAt(new Date().toISOString());
        }
      }
    });
  }, []);

  // Monitor pending sync count
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const { getPendingSyncItems, isDatabaseReady } = await import('@/lib/offline-store');
        
        // Check if database is ready before querying
        if (!isDatabaseReady()) {
          setPendingSyncCount(0);
          return;
        }
        
        const items = await Promise.race([
          getPendingSyncItems(),
          new Promise<[]>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        setPendingSyncCount(items.length);
      } catch (error) {
        // Silently fail - database might not be ready
        // Don't log to avoid console spam
        setPendingSyncCount(0);
      }
    };

    // Only check once on mount, don't poll continuously
    // This prevents constant database queries that can block the app
    updatePendingCount();

    // Only re-check when sync status actually changes
    // No periodic polling to avoid blocking queries
  }, [syncStatus]); // Only re-run when sync status changes

  return {
    isOnline,
    syncStatus,
    lastSyncResult,
    pendingSyncCount,
    lastSyncAt,
  };
}

/**
 * Hook for triggering manual sync
 */
export function useManualSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const result = await syncManager.sync();
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    triggerSync,
  };
}