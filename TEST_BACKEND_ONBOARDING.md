# 🧪 Test Backend Onboarding - Quick Guide

## ✅ What's New

The onboarding now runs **completely through the backend**:
- ✅ Backend uploads image to Supabase Storage
- ✅ Backend saves first name, last name, and profile picture URL
- ✅ Backend sets `is_onboarded = true`
- ✅ Single API call from frontend

---

## 🚀 Quick Test (2 Minutes)

### Step 1: Ensure Backend is Running

Check terminal 2 (backend):
```bash
# Should see:
🚀 Application is running on: http://localhost:3001
📚 Swagger docs available at: http://localhost:3001/api
```

If not running:
```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

### Step 2: Reset Test User

Run in Supabase SQL editor or via MCP:
```sql
UPDATE users 
SET 
  is_onboarded = false,
  profile_picture_url = NULL,
  first_name = 'New',
  last_name = 'User'
WHERE email = 'emji@yopmail.com';
```

### Step 3: Test Onboarding Flow

1. **Go to login:**
   - http://localhost:3000/fr/login

2. **Login:**
   - Email: `emji@yopmail.com`
   - Password: `Emji@yopmail.com123`

3. **Should redirect to onboarding:**
   - URL: http://localhost:3000/fr/onboarding

4. **Fill the form:**
   - First name: "Emji"
   - Last name: "Test"
   - Click camera icon → Select image (< 5MB)
   - See preview ✅

5. **Click "Profiel Voltooien":**
   - Should see loading spinner
   - Should see green success toast
   - Should redirect to dashboard

6. **Verify:**
   - ✅ Profile picture displays in dashboard
   - ✅ Name shows: "Welcome, Emji"
   - ✅ No errors in console

---

## 🔍 Verify Backend Processed It

### Check Browser Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Look for request:**
   ```
   POST http://localhost:3001/auth/onboarding
   Status: 200 OK
   ```

4. **Check Response:**
   ```json
   {
     "success": true,
     "message": "Onboarding completed successfully",
     "user": {
       "id": "...",
       "first_name": "Emji",
       "last_name": "Test",
       "profile_picture_url": "https://...supabase.co/storage/.../profile.jpg",
       "is_onboarded": true
     }
   }
   ```

### Check Database

```sql
SELECT 
  first_name,
  last_name,
  profile_picture_url,
  is_onboarded
FROM users 
WHERE email = 'emji@yopmail.com';
```

**Expected:**
```
first_name: "Emji"
last_name: "Test"
profile_picture_url: "https://ihlnwzrsvfxgossytuiz.supabase.co/storage/v1/object/public/profile-pictures/9e024594.../profile.jpg"
is_onboarded: true
```

### Check Supabase Storage

1. Go to Supabase Dashboard
2. Storage → profile-pictures
3. Should see folder: `9e024594-5a44-4278-b796-64077eaf2d69`
4. Should see file: `profile.jpg`

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Cause:** Backend not running

**Fix:**
```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

### Error: "Unauthorized"

**Cause:** Invalid JWT token

**Fix:**
1. Logout
2. Clear browser cache
3. Login again

### Error: "File must be an image"

**Cause:** Selected file is not an image

**Fix:** Select a valid image file (jpg, png, webp, etc.)

### Error: "Image size must be less than 5MB"

**Cause:** Image file too large

**Fix:** Select a smaller image or compress it

### Error: CORS

**Cause:** Backend CORS not configured

**Fix:** Already configured in `main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## 📊 Test with Swagger

### Option: Test API Directly

1. **Go to Swagger:**
   - http://localhost:3001/api

2. **Find endpoint:**
   - `POST /auth/onboarding`

3. **Authorize:**
   - Click "Authorize" button
   - Get token from browser:
     ```javascript
     // In browser console:
     const supabase = createClient();
     const { data } = await supabase.auth.getSession();
     console.log(data.session.access_token);
     ```
   - Paste token in Swagger

4. **Try it out:**
   - Click "Try it out"
   - Upload image
   - Enter firstName: "Test"
   - Enter lastName: "User"
   - Click "Execute"

5. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Onboarding completed successfully",
     "user": { ... }
   }
   ```

---

## ✅ Success Indicators

### Frontend
- ✅ Form submits without errors
- ✅ Green success toast appears
- ✅ Redirects to dashboard
- ✅ Profile picture displays
- ✅ User name displays

### Backend
- ✅ POST /auth/onboarding returns 200
- ✅ Response includes user data
- ✅ No errors in backend console

### Database
- ✅ `first_name` updated
- ✅ `last_name` updated
- ✅ `profile_picture_url` set
- ✅ `is_onboarded = true`

### Storage
- ✅ File uploaded to profile-pictures bucket
- ✅ File accessible via public URL
- ✅ Image displays when URL opened

---

## 🎯 What to Look For

### In Browser Console (F12)

**Good:**
```
✅ No errors
✅ "Upload succeeded" or similar success message
```

**Bad:**
```
❌ Failed to fetch
❌ 401 Unauthorized
❌ 400 Bad Request
❌ CORS error
```

### In Backend Console

**Good:**
```
✅ No errors
✅ Request logged (if logging enabled)
```

**Bad:**
```
❌ Error: File must be an image
❌ Error: Image size must be less than 5MB
❌ Error: Failed to update user profile
```

---

## 🔄 Reset and Test Again

If you want to test multiple times:

```sql
-- Reset user
UPDATE users 
SET is_onboarded = false, profile_picture_url = NULL 
WHERE email = 'emji@yopmail.com';

-- Delete old profile picture (optional)
-- Go to Supabase Storage and manually delete
```

Then repeat the test flow!

---

## 📝 Summary

**Test Steps:**
1. ✅ Backend running on :3001
2. ✅ Reset user in database
3. ✅ Login at frontend
4. ✅ Fill onboarding form
5. ✅ Submit form
6. ✅ Verify success

**Expected Result:**
- ✅ Backend receives FormData
- ✅ Backend uploads image to Storage
- ✅ Backend updates user profile
- ✅ Backend sets is_onboarded = true
- ✅ Frontend shows success
- ✅ Frontend redirects to dashboard

**Status:** ✅ **READY TO TEST!**

---

## 🚀 Test Now!

Just run the 3 steps above and it should work perfectly! 🎉

**Backend handles everything!** No more client-side storage uploads or database updates.
