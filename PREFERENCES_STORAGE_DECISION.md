# Storage Decision: User Preferences

## Question

Should user preferences (Push Notifications, Language, Stay Connected) be stored in:

- Database (Supabase)
- IndexedDB/LocalStorage

## ✅ Answer: Use BOTH (Hybrid Approach)

### Database = Source of Truth

### LocalStorage = Performance Cache

---

## Why This Approach?

### 🗄️ Database Storage (Primary)

**Advantages:**

- ✅ **Cross-device sync**: Change language on phone → syncs to desktop
- ✅ **Backend integration**: Server needs to know notification preferences
- ✅ **Persistent**: Survives browser cache clears
- ✅ **Centralized**: Single source of truth
- ✅ **Auditable**: Track preference changes
- ✅ **Shareable**: Admin can view/manage user preferences

**Use Cases:**

- Push notification settings (backend sends notifications)
- Language preference (for emails, reports, backend responses)
- Stay connected (session management)

### 💾 LocalStorage Cache (Secondary)

**Advantages:**

- ⚡ **Fast**: Instant access, no API call delay
- 📱 **Offline**: Works without internet
- 🔋 **Efficient**: Reduces database load
- 🎯 **Better UX**: No loading spinners for preferences

**Use Cases:**

- Quick preference lookups
- Offline mode support
- Reducing API calls

---

## Implementation

### 1. Database Schema

```sql
-- users table
ALTER TABLE users ADD COLUMN:
  - language TEXT DEFAULT 'fr'
  - push_notifications_enabled BOOLEAN DEFAULT true
  - stay_connected BOOLEAN DEFAULT false
```

### 2. Backend API

```
PUT /auth/preferences
Body: { language, push_notifications_enabled, stay_connected }
```

### 3. Frontend Service

```typescript
// Hybrid storage with automatic caching
PreferencesService.getPreferences(); // From cache or DB
PreferencesService.updateLanguage("fr"); // Updates both
PreferencesService.forceSync(); // Refresh from DB
```

### 4. Caching Strategy

```
1. User requests preferences
2. Check localStorage (if < 5 min old, use it)
3. Otherwise, fetch from database
4. Update localStorage cache
5. Return preferences

On update:
1. Send to backend API
2. Update database
3. Update localStorage cache
4. Return success
```

---

## Comparison Table

| Feature                | Database Only | LocalStorage Only | Hybrid (Recommended) |
| ---------------------- | ------------- | ----------------- | -------------------- |
| Cross-device sync      | ✅ Yes        | ❌ No             | ✅ Yes               |
| Offline support        | ❌ No         | ✅ Yes            | ✅ Yes               |
| Performance            | ⚠️ Slow       | ✅ Fast           | ✅ Fast              |
| Backend integration    | ✅ Yes        | ❌ No             | ✅ Yes               |
| Survives cache clear   | ✅ Yes        | ❌ No             | ✅ Yes               |
| Reduces API calls      | ❌ No         | ✅ Yes            | ✅ Yes               |
| Single source of truth | ✅ Yes        | ❌ No             | ✅ Yes               |

---

## Real-World Example

### Scenario: User changes language from English to French

**With Database Only:**

```
1. User clicks "Français"
2. API call to backend (200ms delay)
3. Database updated
4. UI updates
5. User switches to phone
6. Phone loads French ✅
```

**With LocalStorage Only:**

```
1. User clicks "Français"
2. LocalStorage updated (instant)
3. UI updates
4. User switches to phone
5. Phone still shows English ❌
```

**With Hybrid (Recommended):**

```
1. User clicks "Français"
2. API call to backend (background)
3. LocalStorage updated (instant)
4. UI updates immediately ✅
5. Database updated ✅
6. User switches to phone
7. Phone loads French from database ✅
```

---

## Implementation Status

### ✅ Completed

- [x] Database migration (004_user_preferences.sql)
- [x] Backend API endpoint (PUT /auth/preferences)
- [x] PreferencesService with hybrid storage
- [x] Push notifications toggle on profile page

### ⏳ Next Steps

- [ ] Language selector implementation
- [ ] Stay connected on login page
- [ ] Sync preferences on app startup
- [ ] Offline queue for preference updates

---

## Files Created/Modified

### Backend

- `src/auth/auth.controller.ts` - Added PUT /auth/preferences
- `src/auth/auth.service.ts` - Added updatePreferences method

### Frontend

- `src/lib/preferences.ts` - PreferencesService (NEW)
- `src/app/[locale]/(pages)/profile/page.tsx` - Push notifications toggle

### Database

- `supabase/migrations/004_user_preferences.sql` - Schema changes (NEW)

---

## Recommendation Summary

**Use Database with LocalStorage cache (Hybrid approach)**

This gives you:

- ✅ Cross-device synchronization
- ✅ Fast, responsive UI
- ✅ Offline support
- ✅ Backend integration
- ✅ Data persistence
- ✅ Best user experience

**Cost**: Minimal - just localStorage caching logic
**Benefit**: Maximum - best of both worlds

---

**Decision**: ✅ Hybrid Storage (Database + LocalStorage)
**Status**: Implemented
**Date**: 2026-02-08
