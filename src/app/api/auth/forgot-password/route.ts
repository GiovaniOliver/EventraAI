import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/auth/forgot-password - Request password reset
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Verify email exists in the system
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    
    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }
    
    if (!userExists) {
      // Return success even if email doesn't exist for security
      return NextResponse.json({
        success: true,
        message: 'If your email exists in our system, you will receive a reset link shortly'
      })
    }
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    })
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: 'Unable to send password reset email' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'If your email exists in our system, you will receive a reset link shortly'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
} 