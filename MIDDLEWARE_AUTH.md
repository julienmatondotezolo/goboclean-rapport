# Authentication Middleware Guide

## Overview

The authentication middleware automatically protects your Next.js application by redirecting unauthenticated users to the login page. It works seamlessly with your internationalization setup.

## How It Works

### 1. Request Flow

```
User Request → Middleware → Check Auth → Protected Page
                    ↓
              Not Authenticated
                    ↓
           Redirect to Login
```

### 2. Authentication Check

The middleware:
1. **Checks if the route is public** (login, signup, etc.)
2. **Skips static files** (images, CSS, JS, fonts)
3. **Skips API routes** (handled separately)
4. **Validates Supabase session** for protected routes
5. **Redirects to login** if no valid session found

### 3. Redirect Preservation

When redirected to login:
- Original URL is saved in `?redirect=/path`
- After successful login, user is sent back to original destination
- Example: `/fr/dashboard` → `/fr/login?redirect=/fr/dashboard` → `/fr/dashboard`

## Configuration

### Protected Routes (Default)

All routes except:
- `/login` - Login page
- `/signup` - Signup page (if you add one)
- `/reset-password` - Password reset page
- `/auth` - Auth callback routes
- Static files (`.ico`, `.png`, `.jpg`, `.svg`, `.css`, `.js`, fonts)
- API routes (`/api/*`)

### Adding Public Routes

Edit `src/middleware.ts`:

```typescript
const publicRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/auth',
  '/public-page', // Add your public route here
];
```

### Excluding Specific Routes

To make a specific page public, add it to the `publicRoutes` array:

```typescript
const publicRoutes = [
  '/login',
  '/signup',
  '/about',        // Public about page
  '/contact',      // Public contact page
  '/pricing',      // Public pricing page
];
```

## Usage Examples

### Scenario 1: User tries to access protected page

```
1. User visits: /fr/dashboard
2. No session found
3. Redirect to: /fr/login?redirect=/fr/dashboard
4. User logs in
5. Redirect to: /fr/dashboard
```

### Scenario 2: User is already logged in

```
1. User visits: /fr/reports
2. Valid session found
3. Access granted → Show /fr/reports
```

### Scenario 3: User visits login page while logged in

```
1. User visits: /fr/login
2. Login page is public
3. Access granted (they can logout and login again)
```

## Testing the Middleware

### Test 1: Protected Route Without Auth

```bash
# 1. Open browser in incognito mode
# 2. Visit: http://localhost:3000/fr/dashboard
# Expected: Redirect to /fr/login?redirect=/fr/dashboard
```

### Test 2: Login Redirect

```bash
# 1. Follow redirect from Test 1
# 2. Login with valid credentials
# Expected: Redirect back to /fr/dashboard
```

### Test 3: Public Route

```bash
# 1. Open browser in incognito mode
# 2. Visit: http://localhost:3000/fr/login
# Expected: Login page loads (no redirect)
```

### Test 4: Authenticated Access

```bash
# 1. Login normally
# 2. Visit: http://localhost:3000/fr/reports
# Expected: Reports page loads (no redirect)
```

## Client-Side Auth Check (Optional)

While middleware protects routes at the server level, you might want client-side checks for UI elements:

### Create Auth Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';

export function useAuth(requireAuth = true) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      setIsAuthenticated(!!session);
      setIsLoading(false);

      if (requireAuth && !session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  return { isAuthenticated, isLoading };
}
```

### Usage in Components

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Middleware will redirect
  }

  return <div>Protected Content</div>;
}
```

## Conditional UI Elements

