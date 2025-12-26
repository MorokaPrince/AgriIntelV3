import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { Session } from 'next-auth';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/login',
  '/auth/signup',
  '/auth/register',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth',
  '/api/dashboard/stats',
  '/api/animals',
  '/api/health',
  '/api/financial',
  '/api/feeding',
  '/api/breeding',
  '/api/rfid',
  '/api/tasks',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for now to prevent openid-client error
  // TODO: Fix NextAuth middleware integration issue
  console.log('[Middleware] Skipping auth check for path:', pathname);
  
  // Temporarily allow all requests to fix application access
  return NextResponse.next();

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If accessing public route, allow it
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/login', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth routes while authenticated, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};