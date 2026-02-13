/**
 * Simplified Middleware for Backend Authentication
 * Uses JWT tokens stored in localStorage (checked on client side)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin', 
  '/profile',
  '/mission',
  '/reports',
  '/schedule',
  '/notifications'
];

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  '/login',
  '/auth',
  '/set-password',
  '/_next',
  '/api/health'
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Skip auth for public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === '/'
  );

  if (isPublicRoute) {
    return response;
  }

  // Check if route requires authentication  
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // For backend auth, we can't easily check JWT tokens in middleware
    // since they're stored in localStorage on client side
    // So we'll let the client-side authentication handle redirects
    // and just add some basic security headers here
    
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.css$|.*\\.js$|sw\\.js|workbox-.*\\.js).*)',
  ],
};