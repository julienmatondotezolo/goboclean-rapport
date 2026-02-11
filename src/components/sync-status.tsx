'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  status: 'synced' | 'pending' | 'error';
  className?: string;
}

export function SyncStatus({ status, className }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline || status === 'pending') {
      return {
        icon: Loader2,
        text: 'En attente de réseau',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        iconClass: 'animate-spin',
      };
    }

    if (status === 'error') {
      return {
        icon: CloudOff,
        text: 'Erreur de synchronisation',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        iconClass: '',
      };
    }

    return {
      icon: Cloud,
      text: 'Synchronisé',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconClass: '',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md', config.bgColor, className)}>
      <Icon className={cn('h-4 w-4', config.color, config.iconClass)} />
      <span className={cn('text-sm font-medium', config.color)}>{config.text}</span>
    </div>
  );
}

export function NetworkIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isMounted || isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white py-2 px-4 text-center text-sm font-medium z-50">
      <CloudOff className="inline h-4 w-4 mr-2" />
      Mode hors-ligne - Vos données seront synchronisées dès que vous serez en ligne
    </div>
  );
}
