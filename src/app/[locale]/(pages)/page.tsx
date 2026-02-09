'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';
import { LoadingBanner } from '@/components/loading-banner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#064e3b]">
      <LoadingBanner 
        isLoading={true} 
        message="Redirecting to dashboard..." 
      />
      <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#a3e635] mx-auto" />
          <p className="text-white font-bold tracking-widest uppercase text-xs">Redirecting</p>
        </div>
      </div>
    </div>
  );
}
