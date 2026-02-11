# Quick Fix Guide: Queries Stuck in Pending

## The Problem
Queries get stuck in "pending" state when you leave the page and come back.

## The Fix (APPLIED)
**Disabled OfflineInitializer** - it was blocking queries by initializing IndexedDB on every page load.

## What You Need to Do

### 1. Reload the App
Just refresh the page (Ctrl+R or Cmd+R)

### 2. Verify It's Working
Open DevTools Console and check for:
```
✅ Migrated to version 2.0.1
💡 This will clear old IndexedDB cache that was blocking queries
✓ Old cache cleared
```

### 3. Test It
1. Navigate to dashboard
2. Switch to another tab for 5 minutes
3. Switch back
4. Click around
5. **Should work immediately** without needing to clear cache

## If You Still Have Issues

### Quick Fix
```javascript
// In browser console:
window.clearOfflineCache().then(() => location.reload())
```

### Check Health
```javascript
// In browser console:
window.printAppHealth()
```

Should show:
- ✅ Online: true
- ✅ Has Session: true
- ✅ Recent API Call: true

### Full Reset (Last Resort)
```javascript
// In browser console:
window.resetApp()
```

## What Changed

### Before
```
OfflineInitializer runs → IndexedDB blocks → Queries stuck in pending
```

### After
```
OfflineInitializer disabled → No blocking → Queries work normally
```

## Key Files Changed
1. `src/app/[locale]/providers.tsx` - Disabled OfflineInitializer
2. `src/components/cache-migration.tsx` - Updated to v2.0.1
3. `src/hooks/useOfflineStatus.ts` - Removed polling
4. `src/components/offline-initializer.tsx` - Made non-blocking

## Why This Works

The app doesn't use offline features:
- ✅ Uses `useMissions` (normal React Query)
- ❌ NOT using `useOfflineMissions` (offline-first)

So there's no reason to initialize IndexedDB, which was just causing problems.

## Success Indicators

✅ No more "pending" queries
✅ API calls work immediately
✅ No cache clearing needed
✅ Faster page loads
✅ Better performance

## Testing Checklist

- [ ] Reload the app
- [ ] See migration message in console
- [ ] Navigate around (should work)
- [ ] Leave tab for 5 minutes
- [ ] Come back (should still work)
- [ ] No cache clearing needed
- [ ] Check Network tab (API calls happening)

---

**Version**: 2.0.1
**Status**: ✅ FIXED
**Impact**: Resolves critical query blocking issue
