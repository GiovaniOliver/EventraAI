'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User, Event, Task } from '@/lib/supabase'
import { MessageType } from '@/lib/websocket-service'
import { useToast } from '@/components/ui/toast'

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

export interface UseWebSocketOptions {
  autoConnect?: boolean
  url?: string
  onMessage?: (message: WebSocketMessage) => void
  onConnectionChange?: (connected: boolean) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Create a default URL based on environment or window location
  const defaultUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/api/websocket`
    : process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:3000/api/websocket'
  
  const eventSourceRef = useRef<EventSource | null>(null)
  
  // Connect to SSE
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    
    setLoading(true)
    
    try {
      const eventSource = new EventSource(options.url || defaultUrl)
      eventSourceRef.current = eventSource
      
      eventSource.onopen = () => {
        setConnected(true)
        setLoading(false)
        setError(null)
        
        if (options.onConnectionChange) {
          options.onConnectionChange(true)
        }
      }
      
      eventSource.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle connection established message to get client ID
          if (message.type === MessageType.CONNECTION_ESTABLISHED && message.payload?.clientId) {
            setClientId(message.payload.clientId)
          }
          
          // Call the passed handler if provided
          if (options.onMessage) {
            options.onMessage(message)
          }
          
          // Handle specific message types
          switch (message.type) {
            case MessageType.ERROR:
              toast({
                title: 'Connection Error',
                description: message.payload?.message || 'An unknown error occurred',
                variant: 'destructive'
              })
              break
            case MessageType.EVENT_UPDATE:
              toast({
                title: 'Event Updated',
                description: `${message.sender?.display_name || 'Someone'} updated an event`,
                variant: 'success'
              })
              break
            case MessageType.TASK_UPDATE:
              toast({
                title: 'Task Updated',
                description: `${message.sender?.display_name || 'Someone'} updated a task`,
                variant: 'success'
              })
              break
            case MessageType.CHAT_MESSAGE:
              toast({
                title: 'New Message',
                description: `${message.sender?.display_name || 'Someone'}: ${message.payload?.content || ''}`,
                variant: 'default'
              })
              break
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err)
        }
      }
      
      eventSource.onerror = (event) => {
        console.error('SSE error:', event)
        setError(new Error('Connection error'))
        setConnected(false)
        setLoading(false)
        
        if (options.onConnectionChange) {
          options.onConnectionChange(false)
        }
        
        // Auto-reconnect is handled by the browser for SSE
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'))
      setLoading(false)
      setConnected(false)
      
      toast({
        title: 'Connection Error',
        description: err instanceof Error ? err.message : 'Failed to connect to server',
        variant: 'destructive'
      })
    }
  }, [options.url, defaultUrl, options.onConnectionChange, options.onMessage, toast])
  
  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setConnected(false)
      
      if (options.onConnectionChange) {
        options.onConnectionChange(false)
      }
    }
  }, [options.onConnectionChange])
  
  // Send a message to the server
  const sendMessage = useCallback(async (message: WebSocketMessage) => {
    if (!connected) return false
    
    try {
      const response = await fetch(options.url || defaultUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })
      
      return response.ok
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      
      toast({
        title: 'Send Error',
        description: err instanceof Error ? err.message : 'Failed to send message',
        variant: 'destructive'
      })
      
      return false
    }
  }, [connected, options.url, defaultUrl, toast])
  
  // Join an event room
  const joinEvent = useCallback((eventId: string, user: User) => {
    return sendMessage({
      type: MessageType.JOIN_EVENT,
      payload: {
        eventId,
        userId: user.id,
        username: user.username
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Leave an event room
  const leaveEvent = useCallback((eventId: string, user: User) => {
    return sendMessage({
      type: MessageType.LEAVE_EVENT,
      payload: {
        eventId,
        userId: user.id
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Send an event update
  const sendEventUpdate = useCallback((event: Event, user: User) => {
    return sendMessage({
      type: MessageType.EVENT_UPDATE,
      payload: {
        eventId: event.id,
        event
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Send a task update
  const sendTaskUpdate = useCallback((task: Task, action: 'create' | 'update' | 'delete', user: User) => {
    const messageType = action === 'create' 
      ? MessageType.TASK_CREATE 
      : action === 'update' 
        ? MessageType.TASK_UPDATE 
        : MessageType.TASK_DELETE
    
    return sendMessage({
      type: messageType,
      payload: {
        eventId: task.event_id,
        task
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Send a chat message
  const sendChatMessage = useCallback((eventId: string, content: string, user: User) => {
    return sendMessage({
      type: MessageType.CHAT_MESSAGE,
      payload: {
        eventId,
        content
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Send typing indicator
  const sendTypingIndicator = useCallback((eventId: string, isTyping: boolean, user: User) => {
    return sendMessage({
      type: MessageType.TYPING_INDICATOR,
      payload: {
        eventId,
        isTyping
      },
      sender: {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      },
      timestamp: Date.now()
    })
  }, [sendMessage])
  
  // Initialize connection
  useEffect(() => {
    // Auto-connect if specified (default is true)
    if (options.autoConnect !== false) {
      connect()
    }
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [options.autoConnect, connect])
  
  return {
    connected,
    loading,
    error,
    clientId,
    connect,
    disconnect,
    joinEvent,
    leaveEvent,
    sendEventUpdate,
    sendTaskUpdate,
    sendChatMessage,
    sendTypingIndicator
  }
} 