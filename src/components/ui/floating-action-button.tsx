'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

interface FloatingActionButtonProps {
  onClick?: () => void;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function FloatingActionButton({ 
  onClick, 
  href = '/mission/new',
  className,
  icon
}: FloatingActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        'fixed bottom-24 right-6 w-14 h-14 bg-brand-green-light text-brand-emerald rounded-full flex items-center justify-center shadow-xl hover:bg-lime-300 transition-all active:scale-90 z-40',
        className
      )}
      aria-label="Add new mission"
    >
      {icon || <Plus className="w-8 h-8" strokeWidth={3} />}
    </button>
  );
}
