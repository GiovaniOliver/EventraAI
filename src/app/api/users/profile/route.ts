import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/users/profile - Get current user profile
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Fetch user profile data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/profile - Update user profile
 */
export async function PUT(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const updateData = await request.json()
    
    // Remove any fields that shouldn't be updated directly
    const { id, created_at, subscription_tier, subscription_status, ...safeUpdateData } = updateData
    
    // Update the profile
    const { data, error } = await supabase
      .from('users')
      .update(safeUpdateData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
} 