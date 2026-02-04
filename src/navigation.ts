import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr", "nl"] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "always"
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
