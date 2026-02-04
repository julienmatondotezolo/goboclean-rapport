# Language Switcher Feature - PWA Compatible

## Overview
A fully functional language switcher that works seamlessly across devices in a PWA environment. The language preference is saved locally and persists across app restarts, even when offline.

## Features

### ✅ Multi-Language Support
- **English (US)** 🇺🇸
- **French (FR)** 🇫🇷
- **Dutch (NL)** 🇳🇱

### ✅ PWA-Ready Storage
- **localStorage** - Primary storage for offline persistence
- **Cookie** - Fallback for server-side rendering
- Works across multiple devices when using the same browser profile
- Survives app restarts and offline mode

### ✅ User Interface
- Clean, modern language selection page
- Visual feedback with flag emojis
- Active language indicator with checkmark
- Loading states during language change
- Smooth transitions

## File Structure

```
src/
├── app/[locale]/(pages)/profile/
│   └── language/
│       └── page.tsx                 # Language selection page
├── lib/
│   └── language-storage.ts          # Storage utility functions
├── components/
│   └── language-initializer.tsx     # Auto-initialize on app load
├── middleware.ts                     # Language routing middleware
└── i18n/
    └── routing.ts                    # Locale configuration

messages/
├── en.json                           # English translations
├── fr.json                           # French translations
└── nl.json                           # Dutch translations
```

## How It Works

### 1. Storage Strategy
The language preference is stored in **two locations** for maximum reliability:

```typescript
// Primary: localStorage (PWA offline support)
localStorage.setItem('goboclean_preferred_language', 'fr');

// Fallback: Cookie (SSR support)
document.cookie = 'NEXT_LOCALE=fr; path=/; max-age=31536000';
```

### 2. Language Selection Flow
1. User navigates to Profile → Language
2. Selects preferred language
3. Preference saved to localStorage + cookie
4. App redirects to new locale
5. Page reloads with new language

### 3. App Initialization
On every app launch:
1. `LanguageInitializer` component checks for saved preference
2. If found, redirects to correct locale automatically
3. If not found, uses browser default or fallback to French

## Usage

### For Users
1. Go to **Profile** page
2. Tap on **Language**
3. Select your preferred language
4. App will reload with new language

### For Developers

#### Check Current Language
```typescript
import { useLocale } from 'next-intl';

function MyComponent() {
  const locale = useLocale(); // 'en' | 'fr' | 'nl'
  return <div>Current: {locale}</div>;
}
```

#### Save Language Preference
```typescript
import { saveLanguagePreference } from '@/lib/language-storage';

// Save preference
saveLanguagePreference('fr');
```

#### Load Language Preference
```typescript
import { loadLanguagePreference } from '@/lib/language-storage';

// Load preference
const savedLocale = loadLanguagePreference(); // 'fr' | null
```

#### Add New Translation
1. Add key to `messages/en.json`:
```json
{
  "MyFeature": {
    "title": "My Feature"
  }
}
```

2. Add translations to `messages/fr.json` and `messages/nl.json`

3. Use in component:
```typescript
const t = useTranslations('MyFeature');
return <h1>{t('title')}</h1>;
```

## API Reference

### `language-storage.ts`

#### `saveLanguagePreference(locale: SupportedLocale): void`
Saves language preference to localStorage and cookie.

#### `loadLanguagePreference(): SupportedLocale | null`
Loads saved language preference.

#### `clearLanguagePreference(): void`
Clears all saved language preferences.

#### `getBrowserLanguage(): SupportedLocale`
Gets browser's default language.

#### `initializeLanguage(): SupportedLocale`
Initializes language on app load.

### Types
```typescript
type SupportedLocale = 'en' | 'fr' | 'nl';
```

## PWA Considerations

### Offline Mode
- Language preference is saved in localStorage
- Works even when device is offline
- No internet required to change language

### Cross-Device Sync
- Language preference is **device-specific**
- Each device maintains its own preference
- Use a backend service if you need cross-device sync

### Service Worker
- Language files are cached by Next.js
- Changes to language don't require network
- Fast language switching even offline

## Testing

### Test Language Persistence
1. Select a language
2. Close the app completely
3. Reopen the app
4. ✅ Language should be preserved

### Test Offline Mode
1. Enable airplane mode
2. Change language
3. ✅ Should work without internet

### Test Multiple Devices
1. Install PWA on Device A, select French
2. Install PWA on Device B, select English
3. ✅ Each device maintains its own preference

## Troubleshooting

### Language not persisting
- Check browser localStorage is enabled
- Check if cookies are allowed
- Clear cache and try again

### Wrong language on load
- Check localStorage: `localStorage.getItem('goboclean_preferred_language')`
- Clear and set again: `localStorage.removeItem('goboclean_preferred_language')`

### Missing translations
- Verify key exists in all three JSON files
- Check console for missing translation warnings
- Add missing keys to JSON files

## Future Enhancements

- [ ] Sync language preference to backend (cross-device)
- [ ] Add more languages (German, Spanish, etc.)
- [ ] RTL support for Arabic/Hebrew
- [ ] Auto-detect language from GPS location
- [ ] Voice-based language selection

## Notes

- Default language: **French (FR)**
- Fallback language: **English (US)**
- Cookie expires: **1 year**
- localStorage key: `goboclean_preferred_language`
- Cookie name: `NEXT_LOCALE`
