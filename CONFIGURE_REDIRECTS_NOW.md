# 🎯 CONFIGURE REDIRECT URLs - 2 Minutes

## ⚠️ CRITICAL: Do This First!

The password setup pages are ready, but you **MUST configure redirect URLs** in Supabase for them to work.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard

Click this link:
👉 https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/url-configuration

### Step 2: Configure Site URL

**Site URL:** (Should already be set, but verify)
```
http://localhost:3000
```

### Step 3: Add Redirect URLs

In the **"Redirect URLs"** section, add each of these URLs one by one:

```
http://localhost:3000/fr/auth/callback
http://localhost:3000/en/auth/callback
http://localhost:3000/nl/auth/callback
http://localhost:3000/fr/set-password
http://localhost:3000/en/set-password
http://localhost:3000/nl/set-password
```

**How to add:**
1. Paste the URL in the input field
2. Click the **"+"** or **"Add"** button
3. Repeat for each URL

### Step 4: Save

Click **"Save"** button at the bottom

### Step 5: Wait 1 minute

Changes may take 30-60 seconds to propagate

---

## ✅ Verification

After saving, you should see all 6 redirect URLs listed:

✅ `http://localhost:3000/fr/auth/callback`  
✅ `http://localhost:3000/en/auth/callback`  
✅ `http://localhost:3000/nl/auth/callback`  
✅ `http://localhost:3000/fr/set-password`  
✅ `http://localhost:3000/en/set-password`  
✅ `http://localhost:3000/nl/set-password`  

---

## 🧪 Test the Flow

### Option A: Resend to Existing User

1. Go to: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users
2. Find: `emji@yopmail.com`
3. Click **"..."** menu → **"Send password recovery"**
4. Check Yopmail: https://yopmail.com (enter: `emji`)
5. Click the link in email
6. You should see the password setup page! ✅

### Option B: Delete and Re-invite

1. Go to: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users
2. Find: `emji@yopmail.com`
3. Delete the user
4. Click **"Invite user"**
5. Email: `emji@yopmail.com`
6. Add metadata:
```json
{
  "first_name": "Emji",
  "last_name": "User",
  "role": "worker"
}
```
7. Click **"Invite user"**
8. Check Yopmail
9. Click the link
10. Password setup page appears! ✅

---

## 🎨 What You'll See

After clicking the invitation link, you'll see:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   [Dark Green Header]    ┃
┃      [G Logo Circle]     ┃
┃   GoboClean Rapport      ┃
┃   Set Up Your Password   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ✓ Welcome to GoBo Clean!┃
┃                          ┃
┃ Create a strong password ┃
┃ for your account         ┃
┃                          ┃
┃ [New Password    👁]     ┃
┃ • 8+ characters          ┃
┃ • One uppercase          ┃
┃ • One lowercase          ┃
┃ • One number             ┃
┃                          ┃
┃ [Confirm Password 👁]    ┃
┃                          ┃
┃ [Set Password & Continue]┃
┃                          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃    Back to Login         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ⚠️ Troubleshooting

### Still getting 400 error?

**Checklist:**
- [ ] All 6 redirect URLs added?
- [ ] Saved the configuration?
- [ ] Waited 60 seconds after saving?
- [ ] Using the correct domain (localhost:3000)?
- [ ] Frontend dev server running?

**If still failing:**
1. Clear browser cache
2. Try incognito mode
3. Check browser console for errors
4. Verify dev server is running on port 3000

### "Invalid or expired link"?

- Link expires after 24 hours
- Resend invitation from Supabase Dashboard
- Make sure user exists in auth.users table

### Can't find redirect URL configuration?

**Direct link:** https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/settings/auth

Navigate: Dashboard → Project Settings → Authentication → URL Configuration

---

## 📸 Visual Guide

### Where to Find It

```
Supabase Dashboard
    ↓
Your Project (ihlnwzrsvfxgossytuiz)
    ↓
Project Settings (⚙️ icon)
    ↓
Authentication
    ↓
URL Configuration
    ↓
Add Redirect URLs here!
```

### What It Looks Like

```
┌─────────────────────────────────────┐
│ Site URL                            │
│ [http://localhost:3000        ]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Redirect URLs                       │
│ [Add URL...                  ] [+]  │
│                                     │
│ ✓ http://localhost:3000/fr/auth/... │
│ ✓ http://localhost:3000/en/auth/... │
│ ✓ http://localhost:3000/nl/auth/... │
│ ✓ http://localhost:3000/fr/set-...  │
│ ✓ http://localhost:3000/en/set-...  │
│ ✓ http://localhost:3000/nl/set-...  │
└─────────────────────────────────────┘

                [Save]
```

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Click invitation link
2. ✅ Browser navigates to `localhost:3000/.../set-password`
3. ✅ See the password setup form
4. ✅ Can enter and confirm password
5. ✅ Success toast appears
6. ✅ Redirects to login
7. ✅ Can login with new password

---

## 🎉 That's It!

**Time required:** 2 minutes  
**Difficulty:** Easy  
**Impact:** Makes everything work! 🚀

After configuring these URLs:
- ✅ Invitation links will work
- ✅ Password setup will work  
- ✅ Password reset will work (future)
- ✅ All auth flows will work

**Go configure them now!** 👉 https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/url-configuration

---

## 📞 Quick Reference

**Dashboard Link:**  
https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/url-configuration

**Users Management:**  
https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users

**Test Email:**  
https://yopmail.com (enter: `emji`)

**Your App:**  
http://localhost:3000/fr/login

---

Ready? Configure those URLs and test! 🚀✨
