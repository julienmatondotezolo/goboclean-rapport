'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { LoadingBanner } from '@/components/loading-banner';

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

        // Log all auth callback data for debugging
        console.log('🔐 AUTH CALLBACK STARTED:', {
          fullUrl: window.location.href,
          hash: window.location.hash,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          errorParam,
          errorDescription,
          allHashParams: Object.fromEntries(hashParams.entries()),
          timestamp: new Date().toISOString()
        });

        // Check for error in URL
        if (errorParam) {
          console.error('🚨 AUTH CALLBACK ERROR (URL):', {
            error: errorParam,
            description: errorDescription,
            fullHash: window.location.hash,
            fullUrl: window.location.href
          });
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
              console.error('🚨 AUTH CALLBACK ERROR (Invite/Recovery Session):', {
                error: sessionError,
                accessToken: accessToken?.substring(0, 20) + '...',
                refreshToken: refreshToken?.substring(0, 20) + '...',
                type,
                fullUrl: window.location.href
              });
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
            console.error('🚨 AUTH CALLBACK ERROR (Normal Auth Session):', {
              error: sessionError,
              accessToken: accessToken?.substring(0, 20) + '...',
              refreshToken: refreshToken?.substring(0, 20) + '...',
              type,
              fullUrl: window.location.href
            });
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
        console.error('🚨 AUTH CALLBACK ERROR (Catch Block):', {
          error: err,
          message: err.message,
          stack: err.stack,
          fullUrl: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          timestamp: new Date().toISOString()
        });
        setError(err.message);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Small Loading Banner at Top */}
      <LoadingBanner 
        isLoading={!error} 
        message={error ? 'Authentication failed' : status} 
        type={error ? 'error' : 'loading'}
        dismissible={false}
      />
      
      {/* Always Show Content Area */}
      <div className="pt-20 px-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#064e3b] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication</h1>
            <p className="text-slate-600 text-sm">Processing your login request</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            {error ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl">✕</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Authentication Error</h3>
                    <p className="text-slate-500 text-sm">Something went wrong</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
                <div className="flex items-center justify-center text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting to login page in 3 seconds...
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div className="bg-[#064e3b]/10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#064e3b]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Processing</h3>
                    <p className="text-slate-500 text-sm">Setting up your account</p>
                  </div>
                </div>
                <div className="bg-[#064e3b]/5 border border-[#064e3b]/20 rounded-lg p-4 mb-4">
                  <p className="text-[#064e3b] text-sm font-medium">{status}</p>
                </div>
                <div className="flex items-center justify-center text-slate-500 text-sm">
                  <span className="w-2 h-2 bg-[#064e3b] rounded-full animate-pulse mr-2"></span>
                  Please wait while we complete the setup...
                </div>
              </>
            )}
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-xs font-mono text-gray-600">
                URL: {window.location.href.split('?')[0]}...
              </p>
              <p className="text-xs font-mono text-gray-600 mt-1">
                Check console for detailed logs
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
