/**
 * 🔒 SECURE Middleware for Route Protection
 * Implements authentication and security for Goboclean PWA
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 🛡️ Security configuration
const SECURITY_CONFIG = {
  // Protected routes that require authentication
  PROTECTED_ROUTES: [
    '/dashboard',
    '/admin',
    '/profile',
    '/mission',
    '/reports',
    '/schedule',
    '/notifications'
  ],
  
  // Admin-only routes
  ADMIN_ROUTES: [
    '/admin'
  ],
  
  // Public routes (no auth required)
  PUBLIC_ROUTES: [
    '/login',
    '/auth',
    '/set-password',
    '/_next',
    '/api/health'
  ],
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100
  }
};

// 🔐 Simple rate limiter for middleware
class MiddlewareRateLimiter {
  private requests: Map<string, { count: number; windowStart: number }> = new Map();

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now - record.windowStart > SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS) {
      this.requests.set(identifier, { count: 1, windowStart: now });
      return false;
    }

    record.count++;
    return record.count > SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS;
  }
}

const rateLimiter = new MiddlewareRateLimiter();

// 🔍 Security logging
function logSecurityEvent(event: string, request: NextRequest, details?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    url: request.url,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    details,
  };
  
  console.log('🔍 MIDDLEWARE SECURITY:', JSON.stringify(logEntry));
}

// 🛡️ Validate session integrity
function validateSession(session: any): boolean {
  if (!session?.access_token || !session.user) {
    return false;
  }

  try {
    // Basic JWT structure validation
    const tokenParts = session.access_token.split('.');
    if (tokenParts.length !== 3) return false;

    // Decode payload to check expiration
    const payload = JSON.parse(atob(tokenParts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // 🔐 Get client IP for rate limiting and logging
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  try {
    // 🚫 Rate limiting check
    if (rateLimiter.isRateLimited(clientIP)) {
      logSecurityEvent('RATE_LIMITED', request, { ip: clientIP });
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    // 🛡️ Security headers (applied to all responses)
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // HSTS only on HTTPS
    if (request.headers.get('x-forwarded-proto') === 'https' || url.protocol === 'https:') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // 🏠 Skip auth for public routes
    const isPublicRoute = SECURITY_CONFIG.PUBLIC_ROUTES.some(route => 
      pathname.startsWith(route) || pathname === '/'
    );

    if (isPublicRoute) {
      return response;
    }

    // 🔍 Check if route requires authentication
    const isProtectedRoute = SECURITY_CONFIG.PROTECTED_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
      return response;
    }

    // 🔐 Create Supabase client for session validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 🔍 Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      logSecurityEvent('SESSION_ERROR', request, { error: sessionError.message });
    }

    // 🚫 Redirect to login if no valid session
    if (!session || !validateSession(session)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', request, { 
        pathname,
        hasSession: !!session,
        sessionValid: session ? validateSession(session) : false
      });

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 🔍 Get user profile for role-based authorization
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, is_active')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      logSecurityEvent('PROFILE_FETCH_FAILED', request, {
        userId: session.user.id,
        error: profileError?.message
      });

      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 🚫 Check if account is active
    if (!profile.is_active) {
      logSecurityEvent('INACTIVE_ACCOUNT_ACCESS', request, {
        userId: session.user.id
      });

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'account_disabled');
      return NextResponse.redirect(loginUrl);
    }

    // 🔒 Admin route authorization
    const isAdminRoute = SECURITY_CONFIG.ADMIN_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && profile.role !== 'admin') {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', request, {
        userId: session.user.id,
        role: profile.role,
        attemptedRoute: pathname
      });

      return new NextResponse('Forbidden', { status: 403 });
    }

    // ✅ Log successful access
    logSecurityEvent('AUTHORIZED_ACCESS', request, {
      userId: session.user.id,
      role: profile.role,
      pathname
    });

    // 🔐 Add user context to response headers (for debugging)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-role', profile.role);
    }

    return response;

  } catch (error) {
    logSecurityEvent('MIDDLEWARE_ERROR', request, {
      error: error.message,
      stack: error.stack
    });

    // On error, redirect to login for protected routes
    const isProtectedRoute = SECURITY_CONFIG.PROTECTED_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.css$|.*\\.js$|sw\\.js|workbox-.*\\.js).*)',
  ],
};