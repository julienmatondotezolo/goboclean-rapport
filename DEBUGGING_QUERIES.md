# Debugging: Queries Not Triggering

## Current Status

All offline code has been removed, but queries might still not be triggering. Here's how to debug.

## Quick Diagnosis

### Step 1: Open Browser Console

1. Open your app in the browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Wait 2 seconds for the diagnostic script to run

### Step 2: Check the Output

You should see:

```
🔍 Query Debug Script Loaded
🔍 Query Diagnostics
  ✅ React Query Client found
  📊 Total queries: X
  📊 Query States: {...}
  📊 Fetch States: {...}
```

### Step 3: Look for Problems

#### Problem 1: Queries are PAUSED

```
❌ X queries are PAUSED!
```

**Solution**: This shouldn't happen anymore with `networkMode: 'always'`, but if it does:

- Check `src/app/[locale]/providers.tsx` - verify `networkMode: 'always'`
- Check browser console for errors

#### Problem 2: No queries registered

```
⚠️ No queries registered yet
```

**Solution**: Queries haven't been created yet

- Wait for components to mount
- Check if `useAuth` is returning a user
- Queries have `enabled: !!user` so they won't run without a user

#### Problem 3: No API calls

```
⚠️ No API calls found!
```

**Solution**: Queries aren't fetching

- Check Network tab for errors
- Verify backend is running
- Check authentication token

## Manual Commands

### Clear Cache

```javascript
// In browser console:
window.clearCache();
```

This will:

- Delete IndexedDB
- Clear localStorage keys
- Reload the page

### Re-run Diagnostics

```javascript
// In browser console:
window.debugQueries();
```

This will reload and run diagnostics again.

### Check Query Client

```javascript
// In browser console:
const qc = window.__REACT_QUERY_CLIENT__;
const queries = qc.getQueryCache().getAll();
console.log(queries);
```

### Force Refetch All

```javascript
// In browser console:
const qc = window.__REACT_QUERY_CLIENT__;
qc.refetchQueries();
```

## Common Issues

### Issue 1: User not loaded

**Symptom**: Queries show `enabled: false` in diagnostics
**Cause**: `useAuth` hasn't loaded the user yet
**Solution**: Wait for auth to complete, or check `useAuth` for errors

### Issue 2: IndexedDB still blocking

**Symptom**: Page hangs, queries never start
**Cause**: Old IndexedDB database still exists
**Solution**: Run `window.clearCache()` in console

### Issue 3: Network mode wrong

**Symptom**: Queries show `fetchStatus: paused`
**Cause**: Network mode is not 'always'
**Solution**: Check `providers.tsx` configuration

### Issue 4: Backend not running

**Symptom**: API calls fail with network errors
**Cause**: Backend server not running
**Solution**: Start backend server

## What to Check

### 1. React Query Config

File: `src/app/[locale]/providers.tsx`

Should have:

```typescript
queries: {
  networkMode: 'always',  // ← Must be 'always'
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
}
```

### 2. Query Hooks

File: `src/hooks/useMissions.ts`

Queries should NOT have `enabled: false` unless intentional:

```typescript
export function useMyMissions(opts) {
  return useQuery({
    queryKey: missionKeys.my(),
    queryFn: () => apiClient.get("/missions"),
    ...opts, // ← opts can override enabled
  });
}
```

### 3. Component Usage

File: `src/app/[locale]/(pages)/dashboard/page.tsx`

Queries are guarded by user:

```typescript
const adminMissionsQuery = useAllMissions({ enabled: !!user && isAdmin });
const workerMissionsQuery = useMyMissions({ enabled: !!user && !isAdmin });
```

This means queries won't run until `user` is loaded from `useAuth`.

### 4. Auth Hook

File: `src/hooks/useAuth.ts`

Check if `useAuth` is working:

```typescript
const { user, isLoading } = useAuth();
console.log("User:", user, "Loading:", isLoading);
```

## Step-by-Step Debugging

### 1. Check if React Query is mounted

```javascript
console.log("Query Client:", window.__REACT_QUERY_CLIENT__);
```

If undefined, QueryClientProvider is not mounted.

### 2. Check if user is loaded

Open React DevTools and check the Dashboard component:

- `user` should have a value
- `isLoading` should be false
- `isAuthenticated` should be true

### 3. Check query enabled state

```javascript
const qc = window.__REACT_QUERY_CLIENT__;
const queries = qc.getQueryCache().getAll();
queries.forEach((q) => {
  console.log(q.queryKey, "enabled:", q.options.enabled);
});
```

### 4. Check Network tab

- Open DevTools > Network
- Filter by your backend URL
- Should see API requests
- If not, queries aren't running

### 5. Check for errors

- Console tab: Look for red errors
- Network tab: Look for failed requests
- React DevTools: Check component state

## Solutions

### Solution 1: Clear Everything

```javascript
// In console:
window.clearCache();
```

### Solution 2: Force Enable Queries

Temporarily remove the `enabled` condition:

```typescript
// In dashboard/page.tsx
const adminMissionsQuery = useAllMissions({ enabled: true });
```

### Solution 3: Check Auth

Add logging to see what's happening:

```typescript
const { user, isLoading } = useAuth();
console.log("Auth state:", { user, isLoading });
```

### Solution 4: Simplify

Create a test query without conditions:

```typescript
const testQuery = useQuery({
  queryKey: ["test"],
  queryFn: async () => {
    console.log("Test query running!");
    return { test: true };
  },
});
console.log("Test query:", testQuery);
```

## Expected Behavior

### When Working Correctly

1. Page loads
2. Auth hook loads user (~1-2 seconds)
3. Queries become enabled
4. Queries start fetching
5. API calls appear in Network tab
6. Data loads in UI

### Timeline

```
0ms:    Page loads
100ms:  React Query mounted
500ms:  Auth starts loading
1000ms: User loaded
1001ms: Queries enabled
1002ms: Queries start fetching
1500ms: API responses received
1501ms: UI updates with data
```

## Still Not Working?

### Last Resort Options

1. **Check if backend is running**:

   ```bash
   curl http://localhost:3001/health
   ```

2. **Try in incognito mode**:
   - Opens without cache/extensions
   - Rules out browser issues

3. **Check browser console for ALL errors**:
   - Red errors
   - Yellow warnings
   - Network failures

4. **Verify environment variables**:

   ```javascript
   console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
   ```

5. **Check if middleware is blocking**:
   - Look at `src/proxy.ts`
   - Check for authentication redirects

## Summary

The most common issue is:

1. **User not loaded yet** → Queries have `enabled: !!user`
2. **IndexedDB blocking** → Run `window.clearCache()`
3. **Network mode wrong** → Should be `'always'`

Use the diagnostic scripts to identify which one it is!

---

**Debug Scripts Available**:

- `window.debugQueries()` - Run diagnostics
- `window.clearCache()` - Clear IndexedDB
- Automatic diagnostics run 2 seconds after page load
