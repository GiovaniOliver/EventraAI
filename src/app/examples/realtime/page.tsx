'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks'
import { useAuth } from '@/hooks'
import { User } from '@/lib/supabase'

export default function RealtimeExample() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<any>>([])
  const [eventId, setEventId] = useState('demo-event-123')
  const [user, setUser] = useState<User | null>(null)
  
  // Initialize WebSocket connection
  const { 
    connected, 
    loading, 
    error, 
    clientId,
    sendChatMessage 
  } = useWebSocket({
    autoConnect: true,
    onMessage: (message) => {
      if (message.type === 'chat_message') {
        setMessages(prev => [...prev, message])
      }
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

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() && user) {
      sendChatMessage(eventId, message, user)
      setMessage('')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Real-time Chat Example</h1>
      
      <div className="mb-4">
        <div className="bg-gray-100 p-2 rounded">
          <p>
            <span className="font-semibold">Connection Status:</span> 
            {loading ? ' Connecting...' : connected ? ' Connected ✓' : ' Disconnected ✗'}
          </p>
          <p><span className="font-semibold">Client ID:</span> {clientId || 'Not assigned'}</p>
          <p><span className="font-semibold">Event Room:</span> {eventId}</p>
          <p><span className="font-semibold">User:</span> {user?.display_name || 'Not logged in'}</p>
          {error && <p className="text-red-500">Error: {error.message}</p>}
        </div>
      </div>
      
      <div className="border rounded-lg p-4 h-96 mb-4 overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center mt-auto mb-auto">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-lg max-w-[80%] ${
                msg.sender?.userId === user?.id 
                  ? 'ml-auto bg-blue-100 text-blue-900' 
                  : 'bg-gray-100'
              }`}>
                <div className="font-semibold text-sm">
                  {msg.sender?.display_name || msg.sender?.username || 'Unknown'}
                </div>
                <div>{msg.payload.content}</div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!connected || !user}
        />
        <button
          onClick={handleSendMessage}
          disabled={!connected || !user || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
} 