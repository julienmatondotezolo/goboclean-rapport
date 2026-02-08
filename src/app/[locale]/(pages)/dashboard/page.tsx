'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Clock, ClipboardCheck, Bell, Loader2, AlertCircle } from 'lucide-react';
import { MissionCard } from '@/components/ui/mission-card';
import { StatCard } from '@/components/ui/stat-card';
import { useRouter } from '@/i18n/routing';
import { LogoGoBoClean } from '@/components/ui/logo';
import { handleSupabaseError } from '@/lib/error-handler';
import { useAuth } from '@/hooks/useAuth';
import { useMyMissions, useAllMissions } from '@/hooks/useMissions';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useNotifications } from '@/hooks/useNotifications';
import { OfflineStatusBadge } from '@/components/offline-indicator';
import type { Mission } from '@/types/mission';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Role-based mission fetching: admin sees all, worker sees own
  // Guard all queries with !!user to prevent 401 on login page
  const adminMissionsQuery = useAllMissions({ enabled: !!user && isAdmin });
  const workerMissionsQuery = useMyMissions({ enabled: !!user && !isAdmin });
  const missionsQuery = isAdmin ? adminMissionsQuery : workerMissionsQuery;

  const {
    data: missions,
    isLoading: missionsLoading,
    isError: missionsError,
    refetch: refetchMissions,
  } = missionsQuery;

  // Admin stats (only fetched for admins)
  const {
    data: adminStats,
  } = useAdminStats({ enabled: !!user && isAdmin });

  // Notification count
  const { data: notifData } = useNotifications({ enabled: !!user });
  const unreadCount = notifData?.unreadCount ?? 0;

  // Fetch profile picture
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('profile_picture_url')
            .eq('id', session.user.id)
            .single() as { data: any; error: any };
          if (error) handleSupabaseError(error, 'Failed to load profile');
          else if (profile) setProfilePicture((profile as any).profile_picture_url);
        }
      } catch (error) {
        handleSupabaseError(error, 'Dashboard');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Derive today's missions sorted by appointment time
  const todayMissions = useMemo(() => {
    if (!missions) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return missions
      .filter((m) => {
        const appt = new Date(m.appointment_time);
        return appt >= today && appt < tomorrow && m.status !== 'cancelled';
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_time).getTime() -
          new Date(b.appointment_time).getTime(),
      );
  }, [missions]);

  // Upcoming missions (not today, not cancelled/completed)
  const upcomingMissions = useMemo(() => {
    if (!missions) return [];
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return missions
      .filter((m) => {
        const appt = new Date(m.appointment_time);
        return appt >= tomorrow && m.status !== 'cancelled' && m.status !== 'completed';
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_time).getTime() -
          new Date(b.appointment_time).getTime(),
      )
      .slice(0, 3);
  }, [missions]);

  // Compute stats
  const completedCount = missions?.filter((m) => m.status === 'completed').length ?? 0;
  const totalActive = missions?.filter((m) => m.status !== 'cancelled' && m.status !== 'completed').length ?? 0;
  const weekHours = adminStats?.weekHours ?? 0;
  const tasksDisplay = isAdmin
    ? `${adminStats?.completedToday ?? 0}/${adminStats?.activeMissions ?? totalActive}`
    : `${completedCount}/${(missions?.length ?? 0)}`;

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#064e3b]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#a3e635] mx-auto" />
          <p className="text-white font-bold tracking-widest uppercase text-xs">Loading</p>
        </div>
      </div>
    );
  }

  const userName = user?.first_name ?? 'User';

  // Helper to format mission time
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to format mission date
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Combine today + upcoming for display
  const allDisplayMissions = [...todayMissions, ...upcomingMissions];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans selection:bg-lime-200">
      {/* Dark Green Header with Curved Bottom */}
      <div className="relative bg-[#064e3b] text-white pt-2 pb-24 rounded-b-[40px] shadow-lg overflow-hidden z-0">
        {/* Mobile Status Bar */}
        <div className="px-8 flex items-center justify-between mb-8">
        </div>

        {/* Logo & Notifications */}
        <div className="px-8 flex items-center justify-between mb-8">
          <div className="flex items-center gap-1">
            <div className="w-12 h-12">
              <LogoGoBoClean className="scale-75" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[20px] font-bold leading-none">GoBoclean Rapport</h1>
                <OfflineStatusBadge />
              </div>
              <p className="text-[#a3e635] text-[10px] font-bold tracking-widest uppercase">
                Made with love
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/notifications')}
            className="relative w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Welcome Card */}
        <div className="mx-8 bg-white/10 backdrop-blur-md rounded-[24px] p-5 border border-white/10 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                <img 
                  src={profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=ffad33`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#a3e635] rounded-full border-[3px] border-[#064e3b] shadow-sm"></div>
            </div>
            <div>
              <h2 className="text-[18px] font-bold mb-0.5">
                {t('welcome')}, {userName}
              </h2>
              <p className="text-white/70 text-[14px] font-medium">
                {t('today')}: {todayMissions.length} {t('activeMissions').toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Overlapping the header */}
      <div className="px-8 -mt-14 mb-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Clock}
            label={t('hours')}
            value={isAdmin ? weekHours : todayMissions.length}
            subtitle={isAdmin ? t('weekToDate') : t('today')}
            iconColor="text-[#a3e635]"
          />
          <StatCard
            icon={ClipboardCheck}
            label={t('tasks')}
            value={tasksDisplay}
            subtitle={t('completed')}
            iconColor="text-[#064e3b]"
          />
        </div>
      </div>

      {/* Assigned Missions Section */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[20px] font-bold text-[#1e293b]">
            {t('assignedMissions')}
          </h3>
          <button
            onClick={() => router.push('/schedule')}
            className="text-[14px] font-bold text-[#064e3b] hover:opacity-70 transition-opacity"
          >
            {t('viewAll')}
          </button>
        </div>

        {/* Loading State */}
        {missionsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
            <span className="ml-3 text-[14px] text-gray-500">{t('loading')}</span>
          </div>
        )}

        {/* Error State */}
        {missionsError && !missionsLoading && (
          <div className="bg-red-50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-red-700 mb-2">{t('errorLoading')}</p>
            <button
              onClick={() => refetchMissions()}
              className="text-[13px] font-bold text-[#064e3b] hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!missionsLoading && !missionsError && allDisplayMissions.length === 0 && (
          <div className="bg-[#f8fafc] rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-gray-600 mb-1">{t('noMissions')}</p>
            <p className="text-[13px] text-gray-400">{t('noMissionsDescription')}</p>
          </div>
        )}

        {/* Missions List */}
        {!missionsLoading && !missionsError && allDisplayMissions.length > 0 && (
          <div className="space-y-4">
            {allDisplayMissions.map((mission) => {
              const workerDetail = mission.assigned_workers_details?.[0];
              const workerName = workerDetail
                ? `${workerDetail.first_name} ${workerDetail.last_name}`
                : undefined;

              return (
                <MissionCard
                  key={mission.id}
                  status={mission.status}
                  title={`${mission.client_first_name} ${mission.client_last_name}`}
                  location={mission.client_address}
                  date={formatDate(mission.appointment_time)}
                  startTime={formatTime(mission.appointment_time)}
                  assignedWorkerName={workerName}
                  onClick={() => router.push(`/mission/${mission.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
