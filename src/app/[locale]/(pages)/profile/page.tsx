'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Key, 
  Bell, 
  Globe, 
  ChevronRight, 
  Loader2,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Mock user data - replace with your actual user data source
  const fullName = 'Marcus Thorne';
  const role = 'Senior Roofing Specialist';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Add your logout logic here if needed
      toast({
        title: t('logoutSuccess'),
        description: t('logoutSuccessDescription'),
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error: any) {
      toast({
        title: t('logoutError'),
        description: error.message,
        variant: 'destructive',
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Header */}
      <PageHeader title={t('profile')} />
      
      {/* Profile Header */}
      <div className="bg-white pt-8 pb-8 px-8">
        <div className="flex flex-col items-center">
          {/* Avatar with online indicator */}
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-linear-to-br from-[#1a2e1a] to-[#2a3e2a] rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=1a2e1a&hat=hat&hatColor=98d62e"
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#84cc16] rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Name and Role */}
          <h1 className="text-3xl font-black text-[#1a2e1a] mb-2 tracking-tight">
            {fullName}
          </h1>
          <p className="text-[#84cc16] text-sm font-bold tracking-wide">
            {role}
          </p>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="px-8 mt-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 ml-1">
          {t('accountSettings')}
        </h2>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          {/* Change Password */}
          <button 
            className="w-full flex items-center gap-5 px-6 py-5 hover:bg-slate-50 transition-colors active:bg-slate-100 border-b border-slate-100"
            onClick={() => router.push('/profile/change-password')}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-slate-700" strokeWidth={2} />
            </div>
            <span className="flex-1 text-left text-[17px] font-bold text-slate-800">
              {t('changePassword')}
            </span>
            <ChevronRight className="w-6 h-6 text-slate-400" strokeWidth={2.5} />
          </button>

          {/* Push Notifications */}
          <div className="flex items-center gap-5 px-6 py-5 border-b border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-slate-700" strokeWidth={2} />
            </div>
            <span className="flex-1 text-left text-[17px] font-bold text-slate-800">
              {t('pushNotifications')}
            </span>
            {/* Toggle Switch */}
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                pushNotifications 
                  ? 'bg-[#84cc16]' 
                  : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  pushNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <button 
            className="w-full flex items-center gap-5 px-6 py-5 hover:bg-slate-50 transition-colors active:bg-slate-100"
            onClick={() => router.push('/profile/language')}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-slate-700" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <span className="text-[17px] font-bold text-slate-800 block">
                {t('language')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-slate-500 font-semibold">
                {t('currentLanguage')}
              </span>
              <ChevronRight className="w-6 h-6 text-slate-400" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-8 mt-8">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-16 text-lg font-black uppercase tracking-[0.05em] bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-100 flex items-center justify-center gap-3"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              {t('loggingOut')}
            </>
          ) : (
            <>
              <LogOut className="h-6 w-6" strokeWidth={2.5} />
              {t('logout')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
