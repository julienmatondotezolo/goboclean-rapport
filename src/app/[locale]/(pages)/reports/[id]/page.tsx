'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { useReport } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { handleError, showSuccess } from '@/lib/error-handler';
import { LoadingBanner } from '@/components/loading-banner';
import { cn } from '@/lib/utils';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('ReportDetail');
  const tc = useTranslations('Common');
  const { isAdmin, isAuthenticated } = useAuth();
  const id = params.id as string;
  const locale = params.locale as string;

  const { data: report, isLoading, isError, refetch } = useReport(id, {
    enabled: isAuthenticated && !!id,
  });

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!report?.pdf_url) return;

    if (!isAdmin) {
      handleError(new Error('Unauthorized'), { 
        title: t('downloadRestricted'),
        description: t('onlyAdminCanDownload')
      });
      return;
    }

    try {
      setIsDownloading(true);
      
      // Open PDF in new tab for download
      window.open(report.pdf_url, '_blank');
      
      showSuccess(t('downloadStarted'));
    } catch (error) {
      handleError(error, { title: t('downloadFailed') });
    } finally {
      setIsDownloading(false);
    }
  };

  // Error state
  if (isError || (!isLoading && !report)) {
    return (
      <div className="min-h-screen bg-white pb-32 font-sans">
        <PageHeader title={t('reportNotFound')} />
        <div className="px-6 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-gray-700 mb-2">{t('reportNotFound')}</p>
          <p className="text-[14px] text-gray-500 mb-4">{t('reportNotFoundDescription')}</p>
          <button
            onClick={() => refetch()}
            className="text-[13px] font-bold text-brand-emerald hover:underline"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extract photos from the report's photos array
  const beforePictures = report.photos?.filter(photo => photo.type === 'before').sort((a, b) => a.order - b.order) || [];
  const afterPictures = report.photos?.filter(photo => photo.type === 'after').sort((a, b) => a.order - b.order) || [];
  const hasBeforePictures = beforePictures.length > 0;
  const hasAfterPictures = afterPictures.length > 0;

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Loading Banner */}
      <LoadingBanner isLoading={isLoading} message={t('loadingReport')} />

      {/* Header */}
      <header
        className={`px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky bg-white z-10 ${
          isLoading ? 'top-16' : 'top-0'
        }`}
      >
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-[18px] font-bold text-brand-emerald truncate max-w-[60%]">
          {t('reportPreview')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Report Header Card */}
        <div className="bg-linear-to-br from-brand-emerald to-brand-emerald-light rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold">
                  {report.client_first_name} {report.client_last_name}
                </h2>
                <p className="text-[12px] text-white/80 font-medium">
                  {t('reportId')}: {report.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider',
                report.status === 'completed'
                  ? 'bg-green-400 text-green-900'
                  : 'bg-orange-400 text-orange-900'
              )}
            >
              {report.status === 'completed' ? t('completed') : t('pending')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-white/70" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wide">
                  {t('createdDate')}
                </span>
              </div>
              <p className="text-[14px] font-bold">{formatDate(report.created_at)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wide">
                  {t('updatedDate')}
                </span>
              </div>
              <p className="text-[14px] font-bold">{formatTime(report.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Download Button - Admin Only */}
        {report.pdf_url && (
          <div className="bg-[#f8fafc] rounded-2xl p-5 border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-emerald rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-green-light" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{t('pdfAvailable')}</p>
                  <p className="text-[12px] text-gray-500">
                    {isAdmin ? t('clickToDownload') : t('adminOnlyDownload')}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading || !isAdmin}
                className={cn(
                  'min-w-[120px]',
                  !isAdmin && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span className="text-[13px] font-bold uppercase tracking-wide">
                  {isDownloading ? t('downloading') : t('download')}
                </span>
              </Button>
            </div>
            {!isAdmin && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[12px] text-amber-800 font-medium">
                  ⚠️ {t('workerRestriction')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Client Information */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-4 tracking-wide uppercase">
            {t('clientInformation')}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-brand-emerald mt-0.5" />
              <div className="flex-1">
                <p className="text-[12px] text-gray-500 font-medium">{t('clientName')}</p>
                <p className="text-[15px] font-bold text-gray-900">
                  {report.client_first_name} {report.client_last_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-emerald mt-0.5" />
              <div className="flex-1">
                <p className="text-[12px] text-gray-500 font-medium">{t('address')}</p>
                <p className="text-[15px] font-bold text-gray-900">{report.client_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Information */}
        {report.worker && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-4 tracking-wide uppercase">
              {t('workerInformation')}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-emerald rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-brand-green-light" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">
                  {report.worker.first_name} {report.worker.last_name}
                </p>
                <p className="text-[12px] text-gray-500 font-medium">{t('assignedWorker')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mission Details */}
        {report.mission && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-4 tracking-wide uppercase">
              {t('missionDetails')}
            </div>
            <div className="space-y-2 text-[13px]">
              {report.mission.appointment_time && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('appointmentDate')}:</span>
                  <span className="font-bold text-gray-900">
                    {formatDate(report.mission.appointment_time)}
                  </span>
                </div>
              )}
              {report.mission.surface_area && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('surfaceArea')}:</span>
                  <span className="font-bold text-gray-900">{report.mission.surface_area} m²</span>
                </div>
              )}
              {report.mission.facade_count && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('facadeCount')}:</span>
                  <span className="font-bold text-gray-900">{report.mission.facade_count}</span>
                </div>
              )}
              {report.mission.mission_subtypes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('missionType')}:</span>
                  <span className="font-bold text-gray-900">
                    {report.mission.mission_subtypes.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Before Pictures Section */}
        {hasBeforePictures && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
                {t('beforePictures')}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-blue-600">
                  {beforePictures.length} {t('photos')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {beforePictures.map((photo, index: number) => (
                <div
                  key={photo.id}
                  onClick={() => setFullScreenImage(photo.url)}
                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white cursor-pointer hover:border-brand-green-light transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ aspectRatio: '3/2' }}
                >
                  <Image
                    src={photo.url}
                    alt={`${t('beforePhoto')} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {index + 1}/{beforePictures.length}
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded">
                    {t('before')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* After Pictures Section */}
        {hasAfterPictures && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
                {t('afterPictures')}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-[11px] font-bold text-green-600">
                  {afterPictures.length} {t('photos')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {afterPictures.map((photo, index: number) => (
                <div
                  key={photo.id}
                  onClick={() => setFullScreenImage(photo.url)}
                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white cursor-pointer hover:border-brand-green-light transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ aspectRatio: '3/2' }}
                >
                  <Image
                    src={photo.url}
                    alt={`${t('afterPhoto')} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {index + 1}/{afterPictures.length}
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded">
                    {t('after')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Notice */}
        <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-blue-900 mb-1">{t('previewNotice')}</h3>
              <p className="text-[13px] text-blue-700 leading-relaxed">
                {t('previewNoticeDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenImage(null);
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={fullScreenImage}
              alt="Full screen view"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
