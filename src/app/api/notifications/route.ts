import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Get user's notifications
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') // 'unread', 'read', or null for all
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  // Create Supabase client
  const supabase = createServerClient()
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    // Build query
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
    
    // Execute query
    const { data: notifications, error } = await query
    
    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }
    
    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('status', 'unread')
    
    if (countError) {
      console.error('Error getting unread count:', countError)
    }
    
    return NextResponse.json({
      notifications,
      unreadCount: unreadCount || 0
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Mark notifications as read
export async function PUT(request: NextRequest) {
  // Create Supabase client
  const supabase = createServerClient()
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    const { notificationIds } = await request.json()
    
    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      )
    }
    
    // Use the database function to mark notifications as read
    const { data, error } = await supabase
      .rpc('mark_notifications_as_read', {
        notification_ids: notificationIds
      })
    
    if (error) {
      console.error('Error marking notifications as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark notifications as read' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      updatedNotifications: data
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 