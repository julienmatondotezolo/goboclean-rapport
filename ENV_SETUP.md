# Environment Variables Setup Guide

This guide will help you configure the necessary environment variables for both the frontend and backend of GobloClean Rapport.

## 🔑 Getting Your Keys

### 1. Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. You'll need:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: Also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (longer, keep secret!)

### 2. SMTP/Email Service Keys

Choose one of these options:

#### Option A: Resend (Recommended)
1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** and create a new key
4. Use these settings:
   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASSWORD=re_xxxxxxxxxxxxxxxxxxxxx
   ```

#### Option B: SendGrid
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Go to **Settings** → **API Keys** and create a new key
4. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
   ```

#### Option C: Gmail (Testing Only)
1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   ```

## 📝 Configuration Files

### Frontend (.env.local)

The file has been created at: `/Users/julienmatondo/goboclean-rapport/.env.local`

**Edit this file and replace:**
- `https://your-project-id.supabase.co` → Your actual Supabase URL
- `your-anon-key-here` → Your Supabase anon/public key

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)

The file has been created at: `/Users/julienmatondo/goboclean-rapport-backend/.env`

**Edit this file and replace:**
- `https://your-project-id.supabase.co` → Your actual Supabase URL
- `your-service-role-key-here` → Your Supabase service role key (⚠️ Keep this secret!)
- `your-anon-key-here` → Your Supabase anon/public key
- `re_your_api_key_here` → Your Resend/SendGrid/Gmail API key or password
- `noreply@goboclean.be` → Your actual email address

Example:
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NzYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_AbCdEfGh123456789
SMTP_FROM=noreply@yourdomain.com

PORT=3001
NODE_ENV=development
```

## ✅ Verify Configuration

### 1. Check Frontend
```bash
cd /Users/julienmatondo/goboclean-rapport
cat .env.local
# Make sure all values are filled in (no "your-xxx-here" placeholders)
```

### 2. Check Backend
```bash
cd /Users/julienmatondo/goboclean-rapport-backend
cat .env
# Make sure all values are filled in (no "your-xxx-here" placeholders)
```

### 3. Restart Servers

After updating the environment variables, restart both servers:

**Terminal 1 - Frontend:**
```bash
cd /Users/julienmatondo/goboclean-rapport
# Stop the current server (Ctrl+C if running)
yarn dev
```

**Terminal 2 - Backend:**
```bash
cd /Users/julienmatondo/goboclean-rapport-backend
# Stop the current server (Ctrl+C if running)
npm run start:dev
```

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- **NEVER** commit `.env` or `.env.local` files to git
- **NEVER** share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- The `.env` files are already in `.gitignore` for safety
- For production, use environment variables from your hosting platform (Vercel, Railway, etc.)

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is required"
- Make sure `.env.local` exists in the frontend folder
- Check that variable names are exactly as shown (including `NEXT_PUBLIC_` prefix)
- Restart the dev server after creating/updating the file

### Error: "Authentication failed" or "Invalid JWT"
- Double-check your Supabase keys are copied correctly
- Make sure you're using the **anon key** for frontend, **service role key** for backend
- Verify your Supabase project is active

### Error: "SMTP connection failed"
- Verify your SMTP credentials are correct
- For Gmail: make sure you're using an App Password, not your regular password
- For Resend/SendGrid: verify your API key is active

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)

---

Need help? Check the main README.md or contact: contact@goboclean.be
