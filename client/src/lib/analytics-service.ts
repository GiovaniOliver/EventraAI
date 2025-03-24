import { apiRequest } from "./queryClient";
import type { 
  EventAnalytics, 
  AttendeeFeedback, 
  Event
} from "@shared/schema";

// Get analytics data for an event
export async function getEventAnalytics(eventId: number): Promise<EventAnalytics[]> {
  return apiRequest<EventAnalytics[]>({
    url: `/api/events/${eventId}/analytics`,
    method: "GET"
  });
}

// Create new analytics data for an event
export async function createEventAnalytics(eventId: number, data: Partial<EventAnalytics>): Promise<EventAnalytics> {
  return apiRequest<EventAnalytics>({
    url: `/api/events/${eventId}/analytics`,
    method: "POST",
    data
  });
}

// Update existing analytics data
export async function updateEventAnalytics(analyticsId: number, data: Partial<EventAnalytics>): Promise<EventAnalytics> {
  return apiRequest<EventAnalytics>({
    url: `/api/analytics/${analyticsId}`,
    method: "PUT",
    data
  });
}

// Get all feedback for an event
export async function getEventFeedback(eventId: number): Promise<AttendeeFeedback[]> {
  return apiRequest<AttendeeFeedback[]>({
    url: `/api/events/${eventId}/feedback`,
    method: "GET"
  });
}

// Submit new feedback for an event
export async function submitEventFeedback(eventId: number, feedback: Partial<AttendeeFeedback>): Promise<AttendeeFeedback> {
  return apiRequest<AttendeeFeedback>({
    url: `/api/events/${eventId}/feedback`,
    method: "POST",
    data: feedback
  });
}

// Get a summary of all feedback for an event
export async function getEventFeedbackSummary(eventId: number): Promise<{
  averageOverallRating: number;
  averageContentRating: number;
  averageTechnicalRating: number;
  averageEngagementRating: number;
  recommendationPercentage: number;
  totalFeedbackCount: number;
}> {
  return apiRequest<any>({
    url: `/api/events/${eventId}/feedback-summary`,
    method: "GET"
  });
}

// Generate analytics for an event that has completed
export async function generateEventAnalytics(event: Event, attendeeData: {
  totalAttendees: number;
  averageTimeSpent: number; // in minutes
  interactions: number;
  maxConcurrentUsers: number;
  feedbackScore?: number;
}): Promise<EventAnalytics> {
  // Calculate engagement score based on attendee metrics
  // Score is 0-100 based on a weighted algorithm
  const calculateEngagementScore = () => {
    const attendeePercentage = Math.min(100, (attendeeData.totalAttendees / (event.estimatedGuests || 1)) * 100);
    const timeScore = Math.min(100, (attendeeData.averageTimeSpent / 60) * 100); // Normalize to 100 (for 1 hour)
    const interactionScore = Math.min(100, attendeeData.interactions / attendeeData.totalAttendees * 20); // 5 interactions per person = 100
    
    // Weighted calculation
    return Math.round((attendeePercentage * 0.3) + (timeScore * 0.4) + (interactionScore * 0.3));
  };
  
  const analyticsData = {
    eventId: event.id,
    attendeeCount: attendeeData.totalAttendees,
    engagementScore: calculateEngagementScore(),
    averageAttendanceTime: attendeeData.averageTimeSpent,
    maxConcurrentUsers: attendeeData.maxConcurrentUsers,
    totalInteractions: attendeeData.interactions,
    feedbackScore: attendeeData.feedbackScore,
    analyticsDate: new Date(),
    detailedMetrics: {
      attendeePercentage: Math.round((attendeeData.totalAttendees / (event.estimatedGuests || 1)) * 100),
      interactionRate: attendeeData.interactions / attendeeData.totalAttendees,
      avgTimePercentage: Math.round((attendeeData.averageTimeSpent / 60) * 100)
    }
  };
  
  return createEventAnalytics(event.id, analyticsData);
}