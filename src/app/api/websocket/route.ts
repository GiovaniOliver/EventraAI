// Since WebSocket is not fully supported in Next.js Edge Runtime yet,
// we'll implement a server-sent events (SSE) endpoint as a fallback
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { MessageType, Client } from '@/lib/websocket-service';

// Store messages in memory (in production, use Redis or similar)
const messageBuffer: Array<{ id: string; data: string }> = [];
let messageId = 0;

// Store active clients with their information
const clients = new Map<string, Client>();

// Store event rooms (eventId -> set of clientIds)
const eventRooms = new Map<string, Set<string>>();

// Generate a unique client ID
function generateClientId(): string {
  return crypto.randomUUID();
}

// Add client to an event room
function joinEventRoom(clientId: string, eventId: string) {
  if (!eventRooms.has(eventId)) {
    eventRooms.set(eventId, new Set());
  }
  const room = eventRooms.get(eventId);
  if (room) {
    room.add(clientId);
  }

  // Update client's rooms
  const client = clients.get(clientId);
  if (client) {
    client.eventRooms.add(eventId);
  }
}

// Remove client from an event room
function leaveEventRoom(clientId: string, eventId: string) {
  const room = eventRooms.get(eventId);
  if (room) {
    room.delete(clientId);
    if (room.size === 0) {
      eventRooms.delete(eventId);
    }
  }

  // Update client's rooms
  const client = clients.get(clientId);
  if (client) {
    client.eventRooms.delete(eventId);
  }
}

