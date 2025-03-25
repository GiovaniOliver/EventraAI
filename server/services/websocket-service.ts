import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from '../vite';

interface Client {
  userId: number;
  username: string;
  ws: WebSocket;
  eventRooms: Set<number>;
}

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

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<number, Client> = new Map();
  private eventRooms: Map<number, Set<number>> = new Map(); // eventId -> Set of userIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    log('WebSocket server initialized', 'websocket');
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      let client: Client | null = null;

      ws.on('message', (message: string) => {
        try {
          const data: WebSocketMessage = JSON.parse(message);
          
          // Handle authentication first if the client is not set up yet
          if (!client && data.type !== MessageType.JOIN_EVENT) {
            ws.send(JSON.stringify({
              type: MessageType.ERROR,
              payload: { message: 'You must join an event first' }
            }));
            return;
          }

          this.handleMessage(ws, data, client);
        } catch (error) {
          log(`Error processing message: ${error}`, 'websocket');
          ws.send(JSON.stringify({
            type: MessageType.ERROR,
            payload: { message: 'Invalid message format' }
          }));
        }
      });

      ws.on('close', () => {
        if (client) {
          this.handleClientDisconnect(client);
        }
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage, client: Client | null) {
    const { type, payload } = message;

    switch (type) {
      case MessageType.JOIN_EVENT:
        this.handleJoinEvent(ws, payload);
        break;

      case MessageType.LEAVE_EVENT:
        if (client) {
          this.handleLeaveEvent(client, payload.eventId);
        }
        break;

      case MessageType.EVENT_UPDATE:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type: MessageType.EVENT_UPDATE,
            payload: payload,
            sender: {
              userId: client.userId,
              username: client.username
            },
            timestamp: Date.now()
          });
        }
        break;

      case MessageType.TASK_CREATE:
      case MessageType.TASK_UPDATE:
      case MessageType.TASK_DELETE:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type,
            payload: payload,
            sender: {
              userId: client.userId,
              username: client.username
            },
            timestamp: Date.now()
          });
        }
        break;

      case MessageType.GUEST_UPDATE:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type: MessageType.GUEST_UPDATE,
            payload: payload,
            sender: {
              userId: client.userId,
              username: client.username
            },
            timestamp: Date.now()
          });
        }
        break;

      case MessageType.CHAT_MESSAGE:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type: MessageType.CHAT_MESSAGE,
            payload: payload,
            sender: {
              userId: client.userId,
              username: client.username
            },
            timestamp: Date.now()
          });
        }
        break;

      case MessageType.USER_PRESENCE:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type: MessageType.USER_PRESENCE,
            payload: {
              userId: client.userId,
              username: client.username,
              status: payload.status,
              eventId: payload.eventId
            },
            timestamp: Date.now()
          });
        }
        break;

      case MessageType.TYPING_INDICATOR:
        if (client) {
          this.broadcastToEvent(payload.eventId, {
            type: MessageType.TYPING_INDICATOR,
            payload: {
              userId: client.userId,
              username: client.username,
              isTyping: payload.isTyping,
              context: payload.context, // e.g., 'tasks', 'chat', etc.
              eventId: payload.eventId
            },
            timestamp: Date.now()
          });
        }
        break;

      default:
        ws.send(JSON.stringify({
          type: MessageType.ERROR,
          payload: { message: 'Unsupported message type' }
        }));
    }
  }

  private handleJoinEvent(ws: WebSocket, payload: any) {
    const { userId, username, eventId } = payload;

    // Create a new client if it doesn't exist
    if (!this.clients.has(userId)) {
      const client: Client = {
        userId,
        username,
        ws,
        eventRooms: new Set([eventId])
      };
      this.clients.set(userId, client);
    } else {
      // Update the existing client
      const client = this.clients.get(userId)!;
      client.ws = ws;
      client.eventRooms.add(eventId);
    }

    // Add user to event room
    if (!this.eventRooms.has(eventId)) {
      this.eventRooms.set(eventId, new Set([userId]));
    } else {
      this.eventRooms.get(eventId)!.add(userId);
    }

    // Notify all users in the event room about the new user
    this.broadcastToEvent(eventId, {
      type: MessageType.USER_PRESENCE,
      payload: {
        userId,
        username,
        status: 'online',
        eventId,
        allUsers: this.getActiveUsersInEvent(eventId)
      },
      timestamp: Date.now()
    });

    // Confirm to the user that they've joined
    ws.send(JSON.stringify({
      type: MessageType.JOIN_EVENT,
      payload: {
        eventId,
        success: true,
        users: this.getActiveUsersInEvent(eventId)
      },
      timestamp: Date.now()
    }));

    log(`User ${username} (${userId}) joined event ${eventId}`, 'websocket');
  }

  private handleLeaveEvent(client: Client, eventId: number) {
    client.eventRooms.delete(eventId);
    
    // Remove user from event room
    if (this.eventRooms.has(eventId)) {
      this.eventRooms.get(eventId)!.delete(client.userId);
      
      // Clean up empty event rooms
      if (this.eventRooms.get(eventId)!.size === 0) {
        this.eventRooms.delete(eventId);
      } else {
        // Notify other users that this user has left
        this.broadcastToEvent(eventId, {
          type: MessageType.USER_PRESENCE,
          payload: {
            userId: client.userId,
            username: client.username,
            status: 'offline',
            eventId,
            allUsers: this.getActiveUsersInEvent(eventId)
          },
          timestamp: Date.now()
        });
      }
    }

    log(`User ${client.username} (${client.userId}) left event ${eventId}`, 'websocket');
  }

  private handleClientDisconnect(client: Client) {
    // Notify all event rooms this client was in
    for (const eventId of client.eventRooms) {
      this.handleLeaveEvent(client, eventId);
    }

    // Remove client from clients map
    this.clients.delete(client.userId);
    log(`User ${client.username} (${client.userId}) disconnected`, 'websocket');
  }

  private broadcastToEvent(eventId: number, message: WebSocketMessage) {
    if (!this.eventRooms.has(eventId)) {
      return;
    }

    const msgStr = JSON.stringify(message);
    const userIds = this.eventRooms.get(eventId)!;

    for (const userId of userIds) {
      const client = this.clients.get(userId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msgStr);
      }
    }
  }

  private getActiveUsersInEvent(eventId: number): { userId: number; username: string }[] {
    if (!this.eventRooms.has(eventId)) {
      return [];
    }

    const activeUsers: { userId: number; username: string }[] = [];
    const userIds = this.eventRooms.get(eventId)!;

    for (const userId of userIds) {
      const client = this.clients.get(userId);
      if (client) {
        activeUsers.push({
          userId: client.userId,
          username: client.username
        });
      }
    }

    return activeUsers;
  }

  // Public method to broadcast updates from server-side (e.g., when a task is updated via HTTP)
  public broadcastEventUpdate(eventId: number, update: any) {
    this.broadcastToEvent(eventId, {
      type: MessageType.EVENT_UPDATE,
      payload: {
        eventId,
        ...update
      },
      timestamp: Date.now()
    });
  }

  public broadcastTaskUpdate(eventId: number, task: any, action: 'create' | 'update' | 'delete') {
    const messageType = action === 'create' 
      ? MessageType.TASK_CREATE 
      : action === 'update'
        ? MessageType.TASK_UPDATE
        : MessageType.TASK_DELETE;

    this.broadcastToEvent(eventId, {
      type: messageType,
      payload: {
        eventId,
        task
      },
      timestamp: Date.now()
    });
  }
}

let websocketServiceInstance: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  if (!websocketServiceInstance) {
    websocketServiceInstance = new WebSocketService(server);
  }
  return websocketServiceInstance;
}

export function getWebSocketService(): WebSocketService | null {
  return websocketServiceInstance;
}