import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/reset-password', '/set-password', '/auth'];
  
  // Define routes that don't need onboarding check
  const onboardingExemptRoutes = ['/login', '/signup', '/reset-password', '/set-password', '/auth', '/onboarding'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => 
    pathname.includes(route)
  );
  
  // Check if the current path is exempt from onboarding check
  const isOnboardingExempt = onboardingExemptRoutes.some((route) => 
    pathname.includes(route)
  );
  
  // Check if it's a static file or API route
  const isStaticFile = pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/);
  const isApiRoute = pathname.startsWith('/api');
  
  // Check if URL has auth tokens (from invitation/reset links)
  const hasAuthTokens = request.nextUrl.hash.includes('access_token') || 
                        request.nextUrl.searchParams.has('token') ||
                        request.nextUrl.searchParams.has('code');
  
  // Skip auth check for public routes, static files, API routes, or URLs with auth tokens
  if (!isPublicRoute && !isStaticFile && !isApiRoute && !hasAuthTokens) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create a Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    // If no session, redirect to login
    if (!session) {
      const locale = getLocaleFromPathname(pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      
      // Add the original URL as a redirect parameter
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    // Check if user needs onboarding (only for authenticated users not on exempt routes)
    if (!isOnboardingExempt && session) {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_onboarded, profile_picture_url')
          .eq('id', session.user.id)
          .single();

        // If user is not onboarded OR has no profile picture, redirect to onboarding
        if (!error && userData && (!userData.is_onboarded || !userData.profile_picture_url)) {
          const locale = getLocaleFromPathname(pathname);
          const onboardingUrl = new URL(`/${locale}/onboarding`, request.url);
          return NextResponse.redirect(onboardingUrl);
        }
      } catch (error) {
        // If there's an error checking onboarding status, continue anyway
        console.error('Error checking onboarding status:', error);
      }
    }

    return response;
  }
  
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

// Helper function to extract locale from pathname
function getLocaleFromPathname(pathname: string): string {
  const locale = routing.locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );
  return locale || routing.defaultLocale;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en|nl)/:path*"],
};
