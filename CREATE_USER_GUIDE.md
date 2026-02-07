# 🚀 Quick Guide: Create User with Email Invitation

This is the fastest way to create the user `emji@yopmail.com` with a beautiful branded invitation email.

---

## ⚡ Option 1: Supabase Dashboard (Easiest - No Code!)

### Step 1: Customize Email Template First

1. **Go to Email Templates:**
   https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/templates

2. **Click "Invite user" template**

3. **Replace with this beautiful template:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a2e1a 0%, #2a3a2a 100%); padding: 40px 30px; text-align: center; }
    .logo { width: 80px; height: 80px; background: #2a3a2a; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #84cc16; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); }
    .title { color: white; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; }
    .subtitle { color: #84cc16; font-size: 11px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
    .body { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; }
    .message { font-size: 16px; margin: 0 0 20px 0; color: #475569; }
    .button { display: inline-block; background: linear-gradient(135deg, #1a2e1a 0%, #2a3a2a 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .info { background: #f1f5f9; border-left: 4px solid #84cc16; padding: 20px; margin: 30px 0; border-radius: 8px; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">G</div>
      <h1 class="title">GoboClean Rapport</h1>
      <p class="subtitle">Field Services & Reports</p>
    </div>
    <div class="body">
      <p class="greeting">👋 Welcome to GoBo Clean!</p>
      <p class="message">You've been invited to join the GoBo Clean team. Click below to set up your password.</p>
      <center><a href="{{ .ConfirmationURL }}" class="button">Set Up Your Password →</a></center>
      <div class="info">
        <p><strong>📋 Your Account:</strong><br>Email: {{ .Email }}</p>
      </div>
      <p class="message">This link expires in 24 hours.</p>
    </div>
    <div class="footer">
      <p>GoBo Clean - Professional Roof Cleaning Services<br>contact@goboclean.be</p>
    </div>
  </div>
</body>
</html>
```

4. **Click "Save"**

### Step 2: Invite the User

1. **Go to Users:**
   https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users

2. **Click "Invite user" button** (top right)

3. **Fill in:**
   - Email: `emji@yopmail.com`
   - Auto Confirm Email: `No` (they'll confirm via email)
   - Send Email: `Yes`

4. **Click "Invite user"**

5. **Done!** 🎉

### Step 3: Check the Email

1. Go to: https://yopmail.com
2. Enter: `emji`
3. Click the inbox
4. You'll see the beautiful branded invitation!

---

## ⚡ Option 2: Using the Script (For Bulk Users)

### Prerequisites

First, add your service role key to `.env`:

1. Get it from: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/settings/api
2. Copy the **service_role** key (NOT the anon key!)
3. Edit `goboclean-rapport-backend/.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### Run the Script

```bash
cd goboclean-rapport-backend
npm run create-user-invite
```

**Enter when prompted:**
- Email: `emji@yopmail.com`
- First Name: `Emji`
- Last Name: `User`
- Phone: (leave empty or add)
- Role: `worker`
- Send invitation email: `y`

**Output:**
```
✅ User created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: emji@yopmail.com
🆔 User ID: xxx-xxx-xxx
👔 Role: worker
📨 Invitation Email: Sent ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 Email Template Preview

Your invitation email will look like this:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   [Dark Green Header]    ┃
┃         [G Logo]         ┃
┃   GoboClean Rapport      ┃
┃ FIELD SERVICES & REPORTS ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                          ┃
┃ 👋 Welcome to GoBo Clean!┃
┃                          ┃
┃ You've been invited...   ┃
┃                          ┃
┃   [Set Up Password →]    ┃
┃                          ┃
┃ ┌──────────────────────┐ ┃
┃ │ 📋 Your Account:     │ ┃
┃ │ emji@yopmail.com     │ ┃
┃ └──────────────────────┘ ┃
┃                          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃   [Light Gray Footer]    ┃
┃   GoBo Clean Services    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ✅ What Happens Next?

1. **User receives email** at `emji@yopmail.com`
2. **User clicks** "Set Up Your Password"
3. **User sets** their password (e.g., `Emji@yopmail.com123`)
4. **User is redirected** to login page
5. **User can login** at: http://localhost:3000/fr/login

---

## 🎯 Quick Test Flow

### Full Test (5 minutes)

1. **Create user** (use Option 1 - Dashboard)
2. **Check email** at https://yopmail.com (enter: `emji`)
3. **Click link** in invitation email
4. **Set password**: `Emji@yopmail.com123`
5. **Login** at: http://localhost:3000/fr/login
6. **Success!** User is in the system

---

## 🎨 Customize Further

Want to add more branding? See `EMAIL_TEMPLATES_SETUP.md` for:
- Custom logo images
- Additional color schemes
- Mobile optimization
- Multiple language support
- Rich HTML/CSS styling

---

## 📧 Testing with Yopmail

Yopmail is perfect for testing because:
- ✅ No signup required
- ✅ Instant access to any email
- ✅ No password needed
- ✅ Perfect for dev/testing
- ✅ Public inbox (don't use for real data!)

**Access any email:**
1. Go to: https://yopmail.com
2. Enter any email prefix (e.g., `emji` for `emji@yopmail.com`)
3. Inbox appears instantly!

---

## 🚨 Important Notes

### Security
- ✅ Invitation links expire in 24 hours
- ✅ Links are one-time use
- ✅ Passwords are securely hashed
- ✅ Email verification required

### Email Delivery
- Emails send from: `noreply@mail.app.supabase.co`
- For custom domain, upgrade Supabase plan
- Check spam folder if not in inbox
- Yopmail shows all emails (no spam filter)

---

## 🎉 Summary

**Fastest Method:** Option 1 (Dashboard)
- Takes 2 minutes
- No code required
- Perfect for single users

**Best for Bulk:** Option 2 (Script)
- Automates process
- Good for multiple users
- Requires service role key

**Recommended for Now:** Use Option 1 (Dashboard) for `emji@yopmail.com`!

---

## 📚 Next Steps

After creating the user:
1. ✅ Check the email template styling
2. ✅ Test the password setup flow
3. ✅ Customize colors/branding if needed
4. ✅ Create more users as needed
5. ✅ Set up custom email domain (optional)

Happy user creating! 🚀
