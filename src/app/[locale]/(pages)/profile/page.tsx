'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { handleError, showSuccess } from '@/lib/error-handler';
import { PageHeader } from '@/components/ui/page-header';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
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
  const t = useTranslations('Profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [fullName, setFullName] = useState('User');
  const [role, setRole] = useState('Worker');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('first_name, last_name, role, profile_picture_url, push_notifications_enabled')
          .eq('id', session.user.id)
          .single() as { data: any; error: any };

        if (error) {
          throw error;
        }

        if (profile) {
          setFullName(`${profile.first_name} ${profile.last_name}`);
          setRole(profile.role === 'admin' ? 'Administrator' : 'Worker');
          setProfilePicture(profile.profile_picture_url);
          setPushNotifications(profile.push_notifications_enabled ?? true);
        }
      } catch (error) {
        handleError(error, { title: 'Failed to load profile' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handlePushNotificationsToggle = async () => {
    const newValue = !pushNotifications;
    setIsUpdatingPreference(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call backend API to update preference
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          push_notifications_enabled: newValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification preference');
      }

      // Subscribe / unsubscribe from Web Push
      if (newValue) {
        const { subscribeToPush } = await import('@/lib/push-notifications');
        await subscribeToPush();
      } else {
        const { unsubscribeFromPush } = await import('@/lib/push-notifications');
        await unsubscribeFromPush();
      }

      setPushNotifications(newValue);
      
      showSuccess(
        t('notificationUpdated') || 'Notification preference updated',
        newValue 
          ? (t('notificationsEnabled') || 'Push notifications enabled')
          : (t('notificationsDisabled') || 'Push notifications disabled')
      );
    } catch (error: any) {
      handleError(error, { title: t('notificationError') || 'Failed to update notification preference' });
      // Revert on error
      setPushNotifications(!newValue);
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      handleError(new Error('Please select an image file'), { title: 'Invalid file type' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      handleError(new Error('Image size must be less than 5MB'), { title: 'File too large' });
      return;
    }

    setIsUploadingPicture(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Create FormData to send to backend
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Send to backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/auth/profile/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile picture');
      }

      const result = await response.json();

      // Update local state with new picture URL
      if (result.user?.profile_picture_url) {
        setProfilePicture(result.user.profile_picture_url);
      }

      showSuccess(
        t('profilePictureUpdated') || 'Profile picture updated',
        t('profilePictureUpdatedDescription') || 'Your profile picture has been updated successfully'
      );
    } catch (error: any) {
      handleError(error, { title: t('profilePictureError') || 'Failed to update profile picture' });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Log logout activity before signing out
      const { logUserLogout } = await import('@/lib/user-activity');
      await logUserLogout();

      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      showSuccess(
        t('logoutSuccess') || 'Logged out',
        t('logoutSuccessDescription') || 'You have been logged out successfully'
      );
      
      // Small delay for toast to show
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error: any) {
      handleError(error, { title: t('logoutError') || 'Logout failed' });
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <PageHeader title={t('profile')} />
      
      {/* Profile Section */}
      <div className="pt-8 pb-10 px-8 flex flex-col items-center">
        {/* Avatar with Edit Button */}
        <div className="relative mb-4">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[3px] border-[#064e3b]/20 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {isUploadingPicture ? (
                <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
              ) : (
                <img 
                  src={profilePicture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          {/* Edit Badge */}
          <label 
            htmlFor="profile-picture-input"
            className="absolute bottom-1 right-1 w-10 h-10 bg-[#064e3b] rounded-full border-[3px] border-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
          >
            {isUploadingPicture ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Pencil className="w-4 h-4 text-white fill-white" />
            )}
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
            disabled={isUploadingPicture}
          />
        </div>

        {/* Name and Role */}
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          {fullName}
        </h1>
        <p className="text-[#064e3b] text-[16px] font-semibold">
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
              onClick={handlePushNotificationsToggle}
              disabled={isUpdatingPreference}
              className={`relative w-[52px] h-[31px] rounded-full transition-colors duration-200 ${
                pushNotifications ? 'bg-[#064e3b]' : 'bg-slate-300'
              } ${isUpdatingPreference ? 'opacity-50' : ''}`}
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
            onClick={() => setIsLanguageModalOpen(true)}
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

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </div>
  );
}
