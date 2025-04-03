import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Get user's notifications
export async function GET(request: NextRequest) {
  console.log('[DEBUG API] GET /api/notifications request received')
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') // 'unread', 'read', or null for all
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  // Create Supabase client with error handling
  let supabase;
  try {
    supabase = createServerClient()
    console.log('[DEBUG API] Supabase client created successfully')
  } catch (clientError) {
    console.error('[DEBUG API] Error creating Supabase client:', clientError)
    return NextResponse.json(
      { error: 'Database connection error', details: clientError instanceof Error ? clientError.message : 'Unknown error' },
      { status: 500 }
    )
  }
  
  // Get user session with explicit error handling
  let session;
  try {
    const sessionResult = await supabase.auth.getSession()
    session = sessionResult.data.session
    console.log('[DEBUG API] Session check result:', session ? 'Authenticated' : 'Not authenticated')
  } catch (sessionError) {
    console.error('[DEBUG API] Error getting session:', sessionError)
    return NextResponse.json(
      { error: 'Authentication service error', details: sessionError instanceof Error ? sessionError.message : 'Unknown error' },
      { status: 500 }
    )
  }
  
  if (!session?.user) {
    console.log('[DEBUG API] No authenticated user found')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // Log authenticated user details
  console.log('[DEBUG API] Authenticated user:', session.user.id)
  
  try {
    // Build query with better error handling
    console.log('[DEBUG API] Building notifications query with params:', { 
      userId: session.user.id, 
      status: status || 'all', 
      limit, 
      offset 
    })
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add status filter if provided
    if (status) {
      query = query.eq('status', status)
    }
    
    // Execute query with timeout handling
    let queryPromise = query;
    
    // Add a timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database query timed out after 5000ms'))
      }, 5000)
    })
    
    // Execute the query with a timeout
    const { data: notifications, error } = await Promise.race([
      queryPromise,
      timeoutPromise.then(() => { throw new Error('Query timed out') })
    ]) as any;
    
    if (error) {
      console.error('[DEBUG API] Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('[DEBUG API] Successfully fetched notifications:', notifications?.length || 0)
    
    // Get unread count with similar timeout protection
    const unreadCountPromise = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('status', 'unread')
    
    let unreadCount = 0
    try {
      const { count, error: countError } = await Promise.race([
        unreadCountPromise,
        timeoutPromise.then(() => { throw new Error('Unread count query timed out') })
      ]) as any;
      
      if (countError) {
        console.error('[DEBUG API] Error getting unread count:', countError)
      } else {
        unreadCount = count || 0
        console.log('[DEBUG API] Unread count:', unreadCount)
      }
    } catch (countError) {
      console.error('[DEBUG API] Error getting unread count:', countError)
      // Continue despite count error - we'll just return 0
    }
    
    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    })
  } catch (error) {
    console.error('[DEBUG API] Unexpected error in notifications API:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Mark notifications as read
export async function PUT(request: NextRequest) {
  console.log('[DEBUG API] PUT /api/notifications request received')
  
  // Create Supabase client with error handling
  let supabase;
  try {
    supabase = createServerClient()
    console.log('[DEBUG API] Supabase client created successfully')
  } catch (clientError) {
    console.error('[DEBUG API] Error creating Supabase client:', clientError)
    return NextResponse.json(
      { error: 'Database connection error', details: clientError instanceof Error ? clientError.message : 'Unknown error' },
      { status: 500 }
    )
  }
  
  // Get user session with explicit error handling
  let session;
  try {
    const sessionResult = await supabase.auth.getSession()
    session = sessionResult.data.session
    console.log('[DEBUG API] Session check result:', session ? 'Authenticated' : 'Not authenticated')
  } catch (sessionError) {
    console.error('[DEBUG API] Error getting session:', sessionError)
    return NextResponse.json(
      { error: 'Authentication service error', details: sessionError instanceof Error ? sessionError.message : 'Unknown error' },
      { status: 500 }
    )
  }
  
  if (!session?.user) {
    console.log('[DEBUG API] No authenticated user found')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    let body;
    try {
      body = await request.json()
      console.log('[DEBUG API] Request body parsed successfully')
    } catch (parseError) {
      console.error('[DEBUG API] Error parsing request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Could not parse JSON body' },
        { status: 400 }
      )
    }
    
    const { notificationIds } = body
    
    if (!Array.isArray(notificationIds)) {
      console.error('[DEBUG API] Invalid notificationIds format:', notificationIds)
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      )
    }
    
    // Add timeout for database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database operation timed out after 5000ms'))
      }, 5000)
    })
    
    // Use the database function to mark notifications as read with timeout
    const databasePromise = supabase.rpc('mark_notifications_as_read', {
      notification_ids: notificationIds
    })
    
    const { data, error } = await Promise.race([
      databasePromise,
      timeoutPromise.then(() => { throw new Error('RPC operation timed out') })
    ]) as any
    
    if (error) {
      console.error('[DEBUG API] Error marking notifications as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark notifications as read', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('[DEBUG API] Successfully marked notifications as read:', notificationIds.length)
    
    return NextResponse.json({
      success: true,
      updatedNotifications: data
    })
  } catch (error) {
    console.error('[DEBUG API] Unexpected error in notifications API:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}