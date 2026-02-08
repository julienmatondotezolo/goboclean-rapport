# 🚀 Apply Database Migration Now

## You Need to Apply the Migration!

The code is ready, but you need to add the new columns to your database.

---

## Option 1: Supabase Dashboard (Easiest)

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL**

```sql
-- Add user preferences columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr' CHECK (language IN ('en', 'fr', 'nl')),
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stay_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Create index for language lookups
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Add comments for documentation
COMMENT ON COLUMN users.language IS 'User preferred language: en (English), fr (French), nl (Dutch)';
COMMENT ON COLUMN users.push_notifications_enabled IS 'Whether user wants to receive push notifications';
COMMENT ON COLUMN users.stay_connected IS 'Whether user wants to stay logged in across sessions';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture in storage';
COMMENT ON COLUMN users.is_onboarded IS 'Whether user has completed onboarding process';
```

4. **Click "Run"**
   - Should see: "Success. No rows returned"

5. **Verify**
   - Go to "Database" → "Tables" → "users"
   - Check that new columns exist:
     - `language`
     - `push_notifications_enabled`
     - `stay_connected`
     - `profile_picture_url`
     - `is_onboarded`

---

## Option 2: Supabase CLI

### Steps:

```bash
# 1. Make sure you're in the frontend project
cd /Users/julienmatondo/goboclean-rapport

# 2. Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

---

## Option 3: Manual SQL (If CLI doesn't work)

### Steps:

1. Connect to your Supabase database using psql or any SQL client

2. Run the migration file:

```bash
psql $DATABASE_URL < supabase/migrations/004_user_preferences.sql
```

---

## After Migration

### 1. Restart Backend

```bash
cd /Users/julienmatondo/goboclean-rapport-backend
# Stop current server (Ctrl+C)
npm run start:dev
```

### 2. Test the API

```bash
# Get profile (should include new fields)
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preferences
curl -X PUT http://localhost:3001/auth/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"fr","push_notifications_enabled":true}'
```

### 3. Test in Frontend

1. Go to `/profile` page
2. Toggle push notifications
3. Should see success message
4. Check Supabase Dashboard → Database → users table
5. Your user should have `push_notifications_enabled` updated

---

## Verify Migration Success

### Check in Supabase Dashboard:

1. **Database** → **Tables** → **users**
2. Look for these columns:
   - ✅ `language` (text, default: 'fr')
   - ✅ `push_notifications_enabled` (boolean, default: true)
   - ✅ `stay_connected` (boolean, default: false)
   - ✅ `profile_picture_url` (text, nullable)
   - ✅ `is_onboarded` (boolean, default: false)

### Check Your User Data:

1. **Database** → **Table Editor** → **users**
2. Find your user row
3. Should see new columns with default values

---

## Troubleshooting

### Error: "column already exists"

**Solution**: Some columns might already exist from previous migrations. This is OK! The `IF NOT EXISTS` clause prevents errors.

### Error: "permission denied"

**Solution**: Make sure you're using the service role key or have proper permissions in Supabase.

### Error: "relation does not exist"

**Solution**: Make sure the `users` table exists. Check if you need to run earlier migrations first.

### Backend still returns old data

**Solution**:

1. Restart backend server
2. Clear any caching
3. Check backend logs for errors

---

## What Happens After Migration?

### ✅ Backend

- New API endpoint `/auth/preferences` works
- Can update user preferences
- Returns preferences in profile response

### ✅ Frontend

- Push notifications toggle works
- PreferencesService can read/write preferences
- LocalStorage caching works

### ✅ Database

- All users get default values:
  - `language`: 'fr'
  - `push_notifications_enabled`: true
  - `stay_connected`: false
  - `profile_picture_url`: NULL
  - `is_onboarded`: false

---

## Quick Test

After applying migration, run this in your browser console on the profile page:

```javascript
// Test getting preferences
const response = await fetch("http://localhost:3001/auth/profile", {
  headers: {
    Authorization: "Bearer " + (await supabase.auth.getSession()).data.session.access_token,
  },
});
const data = await response.json();
console.log("User preferences:", {
  language: data.language,
  push_notifications: data.push_notifications_enabled,
  stay_connected: data.stay_connected,
});
```

---

**Next Step**: Apply the migration using Option 1 (Supabase Dashboard) - it's the easiest! 🚀
