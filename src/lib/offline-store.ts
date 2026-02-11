import Dexie, { type Table } from "dexie";
import type { Report, Photo, User } from "@/types/report";
import type { AppNotification } from "@/types/mission";

// Extended interfaces for offline storage
export interface OfflineReport extends Report {
  // Offline-specific fields
  offline_updated_at?: string;
  has_pending_changes?: boolean;
}

export interface OfflinePhoto extends Photo {
  // Store actual file blob for offline access
  blob?: Blob;
  blob_size?: number;
  offline_updated_at?: string;
}

export interface OfflineNotification extends AppNotification {
  offline_read_at?: string;
  has_pending_read?: boolean;
}

export interface SyncQueueItem {
  id?: number;
  type: "mission_start" | "mission_complete" | "photo_upload" | "notification_read";
  entity_id: string; // mission ID, photo ID, etc.
  data: any; // The data to sync
  created_at: string;
  retry_count: number;
  last_error?: string;
  priority: number; // Higher = more important
}

export interface AppSettings {
  id: "main";
  last_sync_at?: string;
  sync_in_progress: boolean;
  sync_error_count: number;
}

/**
 * IndexedDB database for offline storage using Dexie
 */
export class OfflineDatabase extends Dexie {
  // Tables
  reports!: Table<OfflineReport>;
  photos!: Table<OfflinePhoto>;
  notifications!: Table<OfflineNotification>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<AppSettings>;

  constructor() {
    super("GobocleanOfflineDB");

    // Use a high version number to ensure we're always upgrading, not downgrading
    // Version 21: Current schema with compound index for syncQueue
    this.version(21).stores({
      reports: "id, worker_id, status, sync_status, created_at, updated_at, offline_updated_at, has_pending_changes",
      photos: "id, report_id, type, order, storage_path, blob_size, offline_updated_at",
      notifications: "id, user_id, type, created_at, read_at, offline_read_at, has_pending_read",
      syncQueue: "++id, type, entity_id, created_at, retry_count, priority, [priority+created_at]",
      settings: "id",
    });

    // Hooks
    // Timestamps are set manually when writing to tables
  }
}

// Singleton instance
export const offlineDB = new OfflineDatabase();

/**
 * Check if database is ready
 */
export function isDatabaseReady(): boolean {
  try {
    return offlineDB.isOpen();
  } catch {
    return false;
  }
}

/**
 * Initialize the offline database
 */
export async function initializeOfflineDB(): Promise<void> {
  try {
    await offlineDB.open();

    // Initialize settings if not exists
    const settings = await offlineDB.settings.get("main");
    if (!settings) {
      await offlineDB.settings.put({
        id: "main",
        sync_in_progress: false,
        sync_error_count: 0,
      });
    }
  } catch (error: any) {
    // If there's a version error, delete the database and try again
    if (error.name === "VersionError" || error.message?.includes("version")) {
      console.warn("IndexedDB version conflict detected. Recreating database...");
      try {
        await offlineDB.delete();
        await offlineDB.open();

        // Initialize settings
        await offlineDB.settings.put({
          id: "main",
          sync_in_progress: false,
          sync_error_count: 0,
        });
        console.log("Database recreated successfully");
      } catch (retryError) {
        console.error("Failed to recreate database:", retryError);
        throw new Error("Failed to initialize offline database after version conflict");
      }
    } else {
      console.error("Failed to initialize offline database:", error);
      throw new Error("Failed to initialize offline database");
    }
  }
}

/**
 * Clear all offline data (useful for logout)
 */
export async function clearOfflineData(): Promise<void> {
  await offlineDB.transaction(
    "rw",
    [offlineDB.reports, offlineDB.photos, offlineDB.notifications, offlineDB.syncQueue],
    async () => {
      await offlineDB.reports.clear();
      await offlineDB.photos.clear();
      await offlineDB.notifications.clear();
      await offlineDB.syncQueue.clear();
    },
  );
}

/**
 * Get cache status and statistics
 */
