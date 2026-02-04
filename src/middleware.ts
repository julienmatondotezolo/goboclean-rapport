import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if there's a locale in the pathname
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, check for saved preference in cookie
  if (!pathnameHasLocale) {
    // Try to get preferred language from cookie (set by client)
    const preferredLocale = request.cookies.get('NEXT_LOCALE')?.value;
    
    if (preferredLocale && routing.locales.includes(preferredLocale as any)) {
      // Redirect to the preferred locale
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // Use the default next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en|nl)/:path*"],
};