Show/hide elements based on auth status:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Navigation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav>
      {user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
```

## Common Issues

### Issue 1: Infinite Redirect Loop

**Symptom**: Page keeps redirecting between login and protected page

**Causes**:
- Login page not in `publicRoutes`
- Session cookies not being set

**Solution**:
```typescript
// Verify login is public
const publicRoutes = ['/login', '/signup', '/reset-password', '/auth'];

// Check cookie settings in auth service
const supabase = createClient(); // Should handle cookies automatically
```

### Issue 2: Middleware Not Running

**Symptom**: Protected pages accessible without auth

**Causes**:
- `matcher` configuration doesn't include the route
- Middleware file not in correct location

**Solution**:
```typescript
// Check matcher in middleware.ts
export const config = {
  matcher: ["/", "/(fr|en|nl)/:path*"], // Should match your routes
};

// Ensure file is at: src/middleware.ts (not src/app/middleware.ts)
```

### Issue 3: Session Not Persisting

**Symptom**: User logged in but middleware doesn't detect session

**Causes**:
- Cookies not being set correctly
- Supabase client misconfigured

**Solution**:
```typescript
// Ensure you're using the middleware client
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const res = NextResponse.next();
const supabase = createMiddlewareClient({ req: request, res });
```

### Issue 4: Locale Lost After Redirect

**Symptom**: User redirected to wrong language after login

**Causes**:
- Locale not extracted correctly from pathname

**Solution**:
```typescript
// The middleware already handles this with getLocaleFromPathname()
// If issues persist, check that routing.locales includes all your locales

import { routing } from "./i18n/routing";
console.log(routing.locales); // Should show ['fr', 'en', 'nl']
```

## Debugging

### Enable Logging

Add console logs to middleware:

```typescript
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('🔍 Middleware:', pathname);
  
  // ... rest of middleware
  
  if (!session) {
    console.log('❌ No session, redirecting to login');
    // ... redirect logic
  } else {
    console.log('✅ Session found, allowing access');
  }
}
```

### Check Session in Browser

Open browser console:

```javascript
// Check if user is authenticated
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

## Security Best Practices

### 1. Always Use HTTPS in Production

```typescript
// In production, ensure HTTPS is enforced
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
  const url = request.nextUrl.clone();
  url.protocol = 'https:';
  return NextResponse.redirect(url);
}
```

### 2. Don't Expose Sensitive Routes

```typescript
// Keep admin routes protected
const publicRoutes = ['/login', '/signup']; // Don't add '/admin' here!
```

### 3. Validate Session on Server

```typescript
// Always validate on server-side too
// Client-side checks are for UX only

// In your server component or API route:
const supabase = createServerClient();
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  return { error: 'Unauthorized' };
}
```

### 4. Clear Sessions on Logout

```typescript
// In your logout function
const { authService } = await import('@/lib/auth');
await authService.logout();

// Redirect to login
router.push('/login');
```

## Advanced Configuration

### Role-Based Middleware

Add role checking to middleware:

```typescript
// After session check
if (session) {
  // Get user role
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  // Protect admin routes
  if (pathname.includes('/admin') && profile?.role !== 'admin') {
    const locale = getLocaleFromPathname(pathname);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
}
```

### Custom Redirect Logic

```typescript
// Redirect based on user role after login
if (session && pathname.includes('/login')) {
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const locale = getLocaleFromPathname(pathname);
  const redirectPath = profile?.role === 'admin' 
    ? `/${locale}/admin/dashboard` 
    : `/${locale}/dashboard`;
    
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
```

## Summary

✅ **Automatic protection** of all routes except login  
✅ **Seamless integration** with internationalization  
✅ **Redirect preservation** for better UX  
✅ **Easy configuration** via publicRoutes array  
✅ **Production-ready** security  

Your authentication middleware is now active and protecting your application!

## Quick Reference

| Route Type | Protected | Middleware Action |
|------------|-----------|-------------------|
| `/fr/dashboard` | ✅ Yes | Check auth → Allow or Redirect |
| `/fr/login` | ❌ No | Allow access |
| `/fr/signup` | ❌ No | Allow access |
| `/api/*` | ⚠️ Separate | Not checked (use API auth) |
| `*.png` | ❌ No | Allow access |

**Next Steps:**
1. Test the middleware by visiting protected pages without logging in
2. Verify redirect to login works
3. Confirm redirect back to original page after login
4. Add custom public routes as needed
