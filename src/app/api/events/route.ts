import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, AuthUser, hasSubscriptionAccess } from '@/lib/auth-middleware';
import { z } from 'zod';

// Validation schema for event creation/updates
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'Event type is required'),
  format: z.string().default('in-person'),
  description: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_guests: z.number().positive().optional(),
  budget: z.number().nonnegative().optional(),
  status: z.string().default('draft'),
});

// GET all events
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  const supabase = createServerClient();
  const searchParams = request.nextUrl.searchParams;
  
  // Parse query parameters
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const userId = searchParams.get('userId') || user.id;
  
  // Check if user is requesting someone else's events (only admins can do this)
  if (userId !== user.id && !user.is_admin) {
    return NextResponse.json(
      { error: 'You do not have permission to view these events' },
      { status: 403 }
    );
  }
  
  try {
    // Check subscription limits for number of events
    if (!user.is_admin) {
      const hasAccess = await hasSubscriptionAccess('events', user);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Your subscription does not include event management' },
          { status: 403 }
        );
      }
      
      // Check if user has reached their event limit
      const { count: eventCount, error: countError } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id);
      
      // Get user's event limit based on subscription tier
      const tierLimits: Record<string, number | null> = {
        'free': 3,
        'starter': 10,
        'pro': null, // unlimited
        'business': null, // unlimited
        'enterprise': null // unlimited
      };
      
      const tier = user.subscription_tier || 'free';
      const eventLimit = tierLimits[tier];
      
      if (eventLimit !== null && (eventCount || 0) >= eventLimit) {
        return NextResponse.json(
          { 
            error: 'Event limit reached', 
            message: `Your ${tier} plan allows a maximum of ${eventLimit} events. Please upgrade your subscription to create more events.` 
          },
          { status: 403 }
        );
      }
    }
    
    // Start building the query
    let query = supabase.from('events').select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (userId) {
      query = query.eq('owner_id', userId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Return the data with pagination info
    return NextResponse.json({ 
      events: data,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
});

// POST new event
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  const supabase = createServerClient();
  
  try {
    const requestData = await request.json();
    
    // Validate the input data
    const validationResult = eventSchema.safeParse(requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 422 }
      );
    }
    
    const eventData = validationResult.data;
    
    // Check subscription limits for number of events
    if (!user.is_admin) {
      const hasAccess = await hasSubscriptionAccess('events', user);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Your subscription does not include event creation' },
          { status: 403 }
        );
      }
      
      // Check if user has reached their event limit
      const { count: eventCount, error: countError } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id);
      
      // Get user's event limit based on subscription tier
      const tierLimits: Record<string, number | null> = {
        'free': 3,
        'starter': 10,
        'pro': null, // unlimited
        'business': null, // unlimited
        'enterprise': null // unlimited
      };
      
      const tier = user.subscription_tier || 'free';
      const eventLimit = tierLimits[tier];
      
      if (eventLimit !== null && (eventCount || 0) >= eventLimit) {
        return NextResponse.json(
          { 
            error: 'Event limit reached', 
            message: `Your ${tier} plan allows a maximum of ${eventLimit} events. Please upgrade your subscription to create more events.` 
          },
          { status: 403 }
        );
      }
    }
    
    // Prepare the event data
    const now = new Date().toISOString();
    const newEvent = {
      ...eventData,
      owner_id: user.id,
      created_at: now,
      updated_at: now
    };
    
    // Insert the new event
    const { data, error } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
});
