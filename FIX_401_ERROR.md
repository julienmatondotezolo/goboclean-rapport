# 🔧 Fix 401 Unauthorized Error

## 🐛 The Error

```
POST http://localhost:3001/auth/onboarding 401 (Unauthorized)
```

## 🔍 Diagnosis

I've added detailed logging to both frontend and backend to help diagnose the issue.

---

## ✅ Quick Fix Steps

### Step 1: Check Backend Logs

The backend now has detailed logging. When you try to complete onboarding, check the backend terminal for:

**Good signs:**

```
🔑 AuthGuard: Token received, verifying...
✅ AuthGuard: Token valid for user: 9e024594-...
✅ AuthGuard: User authenticated: emji@yopmail.com
```

**Bad signs:**

```
❌ AuthGuard: No token provided
❌ AuthGuard: Token verification failed: ...
❌ AuthGuard: No user found in token
❌ AuthGuard: Profile fetch failed: ...
```

### Step 2: Check Frontend Console

The frontend now logs:

```
🔑 Session found, user ID: 9e024594-...
🔑 Access token length: 500+ (should be a long string)
📷 Profile picture added: image.jpg 123456 bytes
📤 Sending to: http://localhost:3001/auth/onboarding
📥 Response status: 200 (or 401 if error)
```

### Step 3: Verify Session

Open browser console and run:

```javascript
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);
console.log("Access token:", data.session?.access_token);
```

**Expected:**

- `session` should exist
- `access_token` should be a long JWT string

**If null:**

- User is not logged in
- Session expired
- Need to login again

---

## 🔧 Possible Causes & Fixes

### Cause 1: Session Expired

**Symptoms:**

- No session in browser console
- Frontend logs show "No active session"

**Fix:**

1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Try onboarding

### Cause 2: Token Not Being Sent

**Symptoms:**

- Backend logs: "❌ AuthGuard: No token provided"
- Frontend logs show token exists

**Fix:**
Check if CORS is blocking the Authorization header.

Backend `main.ts` should have:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
```

### Cause 3: Invalid Token

**Symptoms:**

- Backend logs: "❌ AuthGuard: Token verification failed"
- Token exists but is invalid

**Fix:**

1. Check if `SUPABASE_ANON_KEY` in backend `.env` matches frontend
2. Verify backend `.env`:
   ```env
   SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart backend after changing `.env`

### Cause 4: User Profile Not Found

**Symptoms:**

- Backend logs: "❌ AuthGuard: Profile fetch failed"
- Token is valid but profile doesn't exist

**Fix:**
Check if user exists in database:

```sql
SELECT * FROM users WHERE email = 'emji@yopmail.com';
```

If not found, the `handle_new_user` trigger might have failed.

### Cause 5: RLS Blocking Profile Fetch

**Symptoms:**

- Backend logs: "❌ AuthGuard: Profile fetch failed: permission denied"

**Fix:**
The AuthGuard uses the anon key, which might be blocked by RLS. We need to use the service role key instead.

**Update backend `.env`:**

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

Get the service role key from:

1. Supabase Dashboard
2. Project Settings → API
3. Copy "service_role" key (secret)

Then update `auth.guard.ts` to use service role key:

```typescript
constructor(private configService: ConfigService) {
  const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
  const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'); // Changed!

  this.supabase = createClient(supabaseUrl, supabaseKey);
}
```

---

## 🚀 Test Now

### Step 1: Restart Backend

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
# Stop if running
pkill -f "nest start"
# Start
npm run start:dev
```

### Step 2: Clear Browser & Login

1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to http://localhost:3000/fr/login
3. Login with `emji@yopmail.com`

### Step 3: Try Onboarding

1. Should redirect to `/onboarding`
2. Fill form and upload picture
3. Click "Profiel Voltooien"
4. **Watch both consoles:**
   - Frontend console (F12)
   - Backend terminal

### Step 4: Check Logs

**Frontend should show:**

```
🔑 Session found, user ID: ...
🔑 Access token length: 500+
📷 Profile picture added: ...
📤 Sending to: http://localhost:3001/auth/onboarding
📥 Response status: 200 ✅
```

**Backend should show:**

```
🔑 AuthGuard: Token received, verifying...
✅ AuthGuard: Token valid for user: ...
✅ AuthGuard: User authenticated: emji@yopmail.com
```

---

## 🔍 Advanced Debugging

### Test with cURL

Get your access token:

```javascript
// In browser console
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log(data.session.access_token);
```

Then test the endpoint:

```bash
curl -X POST http://localhost:3001/auth/onboarding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "profilePicture=@/path/to/image.jpg"
```

### Test with Swagger

1. Go to http://localhost:3001/api
2. Click "Authorize"
3. Paste your access token
4. Try the `/auth/onboarding` endpoint

---

## 📝 Most Likely Fix

Based on the error, the most likely issue is that the backend's `SUPABASE_SERVICE_ROLE_KEY` is not set correctly.

### Get Service Role Key

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy "service_role" key (the secret one, not anon)

### Update Backend .env

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG53enJzdmZ4Z29zc3l0dWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEzODAwOCwiZXhwIjoyMDg1NzE0MDA4fQ.YOUR_ACTUAL_KEY_HERE
```

### Restart Backend

```bash
npm run start:dev
```

### Test Again

Should work now! ✅

---

## ✅ Summary

**The issue is likely:**

- Session expired → Login again
- Service role key not set → Get from dashboard and update `.env`
- RLS blocking profile fetch → Use service role key in AuthGuard

**Check the logs to see exactly which error is occurring!**

The detailed logging I added will show you exactly where the authentication is failing.
