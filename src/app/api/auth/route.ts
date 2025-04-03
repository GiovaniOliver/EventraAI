import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Supabase Auth API Routes
 * 
 * These routes handle Supabase authentication operations including:
 * - Sign in with email/password
 * - User registration  
 * - Sign out
 * - Session management
 * - User profile retrieval
 * 
 * All authentication is handled through Supabase Auth.
 */

// Helper function to get the path from the request
function getPathFromRequest(request: NextRequest): string {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/auth/', '')
  return path;
}

// POST handler for all auth routes
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const path = getPathFromRequest(request)
  
  try {
    const body = await request.json()
    
    // Handle different auth endpoints
    switch (path) {
      case 'signin': 
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: body.email,
          password: body.password,
        })
        
        if (signinError) throw signinError
        return NextResponse.json(signinData)
        
      case 'signup':
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: body.email,
          password: body.password,
          options: {
            data: body.metadata || {}
          }
        })
        
        if (signupError) throw signupError
        
        // Create user profile if signup was successful
        if (signupData.user) {
          // Check if we need to create a user profile
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', signupData.user.id)
            .maybeSingle()
            
          if (!profileData && !profileError) {
            // Create user profile
            await supabase.from('users').insert({
              id: signupData.user.id,
              email: body.email,
              username: body.email.split('@')[0],
              display_name: body.metadata?.name || body.email.split('@')[0],
              is_admin: false,
              subscription_tier: 'free',
              subscription_status: 'active',
              created_at: new Date().toISOString()
            })
          }
        }
        
        return NextResponse.json(signupData)
        
      case 'signout':
        const { error: signoutError } = await supabase.auth.signOut()
        if (signoutError) throw signoutError
        return NextResponse.json({ success: true })
        
      case 'session':
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        return NextResponse.json(sessionData)
        
      default:
        return NextResponse.json(
          { error: 'Unsupported auth endpoint' },
          { status: 404 }
        )
    }
  } catch (error) {
    console.error(`Auth API error (${path}):`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication error' },
      { status: 500 }
    )
  }
}

// GET handler for session and other read-only operations
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const path = getPathFromRequest(request)
  
  try {
    switch (path) {
      case 'session':
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return NextResponse.json(data)
        
      case 'user':
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        return NextResponse.json(userData)
        
      default:
        return NextResponse.json(
          { error: 'Unsupported auth endpoint' },
          { status: 404 }
        )
    }
  } catch (error) {
    console.error(`Auth API error (${path}):`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication error' },
      { status: 500 }
    )
  }
} 