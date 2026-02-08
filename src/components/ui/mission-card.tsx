import { MapPin, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { MissionStatus } from '@/types/mission';

interface AssignedWorker {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface MissionCardProps {
  status: MissionStatus;
  title: string;
  location: string;
  date: string;
  startTime?: string;
  assignedWorkerName?: string;
  assignedWorkers?: AssignedWorker[];
  onClick?: () => void;
  className?: string;
}

const statusColorMap: Record<MissionStatus, string> = {
  created: 'bg-[#f1f5f9] text-[#64748b]',
  assigned: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-[#f0f9e1] text-[#4d7c0f]',
  waiting_completion: 'bg-orange-50 text-orange-700',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-50 text-red-700',
};

export function MissionCard({
  status,
  title,
  location,
  date,
  startTime,
  assignedWorkerName,
  assignedWorkers,
  onClick,
  className,
}: MissionCardProps) {
  const t = useTranslations('MissionCard');

  const isActive = status === 'in_progress' || status === 'waiting_completion';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={cn(
        'relative bg-white rounded-[24px] p-5 shadow-sm border border-gray-100/50 transition-all',
        isActive && 'border-l-[6px] border-l-[#a3e635]',
        onClick && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
        className,
      )}
    >
      {/* Status Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase',
            statusColorMap[status] ?? 'bg-[#f1f5f9] text-[#64748b]',
          )}
        >
          {t(`status.${status}`)}
        </span>

        {/* Worker Avatars — stacked circles */}
        {assignedWorkers && assignedWorkers.length > 0 && (
          <div className="flex -space-x-2">
            {assignedWorkers.slice(0, 3).map((worker) => (
              <div
                key={worker.id}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#064e3b] flex items-center justify-center"
                title={`${worker.first_name} ${worker.last_name}`}
              >
                {worker.profile_picture_url ? (
                  <img
                    src={worker.profile_picture_url}
                    alt={`${worker.first_name} ${worker.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-[#a3e635]">
                    {worker.first_name[0]}{worker.last_name[0]}
                  </span>
                )}
              </div>
            ))}
            {assignedWorkers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-600">
                  +{assignedWorkers.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[18px] font-bold text-[#1e293b] leading-tight mb-2">
        {title}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
        <span className="text-[14px] text-[#64748b] font-medium truncate">{location}</span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
        <span className="text-[14px] text-[#64748b] font-medium">
          {date}{startTime ? ` • ${startTime}` : ''}
        </span>
      </div>

      {/* Assigned Worker (text fallback when no avatar data) */}
      {assignedWorkerName && (!assignedWorkers || assignedWorkers.length === 0) && (
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
          <span className="text-[13px] text-[#94a3b8] font-medium">
            {assignedWorkerName}
          </span>
        </div>
      )}
    </div>
  );
}
