import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Event } from '@/lib/supabase'

// GET all events
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const searchParams = request.nextUrl.searchParams
  
  // Get filter parameters
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  
  try {
    // Start building the query
    let query = supabase.from('events').select('*')
    
    // Apply filters if provided
    if (userId) {
      query = query.eq('owner_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false })
    
    // Execute the query
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST new event
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const eventData = await request.json()
    
    // Validate required fields
    if (!eventData.title || !eventData.owner_id) {
      return NextResponse.json(
        { error: 'Title and owner_id are required' },
        { status: 400 }
      )
    }
    
    // Set default values for new event
    const now = new Date().toISOString()
    const newEvent: Partial<Event> = {
      ...eventData,
      status: eventData.status || 'draft',
      created_at: now,
      updated_at: now
    }
    
    // Insert the new event
    const { data, error } = await supabase
      .from('events')
      .insert(newEvent)
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
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 