import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Proxy (middleware Next 16) — gestion des locales UNIQUEMENT.
 * L'authentification est gérée côté client (JWT backend en localStorage,
 * redirections via useAuth) — l'ancien contrôle de session Supabase par
 * cookies était un vestige de l'auth supprimée et ne trouvait jamais de
 * session (voir LOGOUT_FIX.md / FINAL_SOLUTION.md).
 */
export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Pas de locale dans l'URL → respecter la préférence sauvegardée (cookie)
  if (!pathnameHasLocale) {
    const preferredLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (preferredLocale && routing.locales.includes(preferredLocale as (typeof routing.locales)[number])) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en|nl)/:path*"],
};
