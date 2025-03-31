// This file defines the MessageType enum and message interfaces
// for real-time collaboration via Server-Sent Events (SSE)

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
  CONNECTION_ESTABLISHED = 'connection_established'
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  sender?: {
    userId: string;
    username: string;
    display_name?: string;
  };
  timestamp?: number;
}

// Types for specific message payloads
export interface JoinEventPayload {
  eventId: string;
  userId: string;
  username: string;
}

export interface LeaveEventPayload {
  eventId: string;
  userId: string;
}

export interface EventUpdatePayload {
  eventId: string;
  event: any;
}

export interface TaskUpdatePayload {
  eventId: string;
  task: any;
}

export interface ChatMessagePayload {
  eventId: string;
  content: string;
}

export interface TypingIndicatorPayload {
  eventId: string;
  isTyping: boolean;
  context?: string;
}

export interface UserPresencePayload {
  eventId: string;
  userId: string;
  username?: string;
  status: 'joined' | 'left' | 'active' | 'inactive' | 'online' | 'offline';
  allUsers?: Array<{userId: string; username: string}>;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// Client interface for SSE implementation
export interface Client {
  userId: string;
  username: string;
  display_name?: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  eventRooms: Set<string>;
}

// Function to broadcast to all clients (for server-side usage)
export async function broadcastMessage(
  messageType: MessageType, 
  payload: any, 
  sender?: { userId: string; username: string; display_name?: string }
) {
  try {
    const message = {
      type: messageType,
      payload,
      sender,
      timestamp: Date.now()
    };

    const response = await fetch('/api/websocket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('Error broadcasting message:', error);
    return false;
  }
}

// Function to broadcast event updates (for server-side usage)
export async function broadcastEventUpdate(eventId: string, update: any) {
  return broadcastMessage(MessageType.EVENT_UPDATE, {
    eventId,
    ...update
  });
}

// Function to broadcast task updates (for server-side usage)
export async function broadcastTaskUpdate(
  eventId: string, 
  task: any, 
  action: 'create' | 'update' | 'delete'
) {
  const messageType = action === 'create' 
    ? MessageType.TASK_CREATE 
    : action === 'update'
      ? MessageType.TASK_UPDATE
      : MessageType.TASK_DELETE;

  return broadcastMessage(messageType, {
    eventId,
    task
  });
} 