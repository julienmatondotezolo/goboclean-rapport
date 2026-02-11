# ✅ Query Debugging Setup Complete

## What I Fixed

1. **Exposed QueryClient to window** - For debugging access
2. **Added React Query DevTools** - Visual query inspector
3. **Added diagnostic scripts** - Automatic query status checking
4. **Removed all offline code** - No more blocking

## What You'll See Now

### 1. React Query DevTools
A floating button will appear in the bottom-right corner (in development mode):
- Click it to open the DevTools panel
- See all queries and their states
- Check if queries are fetching, paused, or have errors
- See query data and cache

### 2. Automatic Diagnostics
After 2 seconds, console will show:
```
🔍 Query Diagnostics
✅ React Query Client found
📊 Total queries: X
📊 Query States: {...}
📊 Fetch States: {...}
```

### 3. Manual Commands
In browser console:
```javascript
// Clear IndexedDB and reload
window.clearCache()

// Re-run diagnostics  
window.debugQueries()

// Access QueryClient directly
window.__REACT_QUERY_CLIENT__
```

## How to Debug

### Step 1: Reload the App
The app should already be running with `npm run dev`. Just refresh the browser.

### Step 2: Open React Query DevTools
Look for a floating React Query icon in the bottom-right corner. Click it to open.

### Step 3: Check Query Status
In the DevTools panel, you'll see:
- **Green** = Query has data (working!)
- **Yellow** = Query is fetching
- **Red** = Query has error
- **Gray** = Query is idle/disabled

### Step 4: Look for Issues

#### If queries are disabled:
- Check the "enabled" condition
- Queries have `enabled: !!user`
- User must be loaded first

#### If queries are paused:
- This shouldn't happen with `networkMode: 'always'`
- But if it does, check providers.tsx

#### If queries have errors:
- Click on the query in DevTools
- See the error message
- Check Network tab for failed requests

## Most Likely Issue

Based on your logs, I see:
```
🔑 [auth-3n8syh8] User signed in: admin@goboclean.be
```

So auth is working! The user is loaded. This means queries SHOULD be running now.

### Check This:

1. **Open React Query DevTools** (bottom-right corner)
2. **Look for queries** named:
   - `["missions", "list"]` (admin missions)
   - `["missions", "my", {}]` (worker missions)
3. **Check their status**:
   - Are they green (has data)?
   - Are they fetching (yellow)?
   - Are they disabled (gray)?
   - Do they have errors (red)?

## Expected Behavior

### Timeline
```
0ms:     Page loads
100ms:   React Query mounted
500ms:   Auth starts
1000ms:  User loaded ✓ (you're seeing this)
1001ms:  Queries enabled
1002ms:  Queries start fetching ← CHECK IF THIS HAPPENS
1500ms:  Data received
1501ms:  UI updates
```

You're getting to step 4 (user loaded), but queries might not be starting at step 6.

## What to Check

### 1. React Query DevTools
- Open it (bottom-right corner)
- See if queries exist
- Check their status

### 2. Network Tab
- Open DevTools > Network
- Filter by your backend URL
- Should see API requests to `/missions`
- If not, queries aren't fetching

### 3. Console Logs
After 2 seconds, you should see:
```
✅ React Query Client found
📊 Total queries: X
```

If X = 0, queries haven't been created yet.
If X > 0, check their fetch status.

## Quick Fixes

### Fix 1: Clear Everything
```javascript
window.clearCache()
```

### Fix 2: Force Refetch
```javascript
const qc = window.__REACT_QUERY_CLIENT__;
qc.refetchQueries();
```

### Fix 3: Check Specific Query
```javascript
const qc = window.__REACT_QUERY_CLIENT__;
const queries = qc.getQueryCache().getAll();
queries.forEach(q => {
  console.log('Query:', q.queryKey);
  console.log('Status:', q.state.status);
  console.log('Fetch Status:', q.state.fetchStatus);
  console.log('Enabled:', q.options.enabled);
  console.log('---');
});
```

## What Changed

### Before
- No way to see query status
- No debugging tools
- Had to guess what was wrong

### After
- ✅ React Query DevTools (visual inspector)
- ✅ Automatic diagnostics (console logs)
- ✅ Manual commands (window.clearCache, etc.)
- ✅ QueryClient exposed (window.__REACT_QUERY_CLIENT__)

## Next Steps

1. **Reload the app** in your browser
2. **Look for React Query icon** in bottom-right corner
3. **Click it** to open DevTools
4. **Check query status** - are they fetching?
5. **Check Network tab** - are API calls being made?
6. **Share what you see** if queries still aren't working

The DevTools will show you EXACTLY what's happening with your queries!

---

**Status**: ✅ Debugging tools installed
**DevTools**: ✅ Available in development
**Scripts**: ✅ Loaded automatically
**Ready**: ✅ Reload and check!
