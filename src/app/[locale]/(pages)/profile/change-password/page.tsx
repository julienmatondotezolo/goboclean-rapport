'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { handleError, showSuccess } from '@/lib/error-handler';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const t = useTranslations('ChangePassword');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = z.object({
    currentPassword: z.string().min(1, t('currentPasswordRequired') || 'Current password is required'),
    newPassword: z.string()
      .min(8, t('passwordMinLength') || 'Password must be at least 8 characters')
      .regex(/[A-Z]/, t('passwordUppercase') || 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, t('passwordLowercase') || 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, t('passwordNumber') || 'Password must contain at least one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('passwordMismatch') || "Passwords don't match",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No active session');
      }

      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: data.currentPassword,
      });

      if (signInError) {
        throw new Error(t('incorrectCurrentPassword') || 'Current password is incorrect');
      }

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showSuccess(
        t('passwordChanged') || 'Password Changed',
        t('passwordChangedDescription') || 'Your password has been updated successfully'
      );

      // Reset form
      reset();

      // Navigate back to profile after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
      
    } catch (error: any) {
      handleError(error, { 
        title: t('passwordChangeError') || 'Failed to change password',
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <PageHeader 
        title={t('changePassword') || 'Change Password'} 
        onBack={() => router.push('/profile')}
      />
      
      {/* Content */}
      <div className="px-6 pt-8">
        {/* Info Card */}
        <div className="mb-8 p-5 bg-blue-50 rounded-[20px] border border-blue-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">
                {t('securityTip') || 'Security Tip'}
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {t('securityTipDescription') || 'Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-3">
            <Label 
              htmlFor="currentPassword" 
              className="text-[11px] font-black uppercase tracking-widest text-slate-800 ml-1"
            >
              {t('currentPassword') || 'Current Password'}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder={t('currentPasswordPlaceholder') || 'Enter your current password'}
                {...register('currentPassword')}
                className={cn(
                  "pr-14",
                  errors.currentPassword ? 'border-red-500' : ''
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showCurrentPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500 mt-1 ml-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <Label 
              htmlFor="newPassword" 
              className="text-[11px] font-black uppercase tracking-widest text-slate-800 ml-1"
            >
              {t('newPassword') || 'New Password'}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder={t('newPasswordPlaceholder') || 'Enter your new password'}
                {...register('newPassword')}
                className={cn(
                  "pr-14",
                  errors.newPassword ? 'border-red-500' : ''
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showNewPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1 ml-1">{errors.newPassword.message}</p>
            )}
            <div className="ml-1 space-y-1">
              <p className="text-xs text-slate-500">{t('passwordRequirements') || 'Password must contain:'}</p>
              <ul className="text-xs text-slate-500 space-y-1 ml-4">
                <li>• {t('requirement8Chars') || 'At least 8 characters'}</li>
                <li>• {t('requirementUppercase') || 'One uppercase letter'}</li>
                <li>• {t('requirementLowercase') || 'One lowercase letter'}</li>
                <li>• {t('requirementNumber') || 'One number'}</li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <Label 
              htmlFor="confirmPassword" 
              className="text-[11px] font-black uppercase tracking-widest text-slate-800 ml-1"
            >
              {t('confirmPassword') || 'Confirm New Password'}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirmPasswordPlaceholder') || 'Confirm your new password'}
                {...register('confirmPassword')}
                className={cn(
                  "pr-14",
                  errors.confirmPassword ? 'border-red-500' : ''
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin" />
                  {t('updating') || 'Updating...'}
                </>
              ) : (
                <>
                  {t('updatePassword') || 'Update Password'}
                  <Lock className="h-7 w-7" strokeWidth={3} />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
