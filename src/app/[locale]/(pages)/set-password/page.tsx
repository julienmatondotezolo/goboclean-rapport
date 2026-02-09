'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LoadingBanner } from '@/components/loading-banner';

type SetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function SetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const passwordSchema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SetPasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Try to get session from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            setIsValidSession(true);
          } else {
            toast({
              title: 'Session Error',
              description: 'Invalid or expired link. Please request a new invitation.',
              variant: 'destructive',
            });
            setTimeout(() => router.push('/login'), 3000);
          }
        } else {
          toast({
            title: 'Invalid Link',
            description: 'This link is invalid or has expired.',
            variant: 'destructive',
          });
          setTimeout(() => router.push('/login'), 3000);
        }
      } else {
        setIsValidSession(true);
      }
    };

    checkSession();
  }, [router, toast]);

  const onSubmit = async (data: SetPasswordForm) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: 'Password Set Successfully! ✅',
        description: 'Your account is now active. Redirecting to login...',
        variant: 'success',
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Error Setting Password',
        description: error.message || 'Failed to set password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <LoadingBanner 
          isLoading={true} 
          message="Verifying invitation link..." 
        />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#064e3b] mx-auto mb-4" />
            <p className="text-slate-600">Verifying invitation link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fafc]">
      <div className="w-full max-w-md relative">
        {/* Header Section */}
        <div className="bg-[#1a2e1a] rounded-b-[4rem] px-8 pt-16 pb-28 shadow-2xl">
          <Logo subtitle="Set Up Your Password" />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl px-10 py-12 mx-6 -mt-20 relative z-10 border border-slate-50">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to GoBo Clean!</h2>
            <p className="text-slate-600">Create a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="password" 
                className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={cn(
                    "pr-14",
                    errors.password ? 'border-red-500' : ''
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1 ml-1">{errors.password.message}</p>
              )}
              <div className="ml-1 space-y-1">
                <p className="text-xs text-slate-500">Password must contain:</p>
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
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                  Setting Password...
                </>
              ) : (
                <>
                  Set Password & Continue
                  <CheckCircle2 className="h-7 w-7" strokeWidth={3} />
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
              onClick={() => router.push('/login')}
              className="text-[15px] text-brand-emerald-darker hover:text-black font-black underline underline-offset-8 decoration-4 decoration-brand-lime/30 hover:decoration-brand-lime transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