export async function getOfflineStats(): Promise<{
  reportCount: number;
  photoCount: number;
  notificationCount: number;
  pendingSyncCount: number;
  totalCacheSize: number;
  lastSyncAt?: string;
}> {
  const [reportCount, photoCount, notificationCount, pendingSyncCount, settings] = await Promise.all([
    offlineDB.reports.count(),
    offlineDB.photos.count(),
    offlineDB.notifications.count(),
    offlineDB.syncQueue.count(),
    offlineDB.settings.get("main"),
  ]);

  // Calculate total cache size (approximate)
  const photoSizes = await offlineDB.photos.toArray();
  const totalCacheSize = photoSizes.reduce((sum, photo) => sum + (photo.blob_size || 0), 0);

  return {
    reportCount,
    photoCount,
    notificationCount,
    pendingSyncCount,
    totalCacheSize,
    lastSyncAt: settings?.last_sync_at,
  };
}

/**
 * Store a report in offline cache
 */
export async function cacheReport(report: Report, photos?: Photo[]): Promise<void> {
  await offlineDB.transaction("rw", [offlineDB.reports, offlineDB.photos], async () => {
    // Store report
    await offlineDB.reports.put({
      ...report,
      offline_updated_at: new Date().toISOString(),
    });

    // Store photos if provided
    if (photos) {
      for (const photo of photos) {
        await offlineDB.photos.put({
          ...photo,
          offline_updated_at: new Date().toISOString(),
        });
      }
    }
  });
}

/**
 * Store a photo blob in offline cache
 */
export async function cachePhotoBlob(photoId: string, blob: Blob): Promise<void> {
  await offlineDB.photos.update(photoId, {
    blob,
    blob_size: blob.size,
    offline_updated_at: new Date().toISOString(),
  });
}

/**
 * Get a cached report with photos
 */
export async function getCachedReport(reportId: string): Promise<OfflineReport | null> {
  const report = await offlineDB.reports.get(reportId);
  if (!report) return null;

  // Get associated photos
  const photos = await offlineDB.photos.where("report_id").equals(reportId).toArray();

  return {
    ...report,
    photos: photos.map((photo) => ({
      ...photo,
      preview: photo.blob ? URL.createObjectURL(photo.blob) : undefined,
    })),
  };
}

/**
 * Get all cached reports
 */
export async function getCachedReports(): Promise<OfflineReport[]> {
  return offlineDB.reports.orderBy("created_at").reverse().toArray();
}

/**
 * Cache notifications
 */
export async function cacheNotifications(notifications: AppNotification[]): Promise<void> {
  const offlineNotifications: OfflineNotification[] = notifications.map((notif) => ({
    ...notif,
    offline_read_at: notif.is_read ? new Date().toISOString() : undefined,
  }));

  await offlineDB.notifications.bulkPut(offlineNotifications);
}

/**
 * Get cached notifications
 */
export async function getCachedNotifications(): Promise<OfflineNotification[]> {
  return offlineDB.notifications.orderBy("created_at").reverse().toArray();
}

/**
 * Add an item to the sync queue
 */
export async function addToSyncQueue(
  type: SyncQueueItem["type"],
  entityId: string,
  data: any,
  priority: number = 1,
): Promise<void> {
  await offlineDB.syncQueue.add({
    type,
    entity_id: entityId,
    data,
    created_at: new Date().toISOString(),
    retry_count: 0,
    priority,
  });
}

/**
 * Get pending sync items ordered by priority and creation time
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    // Check if database is ready
    if (!isDatabaseReady()) {
      console.warn("Database not ready, returning empty sync queue");
      return [];
    }

    // Add timeout to prevent hanging
    const result = await Promise.race([
      offlineDB.syncQueue
        .orderBy(["priority", "created_at"])
        .reverse() // Higher priority first, then newer items
        .toArray(),
      new Promise<SyncQueueItem[]>((_, reject) => setTimeout(() => reject(new Error("Database query timeout")), 3000)),
    ]);
    return result;
  } catch (error) {
    console.error("Failed to get pending sync items:", error);
    return []; // Return empty array on error to prevent app hanging
  }
}

/**
 * Remove an item from sync queue
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  await offlineDB.syncQueue.delete(id);
}

/**
 * Update sync queue item with retry information
 */
export async function updateSyncQueueItem(id: number, error?: string): Promise<void> {
  const item = await offlineDB.syncQueue.get(id);
  if (item) {
    await offlineDB.syncQueue.update(id, {
      retry_count: item.retry_count + 1,
      last_error: error,
    });
  }
}

/**
 * Update settings
 */
export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  await offlineDB.settings.update("main", updates);
}
