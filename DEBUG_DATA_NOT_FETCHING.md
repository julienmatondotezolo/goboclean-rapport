# 🔍 DEBUG: Data Not Fetching Issue

## Current Situation

You're seeing these logs:

```
🔐 [auth-x1kvvjl] Auth event: SIGNED_IN worker@goboclean.be
🔑 [auth-x1kvvjl] User signed in: worker@goboclean.be
🔄 [auth-x1kvvjl] Scheduling token refresh in 3228s
```

But data is not fetching. This means:

- ✅ Supabase authentication is working
- ✅ Session is created
- ❌ Queries are not running

## Diagnostic Tools Added

### 1. Dashboard Auth State Logging

Added to `src/app/[locale]/(pages)/dashboard/page.tsx`:

```typescript
useEffect(() => {
  console.log("🔍 [Dashboard] Auth state:", {
    hasUser: !!user,
    userId: user?.id,
    isAdmin,
    isAuthenticated,
    authLoading,
    userEmail: user?.email,
  });
}, [user, isAdmin, isAuthenticated, authLoading]);
```

**What to look for:**

- Is `hasUser` true?
- Is `userId` populated?
- Is `isAuthenticated` true?

### 2. Profile Load Success Logging

Added to `src/hooks/useAuth.ts`:

```typescript
console.log(`✅ [${componentIdRef.current}] Profile loaded successfully:`, {
  userId: profile.id,
  email: profile.email,
  role: profile.role,
  hasRequiredRole: hasRole,
});
```

**What to look for:**

- Do you see "Profile loaded successfully" in the console?
- If NOT, the profile fetch is failing

### 3. Auth Diagnostics Script

New script: `public/auth-diagnostics.js`

Runs automatically at 3s and 6s after page load, or call `window.authDiagnostics()`

**What it checks:**

- How many queries are enabled vs disabled
- Which queries are pending but not fetching
- Which queries have errors
- LocalStorage auth data

## What to Check

### Step 1: Refresh the page and check console logs

Look for this sequence:

```
1. 🔐 Auth event: SIGNED_IN
2. ✅ Profile loaded successfully  ← IMPORTANT!
3. 🔍 [Dashboard] Auth state: { hasUser: true, ... }
4. 💬 API GET /missions
5. 💬 API GET /missions - SUCCESS
```

### Step 2: If you DON'T see "Profile loaded successfully"

This means the profile fetch is failing. Check for:

- `❌ Profile fetch failed:` error message
- Database connection issues
- RLS (Row Level Security) policy issues

### Step 3: If you DO see "Profile loaded successfully" but queries don't run

Check the auth diagnostics output:

```
window.authDiagnostics()
```

Look for:

- Are queries disabled? (`enabled = false`)
- Are queries pending but not fetching?
- Any error messages?

### Step 4: Check the query debug output

```
window.debugQueries()
```

Look for:

- Query states (pending/success/error)
- Fetch states (idle/fetching/paused)
- Which queries are disabled

## Common Issues

### Issue 1: Profile Fetch Fails

**Symptoms:**

- See `SIGNED_IN` event
- DON'T see "Profile loaded successfully"
- See "Profile fetch failed" error

**Causes:**

- User not in database
- RLS policy blocking read
- Database connection issue

**Fix:**

- Check if user exists in `users` table
- Check RLS policies on `users` table
- Check database connection

### Issue 2: Queries Stay Disabled

**Symptoms:**

- See "Profile loaded successfully"
- Dashboard shows `hasUser: false`
- Queries show `enabled = false`

**Causes:**

- `user` state not updating
- React state update issue
- Multiple useAuth instances interfering

**Fix:**

- Check if `user` object is populated
- Check for React strict mode double-mounting
- Check for state update race conditions

### Issue 3: Queries Enabled But Not Fetching

**Symptoms:**

- See "Profile loaded successfully"
- Dashboard shows `hasUser: true`
- Queries show `enabled = true` but `fetchStatus: idle`

**Causes:**

- React Query configuration issue
- Network mode blocking
- Query key mismatch

**Fix:**

- Check `networkMode: 'always'` in providers
- Check query keys are correct
- Try manual refetch: `window.__REACT_QUERY_CLIENT__.refetchQueries()`

## Next Steps

1. **Refresh the page** and watch the console logs carefully
2. **Look for the sequence** of logs described in Step 1
3. **Identify which step is missing** or failing
4. **Run diagnostics** if needed:
   - `window.authDiagnostics()` - Check auth state
   - `window.debugQueries()` - Check query state
   - `window.clearCache()` - Clear all cache and reload

5. **Share the logs** with me, specifically:
   - Do you see "Profile loaded successfully"?
   - What does `🔍 [Dashboard] Auth state` show?
   - What does `window.authDiagnostics()` show?
   - What does `window.debugQueries()` show?

## Expected Working Flow

```
Page Load
    ↓
🔐 Auth event: SIGNED_IN worker@goboclean.be
    ↓
Fetch profile from database...
    ↓
✅ Profile loaded successfully: { userId: '...', email: '...', role: 'worker' }
    ↓
setState({ user: profile, isAuthenticated: true })
    ↓
🔍 [Dashboard] Auth state: { hasUser: true, isAuthenticated: true }
    ↓
Queries become enabled (!!user = true)
    ↓
💬 API GET /missions
💬 API GET /notifications
    ↓
💬 API GET /missions - SUCCESS
💬 API GET /notifications - SUCCESS
    ↓
✅ Data displayed on dashboard
```

## If Still Not Working

If you've checked all the above and it's still not working, we need to:

1. Check if there's a **timing issue** between auth state update and query enabling
2. Check if there's a **React rendering issue** preventing queries from seeing the updated state
3. Check if there's a **Supabase client issue** with multiple instances
4. Consider using `isAuthenticated` instead of `!!user` to avoid waiting for profile fetch

---

**Run the diagnostics and share the output with me so we can identify the exact issue!** 🔍
