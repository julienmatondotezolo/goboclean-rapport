'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Clock, ClipboardCheck, Bell, Loader2, Battery } from 'lucide-react';
import { MissionCard } from '@/components/ui/mission-card';
import { StatCard } from '@/components/ui/stat-card';
import { useRouter } from '@/i18n/routing';
import { LogoGoBoClean } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { handleSupabaseError } from '@/lib/error-handler';

interface Mission {
  id: string;
  title: string;
  location: string;
  type: 'emergency' | 'scheduled';
  startTime?: string;
  teamMembers?: number;
  status?: 'noodgeval' | 'gepland';
  beforePictures?: string[];
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [userName, setUserName] = useState('Marc');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data for stats
  const weekHours = 38.5;
  const tasksCompleted = 12;
  const totalTasks = 15;
  const highPrioritySites = 3;

  // Dummy missions
  const dummyMissions: Mission[] = [
    {
      id: '2',
      title: 'Floor Degreasing',
      location: 'Manufacturing Plant - Zone A',
      type: 'scheduled',
      startTime: '14:30',
      status: 'gepland',
      beforePictures: [
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
        'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&q=80',
      ],
    },
    {
      id: '3',
      title: 'Ventilation Service',
      location: 'Storage Facility 3',
      type: 'scheduled',
      startTime: 'Tomorrow',
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('first_name, last_name, profile_picture_url')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            handleSupabaseError(profileError, 'Failed to load profile');
          } else if (profile) {
            setUserName(profile.first_name);
            setProfilePicture(profile.profile_picture_url);
          }
        }
      } catch (error) {
        handleSupabaseError(error, 'Dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

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

  const allMissions = [
    {
      id: '1',
      title: 'Chemical Spill cleanup',
      location: 'Logistics Hub - Sector B4',
      type: 'emergency' as const,
      teamMembers: 2,
      status: 'noodgeval' as const,
    },
    ...dummyMissions,
  ];

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
              <h1 className="text-[20px] font-bold leading-none mb-1">GoBoclean Rapport</h1>
              <p className="text-[#a3e635] text-[10px] font-bold tracking-widest uppercase">
                Made with love
              </p>
            </div>
          </div>
          <button className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all active:scale-90">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Welcome Card */}
        <div className="mx-8 bg-white/10 backdrop-blur-md rounded-[24px] p-5 border border-white/10 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                <img 
                  src={profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc&backgroundColor=ffad33&hat=hat&hatColor=ff9900"} 
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
                {t('today')}: {highPrioritySites} {t('highPrioritySites')}
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
            value={weekHours}
            subtitle={t('weekToDate')}
            iconColor="text-[#a3e635]"
          />
          <StatCard
            icon={ClipboardCheck}
            label={t('tasks')}
            value={`${tasksCompleted}/${totalTasks}`}
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
          <button className="text-[14px] font-bold text-[#064e3b] hover:opacity-70 transition-opacity">
            {t('viewAll')}
          </button>
        </div>

        <div className="space-y-4">
          {allMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              type={mission.type}
              title={mission.title}
              location={mission.location}
              startTime={mission.startTime}
              teamMembers={mission.teamMembers}
              status={mission.status}
              onStartJob={() => router.push(`/mission/${mission.id}`)}
              onViewDetails={() => router.push(`/mission/${mission.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
