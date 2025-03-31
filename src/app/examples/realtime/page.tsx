'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks'
import { useAuth } from '@/hooks'
import { User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageType, WebSocketMessage, ChatMessagePayload } from '@/lib/websocket-service'

export default function RealtimeExample() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<WebSocketMessage>>([])
  const [eventId, setEventId] = useState('demo-event-123')
  const [user, setUser] = useState<User | null>(null)
  
  // Initialize WebSocket connection
  const { 
    isConnected, 
    isLoading, 
    error, 
    send,
    sendChatMessage,
    sendUserPresence,
    sendEventUpdate,
    sendTypingIndicator
  } = useWebSocket(undefined, {
    autoConnect: true,
    onMessage: (message) => {
      console.log('Received message:', message)
    },
    onChatMessage: (payload) => {
      console.log('Received chat message:', payload)
      // Find the full message with sender info
      const fullMessage = messages.find(
        m => m.type === MessageType.CHAT_MESSAGE && 
        m.payload.content === payload.content
      )
      
      if (!fullMessage) {
        // If not found in existing messages, create a new one
        const newMessage: WebSocketMessage = {
          type: MessageType.CHAT_MESSAGE,
          payload,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, newMessage])
      }
    },
    onUserPresence: (payload) => {
      console.log('User presence update:', payload)
    },
    onTypingIndicator: (payload) => {
      console.log('Typing indicator:', payload)
    }
  })

  const { user: authUser } = useAuth()
  
  // Set demo user if no authenticated user
  useEffect(() => {
    if (authUser) {
      // Create a proper User object from auth user
      const appUser: User = {
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'user',
        display_name: (authUser as any).user_metadata?.name || authUser.email || 'User',
        email: authUser.email || '',
        is_admin: false,
        password: '',
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: authUser.created_at || new Date().toISOString()
      };
      setUser(appUser);
    } else {
      // Create a demo user
      setUser({
        id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
        username: 'demo-user',
        display_name: 'Demo User',
        email: 'demo@example.com',
        is_admin: false,
        password: '',
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: new Date().toISOString()
      });
    }
  }, [authUser]);
  
  // Join event when user is set
  useEffect(() => {
    if (user && isConnected) {
      // Send user presence update
      sendUserPresence(eventId, 'joined', user.id, user.username);
    }
    
    return () => {
      if (user && isConnected) {
        sendUserPresence(eventId, 'left', user.id, user.username);
      }
    }
  }, [user, isConnected, eventId, sendUserPresence]);
  
  // Handle typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && user) {
      setIsTyping(true);
      sendTypingIndicator(eventId, true, 'chat');
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (user) {
        sendTypingIndicator(eventId, false, 'chat');
      }
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    const success = await sendChatMessage(
      eventId, 
      message,
      {
        userId: user.id,
        username: user.username,
        display_name: user.display_name
      }
    );
    
    if (success) {
      setMessage('');
      
      // Add message to local state immediately for responsive UI
      const newMessage: WebSocketMessage = {
        type: MessageType.CHAT_MESSAGE,
        payload: {
          eventId,
          content: message
        },
        sender: {
          userId: user.id,
          username: user.username,
          display_name: user.display_name
        },
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Clear typing indicator
      setIsTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      sendTypingIndicator(eventId, false, 'chat');
    }
  };
  
  // Handle keypress for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Real-time Chat Example</CardTitle>
          <CardDescription>
            This example demonstrates real-time communication using Server-Sent Events
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isLoading && <Badge variant="outline">Connecting...</Badge>}
            {error && <Badge variant="destructive">Error: {error.message}</Badge>}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-[300px] overflow-y-auto border rounded-md p-3 mb-4 flex flex-col gap-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender?.userId === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.sender?.userId === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}>
                    {msg.payload.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.sender?.display_name || msg.sender?.username || 'Unknown'} • {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <div className="w-full flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              disabled={!isConnected || !user}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!isConnected || !user || !message.trim()}
            >
              Send
            </Button>
          </div>
          {isTyping && (
            <div className="text-xs text-gray-500">Typing indicator sent...</div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 