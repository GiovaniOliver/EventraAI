import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";
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

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
  const autoReconnect = options.autoReconnect !== false;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
        
      case MessageType.USER_PRESENCE:
        // This will be handled by the event detail component for showing active users
        break;
    }
    
    // Call the provided onMessage handler
    if (options.onMessage) {
      options.onMessage(message);
    }
  }, [options]);
  
  // Establish WebSocket connection
  const connect = useCallback(() => {
    // Don't try to reconnect if we already have an open connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Set connecting state
    setIsConnecting(true);
    
    try {
      // Close any existing connection
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      
      // WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`[WebSocket] Connecting to ${wsUrl}`);
      
      // Create new WebSocket
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Setup handlers
      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;
        
        // Call the provided onOpen handler
        if (options.onOpen) {
          options.onOpen();
        }
      };
      
      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed', event);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Call the provided onClose handler
        if (options.onClose) {
          options.onClose();
        }
        
        // Handle reconnection if enabled and not at max attempts
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          
          console.log(`[WebSocket] Reconnecting (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Schedule reconnect
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      
      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        
        // Call the provided onError handler
        if (options.onError) {
          options.onError(event);
        }
        
        // Note: We don't do anything else here because the onclose handler will be called
        // immediately after an error, and that's where we handle reconnection
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      setIsConnected(false);
      setIsConnecting(false);
      
      // Call the provided onClose handler
      if (options.onClose) {
        options.onClose();
      }
      
      // Handle reconnection if enabled and not at max attempts
      if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        
        console.log(`[WebSocket] Reconnecting after error (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Schedule reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [options, reconnectInterval, maxReconnectAttempts, autoReconnect, handleWebSocketMessage]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
        return false;
      }
    }
    return false;
  }, []);
  
  // Join an event room
  const joinEvent = useCallback((eventId: number, userId: number, username: string) => {
    return sendMessage({
      type: MessageType.JOIN_EVENT,
      payload: { eventId, userId, username }
    });
  }, [sendMessage]);
  
  // Leave an event room
  const leaveEvent = useCallback((eventId: number) => {
    return sendMessage({
      type: MessageType.LEAVE_EVENT,
      payload: { eventId }
    });
  }, [sendMessage]);
  
  // Connect on mount and reconnect on dependency changes
  useEffect(() => {
    connect();
    
    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore close errors
        }
      }
    };
  }, [connect]);
  
  return {
    isConnected,
    isConnecting,
    sendMessage,
    joinEvent,
    leaveEvent,
    reconnect: connect
  };
}