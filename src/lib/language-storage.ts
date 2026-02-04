/**
 * Language Storage Utility for PWA
 * 
 * This utility provides reliable language preference storage that works across:
 * - Multiple devices
 * - Online/Offline modes
 * - PWA installations
 * 
 * Storage Strategy:
 * 1. localStorage - Primary storage (works offline in PWA)
 * 2. Cookie - Fallback for server-side rendering
 */

const STORAGE_KEY = 'goboclean_preferred_language';
const COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type SupportedLocale = 'en' | 'fr' | 'nl';

/**
 * Save language preference to both localStorage and cookie
 */
export function saveLanguagePreference(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;

  try {
    // Save to localStorage for PWA persistence
    localStorage.setItem(STORAGE_KEY, locale);

    // Save to cookie for server-side rendering
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    console.log('✅ Language preference saved:', locale);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Load language preference from localStorage or cookie
 */
export function loadLanguagePreference(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try localStorage first (best for PWA)
    const storedLocale = localStorage.getItem(STORAGE_KEY);
    if (storedLocale && isValidLocale(storedLocale)) {
      return storedLocale as SupportedLocale;
    }

    // Fallback to cookie
    const cookieLocale = getCookie(COOKIE_NAME);
    if (cookieLocale && isValidLocale(cookieLocale)) {
      // Sync back to localStorage
      localStorage.setItem(STORAGE_KEY, cookieLocale);
      return cookieLocale as SupportedLocale;
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
  }

  return null;
}

/**
 * Clear language preference
 */
export function clearLanguagePreference(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  } catch (error) {
    console.error('Error clearing language preference:', error);
  }
}

/**
 * Get browser's default language
 */
export function getBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') return 'fr';

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  
  if (isValidLocale(browserLang)) {
    return browserLang as SupportedLocale;
  }

  return 'fr'; // Default fallback
}

/**
 * Initialize language preference on app load
 * Returns the locale to use
 */
export function initializeLanguage(): SupportedLocale {
  // Try to load saved preference
  const savedLocale = loadLanguagePreference();
  if (savedLocale) {
    return savedLocale;
  }

  // Fallback to browser language
  const browserLocale = getBrowserLanguage();
  saveLanguagePreference(browserLocale);
  return browserLocale;
}

// Helper functions
function isValidLocale(locale: string): boolean {
  return ['en', 'fr', 'nl'].includes(locale);
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}
