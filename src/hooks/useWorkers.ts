"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WorkerSummary } from "@/types/mission";

export const workerKeys = {
  all: ["workers"] as const,
  list: () => [...workerKeys.all, "list"] as const,
};

/**
 * Fetch all workers (admin only — used in mission creation step 3).
 */
export function useWorkersList(opts?: Partial<UseQueryOptions<WorkerSummary[]>>) {
  return useQuery<WorkerSummary[]>({
    queryKey: workerKeys.list(),
    queryFn: () => apiClient.get<WorkerSummary[]>("/admin/workers"),
    staleTime: 120_000, // 2 min
    ...opts,
  });
}
