import Dexie, { Table } from 'dexie';
import { Report, Photo } from '@/types/report';

export interface OfflineReport extends Omit<Report, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  local_id: string;
  created_at?: string;
  updated_at?: string;
  needs_sync: boolean;
  sync_attempts: number;
  last_sync_error?: string;
}

export interface OfflinePhoto extends Omit<Photo, 'id' | 'url'> {
  id?: string;
  local_id: string;
  local_report_id: string;
  file_data: Blob;
  needs_sync: boolean;
}

export interface OfflineSignature {
  id?: string;
  local_id: string;
  local_report_id: string;
  type: 'worker' | 'client';
  data_url: string;
  timestamp: string;
  needs_sync: boolean;
}

export interface SyncQueue {
  id?: number;
  entity_type: 'report' | 'photo' | 'signature';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  created_at: string;
  attempts: number;
  last_error?: string;
}

class RoofReportDB extends Dexie {
  offline_reports!: Table<OfflineReport, string>;
  offline_photos!: Table<OfflinePhoto, string>;
  offline_signatures!: Table<OfflineSignature, string>;
  sync_queue!: Table<SyncQueue, number>;

  constructor() {
    super('RoofReportDB');
    
    this.version(1).stores({
      offline_reports: 'local_id, worker_id, status, sync_status, needs_sync, created_at',
      offline_photos: 'local_id, local_report_id, type, needs_sync',
      offline_signatures: 'local_id, local_report_id, type, needs_sync',
      sync_queue: '++id, entity_type, entity_id, action, created_at, attempts',
    });
  }
}

export const db = new RoofReportDB();

// Helper functions
export const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const addToSyncQueue = async (
  entity_type: SyncQueue['entity_type'],
  entity_id: string,
  action: SyncQueue['action'],
  data: any
) => {
  await db.sync_queue.add({
    entity_type,
    entity_id,
    action,
    data,
    created_at: new Date().toISOString(),
    attempts: 0,
  });
};

export const clearSyncQueue = async (id: number) => {
  await db.sync_queue.delete(id);
};

export const getSyncQueue = async () => {
  return await db.sync_queue.orderBy('created_at').toArray();
};
