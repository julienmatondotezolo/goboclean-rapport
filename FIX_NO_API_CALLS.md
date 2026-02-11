# Fix: Frontend Not Calling API

## Problem
The frontend stops making API calls after being idle. This is caused by a combination of:
1. Old cached data in IndexedDB from the sync manager
2. Queries potentially being paused
3. Token refresh issues

## Immediate Fix (For Users)

### Option 1: Clear Cache via Browser Console
1. Open the app
2. Press F12 to open DevTools
3. Go to Console tab
4. Run this command:
```javascript
window.clearOfflineCache().then(() => location.reload())
```

### Option 2: Clear Cache via DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Storage" in left sidebar
4. Click "Clear site data" button
5. Reload the page (Ctrl+R or Cmd+R)

### Option 3: Hard Reload
1. Close all tabs with the app open
2. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Clear "Cached images and files" and "Cookies and site data"
4. Reopen the app

## Root Cause Analysis

### The Problem Chain

1. **Sync Manager Was Caching Data**
   - The old `syncDownData()` function was fetching data from API
   - It stored this data in IndexedDB
   - This happened every 5 minutes

2. **Stale Cache Persists**
   - Even after we disabled `syncDownData()`, the old cached data remains
   - IndexedDB doesn't automatically expire data
   - The cache can become out of sync with the API

3. **Queries Stop Fetching**
   - React Query might be serving stale data
   - Or queries might be paused due to network mode
   - Or token refresh might be failing silently

## Code Changes Made

### 1. Disabled Sync Down Data
**File**: `src/lib/sync-manager.ts`

```typescript
private async syncDownData(): Promise<void> {
  // DISABLED: React Query handles all data fetching
  console.log("⏭️ Skipping sync down: React Query handles data fetching");
  return;
}
```

**Why**: The sync manager should only UPLOAD pending changes, not DOWNLOAD data. React Query is much better at managing data fetching.

### 2. Changed Network Mode to 'always'
**File**: `src/app/[locale]/providers.tsx`

```typescript
queries: {
  networkMode: 'always', // Was: 'online'
}
```

**Why**: `navigator.onLine` is unreliable. Setting to 'always' means queries will attempt to fetch regardless of the reported online status, and fail gracefully if there's no connection.

### 3. Added Diagnostic Tools
**Files**: 
- `src/lib/query-diagnostics.ts` - Monitors query state
- `src/lib/reset-app.ts` - Utilities to reset app state

**Why**: Makes it easier to diagnose and fix issues without requiring a full reinstall.

## Testing the Fix

### Step 1: Clear Old Cache
```javascript
// In browser console:
window.clearOfflineCache().then(() => location.reload())
```

### Step 2: Verify API Calls Are Working
1. Open DevTools > Network tab
2. Navigate around the app
3. You should see API calls to your backend (e.g., `GET /missions`)

### Step 3: Check Console Logs
Look for these logs:
```
✓ No pending items to sync
⏭️ Skipping sync down: React Query handles data fetching
🔍 Query Diagnostics
🌐 Recent API Calls: [...]
```

### Step 4: Test Idle Behavior
1. Leave the app open for 15 minutes
2. Come back and click around
3. Data should load normally

## Prevention

### For Developers

1. **Never cache API responses manually**
   - Let React Query handle caching
   - It's smarter and more reliable

2. **Use `networkMode: 'always'` for queries**
   - Don't rely on `navigator.onLine`
   - Let queries attempt and fail gracefully

3. **Separate concerns**
   - Sync Manager: Only for UPLOADING pending changes
   - React Query: For ALL data fetching and caching

4. **Monitor query state**
   - Use React Query DevTools
   - Check for paused queries
   - Verify recent API calls

### For Users

1. **Clear cache if app seems stuck**
   ```javascript
   window.clearOfflineCache().then(() => location.reload())
   ```

2. **Check app health**
   ```javascript
   window.printAppHealth()
   ```

3. **If still not working, full reset**
   ```javascript
   window.resetApp()
   ```

## Debugging Commands

All these commands are available in the browser console:

### Check App Health
```javascript
window.printAppHealth()
```
Shows:
- Online status
- Session status
- IndexedDB status
- Recent API calls

### Clear Offline Cache
```javascript
window.clearOfflineCache()
```
Clears IndexedDB only, keeps login session

### Clear All Data
```javascript
window.clearAllData()
```
Clears everything except language preference

### Full Reset
```javascript
window.resetApp()
```
Clears everything and reloads the page

### Run Diagnostics
```javascript
window.runQueryDiagnostics()
```
Shows detailed query state information

## Migration Guide

### If You Have Existing Users

1. **Add a migration script** to clear old cache on app load:

```typescript
// In your app initialization:
useEffect(() => {
  const version = localStorage.getItem('app-version');
  if (version !== '2.0.0') {
    // Clear old cache
    indexedDB.deleteDatabase('GobocleanOfflineDB');
    localStorage.setItem('app-version', '2.0.0');
    console.log('✓ Migrated to v2.0.0 - cache cleared');
  }
}, []);
```

2. **Show a notification** to users:
```
"We've improved data loading! Please refresh the page if you experience any issues."
```

3. **Monitor for issues**:
   - Check error logs for "Database query timeout"
   - Check for reports of stale data
   - Monitor API call frequency

## Success Criteria

✅ **API calls are made** when navigating the app
✅ **No "Database query timeout"** errors in console
✅ **Data updates** when refreshed
✅ **App works** after being idle for 15+ minutes
✅ **Console shows** "🌐 Recent API Calls" with actual calls

## If Problem Persists

### Check These Things

1. **Network Mode**
   - Open `src/app/[locale]/providers.tsx`
   - Verify `networkMode: 'always'` for queries

2. **Sync Manager**
   - Open `src/lib/sync-manager.ts`
   - Verify `syncDownData()` is disabled
   - Verify periodic sync only runs with pending items

3. **Query Hooks**
   - Verify app uses `useMissions` from `@/hooks/useMissions`
   - NOT `useOfflineMissions` from `@/hooks/useOfflineMissions`

4. **Token Refresh**
   - Check console for "❌ Token refresh failed"
   - If present, log out and log back in

5. **Browser Issues**
   - Try a different browser
   - Try incognito mode
   - Check browser console for errors

### Still Not Working?

1. **Collect diagnostics**:
```javascript
window.printAppHealth()
window.runQueryDiagnostics()
```

2. **Copy console output** and share with team

3. **Check Network tab** for failed requests

4. **Try clean install**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Related Files

- `src/lib/sync-manager.ts` - Sync manager (disabled sync down)
- `src/lib/offline-store.ts` - IndexedDB operations
- `src/app/[locale]/providers.tsx` - React Query config
- `src/hooks/useMissions.ts` - Mission queries (CORRECT)
- `src/hooks/useOfflineMissions.ts` - Offline hooks (NOT USED)
- `src/lib/query-diagnostics.ts` - Diagnostic tools
- `src/lib/reset-app.ts` - Reset utilities

## Summary

The fix involves:
1. ✅ Disabled sync manager from fetching data
2. ✅ Changed network mode to 'always'
3. ✅ Added diagnostic tools
4. ⚠️ **Users need to clear their cache** to remove old stale data

The last point is critical - existing users will have stale data in IndexedDB that needs to be cleared.
