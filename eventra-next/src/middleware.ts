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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase credentials are properly configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://example.supabase.co') {
    console.warn('Supabase credentials not properly configured. Skipping authentication check.');
    return response;
  }

  try {
    // Create a Supabase client for server-side usage
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the URL path
    const path = request.nextUrl.pathname

    // Function to check if the current path matches any of the patterns in the array
    const matchesPattern = (patterns: string[]) => {
      return patterns.some((pattern) => {
        // If the pattern includes a wildcard (*), treat it as a prefix match
        if (pattern.includes('*')) {
          const prefix = pattern.replace('*', '')
          return path.startsWith(prefix)
        }
        // Otherwise, check for an exact match or if it's a dynamic route segment
        return path === pattern || path.startsWith(`${pattern}/`)
      })
    }

    // Check if the current path is a protected route
    const isProtectedRoute = matchesPattern(protectedRoutes)
    // Check if the current path is a public route
    const isPublicRoute = matchesPattern(publicRoutes)

    // Check if the current path is an API route
    const isApiRoute = path.startsWith('/api/')

    // If it's a protected route and there's no session, redirect to the login page
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // If it's an API route that's not meant to be public, check for authentication
    if (isApiRoute && !path.startsWith('/api/public/') && !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error in middleware:', error);
    // Fall through to return the response
  }

  // For all other routes, continue with the request
  return response
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