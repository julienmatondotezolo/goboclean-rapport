# 📧 Email Templates Setup Guide - GoBo Clean

This guide will help you create beautiful, branded email templates for your Supabase authentication emails.

---

## 🎯 Overview

Supabase allows you to customize email templates for:
- **Confirmation emails** (signup verification)
- **Invitation emails** (new user invites)
- **Password reset emails**
- **Magic link emails**
- **Email change confirmation**

---

## 🚀 Quick Setup

### Step 1: Access Email Templates

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/templates)
2. Navigate to: **Authentication → Email Templates**
3. You'll see all available templates

### Step 2: Customize Your Templates

Each template supports:
- ✅ HTML/CSS styling
- ✅ Custom variables
- ✅ Your logo and branding
- ✅ Custom colors and fonts

---

## 🎨 Creating Beautiful Email Templates

### Template 1: Invitation Email (Recommended)

This is perfect for inviting new users like `emji@yopmail.com`.

#### Navigate to Template
Dashboard → Authentication → Email Templates → **Invite user**

#### Custom HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GoBo Clean</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #1a2e1a 0%, #2a3a2a 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo-container {
      width: 80px;
      height: 80px;
      background-color: #2a3a2a;
      border-radius: 20px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .logo-text {
      color: #84cc16;
      font-size: 48px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
    .email-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }
    .email-subtitle {
      color: #84cc16;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 4px;
      text-transform: uppercase;
      opacity: 0.9;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
      color: #334155;
      line-height: 1.8;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }
    .message {
      font-size: 16px;
      margin: 0 0 30px 0;
      color: #475569;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1a2e1a 0%, #2a3a2a 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(26, 46, 26, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(26, 46, 26, 0.4);
    }
    .info-box {
      background-color: #f1f5f9;
      border-left: 4px solid #84cc16;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #475569;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 10px 0;
    }
    .footer-link {
      color: #1a2e1a;
      text-decoration: none;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 20px;
        border-radius: 16px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .email-title {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="logo-container">
        <div class="logo-text">G</div>
      </div>
      <h1 class="email-title">GoboClean Rapport</h1>
      <p class="email-subtitle">Field Services & Reports</p>
    </div>

    <!-- Body -->
    <div class="email-body">
      <p class="greeting">👋 Welcome to GoBo Clean!</p>
      
      <p class="message">
        You've been invited to join the GoBo Clean team. We're excited to have you on board!
      </p>

      <p class="message">
        Click the button below to set up your password and get started with your account.
      </p>

      <center>
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          Set Up Your Password →
        </a>
      </center>

      <div class="info-box">
        <p><strong>📋 Your Account Details:</strong></p>
        <p>Email: {{ .Email }}</p>
        <p>Role: Worker</p>
      </div>

      <p class="message">
        This invitation link will expire in 24 hours for security reasons.
      </p>

      <p class="message">
        If you have any questions, feel free to contact our support team.
      </p>

      <p class="message">
        Best regards,<br>
        <strong>The GoBo Clean Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p class="footer-text">
        GoBo Clean - Professional Roof Cleaning Services
      </p>
      <p class="footer-text">
        <a href="https://goboclean.be" class="footer-link">goboclean.be</a>
      </p>
      <p class="footer-text" style="margin-top: 20px; font-size: 11px; color: #94a3b8;">
        This email was sent to {{ .Email }}. If you didn't request this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
```

### Template 2: Confirmation Email (Signup)

For when users sign up themselves.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - GoBo Clean</title>
  <!-- Same style section as above -->
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo-container">
        <div class="logo-text">G</div>
      </div>
      <h1 class="email-title">GoboClean Rapport</h1>
      <p class="email-subtitle">Field Services & Reports</p>
    </div>

    <div class="email-body">
      <p class="greeting">✅ Confirm Your Email</p>
      
      <p class="message">
        Welcome to GoBo Clean! Please confirm your email address to complete your registration.
      </p>

      <center>
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          Confirm Email Address →
        </a>
      </center>

      <div class="info-box">
        <p><strong>🔐 Security Note:</strong></p>
        <p>This link will expire in 24 hours</p>
      </div>
    </div>

    <div class="email-footer">
      <p class="footer-text">GoBo Clean - Professional Roof Cleaning Services</p>
      <p class="footer-text">
        <a href="https://goboclean.be" class="footer-link">goboclean.be</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### Template 3: Password Reset Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - GoBo Clean</title>
  <!-- Same style section -->
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo-container">
        <div class="logo-text">G</div>
      </div>
      <h1 class="email-title">GoboClean Rapport</h1>
      <p class="email-subtitle">Field Services & Reports</p>
    </div>

    <div class="email-body">
      <p class="greeting">🔑 Reset Your Password</p>
      
      <p class="message">
        We received a request to reset your password. Click the button below to create a new password.
      </p>

      <center>
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          Reset Password →
        </a>
      </center>

      <div class="info-box">
        <p><strong>⚠️ Didn't request this?</strong></p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      </div>

      <p class="message">
        This link will expire in 1 hour for security reasons.
      </p>
    </div>

    <div class="email-footer">
      <p class="footer-text">GoBo Clean - Professional Roof Cleaning Services</p>
    </div>
  </div>
</body>
</html>
```

---

## 🎨 Adding Your Custom Logo

### Option 1: Host Your Logo (Recommended)

1. **Upload logo to Supabase Storage:**
   ```bash
   # Upload to company-assets bucket
   ```

2. **Get public URL and use in template:**
   ```html
   <img src="https://ihlnwzrsvfxgossytuiz.supabase.co/storage/v1/object/public/company-assets/logo.png" 
        alt="GoBo Clean Logo" 
        style="width: 80px; height: 80px;">
   ```

### Option 2: Use Icon Font (Current Implementation)

The current logo uses a styled "G" letter which works great in emails:

```html
<div class="logo-container">
  <div class="logo-text">G</div>
</div>
```

### Option 3: Inline Base64 Image

Convert your logo to base64 and embed directly:

```html
<img src="data:image/png;base64,iVBORw0KG..." alt="Logo">
```

---

## 📋 Available Template Variables

Supabase provides these variables you can use:

- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Confirmation/action link
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

---

## 🎯 Create User with Invitation

### Method 1: Using the Script (Recommended)

```bash
cd goboclean-rapport-backend

# First, add your service role key to .env
# Get it from: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/settings/api

# Then run the script
npm run create-user-invite
```

Follow the prompts:
- Email: `emji@yopmail.com`
- First Name: `Emji`
- Last Name: `User`
- Role: `worker`
- Send invitation: `y`

### Method 2: Using Supabase Dashboard

1. Go to [Authentication → Users](https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users)
2. Click **"Invite user"**
3. Enter email: `emji@yopmail.com`
4. Click **"Send invitation"**
5. User will receive branded email to set password

### Method 3: Using SQL

```sql
-- Note: This requires service role key
SELECT auth.send_invite('emji@yopmail.com');
```

---

## 🔧 Testing Email Templates

### Test with Yopmail

Yopmail is perfect for testing:

1. Create user with email: `emji@yopmail.com`
2. Visit: https://yopmail.com
3. Enter: `emji`
4. Check inbox for invitation email
5. Verify styling and functionality

---

## 🎨 Customization Tips

### Colors

Current brand colors:
```css
--brand-green-dark: #1a2e1a
--brand-green: #2a3a2a
--brand-lime: #84cc16
--brand-white: #ffffff
```

### Fonts

Recommended email-safe fonts:
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Monospace: `'Courier New', monospace` (for logo)

### Mobile Optimization

All templates include responsive design:
```css
@media only screen and (max-width: 600px) {
  /* Mobile styles */
}
```

---

## 📊 Email Template Structure

```
┌─────────────────────────────┐
│  Header (Dark Green)        │
│  - Logo                     │
│  - Title                    │
│  - Subtitle                 │
├─────────────────────────────┤
│  Body (White)               │
│  - Greeting                 │
│  - Message                  │
│  - CTA Button               │
│  - Info Box                 │
├─────────────────────────────┤
│  Footer (Light Gray)        │
│  - Company Info             │
│  - Links                    │
│  - Disclaimer               │
└─────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Step 1: Add Service Role Key

```bash
# Edit backend/.env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

Get from: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/settings/api

### Step 2: Customize Email Templates

1. Visit: https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/templates
2. Select "Invite user" template
3. Paste the HTML template above
4. Click "Save"

### Step 3: Create User with Invitation

```bash
cd goboclean-rapport-backend
npm run create-user-invite
```

Enter:
- Email: `emji@yopmail.com`
- First Name: `Emji`
- Last Name: `User`
- Role: `worker`
- Send invite: `y`

### Step 4: Test

1. Visit https://yopmail.com
2. Enter: `emji`
3. Check for invitation email
4. Click "Set Up Your Password"
5. Complete password setup

---

## ✅ Checklist

- [ ] Add service role key to `.env`
- [ ] Update email templates in Supabase Dashboard
- [ ] Test with yopmail.com
- [ ] Create user `emji@yopmail.com`
- [ ] Verify email delivery and styling
- [ ] Test password setup flow
- [ ] Customize colors/branding as needed

---

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Dashboard - Email Templates](https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/templates)
- [Dashboard - Users](https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users)

---

## 🎉 Result

You'll have beautiful, branded email invitations that:
- ✅ Match your app's design
- ✅ Include your logo and colors
- ✅ Are mobile-responsive
- ✅ Look professional
- ✅ Provide clear calls-to-action

Users like `emji@yopmail.com` will receive polished invitation emails to set up their passwords!
