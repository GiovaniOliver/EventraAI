import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest
) {
  try {
    // Get data from request
    const { eventId, referrer = 'direct' } = await request.json()
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    // Create Supabase client
    const supabase = createServerClient()
    
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // First try to update existing record
    const { data: viewRecord, error: viewError } = await supabase
      .from('event_views')
      .select()
      .eq('event_id', eventId)
      .single()
    
    if (viewError && viewError.code !== 'PGRST116') { // PGRST116 = "No rows found"
      console.error('Error checking view record:', viewError)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }
    
    let result
    
    if (viewRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('event_views')
        .update({
          count: viewRecord.count + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .select()
      
      if (error) {
        console.error('Error updating view count:', error)
        return NextResponse.json(
          { error: 'Failed to update view count' },
          { status: 500 }
        )
      }
      
      result = data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('event_views')
        .insert({
          event_id: eventId,
          count: 1,
          last_viewed_at: new Date().toISOString(),
        })
        .select()
      
      if (error) {
        console.error('Error creating view record:', error)
        return NextResponse.json(
          { error: 'Failed to create view record' },
          { status: 500 }
        )
      }
      
      result = data
    }
    
    // Get the IP address from headers (more reliable than request.ip in Next.js)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(/, /)[0] : 'unknown'
    
    // Also log individual view with IP info (for analytics)
    const { error: logError } = await supabase
      .from('event_view_logs')
      .insert({
        event_id: eventId,
        referrer,
        ip_hash: hashIp(ip),
        user_agent: request.headers.get('user-agent') || '',
      })
    
    if (logError) {
      console.error('Error logging view details:', logError)
      // Continue even if logging view details fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      data: result
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Simple function to hash IP addresses for privacy
function hashIp(ip: string): string {
  // In a real implementation, use a proper hashing function
  // This is just a simple example
  return Buffer.from(ip).toString('base64').substring(0, 10)
} 