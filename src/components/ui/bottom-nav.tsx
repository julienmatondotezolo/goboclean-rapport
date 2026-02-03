'use client';

import { Home, Calendar, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 safe-area-bottom z-50',
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-all active:scale-90',
                isActive
                  ? 'text-[#064e3b]'
                  : 'text-slate-400'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5px]')} />
              <span className={cn(
                'text-[10px] font-bold tracking-wider uppercase',
                isActive ? 'text-[#064e3b]' : 'text-slate-400'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const defaultNavItems: NavItem[] = [
  { icon: Home, label: 'HOME', href: '/dashboard' },
  { icon: Calendar, label: 'SCHEDULE', href: '/schedule' },
  { icon: FileText, label: 'REPORTS', href: '/reports' },
  { icon: User, label: 'PROFILE', href: '/profile' },
];
