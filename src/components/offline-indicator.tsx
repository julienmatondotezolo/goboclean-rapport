'use client';

import { useState } from 'react';
import { useOfflineStatus, useManualSync } from '@/hooks/useOfflineStatus';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'à l\'instant';
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays}j`;
}

/**
 * Get status color and icon based on online/sync status
 */
function getStatusInfo(isOnline: boolean, syncStatus: string) {
  if (!isOnline) {
    return {
      color: 'text-amber-600 bg-amber-50',
      icon: WifiOff,
      text: 'Hors ligne',
    };
  }

  switch (syncStatus) {
    case 'syncing':
      return {
        color: 'text-blue-600 bg-blue-50',
        icon: RefreshCw,
        text: 'Synchronisation...',
        animate: true,
      };
    
    case 'completed':
      return {
        color: 'text-green-600 bg-green-50',
        icon: CheckCircle2,
        text: 'Synchronisé',
      };
    
    case 'error':
      return {
        color: 'text-red-600 bg-red-50',
        icon: AlertCircle,
        text: 'Erreur de sync',
      };
    
    default:
      return {
        color: 'text-green-600 bg-green-50',
        icon: Wifi,
        text: 'En ligne',
      };
  }
}

/**
 * Compact offline indicator for the main UI
 */
export function OfflineIndicator() {
  const { isOnline, syncStatus, pendingSyncCount, lastSyncAt, lastSyncResult } = useOfflineStatus();
  const { isSyncing, triggerSync } = useManualSync();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusInfo = getStatusInfo(isOnline, syncStatus);
  const IconComponent = statusInfo.icon;
  const showPendingCount = pendingSyncCount > 0;

  // Don't show indicator if online and no pending changes
  if (isOnline && syncStatus === 'idle' && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      {/* Main indicator */}
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border
          ${statusInfo.color} cursor-pointer transition-all duration-200
          ${isExpanded ? 'rounded-b-none' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <IconComponent 
          className={`w-4 h-4 ${statusInfo.animate ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm font-medium">{statusInfo.text}</span>
        
        {showPendingCount && (
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {pendingSyncCount}
          </span>
        )}
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="bg-white border border-t-0 rounded-b-lg shadow-lg p-4 w-80 max-w-[calc(100vw-2rem)]">
          {/* Status details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">État de connexion:</span>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            {pendingSyncCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">En attente de sync:</span>
                <span className="text-sm font-medium text-amber-600">
                  {pendingSyncCount} élément{pendingSyncCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {lastSyncAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dernière sync:</span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(lastSyncAt)}
                </span>
              </div>
            )}

            {lastSyncResult?.errors && lastSyncResult.errors.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Erreurs:</div>
                <div className="text-xs text-red-600 space-y-1 max-h-20 overflow-y-auto">
                  {lastSyncResult.errors.map((error, index) => (
                    <div key={index} className="break-words">• {error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
            {isOnline && (
              <button
                onClick={triggerSync}
                disabled={isSyncing || syncStatus === 'syncing'}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sync...' : 'Synchroniser'}
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-2 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple status badge for dashboard
 */
export function OfflineStatusBadge() {
  const { isOnline, syncStatus, pendingSyncCount } = useOfflineStatus();
  
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  const statusInfo = getStatusInfo(isOnline, syncStatus);
  const IconComponent = statusInfo.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${statusInfo.color}`}>
      <IconComponent className={`w-3 h-3 ${statusInfo.animate ? 'animate-spin' : ''}`} />
      {pendingSyncCount > 0 ? `${pendingSyncCount} en attente` : statusInfo.text}
    </div>
  );
}

/**
 * Full-width sync status bar for critical states
 */
export function SyncStatusBar() {
  const { isOnline, syncStatus, lastSyncResult } = useOfflineStatus();
  
  // Only show for errors or when offline with pending changes
  if (isOnline && syncStatus !== 'error') {
    return null;
  }

  return (
    <div className={`
      w-full py-2 px-4 text-sm text-center
      ${!isOnline ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
    `}>
      {!isOnline ? (
        'Mode hors ligne - Les modifications seront synchronisées lors de la reconnexion'
      ) : (
        `Erreur de synchronisation: ${lastSyncResult?.errors?.[0] || 'Problème de connexion'}`
      )}
    </div>
  );
}