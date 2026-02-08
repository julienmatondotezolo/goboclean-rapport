'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AdminStats } from '@/types/mission';

export const statsKeys = {
  all: ['adminStats'] as const,
};

/**
 * Fetch admin dashboard stats.
 */
export function useAdminStats(
  opts?: Partial<UseQueryOptions<AdminStats>>,
) {
  return useQuery<AdminStats>({
    queryKey: statsKeys.all,
    queryFn: () => apiClient.get<AdminStats>('/admin/stats'),
    staleTime: 60_000,
    ...opts,
  });
}
