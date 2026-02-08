'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { handleError, showSuccess } from '@/lib/error-handler';
import { markUserAsOnboarded } from '@/lib/user-activity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { Loader2, Upload, User, ArrowRight, Camera } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations('Onboarding');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // Get existing user data
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, profile_picture_url, is_onboarded')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        // If already onboarded, redirect to dashboard
        if (userData.is_onboarded) {
          router.push('/dashboard');
          return;
        }

        // Pre-fill with existing data
        if (userData.first_name) setFirstName(userData.first_name);
        if (userData.last_name) setLastName(userData.last_name);
        if (userData.profile_picture_url) setProfilePicturePreview(userData.profile_picture_url);
      }
    };

    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePicture || !userId) return null;

    setIsUploading(true);
    try {
      const supabase = createClient();
      
      // Create unique filename
      const fileExt = profilePicture.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, profilePicture, {
          cacheControl: '3600',
          upsert: true, // Replace if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      handleError(error, { title: 'Failed to upload profile picture' });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      handleError(new Error('Please enter your first and last name'), { title: 'Required fields' });
      return;
    }

    if (!userId) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (profilePicture) {
        profilePictureUrl = await uploadProfilePicture();
      }

      // Update user profile
      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };

      if (profilePictureUrl) {
        updateData.profile_picture_url = profilePictureUrl;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Mark user as onboarded
      await markUserAsOnboarded(userId);

      showSuccess(
        t('success') || 'Profile completed!',
        t('successDescription') || 'Welcome to GoBoclean Rapport!'
      );

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      handleError(error, { title: t('error') || 'Failed to complete profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!userId) return;

    try {
      // Just mark as onboarded without updating profile
      await markUserAsOnboarded(userId);
      router.push('/dashboard');
    } catch (error) {
      handleError(error, { title: 'Failed to skip onboarding' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafc] px-6 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <Logo subtitle={t('subtitle') || 'Complete your profile'} />
      </div>

      {/* Onboarding Card */}
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl px-10 py-12 border border-slate-50">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 mb-2">
            {t('title') || 'Welcome! 👋'}
          </h1>
          <p className="text-slate-600 text-[15px]">
            {t('description') || 'Let\'s set up your profile to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center">
                {profilePicturePreview ? (
                  <Image
                    src={profilePicturePreview}
                    alt="Profile preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1a2e1a] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#2a3e2a] transition-colors shadow-lg border-4 border-white"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading || isUploading}
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              {t('profilePictureHint') || 'Optional - Add a profile picture'}
            </p>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1">
              {t('firstName') || 'First Name'} *
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t('firstNamePlaceholder') || 'Enter your first name'}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1">
              {t('lastName') || 'Last Name'} *
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t('lastNamePlaceholder') || 'Enter your last name'}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading || isUploading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                {t('completing') || 'Completing...'}
              </>
            ) : (
              <>
                {t('complete') || 'Complete Profile'}
                <ArrowRight className="h-7 w-7" strokeWidth={3} />
              </>
            )}
          </Button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
          >
            {t('skip') || 'Skip for now'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          {t('footer') || 'You can always update your profile later'}
        </p>
      </div>
    </div>
  );
}
