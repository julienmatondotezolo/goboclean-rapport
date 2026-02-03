import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor = 'text-[#a3e635]',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[24px] p-5 shadow-sm flex flex-col border border-gray-100/50',
        className
      )}
    >
      {/* Header: Icon (Left) and Label (Right) */}
      <div className="flex items-center justify-between mb-4">
        <Icon className={cn('w-6 h-6', iconColor)} strokeWidth={2} />
        <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="text-[28px] font-bold text-[#1e293b] leading-none mb-1">
        {value}
      </div>

      {/* Subtitle */}
      <div className="text-[12px] text-[#94a3b8] font-medium italic">
        {subtitle}
      </div>
    </div>
  );
}
