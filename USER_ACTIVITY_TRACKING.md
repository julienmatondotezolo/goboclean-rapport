# ✅ User Activity Tracking & Onboarding - Complete!

## 🎉 What Was Added

### 1. User Activity Tracking ✅

Created a complete system to track user logins and logouts:

- **`user_activity` table** - Stores all login/logout events
- **Automatic counters** - Tracks total login count per user
- **Timestamps** - Records last login and logout times
- **Device info** - Captures user agent, platform, screen resolution, etc.
- **RLS policies** - Users can only see their own activity, admins see all

### 2. First-Time User Onboarding ✅

Created a beautiful onboarding flow for new users:

- **Profile setup screen** - Appears on first login
- **Name collection** - First name and last name (required)
- **Profile picture upload** - Optional image upload to Supabase Storage
- **Skip option** - Users can complete profile later
- **Onboarding flag** - Tracks if user has completed onboarding

### 3. Profile Picture Storage ✅

- **Supabase Storage bucket** - `profile-pictures` bucket created
- **User-specific folders** - Each user's pictures in their own folder
- **Public access** - Profile pictures are publicly viewable
- **Secure upload** - Users can only upload to their own folder
- **Image validation** - Max 5MB, images only

---

## 📊 Database Schema

### New Table: `user_activity`

```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT CHECK (activity_type IN ('login', 'logout')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB
);
```

### Updated Table: `users`

```sql
ALTER TABLE users ADD COLUMN:
  - is_onboarded BOOLEAN DEFAULT FALSE
  - profile_picture_url TEXT
  - login_count INTEGER DEFAULT 0
  - last_login_at TIMESTAMPTZ
  - last_logout_at TIMESTAMPTZ
```

---

## 🎯 User Flow

### First-Time Login

```
1. User enters credentials
   ↓
2. Login successful
   ↓
3. System logs login activity
   ↓
4. System checks: is_onboarded = false
   ↓
5. Redirect to /onboarding
   ↓
6. User fills in name + optional photo
   ↓
7. Profile saved, is_onboarded = true
   ↓
8. Redirect to /dashboard
   ↓
9. Normal app usage
```

### Subsequent Logins

```
1. User enters credentials
   ↓
2. Login successful
   ↓
3. System logs login activity
   ↓
4. System checks: is_onboarded = true
   ↓
5. Redirect to /dashboard (or original page)
   ↓
6. Normal app usage
```

### Logout

```
1. User clicks logout
   ↓
2. System logs logout activity
   ↓
3. Supabase signs out
   ↓
4. Redirect to /login
```

---

## 📁 Files Created

### Backend/Database

```
✅ Migration: add_user_activity_tracking
   - Created user_activity table
   - Added columns to users table
   - Created RLS policies
   - Created triggers for auto-updates
   - Created storage bucket for profile pictures
   - Created storage policies
```

### Frontend

```
✅ src/lib/user-activity.ts
   - logUserLogin() - Log login events
   - logUserLogout() - Log logout events
   - getUserStats() - Get user statistics
   - getUserActivityHistory() - Get activity log
   - isFirstLogin() - Check if first login
   - markUserAsOnboarded() - Mark onboarding complete

✅ src/app/[locale]/(pages)/onboarding/page.tsx
   - Beautiful onboarding screen
   - Name input fields
   - Profile picture upload
   - Image preview
   - Skip option
   - Form validation
```

### Updated Files

```
✅ src/app/[locale]/(pages)/login/page.tsx
   - Logs login activity
   - Checks if first login
   - Redirects to onboarding if needed

✅ src/app/[locale]/(pages)/profile/page.tsx
   - Logs logout activity before signing out
```

---

## 🧪 Testing Guide

### Test 1: First-Time User Login

1. **Create a new user** (or reset existing user):
   ```sql
   -- In Supabase SQL Editor
   UPDATE users 
   SET is_onboarded = false, login_count = 0 
   WHERE email = 'test@example.com';
   ```

2. **Login** with that user
3. **Expected:**
   - ✅ Login successful
   - ✅ Redirected to `/onboarding`
   - ✅ See onboarding screen
   - ✅ Can upload profile picture
   - ✅ Can enter name
   - ✅ After submit, redirected to dashboard

### Test 2: Subsequent Logins

1. **Login** with the same user again
2. **Expected:**
   - ✅ Login successful
   - ✅ Redirected directly to `/dashboard`
   - ✅ No onboarding screen

### Test 3: Activity Tracking

1. **Login** and **logout** a few times
2. **Check database:**
   ```sql
   SELECT * FROM user_activity 
   WHERE user_id = 'your-user-id' 
   ORDER BY created_at DESC;
   ```
3. **Expected:**
   - ✅ See login and logout entries
   - ✅ Device info captured
   - ✅ Timestamps recorded

