# Sync Manager Architecture

## Overview
This document explains the architecture of the sync manager and how it integrates with React Query for optimal performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  (React Components using React Query hooks)                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ useQuery / useMutation
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      React Query                             │
│  - Query Cache                                               │
│  - Automatic Refetching (window focus, reconnect)          │
│  - Stale-while-revalidate                                   │
│  - Query Deduplication                                       │
│  - Network Mode: 'always'                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ API Calls (GET, POST, etc.)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      API Client                              │
│  - Authentication (Bearer Token)                             │
│  - Request Timeout (30s)                                     │
│  - Error Handling                                            │
│  - Logging                                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      Backend API                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    Sync Manager (Parallel)                   │
│  - Only handles UPLOAD of pending changes                    │
│  - Does NOT fetch data (React Query handles that)           │
│  - Runs periodically (10 min) IF pending items exist        │
│  - Runs on reconnect IF pending items exist                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Read/Write
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      IndexedDB                               │
│  - Sync Queue (pending uploads)                             │
│  - Offline Cache (optional, for offline mode)              │
└─────────────────────────────────────────────────────────────┘
```

## Separation of Concerns

### React Query Responsibilities
**Purpose**: Handle ALL data fetching and caching

**What it does**:
- Fetches data from API when needed
- Caches responses in memory
- Automatically refetches on:
  - Window focus (user switches back to tab)
  - Network reconnect (user comes back online)
  - Manual invalidation (after mutations)
  - Stale data (after staleTime expires)
- Deduplicates simultaneous requests
- Provides loading/error states
- Handles retries with exponential backoff

**Configuration**:
```typescript
queries: {
  networkMode: 'always',      // Always attempt to fetch
  staleTime: 5 * 60 * 1000,   // 5 minutes
  gcTime: 10 * 60 * 1000,     // 10 minutes
  refetchOnWindowFocus: true, // Refetch when user returns
  refetchOnReconnect: true,   // Refetch when online
  refetchOnMount: true,       // Refetch when component mounts
}
```

### Sync Manager Responsibilities
**Purpose**: Handle ONLY pending uploads (offline changes)

**What it does**:
- Monitors sync queue in IndexedDB
- Uploads pending changes when online
- Retries failed uploads with exponential backoff
- Removes successfully synced items from queue
- Provides sync status to UI

**What it does NOT do**:
- ❌ Fetch data from API (React Query does this)
- ❌ Cache API responses (React Query does this)
- ❌ Refetch on window focus (React Query does this)
- ❌ Run periodic syncs when queue is empty

**When it runs**:
1. **On reconnect**: Only if there are pending items
2. **Periodic (10 min)**: Only if there are pending items
3. **Manual trigger**: When user explicitly syncs

## Data Flow

### Normal Operation (Online)
```
User Action → React Query → API Client → Backend
                   ↓
              Cache Update
                   ↓
              UI Update
```

### Offline Operation
```
User Action → Sync Queue (IndexedDB)
                   ↓
              Optimistic UI Update
                   
(When back online)
Sync Manager → API Client → Backend
                   ↓
         React Query Invalidation
                   ↓
              UI Update
```

### Window Focus / Reconnect
```
Event Trigger → React Query Refetch → API Client → Backend
                                          ↓
                                    Cache Update
                                          ↓
                                      UI Update

