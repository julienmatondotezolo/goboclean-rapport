'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, ClipboardCheck, Bell, Loader2, AlertCircle } from 'lucide-react';
import { MissionCard } from '@/components/ui/mission-card';
import { StatCard } from '@/components/ui/stat-card';
import { useRouter } from '@/i18n/routing';
import { LogoGoBoClean } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { OfflineStatusBadge } from '@/components/offline-indicator';
import { LoadingBanner } from '@/components/loading-banner';
import type { Mission } from '@/types/mission';

// Demo data matching actual Mission interface
const DEMO_MISSIONS: Mission[] = [
  {
    id: '1',
    created_by: 'admin-1',
    assigned_workers: ['worker-1'],
    status: 'assigned',
    client_first_name: 'Jean',
    client_last_name: 'Dubois',
    client_phone: '+32 56 123 456',
    client_email: 'dubois@email.be',
    client_address: 'Rue de la Paix 15, 8500 Kortrijk',
    appointment_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    mission_type: 'roof',
    mission_subtypes: ['cleaning'],
    surface_area: 120,
    additional_info: 'Nettoyage complet de la toiture avec démoussage',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2', 
    created_by: 'admin-1',
    assigned_workers: ['worker-1'],
    status: 'in_progress',
    client_first_name: 'Restaurant',
    client_last_name: 'De Garre',
    client_phone: '+32 50 341 029',
    client_email: 'info@degarre.be', 
    client_address: 'Grand Place 8, 8000 Bruges',
    appointment_time: new Date().toISOString(),
    mission_type: 'roof',
    mission_subtypes: ['cleaning'],
    surface_area: 200,
    additional_info: 'Nettoyage haute pression de la façade principale',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    created_by: 'admin-1', 
    assigned_workers: ['worker-1'],
    status: 'completed',
    client_first_name: 'TechCorp',
    client_last_name: 'NV',
    client_phone: '+32 56 789 123',
    client_email: 'facility@techcorp.be',
    client_address: 'Businesspark 42, 8790 Waregem',
    appointment_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    mission_type: 'roof',
    mission_subtypes: ['cleaning'],
    surface_area: 80,
    additional_info: 'Nettoyage vitres intérieur/extérieur - 2ème étage',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  }
];

const DEMO_ADMIN_STATS = {
  totalMissions: 15,
  completedMissions: 8,
  pendingMissions: 4,
  inProgressMissions: 3,
  activeWorkers: 3,
  totalRevenue: 4250,
  avgMissionDuration: 195,
  customerSatisfaction: 4.8
};

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Demo notification count

  // Demo data with loading simulation
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState(DEMO_ADMIN_STATS);

  // Simulate data loading
  useEffect(() => {
    const loadDemoData = () => {
      setTimeout(() => {
        if (isAdmin) {
          setMissions(DEMO_MISSIONS);
        } else {
          // Worker only sees assigned missions
          setMissions(DEMO_MISSIONS.filter(m => m.assigned_workers.includes('worker-1')));
        }
        setMissionsLoading(false);
      }, 1000); // 1 second loading simulation
    };

    if (user) {
      loadDemoData();
    }
  }, [user, isAdmin]);

  // Simulate profile picture loading
  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      setTimeout(() => {
        // Demo profile picture URL - use a placeholder since User type doesn't have profile_picture_url
        setProfilePicture(null);
        setProfileLoading(false);
      }, 500);
    }
  }, [user]);

  // Computed stats for cards
  const todayMissions = useMemo(() => {
    if (!missions) return [];
    const today = new Date().toDateString();
    return missions.filter(mission => 
      new Date(mission.appointment_time).toDateString() === today
    );
  }, [missions]);

  const pendingMissions = useMemo(() => {
    if (!missions) return [];
    return missions.filter(mission => 
      mission.status === 'assigned' || mission.status === 'in_progress'
    );
  }, [missions]);

  const completedMissionsCount = useMemo(() => {
    if (!missions) return 0;
    return missions.filter(mission => mission.status === 'completed').length;
  }, [missions]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingBanner />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <LogoGoBoClean className="h-8 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <OfflineStatusBadge />
              
              {/* Notifications */}
              <button
                onClick={() => router.push('/notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {profileLoading ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                ) : profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.first_name} {user.last_name}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome', { name: user.first_name })}
          </h2>
          <p className="text-gray-600">
            {isAdmin ? t('adminSubtitle') : t('subtitle')}
          </p>
          
          {/* Demo Mode Indicator */}
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            🎯 Mode Démo - Données d'exemple pour présentation
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label={t('todayMissions')}
            value={todayMissions.length}
            subtitle="Today's schedule"
            icon={Clock}
          />
          <StatCard
            label={t('pendingMissions')}
            value={pendingMissions.length}
            subtitle="In progress"
            icon={AlertCircle}
          />
          <StatCard
            label={t('completedMissions')}
            value={completedMissionsCount}
            subtitle="Finished"
            icon={ClipboardCheck}
          />
          {isAdmin && (
            <StatCard
              label="Revenue Total"
              value={`€${adminStats.totalRevenue}`}
              subtitle="This month"
              icon={ClipboardCheck}
            />
          )}
        </div>

        {/* Missions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {isAdmin ? t('allMissions') : t('myMissions')}
              </h3>
              {isAdmin && (
                <button
                  onClick={() => router.push('/missions/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  {t('newMission')}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {missionsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">{t('loadingMissions')}</p>
              </div>
            ) : missions.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{t('noMissions')}</p>
                <p className="text-sm text-gray-500">{t('noMissionsSubtext')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {missions.slice(0, 5).map((mission) => (
                  <MissionCard 
                    key={mission.id}
                    status={mission.status}
                    title={`${mission.client_first_name} ${mission.client_last_name}`}
                    location={mission.client_address}
                    date={new Date(mission.appointment_time).toLocaleDateString()}
                    startTime={new Date(mission.appointment_time).toLocaleTimeString()}
                    assignedWorkerName={mission.assigned_workers.length > 0 ? `Worker ${mission.assigned_workers[0]}` : undefined}
                    onClick={() => router.push(`/mission/${mission.id}`)}
                  />
                ))}
                {missions.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => router.push('/missions')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('viewAllMissions')} ({missions.length - 5} {t('more')})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}