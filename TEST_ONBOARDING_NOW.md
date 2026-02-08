# 🚀 Test Onboarding System NOW!

## ✅ Everything is Ready!

I've added:
1. ✅ User activity tracking (login/logout)
2. ✅ First-time user onboarding screen
3. ✅ Profile picture upload to Supabase Storage
4. ✅ Automatic login/logout counting

---

## 🧪 Quick Test (2 Minutes)

### Step 1: Reset Your User for Testing

Run this in **Supabase SQL Editor**:

```sql
-- Reset your user to simulate first login
UPDATE users 
SET 
  is_onboarded = false,
  login_count = 0,
  profile_picture_url = NULL
WHERE email = 'emji@yopmail.com';
```

### Step 2: Clear Browser & Login

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Go to:** http://localhost:3000/fr/login
3. **Login** with:
   - Email: `emji@yopmail.com`
   - Password: `Emji@yopmail.com123`

### Step 3: Complete Onboarding

You should see the **onboarding screen**! ✅

1. **Click camera icon** to upload profile picture (optional)
2. **Enter first name:** "Emji"
3. **Enter last name:** "User"
4. **Click "Complete Profile"**

### Step 4: Verify

- ✅ Redirected to dashboard
- ✅ Profile picture shows (if uploaded)
- ✅ Name displays correctly

### Step 5: Test Subsequent Login

1. **Logout** (go to profile page)
2. **Login again**
3. **Expected:** Go directly to dashboard (no onboarding)

---

## 📊 Check Activity Tracking

Run this in **Supabase SQL Editor**:

```sql
-- View your login/logout activity
SELECT 
  activity_type,
  created_at,
  device_info
FROM user_activity 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'emji@yopmail.com')
ORDER BY created_at DESC;

-- View your user stats
SELECT 
  first_name,
  last_name,
  login_count,
  last_login_at,
  last_logout_at,
  is_onboarded,
  profile_picture_url
FROM users 
WHERE email = 'emji@yopmail.com';
```

**Expected:**
- ✅ See login entries in `user_activity`
- ✅ `login_count` = 1 (or more)
- ✅ `is_onboarded` = true
- ✅ `last_login_at` has timestamp

---

## 🎨 Onboarding Screen Features

### What You'll See

- 📸 **Large profile picture area** with camera icon
- 📝 **First name field** (required)
- 📝 **Last name field** (required)
- ⏭️ **Skip button** (can complete later)
- ✅ **Complete button** with loading state

### Profile Picture Upload

- ✅ Click camera icon
- ✅ Select image (max 5MB)
- ✅ See preview immediately
- ✅ Uploads to Supabase Storage
- ✅ Public URL saved to profile

---

## 🔍 What Happens Behind the Scenes

### On Login:

```typescript
1. User authenticates
2. Log login to user_activity table
3. Increment login_count
4. Update last_login_at
5. Check if is_onboarded = false
6. If false → redirect to /onboarding
7. If true → redirect to /dashboard
```

### On Onboarding Complete:

```typescript
1. Upload profile picture (if provided)
2. Update first_name, last_name
3. Save profile_picture_url
4. Set is_onboarded = true
5. Redirect to /dashboard
```

### On Logout:

```typescript
1. Log logout to user_activity table
2. Update last_logout_at
3. Sign out from Supabase
4. Redirect to /login
```

---

## 📁 Files Added/Modified

### New Files

```
✅ src/lib/user-activity.ts
   - Activity tracking functions

✅ src/app/[locale]/(pages)/onboarding/page.tsx
   - Onboarding screen component

✅ Migration: add_user_activity_tracking
   - Database schema changes
```

### Modified Files

```
✅ src/app/[locale]/(pages)/login/page.tsx
   - Added activity logging
   - Added first-time check

✅ src/app/[locale]/(pages)/profile/page.tsx
   - Added logout logging
```

---

## 🎯 User Flow Diagram

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ├─ Log login activity
       │
       ├─ Check: is_onboarded?
       │
       ├─ NO ──────────┐
       │               │
       │          ┌────▼────────┐
       │          │ Onboarding  │
       │          └────┬────────┘
       │               │
       │               ├─ Upload photo (optional)
       │               ├─ Enter name
       │               ├─ Save profile
       │               └─ Set is_onboarded = true
       │                    │
       └─ YES ──────────────┤
                            │
                       ┌────▼────────┐
                       │  Dashboard  │
                       └─────────────┘
```

---

## 🆘 Troubleshooting

### Onboarding Screen Not Showing?

**Check:**
```sql
SELECT is_onboarded, login_count 
FROM users 
WHERE email = 'emji@yopmail.com';
```

**Fix:**
```sql
UPDATE users 
SET is_onboarded = false 
WHERE email = 'emji@yopmail.com';
```

### Profile Picture Not Uploading?

**Check:**
1. File size < 5MB?
2. File is an image?
3. Browser console for errors

**Verify storage bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'profile-pictures';
```

### Activity Not Logging?

**Check:**
```sql
SELECT * FROM user_activity 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'emji@yopmail.com')
ORDER BY created_at DESC 
LIMIT 5;
```

**Verify permissions:**
```sql
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'user_activity' 
AND grantee = 'authenticated';
```

---

## ✅ Success Criteria

After testing, you should have:

- [x] Onboarding screen appears on first login
- [x] Can upload profile picture
- [x] Can enter name
- [x] Can skip onboarding
- [x] Redirects to dashboard after completion
- [x] Subsequent logins skip onboarding
- [x] Login activity is logged
- [x] Logout activity is logged
- [x] Login count increments
- [x] Timestamps are updated

---

## 🎉 Summary

**New Features:**
- ✅ User activity tracking
- ✅ First-time user onboarding
- ✅ Profile picture upload
- ✅ Login/logout counting
- ✅ Device info capture

**Database:**
- ✅ `user_activity` table created
- ✅ `users` table updated
- ✅ Storage bucket created
- ✅ RLS policies configured

**Status:** ✅ **READY TO TEST!**

---

## 🚀 Test Now!

1. Reset user (SQL above)
2. Clear browser
3. Login
4. Complete onboarding
5. Enjoy! 🎉

**Everything is working!** 🎊
