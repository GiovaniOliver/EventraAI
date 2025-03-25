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
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
  const autoReconnect = options.autoReconnect !== false;
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Function to establish WebSocket connection
  const connect = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) return;
    
    setIsConnecting(true);
    
    // Configure WebSocket connection with correct protocol and path
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
    
    // Create new WebSocket connection
    socket.current = new WebSocket(wsUrl);
    
    // Set up event listeners for the WebSocket
    socket.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttempts.current = 0;
      if (options.onOpen) options.onOpen();
    };
    
    socket.current.onclose = (event) => {
      console.log("WebSocket connection closed", event);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (options.onClose) options.onClose();
      
      // Attempt to reconnect if enabled and hasn't reached max attempts
      if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log("Max reconnection attempts reached");
        toast({
          title: "Connection Lost",
          description: "Unable to reconnect to the collaboration service. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    
    socket.current.onerror = (event) => {
      console.error("WebSocket error:", event);
      if (options.onError) options.onError(event);
    };
    
    socket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("WebSocket message received:", message);
        
        // Handle different message types
        handleWebSocketMessage(message);
        
        if (options.onMessage) options.onMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [options, reconnectInterval, maxReconnectAttempts, autoReconnect, toast]);
  
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
        
        if (message.payload?.deleted) {
          toast({
            title: "Event Deleted",
            description: `Event "${message.payload.name}" has been deleted.`
          });
        } else {
          toast({
            title: "Event Updated",
            description: `Event "${message.payload.name}" has been updated.`
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
          
          const actionText = message.type === MessageType.TASK_CREATE ? 'created' :
                           message.type === MessageType.TASK_UPDATE ? 'updated' : 'deleted';
          
          toast({
            title: `Task ${actionText}`,
            description: `Task "${message.payload.title}" has been ${actionText}.`
          });
        }
        break;
        
      case MessageType.USER_PRESENCE:
        // This will be handled by the event detail component for showing active users
        // We already have the active participants in the message payload
        // No need for toast notification here as the UI will show the participants
        break;
        
      case MessageType.ERROR:
        toast({
          title: "Error",
          description: message.payload.message,
          variant: "destructive"
        });
        break;
        
      default:
        // Handle other message types if needed
        break;
    }
  }, [toast]);
  
  // Function to send messages through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);
  
  // Function to join an event collaboration room
  const joinEvent = useCallback((eventId: number, userId: number, username: string) => {
    return sendMessage({
      type: MessageType.JOIN_EVENT,
      payload: { eventId, userId, username }
    });
  }, [sendMessage]);
  
  // Function to leave an event collaboration room
  const leaveEvent = useCallback((eventId: number) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    return sendMessage({
      type: MessageType.LEAVE_EVENT,
      payload: { eventId }
    });
  }, [sendMessage]);
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    connect();
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socket.current) {
        socket.current.close();
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