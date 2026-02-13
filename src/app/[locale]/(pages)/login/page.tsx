'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type LoginForm = {
  email: string;
  password: string;
  keepLoggedIn?: boolean;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { toast } = useToast();
  const t = useTranslations('Login');
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  const loginSchema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordMinLength')),
    keepLoggedIn: z.boolean().optional(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      keepLoggedIn: true,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Log login activity
      const { logUserLogin, isFirstLogin } = await import('@/lib/user-activity');
      await logUserLogin();

      // Check if this is first login
      const isFirst = await isFirstLogin(authData.user.id);
      
      toast({
        title: t('loginSuccess'),
        description: t('welcome'),
        variant: 'success',
      });

      // Small delay for toast
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use window.location for hard refresh to ensure cookies are set
      // This allows the proxy to properly detect the authenticated session
      // Preserve locale in the URL
      if (isFirst) {
        window.location.href = `/${locale}/onboarding`;
      } else if (redirectUrl && redirectUrl.startsWith('/')) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = `/${locale}/dashboard`;
      }
    } catch (error: any) {
      toast({
        title: t('loginError') || 'Login failed',
        description: error.message || t('invalidCredentials') || 'Invalid email or password',
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
          <Logo subtitle={t('subtitle')} />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl px-10 py-12 mx-6 -mt-20 relative z-10 border border-slate-50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label 
                htmlFor="email" 
                className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1"
              >
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder={t('emailPlaceholder')}
                {...register('email')}
                className={cn(errors.email ? 'border-red-500' : '')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label 
                  htmlFor="password" 
                  className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800"
                >
                  {t('password')}
                </Label>
                <button
                  type="button"
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold tracking-tight"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  data-testid="password-input"
                  placeholder={t('passwordPlaceholder')}
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
            </div>

            <div className="flex items-center space-x-4 pt-2 ml-1">
              <Checkbox
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                className="w-7 h-7 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-[#1a2e1a] data-[state=checked]:border-[#1a2e1a] transition-all"
              />
              <label
                htmlFor="keepLoggedIn"
                className="text-[15px] text-slate-600 font-bold cursor-pointer select-none"
              >
                {t('keepLoggedIn')}
              </label>
            </div>

            <Button
              type="submit"
              data-testid="login-button"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                <>
                  {t('loginButton')}
                  <ArrowRight className="h-7 w-7" strokeWidth={3} />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="mt-16 mb-16 text-center space-y-10">          
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 tracking-tight">
              {t('version')} 2.4.0 (Build 88)
            </p>
            <button className="text-[15px] text-brand-emerald-darker hover:text-black font-black underline underline-offset-8 decoration-4 decoration-brand-lime/30 hover:decoration-brand-lime transition-all">
              {t('contactSupport')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
