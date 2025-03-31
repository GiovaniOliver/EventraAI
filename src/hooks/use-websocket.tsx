'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User, Event, Task } from '@/lib/supabase'
import { MessageType, WebSocketMessage, EventUpdatePayload, TaskUpdatePayload, ChatMessagePayload, UserPresencePayload, TypingIndicatorPayload } from '@/lib/websocket-service'
import { useToast } from '@/hooks/use-toast'

export interface UseWebSocketOptions {
  autoConnect?: boolean
  url?: string
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: any) => void
  onMessage?: (message: WebSocketMessage) => void
  onEventUpdate?: (payload: EventUpdatePayload) => void
  onTaskCreate?: (payload: TaskUpdatePayload) => void
  onTaskUpdate?: (payload: TaskUpdatePayload) => void
  onTaskDelete?: (payload: TaskUpdatePayload) => void
  onUserPresence?: (payload: UserPresencePayload) => void
  onTypingIndicator?: (payload: TypingIndicatorPayload) => void
  onChatMessage?: (payload: ChatMessagePayload) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  connect: () => void
  disconnect: () => void
  send: (message: WebSocketMessage) => Promise<boolean>
  sendEventUpdate: (eventId: string, event: any) => Promise<boolean>
  sendTaskUpdate: (eventId: string, task: any, action: 'create' | 'update' | 'delete') => Promise<boolean>
  sendChatMessage: (eventId: string, content: string, sender?: { userId: string; username: string; display_name?: string }) => Promise<boolean>
  sendUserPresence: (eventId: string, status: 'joined' | 'left' | 'active' | 'inactive' | 'online' | 'offline', userId: string, username?: string) => Promise<boolean>
  sendTypingIndicator: (eventId: string, isTyping: boolean, context?: string) => Promise<boolean>
}

// Use a default URL based on environment
const getDefaultUrl = () => {
  const isClient = typeof window !== 'undefined'
  const isSecure = isClient && window.location.protocol === 'https:'
  
  // For Next.js API route
  return `/api/websocket`
}

