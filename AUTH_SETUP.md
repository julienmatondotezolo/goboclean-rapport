# Authentication Setup Guide

This guide explains how the authentication system works and how to use it in the GoBo Clean application.

## Overview

The application uses **Supabase Authentication** to handle user login, signup, and session management. The system supports two user roles:

- **Worker**: Can create and manage their own reports
- **Admin**: Can view all reports and access admin dashboard

## Architecture

### Frontend (Next.js)

- **Auth Service** (`src/lib/auth.ts`): Handles login, signup, logout, and user management
- **Supabase Client** (`src/lib/supabase/client.ts`): Client-side Supabase instance
- **Supabase Server** (`src/lib/supabase/server.ts`): Server-side Supabase instance for SSR
- **Login Page** (`src/app/[locale]/(pages)/login/page.tsx`): User login interface

### Backend (NestJS)

- **Auth Module** (`src/auth/`): Complete authentication system
  - `auth.guard.ts`: JWT token validation middleware
  - `admin.guard.ts`: Admin-only access control
  - `auth.controller.ts`: Auth endpoints (signup, me, refresh)
  - `auth.service.ts`: Auth business logic
  - `current-user.decorator.ts`: Extract current user from request

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Automatic Profile Creation

When a user signs up through Supabase Auth, a trigger automatically creates their profile in the `users` table:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS)

The system uses RLS policies to ensure users can only access their own data:

- Users can view their own profile
- Admins can view all profiles
- Workers can only view their own reports
- Admins can view all reports

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)

```env
SUPABASE_URL=https://ihlnwzrsvfxgossytuiz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
```

**Important**: Get your `SUPABASE_SERVICE_ROLE_KEY` from the Supabase Dashboard:
1. Go to Project Settings > API
2. Copy the `service_role` key (keep this secret!)

## Creating Users

### Method 1: Using the Frontend

Users can sign up through the application interface (future feature).

### Method 2: Using the Backend API

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@goboclean.be",
    "password": "SecurePassword123!",
    "first_name": "Admin",
    "last_name": "User",
    "phone": "+32471123456",
    "role": "admin"
  }'
```

### Method 3: Using Supabase Dashboard

1. Go to Authentication > Users
2. Click "Add user"
3. Fill in email and password
4. The profile will be created automatically via trigger

Then update the role in SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@goboclean.be';
```

### Method 4: Using the provided script

```bash
cd goboclean-rapport-backend
npm run create-admin
```

Follow the prompts to create an admin user.

## Usage Examples

### Frontend - Login

```typescript
import { authService } from '@/lib/auth';

try {
  const { user, profile } = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', profile);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Frontend - Get Current User

```typescript
import { authService } from '@/lib/auth';

const user = await authService.getCurrentUser();
if (user) {
  console.log('Current user:', user);
}
```

### Frontend - Logout

```typescript
import { authService } from '@/lib/auth';

await authService.logout();
```

### Backend - Protected Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(AuthGuard)
  async getProtectedData(@CurrentUser() user: any) {
    return { message: 'Protected data', user };
  }
}
```

### Backend - Admin Only Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  @Get('stats')
  async getStats() {
    return { message: 'Admin only data' };
  }
}
```

## API Endpoints

### POST /auth/signup

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+32471123456",
  "role": "worker"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### GET /auth/me

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "role": "worker",
  "first_name": "John",
  "last_name": "Doe"
}
```

### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refresh_token": "..."
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

## Testing Authentication

### 1. Start the Backend

```bash
cd goboclean-rapport-backend
npm install
npm run start:dev
```

### 2. Create an Admin User

```bash
npm run create-admin
```

### 3. Test Login from Frontend

```bash
cd goboclean-rapport
npm install
npm run dev
```

Visit http://localhost:3000/login and use your admin credentials.

## Troubleshooting

### "Missing Supabase configuration"

- Make sure `.env.local` (frontend) and `.env` (backend) files exist
- Verify all required environment variables are set

### "Invalid authentication token"

- Token may have expired (default: 1 hour)
- Use the refresh token to get a new access token
- Check that the token is being sent correctly in the Authorization header

### "User profile not found"

- The trigger may not have created the profile
- Manually create the profile in the `users` table
- Check that the user exists in `auth.users`

### "Admin access required"

- User's role is not 'admin'
- Update the user's role: `UPDATE users SET role = 'admin' WHERE id = '...'`

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Use strong passwords** for all users
3. **Keep service_role key secret** - it bypasses RLS!
4. **Use HTTPS** in production
5. **Implement rate limiting** on auth endpoints
6. **Enable email confirmation** in Supabase settings
7. **Set up password recovery** flows

## Next Steps

- [ ] Implement email confirmation flow
- [ ] Add password reset functionality to UI
- [ ] Set up MFA (Multi-Factor Authentication)
- [ ] Implement refresh token rotation
- [ ] Add audit logging for authentication events
