import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface MissionCardProps {
  type: 'emergency' | 'scheduled';
  title: string;
  location: string;
  startTime?: string;
  teamMembers?: number;
  status?: 'noodgeval' | 'gepland';
  onStartJob?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function MissionCard({
  type,
  title,
  location,
  startTime,
  teamMembers,
  status,
  onStartJob,
  onViewDetails,
  className,
}: MissionCardProps) {
  const t = useTranslations('Dashboard');
  const isEmergency = type === 'emergency';

  return (
    <div
      className={cn(
        'relative bg-white rounded-[24px] p-5 shadow-sm border border-gray-100/50',
        isEmergency && 'border-l-[6px] border-l-[#a3e635]',
        className
      )}
    >
      {/* Badge */}
      <div className="mb-3">
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase',
            isEmergency
              ? 'bg-[#f0f9e1] text-[#4d7c0f]'
              : 'bg-[#f1f5f9] text-[#64748b]'
          )}
        >
          {isEmergency ? t('emergency') : t('scheduled')}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[18px] font-bold text-[#1e293b] leading-tight mb-2">
        {title}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-5">
        <MapPin className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
        <span className="text-[14px] text-[#64748b] font-medium">{location}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Left side: Avatars or Start Time */}
        <div className="flex items-center gap-2">
          {isEmergency ? (
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-white bg-[#f1f5f9] overflow-hidden flex items-center justify-center">
                <span className="text-[10px]">👩‍💼</span>
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-white bg-[#1e293b] overflow-hidden flex items-center justify-center">
                <span className="text-[10px]">👨‍🔧</span>
              </div>
            </div>
          ) : (
            startTime && (
              <div className="text-[14px] text-[#94a3b8]">
                {t('starts')} {startTime}
              </div>
            )
          )}
        </div>

        {/* Right side: Action Button or Details */}
        {isEmergency ? (
          <button
            onClick={onStartJob}
            className="px-6 py-2.5 bg-[#064e3b] text-white text-[12px] font-bold rounded-lg hover:bg-[#065f46] transition-all active:scale-95"
          >
            {t('startJob')}
          </button>
        ) : (
          <button
            onClick={onViewDetails}
            className="text-[14px] font-bold text-[#064e3b] hover:opacity-70 transition-opacity"
          >
            {t('details')}
          </button>
        )}
      </div>

      {/* Top Right Icon */}
      <div className="absolute top-5 right-5">
        {isEmergency ? (
          <AlertCircle className="w-6 h-6 text-[#a3e635]" strokeWidth={1.5} />
        ) : (
          <Clock className="w-6 h-6 text-[#cbd5e1]" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
