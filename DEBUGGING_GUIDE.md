# Debugging Guide: App Stops Fetching

## Problem Description
The app stops making API calls after being idle for a while. This appears to be related to the offline sync manager and IndexedDB caching.

## Quick Diagnosis

### Step 1: Open Browser DevTools Console
Look for these log patterns:

**Good Signs (App is working):**
```
🔍 Query Diagnostics
📡 Navigator Online: true
🔐 Session: { hasSession: true, expiresIn: "55 minutes", needsRefresh: false }
📊 React Query State: { fetchingQueries: 1, pausedQueries: 0 }
🌐 Recent API Calls: [...]
```

**Bad Signs (App stopped fetching):**
```
⚠️ No recent API calls found
📊 React Query State: { pausedQueries: 5 }
fetchStatus: "paused"
❌ Token refresh failed
```

### Step 2: Check Network Tab
1. Open DevTools > Network tab
2. Filter by your backend URL (e.g., `localhost:3001`)
3. Interact with the app (navigate, click refresh)
4. **Expected**: See API requests being made
5. **Problem**: No requests appear

### Step 3: Check React Query DevTools
If you have React Query DevTools installed:
1. Look at query status
2. Check if queries are "paused" or "fetching"
3. Check "dataUpdatedAt" timestamp

## Common Causes & Solutions

### Cause 1: IndexedDB Has Stale Cached Data
**Symptom**: App shows old data, no API calls

**Solution**:
```javascript
// In browser console:
// 1. Clear IndexedDB
indexedDB.deleteDatabase('GobocleanOfflineDB');

// 2. Clear localStorage
localStorage.clear();

// 3. Reload page
location.reload();
```

### Cause 2: Queries Are Paused by Network Mode
**Symptom**: Queries show `fetchStatus: "paused"`

**Check**: In `src/app/[locale]/providers.tsx`:
```typescript
queries: {
  networkMode: 'always', // Should be 'always', not 'online'
}
```

**Solution**: Already fixed in recent changes

### Cause 3: Token Expired or Refresh Failed
**Symptom**: See "❌ Token refresh failed" in console

**Check**:
```javascript
// In browser console:
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```

**Solution**: Log out and log back in

### Cause 4: Sync Manager Interfering
**Symptom**: Sync logs appear frequently, API calls stop

**Check Console For**:
- `🔄 Syncing X pending items...` (should only appear when needed)
- `⏭️ Skipping sync down: React Query handles data fetching` (good)

**Solution**: Already fixed - sync manager no longer fetches data

### Cause 5: Query Enabled is False
**Symptom**: Specific queries never run

**Check**: Look for queries with `enabled: false` or `enabled: !!condition`

**Debug**:
```javascript
// In browser console:
const queryClient = window.__REACT_QUERY_CLIENT__;
const queries = queryClient.getQueryCache().getAll();
queries.forEach(q => {
  console.log(q.queryKey, 'state:', q.state.fetchStatus);
});
```

## Manual Fixes

### Fix 1: Force Refetch All Queries
```javascript
// In browser console:
const queryClient = window.__REACT_QUERY_CLIENT__;
queryClient.refetchQueries();
```

### Fix 2: Clear Query Cache
```javascript
// In browser console:
const queryClient = window.__REACT_QUERY_CLIENT__;
queryClient.clear();
```

### Fix 3: Reset Everything
```javascript
// In browser console:
// 1. Clear all storage
indexedDB.deleteDatabase('GobocleanOfflineDB');
localStorage.clear();
sessionStorage.clear();

// 2. Clear service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});

// 3. Hard reload
location.reload(true);
```

### Fix 4: Disable Offline Features Temporarily
```javascript
// In src/app/[locale]/providers.tsx, comment out:
// <OfflineInitializer />
```

## Diagnostic Commands

### Check Query State
```javascript
// Run in browser console:
window.runQueryDiagnostics();
```

### Check Pending Sync Items
```javascript
// Run in browser console:
const { getPendingSyncItems } = await import('/src/lib/offline-store');
const items = await getPendingSyncItems();
console.log('Pending items:', items);
```

### Check IndexedDB Contents
```javascript
// Run in browser console:
const { offlineDB } = await import('/src/lib/offline-store');
const reports = await offlineDB.reports.toArray();
const syncQueue = await offlineDB.syncQueue.toArray();
console.log('Cached reports:', reports.length);
console.log('Sync queue:', syncQueue.length);
```

### Monitor API Calls
```javascript
// Add this to see all fetch calls:
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('🌐 Fetch:', args[0]);
  return originalFetch(...args);
};
```

## Prevention

### Best Practices
1. **Always use React Query hooks** (`useMissions`, not `useOfflineMissions`)
2. **Don't read from IndexedDB** in normal operation
3. **Let React Query handle caching** - it's better than manual caching
4. **Use `networkMode: 'always'`** for queries
5. **Only use sync manager for uploads**, not downloads

### Monitoring
Add this to your components during development:
```typescript
import { useQueryDiagnostics } from '@/lib/query-diagnostics';

// In your component:
useQueryDiagnostics(process.env.NODE_ENV === 'development');
```

## Testing After Fix

### Test 1: Idle Behavior
1. Open app
2. Leave idle for 15 minutes
3. Click around
4. **Expected**: Data loads normally

### Test 2: Network Tab
1. Open DevTools > Network
2. Navigate between pages
3. **Expected**: See API calls for each page

### Test 3: Fresh Start
1. Clear all data (IndexedDB, localStorage)
2. Reload app
3. Log in
4. **Expected**: Everything works

### Test 4: Console Logs
1. Open console
2. Wait 10 seconds
3. **Expected**: See "🔍 Query Diagnostics" logs
4. **Expected**: See "🌐 Recent API Calls" with actual calls

## Known Issues

### Issue: "Database query timeout"
**Cause**: IndexedDB is slow or locked
**Fix**: Increase timeout in `offline-store.ts` or clear database

### Issue: "Token refresh failed"
**Cause**: Supabase session expired
**Fix**: Log out and log back in

### Issue: Queries stuck in "paused" state
**Cause**: Network mode is 'online' and navigator.onLine is false
**Fix**: Change to `networkMode: 'always'`

### Issue: Old data showing
**Cause**: React Query cache or IndexedDB cache
**Fix**: Clear cache or reduce staleTime

## Getting Help

If the issue persists:

1. **Collect Diagnostics**:
   - Console logs (full output)
   - Network tab screenshot
   - React Query DevTools screenshot
   - Steps to reproduce

2. **Check Recent Changes**:
   - Did you recently update dependencies?
   - Did you change query configurations?
   - Did you modify sync manager?

3. **Verify Fixes Applied**:
   - Check `providers.tsx` has `networkMode: 'always'`
   - Check `sync-manager.ts` has disabled `syncDownData()`
   - Check app uses `useMissions`, not `useOfflineMissions`

4. **Try Clean Install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```
