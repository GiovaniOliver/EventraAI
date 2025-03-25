import { useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

// Reusing the same enum values for message types
export enum MessageType {
  JOIN_EVENT = 'join_event',
  LEAVE_EVENT = 'leave_event',
  EVENT_UPDATE = 'event_update',
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  GUEST_UPDATE = 'guest_update',
  CHAT_MESSAGE = 'chat_message',
  USER_PRESENCE = 'user_presence',
  TYPING_INDICATOR = 'typing_indicator',
  ERROR = 'error',
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  sender?: {
    userId: number;
    username: string;
  };
  timestamp?: number;
}

type WebSocketHookOptions = {
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  autoReconnect?: boolean;
};

/**
 * REST-only implementation of the WebSocket hook that doesn't attempt connections
 * but provides the same interface for compatibility
 */
export function useWebSocket(options: WebSocketHookOptions = {}) {
  // Set up mock state values - always show as not connected
  const isConnected = false;
  const isConnecting = false;
  
  // Call onClose callback to indicate we're not connected
  if (options.onClose) {
    options.onClose();
  }
  
  // Function to handle different message types and update application state
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case MessageType.EVENT_UPDATE:
        // Invalidate event queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
        
        // If it's for a specific event, also invalidate that event
        if (message.payload?.id) {
          queryClient.invalidateQueries({ 
            queryKey: [`/api/events/${message.payload.id}`] 
          });
        }
        break;
        
      case MessageType.TASK_CREATE:
      case MessageType.TASK_UPDATE:
      case MessageType.TASK_DELETE:
        // Invalidate tasks queries to refresh data
        if (message.payload?.eventId) {
          queryClient.invalidateQueries({ 
            queryKey: [`/api/events/${message.payload.eventId}/tasks`] 
          });
        }
        break;
    }
    
    // Call the provided onMessage handler
    if (options.onMessage) {
      options.onMessage(message);
    }
  }, [options]);
  
  // Send a message - always returns false since we're not connected
  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Log the message for debugging but don't attempt to send
    console.info('[WebSocket-REST] Message not sent (using REST fallback):', message.type);
    return false;
  }, []);
  
  // Join an event room - noop function
  const joinEvent = useCallback((eventId: number, userId: number, username: string) => {
    console.info('[WebSocket-REST] Join event not sent (using REST fallback):', eventId);
    return false;
  }, []);
  
  // Leave an event room - noop function
  const leaveEvent = useCallback((eventId: number) => {
    console.info('[WebSocket-REST] Leave event not sent (using REST fallback):', eventId);
    return false;
  }, []);
  
  // Reconnect function - noop
  const reconnect = useCallback(() => {
    console.info('[WebSocket-REST] Reconnect not attempted (using REST fallback)');
  }, []);
  
  return {
    isConnected,
    isConnecting,
    sendMessage,
    joinEvent,
    leaveEvent,
    reconnect
  };
}