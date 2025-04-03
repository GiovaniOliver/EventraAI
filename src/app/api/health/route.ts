import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

/**
 * Health check endpoint that returns:
 * - API status
 * - Authentication status
 * - Environment information
 */
export async function GET(req: NextRequest) {
  try {
    // Create a Supabase client for this request
    const cookieStore = await cookies()
    
    const supabase = createServerClient(cookieStore)
    
    // Check if the request is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check if important environment variables are set
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      appName: !!process.env.NEXT_PUBLIC_APP_NAME,
    }
    
    // Return health information
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      auth: {
        authenticated: !!session,
        hasError: !!sessionError,
      },
      environment: envStatus,
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }
} 