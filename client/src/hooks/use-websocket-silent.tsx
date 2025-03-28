import { useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

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
 * REST-only implementation that doesn't attempt WebSocket connections
 * Used to completely bypass WebSocket issues in Replit environments
 */
export function useWebSocket(options: WebSocketHookOptions = {}) {
  // Always report as not connected - we're using REST fallback instead
  const isConnected = false;
  const isConnecting = false;
  
  // Call onClose callback to notify we're not using WebSockets
  if (options.onClose) {
    options.onClose();
  }
  
  // Function to handle different message types and update application state - kept for compatibility
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
  
  // Send a message - no-op function since we're not using WebSockets
  const sendMessage = useCallback((message: WebSocketMessage) => {
    console.info('[WebSocket-REST] Message not sent (using REST fallback):', message.type);
    return false;
  }, []);
  
  // Join an event room - no-op function
  const joinEvent = useCallback((eventId: number, userId: number, username: string) => {
    console.info('[WebSocket-REST] Join event not sent (using REST fallback):', eventId);
    return false;
  }, []);
  
  // Leave an event room - no-op function
  const leaveEvent = useCallback((eventId: number) => {
    console.info('[WebSocket-REST] Leave event not sent (using REST fallback):', eventId);
    return false;
  }, []);
  
  // Reconnect function - no-op
  const connect = useCallback(() => {
    console.info('[WebSocket-REST] Using REST-based collaboration instead of WebSockets');
  }, []);
  
  return {
    isConnected,
    isConnecting,
    sendMessage,
    joinEvent,
    leaveEvent,
    reconnect: connect
  };
}