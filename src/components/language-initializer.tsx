'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { loadLanguagePreference } from '@/lib/language-storage';

/**
 * Language Initializer Component
 * 
 * This component runs on app load and ensures the user's saved language
 * preference is applied. Critical for PWA functionality across devices.
 */
export function LanguageInitializer() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run once on mount
    const savedLocale = loadLanguagePreference();
    
    if (!savedLocale) return;

    // Check if current pathname has the saved locale
    const currentLocale = pathname.split('/')[1];
    
    // If we're on a different locale than saved, redirect
    if (currentLocale !== savedLocale && ['en', 'fr', 'nl'].includes(currentLocale)) {
      const newPathname = pathname.replace(`/${currentLocale}`, `/${savedLocale}`);
      router.replace(newPathname);
    }
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
