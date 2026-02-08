# 🚨 CRITICAL: Service Role Key Required!

## ⚠️ Backend Cannot Work Without This Key

The backend **MUST** have the service role key to bypass RLS and query the database.

---

## 🔑 Get the Key (2 Minutes)

### Visual Guide

```
Supabase Dashboard
└── Your Project (goboclean-rapport)
    └── Settings (⚙️ gear icon in sidebar)
        └── API
            └── Project API keys
                ├── anon public ✅ (already have)
                └── service_role 🔑 (NEED THIS!)
                    └── [Click "Copy" button]
```

### Step-by-Step

1. **Open:** https://supabase.com/dashboard

2. **Select project:** Look for `ihlnwzrsvfxgossytuiz` or "goboclean-rapport"

3. **Click Settings** (gear icon ⚙️) in left sidebar

4. **Click API** in the settings menu

5. **Scroll to "Project API keys"**

6. **Find "service_role"** (it's the second key, below "anon")

7. **Click the copy button** 📋 next to the service_role key

8. **Paste into `.env` file**

---

## 📝 Update .env File

### Location

```
/Users/julienmatondo/goboclean-rapport-backend/.env
```

### Find This Line

```env
SUPABASE_SERVICE_ROLE_KEY=GET_THIS_FROM_SUPABASE_DASHBOARD
```

### Replace With

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_COPIED_KEY_HERE
```

### Example (Your Key Will Be Different!)

```env
# Before (doesn't work)
SUPABASE_SERVICE_ROLE_KEY=GET_THIS_FROM_SUPABASE_DASHBOARD

# After (works!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG53enJzdmZ4Z29zc3l0dWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEzODAwOCwiZXhwIjoyMDg1NzE0MDA4fQ.abcdefghijklmnopqrstuvwxyz1234567890
```

---

## 🔄 Restart Backend

After updating `.env`:

```bash
# In Terminal 2 (where backend is running)
# Press Ctrl+C to stop

# Then restart:
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

---

## ✅ How to Verify It's Working

### After Restart, Try Onboarding

**Backend logs should show:**

```
🔑 AuthGuard: Token received, verifying...
✅ AuthGuard: Token valid for user: 9e024594...
🔍 AuthGuard: Fetching profile from database...
📊 AuthGuard: Query result: { profileCount: 1, hasError: false }
✅ AuthGuard: User authenticated: emji@yopmail.com
```

**If you still see:**

```
❌ AuthGuard: No profile found for user: ...
```

Then the service role key is either:

- Not copied correctly
- Not pasted in .env
- Backend not restarted

---

## 🎯 Why This Key is Needed

### The Problem

**Without service role key:**

```
Frontend → Backend → Database (with anon key)
                     ↓
                   RLS blocks query ❌
                     ↓
                   "No profile found"
```

**With service role key:**

```
Frontend → Backend → Database (with service role key)
                     ↓
                   RLS bypassed ✅
                     ↓
                   Profile found!
```

### What Each Key Does

| Key              | Used In                 | Purpose           | RLS         |
| ---------------- | ----------------------- | ----------------- | ----------- |
| **anon**         | Frontend + Backend auth | Public operations | ✅ Applied  |
| **service_role** | Backend queries         | Admin operations  | ❌ Bypassed |

---

## 🔒 Security

### Is It Safe?

**YES!** The service role key is safe because:

1. ✅ **Never exposed to frontend** - Only in backend .env
2. ✅ **Server-side only** - Users can't access it
3. ✅ **Backend validates everything** - We check permissions
4. ✅ **Standard practice** - All Supabase backends use this

### What We Use It For

- ✅ Fetching user profiles (bypasses RLS)
- ✅ Uploading files to Storage
- ✅ Updating user data
- ✅ Admin operations

---

## 📊 Complete .env File

Your backend `.env` should look like this:

```env
# Supabase Configuration
SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG53enJzdmZ4Z29zc3l0dWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgwMDgsImV4cCI6MjA4NTcxNDAwOH0.3agrqDXOPnBiHMHxm80nlf7F5qyswYaNGvMwxDkmZz8

# Application Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Only the `SUPABASE_SERVICE_ROLE_KEY` line needs to be updated!**

---

## 🆘 Troubleshooting

### Can't Find Supabase Dashboard?

Go to: https://supabase.com/dashboard

Login with your Supabase account.

### Can't Find the Project?

Look for:

- Project name: "goboclean-rapport"
- Project ID: `ihlnwzrsvfxgossytuiz`

### Can't Find API Settings?

1. Click the gear icon (⚙️) in the left sidebar
2. It should say "Settings" when you hover
3. Click "API" in the settings submenu

### Can't See Service Role Key?

Scroll down in the API settings page. You should see:

```
Project API keys
├── anon / public
│   └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└── service_role (secret)
    └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [Copy button]
```

---

## ✅ Quick Checklist

- [ ] Go to Supabase Dashboard
- [ ] Settings → API
- [ ] Copy "service_role" key
- [ ] Paste in `.env` file
- [ ] Save `.env` file
- [ ] Restart backend (Ctrl+C, then `npm run start:dev`)
- [ ] Test onboarding
- [ ] Success! ✅

---

## 🚀 After Adding the Key

Everything will work:

- ✅ AuthGuard finds user profile
- ✅ Onboarding processes successfully
- ✅ Image uploads to Storage
- ✅ Database updates
- ✅ User redirected to dashboard

**Get the key now and add it to `.env`!** 🔑

The backend is waiting for this key to work properly!
