'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/page-header';
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
  useClearAllNotifications,
} from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import type { AppNotification } from '@/types/mission';

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return '< 1m';
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useNotifications({ enabled: !!user });
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  // Deduplicate notifications by id
  const notifications = useMemo(() => {
    const raw = data?.notifications ?? [];
    return raw.filter(
      (n, index, self) => index === self.findIndex((t) => t.id === n.id),
    );
  }, [data]);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    if (notification.mission_id) {
      router.push(`/mission/${notification.mission_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const handleClearAll = () => {
    clearAll.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-32 font-sans">
        <PageHeader title={t('title')} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
          <span className="ml-3 text-[14px] text-gray-500">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white pb-32 font-sans">
        <PageHeader title={t('title')} />
        <div className="px-6 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[14px] font-bold text-red-700 mb-2">{t('errorLoading')}</p>
          <button
            onClick={() => refetch()}
            className="text-[13px] font-bold text-[#064e3b] hover:underline"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <PageHeader title={t('title')} />

      <div className="px-6 py-6">
        {notifications.length === 0 ? (
          <div className="bg-[#f8fafc] rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-gray-600 mb-1">{t('noNotifications')}</p>
            <p className="text-[13px] text-gray-400">{t('noNotificationsDescription')}</p>
          </div>
        ) : (
          <>
            {/* Clear All button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearAll}
                disabled={clearAll.isPending}
                className="flex items-center gap-2 text-[13px] font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearAll')}
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] relative group ${
                    notification.read
                      ? 'bg-[#f8fafc]'
                      : 'bg-[#f0fdf4] border border-[#a3e635]/20'
                  }`}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-start gap-4 flex-1 min-w-0 text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notification.read ? 'bg-gray-100' : 'bg-[#064e3b]'
                      }`}
                    >
                      <Bell
                        className={`w-5 h-5 ${
                          notification.read ? 'text-gray-400' : 'text-[#a3e635]'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-[15px] leading-tight mb-1 ${
                          notification.read
                            ? 'font-medium text-gray-600'
                            : 'font-bold text-[#1e293b]'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p className="text-[13px] text-[#64748b] line-clamp-2 mb-1.5">
                        {notification.body}
                      </p>
                      <span className="text-[11px] font-medium text-[#94a3b8]">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>

                    {!notification.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635] shrink-0 mt-1.5" />
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    disabled={deleteNotification.isPending}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={t('deleteNotification')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
