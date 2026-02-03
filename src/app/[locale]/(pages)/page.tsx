'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, FileText, ClipboardList, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('Configuration manquante');
          setIsLoading(false);
          return;
        }

        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session, redirect to login
          router.push('/login');
          return;
        }

        // Get user profile to check role
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          router.push('/login');
          return;
        }

        // Redirect based on role
        if (profile?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/reports');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setError('Erreur de connexion');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                GobloClean Rapport
              </h1>
              <p className="text-lg text-gray-600">
                Application mobile progressive pour la documentation du nettoyage de toiture
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 pt-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <ClipboardList className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Formulaire Multi-étapes</h3>
                <p className="text-sm text-gray-600">
                  Collecte structurée des informations client et de l'état de la toiture
                </p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                <FileText className="h-8 w-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Génération PDF</h3>
                <p className="text-sm text-gray-600">
                  Rapports professionnels envoyés automatiquement par email
                </p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Mode Hors-ligne</h3>
                <p className="text-sm text-gray-600">
                  Synchronisation automatique quand la connexion revient
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-red-600 mb-4">⚠️ {error}</p>
              <Button onClick={() => router.push('/login')} className="w-full md:w-auto">
                Aller à la connexion
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GobloClean Rapport</h1>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return null;
}
