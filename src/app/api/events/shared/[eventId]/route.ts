import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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
  
  try {
    // Get event details - only fetch publicly shareable fields
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        type,
        format,
        date,
        start_date,
        end_date,
        location,
        estimated_guests,
        status
      `)
      .eq('id', eventId)
      .single()
    
    if (error) {
      console.error('Error fetching event:', error)
      return NextResponse.json(
        { error: 'Failed to fetch event details' },
        { status: 500 }
      )
    }
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Only return events that are confirmed and not in draft status
    if (event.status === 'draft') {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Return the event details
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error in shared event API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 