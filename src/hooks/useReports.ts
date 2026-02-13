"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MissionReport } from "@/types/mission";

export const reportKeys = {
  all: ["reports"] as const,
  list: (filters?: Record<string, unknown>) => [...reportKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...reportKeys.all, "detail", id] as const,
};

/**
 * Fetch all reports. Backend filters by role (admin = all, worker = own).
 */
export function useReports(
  filters?: { search?: string; status?: string },
  opts?: Partial<UseQueryOptions<MissionReport[]>>,
) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();

  return useQuery<MissionReport[]>({
    queryKey: reportKeys.list(filters),
    queryFn: () => apiClient.get<MissionReport[]>(`/reports${qs ? `?${qs}` : ""}`),
    staleTime: 30_000,
    ...opts,
  });
}

/**
 * Fetch a single report detail.
 */
export function useReport(id: string, opts?: Partial<UseQueryOptions<MissionReport>>) {
  return useQuery<MissionReport>({
    queryKey: reportKeys.detail(id),
    queryFn: () => apiClient.get<MissionReport>(`/reports/${id}`),
    enabled: !!id,
    staleTime: 30_000,
    ...opts,
  });
}
