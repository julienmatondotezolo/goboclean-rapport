"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import React, { JSX, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageInitializer } from "@/components/language-initializer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { PageLogger } from "@/components/page-logger";
import { CacheMigration } from "@/components/cache-migration";

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
      // Network timeouts and retries
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        // Retry max 3 times for network/5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // IMPORTANT: Use 'always' to allow queries even when navigator.onLine is false
      // This prevents queries from being blocked when the browser incorrectly reports offline status
      networkMode: 'always', 
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Refetch stale queries in the background
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on 4xx errors
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        // Retry max 2 times for network/5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Mutations should respect online status more strictly
      networkMode: 'online',
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

export default function Providers({ children, locale }: Props): JSX.Element {
  // const messages = useMessages();
  const timeZone = "Europe/Brussels";
  const messages = selectMessages(locale);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
            <PageLogger>
              <CacheMigration />
              <LanguageInitializer />
              {children}
              <PWAInstallPrompt />
            </PageLogger>
          </NextIntlClientProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
