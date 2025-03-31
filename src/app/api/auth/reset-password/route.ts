import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/auth/reset-password - Reset user password
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    
    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
} 