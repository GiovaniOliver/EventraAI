import { api } from './api';
import { Event } from './supabase';

export interface EventAnalytics {
  id: string;
  event_id: string;
  attendee_count: number;
  engagement_score: number;
  average_attendance_time: number; // in minutes
  max_concurrent_users: number;
  total_interactions: number;
  feedback_score?: number;
  analytics_date: string;
  detailed_metrics?: {
    attendee_percentage: number;
    interaction_rate: number;
    avg_time_percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AttendeeFeedback {
  id: string;
  event_id: string;
  attendee_name?: string;
  attendee_email?: string;
  overall_rating: number; // 1-5
  content_rating?: number; // 1-5
  technical_rating?: number; // 1-5
  engagement_rating?: number; // 1-5
  would_recommend: boolean;
  comments?: string;
  created_at: string;
}

// Get analytics data for an event
export async function getEventAnalytics(eventId: string): Promise<EventAnalytics[]> {
  return api.get<EventAnalytics[]>(`/api/events/${eventId}/analytics`);
}

// Create new analytics data for an event
export async function createEventAnalytics(eventId: string, data: Partial<EventAnalytics>): Promise<EventAnalytics> {
  return api.post<EventAnalytics>(`/api/events/${eventId}/analytics`, data);
}

// Update existing analytics data
export async function updateEventAnalytics(analyticsId: string, data: Partial<EventAnalytics>): Promise<EventAnalytics> {
  return api.put<EventAnalytics>(`/api/analytics/${analyticsId}`, data);
}

// Get all feedback for an event
export async function getEventFeedback(eventId: string): Promise<AttendeeFeedback[]> {
  return api.get<AttendeeFeedback[]>(`/api/events/${eventId}/feedback`);
}

// Submit new feedback for an event
export async function submitEventFeedback(eventId: string, feedback: Partial<AttendeeFeedback>): Promise<AttendeeFeedback> {
  return api.post<AttendeeFeedback>(`/api/events/${eventId}/feedback`, feedback);
}

// Get a summary of all feedback for an event
export interface FeedbackSummary {
  averageOverallRating: number;
  averageContentRating: number;
  averageTechnicalRating: number;
  averageEngagementRating: number;
  recommendationPercentage: number;
  totalFeedbackCount: number;
}

export async function getEventFeedbackSummary(eventId: string): Promise<FeedbackSummary> {
  return api.get<FeedbackSummary>(`/api/events/${eventId}/feedback-summary`);
}

export interface AttendeeData {
  totalAttendees: number;
  averageTimeSpent: number; // in minutes
  interactions: number;
  maxConcurrentUsers: number;
  feedbackScore?: number;
}

// Generate analytics for an event that has completed
export async function generateEventAnalytics(event: Event, attendeeData: AttendeeData): Promise<EventAnalytics> {
  // Calculate engagement score based on attendee metrics
  // Score is 0-100 based on a weighted algorithm
  const calculateEngagementScore = () => {
    const estimatedGuests = event.estimated_guests || 1;
    const attendeePercentage = Math.min(100, (attendeeData.totalAttendees / estimatedGuests) * 100);
    const timeScore = Math.min(100, (attendeeData.averageTimeSpent / 60) * 100); // Normalize to 100 (for 1 hour)
    const interactionScore = Math.min(100, attendeeData.interactions / attendeeData.totalAttendees * 20); // 5 interactions per person = 100
    
    // Weighted calculation
    return Math.round((attendeePercentage * 0.3) + (timeScore * 0.4) + (interactionScore * 0.3));
  };
  
  const analyticsData: Partial<EventAnalytics> = {
    event_id: event.id,
    attendee_count: attendeeData.totalAttendees,
    engagement_score: calculateEngagementScore(),
    average_attendance_time: attendeeData.averageTimeSpent,
    max_concurrent_users: attendeeData.maxConcurrentUsers,
    total_interactions: attendeeData.interactions,
    feedback_score: attendeeData.feedbackScore,
    analytics_date: new Date().toISOString(),
    detailed_metrics: {
      attendee_percentage: Math.round((attendeeData.totalAttendees / (event.estimated_guests || 1)) * 100),
      interaction_rate: attendeeData.interactions / attendeeData.totalAttendees,
      avg_time_percentage: Math.round((attendeeData.averageTimeSpent / 60) * 100)
    }
  };
  
  return createEventAnalytics(event.id, analyticsData);
} 