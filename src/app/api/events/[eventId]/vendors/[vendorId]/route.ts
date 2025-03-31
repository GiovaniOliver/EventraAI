import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * DELETE /api/events/:id/vendors/:vendorId - Remove vendor from event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string, vendorId: string } }
) {
  const supabase = createServerClient()
  const { eventId, vendorId } = params
  
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
    
    // Check if event vendor exists
    const { data: eventVendor, error: vendorError } = await supabase
      .from('event_vendors')
      .select('id')
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
      .maybeSingle()
    
    if (vendorError || !eventVendor) {
      return NextResponse.json(
        { error: 'Vendor not found for this event' },
        { status: 404 }
      )
    }
    
    // Remove vendor from event
    const { error } = await supabase
      .from('event_vendors')
      .delete()
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing vendor from event:', error)
    return NextResponse.json(
      { error: 'Failed to remove vendor from event' },
      { status: 500 }
    )
  }
} 