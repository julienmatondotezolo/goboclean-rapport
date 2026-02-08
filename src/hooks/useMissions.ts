'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Mission,
  CreateMissionPayload,
  RescheduleMissionPayload,
  CalendarMissionsParams,
} from '@/types/mission';

// ─── Query Keys ──────────────────────────────────────────────

export const missionKeys = {
  all: ['missions'] as const,
  lists: () => [...missionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...missionKeys.lists(), filters] as const,
  calendar: (params: CalendarMissionsParams) =>
    [...missionKeys.all, 'calendar', params] as const,
  details: () => [...missionKeys.all, 'detail'] as const,
  detail: (id: string) => [...missionKeys.details(), id] as const,
  my: (filters?: Record<string, unknown>) =>
    [...missionKeys.all, 'my', filters ?? {}] as const,
};

// ─── Queries ─────────────────────────────────────────────────

/**
 * Worker's own missions (uses default GET /missions which filters by RLS)
 */
export function useMyMissions(
  opts?: Partial<UseQueryOptions<Mission[]>>,
) {
  return useQuery<Mission[]>({
    queryKey: missionKeys.my(),
    queryFn: () => apiClient.get<Mission[]>('/missions'),
    staleTime: 30_000,
    ...opts,
  });
}

/**
 * Admin view — all missions across all workers.
 */
export function useAllMissions(
  opts?: Partial<UseQueryOptions<Mission[]>>,
) {
  return useQuery<Mission[]>({
    queryKey: missionKeys.lists(),
    queryFn: () => apiClient.get<Mission[]>('/missions'),
    staleTime: 30_000,
    ...opts,
  });
}

/**
 * Single mission detail
 */
export function useMission(
  id: string,
  opts?: Partial<UseQueryOptions<Mission>>,
) {
  return useQuery<Mission>({
    queryKey: missionKeys.detail(id),
    queryFn: () => apiClient.get<Mission>(`/missions/${id}`),
    enabled: !!id,
    staleTime: 20_000,
    ...opts,
  });
}

/**
 * Calendar missions in a date range
 */
export function useCalendarMissions(
  params: CalendarMissionsParams,
  opts?: Partial<UseQueryOptions<Mission[]>>,
) {
  return useQuery<Mission[]>({
    queryKey: missionKeys.calendar(params),
    queryFn: () =>
      apiClient.get<Mission[]>(
        `/missions/calendar?start=${params.start}&end=${params.end}`,
      ),
    enabled: !!params.start && !!params.end,
    staleTime: 30_000,
    ...opts,
  });
}

// ─── Mutations ───────────────────────────────────────────────

/**
 * Create a new mission (admin only)
 */
export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMissionPayload) =>
      apiClient.post<Mission>('/missions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Start a mission (worker)
 */
export function useStartMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<Mission>(`/missions/${id}/start`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: missionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Upload before-pictures (worker)
 */
export function useUploadBeforePictures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      onProgress,
    }: {
      id: string;
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) => apiClient.upload<Mission>(`/missions/${id}/before-pictures`, formData, onProgress),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: missionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Complete mission — upload after-pictures + signatures (worker)
 */
export function useCompleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      onProgress,
    }: {
      id: string;
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) => apiClient.upload<Mission>(`/missions/${id}/complete`, formData, onProgress),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: missionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Update mission details (admin only)
 */
export function useUpdateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMissionPayload> & { status?: string } }) =>
      apiClient.patch<Mission>(`/missions/${id}`, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: missionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Delete a mission (admin only)
 */
export function useDeleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/missions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Reschedule mission (admin only — drag-to-reschedule)
 */
export function useRescheduleMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleMissionPayload }) =>
      apiClient.patch<Mission>(`/missions/${id}/reschedule`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}
