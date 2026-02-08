# 🔑 GET SERVICE ROLE KEY NOW - Required!

## 🐛 The Issue

```
❌ AuthGuard: No profile found for user: 9e024594-5a44-4278-b796-64077eaf2d69
```

## 🔍 Root Cause

The AuthGuard is using the **anon key** to query the database, but RLS policies are blocking the query.

The solution is to use the **service role key** which bypasses RLS for backend operations.

---

## ✅ The Fix Applied

I've updated the AuthGuard to use **two separate clients**:

1. **Anon key** - For JWT token verification
2. **Service role key** - For database queries (bypasses RLS)

```typescript
// Use anon key for auth verification
this.supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// Use service role key for database queries (bypasses RLS)
this.supabase = createClient(supabaseUrl, supabaseServiceKey);
```

---

## 🚀 ACTION REQUIRED: Get Service Role Key

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: **goboclean-rapport** (or the project with ID `ihlnwzrsvfxgossytuiz`)

### Step 2: Navigate to API Settings

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API**

### Step 3: Copy Service Role Key

Scroll down to **Project API keys** section:

- ✅ **anon / public** - Already have this (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- 🔑 **service_role** - **COPY THIS ONE!** (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` but different)

**IMPORTANT:**

- The service_role key is **SECRET** - never expose it to the frontend!
- It's safe to use in the backend because it's server-side only
- It bypasses all RLS policies

### Step 4: Update Backend .env

Open: `/Users/julienmatondo/goboclean-rapport-backend/.env`

**Replace this line:**

```env
SUPABASE_SERVICE_ROLE_KEY=GET_THIS_FROM_SUPABASE_DASHBOARD
```

**With:**

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

**Example (yours will be different):**

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG53enJzdmZ4Z29zc3l0dWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEzODAwOCwiZXhwIjoyMDg1NzE0MDA4fQ.SOME_LONG_STRING_HERE
```

### Step 5: Restart Backend

```bash
cd /Users/julienmatondo/goboclean-rapport-backend

# Stop current backend (Ctrl+C in terminal 2)
# Then start again:
npm run start:dev
```

**Wait for:**

```
🚀 Application is running on: http://localhost:3001
📚 Swagger docs available at: http://localhost:3001/api
```

---

## 🧪 Test After Adding Key

### Step 1: Refresh Onboarding Page

http://localhost:3000/fr/onboarding

### Step 2: Fill Form & Submit

- First name: "Emji"
- Last name: "Test"
- Upload profile picture
- Click "Profiel Voltooien"

### Step 3: Check Backend Logs

**Should now see:**

```
🔑 AuthGuard: Token received, verifying...
✅ AuthGuard: Token valid for user: 9e024594-5a44-4278-b796-64077eaf2d69
🔍 AuthGuard: Fetching profile from database...
📊 AuthGuard: Query result: { profileCount: 1, hasError: false }
✅ AuthGuard: User authenticated: emji@yopmail.com
```

**No more:**

```
❌ AuthGuard: No profile found for user: ...
```

### Step 4: Success! ✅

- ✅ Backend processes request
- ✅ Image uploads to Storage
- ✅ Profile updates in database
- ✅ Success toast appears
- ✅ Redirects to dashboard

---

## 🔒 Security Notes

### Why Service Role Key is Safe

**Frontend (anon key):**

- ✅ Exposed to browser
- ✅ Subject to RLS policies
- ✅ Limited permissions
- ✅ Safe for public use

**Backend (service role key):**

- ✅ Server-side only
- ✅ Never exposed to browser
- ✅ Bypasses RLS
- ✅ Full database access
- ✅ Safe because backend validates everything

### What We Use Each Key For

**Anon Key (Frontend & Backend Auth):**

- Frontend: All Supabase operations
- Backend: JWT token verification

**Service Role Key (Backend Only):**

- Backend: Database queries
- Backend: Storage operations
- Backend: Admin operations

---

## 📊 How It Works Now

```
1. User sends request with JWT token
   ↓
2. AuthGuard receives request
   ↓
3. Verify JWT using ANON KEY
   ├─ Token valid? ✅
   └─ Extract user ID
   ↓
4. Query database using SERVICE ROLE KEY
   ├─ Bypasses RLS ✅
   ├─ Finds user profile ✅
   └─ Returns profile data
   ↓
5. Attach user to request
   ↓
6. Controller processes onboarding
   ↓
7. Success! ✅
```

---

## 🎯 Summary

**Problem:** RLS blocking profile fetch  
**Cause:** Using anon key for database queries  
**Solution:** Use service role key for backend queries  
**Status:** ⏳ **WAITING FOR SERVICE ROLE KEY**

---

## ✅ Quick Steps

1. **Go to Supabase Dashboard** → Settings → API
2. **Copy "service_role" key** (the secret one)
3. **Update `.env`** in backend folder
4. **Restart backend** with `npm run start:dev`
5. **Test onboarding** - Should work! ✅

---

## 📝 Files Modified

- ✅ `src/auth/auth.guard.ts` - Now uses service role key for queries
- ⏳ `.env` - **YOU NEED TO UPDATE THIS!**

---

## 🆘 If You Can't Find the Key

### Option 1: Supabase Dashboard

1. https://supabase.com/dashboard
2. Select project
3. Settings → API
4. Copy "service_role" key

### Option 2: Check Project Settings

The service role key is in the same place as the anon key, just labeled differently:

- **anon** / **public** - For frontend
- **service_role** - For backend (this is what you need!)

---

## 🚀 After Adding the Key

The onboarding will work perfectly:

- ✅ AuthGuard can query database
- ✅ Profile found successfully
- ✅ Image uploads to Storage
- ✅ Database updates
- ✅ User onboarded

**Get the key and add it to `.env` now!** 🔑
