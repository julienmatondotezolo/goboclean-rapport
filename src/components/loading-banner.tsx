'use client';

import { Loader2, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useState } from 'react';

interface LoadingBannerProps {
  isLoading?: boolean;
  message?: string;
  type?: 'loading' | 'success' | 'error' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function LoadingBanner({
  isLoading = false,
  message = 'Loading...',
  type = 'loading',
  dismissible = false,
  onDismiss,
}: LoadingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isLoading && type === 'loading') return null;
  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: CheckCircle2,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: Info,
          iconColor: 'text-blue-500'
        };
      default: // loading
        return {
          bg: 'bg-[#064e3b]/5 border-[#064e3b]/20',
          text: 'text-[#064e3b]',
          icon: Loader2,
          iconColor: 'text-[#064e3b]'
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b ${styles.bg} backdrop-blur-sm`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon 
            className={`h-4 w-4 ${styles.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} 
          />
          <span className={`text-sm font-medium ${styles.text}`}>
            {message}
          </span>
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`p-1 rounded-full hover:bg-black/10 transition-colors ${styles.text}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to manage loading banner state
 */
export function useLoadingBanner() {
  const [banner, setBanner] = useState<{
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'loading'
  });

  const showBanner = (message: string, type: 'loading' | 'success' | 'error' | 'info' = 'loading') => {
    setBanner({ isVisible: true, message, type });
  };

  const hideBanner = () => {
    setBanner(prev => ({ ...prev, isVisible: false }));
  };

  const showLoading = (message: string = 'Loading...') => showBanner(message, 'loading');
  const showSuccess = (message: string) => showBanner(message, 'success');
  const showError = (message: string) => showBanner(message, 'error');
  const showInfo = (message: string) => showBanner(message, 'info');

  return {
    banner,
    showBanner,
    hideBanner,
    showLoading,
    showSuccess,
    showError,
    showInfo,
  };
}