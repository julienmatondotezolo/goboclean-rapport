# Fix: App Stops Fetching After Being Idle

## Problem
The app was stopping fetching data after being idle for a while. This was caused by the offline sync manager interfering with React Query's normal operation.

## Root Causes Identified

1. **Sync Manager Calling API Directly**: The `syncDownData()` method was fetching data directly from the API every 5 minutes, bypassing React Query's cache and causing unnecessary requests.

2. **Network Mode Configuration**: React Query was configured with `networkMode: 'online'`, which prevented queries from running when `navigator.onLine` was false, even if the connection was actually working.

3. **Database Query Timeout**: The `getPendingSyncItems()` function had a 3-second timeout that could hang queries if the IndexedDB was busy.

4. **Redundant Syncing**: The sync manager was running periodic syncs every 5 minutes regardless of whether there were pending items to sync.

## Changes Made

### 1. Disabled Sync Down Data (`src/lib/sync-manager.ts`)
```typescript
private async syncDownData(): Promise<void> {
  // Skip sync down - React Query handles data fetching
  console.log("⏭️ Skipping sync down: React Query handles data fetching");
  return;
}
```

**Reason**: React Query already handles:
- Automatic refetching on window focus
- Refetching on reconnect
- Stale-while-revalidate pattern
- Query deduplication

The sync manager should only sync UP (pending changes), not DOWN (fresh data).

### 2. Changed Network Mode to 'always' (`src/app/[locale]/providers.tsx`)
```typescript
queries: {
  networkMode: 'always', // Was: 'online'
  // ...
}
```

**Reason**: This prevents queries from being blocked when the browser incorrectly reports offline status. Queries will attempt to fetch and fail gracefully if there's no connection.

### 3. Increased Database Timeout (`src/lib/offline-store.ts`)
```typescript
// Increased from 3000ms to 5000ms
new Promise<SyncQueueItem[]>((_, reject) => 
  setTimeout(() => reject(new Error("Database query timeout")), 5000)
)
```

**Reason**: Gives the database more time to respond, reducing the chance of timeouts during normal operation.

### 4. Optimized Periodic Sync (`src/lib/sync-manager.ts`)
```typescript
setupPeriodicSync(intervalMs: number = 10 * 60 * 1000): () => void {
  const interval = setInterval(async () => {
    if (this.isOnline() && !this.syncInProgress) {
      // Only sync if there are pending items
      const pendingItems = await getPendingSyncItems();
      if (pendingItems.length > 0) {
        console.log(`🔄 Periodic sync: ${pendingItems.length} pending items`);
        this.sync();
      }
    }
  }, intervalMs);
  return () => clearInterval(interval);
}
```

**Changes**:
- Increased interval from 5 minutes to 10 minutes
- Only syncs if there are pending items
- Logs when syncing occurs

### 5. Optimized Online Listener (`src/lib/sync-manager.ts`)
```typescript
const handleOnline = async () => {
  const pendingItems = await getPendingSyncItems();
  if (pendingItems.length > 0) {
    console.log(`🌐 Back online: syncing ${pendingItems.length} pending items`);
    setTimeout(() => this.sync(), 1000);
  } else {
    console.log("🌐 Back online: no pending items to sync");
  }
};
```

**Reason**: Only syncs when coming back online if there are actually pending items to upload.

### 6. Optimized Initial Sync (`src/lib/sync-manager.ts`)
```typescript
if (navigator.onLine) {
  setTimeout(async () => {
    const pendingItems = await getPendingSyncItems();
    if (pendingItems.length > 0) {
      console.log(`🔄 Initial sync: ${pendingItems.length} pending items`);
      syncManager.sync();
    } else {
      console.log("✓ No pending sync items on startup");
    }
  }, 2000);
}
```

**Reason**: Avoids unnecessary sync on startup if there's nothing to sync.

## Impact

### Before
- Sync manager was making API calls every 5 minutes
- Queries could be blocked by `navigator.onLine` status
- Database timeouts could hang the app
- Redundant data fetching competing with React Query

### After
- Sync manager only syncs when there are pending uploads
- Queries always attempt to fetch (fail gracefully if offline)
- Longer database timeout reduces hanging
- React Query has full control over data fetching
- Better separation of concerns:
  - **Sync Manager**: Handles uploading pending changes
  - **React Query**: Handles fetching and caching data

## Testing Recommendations

1. **Idle Behavior**: Leave the app open for 10+ minutes and verify queries still work
2. **Offline Mode**: Disconnect internet, verify app shows offline status but doesn't hang
3. **Reconnect**: Go offline, make changes, go online, verify changes sync
4. **Window Focus**: Switch tabs and come back, verify data refreshes
5. **Pending Uploads**: Create offline changes, verify they sync when online

### 7. Added Early Exit for Empty Sync Queue (`src/lib/sync-manager.ts`)
```typescript
const pendingItems = await getPendingSyncItems();

// If no pending items, exit early
if (pendingItems.length === 0) {
  console.log("✓ No pending items to sync");
  // Update settings and exit
  return { status: "completed", syncedCount: 0, errorCount: 0, errors: [] };
}
```

**Reason**: Prevents unnecessary processing and database operations when there's nothing to sync.

### 8. Enhanced Logging (`src/lib/sync-manager.ts`)
Added comprehensive console logs throughout the sync process:
- `⏭️ Sync already in progress, skipping`
- `⏭️ Offline, skipping sync`
- `⏭️ Skipping sync: User not authenticated`
- `✓ No pending items to sync`
- `🔄 Syncing X pending items...`
- `🌐 Back online: syncing X pending items`
- `📴 Gone offline`

**Reason**: Makes it easier to debug sync behavior and understand what's happening.

## Additional Notes

- The sync manager now focuses solely on its primary purpose: syncing pending uploads
- React Query's built-in mechanisms handle all data fetching needs
- Console logs added for better debugging of sync behavior
- Network mode 'always' allows the app to work even when browser reports incorrect online status
- Early exit optimization prevents unnecessary work when sync queue is empty
- All sync operations now check for pending items before executing
