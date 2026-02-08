'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Clock, FileText, Phone, CheckCircle2, X, Loader2, AlertCircle, Timer } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMission, useStartMission } from '@/hooks/useMissions';
import { handleError, showSuccess } from '@/lib/error-handler';
import type { Mission, MissionStatus } from '@/types/mission';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('Mission');
  const id = params.id as string;
  const locale = params.locale as string;

  const { data: mission, isLoading, isError, refetch } = useMission(id);
  const startMission = useStartMission();

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const [completionUnlocked, setCompletionUnlocked] = useState(false);

  // Timer logic for waiting_completion status
  useEffect(() => {
    if (!mission || mission.status !== 'waiting_completion' || !mission.completion_unlocked_at) {
      setTimeRemaining(null);
      setCompletionUnlocked(false);
      return;
    }

    const unlockTime = new Date(mission.completion_unlocked_at).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = unlockTime - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        setCompletionUnlocked(true);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining({ minutes, seconds });
        setCompletionUnlocked(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mission]);

  const handleStartMission = async () => {
    try {
      await startMission.mutateAsync(id);
      showSuccess(t('startMission'));
      router.push(`/${locale}/mission/${id}/before-pictures`);
    } catch (error) {
      handleError(error, { title: t('startFailed') });
    }
  };

  const handleAction = () => {
    if (!mission) return;

    switch (mission.status) {
      case 'assigned':
      case 'created':
        handleStartMission();
        break;
      case 'in_progress':
        router.push(`/${locale}/mission/${id}/before-pictures`);
        break;
      case 'waiting_completion':
        if (completionUnlocked) {
          router.push(`/${locale}/mission/${id}/after-pictures`);
        }
        break;
      default:
        break;
    }
  };

  const getActionLabel = (): string => {
    if (!mission) return '';
    switch (mission.status) {
      case 'created':
      case 'assigned':
        return t('startMission');
      case 'in_progress':
        return t('startMission'); // Continue to before-pictures
      case 'waiting_completion':
        return completionUnlocked ? t('completeMission') : t('waitingCompletion');
      case 'completed':
        return t('completeMission');
      default:
        return '';
    }
  };

  const isActionDisabled = (): boolean => {
    if (!mission) return true;
    if (startMission.isPending) return true;
    if (mission.status === 'waiting_completion' && !completionUnlocked) return true;
    if (mission.status === 'completed' || mission.status === 'cancelled') return true;
    return false;
  };

  // Status badge color
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'in_progress':
      case 'waiting_completion':
        return 'bg-[#f0f9e1] text-[#4d7c0f]';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-[#f1f5f9] text-[#64748b]';
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-32 font-sans">
        <PageHeader title={t('loading')} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
        </div>
      </div>
    );
  }

  // Error
  if (isError || !mission) {
    return (
      <div className="min-h-screen bg-white pb-32 font-sans">
        <PageHeader title={t('errorLoading')} />
        <div className="px-6 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-gray-700 mb-2">{t('notFound')}</p>
          <button
            onClick={() => refetch()}
            className="text-[13px] font-bold text-[#064e3b] hover:underline"
          >
            {t('errorLoading')}
          </button>
        </div>
      </div>
    );
  }

  const displayTitle = `${mission.client_first_name} ${mission.client_last_name}`;
  const subtypesLabel = mission.mission_subtypes?.map((st) => st).join(', ') || '';
  const appointmentTime = new Date(mission.appointment_time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const hasBeforePictures = mission.before_pictures && mission.before_pictures.length > 0;

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <PageHeader title={displayTitle} />

      <div className="px-6 py-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${getStatusColor(mission.status)}`}>
            {t(`status.${mission.status}`)}
          </span>
        </div>

        {/* Job Type and Time Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f8fafc] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
              {t('jobType')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-[#a3e635]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-gray-900">
                {subtypesLabel || t('roofType')}
              </span>
            </div>
          </div>

          <div className="bg-[#f8fafc] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
              {t('rendezvous')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#a3e635]" />
              <span className="text-[15px] font-bold text-gray-900">{appointmentTime}</span>
            </div>
          </div>
        </div>

        {/* Timer Banner (waiting_completion) */}
        {mission.status === 'waiting_completion' && (
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${completionUnlocked ? 'bg-green-50 border-2 border-[#a3e635]' : 'bg-orange-50 border-2 border-orange-200'}`}>
            <Timer className={`w-6 h-6 ${completionUnlocked ? 'text-[#064e3b]' : 'text-orange-600'}`} />
            <div>
              {completionUnlocked ? (
                <p className="text-[13px] font-bold text-[#064e3b]">✓ {t('completionUnlocked')}</p>
              ) : timeRemaining ? (
                <p className="text-[13px] font-bold text-orange-800">
                  {t('timerRemaining', { minutes: timeRemaining.minutes, seconds: timeRemaining.seconds })}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Address Section */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('address')}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-[#a3e635]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">{mission.client_address}</h3>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all ml-3">
              <svg
                className="w-5 h-5 text-[#064e3b]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mission Description */}
        {mission.additional_info && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
              {t('missionDescription')}
            </div>
            <p className="text-[14px] text-gray-700 leading-relaxed">{mission.additional_info}</p>
          </div>
        )}

        {/* Mission Details */}
        {(mission.surface_area || mission.facade_count) && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
              {t('missionDescription')}
            </div>
            <div className="space-y-2 text-[13px]">
              {mission.surface_area && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Surface:</span>
                  <span className="font-bold text-gray-900">{mission.surface_area} m²</span>
                </div>
              )}
              {mission.facade_count && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Facades:</span>
                  <span className="font-bold text-gray-900">{mission.facade_count}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Before Pictures Section */}
        {hasBeforePictures && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
              {t('beforePictures')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mission.before_pictures!.map((photo: string, index: number) => (
                <div
                  key={index}
                  onClick={() => setFullScreenImage(photo)}
                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white cursor-pointer hover:border-[#a3e635] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ aspectRatio: '3/2' }}
                >
                  <Image
                    src={photo}
                    alt={`Before photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {index + 1}/{mission.before_pictures!.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Person */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('contactPerson')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-[#a3e635] to-[#84cc16] rounded-2xl flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  {mission.client_first_name} {mission.client_last_name}
                </h3>
                <p className="text-[11px] font-bold text-gray-500 tracking-wide">
                  {mission.client_phone}
                </p>
              </div>
            </div>
            {mission.client_phone && (
              <a
                href={`tel:${mission.client_phone}`}
                className="w-14 h-14 bg-[#064e3b] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Phone className="w-6 h-6 text-[#a3e635]" />
              </a>
            )}
          </div>
        </div>

        {/* Action Button */}
        {mission.status !== 'completed' && mission.status !== 'cancelled' && (
          <div className="pt-4">
            <Button onClick={handleAction} disabled={isActionDisabled()} className="w-full">
              {startMission.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              <span className="text-[15px] font-bold uppercase tracking-wide">
                {startMission.isPending ? t('starting') : getActionLabel()}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-4">
            <Image
              src={fullScreenImage}
              alt="Full screen view"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
