import { Hexagon, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoGoBoCleanProps {
  className?: string;
}

export function LogoGoBoClean({ className }: LogoGoBoCleanProps) {
  return (
    <div className={cn("relative", className)}>
      <Hexagon className="h-12 w-12 text-(--brand-green-light) group-hover:rotate-90 transition-transform duration-500" strokeWidth={2.5} />
      <span className="absolute inset-0 flex items-center justify-center font-bold text-(--brand-green-light) text-lg">G</span>
    </div>
  );
}

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  variant?: 'default' | 'compact';
  title?: string;
  subtitle?: string;
}

export function Logo({ 
  className, 
  iconClassName, 
  showText = true, 
  variant = 'default',
  title = 'GoboClean Rapport',
  subtitle = 'Field Services & Reports'
}: LogoProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <Home className={cn("w-5 h-5 text-lime-400", iconClassName)} strokeWidth={2.5} />
        </div>
        {showText && (
          <span className="text-xl font-bold text-slate-900">{title}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-[#2a3a2a] rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
          <LogoGoBoClean />
        </div>
      </div>
      {showText && (
        <>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            {title}
          </h1>
          <p className="text-[#98d62e] text-[10px] font-bold tracking-[0.25em] uppercase opacity-90">
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
}
