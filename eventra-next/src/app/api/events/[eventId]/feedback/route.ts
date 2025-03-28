import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  const supabase = createServerClient();

  try {
    // Fetch feedback data for the event
    const { data, error } = await supabase
      .from('attendee_feedback')
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
    console.error('Error fetching event feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event feedback' },
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
    const feedbackData = {
      ...body,
      event_id: eventId,
    };
    
    // Insert feedback data
    const { data, error } = await supabase
      .from('attendee_feedback')
      .insert(feedbackData)
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
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
} 