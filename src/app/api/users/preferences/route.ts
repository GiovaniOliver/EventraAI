import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/users/preferences - Get current user preferences
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
    
    // Fetch user preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // If no preferences exist yet, return default values
    if (!data) {
      return NextResponse.json({
        user_id: userId,
        preferred_themes: [],
        preferred_event_types: [],
        notifications_enabled: true,
        onboarding_completed: false
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/preferences - Update user preferences
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
    const { id, created_at, ...safeUpdateData } = updateData
    
    // Set the user_id to the current user
    safeUpdateData.user_id = userId
    safeUpdateData.updated_at = new Date().toISOString()
    
    // Check if preferences already exist
    const { data: existingPreferences } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    
    let result
    
    if (existingPreferences?.id) {
      // Update existing preferences
      result = await supabase
        .from('user_preferences')
        .update(safeUpdateData)
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Create new preferences
      result = await supabase
        .from('user_preferences')
        .insert(safeUpdateData)
        .select()
        .single()
    }
    
    const { data, error } = result
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    )
  }
} 