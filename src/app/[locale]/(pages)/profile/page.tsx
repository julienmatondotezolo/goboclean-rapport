'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { handleError, showSuccess } from '@/lib/error-handler';
import { PageHeader } from '@/components/ui/page-header';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
import { useAuth } from '@/hooks/useAuth';
import { 
  Key, 
  Bell, 
  Globe, 
  ChevronRight, 
  Loader2,
  LogOut,
  Pencil
} from 'lucide-react';
import { OfflineIndicator, SyncStatusBar } from '@/components/offline-indicator';
import { LoadingBanner } from '@/components/loading-banner';

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations('Profile');
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoading: authLoading, logout } = useAuth();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Derive user data from backend auth
  const fullName = user ? `${user.first_name} ${user.last_name}` : 'User';
  const role = user?.role === 'admin' ? 'Administrator' : 'Worker';

  // Load initial profile data
  useEffect(() => {
    if (user) {
      // Set profile picture from user data if available
      setProfilePicture(user.profile_picture_url || null);
      // TODO: Load push notification preference from backend when API is ready
      setPushNotifications(true);
    }
  }, [user]);

  const handlePushNotificationsToggle = async () => {
    const newValue = !pushNotifications;
    setIsUpdatingPreference(true);

    try {
      // TODO: Implement backend API call for updating push notifications preference
      // Call backend API to update preference
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
      // Create FormData to send to backend
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Send to backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/auth/profile/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
    console.log('🚪 [PROFILE] handleLogout started');
    setIsLoggingOut(true);
    try {
      console.log('🚪 [PROFILE] Calling backend logout...');
      await logout();
      
      console.log('🚪 [PROFILE] Logout successful, showing toast...');
      showSuccess(
        t('logoutSuccess') || 'Logged out',
        t('logoutSuccessDescription') || 'You have been logged out successfully'
      );
      
      console.log('🚪 [PROFILE] Attempting redirect to:', `/${locale}/login`);
      // Force browser redirect to login page
      window.location.href = `/${locale}/login`;
      console.log('🚪 [PROFILE] Redirect call completed');
    } catch (error: any) {
      console.error('🚪 [PROFILE] Logout error:', error);
      handleError(error, { title: t('logoutError') || 'Logout failed' });
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingBanner 
          isLoading={true} 
          message="Loading profile..." 
        />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Loading Banner */}
      <LoadingBanner 
        isLoading={isLoggingOut || isUploadingPicture} 
        message={isLoggingOut ? "Logging out..." : "Uploading picture..."} 
      />
      
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
                  src={profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}&backgroundColor=ffad33`}
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
          data-testid="logout-button"
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

      {/* Sync/Offline Indicators — only visible on profile page */}
      <SyncStatusBar />
      <OfflineIndicator />
    </div>
  );
}