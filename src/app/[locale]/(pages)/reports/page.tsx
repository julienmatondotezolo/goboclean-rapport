'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { ReportForm, ReportFormData } from '@/components/report-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, FileText } from 'lucide-react';
import { compressImage } from '@/lib/image-compression';

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour créer un rapport',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      // Create report in database
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          worker_id: session.user.id,
          status: 'completed',
          sync_status: 'synced',
          client_first_name: data.client_first_name,
          client_last_name: data.client_last_name,
          client_address: data.client_address,
          client_phone: data.client_phone,
          client_latitude: data.client_latitude,
          client_longitude: data.client_longitude,
          roof_type: data.roof_type,
          roof_surface: data.roof_surface,
          moss_level: data.moss_level,
          comments: data.comments,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Upload before photos
      for (let i = 0; i < data.before_photos.length; i++) {
        const file = data.before_photos[i];
        const compressedFile = await compressImage(file);
        const fileName = `${report.id}/before_${i}_${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('roof-photos')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('roof-photos')
          .getPublicUrl(fileName);

        await supabase.from('photos').insert({
          report_id: report.id,
          type: 'before',
          url: publicUrl,
          storage_path: fileName,
          order: i,
        });
      }

      // Upload after photos
      for (let i = 0; i < data.after_photos.length; i++) {
        const file = data.after_photos[i];
        const compressedFile = await compressImage(file);
        const fileName = `${report.id}/after_${i}_${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('roof-photos')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('roof-photos')
          .getPublicUrl(fileName);

        await supabase.from('photos').insert({
          report_id: report.id,
          type: 'after',
          url: publicUrl,
          storage_path: fileName,
          order: i,
        });
      }

      // Upload signatures if present
      if (data.worker_signature) {
        const workerSignatureBlob = await fetch(data.worker_signature).then(r => r.blob());
        const workerFileName = `${report.id}/worker_signature_${Date.now()}.png`;
        
        const { error: signatureError } = await supabase.storage
          .from('signatures')
          .upload(workerFileName, workerSignatureBlob);

        if (signatureError) throw signatureError;

        const { data: { publicUrl } } = supabase.storage
          .from('signatures')
          .getPublicUrl(workerFileName);

        await supabase
          .from('reports')
          .update({
            worker_signature_url: publicUrl,
            worker_signature_date: data.worker_signature_date,
          })
          .eq('id', report.id);
      }

      if (data.client_signature) {
        const clientSignatureBlob = await fetch(data.client_signature).then(r => r.blob());
        const clientFileName = `${report.id}/client_signature_${Date.now()}.png`;
        
        const { error: signatureError } = await supabase.storage
          .from('signatures')
          .upload(clientFileName, clientSignatureBlob);

        if (signatureError) throw signatureError;

        const { data: { publicUrl } } = supabase.storage
          .from('signatures')
          .getPublicUrl(clientFileName);

        await supabase
          .from('reports')
          .update({
            client_signature_url: publicUrl,
            client_signature_date: data.client_signature_date,
          })
          .eq('id', report.id);
      }

      toast({
        title: 'Rapport créé avec succès',
        description: 'Le rapport a été enregistré et le PDF sera envoyé par email.',
      });

      // Trigger PDF generation and email sending via backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      try {
        await fetch(`${apiUrl}/reports/${report.id}/finalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (apiError) {
        console.error('Error triggering PDF generation:', apiError);
        // Don't fail the whole operation if backend is down
      }

      router.push('/');
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du rapport',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                Nouveau Rapport
              </h1>
              <p className="text-gray-600">Documentez le nettoyage de toiture</p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <ReportForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
