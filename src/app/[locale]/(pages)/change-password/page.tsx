'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations('Profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast({
          title: 'Password Changed Successfully! ✅',
          description: 'Your password has been updated.',
          variant: 'success',
        });

        // Redirect back to profile
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
      
    } catch (error: any) {
      toast({
        title: 'Error Changing Password',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafc]">
      <div className="w-full max-w-md relative">
        {/* Header Section */}
        <div className="bg-[#1a2e1a] rounded-b-[4rem] px-8 pt-16 pb-28 shadow-2xl">
          <Logo subtitle="Change Your Password" />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl px-10 py-12 mx-6 -mt-20 relative z-10 border border-slate-50">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Change Password</h2>
            <p className="text-slate-600">Update your account password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="currentPassword" 
                className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1"
              >
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
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

            <div className="space-y-3">
              <Label 
                htmlFor="newPassword" 
                className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
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
                <p className="text-xs text-slate-500">New password must contain:</p>
                <ul className="text-xs text-slate-500 space-y-1 ml-4">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Label 
                htmlFor="confirmPassword" 
                className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
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

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  Change Password
                  <Lock className="h-7 w-7" strokeWidth={3} />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="mt-16 mb-16 text-center space-y-10">          
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 tracking-tight">
              GoBo Clean - Field Services & Reports
            </p>
            <button 
              onClick={() => router.push('/profile')}
              className="text-[15px] text-brand-emerald-darker hover:text-black font-black underline underline-offset-8 decoration-4 decoration-brand-lime/30 hover:decoration-brand-lime transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}