'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-emerald">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-brand-green-light mx-auto" />
        <p className="text-white font-bold tracking-widest uppercase text-xs">Loading</p>
      </div>
    </div>
  );
}
