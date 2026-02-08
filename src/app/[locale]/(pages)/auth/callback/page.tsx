'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        
        // Check for tokens in URL hash (from email links)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Check for error in URL
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        if (type === 'invite' || type === 'recovery' || type === 'signup') {
          setStatus('Setting up your session...');
          
          if (accessToken && refreshToken) {
            // Set the session first
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }
          }
          
          setStatus('Redirecting to password setup...');
          
          // Redirect to password setup page with hash params preserved
          window.location.href = `/set-password${window.location.hash}`;
          
        } else if (accessToken && refreshToken) {
          setStatus('Completing authentication...');
          
          // Set the session
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          setStatus('Redirecting to dashboard...');
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          setStatus('No valid session found...');
          setTimeout(() => router.push('/login'), 1000);
        }
      } catch (err: any) {
        setError(err.message);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-slate-600 text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-emerald mx-auto mb-4" />
        <p className="text-slate-600 font-medium">{status}</p>
        <p className="text-slate-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
