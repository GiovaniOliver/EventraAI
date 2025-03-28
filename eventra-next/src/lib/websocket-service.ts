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
}

export interface UserPresencePayload {
  eventId: string;
  userId: string;
  username?: string;
  status: 'joined' | 'left' | 'active' | 'inactive';
}

export interface ErrorPayload {
  message: string;
  code?: string;
} 