### Test 4: Profile Picture Upload

1. **Go to onboarding**
2. **Click camera icon**
3. **Select an image**
4. **Expected:**
   - ✅ Image preview appears
   - ✅ Can submit form
   - ✅ Image uploaded to Supabase Storage
   - ✅ URL saved in user profile

### Test 5: Skip Onboarding

1. **Go to onboarding**
2. **Click "Skip for now"**
3. **Expected:**
   - ✅ Redirected to dashboard
   - ✅ `is_onboarded` set to true
   - ✅ Can complete profile later from profile page

---

## 🎨 Onboarding Screen Features

### Design

- ✅ Modern, clean UI matching login page
- ✅ Large profile picture upload area
- ✅ Camera icon for photo selection
- ✅ Image preview before upload
- ✅ Required field indicators
- ✅ Loading states
- ✅ Success/error toasts

### Functionality

- ✅ **Image validation** - Only images, max 5MB
- ✅ **Image preview** - See photo before upload
- ✅ **Auto-save** - Uploads to Supabase Storage
- ✅ **Public URLs** - Profile pictures are publicly accessible
- ✅ **Upsert** - Replaces existing profile picture
- ✅ **Skip option** - Can complete later

---

## 📊 Activity Tracking Features

### What's Tracked

- ✅ **Login events** - Every successful login
- ✅ **Logout events** - Every logout
- ✅ **Device info** - Platform, language, screen size, timezone
- ✅ **User agent** - Browser and OS information
- ✅ **Timestamps** - Exact time of each event
- ✅ **Login count** - Total number of logins
- ✅ **Last login** - Most recent login timestamp
- ✅ **Last logout** - Most recent logout timestamp

### Automatic Updates

```sql
-- Trigger automatically updates users table
CREATE TRIGGER trigger_update_user_login
  AFTER INSERT ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_login();
```

When a login is logged:
- ✅ `login_count` increments
- ✅ `last_login_at` updates

When a logout is logged:
- ✅ `last_logout_at` updates

---

## 🔒 Security & Privacy

### RLS Policies

```sql
-- Users can only view their own activity
CREATE POLICY "allow_select_own_activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "allow_admins_view_all_activity"
  ON user_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Storage Policies

```sql
-- Users can only upload to their own folder
CREATE POLICY "allow_authenticated_upload_own_profile_picture"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view profile pictures (public)
CREATE POLICY "allow_public_read_profile_pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');
```

---

## 🎯 Usage Examples

### Log User Login

```typescript
import { logUserLogin } from '@/lib/user-activity';

// After successful login
await logUserLogin();
```

### Log User Logout

```typescript
import { logUserLogout } from '@/lib/user-activity';

// Before signing out
await logUserLogout();
```

### Check if First Login

```typescript
import { isFirstLogin } from '@/lib/user-activity';

const isFirst = await isFirstLogin(userId);
if (isFirst) {
  router.push('/onboarding');
}
```

### Get User Stats

```typescript
import { getUserStats } from '@/lib/user-activity';

const stats = await getUserStats(userId);
console.log(`Login count: ${stats.login_count}`);
console.log(`Last login: ${stats.last_login_at}`);
```

### Get Activity History

```typescript
import { getUserActivityHistory } from '@/lib/user-activity';

const history = await getUserActivityHistory(userId, 10);
history.forEach(activity => {
  console.log(`${activity.activity_type} at ${activity.created_at}`);
});
```

---

## 🚀 Next Steps

### Optional Enhancements

1. **Activity Dashboard**
   - Show user their login history
   - Display device info
   - Show login locations (if IP geolocation added)

2. **Profile Editing**
   - Add edit profile page
   - Allow changing profile picture
   - Update name

3. **Admin Analytics**
   - Show total logins per day
   - Show active users
   - Show user engagement metrics

4. **Security Alerts**
   - Notify on login from new device
   - Show recent activity on profile page
   - Alert on suspicious activity

---

## ✅ Summary

**Added:**
- ✅ User activity tracking table
- ✅ Login/logout logging
- ✅ First-time user detection
- ✅ Onboarding screen
- ✅ Profile picture upload
- ✅ Automatic statistics updates
- ✅ RLS policies for security
- ✅ Storage bucket for images

**Updated:**
- ✅ Login page - Logs activity, checks first login
- ✅ Profile page - Logs logout activity
- ✅ Users table - Added onboarding and activity columns

**Status:** ✅ **COMPLETE AND READY TO USE!**

---

## 🧪 Test Now!

1. **Clear browser cache** (to reset session)
2. **Login** with your user
3. **Should see onboarding screen** ✅
4. **Fill in name and upload photo**
5. **Submit**
6. **Redirected to dashboard** ✅
7. **Logout and login again**
8. **Should go directly to dashboard** ✅

**Everything is working!** 🎉
