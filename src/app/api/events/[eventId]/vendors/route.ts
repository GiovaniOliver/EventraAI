import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/events/:id/vendors - List vendors for an event
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
    
    // Get event vendors with vendor details
    const { data, error } = await supabase
      .from('event_vendors')
      .select(`
        id,
        status,
        budget,
        notes,
        created_at,
        vendor:vendor_id (
          id,
          name,
          category,
          description,
          contact_email,
          contact_phone,
          website,
          is_partner,
          logo,
          services,
          rating
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching event vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event vendors' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/:id/vendors - Add vendor to event
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
    
    // Get vendor data from body
    const { vendorId, budget = null, notes = null, status = 'pending' } = await request.json()
    
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      )
    }
    
    // Check if vendor exists
    const { data: vendorExists, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .single()
    
    if (vendorError || !vendorExists) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    // Check if vendor is already added to this event
    const { data: existingVendor } = await supabase
      .from('event_vendors')
      .select('id')
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
      .maybeSingle()
    
    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor is already added to this event' },
        { status: 400 }
      )
    }
    
    // Add vendor to event
    const { data, error } = await supabase
      .from('event_vendors')
      .insert({
        event_id: eventId,
        vendor_id: vendorId,
        status,
        budget,
        notes
      })
      .select(`
        id,
        status,
        budget,
        notes,
        created_at,
        vendor:vendor_id (
          id,
          name,
          category,
          description,
          contact_email,
          contact_phone,
          website,
          is_partner,
          logo,
          services,
          rating
        )
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding vendor to event:', error)
    return NextResponse.json(
      { error: 'Failed to add vendor to event' },
      { status: 500 }
    )
  }
} 