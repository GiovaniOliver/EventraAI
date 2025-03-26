import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from "react";
// Using the REST-only version that doesn't attempt WebSocket connections
import { useWebSocket, WebSocketMessage, MessageType } from "./use-websocket-rest";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

// Active participant type
export interface ActiveParticipant {
  userId: number;
  username: string;
}

// Define the context type
type WebSocketContextType = {
  isConnected: boolean;
  isConnecting: boolean;
  joinEvent: (eventId: number) => boolean;
  leaveEvent: (eventId: number) => boolean;
  sendMessage: (message: WebSocketMessage) => boolean;
  reconnect: () => void;
  activeParticipants: ActiveParticipant[];
  connectionFailed: boolean;
};

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider component that will wrap parts of the app that need WebSocket access
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeParticipants, setActiveParticipants] = useState<ActiveParticipant[]>([]);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const connectionAttempts = useRef(0);
  const connectionFailedNotified = useRef(false);
  const toastRef = useRef(toast);
  
  // Store toast in ref to avoid dependencies changing
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  
  // Function to handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === MessageType.USER_PRESENCE && message.payload?.allUsers) {
      setActiveParticipants(message.payload.allUsers);
    }
    if (message.type === MessageType.JOIN_EVENT && message.payload?.users) {
      setActiveParticipants(message.payload.users);
    }
  }, []);

  // Define callbacks outside useWebSocket to avoid recreating the hook on every render
  const handleOpen = useCallback(() => {
    connectionAttempts.current = 0;
    setConnectionFailed(false);
    
    if (connectionFailedNotified.current) {
      toastRef.current({
        title: "Collaboration enabled",
        description: "Real-time collaboration is now available.",
      });
      connectionFailedNotified.current = false;
    }
  }, []);
  
  const handleClose = useCallback(() => {
    // This will be called when the connection is closed
    connectionAttempts.current += 1;
    
    // If we've tried reconnecting too many times, mark connection as failed
    if (connectionAttempts.current >= 5 && !connectionFailedNotified.current) {
      setConnectionFailed(true);
      
      // Only show the toast once
      toastRef.current({
        title: "Collaboration limited",
        description: "Unable to establish real-time connection. Some collaboration features may be limited.",
        variant: "default"
      });
      connectionFailedNotified.current = true;
    }
  }, []);

  // Initialize WebSocket hook with default options
  const {
    isConnected,
    isConnecting,
    sendMessage,
    joinEvent: joinEventRaw,
    leaveEvent: leaveEventRaw,
    reconnect
  } = useWebSocket({
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
    onMessage: handleWebSocketMessage,
    onOpen: handleOpen,
    onClose: handleClose
  });
  
  // Wrapper around joinEvent that includes current user information
  const joinEvent = (eventId: number): boolean => {
    if (!user) return false;
    
    // If WebSocket connection failed, just update the local state
    // so the UI can still display correctly, but return false
    if (connectionFailed || !isConnected) {
      setCurrentEventId(eventId);
      
      // Add just the current user to the participants list as a fallback
      setActiveParticipants([{
        userId: user.id,
        username: user.username
      }]);
      
      return false;
    }
    
    // Normal path when WebSocket is connected
    setCurrentEventId(eventId);
    return joinEventRaw(eventId, user.id, user.username);
  };
  
  // Wrapper around leaveEvent
  const leaveEvent = (eventId: number): boolean => {
    setCurrentEventId(null);
    setActiveParticipants([]);
    
    // Don't try to send the leave message if connection failed
    if (connectionFailed || !isConnected) {
      return false;
    }
    
    return leaveEventRaw(eventId);
  };
  
  // Provide context value to children
  const contextValue: WebSocketContextType = {
    isConnected,
    isConnecting,
    joinEvent,
    leaveEvent,
    sendMessage,
    reconnect,
    activeParticipants,
    connectionFailed
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket functionality
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
}