import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/events/:id/guests - List guests for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createServerClient()
  const { eventId } = params
  
  try {
    // Verify event exists and user has access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check event access
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('owner_id', userId)
      .maybeSingle()
    
    // Also check if user is a team member for this event
    const { data: teamMember, error: teamError } = await supabase
      .from('event_team')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if ((eventError || !event) && (teamError || !teamMember)) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized access' },
        { status: 404 }
      )
    }
    
    // Get guests
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    
    if (guestsError) {
      return NextResponse.json(
        { error: guestsError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/:id/guests - Add a guest
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createServerClient()
  const { eventId } = params
  
  try {
    // Verify event exists and user has access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check event access (owner or team member)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('owner_id', userId)
      .maybeSingle()
    
    const { data: teamMember, error: teamError } = await supabase
      .from('event_team')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if ((eventError || !event) && (teamError || !teamMember)) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized access' },
        { status: 404 }
      )
    }
    
    // Get guest data from body
    const guestData = await request.json()
    
    // Validate required fields
    if (!guestData.name || !guestData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    // Check if guest already exists
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', guestData.email)
      .maybeSingle()
    
    if (existingGuest) {
      return NextResponse.json(
        { error: 'Guest with this email already exists for this event' },
        { status: 400 }
      )
    }
    
    // Add guest
    const { data, error } = await supabase
      .from('guests')
      .insert({
        event_id: eventId,
        name: guestData.name,
        email: guestData.email,
        status: guestData.status || 'invited'
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding guest:', error)
    return NextResponse.json(
      { error: 'Failed to add guest' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/events/:id/guests/:guestId - Update guest status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string, guestId: string } }
) {
  const supabase = createServerClient()
  const { eventId } = params
  const guestId = request.nextUrl.pathname.split('/').pop()
  
  if (!guestId) {
    return NextResponse.json(
      { error: 'Guest ID is required' },
      { status: 400 }
    )
  }
  
  try {
    // Verify event exists and user has access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check event access (owner or team member)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('owner_id', userId)
      .maybeSingle()
    
    const { data: teamMember, error: teamError } = await supabase
      .from('event_team')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if ((eventError || !event) && (teamError || !teamMember)) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized access' },
        { status: 404 }
      )
    }
    
    // Get update data from body
    const updateData = await request.json()
    
    // Update guest
    const { data, error } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guestId)
      .eq('event_id', eventId)
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
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Failed to update guest' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/:id/guests/:guestId - Remove a guest
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string, guestId: string } }
) {
  const supabase = createServerClient()
  const { eventId } = params
  const guestId = request.nextUrl.pathname.split('/').pop()
  
  if (!guestId) {
    return NextResponse.json(
      { error: 'Guest ID is required' },
      { status: 400 }
    )
  }
  
  try {
    // Verify event exists and user has access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check event access (owner or team member)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('owner_id', userId)
      .maybeSingle()
    
    const { data: teamMember, error: teamError } = await supabase
      .from('event_team')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if ((eventError || !event) && (teamError || !teamMember)) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized access' },
        { status: 404 }
      )
    }
    
    // Delete guest
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)
      .eq('event_id', eventId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing guest:', error)
    return NextResponse.json(
      { error: 'Failed to remove guest' },
      { status: 500 }
    )
  }
} 