export function useWebSocket(url: string = getDefaultUrl(), options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const userIdRef = useRef<string | null>(null)
  const usernameRef = useRef<string | null>(null)
  const displayNameRef = useRef<string | null>(null)

  const messageHandlers = useRef<{[key: string]: ((message: WebSocketMessage) => void)[]}>({})

  // Set up message handler for a specific message type
  const addMessageHandler = useCallback((type: MessageType, handler: (message: WebSocketMessage) => void) => {
    if (!messageHandlers.current[type]) {
      messageHandlers.current[type] = []
    }
    messageHandlers.current[type].push(handler)
    
    return () => {
      messageHandlers.current[type] = messageHandlers.current[type].filter(h => h !== handler)
    }
  }, [])

  // Handle incoming messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Call the general message handler if provided
    if (options.onMessage) {
      options.onMessage(message)
    }
    
    // Call type-specific handlers
    switch (message.type) {
      case MessageType.EVENT_UPDATE:
        options.onEventUpdate?.(message.payload as EventUpdatePayload)
        break
      case MessageType.TASK_CREATE:
        options.onTaskCreate?.(message.payload as TaskUpdatePayload)
        break
      case MessageType.TASK_UPDATE:
        options.onTaskUpdate?.(message.payload as TaskUpdatePayload)
        break
      case MessageType.TASK_DELETE:
        options.onTaskDelete?.(message.payload as TaskUpdatePayload)
        break
      case MessageType.USER_PRESENCE:
        options.onUserPresence?.(message.payload as UserPresencePayload)
        break
      case MessageType.TYPING_INDICATOR:
        options.onTypingIndicator?.(message.payload as TypingIndicatorPayload)
        break
      case MessageType.CHAT_MESSAGE:
        options.onChatMessage?.(message.payload as ChatMessagePayload)
        break
      case MessageType.ERROR:
        console.error('WebSocket error:', message.payload)
        setError(new Error(message.payload?.message || 'Unknown WebSocket error'))
        break
      case MessageType.CONNECTION_ESTABLISHED:
        console.log('SSE Connection established', message.payload)
        break
    }
    
    // Call registered message handlers for this type
    if (messageHandlers.current[message.type]) {
      messageHandlers.current[message.type].forEach(handler => handler(message))
    }
  }, [options])

  // Connect to the WebSocket
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      // Already connected
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create SSE connection with user ID if available
      const params = new URLSearchParams()
      if (userIdRef.current) params.append('userId', userIdRef.current)
      if (usernameRef.current) params.append('username', usernameRef.current)
      if (displayNameRef.current) params.append('displayName', displayNameRef.current)
      
      const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
      const eventSource = new EventSource(fullUrl)
      
      eventSource.onopen = () => {
        setIsConnected(true)
        setIsLoading(false)
        options.onOpen?.()
      }
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (err) {
          console.error('Failed to parse SSE message:', err, event.data)
        }
      }
      
      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err)
        setError(new Error('SSE connection error'))
        setIsLoading(false)
        setIsConnected(false)
        eventSource.close()
        eventSourceRef.current = null
        options.onError?.(err)
        options.onClose?.()
      }
      
      eventSourceRef.current = eventSource
    } catch (err) {
      console.error('Failed to connect to SSE:', err)
      setError(err instanceof Error ? err : new Error('Failed to connect to SSE'))
      setIsLoading(false)
      options.onError?.(err)
    }
  }, [url, handleMessage, options])

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
      options.onClose?.()
    }
  }, [options])

  // Set user identification for messages
  const setUserIdentification = useCallback((userId: string, username: string, displayName?: string) => {
    userIdRef.current = userId
    usernameRef.current = username
    displayNameRef.current = displayName || null
  }, [])

  // Send a message
  const send = useCallback(async (message: WebSocketMessage): Promise<boolean> => {
    try {
      // Add sender info if available and not already set
      if (!message.sender && userIdRef.current && usernameRef.current) {
        message.sender = {
          userId: userIdRef.current,
          username: usernameRef.current,
          display_name: displayNameRef.current || undefined
        }
      }
      
      // Add timestamp if not set
      if (!message.timestamp) {
        message.timestamp = Date.now()
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })
      
      return response.ok
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      return false
    }
  }, [url])

  // Helper to send an event update
  const sendEventUpdate = useCallback((eventId: string, event: any): Promise<boolean> => {
    return send({
      type: MessageType.EVENT_UPDATE,
      payload: {
        eventId,
        event
      }
    })
  }, [send])

  // Helper to send a task update
  const sendTaskUpdate = useCallback((
    eventId: string, 
    task: any, 
    action: 'create' | 'update' | 'delete'
  ): Promise<boolean> => {
    const messageType = action === 'create' 
      ? MessageType.TASK_CREATE 
      : action === 'update'
        ? MessageType.TASK_UPDATE
        : MessageType.TASK_DELETE
        
    return send({
      type: messageType,
      payload: {
        eventId,
        task
      }
    })
  }, [send])

  // Helper to send a chat message
  const sendChatMessage = useCallback((
    eventId: string, 
    content: string,
    sender?: { userId: string; username: string; display_name?: string }
  ): Promise<boolean> => {
    return send({
      type: MessageType.CHAT_MESSAGE,
      payload: {
        eventId,
        content
      },
      sender
    })
  }, [send])

  // Helper to send user presence update
  const sendUserPresence = useCallback((
    eventId: string,
    status: 'joined' | 'left' | 'active' | 'inactive' | 'online' | 'offline',
    userId: string = userIdRef.current || '',
    username: string = usernameRef.current || ''
  ): Promise<boolean> => {
    return send({
      type: MessageType.USER_PRESENCE,
      payload: {
        eventId,
        userId,
        username,
        status
      }
    })
  }, [send])

  // Helper to send typing indicator
  const sendTypingIndicator = useCallback((
    eventId: string,
    isTyping: boolean,
    context?: string
  ): Promise<boolean> => {
    return send({
      type: MessageType.TYPING_INDICATOR,
      payload: {
        eventId,
        isTyping,
        context
      }
    })
  }, [send])

  // Auto-connect if enabled
  useEffect(() => {
    if (options.autoConnect) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect, options.autoConnect])

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    send,
    sendEventUpdate,
    sendTaskUpdate,
    sendChatMessage,
    sendUserPresence,
    sendTypingIndicator
  }
}