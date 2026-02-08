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
        const { getPendingSyncItems } = await import('@/lib/offline-store');
        const items = await getPendingSyncItems();
        setPendingSyncCount(items.length);
      } catch (error) {
        // Silently fail
      }
    };

    updatePendingCount();

    // Update count periodically
    const interval = setInterval(updatePendingCount, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [syncStatus]); // Re-run when sync status changes

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