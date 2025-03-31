import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/admin/vendors - Get all vendors with pagination and filtering (admin only)
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
    const status = searchParams.get('status') || null
    const verified = searchParams.get('verified') || null
    const category = searchParams.get('category') || null
    const search = searchParams.get('search') || null
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('vendors')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (verified !== null) {
      query = query.eq('is_verified', verified === 'true')
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }
    
    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)
    
    // Execute query
    const { data: vendors, error: vendorsError, count } = await query
    
    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError)
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      )
    }
    
    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0
    
    return NextResponse.json({
      vendors,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error in admin vendors endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 