import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/events',
  '/tasks',
  '/analytics',
  '/profile',
  '/settings',
  '/vendor',
  '/vendor/dashboard',
  '/vendor/events',
  '/vendor/tasks',
  '/vendor/analytics',
  '/vendor/profile',
  '/vendor/settings',
]

// Public routes that don't require authentication
const publicRoutes = ['/', '/about', '/blog', '/pricing', '/promotion', '/login', '/signup', '/forgot-password', '/confirm', '/special-offer', '/special-offer/1', '/special-offer/2', '/special-offer/3', '/special-offer/4', '/special-offer/5', '/special-offer/6', '/special-offer/7', '/special-offer/8', '/special-offer/9', '/special-offer/10']

// Auth paths that may be accessed without authentication
const authPaths = ['login', 'signup', 'forgot-password', 'confirm'];

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/confirm',
  '/about',
  '/blog',
  '/special-offer',
  '/pricing',
  '/cookies',
  '/security',
  '/features',
  '/images',
  '/favicon.ico'
]

// Supabase auth endpoints that should be allowed without auth
const supabaseAuthPaths = ['/auth/v1/', '/rest/v1/'];

export async function middleware(request: NextRequest) {
  console.log('Middleware request path:', request.nextUrl.pathname);
  
  // Check if this is a request to the Supabase authentication endpoints
  const isSupabaseAuthRequest = supabaseAuthPaths.some(path => 
    request.nextUrl.pathname.includes(path)
  );
  
  // For Supabase auth requests, add CORS headers and bypass auth checks
  if (isSupabaseAuthRequest) {
    console.log('Supabase auth request detected, adding CORS headers');
    const response = NextResponse.next();
    
    // Add CORS headers for Supabase requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info');
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }
    
    return response;
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    console.log('Public path detected, skipping auth check:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  console.log('Protected path detected, checking authentication:', request.nextUrl.pathname)

  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check session
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session check result:', session ? 'Authenticated' : 'Not authenticated')

    // If no session and not a public path, redirect to login
    if (!session && !isPublicPath) {
      console.log('Redirecting unauthenticated user to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // On error, allow the request to proceed rather than breaking the site
    // This makes the site more resilient to auth service disruptions
  }

  return response
}

// See "Matching Paths" below to learn more
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
} 