export async function GET(req: NextRequest) {
  // Check for SSE request
  const acceptHeader = req.headers.get('accept');
  if (acceptHeader !== 'text/event-stream') {
    return new Response('This endpoint requires EventSource/Server-Sent Events', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Get user information from query parameters
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const username = url.searchParams.get('username');
  const displayName = url.searchParams.get('displayName');

  if (!userId || !username) {
    return new Response('Missing required user information', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  const encoder = new TextEncoder();
  let clientId = generateClientId();
  let currentController: ReadableStreamDefaultController<Uint8Array>;

  // Create a new stream
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
      // Store controller reference for use in cancel
      currentController = controller;
      
      // Create client object
      const client: Client = {
        userId,
        username,
        display_name: displayName || undefined,
        controller,
        eventRooms: new Set()
      };
      
      // Add this client to the map
      clients.set(clientId, client);

      console.log(`[SSE] Client connected: ${clientId} (${username})`);

      // Send any buffered messages
      for (const message of messageBuffer) {
        controller.enqueue(encoder.encode(`id: ${message.id}\ndata: ${message.data}\n\n`));
      }

      // Send a connection established event
      const connectionMessage = {
        type: MessageType.CONNECTION_ESTABLISHED,
        payload: {
          clientId,
          userId,
          username,
          timestamp: Date.now(),
          message: 'Connection established'
        },
      };

      controller.enqueue(
        encoder.encode(`id: ${messageId++}\ndata: ${JSON.stringify(connectionMessage)}\n\n`)
      );
    },
    cancel() {
      // Remove this client when they disconnect
      if (clients.has(clientId)) {
        const client = clients.get(clientId);
        
        // Leave all event rooms
        if (client) {
          for (const eventId of client.eventRooms) {
            leaveEventRoom(clientId, eventId);
            
            // Broadcast leave event to other clients in this room
            broadcastToEventRoom(eventId, {
              type: MessageType.USER_PRESENCE,
              payload: {
                eventId,
                userId: client.userId,
                username: client.username,
                status: 'offline',
              },
              timestamp: Date.now(),
            }, clientId); // Don't send to the leaving client
          }
        }
        
        clients.delete(clientId);
        console.log(`[SSE] Client disconnected: ${clientId}`);
      }
    },
  });

  // Return the SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Broadcast to all clients in an event room
function broadcastToEventRoom(
  eventId: string, 
  message: any, 
  excludeClientId?: string
) {
  const messageData = JSON.stringify(message);
  const id = `${messageId++}`;
  
  // Store in buffer
  messageBuffer.push({ id, data: messageData });
  if (messageBuffer.length > 100) {
    messageBuffer.shift();
  }
  
  const room = eventRooms.get(eventId);
  if (!room) return;
  
  const encoder = new TextEncoder();
  
  for (const clientId of room) {
    // Skip excluded client
    if (excludeClientId && clientId === excludeClientId) continue;
    
    const client = clients.get(clientId);
    if (client) {
      try {
        client.controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
      } catch (error) {
        console.error(`[SSE] Error sending to client ${clientId}:`, error);
      }
    }
  }
}

// Handle POST requests to send messages to connected clients
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the message
    if (!body.type || typeof body.payload !== 'object') {
      return new Response('Invalid message format', { status: 400 });
    }

    // Handle special message types
    if (body.type === MessageType.JOIN_EVENT && body.payload?.eventId && body.sender?.userId) {
      const { eventId } = body.payload;
      const { userId } = body.sender;
      
      // Find client by userId
      let clientId: string | null = null;
      for (const [id, client] of clients.entries()) {
        if (client.userId === userId) {
          clientId = id;
          break;
        }
      }
      
      if (clientId) {
        joinEventRoom(clientId, eventId);
        console.log(`[SSE] Client ${clientId} joined event ${eventId}`);
        
        // Broadcast join event to all in this room
        broadcastToEventRoom(eventId, body);
        
        return new Response('Joined event room', { status: 200 });
      }
    } else if (body.type === MessageType.LEAVE_EVENT && body.payload?.eventId && body.sender?.userId) {
      const { eventId } = body.payload;
      const { userId } = body.sender;
      
      // Find client by userId
      let clientId: string | null = null;
      for (const [id, client] of clients.entries()) {
        if (client.userId === userId) {
          clientId = id;
          break;
        }
      }
      
      if (clientId) {
        leaveEventRoom(clientId, eventId);
        console.log(`[SSE] Client ${clientId} left event ${eventId}`);
        
        // Broadcast leave event to all in this room
        broadcastToEventRoom(eventId, body);
        
        return new Response('Left event room', { status: 200 });
      }
    }

    // Create a message ID
    const id = `${messageId++}`;
    
    // Store the message
    const messageData = JSON.stringify(body);
    messageBuffer.push({ id, data: messageData });
    
    // Limit buffer size (keep last 100 messages)
    if (messageBuffer.length > 100) {
      messageBuffer.shift();
    }

    // Handle event-specific messages
    if (body.payload?.eventId && (
      body.type === MessageType.EVENT_UPDATE ||
      body.type === MessageType.TASK_CREATE ||
      body.type === MessageType.TASK_UPDATE ||
      body.type === MessageType.TASK_DELETE ||
      body.type === MessageType.CHAT_MESSAGE ||
      body.type === MessageType.USER_PRESENCE ||
      body.type === MessageType.TYPING_INDICATOR
    )) {
      // Broadcast to clients in this event room
      broadcastToEventRoom(body.payload.eventId, body);
      return new Response('Message sent to event room', { status: 200 });
    }

    // Broadcast to all connected clients (global messages)
    const encoder = new TextEncoder();
    for (const client of clients.values()) {
      try {
        client.controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
      } catch (error) {
        console.error('[SSE] Error sending to client:', error);
      }
    }

    return new Response('Message sent', { status: 200 });
  } catch (error) {
    console.error('[SSE] Error processing message:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Add utility function to broadcast event updates (can be called from other API routes)
export function broadcastEvent(eventId: string, message: any, sender?: { userId: string; username: string }) {
  const messageData = JSON.stringify({
    type: MessageType.EVENT_UPDATE,
    payload: {
      eventId,
      event: message,
    },
    sender,
    timestamp: Date.now(),
  });

  const id = `${messageId++}`;
  messageBuffer.push({ id, data: messageData });
  
  // Limit buffer size
  if (messageBuffer.length > 100) {
    messageBuffer.shift();
  }

  // Broadcast to event room if it exists
  const room = eventRooms.get(eventId);
  if (room) {
    const encoder = new TextEncoder();
    for (const clientId of room) {
      const client = clients.get(clientId);
      if (client) {
        try {
          client.controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
        } catch (error) {
          console.error('[SSE] Error sending to client:', error);
        }
      }
    }
    return true;
  }
  
  // If no room exists, broadcast to all clients
  const encoder = new TextEncoder();
  for (const client of clients.values()) {
    try {
      client.controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
    } catch (error) {
      console.error('[SSE] Error sending to client:', error);
    }
  }
  
  return true;
} 