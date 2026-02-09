'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Download, RefreshCw, CheckCircle } from 'lucide-react';

interface UpdateState {
  checking: boolean;
  available: boolean;
  installing: boolean;
  ready: boolean;
  error?: string;
}

export function PWAUpdateNotification() {
  const [updateState, setUpdateState] = useState<UpdateState>({
    checking: false,
    available: false,
    installing: false,
    ready: false,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Listen for service worker events
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, version } = event.data || {};
      
      switch (type) {
        case 'SW_CHECKING_UPDATE':
          setUpdateState(prev => ({ ...prev, checking: true }));
          break;
          
        case 'SW_UPDATE_AVAILABLE':
          setUpdateState(prev => ({ 
            ...prev, 
            checking: false, 
            available: true 
          }));
          break;
          
        case 'SW_INSTALLING':
          setUpdateState(prev => ({ 
            ...prev, 
            available: false, 
            installing: true 
          }));
          break;
          
        case 'SW_UPDATED':
          setUpdateState(prev => ({ 
            ...prev, 
            installing: false, 
            ready: true 
          }));
          
          // Auto-reload after a brief delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          break;
          
        case 'SW_ERROR':
          setUpdateState(prev => ({ 
            ...prev, 
            checking: false,
            available: false,
            installing: false,
            error: 'Update failed'
          }));
          break;
      }
    });

    // Check for updates on mount
    const checkForUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setUpdateState(prev => ({ ...prev, checking: true }));
          await registration.update();
        }
      } catch (error) {
        console.error('Update check failed:', error);
        setUpdateState(prev => ({ ...prev, error: 'Update check failed' }));
      }
    };

    checkForUpdate();
  }, []);

  if (!updateState.checking && !updateState.available && !updateState.installing && !updateState.ready && !updateState.error) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {updateState.checking && (
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Checking for updates...</span>
        </div>
      )}
      
      {updateState.available && (
        <div className="bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Download className="h-5 w-5" />
          <span className="text-sm">Update available, installing...</span>
        </div>
      )}
      
      {updateState.installing && (
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Installing update...</span>
        </div>
      )}
      
      {updateState.ready && (
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">Update ready! Reloading...</span>
        </div>
      )}
      
      {updateState.error && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{updateState.error}</span>
        </div>
      )}
    </div>
  );
}