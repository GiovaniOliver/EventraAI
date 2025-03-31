import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

// API to track event shares and generate sharing statistics
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId
  
  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    )
  }
  
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
    // Get share data from request
    const { platform, shareType = 'link' } = await request.json()
    
    // Track the share event
    const { data, error } = await supabase
      .from('event_shares')
      .insert({
        event_id: eventId,
        user_id: session.user.id,
        platform: platform || 'direct',
        share_type: shareType,
      })
      .select()
    
    if (error) {
      console.error('Error tracking share:', error)
      return NextResponse.json(
        { error: 'Failed to track share' },
        { status: 500 }
      )
    }
    
    // Get share statistics - using simple select without complex grouping
    const { data: shareData, error: statsError } = await supabase
      .from('event_shares')
      .select('platform, share_type')
      .eq('event_id', eventId)
    
    if (statsError) {
      console.error('Error getting share stats:', statsError)
      return NextResponse.json(
        { success: true, message: 'Share tracked successfully', data }
      )
    }
    
    // Process stats to group by platform
    const groupedStats = shareData.reduce((acc: Record<string, number>, curr) => {
      const platform = curr.platform || 'direct'
      if (!acc[platform]) {
        acc[platform] = 0
      }
      acc[platform] += 1
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully',
      data,
      stats: groupedStats
    })
  } catch (error) {
    console.error('Error processing share:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// API to get share statistics for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId
  
  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    )
  }
  
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
    // Check if user owns or has access to this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single()
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      )
    }
    
    if (event.owner_id !== session.user.id) {
      // Check if user is on the event team
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select()
        .eq('event_id', eventId)
        .eq('user_id', session.user.id)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }
    
    // Get share statistics
    const { data: shareData, error: statsError } = await supabase
      .from('event_shares')
      .select('platform, share_type')
      .eq('event_id', eventId)
    
    if (statsError) {
      console.error('Error getting share stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to get share statistics' },
        { status: 500 }
      )
    }
    
    // Process stats to group by platform
    const stats = shareData.reduce((acc: Record<string, number>, curr) => {
      const platform = curr.platform || 'direct'
      if (!acc[platform]) {
        acc[platform] = 0
      }
      acc[platform] += 1
      return acc
    }, {})
    
    // Get views count from event_views table
    const { data: viewsData, error: viewsError } = await supabase
      .from('event_views')
      .select('count')
      .eq('event_id', eventId)
      .single()
    
    const views = viewsError ? 0 : (viewsData?.count || 0)
    
    return NextResponse.json({
      success: true,
      stats,
      views,
      totalShares: shareData.length
    })
  } catch (error) {
    console.error('Error getting share stats:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 