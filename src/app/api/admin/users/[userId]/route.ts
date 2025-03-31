import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/admin/users/[userId] - Get detailed user information (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const targetUserId = params.userId
  const supabase = createServerClient()
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const adminId = session.user.id
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()
    
    if (adminError || !adminData || adminData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get user details with related data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        events(count),
        teams:event_team(count),
        subscriptions(
          id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          subscription_plans(
            name,
            description,
            features
          )
        ),
        preferences(*)
      `)
      .eq('id', targetUserId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get recent login history
    const { data: loginHistory, error: loginHistoryError } = await supabase
      .from('auth_activity_log')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get recent admin actions
    const { data: adminActions, error: adminActionsError } = await supabase
      .from('admin_activity_log')
      .select('*')
      .eq('entity_type', 'user')
      .eq('entity_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Format user data
    const userData = {
      ...user,
      login_history: loginHistory || [],
      admin_actions: adminActions || []
    }
    
    return NextResponse.json(userData)
  } catch (error: any) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[userId] - Update user information (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const targetUserId = params.userId
  const supabase = createServerClient()
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const adminId = session.user.id
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()
    
    if (adminError || !adminData || adminData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Check if target user exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()
    
    if (existingUserError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get request data
    const requestData = await request.json()
    
    // List of fields that can be updated by admin
    const allowedFields = [
      'first_name',
      'last_name',
      'role',
      'status',
      'email_verified',
      'notes'
    ]
    
    // Filter out fields that cannot be updated
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (field in requestData) {
        updateData[field] = requestData[field]
      }
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()
    
    // Only set status if provided
    if (requestData.status && ['active', 'suspended', 'deactivated'].includes(requestData.status)) {
      updateData.status = requestData.status
    }
    
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
    
    // Log admin action
    await supabase
      .from('admin_activity_log')
      .insert({
        user_id: adminId,
        action_type: 'user_update',
        entity_type: 'user',
        entity_id: targetUserId,
        details: {
          changes: Object.keys(updateData).filter(k => k !== 'updated_at'),
          previous_status: existingUser.status,
          new_status: updateData.status || existingUser.status
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 