-- Add user preferences columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr' CHECK (language IN ('en', 'fr', 'nl')),
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stay_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Create index for language lookups
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Add comment for documentation
COMMENT ON COLUMN users.language IS 'User preferred language: en (English), fr (French), nl (Dutch)';
COMMENT ON COLUMN users.push_notifications_enabled IS 'Whether user wants to receive push notifications';
COMMENT ON COLUMN users.stay_connected IS 'Whether user wants to stay logged in across sessions';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture in storage';
COMMENT ON COLUMN users.is_onboarded IS 'Whether user has completed onboarding process';
