# Quick Start Guide - GoBo Clean Authentication

This guide will help you get the authentication system up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase project created (already done: "GCR APP")
- Git repositories cloned

## Step 1: Backend Setup (2 minutes)

### 1.1 Create .env file

```bash
cd goboclean-rapport-backend
cp .env.example .env
```

### 1.2 Update .env with your Supabase credentials

Open `.env` and add your `SUPABASE_SERVICE_ROLE_KEY`:

```env
SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Get from Supabase Dashboard
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
```

**Where to find the service role key:**
1. Go to https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/settings/api
2. Copy the `service_role` key (under "Project API keys")

### 1.3 Install dependencies and start

```bash
npm install
npm run start:dev
```

The backend should now be running at http://localhost:3001

## Step 2: Frontend Setup (1 minute)

The frontend `.env.local` file has already been created with the correct values:

```bash
cd goboclean-rapport
npm install
npm run dev
```

The frontend should now be running at http://localhost:3000

## Step 3: Create Your First Admin User (2 minutes)

### Option A: Using the provided script (Recommended)

```bash
cd goboclean-rapport-backend
npm run create-admin
```

Follow the prompts:
- Email: admin@goboclean.be
- Password: (choose a strong password)
- First Name: Admin
- Last Name: GoBo
- Phone: +32471123456

### Option B: Using the API

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@goboclean.be",
    "password": "YourSecurePassword123!",
    "first_name": "Admin",
    "last_name": "GoBo",
    "phone": "+32471123456",
    "role": "admin"
  }'
```

### Option C: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/ihlnwzrsvfxgossytuiz/auth/users
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Then run in SQL Editor:

```sql
UPDATE users SET role = 'admin' 
WHERE email = 'admin@goboclean.be';
```

## Step 4: Test the Login (30 seconds)

1. Open http://localhost:3000/login
2. Enter your admin credentials
3. You should be redirected to the dashboard

## Step 5: Test the Backend API (30 seconds)

### Get your access token

After logging in, open the browser console and run:

```javascript
// Get session info
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data } = await supabase.auth.getSession();
console.log('Access Token:', data.session.access_token);
```

### Test authenticated endpoint

```bash
# Replace YOUR_TOKEN with the token from above
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should see your user profile!

## Verification Checklist

✅ Backend running on port 3001  
✅ Frontend running on port 3000  
✅ Database migrations applied  
✅ Admin user created  
✅ Can login through frontend  
✅ Can access protected backend endpoints  

## Common Issues

### "Missing Supabase configuration"

Make sure you've created the `.env` file in the backend with your `SUPABASE_SERVICE_ROLE_KEY`.

### "User profile not found"

The database trigger should have created the profile automatically. If not, check:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if user exists in auth.users
SELECT * FROM auth.users WHERE email = 'your@email.com';

-- Check if profile exists in public.users
SELECT * FROM users WHERE email = 'your@email.com';
```

### Backend won't start

Make sure all dependencies are installed:

```bash
cd goboclean-rapport-backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend can't connect to backend

Add to frontend `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Next Steps

Now that authentication is working:

1. **Create worker accounts** for your team
2. **Test the protected routes** (reports, admin)
3. **Review the auth documentation** in `AUTH_SETUP.md`
4. **Configure email templates** in Supabase (optional)
5. **Set up production environment** variables

## Need Help?

- 📖 Full documentation: `AUTH_SETUP.md`
- 🔧 Check backend logs for errors
- 🐛 Check browser console for frontend errors
- 📧 Verify Supabase project status in dashboard

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend       │         │   Supabase      │
│   (Next.js)     │         │   (NestJS)      │         │   Database      │
│                 │         │                 │         │                 │
│  - Login Page   │────────▶│  - Auth Guard   │────────▶│  - auth.users   │
│  - Auth Service │  JWT    │  - Controllers  │  Verify │  - public.users │
│  - API Client   │  Token  │  - Services     │  Token  │  - RLS Policies │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Success! 🎉

You now have a fully functional authentication system that:

- ✅ Authenticates users with email/password
- ✅ Supports worker and admin roles
- ✅ Protects frontend and backend routes
- ✅ Uses JWT tokens for secure communication
- ✅ Implements Row Level Security (RLS)
- ✅ Automatically creates user profiles

Happy coding! 🚀
