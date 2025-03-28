'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Event } from '@/lib/supabase'
import { useAuth } from '@/hooks'
import { api } from '@/lib/api'
import { getAiSuggestions } from '@/lib/ai-service'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setAiSuggestions] = useState<any>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  // Fetch events when the user is authenticated
  useEffect(() => {
    async function fetchEvents() {
      if (!user) return

      setLoading(true)
      try {
        const response = await api.get<Event[]>(`/api/events?userId=${user.id}`)
        setEvents(response)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchEvents()
    }
  }, [user, authLoading])

  // Get AI suggestions
  const fetchSuggestions = async () => {
    if (!user) return

    setSuggestionsLoading(true)
    try {
      const suggestions = await getAiSuggestions('corporate', 'modern', 5000, {
        userId: user.id,
        guestCount: 50,
        format: 'in-person'
      })
      setAiSuggestions(suggestions)
    } catch (err) {
      console.error('Error fetching AI suggestions:', err)
      setError('Failed to load AI suggestions')
    } finally {
      setSuggestionsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
        <Link href="/auth/login" className="text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.display_name || user.username}</h1>
        <div className="flex gap-3">
          <Link 
            href="/examples/realtime" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Realtime Demo
          </Link>
          <Link 
            href="/events/new" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Event
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Events</h2>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>You don't have any events yet. Create your first event!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-600 text-sm">{event.date || 'No date set'}</p>
                    <p className="text-gray-600 text-sm">Type: {event.type}</p>
                    <p className="text-gray-600 text-sm">Status: {event.status}</p>
                    <div className="mt-3">
                      <Link 
                        href={`/events/${event.id}`} 
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Suggestions</h2>
            {!suggestions ? (
              <div>
                <p className="mb-4">Get AI-powered suggestions for your next event</p>
                <button 
                  onClick={fetchSuggestions}
                  disabled={suggestionsLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
                >
                  {suggestionsLoading ? 'Loading...' : 'Get Suggestions'}
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-2">Event Ideas:</h3>
                <ul className="list-disc list-inside mb-4">
                  {suggestions.events?.map((event: any) => (
                    <li key={event.id} className="mb-2">
                      <span className="font-medium">{event.title}</span>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold mb-2">Budget Suggestions:</h3>
                <ul className="list-disc list-inside">
                  {suggestions.budget?.slice(0, 3).map((item: any, index: number) => (
                    <li key={index}>
                      {item.category}: {item.percentage}% (${item.estimatedAmount})
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setAiSuggestions(null)}
                  className="mt-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Migrated Features</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                Authentication
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                Real-time Collaboration
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                AI Suggestions
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                Event Management
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                Analytics
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">✓</span>
                Vendor Management
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 