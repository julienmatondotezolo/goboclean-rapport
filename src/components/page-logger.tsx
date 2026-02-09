'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/logger';

interface PageLoggerProps {
  children: React.ReactNode;
  pageName?: string;
}

export function PageLogger({ children, pageName }: PageLoggerProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Set user context when available
    if (user?.id) {
      logger.setUser(user.id, {
        role: user.role,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }
  }, [user]);

  useEffect(() => {
    // Log page load
    const page = pageName || pathname;
    logger.pageLoad(page, {
      pathname,
      userId: user?.id,
      userRole: user?.role,
    });

    // Log page unload
    const handleBeforeUnload = () => {
      logger.info(`Page unload: ${page}`, {
        action: 'page_unload',
        pathname,
        userId: user?.id,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, pageName, user?.id, user?.role]);

  // Log navigation changes
  useEffect(() => {
    const handlePopState = () => {
      logger.navigation(
        sessionStorage.getItem('lastPage') || 'unknown',
        pathname,
        {
          userId: user?.id,
          trigger: 'browser_back',
        }
      );
    };

    window.addEventListener('popstate', handlePopState);
    sessionStorage.setItem('lastPage', pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, user?.id]);

  return <>{children}</>;
}

// Hook for component-level logging
export function usePageLogger(componentName: string) {
  const pathname = usePathname();
  const { user } = useAuth();

  const log = (message: string, context?: any) => {
    logger.info(message, {
      component: componentName,
      page: pathname,
      userId: user?.id,
      ...context,
    });
  };

  const logError = (message: string, error?: Error, context?: any) => {
    logger.error(message, error, {
      component: componentName,
      page: pathname,
      userId: user?.id,
      ...context,
    });
  };

  const logUserAction = (action: string, target?: string, context?: any) => {
    logger.userAction(action, target, {
      component: componentName,
      page: pathname,
      userId: user?.id,
      ...context,
    });
  };

  return {
    log,
    logError,
    logUserAction,
    logger, // Full logger access if needed
  };
}