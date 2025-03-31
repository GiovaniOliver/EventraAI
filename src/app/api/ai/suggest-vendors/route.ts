import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/ai/suggest-vendors - Get AI suggestions for vendors based on event details
 */
export async function POST(request: NextRequest) {
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
    
    // Get request data
    const {
      eventId,
      eventType,
      guestCount,
      budget,
      location,
      preferences = []
    } = await request.json()
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }
    
    // If eventId is provided, check if user has access to it
    if (eventId) {
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
    }
    
    // Start by getting all approved vendors
    let vendorQuery = supabase
      .from('vendors')
      .select('*')
      .eq('is_approved', true)
    
    // Apply filters based on the event type
    if (eventType) {
      // Each event type might have relevant vendor categories
      const categoryMapping: Record<string, string[]> = {
        'wedding': ['catering', 'photography', 'venue', 'florist', 'music', 'cake'],
        'corporate': ['venue', 'catering', 'av-equipment', 'transportation'],
        'birthday': ['venue', 'catering', 'entertainment', 'decoration'],
        'conference': ['venue', 'catering', 'av-equipment', 'printing'],
        'festival': ['venue', 'sound', 'security', 'catering', 'stage']
      }
      
      const relevantCategories = categoryMapping[eventType.toLowerCase()] || []
      if (relevantCategories.length > 0) {
        vendorQuery = vendorQuery.in('category', relevantCategories)
      }
    }
    
    // Execute vendor query to get all potential vendors
    const { data: vendors, error: vendorError } = await vendorQuery
    
    if (vendorError) {
      return NextResponse.json(
        { error: vendorError.message },
        { status: 500 }
      )
    }
    
    if (!vendors || vendors.length === 0) {
      return NextResponse.json(
        { error: 'No vendors found matching the criteria' },
        { status: 404 }
      )
    }
    
    // Perform vendor ranking and selection logic
    // This is where more sophisticated AI models would be integrated
    // For now, we'll use a simple scoring system
    
    const scoredVendors = vendors.map(vendor => {
      let score = 0
      
      // Preferred partners get a boost
      if (vendor.is_partner) {
        score += 20
      }
      
      // Higher rated vendors get a boost
      if (vendor.rating) {
        score += vendor.rating * 5 // 0-50 points based on 0-10 rating
      }
      
      // Vendors that match user preferences get a boost
      if (preferences && preferences.length > 0) {
        for (const pref of preferences) {
          if (vendor.tags && vendor.tags.includes(pref)) {
            score += 10
          }
        }
      }
      
      // Boost local vendors if location provided
      if (location && vendor.location && vendor.location.includes(location)) {
        score += 15
      }
      
      return {
        ...vendor,
        score
      }
    })
    
    // Sort vendors by score and category
    const sortedVendors = scoredVendors.sort((a, b) => b.score - a.score)
    
    // Group vendors by category
    const groupedVendors: Record<string, any[]> = {}
    
    for (const vendor of sortedVendors) {
      const category = vendor.category || 'other'
      if (!groupedVendors[category]) {
        groupedVendors[category] = []
      }
      
      groupedVendors[category].push(vendor)
    }
    
    // Take top vendors from each category
    const suggestedVendors: Record<string, any[]> = {}
    
    for (const [category, vendors] of Object.entries(groupedVendors)) {
      // Limit to top 3 vendors per category
      suggestedVendors[category] = vendors.slice(0, 3)
    }
    
    // Log this suggestion for analytics
    await supabase
      .from('ai_suggestions')
      .insert({
        user_id: userId,
        event_id: eventId || null,
        suggestion_type: 'vendors',
        input_data: {
          eventType,
          guestCount,
          budget,
          location,
          preferences
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      suggestedVendors,
      totalSuggestions: Object.values(suggestedVendors).flat().length
    })
  } catch (error: any) {
    console.error('Error getting vendor suggestions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get vendor suggestions' },
      { status: 500 }
    )
  }
} 