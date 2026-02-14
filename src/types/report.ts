import { z } from 'zod';

// Enums
export const RoofType = {
  SLATE: 'slate',
  TERRACOTTA: 'terracotta',
  CONCRETE: 'concrete',
  METAL: 'metal',
  SHINGLE: 'shingle',
  OTHER: 'other',
} as const;

export const MossLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const ReportStatus = {
  DRAFT: 'draft',
  PENDING_SIGNATURE: 'pending_signature',
  COMPLETED: 'completed',
} as const;

export const SyncStatus = {
  SYNCED: 'synced',
  PENDING: 'pending',
  ERROR: 'error',
} as const;

// Validation Schemas
export const clientInfoSchema = z.object({
  client_first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  client_last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  client_address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  client_phone: z.string().regex(/^(\+32|0)[0-9]{8,9}$/, 'Numéro de téléphone invalide'),
  client_latitude: z.number().optional().nullable(),
  client_longitude: z.number().optional().nullable(),
});

export const roofStateSchema = z.object({
  roof_type: z.enum([
    RoofType.SLATE,
    RoofType.TERRACOTTA,
    RoofType.CONCRETE,
    RoofType.METAL,
    RoofType.SHINGLE,
    RoofType.OTHER,
  ]),
  roof_surface: z.number().min(1, 'La surface doit être supérieure à 0').max(10000),
  moss_level: z.enum([MossLevel.LOW, MossLevel.MEDIUM, MossLevel.HIGH]),
});

export const photosSchema = z.object({
  before_photos: z.array(z.instanceof(File)).min(2, 'Minimum 2 photos requises'),
  after_photos: z.array(z.instanceof(File)).min(2, 'Minimum 2 photos requises'),
});

export const commentsSchema = z.object({
  comments: z.string().optional(),
});

export const reportFormSchema = z.object({
  ...clientInfoSchema.shape,
  ...roofStateSchema.shape,
  comments: z.string().optional(),
});

// Types
export type ClientInfo = z.infer<typeof clientInfoSchema>;
export type RoofState = z.infer<typeof roofStateSchema>;
export type Photos = z.infer<typeof photosSchema>;
export type Comments = z.infer<typeof commentsSchema>;
export type ReportForm = z.infer<typeof reportFormSchema>;

export interface Photo {
  id: string;
  report_id: string;
  type: 'before' | 'after';
  url: string;
  storage_path: string;
  order: number;
  file?: File;
  preview?: string;
}

export interface Report {
  id: string;
  worker_id: string;
  status: keyof typeof ReportStatus;
  sync_status: keyof typeof SyncStatus;
  
  client_first_name: string;
  client_last_name: string;
  client_address: string;
  client_phone: string;
  client_latitude?: number | null;
  client_longitude?: number | null;
  
  roof_type: keyof typeof RoofType;
  roof_surface: number;
  moss_level: keyof typeof MossLevel;
  
  comments?: string | null;
  
  worker_signature_url?: string | null;
  worker_signature_date?: string | null;
  client_signature_url?: string | null;
  client_signature_date?: string | null;
  
  pdf_url?: string | null;
  pdf_sent_at?: string | null;
  
  photos?: Photo[];
  
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: 'worker' | 'admin';
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_active: boolean;
  is_onboarded?: boolean;
  profile_picture_url?: string | null;
  language?: 'en' | 'fr' | 'nl';
  push_notifications_enabled?: boolean;
  stay_connected?: boolean;
}
