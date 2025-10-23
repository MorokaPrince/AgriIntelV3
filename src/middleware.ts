import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/dashboard',
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
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session for authentication check with error handling
  let session;
  try {
    console.log('[Middleware] Getting server session for path:', request.nextUrl.pathname);
    session = await getServerSession(authOptions);
    console.log('[Middleware] Session retrieved successfully:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });
  } catch (error) {
    console.error('[Middleware] Error getting server session:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      pathname: request.nextUrl.pathname,
      timestamp: new Date().toISOString()
    });
    // Return redirect to login on session errors
    const signInUrl = new URL('/auth/login', request.url);
    signInUrl.searchParams.set('error', 'SessionError');
    return NextResponse.redirect(signInUrl);
  }

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

  // If accessing root path without authentication, redirect to login
  if (pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If accessing root path while authenticated, redirect to dashboard
  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow API routes to pass through (they handle their own auth)
  if (pathname.startsWith('/api/') && !isProtectedRoute) {
    return NextResponse.next();
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};