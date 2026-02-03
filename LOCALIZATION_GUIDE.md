# GoboClean Rapport - Localization Guide

## 🌍 Supported Languages

The login screen is now fully localized in three languages:

- 🇬🇧 **English** (en)
- 🇫🇷 **French** (fr)
- 🇳🇱 **Dutch** (nl)

## 📝 Translation Keys

All translations are stored in the `messages/` directory:

```
messages/
├── en.json  (English)
├── fr.json  (French)
└── nl.json  (Dutch)
```

## 🔑 Login Screen Translation Keys

### Form Labels & Placeholders

| Key | English | French | Dutch |
|-----|---------|--------|-------|
| `email` | Work Email | Email professionnel | Werk E-mail |
| `emailPlaceholder` | foreman@roofing.com | foreman@roofing.com | voorman@roofing.com |
| `password` | Password | Mot de passe | Wachtwoord |
| `passwordPlaceholder` | Enter password | Entrez le mot de passe | Voer wachtwoord in |
| `forgotPassword` | Forgot? | Oublié? | Vergeten? |
| `keepLoggedIn` | Keep me logged in | Rester connecté | Ingelogd blijven |

### Buttons & Actions

| Key | English | French | Dutch |
|-----|---------|--------|-------|
| `loginButton` | Login to Jobs | Se connecter | Inloggen voor Jobs |
| `loggingIn` | Logging in... | Connexion en cours... | Inloggen... |
| `contactSupport` | Contact Support | Contacter le support | Contact Ondersteuning |

### Status Messages

| Key | English | French | Dutch |
|-----|---------|--------|-------|
| `offlineSync` | Offline Sync Ready | Synchronisation hors ligne prête | Offline Sync Klaar |
| `version` | Version | Version | Versie |

### Validation Messages

| Key | English | French | Dutch |
|-----|---------|--------|-------|
| `invalidEmail` | Invalid email | Email invalide | Ongeldig e-mailadres |
| `passwordMinLength` | Password must be at least 6 characters | Le mot de passe doit contenir au moins 6 caractères | Wachtwoord moet minimaal 6 tekens bevatten |

### Success & Error Messages

| Key | English | French | Dutch |
|-----|---------|--------|-------|
| `loginSuccess` | Login successful | Connexion réussie | Inloggen geslaagd |
| `welcome` | Welcome | Bienvenue | Welkom |
| `loginError` | Login error | Erreur de connexion | Inlogfout |
| `invalidCredentials` | Invalid email or password | Email ou mot de passe incorrect | Ongeldig e-mailadres of wachtwoord |

## 💻 Usage in Code

### Basic Usage

```tsx
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');
  
  return (
    <div>
      <label>{t('email')}</label>
      <input placeholder={t('emailPlaceholder')} />
    </div>
  );
}
```

### Dynamic Messages

```tsx
// Success message with user name
toast({
  title: t('loginSuccess'),
  description: `${t('welcome')} ${profile.first_name} !`,
});

// Error message with fallback
toast({
  title: t('loginError'),
  description: error.message || t('invalidCredentials'),
  variant: 'destructive',
});
```

### Form Validation

```tsx
const loginSchema = z.object({
  email: z.string().email(t('invalidEmail')),
  password: z.string().min(6, t('passwordMinLength')),
});
```

## 🌐 Accessing Different Languages

### URL Structure

The app uses locale-based routing:

```
http://localhost:3000/en/login  (English)
http://localhost:3000/fr/login  (French)
http://localhost:3000/nl/login  (Dutch)
```

### Language Switcher

Users can switch languages using the language switcher component in the navigation.

## 📦 Adding New Translations

### 1. Add to Translation Files

Add your new key to all three language files:

**messages/en.json:**
```json
{
  "Login": {
    "newKey": "New English Text"
  }
}
```

**messages/fr.json:**
```json
{
  "Login": {
    "newKey": "Nouveau Texte Français"
  }
}
```

