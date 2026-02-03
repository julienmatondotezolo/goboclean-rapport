# 🚀 Quick Start - Environment Variables

## ✅ Files Created

Two environment configuration files have been created with placeholder values:

1. **Frontend**: `/Users/julienmatondo/goboclean-rapport/.env.local`
2. **Backend**: `/Users/julienmatondo/goboclean-rapport-backend/.env`

## 🎯 Quick Setup Options

### Option 1: Interactive Script (Easiest)

```bash
cd /Users/julienmatondo/goboclean-rapport
./setup-env.sh
```

The script will guide you through entering all required keys.

### Option 2: Manual Edit

Edit the files directly using your favorite editor:

**Frontend:**
```bash
nano /Users/julienmatondo/goboclean-rapport/.env.local
# or
code /Users/julienmatondo/goboclean-rapport/.env.local
```

**Backend:**
```bash
nano /Users/julienmatondo/goboclean-rapport-backend/.env
# or
code /Users/julienmatondo/goboclean-rapport-backend/.env
```

## 🔑 What You Need

### 1. Supabase Keys (Required)
- 🌐 Project URL: `https://xxxxx.supabase.co`
- 🔓 Anon Key: `eyJhbGciOiJIUzI1NiIs...`
- 🔒 Service Role Key: `eyJhbGciOiJIUzI1NiIs...`

**Where to find:** [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

### 2. Email Service (Required for PDF emails)
Choose one:
- ✉️ **Resend** (recommended): [resend.com](https://resend.com)
- ✉️ **SendGrid**: [sendgrid.com](https://sendgrid.com)
- ✉️ **Gmail**: Only for testing

## 📝 Current Configuration

Your files currently contain placeholders like:
- `https://your-project-id.supabase.co` ❌
- `your-anon-key-here` ❌
- `re_your_api_key_here` ❌

You need to replace these with your actual values! ✅

## 🔄 After Configuration

1. **Verify** your changes:
   ```bash
   # Check frontend
   cat /Users/julienmatondo/goboclean-rapport/.env.local
   
   # Check backend
   cat /Users/julienmatondo/goboclean-rapport-backend/.env
   ```

2. **Restart** development servers:
   ```bash
   # Terminal 1 - Frontend
   cd /Users/julienmatondo/goboclean-rapport
   yarn dev
   
   # Terminal 2 - Backend
   cd /Users/julienmatondo/goboclean-rapport-backend
   npm run start:dev
   ```

3. **Test** the application:
   - Open http://localhost:3000
   - Try logging in
   - Create a test report

## 📚 Need More Help?

- 📖 Detailed guide: Read `ENV_SETUP.md`
- 🐛 Troubleshooting: See the troubleshooting section in `ENV_SETUP.md`
- 💬 Support: contact@goboclean.be

## ⚠️ Security Reminder

```
❌ NEVER commit .env files to git
❌ NEVER share your service role key
✅ .env files are already in .gitignore
✅ Use environment variables in production
```

---

Ready? Let's get started! 🚀
