'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AppNotification, PushSubscriptionPayload } from '@/types/mission';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

/**
 * Fetch notifications (list + unread count).
 */
export function useNotifications(
  opts?: Partial<UseQueryOptions<NotificationsResponse>>,
) {
  return useQuery<NotificationsResponse>({
    queryKey: notificationKeys.list(),
    queryFn: () => apiClient.get<NotificationsResponse>('/notifications'),
    staleTime: 15_000,
    refetchInterval: 60_000, // poll every minute
    ...opts,
  });
}

/**
 * Mark a notification as read.
 */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Subscribe to push notifications.
 */
export function useSubscribePush() {
  return useMutation({
    mutationFn: (sub: PushSubscriptionPayload) =>
      apiClient.post('/notifications/subscribe', sub),
  });
}

/**
 * Unsubscribe from push notifications.
 */
export function useUnsubscribePush() {
  return useMutation({
    mutationFn: () => apiClient.delete('/notifications/unsubscribe'),
  });
}
