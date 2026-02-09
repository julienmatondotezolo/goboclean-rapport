"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import React, { JSX, ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { LanguageInitializer } from "@/components/language-initializer";
import { OfflineInitializer } from "@/components/offline-initializer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWAUpdateNotification } from "@/components/pwa-update-notification";
import { createClient } from "@/lib/supabase/client";

// Manually import messages for each locale
import enMessages from "../../../messages/en.json";
import frMessages from "../../../messages/fr.json";
import nlMessages from "../../../messages/nl.json";

type Props = {
  children?: ReactNode;
  locale: string;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Function to select the correct messages based on the locale
function selectMessages(locale: string) {
  switch (locale) {
    case "nl":
      return nlMessages;
    case "fr":
      return frMessages;
    // ... add cases for other locales as needed
    default:
      return enMessages; // Default to English messages
  }
}

// Component to listen for auth changes and clear cache on logout
function AuthCacheCleaner() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Clear all React Query caches when user signs out
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}

export default function Providers({ children, locale }: Props): JSX.Element {
  // const messages = useMessages();
  const timeZone = "Europe/Brussels";
  const messages = selectMessages(locale);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <AuthCacheCleaner />
          <LanguageInitializer />
          <OfflineInitializer />
          {children}
          <PWAInstallPrompt />
          <PWAUpdateNotification />
        </NextIntlClientProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
