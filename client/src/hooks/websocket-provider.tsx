import React, { createContext, ReactNode, useContext } from "react";
import { useWebSocket, WebSocketMessage, MessageType } from "./use-websocket";
import { useAuth } from "./use-auth";

// Define the context type
type WebSocketContextType = {
  isConnected: boolean;
  isConnecting: boolean;
  joinEvent: (eventId: number) => boolean;
  leaveEvent: (eventId: number) => boolean;
  sendMessage: (message: WebSocketMessage) => boolean;
  reconnect: () => void;
};

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider component that will wrap parts of the app that need WebSocket access
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
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
    reconnectInterval: 3000
  });
  
  // Wrapper around joinEvent that includes current user information
  const joinEvent = (eventId: number): boolean => {
    if (!user) return false;
    return joinEventRaw(eventId, user.id, user.username);
  };
  
  // Wrapper around leaveEvent
  const leaveEvent = (eventId: number): boolean => {
    return leaveEventRaw(eventId);
  };
  
  // Provide context value to children
  const contextValue: WebSocketContextType = {
    isConnected,
    isConnecting,
    joinEvent,
    leaveEvent,
    sendMessage,
    reconnect
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