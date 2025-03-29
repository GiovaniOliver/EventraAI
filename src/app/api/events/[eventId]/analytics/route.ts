import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  const supabase = createServerClient();

  try {
    // Fetch analytics data for the event
    const { data, error } = await supabase
      .from('event_analytics')
      .select('*')
      .eq('event_id', eventId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event analytics' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  const supabase = createServerClient();
  
  try {
    const body = await request.json();
    
    // Add event_id from path parameter
    const analyticsData = {
      ...body,
      event_id: eventId,
    };
    
    // Insert analytics data
    const { data, error } = await supabase
      .from('event_analytics')
      .insert(analyticsData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating event analytics:', error);
    return NextResponse.json(
      { error: 'Failed to create event analytics' },
      { status: 500 }
    );
  }
} 