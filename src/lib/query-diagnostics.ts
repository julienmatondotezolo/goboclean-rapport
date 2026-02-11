/**
 * Query Diagnostics Tool
 * 
 * This module helps diagnose why queries might stop fetching.
 * Add this to your component to see what's blocking queries.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase/client';

export function useQueryDiagnostics(enabled: boolean = false) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const diagnose = async () => {
      console.group('🔍 Query Diagnostics');

      // 1. Check online status
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      console.log('📡 Navigator Online:', isOnline);

      // 2. Check Supabase session
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session Error:', error.message);
        } else if (session) {
          const expiresAt = session.expires_at || 0;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;
          
          console.log('🔐 Session:', {
            hasSession: !!session,
            userId: session.user?.id,
            expiresIn: `${Math.floor(timeUntilExpiry / 60)} minutes`,
            isExpired: timeUntilExpiry < 0,
            needsRefresh: timeUntilExpiry < 300,
          });
        } else {
          console.warn('⚠️ No session found');
        }
      } catch (error) {
        console.error('❌ Session check failed:', error);
      }

      // 3. Check React Query state
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      console.log('📊 React Query State:', {
        totalQueries: allQueries.length,
        fetchingQueries: allQueries.filter(q => q.state.fetchStatus === 'fetching').length,
        pausedQueries: allQueries.filter(q => q.state.fetchStatus === 'paused').length,
        idleQueries: allQueries.filter(q => q.state.fetchStatus === 'idle').length,
        errorQueries: allQueries.filter(q => q.state.status === 'error').length,
      });

      // 4. Check specific mission queries
      const missionQueries = allQueries.filter(q => 
        JSON.stringify(q.queryKey).includes('mission')
      );
      
      if (missionQueries.length > 0) {
        console.log('🎯 Mission Queries:');
        missionQueries.forEach(q => {
          console.log({
            key: q.queryKey,
            status: q.state.status,
            fetchStatus: q.state.fetchStatus,
            dataUpdatedAt: q.state.dataUpdatedAt ? new Date(q.state.dataUpdatedAt).toLocaleTimeString() : 'never',
            errorUpdatedAt: q.state.errorUpdatedAt ? new Date(q.state.errorUpdatedAt).toLocaleTimeString() : 'never',
            error: q.state.error ? (q.state.error as Error).message : null,
          });
        });
      }

      // 5. Check IndexedDB
      try {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          const { isDatabaseReady } = await import('./offline-store');
          const isDBReady = isDatabaseReady();
          console.log('💾 IndexedDB Ready:', isDBReady);
          
          if (isDBReady) {
            const { getPendingSyncItems } = await import('./offline-store');
            const pendingItems = await getPendingSyncItems();
            console.log('📤 Pending Sync Items:', pendingItems.length);
          }
        }
      } catch (error) {
        console.error('❌ IndexedDB check failed:', error);
      }

      // 6. Check network requests
      if (typeof window !== 'undefined' && 'performance' in window) {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const recentApiCalls = entries
          .filter(e => e.name.includes(process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:3001'))
          .slice(-5);
        
        if (recentApiCalls.length > 0) {
          console.log('🌐 Recent API Calls:', recentApiCalls.map(e => ({
            url: e.name.split('?')[0],
            duration: `${Math.round(e.duration)}ms`,
            time: new Date(e.startTime + performance.timeOrigin).toLocaleTimeString(),
          })));
        } else {
          console.warn('⚠️ No recent API calls found');
        }
      }

      console.groupEnd();
    };

    // Run immediately
    diagnose();

    // Run every 10 seconds
    intervalRef.current = setInterval(diagnose, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, queryClient]);
}

/**
 * Manual diagnostic function you can call from console
 */
export async function runQueryDiagnostics() {
  console.group('🔍 Manual Query Diagnostics');

  // Check if queries are enabled
  const queryClientDiv = document.querySelector('[data-query-client]');
  console.log('Query Client Mounted:', !!queryClientDiv);

  // Check network mode
  console.log('Network Mode (from providers):', 'Check providers.tsx for networkMode setting');

  // Check for errors in console
  console.log('💡 Tips:');
  console.log('1. Check if you see "🔄 Token expiring soon" logs');
  console.log('2. Check if you see "❌ Token refresh failed" logs');
  console.log('3. Check if queries show fetchStatus: "paused"');
  console.log('4. Check if navigator.onLine is incorrectly false');
  console.log('5. Try: queryClient.refetchQueries() to force refetch');

  console.groupEnd();
}

// Make it available in console
if (typeof window !== 'undefined') {
  (window as any).runQueryDiagnostics = runQueryDiagnostics;
}
