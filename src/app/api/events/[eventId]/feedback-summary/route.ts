import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { FeedbackSummary } from '@/lib/analytics-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  const supabase = createServerClient();

  try {
    // Fetch all feedback for the event
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

    // If no feedback, return default values
    if (!data || data.length === 0) {
      return NextResponse.json({
        averageOverallRating: 0,
        averageContentRating: 0,
        averageTechnicalRating: 0,
        averageEngagementRating: 0,
        recommendationPercentage: 0,
        totalFeedbackCount: 0
      });
    }

    // Calculate summary statistics
    const totalFeedbackCount = data.length;
    
    const averageOverallRating = data.reduce((sum, item) => sum + (item.overall_rating || 0), 0) / totalFeedbackCount;
    
    // For these fields, we need to count only items that have the value
    const contentRatings = data.filter(item => item.content_rating !== null && item.content_rating !== undefined);
    const averageContentRating = contentRatings.length > 0
      ? contentRatings.reduce((sum, item) => sum + (item.content_rating || 0), 0) / contentRatings.length
      : 0;
    
    const technicalRatings = data.filter(item => item.technical_rating !== null && item.technical_rating !== undefined);
    const averageTechnicalRating = technicalRatings.length > 0
      ? technicalRatings.reduce((sum, item) => sum + (item.technical_rating || 0), 0) / technicalRatings.length
      : 0;
    
    const engagementRatings = data.filter(item => item.engagement_rating !== null && item.engagement_rating !== undefined);
    const averageEngagementRating = engagementRatings.length > 0
      ? engagementRatings.reduce((sum, item) => sum + (item.engagement_rating || 0), 0) / engagementRatings.length
      : 0;
    
    const recommendCount = data.filter(item => item.would_recommend === true).length;
    const recommendationPercentage = (recommendCount / totalFeedbackCount) * 100;

    // Create the summary object
    const summary: FeedbackSummary = {
      averageOverallRating,
      averageContentRating,
      averageTechnicalRating,
      averageEngagementRating,
      recommendationPercentage,
      totalFeedbackCount
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error calculating feedback summary:', error);
    return NextResponse.json(
      { error: 'Failed to calculate feedback summary' },
      { status: 500 }
    );
  }
} 