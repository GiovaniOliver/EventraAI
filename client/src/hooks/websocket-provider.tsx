import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { useWebSocket, WebSocketMessage, MessageType } from "./use-websocket";
import { useAuth } from "./use-auth";

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
};

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider component that will wrap parts of the app that need WebSocket access
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeParticipants, setActiveParticipants] = useState<ActiveParticipant[]>([]);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);
  
  // Function to handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === MessageType.USER_PRESENCE && message.payload?.allUsers) {
      setActiveParticipants(message.payload.allUsers);
    }
    if (message.type === MessageType.JOIN_EVENT && message.payload?.users) {
      setActiveParticipants(message.payload.users);
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
    onMessage: handleWebSocketMessage
  });
  
  // Wrapper around joinEvent that includes current user information
  const joinEvent = (eventId: number): boolean => {
    if (!user) return false;
    setCurrentEventId(eventId);
    return joinEventRaw(eventId, user.id, user.username);
  };
  
  // Wrapper around leaveEvent
  const leaveEvent = (eventId: number): boolean => {
    setCurrentEventId(null);
    setActiveParticipants([]);
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
    activeParticipants
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