// Mission types matching the backend schema

export type MissionStatus = "assigned" | "in_progress" | "waiting_completion" | "completed" | "cancelled";

export type MissionType = "roof";

export type MissionSubtype = "cleaning" | "coating";

export interface MissionFeatures {
  frontParking?: boolean;
  garden?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  veranda?: boolean;
  swimmingPool?: boolean;
  greenhouse?: boolean;
  pergola?: boolean;
  awning?: boolean;
  solarPanels?: boolean;
}

export interface Mission {
  id: string;
  created_by: string;
  assigned_workers: string[];
  status: MissionStatus;

  // Client Info
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email?: string;
  client_address: string;
  client_latitude?: number;
  client_longitude?: number;

  // Appointment
  appointment_time: string; // ISO string

  // Mission Details
  mission_type: MissionType;
  mission_subtypes: MissionSubtype[];
  surface_area?: number;
  facade_count?: number;
  additional_info?: string;

  // Property Features
  features?: MissionFeatures;

  // Timer
  before_pictures_submitted_at?: string;
  completion_unlocked_at?: string;

  // Report references
  pre_report_id?: string;
  final_report_id?: string;

  // Timestamps
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;

  // Populated fields (from joins)
  assigned_workers_details?: WorkerSummary[];
  before_pictures?: string[];
  after_pictures?: string[];
}

export interface WorkerSummary {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture_url?: string;
}

export interface CreateMissionPayload {
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email?: string;
  client_address: string;
  client_latitude?: number;
  client_longitude?: number;
  appointment_time: string;
  mission_type: MissionType;
  mission_subtypes: MissionSubtype[];
  surface_area?: number;
  facade_count?: number;
  additional_info?: string;
  features?: MissionFeatures;
  assigned_workers: string[];
}

export interface RescheduleMissionPayload {
  appointment_time: string;
}

export interface CalendarMissionsParams {
  start: string; // ISO date YYYY-MM-DD
  end: string; // ISO date YYYY-MM-DD
}

export interface ReportPhoto {
  id: string;
  url: string;
  type: "before" | "after";
  order: number;
  report_id: string;
  created_at: string;
  storage_path: string;
}

export interface ReportWorker {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface MissionReport {
  id: string;
  mission_id?: string;
  worker_id: string;
  status: string;
  client_first_name: string;
  client_last_name: string;
  client_address: string;
  worker_first_name?: string;
  worker_last_name?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mission?: Mission;
  worker?: ReportWorker;
  worker_signature_url?: string | null;
  worker_signature_date?: string | null;
  client_signature_url?: string | null;
  client_signature_date?: string | null;
  photos?: ReportPhoto[];
}

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  mission_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  totalMissions: number;
  activeMissions: number;
  completedToday: number;
  weekHours: number;
  totalWorkers: number;
}
