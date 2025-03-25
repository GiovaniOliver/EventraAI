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
      registerPresence();
      
      // Register presence periodically
      const interval = setInterval(() => {
        registerPresence();
      }, pollingInterval / 2); // Register twice as often as we poll
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [eventId, user, registerPresence, pollingInterval]);
  
  // Create a function to invalidate related queries when an event is updated
  const notifyEventUpdate = useCallback((updatedEventId: number) => {
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    queryClient.invalidateQueries({ queryKey: [`/api/events/${updatedEventId}`] });
  }, [queryClient]);
  
  // Create a function to invalidate task queries when tasks are changed
  const notifyTaskUpdate = useCallback((taskEventId: number) => {
    queryClient.invalidateQueries({ queryKey: [`/api/events/${taskEventId}/tasks`] });
  }, [queryClient]);
  
  return {
    isLoading,
    isError,
    activeParticipants,
    refreshParticipants: refetchParticipants,
    notifyEventUpdate,
    notifyTaskUpdate
  };
}