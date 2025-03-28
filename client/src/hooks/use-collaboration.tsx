import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ActiveParticipant {
  userId: number;
  username: string;
}

type CollaborationHookOptions = {
  pollingInterval?: number;
};

/**
 * This hook provides a REST-based fallback for real-time collaboration
 * instead of WebSockets which are problematic in Replit environments
 */
export function useCollaboration(eventId: number | null, options: CollaborationHookOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeParticipants, setActiveParticipants] = useState<ActiveParticipant[]>([]);
  const pollingInterval = options.pollingInterval || 10000; // 10 seconds by default
  
  // Register user presence via REST API
  const registerPresence = useCallback(async () => {
    if (!eventId || !user) return false;
    
    try {
      await apiRequest("POST", `/api/events/${eventId}/presence`, {
        userId: user.id,
        username: user.username
      });
      return true;
    } catch (error) {
      console.error("Failed to register presence:", error);
      return false;
    }
  }, [eventId, user]);
  
  // Fetch active participants
  const { 
    data: participants = [],
    refetch: refetchParticipants,
    isLoading,
    isError
  } = useQuery({
    queryKey: [`/api/events/${eventId}/participants`],
    queryFn: async () => {
      // If there's no event ID or user, just return current user as fallback
      if (!eventId || !user) {
        return user ? [{ userId: user.id, username: user.username }] : [];
      }
      
      // Otherwise use the current user as fallback but try to get participants from API
      try {
        const response = await apiRequest("GET", `/api/events/${eventId}/participants`);
        const data = await response.json();
        return data.length ? data : [{ userId: user.id, username: user.username }];
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        // Return just the current user as fallback
        return [{ userId: user.id, username: user.username }];
      }
    },
    // Only run the query if we have an event ID
    enabled: !!eventId,
    // Set a polling interval for automatic refreshes
    refetchInterval: pollingInterval,
    // Use stale data while revalidating
    staleTime: pollingInterval / 2
  });
  
  // Update participants state when data changes
  useEffect(() => {
    if (participants?.length) {
      setActiveParticipants(participants);
    } else if (user && eventId) {
      // Fallback to just the current user if no participants
      setActiveParticipants([{
        userId: user.id,
        username: user.username
      }]);
    }
  }, [participants, user, eventId]);
  
  // Register presence on mount and when dependencies change
  useEffect(() => {
    if (eventId && user) {
      // Call it once right away
      registerPresence();
      
      // Register presence periodically
      const interval = setInterval(() => {
        registerPresence();
      }, pollingInterval / 2); // Register twice as often as we poll
      
      return () => {
        clearInterval(interval);
      };
    }
  // Remove registerPresence from dependencies to avoid potential infinite loop
  // The registerPresence function will close over the latest eventId and user values
  }, [eventId, user, pollingInterval]);
  
  // Create a function to notify others and invalidate related queries when an event is updated
  const notifyEventUpdate = useCallback(async (updatedEventId: number) => {
    // Invalidate our own caches immediately
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    queryClient.invalidateQueries({ queryKey: [`/api/events/${updatedEventId}`] });
    
    // Try to send a notification to other clients via the server
    try {
      await apiRequest("POST", `/api/events/${updatedEventId}/notify/event-update`);
    } catch (err) {
      console.error("Failed to send event update notification:", err);
      // Continue even if notification fails - local invalidation still works
    }
  }, [queryClient]);
  
  // Create a function to notify others and invalidate task queries when tasks are changed
  const notifyTaskUpdate = useCallback(async (taskEventId: number) => {
    // Invalidate our own cache immediately
    queryClient.invalidateQueries({ queryKey: [`/api/events/${taskEventId}/tasks`] });
    
    // Try to send a notification to other clients via the server
    try {
      await apiRequest("POST", `/api/events/${taskEventId}/notify/task-update`);
    } catch (err) {
      console.error("Failed to send task update notification:", err);
      // Continue even if notification fails - local invalidation still works
    }
  }, [queryClient]);
  
  // Create a function to notify others and invalidate guest queries when guests are changed
  const notifyGuestUpdate = useCallback(async (guestEventId: number) => {
    // Invalidate our own cache immediately
    queryClient.invalidateQueries({ queryKey: [`/api/events/${guestEventId}/guests`] });
    
    // Try to send a notification to other clients via the server
    try {
      await apiRequest("POST", `/api/events/${guestEventId}/notify/guest-update`);
    } catch (err) {
      console.error("Failed to send guest update notification:", err);
      // Continue even if notification fails - local invalidation still works
    }
  }, [queryClient]);
  
  return {
    isLoading,
    isError,
    activeParticipants,
    refreshParticipants: refetchParticipants,
    notifyEventUpdate,
    notifyTaskUpdate,
    notifyGuestUpdate
  };
}