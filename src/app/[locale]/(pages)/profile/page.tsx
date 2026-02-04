'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Key, 
  Bell, 
  Globe, 
  ChevronRight, 
  Loader2,
  LogOut,
  Pencil
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Mock user data
  const fullName = 'Marcus Thorne';
  const role = 'Senior Roofing Specialist';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      toast({
        title: t('logoutSuccess'),
        description: t('logoutSuccessDescription'),
      });
      
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
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <PageHeader title={t('profile')} />
      
      {/* Profile Section */}
      <div className="pt-8 pb-10 px-8 flex flex-col items-center">
        {/* Avatar with Edit Button */}
        <div className="relative mb-4">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[3px] border-(--brand-green)/20 p-1">
            <div className="w-full h-full rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Edit Badge */}
          <button className="absolute bottom-1 right-1 w-10 h-10 bg-(--brand-emerald) rounded-full border-[3px] border-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <Pencil className="w-4 h-4 text-white fill-white" />
          </button>
        </div>

        {/* Name and Role */}
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          {fullName}
        </h1>
        <p className="text-(--brand-green) text-[16px] font-semibold">
          {role}
        </p>
      </div>

      {/* Account Settings Section */}
      <div className="px-6 mt-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.05em] text-slate-500 mb-5 ml-1">
          {t('accountSettings')}
        </h2>

        <div className="space-y-3">
          {/* Change Password */}
          <button 
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-[#f1f3f1] rounded-[20px] hover:bg-[#e8ebe8] transition-colors active:scale-[0.98]"
            onClick={() => router.push('/profile/change-password')}
          >
            <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
              <Key className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[17px] font-bold text-slate-900">
              {t('changePassword')}
            </span>
            <ChevronRight className="w-5 h-5 text-slate-300" strokeWidth={3} />
          </button>

          {/* Push Notifications */}
          <div className="w-full flex items-center gap-4 px-4 py-3.5 bg-[#f1f3f1] rounded-[20px]">
            <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
              <Bell className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[17px] font-bold text-slate-900">
              {t('pushNotifications')}
            </span>
            {/* Toggle Switch */}
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-[52px] h-[31px] rounded-full transition-colors duration-200 ${
                pushNotifications ? 'bg-(--brand-green)' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  pushNotifications ? 'translate-x-[21px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <button 
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-[#f1f3f1] rounded-[20px] hover:bg-[#e8ebe8] transition-colors active:scale-[0.98]"
            onClick={() => router.push('/profile/language')}
          >
            <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[17px] font-bold text-slate-900">
              {t('language')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] text-slate-400 font-medium">
                {t('currentLanguage')}
              </span>
              <ChevronRight className="w-5 h-5 text-slate-300" strokeWidth={3} />
            </div>
          </button>
        </div>
      </div>

      {/* Logout Link/Tag */}
      <div className="px-6 mt-10 flex items-center justify-center">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 text-[#d92d20] hover:text-[#b42318] transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" strokeWidth={2.5} />
          )}
          <span className="text-[17px] font-bold uppercase tracking-[0.05em]">
            {t('logout')}
          </span>
        </button>
      </div>
    </div>
  );
}