(Parallel, only if pending items)
Event Trigger → Sync Manager → Upload Pending Items
```

## Key Design Decisions

### 1. Network Mode: 'always'
**Decision**: Use `networkMode: 'always'` for queries

**Reasoning**:
- Browser's `navigator.onLine` is unreliable
- Can report offline when connection is actually working
- Better to attempt fetch and fail gracefully
- Allows app to work even with incorrect online status

**Impact**:
- Queries always attempt to fetch
- If network fails, React Query handles the error
- No false negatives from incorrect online status

### 2. Disabled Sync Down
**Decision**: Sync manager no longer fetches data from API

**Reasoning**:
- React Query already handles all data fetching
- Duplicate fetching wastes bandwidth and CPU
- Sync manager and React Query were competing
- Caused race conditions and stale data

**Impact**:
- Sync manager only uploads pending changes
- React Query has full control over data fetching
- No more duplicate API calls
- Better cache coherence

### 3. Conditional Periodic Sync
**Decision**: Only run periodic sync if there are pending items

**Reasoning**:
- Most of the time, there are no pending items
- Checking sync queue every 10 minutes is cheap
- Uploading nothing is wasteful
- Reduces unnecessary database queries

**Impact**:
- Less CPU usage when idle
- Less database contention
- Sync only runs when needed
- Better battery life on mobile

### 4. Increased Database Timeout
**Decision**: Increased timeout from 3s to 5s

**Reasoning**:
- IndexedDB can be slow on some devices
- 3s was too aggressive, causing false timeouts
- 5s provides more buffer without significant UX impact
- Prevents app from hanging on slow devices

**Impact**:
- Fewer timeout errors
- Better experience on slow devices
- Still fails fast enough to not block UI

## Performance Characteristics

### Before Fix
```
Idle App (10 minutes):
- Sync runs: 2 times (every 5 min)
- API calls: 4+ (2 syncs × 2 endpoints)
- Database queries: 4+ (check queue + sync down)
- Network activity: Continuous
- CPU usage: Medium (periodic work)
```

### After Fix
```
Idle App (10 minutes):
- Sync runs: 0 times (no pending items)
- API calls: 0 (only on user interaction)
- Database queries: 2 (just checking queue)
- Network activity: Minimal
- CPU usage: Low (minimal work)
```

### With Pending Items
```
Idle App (10 minutes):
- Sync runs: 1 time (at 10 min mark)
- API calls: 1-3 (only upload pending items)
- Database queries: 2 (check queue + remove items)
- Network activity: Burst at sync time
- CPU usage: Low with brief spike
```

## Monitoring and Debugging

### Console Logs

**Sync Manager Logs**:
- `✓ No pending items to sync` - Normal, no work needed
- `🔄 Syncing X pending items...` - Uploading changes
- `⏭️ Sync already in progress, skipping` - Preventing duplicate sync
- `⏭️ Offline, skipping sync` - Waiting for connection
- `🌐 Back online: syncing X pending items` - Reconnect sync
- `📴 Gone offline` - Lost connection

**React Query Logs** (via DevTools):
- Query status: `fetching`, `success`, `error`
- Cache status: `fresh`, `stale`
- Refetch reason: `window-focus`, `reconnect`, `mount`

### Performance Metrics

**Good Indicators**:
- Low CPU usage when idle
- No network activity when idle
- Queries complete in < 1s
- No timeout errors
- Memory usage stable

**Bad Indicators**:
- High CPU usage when idle
- Continuous network activity
- Queries taking > 5s
- Frequent timeout errors
- Memory usage growing

## Future Improvements

### Potential Optimizations
1. **Smart Sync Scheduling**: Sync during idle periods using requestIdleCallback
2. **Batch Uploads**: Combine multiple pending items into single request
3. **Priority Queue**: Upload critical items first
4. **Background Sync API**: Use native browser background sync when available
5. **Delta Sync**: Only upload changed fields, not entire objects

### Monitoring Enhancements
1. **Metrics Dashboard**: Track sync success rate, latency, queue size
2. **Error Reporting**: Automatic error reporting for failed syncs
3. **Performance Tracking**: Monitor query performance over time
4. **User Analytics**: Track offline usage patterns

## Troubleshooting Guide

### App Stops Fetching
**Symptoms**: Queries don't run after being idle
**Check**: 
- Network mode should be 'always'
- Check for database timeout errors
- Verify sync manager isn't blocking queries

### Excessive API Calls
**Symptoms**: Too many API calls, high network usage
**Check**:
- Sync manager should only run with pending items
- React Query staleTime should be reasonable (5 min)
- No duplicate query keys

### Sync Never Runs
**Symptoms**: Pending items never upload
**Check**:
- Online status detection working
- Authentication valid
- Sync manager initialized
- No errors in console

### Database Errors
**Symptoms**: IndexedDB timeout or version errors
**Solution**:
- Clear site data in DevTools
- Check for database version conflicts
- Verify database initialization
