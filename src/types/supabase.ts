export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'worker' | 'admin';
          first_name: string;
          last_name: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'worker' | 'admin';
          first_name: string;
          last_name: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'worker' | 'admin';
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          worker_id: string;
          status: 'draft' | 'pending_signature' | 'completed';
          sync_status: 'synced' | 'pending' | 'error';
          
          // Client Info
          client_first_name: string;
          client_last_name: string;
          client_address: string;
          client_phone: string;
          client_latitude: number | null;
          client_longitude: number | null;
          
          // Roof State
          roof_type: string;
          roof_surface: number;
          moss_level: 'low' | 'medium' | 'high';
          
          // Comments
          comments: string | null;
          
          // Signatures
          worker_signature_url: string | null;
          worker_signature_date: string | null;
          client_signature_url: string | null;
          client_signature_date: string | null;
          
          // PDF
          pdf_url: string | null;
          pdf_sent_at: string | null;
          
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          worker_id: string;
          status?: 'draft' | 'pending_signature' | 'completed';
          sync_status?: 'synced' | 'pending' | 'error';
          client_first_name: string;
          client_last_name: string;
          client_address: string;
          client_phone: string;
          client_latitude?: number | null;
          client_longitude?: number | null;
          roof_type: string;
          roof_surface: number;
          moss_level: 'low' | 'medium' | 'high';
          comments?: string | null;
          worker_signature_url?: string | null;
          worker_signature_date?: string | null;
          client_signature_url?: string | null;
          client_signature_date?: string | null;
          pdf_url?: string | null;
          pdf_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          worker_id?: string;
          status?: 'draft' | 'pending_signature' | 'completed';
          sync_status?: 'synced' | 'pending' | 'error';
          client_first_name?: string;
          client_last_name?: string;
          client_address?: string;
          client_phone?: string;
          client_latitude?: number | null;
          client_longitude?: number | null;
          roof_type?: string;
          roof_surface?: number;
          moss_level?: 'low' | 'medium' | 'high';
          comments?: string | null;
          worker_signature_url?: string | null;
          worker_signature_date?: string | null;
          client_signature_url?: string | null;
          client_signature_date?: string | null;
          pdf_url?: string | null;
          pdf_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      photos: {
        Row: {
          id: string;
          report_id: string;
          type: 'before' | 'after';
          url: string;
          storage_path: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          type: 'before' | 'after';
          url: string;
          storage_path: string;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          type?: 'before' | 'after';
          url?: string;
          storage_path?: string;
          order?: number;
          created_at?: string;
        };
      };
      company_settings: {
        Row: {
          id: string;
          company_name: string;
          company_email: string;
          company_phone: string;
          company_address: string;
          logo_url: string | null;
          legal_mentions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          company_email: string;
          company_phone: string;
          company_address: string;
          logo_url?: string | null;
          legal_mentions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          company_email?: string;
          company_phone?: string;
          company_address?: string;
          logo_url?: string | null;
          legal_mentions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'worker' | 'admin';
      report_status: 'draft' | 'pending_signature' | 'completed';
      sync_status: 'synced' | 'pending' | 'error';
      photo_type: 'before' | 'after';
      moss_level: 'low' | 'medium' | 'high';
    };
  };
}
