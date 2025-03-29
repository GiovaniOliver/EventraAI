import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/events',
  '/tasks',
  '/analytics',
  '/profile',
  '/settings',
  '/subscribe',
  '/checkout',
]

// Public routes that don't require authentication
const publicRoutes = ['/', '/auth', '/about', '/blog', '/pricing', '/promotion']

// Auth paths that may be accessed from both /auth/path and /path formats
const authPaths = ['login', 'signup', 'forgot-password', 'confirm'];

export async function middleware(request: NextRequest) {
  // Log all requests for debugging
  console.log('Middleware request path:', request.nextUrl.pathname);
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true';
  
  if (isDevelopmentMode) {
    console.log('Development mode active in middleware - bypassing auth checks');
    return NextResponse.next();
  }
  
  // Get environment variables for Supabase connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase credentials are properly configured
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not properly configured. Skipping authentication check.');
    return NextResponse.next();
  }

  // List of paths that don't require authentication
  const publicPaths = [
    '/login', '/signup', '/forgot-password', '/confirm',
    '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/confirm',
    '/', '/api', '/about', '/blog', '/promotion', '/images'
  ];

  // Check if the path is public
  const path = request.nextUrl.pathname;
  
  // Handle auth path redirects
  if (path === '/auth') {
    // Redirect /auth to /login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
    console.log('Public path detected, skipping auth check:', path);
    return NextResponse.next();
  }

  console.log('Protected path detected, checking authentication:', path);

  // Create a Supabase client for server-side usage
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This is a no-op in middleware
        },
        remove(name: string, options: CookieOptions) {
          // This is a no-op in middleware
        },
      },
    }
  );

  try {
    // Get the user's session to check authentication
    console.log('Checking session for protected path:', path);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Session check result:', session ? 'Authenticated' : 'Not authenticated');

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!session) {
      console.log('Redirecting unauthenticated user to login');
      // Always use absolute URL for redirects
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
      const redirectUrl = new URL('/auth/login', baseUrl);
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    // On error, redirect to login with error parameter
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const redirectUrl = new URL('/auth/login', baseUrl);
    redirectUrl.searchParams.set('error', 'auth_check_failed');
    return NextResponse.redirect(redirectUrl);
  }

  // User is authenticated, allow the request to proceed
  console.log('User is authenticated, proceeding with request');
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 