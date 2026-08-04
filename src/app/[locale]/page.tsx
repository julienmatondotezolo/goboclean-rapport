'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';
import { backendAuth } from '@/lib/backend-auth';
import { Loader2 } from 'lucide-react';

// Point d'entrée de l'app (start_url de la PWA) : redirige selon la session.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(backendAuth.isAuthenticated() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
    </div>
  );
}
