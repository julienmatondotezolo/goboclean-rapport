import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/reset-password", "/set-password", "/auth"];

  // Define routes that don't need onboarding check
  const onboardingExemptRoutes = ["/login", "/signup", "/reset-password", "/set-password", "/auth", "/onboarding"];

  // Check if the current path is a public route or root path
  const isRootPath =
    routing.locales.some((locale) => pathname === `/${locale}` || pathname === `/${locale}/`) || pathname === "/";

  const isPublicRoute = isRootPath || publicRoutes.some((route) => pathname.includes(route));

  // Check if the current path is exempt from onboarding check
  const isOnboardingExempt = onboardingExemptRoutes.some((route) => pathname.includes(route));

  // Check if it's a static file or API route
  const isStaticFile = pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/);
  const isApiRoute = pathname.startsWith("/api");

  // Check if URL has auth tokens (from invitation/reset links)
  const hasAuthTokens =
    request.nextUrl.hash.includes("access_token") ||
    request.nextUrl.searchParams.has("token") ||
    request.nextUrl.searchParams.has("code");

  // Check if user is on login page - handle separately
  const isLoginPage = pathname.includes("/login");

  // If user is on login page, check if they're already logged in
  if (isLoginPage && !hasAuthTokens) {
    let response = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    // Use getClaims() instead of getSession() for reliable auth check in proxy
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    console.log("🔍 [PROXY] Login page check:", {
      pathname,
      hasUser: !!user,
      userId: user?.sub,
      cookies: request.cookies.getAll().map((c) => c.name),
    });

    // If user is logged in and on login page, redirect to dashboard
    if (user) {
      console.log("✅ [PROXY] User authenticated on login page, redirecting to dashboard");
      const locale = getLocaleFromPathname(pathname);
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      console.log("👤 [PROXY] No user found on login page, allowing access");
    }
  }

  // Skip auth check for public routes, static files, API routes, or URLs with auth tokens
  if (!isPublicRoute && !isStaticFile && !isApiRoute && !hasAuthTokens) {
    let response = NextResponse.next({
      request,
    });

    // Create a Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    // Check if user is authenticated - use getClaims() for reliable auth check
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    // If no user, redirect to login
    if (!user) {
      const locale = getLocaleFromPathname(pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);

      // Add the original URL as a redirect parameter
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Check if user needs onboarding (only for authenticated users not on exempt routes)
    if (!isOnboardingExempt && user) {
      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("is_onboarded, profile_picture_url")
          .eq("id", user.sub)
          .single();

        // If user is not onboarded OR has no profile picture, redirect to onboarding
        if (!error && userData && (!userData.is_onboarded || !userData.profile_picture_url)) {
          const locale = getLocaleFromPathname(pathname);
          const onboardingUrl = new URL(`/${locale}/onboarding`, request.url);
          return NextResponse.redirect(onboardingUrl);
        }
      } catch (error) {
        // If there's an error checking onboarding status, continue anyway
        console.error("Error checking onboarding status:", error);
      }
    }

    return response;
  }

  // Check if there's a locale in the pathname
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // If no locale in pathname, check for saved preference in cookie
  if (!pathnameHasLocale) {
    // Try to get preferred language from cookie (set by client)
    const preferredLocale = request.cookies.get("NEXT_LOCALE")?.value;

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

// Helper function to extract locale from pathname
function getLocaleFromPathname(pathname: string): string {
  const locale = routing.locales.find((loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`);
  return locale || routing.defaultLocale;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en|nl)/:path*"],
};
