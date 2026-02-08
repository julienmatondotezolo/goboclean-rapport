# 🚀 RESTART BACKEND NOW!

## ⚠️ IMPORTANT: Backend Must Be Restarted

The backend code has been updated with the new `/auth/onboarding` endpoint, but **the backend needs to be restarted** to pick up the changes.

---

## 🔧 Restart Backend (30 Seconds)

### Step 1: Open Terminal 2 (Backend)

The terminal should show:
```
zsh: terminated  npm start start:dev
julienmatondo@EMJI-M4-PRO goboclean-rapport-backend %
```

### Step 2: Restart Backend

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

### Step 3: Verify New Endpoint

You should see the new route in the logs:
```
[Nest] ... LOG [RouterExplorer] Mapped {/auth/signup, POST} route
[Nest] ... LOG [RouterExplorer] Mapped {/auth/me, GET} route
[Nest] ... LOG [RouterExplorer] Mapped {/auth/refresh, POST} route
[Nest] ... LOG [RouterExplorer] Mapped {/auth/onboarding, POST} route  ← NEW! ✅
[Nest] ... LOG [RouterExplorer] Mapped {/reports/:id/generate-pdf, POST} route
...
🚀 Application is running on: http://localhost:3001
📚 Swagger docs available at: http://localhost:3001/api
```

**Look for:** `/auth/onboarding` route ✅

---

## ✅ What Was Added

### New Backend Endpoint

```
POST /auth/onboarding
```

**Features:**
- ✅ Accepts multipart/form-data (firstName, lastName, profilePicture)
- ✅ Protected by AuthGuard (requires JWT token)
- ✅ Uploads image to Supabase Storage
- ✅ Updates user profile (first_name, last_name, profile_picture_url)
- ✅ Sets is_onboarded = true
- ✅ Returns updated user data

---

## 🧪 Test After Restart

### Quick Test

1. **Verify backend is running:**
   ```
   http://localhost:3001/api
   ```
   Should see Swagger UI with new endpoint

2. **Reset test user:**
   ```sql
   UPDATE users 
   SET is_onboarded = false, profile_picture_url = NULL 
   WHERE email = 'emji@yopmail.com';
   ```

3. **Test onboarding:**
   - Login at http://localhost:3000/fr/login
   - Should redirect to /onboarding
   - Fill form and upload picture
   - Click "Profiel Voltooien"
   - Should work! ✅

---

## 📊 Check Swagger

After restart, go to:
```
http://localhost:3001/api
```

You should see:
- ✅ `POST /auth/signup`
- ✅ `GET /auth/me`
- ✅ `POST /auth/refresh`
- ✅ `POST /auth/onboarding` ← **NEW!**

Click on the new endpoint to see:
- **Request Body:** multipart/form-data
  - firstName (string, required)
  - lastName (string, required)
  - profilePicture (file, required)
- **Responses:**
  - 200: Success with user data
  - 400: Bad Request
  - 401: Unauthorized

---

## 🔍 Verify Changes

### Files Modified

1. **Backend Controller:**
   - `src/auth/auth.controller.ts`
   - Added `@Post('onboarding')` endpoint
   - Uses `FileInterceptor` for file upload

2. **Backend Service:**
   - `src/auth/auth.service.ts`
   - Added `completeOnboarding()` method
   - Handles image upload and user update

3. **Frontend:**
   - `src/app/[locale]/(pages)/onboarding/page.tsx`
   - Now sends FormData to backend
   - Removed direct Supabase operations

---

## 🎯 What Happens Now

### Old Flow (Before)
```
Frontend → Upload to Storage → Update Database → Done
```

### New Flow (After) ✅
```
Frontend → Backend API → Backend uploads to Storage → Backend updates Database → Done
```

**Benefits:**
- ✅ All logic in backend
- ✅ Secure (service role key never exposed)
- ✅ Single API call
- ✅ Easy to maintain

---

## 🚀 Restart Command

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
npm run start:dev
```

**Then test the onboarding flow!** 🎉

---

## 📝 Summary

**What to do:**
1. ✅ Restart backend with `npm run start:dev`
2. ✅ Verify `/auth/onboarding` route appears in logs
3. ✅ Check Swagger at http://localhost:3001/api
4. ✅ Test onboarding flow

**Expected:**
- ✅ Backend starts successfully
- ✅ New endpoint shows in logs
- ✅ Swagger shows new endpoint
- ✅ Onboarding works perfectly

**Status:** ⏳ **WAITING FOR BACKEND RESTART**

---

## 🆘 If Issues

### Backend Won't Start

**Error:** Port already in use
```bash
# Kill existing process
pkill -f "nest start"
# Then restart
npm run start:dev
```

### Endpoint Not Showing

**Cause:** Old code cached
```bash
# Clean build
rm -rf dist/
npm run build
npm run start:dev
```

### TypeScript Errors

**Cause:** Missing types
```bash
# Reinstall dependencies
npm install
npm run start:dev
```

---

## ✅ Ready!

Just run:
```bash
npm run start:dev
```

And the new backend-powered onboarding will be ready to test! 🚀