**messages/nl.json:**
```json
{
  "Login": {
    "newKey": "Nieuwe Nederlandse Tekst"
  }
}
```

### 2. Use in Component

```tsx
const t = useTranslations('Login');
<p>{t('newKey')}</p>
```

## 🎯 Best Practices

### 1. Always Translate User-Facing Text

```tsx
// ❌ Bad - Hardcoded text
<button>Login</button>

// ✅ Good - Translated text
<button>{t('loginButton')}</button>
```

### 2. Use Descriptive Keys

```tsx
// ❌ Bad - Unclear key
t('btn1')

// ✅ Good - Descriptive key
t('loginButton')
```

### 3. Keep Keys Organized

Group related translations under the same namespace:

```json
{
  "Login": {
    "email": "...",
    "password": "...",
    "loginButton": "..."
  },
  "Reports": {
    "title": "...",
    "subtitle": "..."
  }
}
```

### 4. Handle Plurals and Variables

For dynamic content, use template strings:

```tsx
// In component
`${t('welcome')} ${userName}!`

// In translation file
{
  "welcome": "Welcome"
}
```

## 🔍 Testing Translations

### 1. Visual Testing

Navigate to each language version:
- `/en/login` - Check English
- `/fr/login` - Check French
- `/nl/login` - Check Dutch

### 2. Validation Testing

Test form validation in each language:
- Submit empty form
- Enter invalid email
- Enter short password

Verify error messages appear in the correct language.

### 3. Success/Error Messages

Test toast notifications:
- Successful login
- Failed login
- Network errors

## 📋 Translation Checklist

When adding a new page or feature:

- [ ] Add all text to translation files
- [ ] Translate to all three languages
- [ ] Use `useTranslations` hook
- [ ] Test in all languages
- [ ] Verify form validation messages
- [ ] Check success/error messages
- [ ] Test with language switcher
- [ ] Verify responsive layout with longer text

## 🌍 Language-Specific Considerations

### English (en)
- Use American English spelling
- Keep text concise
- Use active voice

### French (fr)
- Use formal "vous" form
- Proper accents (é, è, à, etc.)
- Longer text than English (plan for ~30% more space)

### Dutch (nl)
- Use formal "u" form for business context
- Compound words are common
- May be longer than English

## 🎨 Layout Considerations

Some languages require more space than others. The UI should accommodate:

- **French**: ~30% longer than English
- **Dutch**: ~20% longer than English
- **English**: Baseline

Ensure:
- Buttons don't overflow
- Labels don't wrap awkwardly
- Forms remain aligned

## 🔧 Configuration

### next-intl Configuration

The app uses `next-intl` for internationalization:

```tsx
// i18n/routing.ts
export const locales = ['en', 'fr', 'nl'];
export const defaultLocale = 'fr';
```

### Middleware

The middleware automatically detects and redirects to the appropriate locale.

## 📚 Additional Resources

### Translation Files
- `messages/en.json` - English translations
- `messages/fr.json` - French translations
- `messages/nl.json` - Dutch translations

### Documentation
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18n Best Practices](https://www.i18next.com/principles/best-practices)

## ✅ Current Status

### Fully Translated Pages
- ✅ Login Page (`/[locale]/login`)
- ✅ Home Page (`/[locale]`)
- ✅ Reports Page (`/[locale]/reports`)

### Components with Translations
- ✅ Login Form
- ✅ Language Switcher
- ✅ Toast Notifications
- ✅ Form Validation

## 🚀 Quick Reference

### Import and Use Translations

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('Login');
  
  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('loginButton')}</button>
    </>
  );
}
```

### Access Different Namespaces

```tsx
const tLogin = useTranslations('Login');
const tReports = useTranslations('Reports');

<h1>{tLogin('title')}</h1>
<h2>{tReports('title')}</h2>
```

### Dynamic Content

```tsx
const t = useTranslations('Login');
const message = `${t('welcome')} ${userName}!`;
```

---

**Last Updated**: February 3, 2026  
**Languages**: English, French, Dutch  
**Status**: ✅ Complete
