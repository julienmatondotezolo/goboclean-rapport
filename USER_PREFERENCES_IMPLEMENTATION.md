# User Preferences Implementation Guide

## Overview

User preferences (Push Notifications, Language, Stay Connected) are stored using a **hybrid storage strategy**:

- **Database (Supabase)**: Source of truth, syncs across devices
- **LocalStorage**: Cache for quick access and offline capability

## ✅ Recommendation: Use Database Storage

### Why Database?

1. **Cross-Device Sync** ✅
   - User changes language on phone → automatically synced to desktop
   - Settings persist across all devices

2. **Backend Integration** ✅
   - Backend needs to know notification preferences to send push notifications
   - Language preference for email templates

3. **User Management** ✅
   - Admins can view user preferences
   - Analytics on language distribution

4. **Data Persistence** ✅
   - Survives browser cache clears
   - Survives device changes

### Why LocalStorage Cache?

1. **Performance** ⚡
   - Instant access without API calls
   - Reduces database load

2. **Offline Support** 📱
   - App works offline with cached preferences
   - Syncs when connection restored

3. **Better UX** 🎯
   - No loading delay for preferences
   - Immediate UI updates

## Database Schema

### Migration: `004_user_preferences.sql`

```sql
ALTER TABLE users
ADD COLUMN language TEXT DEFAULT 'fr' CHECK (language IN ('en', 'fr', 'nl')),
ADD COLUMN push_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN stay_connected BOOLEAN DEFAULT false,
ADD COLUMN profile_picture_url TEXT,
ADD COLUMN is_onboarded BOOLEAN DEFAULT false;
```

### Users Table Structure

| Column                       | Type    | Default | Description                            |
| ---------------------------- | ------- | ------- | -------------------------------------- |
| `language`                   | TEXT    | 'fr'    | User's preferred language (en, fr, nl) |
| `push_notifications_enabled` | BOOLEAN | true    | Whether to send push notifications     |
| `stay_connected`             | BOOLEAN | false   | Remember user login across sessions    |
| `profile_picture_url`        | TEXT    | NULL    | URL to profile picture                 |
| `is_onboarded`               | BOOLEAN | false   | Completed onboarding process           |

## Backend API

### Endpoint: PUT `/auth/preferences`

**Description**: Update user preferences

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "language": "fr",
  "push_notifications_enabled": true,
  "stay_connected": false
}
```

**Response**:

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "language": "fr",
    "push_notifications_enabled": true,
    "stay_connected": false
  }
}
```

**Validation**:

- `language`: Must be 'en', 'fr', or 'nl'
- `push_notifications_enabled`: Boolean
- `stay_connected`: Boolean
- All fields are optional (partial updates supported)

## Frontend Implementation

### PreferencesService (`src/lib/preferences.ts`)

Hybrid storage service with automatic caching:

```typescript
import { PreferencesService } from "@/lib/preferences";

// Get preferences (from cache or database)
const preferences = await PreferencesService.getPreferences();

// Update language
await PreferencesService.updateLanguage("fr");

// Update push notifications
await PreferencesService.updatePushNotifications(true);

// Update stay connected
await PreferencesService.updateStayConnected(false);

// Update multiple preferences
await PreferencesService.updatePreferences({
  language: "nl",
  push_notifications_enabled: false,
});

// Force sync from database (clears cache)
await PreferencesService.forceSync();

// Clear cache
PreferencesService.clearCache();
```

### Caching Strategy

- **Cache Duration**: 5 minutes
- **Auto-Sync**: Fetches from database if cache is stale
- **Fallback**: Returns cached data if database fetch fails
- **Update**: Updates both database and cache simultaneously

### Storage Keys

- `user_preferences`: Cached preferences object
- `preferences_last_sync`: Timestamp of last sync

## Usage Examples

### 1. Profile Page - Push Notifications Toggle

```typescript
const handlePushNotificationsToggle = async () => {
  const newValue = !pushNotifications;

  const result = await PreferencesService.updatePushNotifications(newValue);

  if (result) {
    setPushNotifications(newValue);
    showSuccess("Notification preference updated");
  } else {
    showError("Failed to update preference");
  }
};
```

### 2. Language Selector Modal

```typescript
const handleLanguageChange = async (language: "en" | "fr" | "nl") => {
  const result = await PreferencesService.updateLanguage(language);

  if (result) {
    // Update i18n locale
    router.push(`/${language}/profile`);
    showSuccess("Language updated");
  }
};
```

### 3. Login Page - Stay Connected

```typescript
const handleStayConnectedChange = async (checked: boolean) => {
  await PreferencesService.updateStayConnected(checked);

  if (checked) {
    // Set long-lived session
    await supabase.auth.updateUser({
      data: { session_duration: "30d" },
    });
  }
};
```

## Migration Steps

### 1. Apply Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
# Run the contents of 004_user_preferences.sql
```

### 2. Restart Backend

The backend will automatically pick up the new columns and API endpoint.

### 3. Test API

```bash
# Get profile (includes preferences)
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preferences
curl -X PUT http://localhost:3001/auth/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"fr","push_notifications_enabled":true}'
```

### 4. Update Frontend

The PreferencesService is ready to use. Update your components:

- ✅ Profile page - Push notifications toggle (IMPLEMENTED)
- ⏳ Language selector modal
- ⏳ Login page - Stay connected checkbox

## Benefits Summary

### Database Storage ✅

- ✅ Cross-device synchronization
- ✅ Backend can use preferences (push notifications, emails)
- ✅ Survives cache clears
- ✅ Admin visibility
- ✅ Analytics possible

### LocalStorage Cache ✅

- ✅ Instant access (no API delay)
- ✅ Offline support
- ✅ Reduced database load
- ✅ Better performance

### Hybrid Approach ✅

- ✅ Best of both worlds
- ✅ Database as source of truth
- ✅ Cache for performance
- ✅ Automatic sync every 5 minutes
- ✅ Fallback to cache if database unavailable

## Next Steps

1. ✅ Database migration applied
2. ✅ Backend API implemented
3. ✅ PreferencesService created
4. ✅ Push notifications toggle working
5. ⏳ Implement language selector
6. ⏳ Implement stay connected on login
7. ⏳ Add preferences sync on app startup
8. ⏳ Add offline detection and queue

## Testing

### Test Push Notifications Toggle

1. Go to `/profile`
2. Toggle push notifications
3. Check browser console for API call
4. Verify in Supabase Dashboard → Database → users table
5. Check localStorage: `user_preferences`

### Test Cache

1. Toggle preference
2. Check localStorage (should update immediately)
3. Refresh page
4. Preference should persist (loaded from cache)
5. Wait 5+ minutes or clear cache
6. Refresh page
7. Should fetch from database

### Test Cross-Device Sync

1. Change preference on device A
2. Open app on device B
3. Preference should sync within 5 minutes
4. Force sync with `PreferencesService.forceSync()`

## Troubleshooting

### Preferences Not Syncing

- Check if migration was applied: `SELECT language FROM users LIMIT 1;`
- Check backend logs for errors
- Verify API endpoint is accessible
- Check localStorage for cached data

### Cache Not Updating

- Clear localStorage: `PreferencesService.clearCache()`
- Check browser console for errors
- Verify API response includes preferences

### Database Errors

- Ensure migration was applied
- Check RLS policies allow user to update their own profile
- Verify user is authenticated

---

**Status**: ✅ Implemented (Push Notifications)
**Recommendation**: Use Database with LocalStorage cache (Hybrid approach)
**Last Updated**: 2026-02-08
