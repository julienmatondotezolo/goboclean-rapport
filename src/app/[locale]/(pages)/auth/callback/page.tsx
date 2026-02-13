'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { LoadingBanner } from '@/components/loading-banner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    let cancelled = false;

    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();
        
        // Get URL parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        console.log('🔐 AUTH CALLBACK:', {
          url: window.location.href,
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error: errorParam,
          timestamp: new Date().toISOString()
        });

        // Check for error in URL
        if (errorParam) {
          const errorMsg = errorDescription || errorParam;
          console.error('❌ AUTH CALLBACK: Error in URL:', errorMsg);
          throw new Error(errorMsg);
        }

        if (cancelled) return;

        // Handle email confirmation, password recovery, etc.
        if (type && ['invite', 'recovery', 'signup', 'email_change'].includes(type)) {
          setStatus('Setting up your session...');
          
          if (accessToken && refreshToken) {
            console.log('🔑 AUTH CALLBACK: Setting session for', type);
            
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (cancelled) return;

            if (sessionError) {
              console.error('❌ AUTH CALLBACK: Session error:', sessionError.message);
              throw sessionError;
            }
          }
          
          // Redirect based on type
          if (type === 'recovery' || type === 'invite') {
            if (!cancelled) {
              setStatus('Redirecting to password setup...');
              // Use window.location for full page navigation
              window.location.href = `/fr/set-password${window.location.hash}`;
            }
            return;
          } else if (type === 'email_change') {
            if (!cancelled) {
              setStatus('Email confirmed. Redirecting to profile...');
              setTimeout(() => {
                if (!cancelled) window.location.href = '/fr/profile';
              }, 1500);
            }
            return;
          }
        }
        
        // Handle direct token exchange (email magic links, OAuth)
        if (accessToken && refreshToken) {
          if (!cancelled) {
            setStatus('Completing authentication...');
          }
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (cancelled) return;

          if (sessionError) {
            console.error('❌ AUTH CALLBACK: Session error:', sessionError.message);
            throw sessionError;
          }

          if (data.session) {
            console.log('✅ AUTH CALLBACK: Session established for', data.session.user.email);
            
            if (!cancelled) {
              setStatus('Authentication complete. Redirecting...');
              // Force full page navigation to trigger middleware
              setTimeout(() => {
                if (!cancelled) window.location.href = '/fr/dashboard';
              }, 1000);
            }
            return;
          }
        }

        // Handle auth code flow (PKCE)
        const code = searchParams.get('code');
        if (code) {
          if (!cancelled) {
            setStatus('Exchanging auth code...');
          }
          
          console.log('🔑 AUTH CALLBACK: Exchanging code for session');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (cancelled) return;
          
          if (exchangeError) {
            console.error('❌ AUTH CALLBACK: Code exchange error:', exchangeError.message);
            throw exchangeError;
          }
          
          if (data.session) {
            console.log('✅ AUTH CALLBACK: Code exchange successful for', data.session.user.email);
            
            if (!cancelled) {
              setStatus('Authentication complete. Redirecting...');
              setTimeout(() => {
                if (!cancelled) window.location.href = '/fr/dashboard';
              }, 1000);
            }
            return;
          }
        }

        // If we get here, no valid auth data was found
        console.warn('⚠️ AUTH CALLBACK: No valid authentication data found');
        if (!cancelled) {
          setStatus('No valid session found. Redirecting to login...');
          setTimeout(() => {
            if (!cancelled) router.push('/fr/login');
          }, 2000);
        }
        
      } catch (err: any) {
        console.error('❌ AUTH CALLBACK: Error:', err);
        
        if (!cancelled) {
          setError(err.message || 'Authentication failed');
          setTimeout(() => {
            if (!cancelled) router.push('/fr/login');
          }, 3000);
        }
      }
    };

    handleAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Loading Banner */}
      <LoadingBanner 
        isLoading={!error} 
        message={error ? 'Authentication failed' : status} 
        type={error ? 'error' : 'loading'}
        dismissible={false}
      />
      
      {/* Main Content */}
      <div className="pt-20 px-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#064e3b] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {error ? 'Authentication Failed' : 'Authentication'}
            </h1>
            <p className="text-slate-600 text-sm">
              {error ? 'Something went wrong' : 'Processing your request'}
            </p>
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
                    <h3 className="text-lg font-bold text-slate-900">Error</h3>
                    <p className="text-slate-500 text-sm">Authentication failed</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
                
                <div className="flex items-center justify-center text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting to login in 3 seconds...
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
                    <p className="text-slate-500 text-sm">Setting up your session</p>
                  </div>
                </div>
                
                <div className="bg-[#064e3b]/5 border border-[#064e3b]/20 rounded-lg p-4 mb-4">
                  <p className="text-[#064e3b] text-sm font-medium">{status}</p>
                </div>
                
                <div className="flex items-center justify-center text-slate-500 text-sm">
                  <div className="w-2 h-2 bg-[#064e3b] rounded-full animate-pulse mr-2"></div>
                  Please wait while we complete the setup...
                </div>
              </>
            )}
          </div>

          {/* Debug Info (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-xs font-mono text-gray-600 break-all">
                URL: {window.location.href}
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