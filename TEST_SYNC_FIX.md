# Testing Guide: Sync Fix

## Overview

This guide helps you verify that the sync manager fix resolves the issue where the app stops fetching after being idle.

## Pre-Test Setup

1. Open the browser DevTools Console (F12)
2. Clear the console to see fresh logs
3. Make sure you're logged in to the app

## Test Scenarios

### Test 1: Idle Behavior (Primary Issue)

**Goal**: Verify the app continues fetching after being idle

1. Open the app and navigate to the dashboard
2. Leave the app open and idle for 15 minutes
3. After 15 minutes, interact with the app (click on a mission, navigate to profile, etc.)
4. **Expected**: Data loads normally without hanging or errors
5. **Check Console**: Should see API calls succeeding, no timeout errors

### Test 2: No Unnecessary Syncs

**Goal**: Verify sync manager only runs when needed

1. Open the app
2. Watch the console for sync-related logs
3. Wait for 10 minutes without making any changes
4. **Expected**: Should see "✓ No pending items to sync" or no sync activity at all
5. **Not Expected**: Should NOT see repeated "🔄 Syncing X pending items" messages

### Test 3: Periodic Query Refetching

**Goal**: Verify React Query handles data fetching

1. Open the app on the dashboard
2. In another browser tab, have an admin change a mission status
3. Switch back to the app tab (window focus)
4. **Expected**: Data refreshes automatically (you see the updated mission status)
5. **Check Console**: Should see API calls from React Query, not sync manager

### Test 4: Offline Mode

**Goal**: Verify offline handling doesn't block the app

1. Open the app
2. Open DevTools Network tab
3. Set network to "Offline" mode
4. Try to navigate or refresh data
5. **Expected**:
   - App shows offline indicator
   - Queries fail gracefully with error messages
   - App doesn't hang or freeze
6. **Check Console**: Should see "📴 Gone offline" log

### Test 5: Coming Back Online

**Goal**: Verify reconnection works smoothly

1. Start with the app offline (from Test 4)
2. Set network back to "Online" mode
3. **Expected**:
   - App detects online status
   - If there are pending changes, they sync automatically
   - If no pending changes, no sync occurs
4. **Check Console**: Should see "🌐 Back online" log

### Test 6: Pending Upload Sync

**Goal**: Verify pending uploads still sync correctly

1. Go offline (DevTools Network > Offline)
2. Start a mission or make changes that would normally upload
3. Go back online
4. **Expected**:
   - Changes sync automatically
   - Console shows "🌐 Back online: syncing X pending items"
   - After sync completes, data is up to date

### Test 7: Multiple Tabs

**Goal**: Verify queries work across multiple tabs

1. Open the app in Tab 1
2. Open the app in Tab 2
3. Leave both tabs open for 10 minutes
4. Switch to Tab 1 and interact with it
5. Switch to Tab 2 and interact with it
6. **Expected**: Both tabs work normally, data loads in both

## Console Log Reference

### Good Logs (Expected)

```
✓ No pending items to sync
⏭️ Skipping sync down: React Query handles data fetching
🌐 Back online: no pending items to sync
✓ Offline database initialized successfully
```

### Logs Indicating Sync Activity (Only when needed)

```
🔄 Syncing X pending items...
🌐 Back online: syncing X pending items
🔄 Periodic sync: X pending items
```

### Bad Logs (Should NOT See)

```
Database query timeout
Request timeout - please try again
Failed to get pending sync items
(Repeated sync logs when there are no pending items)
```

## Success Criteria

✅ **Pass**: All tests complete without errors
✅ **Pass**: App remains responsive after 15+ minutes idle
✅ **Pass**: No unnecessary API calls or sync operations
✅ **Pass**: Queries work correctly with window focus/blur
✅ **Pass**: Offline mode doesn't hang the app
✅ **Pass**: Pending uploads sync when coming back online

❌ **Fail**: App hangs or stops responding
❌ **Fail**: Queries timeout after being idle
❌ **Fail**: Sync runs continuously without pending items
❌ **Fail**: Database timeout errors in console

## Troubleshooting

### If App Still Hangs After Idle

1. Check browser console for errors
2. Look for "Database query timeout" messages
3. Clear IndexedDB: DevTools > Application > Storage > Clear site data
4. Reload the app

### If Sync Runs Too Frequently

1. Check console for "🔄 Periodic sync" messages
2. Should only see these when there are pending items
3. If seeing them without pending items, report as a bug

### If Queries Don't Refetch

1. Check network mode in providers.tsx (should be 'always')
2. Check if refetchOnWindowFocus is enabled
3. Verify React Query DevTools shows queries as stale

## Performance Monitoring

Monitor these metrics during testing:

1. **API Call Frequency**: Should only happen on user interaction or window focus
2. **Memory Usage**: Should remain stable over time
3. **CPU Usage**: Should be low when idle
4. **Network Activity**: Should be minimal when idle

## Reporting Issues

If you find issues, please provide:

1. Which test scenario failed
2. Console logs (copy/paste)
3. Network tab screenshot (if relevant)
4. Steps to reproduce
5. Browser and version
