import { apiClient } from "./api-client";
import {
  offlineDB,
  getPendingSyncItems,
  removeFromSyncQueue,
  updateSyncQueueItem,
  updateSettings,
  type SyncQueueItem,
  cacheReport,
  cacheNotifications,
  getCachedReport,
} from "./offline-store";
import type { Report, Photo } from "@/types/report";
import type { AppNotification } from "@/types/mission";

export type SyncStatus = "idle" | "syncing" | "error" | "completed";

export interface SyncResult {
  status: SyncStatus;
  syncedCount: number;
  errorCount: number;
  errors: string[];
}

/**
 * Background sync manager for offline-first functionality
 */
export class SyncManager {
  private syncInProgress = false;
  private retryDelays = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff
  private onStatusChange?: (status: SyncStatus, result?: SyncResult) => void;

  /**
   * Set a callback for sync status changes
   */
  onSyncStatusChange(callback: (status: SyncStatus, result?: SyncResult) => void): void {
    this.onStatusChange = callback;
  }

  /**
   * Check if online
   */
  private isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  /**
   * Sync all pending changes to the server
   */
  async sync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { status: "syncing", syncedCount: 0, errorCount: 0, errors: [] };
    }

    if (!this.isOnline()) {
      return { status: "error", syncedCount: 0, errorCount: 1, errors: ["No internet connection"] };
    }

    this.syncInProgress = true;
    this.onStatusChange?.("syncing");

    try {
      await updateSettings({ sync_in_progress: true });

      const pendingItems = await getPendingSyncItems();
      let syncedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process sync queue items
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await removeFromSyncQueue(item.id!);
          syncedCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`${item.type}: ${errorMessage}`);

          // Update retry count and schedule retry
          await updateSyncQueueItem(item.id!, errorMessage);

          // Remove if too many retries
          if (item.retry_count >= this.retryDelays.length) {
            await removeFromSyncQueue(item.id!);
          }
        }
      }

      // Sync down fresh data from server
      try {
        await this.syncDownData();
      } catch (error) {
        errors.push("Failed to sync down data: " + (error instanceof Error ? error.message : "Unknown error"));
        errorCount++;
      }

      const result: SyncResult = {
        status: errorCount > 0 ? "error" : "completed",
        syncedCount,
        errorCount,
        errors,
      };

      await updateSettings({
        sync_in_progress: false,
        last_sync_at: new Date().toISOString(),
        sync_error_count: errorCount,
      });

      this.onStatusChange?.("completed", result);
      return result;
    } catch (error) {
      const result: SyncResult = {
        status: "error",
        syncedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : "Sync failed"],
      };

      await updateSettings({
        sync_in_progress: false,
        sync_error_count: 1,
      });

      this.onStatusChange?.("error", result);
      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single queue item to the server
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case "mission_start":
        await this.syncMissionStart(item);
        break;

      case "mission_complete":
        await this.syncMissionComplete(item);
        break;

      case "photo_upload":
        await this.syncPhotoUpload(item);
        break;

      case "notification_read":
        await this.syncNotificationRead(item);
        break;

      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  /**
   * Sync mission start to server
   */
  private async syncMissionStart(item: SyncQueueItem): Promise<void> {
    const response = await apiClient.post<{ mission: Report }>(`/missions/${item.entity_id}/start`, item.data);

    // Update local cache with server response (conflict resolution: server wins)
    if (response.mission) {
      await cacheReport(response.mission);
    }
  }

  /**
   * Sync mission completion to server
   */
  private async syncMissionComplete(item: SyncQueueItem): Promise<void> {
    const { signatures, comments } = item.data;

    // Complete the mission
    const response = await apiClient.post<{ mission: Report }>(`/missions/${item.entity_id}/complete`, {
      worker_signature_data: signatures.workerSignature,
      client_signature_data: signatures.clientSignature,
      comments,
    });

    // Update local cache with server response
    if (response.mission) {
      await cacheReport(response.mission);
    }
  }

  /**
   * Sync photo upload to server
   */
  private async syncPhotoUpload(item: SyncQueueItem): Promise<void> {
    const { missionId, type, files } = item.data;

    // Create FormData for upload
    const formData = new FormData();
    files.forEach((fileData: { file: Blob; filename: string }, index: number) => {
      formData.append("files", fileData.file, fileData.filename);
    });

    const response = await apiClient.upload<{ photos: Photo[] }>(`/missions/${missionId}/photos/${type}`, formData);

    // Update local cache with server URLs
    if (response.photos) {
      for (const photo of response.photos) {
        await offlineDB.photos.update(photo.id, {
          url: photo.url,
          storage_path: photo.storage_path,
        });
      }
    }
  }

  /**
   * Sync notification read status
   */
  private async syncNotificationRead(item: SyncQueueItem): Promise<void> {
    await apiClient.patch(`/notifications/${item.entity_id}/read`);

    // Update local cache
    await offlineDB.notifications.update(item.entity_id, {
      read_at: new Date().toISOString(),
      has_pending_read: false,
    });
  }

  /**
   * Sync down fresh data from server
   */
  private async syncDownData(): Promise<void> {
    try {
      // Fetch fresh missions
      const missionsResponse = await apiClient.get<{ missions: Report[] }>("/missions");

      if (missionsResponse.missions) {
        // Cache each mission
        for (const mission of missionsResponse.missions) {
          await cacheReport(mission, mission.photos);
        }
      }

      // Fetch fresh notifications
      const notificationsResponse = await apiClient.get<{ notifications: AppNotification[] }>("/notifications");

      if (notificationsResponse.notifications) {
        await cacheNotifications(notificationsResponse.notifications);
      }
    } catch (error) {
      // Don't fail the entire sync if download fails
      throw new Error("Failed to download fresh data");
    }
  }

  /**
   * Handle online/offline state changes
   */
  setupOnlineListener(): (() => void) | void {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      // Automatically sync when coming back online
      setTimeout(() => this.sync(), 1000);
    };

    const handleOffline = () => {
      this.onStatusChange?.("idle");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }

  /**
   * Auto-sync at regular intervals when online
   */
  setupPeriodicSync(intervalMs: number = 5 * 60 * 1000): () => void {
    const interval = setInterval(() => {
      if (this.isOnline() && !this.syncInProgress) {
        this.sync();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Conflict resolution: Check if local changes would conflict with server
   * For now, we implement "server wins" - local changes are discarded if conflict
   */
  async resolveConflicts(localReport: Report): Promise<void> {
    try {
      // Fetch current server version
      const serverReport = await apiClient.get<Report>(`/missions/${localReport.id}`);

      // Check if server version is newer
      if (new Date(serverReport.updated_at) > new Date(localReport.updated_at)) {
        // Server wins - update local cache
        await cacheReport(serverReport, serverReport.photos);

        // Show notification to user
        if (typeof window !== "undefined") {
          // We could show a toast notification here about conflict resolution
        }
      }
    } catch (error) {
      // If we can't fetch server version, keep local version
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();

/**
 * Initialize sync manager with event listeners
 */
export function initializeSyncManager(): () => void {
  const cleanupOnline = syncManager.setupOnlineListener();
  const cleanupPeriodic = syncManager.setupPeriodicSync();

  // Initial sync if online
  if (navigator.onLine) {
    setTimeout(() => syncManager.sync(), 2000);
  }

  return () => {
    cleanupOnline?.();
    cleanupPeriodic?.();
  };
}

/**
 * Queue a mission start for sync
 */
export async function queueMissionStart(missionId: string, data: any): Promise<void> {
  const { addToSyncQueue } = await import("./offline-store");
  await addToSyncQueue("mission_start", missionId, data, 10); // High priority
}

/**
 * Queue a mission completion for sync
 */
export async function queueMissionComplete(missionId: string, data: any): Promise<void> {
  const { addToSyncQueue } = await import("./offline-store");
  await addToSyncQueue("mission_complete", missionId, data, 10); // High priority
}

/**
 * Queue photo uploads for sync
 */
export async function queuePhotoUpload(
  missionId: string,
  type: "before" | "after",
  files: { file: Blob; filename: string }[],
): Promise<void> {
  const { addToSyncQueue } = await import("./offline-store");
  await addToSyncQueue("photo_upload", missionId, { missionId, type, files }, 5); // Medium priority
}

/**
 * Queue notification read for sync
 */
export async function queueNotificationRead(notificationId: string): Promise<void> {
  const { addToSyncQueue } = await import("./offline-store");
  await addToSyncQueue("notification_read", notificationId, {}, 1); // Low priority
}
