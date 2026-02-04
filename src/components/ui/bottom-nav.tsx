'use client';

import { Home, Calendar, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  translationKey?: string;
}

interface BottomNavProps {
  items?: NavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Navigation');

  // Use provided items or default items
  const navItems = items || getDefaultNavItems(t);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 safe-area-bottom z-50',
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);

          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-all active:scale-90',
                isActive
                  ? 'text-brand-emerald'
                  : 'text-slate-400'
              )}
              aria-label={item.label}
            >
              <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5px]')} />
              <span className={cn(
                'text-[10px] font-bold tracking-wider uppercase',
                isActive ? 'text-brand-emerald' : 'text-slate-400'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Helper function to get default nav items with translations
function getDefaultNavItems(t: any): NavItem[] {
  return [
    { icon: Home, label: t('home') || 'HOME', href: '/dashboard' },
    { icon: Calendar, label: t('schedule') || 'SCHEDULE', href: '/schedule' },
    { icon: FileText, label: t('reports') || 'REPORTS', href: '/reports' },
    { icon: User, label: t('profile') || 'PROFILE', href: '/profile' },
  ];
}

// Export for backward compatibility
export const defaultNavItems: NavItem[] = [
  { icon: Home, label: 'HOME', href: '/dashboard' },
  { icon: Calendar, label: 'SCHEDULE', href: '/schedule' },
  { icon: FileText, label: 'REPORTS', href: '/reports' },
  { icon: User, label: 'PROFILE', href: '/profile' },
];
