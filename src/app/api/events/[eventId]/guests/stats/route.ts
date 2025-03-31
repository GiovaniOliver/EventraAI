import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: {
    eventId: string
  }
}

interface StatItem {
  rsvp_status: string | null
  invitation_status: string | null
  category: string | null
  count: number
}

/**
 * GET /api/events/:id/guests/stats - Get guest statistics
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const eventId = params.eventId
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
    
    // Check if event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }
    
    // Check if user has access to the event
    if (event.user_id !== userId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to view guest statistics for this event' },
          { status: 403 }
        )
      }
    }
    
    // Get total count of guests
    const { count: totalGuests, error: countError } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    
    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      )
    }
    
    // Using raw SQL queries instead of .group() which might not be properly typed
    // Get response statistics
    const { data: responseStats, error: responseError } = await supabase
      .rpc('get_rsvp_stats', { event_id_param: eventId })
    
    if (responseError) {
      return NextResponse.json(
        { error: responseError.message },
        { status: 500 }
      )
    }
    
    // Get invitation statistics
    const { data: invitationStats, error: invitationError } = await supabase
      .rpc('get_invitation_stats', { event_id_param: eventId })
    
    if (invitationError) {
      return NextResponse.json(
        { error: invitationError.message },
        { status: 500 }
      )
    }
    
    // Get category statistics
    const { data: categoryStats, error: categoryError } = await supabase
      .rpc('get_category_stats', { event_id_param: eventId })
    
    if (categoryError) {
      return NextResponse.json(
        { error: categoryError.message },
        { status: 500 }
      )
    }
    
    // Calculate response rates
    const attending = responseStats?.find((stat: StatItem) => stat.rsvp_status === 'attending')?.count || 0
    const declined = responseStats?.find((stat: StatItem) => stat.rsvp_status === 'declined')?.count || 0
    const tentative = responseStats?.find((stat: StatItem) => stat.rsvp_status === 'tentative')?.count || 0
    const noResponse = responseStats?.find((stat: StatItem) => stat.rsvp_status === null)?.count || 0
    
    // Calculate invitation sent rates
    const sent = invitationStats?.find((stat: StatItem) => stat.invitation_status === 'sent')?.count || 0
    const notSent = invitationStats?.find((stat: StatItem) => stat.invitation_status === null || stat.invitation_status === 'not_sent')?.count || 0
    const failed = invitationStats?.find((stat: StatItem) => stat.invitation_status === 'failed')?.count || 0
    
    // Process category stats
    const categories = categoryStats?.map((stat: StatItem) => ({
      name: stat.category || 'Uncategorized',
      count: stat.count
    })) || []
    
    // Format the statistics
    const stats = {
      total: totalGuests || 0,
      responses: {
        attending,
        declined,
        tentative,
        noResponse,
        responseRate: totalGuests ? Math.round(((attending + declined + tentative) / totalGuests) * 100) : 0
      },
      invitations: {
        sent,
        notSent,
        failed,
        sentRate: totalGuests ? Math.round((sent / totalGuests) * 100) : 0
      },
      categories
    }
    
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching guest statistics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch guest statistics' },
      { status: 500 }
    )
  }
} 