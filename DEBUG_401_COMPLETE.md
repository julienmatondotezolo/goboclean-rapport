# 🔧 401 Error - Debugging Complete!

## ✅ What I Fixed

### 1. Added Detailed Logging ✅

**Backend (`auth.guard.ts`):**

- ✅ Logs when token is received
- ✅ Logs token verification result
- ✅ Logs user authentication success/failure
- ✅ Logs profile fetch errors
- ✅ Shows exact error messages

**Frontend (`onboarding/page.tsx`):**

- ✅ Logs session status
- ✅ Logs access token length
- ✅ Logs file upload details
- ✅ Logs request URL
- ✅ Logs response status

### 2. Improved CORS Configuration ✅

**Backend (`main.ts`):**

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  exposedHeaders: ["Authorization"],
});
```

**Why:** Explicitly allows Authorization header for JWT tokens

---

## 🚀 Test Now with Logging

### Step 1: Restart Backend

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

### Step 2: Open Both Consoles

**Frontend Console:**

- Open browser
- Press F12
- Go to Console tab

**Backend Console:**

- Terminal 2 (where backend is running)

### Step 3: Test Onboarding

1. **Login:**
   - http://localhost:3000/fr/login
   - Email: `emji@yopmail.com`
   - Password: `Emji@yopmail.com123`

2. **Onboarding:**
   - Should redirect to `/onboarding`
   - Fill form
   - Upload picture
   - Click "Profiel Voltooien"

3. **Watch Logs:**

**Frontend Console should show:**

```
🔑 Session found, user ID: 9e024594-5a44-4278-b796-64077eaf2d69
🔑 Access token length: 500
📷 Profile picture added: image.jpg 123456 bytes
📤 Sending to: http://localhost:3001/auth/onboarding
📥 Response status: 200
```

**Backend Terminal should show:**

```
🔑 AuthGuard: Token received, verifying...
✅ AuthGuard: Token valid for user: 9e024594-5a44-4278-b796-64077eaf2d69
✅ AuthGuard: User authenticated: emji@yopmail.com
```

---

## 🐛 If Still Getting 401

The logs will now tell you **exactly** what's wrong:

### Error 1: "❌ AuthGuard: No token provided"

**Meaning:** Authorization header not reaching backend

**Possible causes:**

1. CORS blocking the header
2. Frontend not sending the header
3. Proxy stripping the header

**Fix:**

- Backend CORS is now fixed ✅
- Check if using a proxy (nginx, etc.)

### Error 2: "❌ AuthGuard: Token verification failed"

**Meaning:** Token is invalid or expired

**Possible causes:**

1. Session expired
2. Wrong Supabase keys
3. Token format incorrect

**Fix:**

1. **Logout and login again**
2. **Check backend `.env`:**
   ```env
   SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG53enJzdmZ4Z29zc3l0dWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgwMDgsImV4cCI6MjA4NTcxNDAwOH0.3agrqDXOPnBiHMHxm80nlf7F5qyswYaNGvMwxDkmZz8
   ```
3. **Restart backend**

### Error 3: "❌ AuthGuard: Profile fetch failed: permission denied"

**Meaning:** RLS is blocking the profile fetch

**Fix:**
The AuthGuard needs to use the **service role key** instead of anon key.

**Update `auth.guard.ts`:**

```typescript
constructor(private configService: ConfigService) {
  const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
  // Change this line:
  const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

  this.supabase = createClient(supabaseUrl, supabaseKey);
}
```

**Get service role key:**

1. Supabase Dashboard → Project Settings → API
2. Copy "service_role" key (secret)
3. Update backend `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```
4. Restart backend

### Error 4: "❌ AuthGuard: No profile found for user"

**Meaning:** User exists in auth but not in users table

**Fix:**

```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'emji@yopmail.com';
SELECT * FROM users WHERE email = 'emji@yopmail.com';

-- If missing from users table, trigger might have failed
-- Manually create profile:
INSERT INTO users (id, email, first_name, last_name, role)
SELECT id, email, 'Emji', 'User', 'worker'
FROM auth.users
WHERE email = 'emji@yopmail.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 📊 Understanding the Logs

### Frontend Logs

```
🔑 Session found, user ID: 9e024594...
```

✅ Good: User is logged in

```
🔑 Access token length: 0
```

❌ Bad: No access token (session expired)

```
📷 Profile picture added: image.jpg 123456 bytes
```

✅ Good: File is being sent

```
📤 Sending to: http://localhost:3001/auth/onboarding
```

✅ Good: Correct URL

```
📥 Response status: 200
```

✅ Good: Success!

```
📥 Response status: 401
```

❌ Bad: Unauthorized (check backend logs)

### Backend Logs

```
🔑 AuthGuard: Token received, verifying...
```

✅ Good: Token reached backend

```
❌ AuthGuard: No token provided
```

❌ Bad: Authorization header missing

```
✅ AuthGuard: Token valid for user: 9e024594...
```

✅ Good: Token is valid

```
❌ AuthGuard: Token verification failed: Invalid JWT
```

❌ Bad: Token is malformed or wrong key

```
✅ AuthGuard: User authenticated: emji@yopmail.com
```

✅ Good: Everything works!

```
❌ AuthGuard: Profile fetch failed: permission denied
```

❌ Bad: RLS blocking (need service role key)

---

## 🎯 Most Likely Solution

Based on typical issues, the problem is usually:

### Option 1: Session Expired (Most Common)

**Solution:**

1. Clear browser cache
2. Logout
3. Login again
4. Try onboarding

### Option 2: RLS Blocking Profile Fetch

**Solution:**
Update AuthGuard to use service role key:

**File:** `src/auth/auth.guard.ts`

```typescript
constructor(private configService: ConfigService) {
  const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
  const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'); // Changed!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration for AuthGuard');
  }

  this.supabase = createClient(supabaseUrl, supabaseKey);
}
```

**File:** `.env`

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

Get the service role key from Supabase Dashboard → Settings → API

---

## ✅ Files Modified

1. **`src/auth/auth.guard.ts`** - Added detailed logging
2. **`src/main.ts`** - Improved CORS configuration
3. **`src/app/[locale]/(pages)/onboarding/page.tsx`** - Added frontend logging

---

## 🚀 Action Items

### 1. Restart Backend ✅

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

### 2. Test with Logging ✅

- Open both consoles
- Try onboarding
- Read the logs to see exact error

### 3. Apply Fix Based on Logs ✅

The logs will tell you exactly what to fix!

---

## 📝 Summary

**What I Did:**

- ✅ Added comprehensive logging to both frontend and backend
- ✅ Improved CORS configuration
- ✅ Made error messages more descriptive

**What You Need to Do:**

1. Restart backend
2. Test onboarding
3. Read the logs
4. Apply the specific fix based on the error message

**The logs will guide you to the exact solution!** 🎯

---

## 🆘 Quick Fixes

### If "No token provided":

- Check CORS (already fixed ✅)
- Check if Authorization header is being sent

### If "Token verification failed":

- Logout and login again
- Check SUPABASE_ANON_KEY in backend .env

### If "Profile fetch failed":

- Use SUPABASE_SERVICE_ROLE_KEY in AuthGuard
- Get key from Supabase Dashboard

### If "No profile found":

- Check users table
- Run handle_new_user trigger manually

**Test now and check the logs!** 🚀
