// Since WebSocket is not fully supported in Next.js Edge Runtime yet,
// we'll implement a simple server-sent events (SSE) endpoint as a fallback
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { MessageType } from '@/lib/websocket-service';

// Store messages in memory (in production, use Redis or similar)
const messageBuffer: Array<{ id: string; data: string }> = [];
let messageId = 0;

// Store active connections
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

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

  const encoder = new TextEncoder();
  let currentController: ReadableStreamDefaultController<Uint8Array>;

  // Create a new stream
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
      // Store controller reference for use in cancel
      currentController = controller;
      
      // Add this client to the set
      clients.add(controller);

      // Send any buffered messages
      for (const message of messageBuffer) {
        controller.enqueue(encoder.encode(`id: ${message.id}\ndata: ${message.data}\n\n`));
      }

      // Send a connection established event
      const connectionMessage = {
        type: MessageType.CONNECTION_ESTABLISHED,
        payload: {
          clientId: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      };

      controller.enqueue(
        encoder.encode(`id: ${messageId++}\ndata: ${JSON.stringify(connectionMessage)}\n\n`)
      );
    },
    cancel() {
      // Remove this client when they disconnect
      if (currentController) {
        clients.delete(currentController);
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

// Handle POST requests to send messages to connected clients
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the message
    if (!body.type || !body.payload) {
      return new Response('Invalid message format', { status: 400 });
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

    // Broadcast to all connected clients
    const encoder = new TextEncoder();
    for (const controller of clients) {
      controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
    }

    return new Response('Message sent', { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response('Error processing message', { status: 500 });
  }
}

// Add utility function to broadcast event updates
export function broadcastEvent(eventId: string, message: any) {
  const messageData = JSON.stringify({
    type: MessageType.EVENT_UPDATE,
    payload: {
      eventId,
      event: message,
    },
    timestamp: Date.now(),
  });

  const id = `${messageId++}`;
  messageBuffer.push({ id, data: messageData });
  
  // Limit buffer size
  if (messageBuffer.length > 100) {
    messageBuffer.shift();
  }

  // Broadcast to all connected clients
  const encoder = new TextEncoder();
  for (const controller of clients) {
    controller.enqueue(encoder.encode(`id: ${id}\ndata: ${messageData}\n\n`));
  }
} 