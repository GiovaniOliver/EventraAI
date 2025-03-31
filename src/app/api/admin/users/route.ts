import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/admin/users - Get all users with pagination and filtering (admin only)
 */
export async function GET(request: NextRequest) {
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
    
    const userId = session.user.id
    
    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const role = searchParams.get('role') || null
    const status = searchParams.get('status') || null
    const search = searchParams.get('search') || null
    const subscription = searchParams.get('subscription') || null
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        status,
        created_at,
        last_login,
        events_count:events(count),
        current_subscription:subscriptions(
          id,
          plan_id,
          status,
          current_period_end
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (role) {
      query = query.eq('role', role)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    if (subscription) {
      query = query.eq('subscriptions.status', subscription)
    }
    
    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)
    
    // Execute query
    const { data: users, error: usersError, count } = await query
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
    
    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0
    
    // Format user data to clean up nested objects
    const formattedUsers = users.map(user => {
      // Extract current subscription if exists
      const subscription = user.current_subscription && user.current_subscription.length > 0
        ? user.current_subscription[0]
        : null
      
      // Remove the array and replace with single object
      const { current_subscription, ...userData } = user
      
      return {
        ...userData,
        current_subscription: subscription
      }
    })
    
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error in admin users endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 