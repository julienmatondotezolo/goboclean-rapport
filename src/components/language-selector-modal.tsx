'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Check, X, Loader2 } from 'lucide-react';
import { saveLanguagePreference, loadLanguagePreference, type SupportedLocale } from '@/lib/language-storage';

interface Language {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français (FR)', flag: '🇫🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands (NL)', flag: '🇳🇱' },
];

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageSelectorModal({ isOpen, onClose }: LanguageSelectorModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('Profile');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Load saved language preference from localStorage on mount
    const savedLanguage = loadLanguagePreference();
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLanguageChange = async (languageCode: SupportedLocale) => {
    if (isChanging || languageCode === currentLocale) {
      onClose();
      return;
    }
    
    setIsChanging(true);
    
    try {
      // Save to localStorage and cookie for PWA persistence
      saveLanguagePreference(languageCode);
      setSelectedLanguage(languageCode);

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Close modal
      onClose();

      // Small delay before navigation
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to the same page but with new locale
      router.replace(pathname, { locale: languageCode });
      
      // Force a page refresh to ensure all translations are updated
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      setIsChanging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-lg bg-white rounded-t-[32px] shadow-2xl pointer-events-auto animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-[20px] font-bold text-slate-900">
              {t('language')}
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            <p className="text-slate-600 text-[14px] mb-5">
              {t('selectLanguage')}
            </p>

            <div className="space-y-3 z mb-24">
              {languages.map((language) => {
                const isSelected = selectedLanguage === language.code;
                const isCurrent = currentLocale === language.code;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isChanging}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all ${
                      isSelected
                        ? 'bg-(--brand-green)/10 border-2 border-(--brand-green)'
                        : 'bg-[#f1f3f1] border-2 border-transparent hover:bg-[#e8ebe8]'
                    } ${isChanging ? 'opacity-50' : 'active:scale-[0.98]'}`}
                  >
                    {/* Flag */}
                    <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center shrink-0 shadow-sm text-2xl">
                      {isChanging && language.code === selectedLanguage ? (
                        <Loader2 className="w-6 h-6 text-(--brand-green) animate-spin" />
                      ) : (
                        language.flag
                      )}
                    </div>

                    {/* Language Name */}
                    <div className="flex-1 text-left">
                      <p className="text-[17px] font-bold text-slate-900">
                        {language.nativeName}
                      </p>
                      <p className="text-[14px] text-slate-500">
                        {language.name}
                      </p>
                    </div>

                    {/* Check Mark or Current Badge */}
                    {isCurrent && (
                      <div className="w-7 h-7 bg-(--brand-green) rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
