'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Loader2 } from 'lucide-react'
import EventList from '@/components/EventList'
import Link from 'next/link'

// Define Event interface based on the EventList component expectations
interface Event {
  id: string
  title: string
  description: string
  location: string
  status: 'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  coverImage?: string
}

export default function EventsPage() {
  const router = useRouter()
  
  // Fix the user and isLoading type issue by using type assertion
  const auth = useAuth() as any
  const user = auth.user
  const authLoading = auth.isLoading
  
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      if (!user) return

      setIsLoading(true)
      try {
        // In a real application, fetch events from API
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

        const mockEvents: Event[] = [
          {
            id: "1",
            title: "Tech Conference 2023",
            description: "Annual technology conference",
            location: "San Francisco, CA",
            start_date: "2023-12-15T09:00:00Z",
            end_date: "2023-12-17T18:00:00Z",
            status: "upcoming",
            coverImage: "/images/events/event-1.jpg",
          },
          {
            id: "2",
            title: "Marketing Workshop",
            description: "Digital marketing strategies workshop",
            location: "Online",
            start_date: "2023-11-05T10:00:00Z",
            end_date: "2023-11-05T16:00:00Z",
            status: "completed",
            coverImage: "/images/events/event-2.jpg",
          },
          {
            id: "3",
            title: "Product Launch",
            description: "New product line announcement",
            location: "New York, NY",
            start_date: "2024-01-20T18:00:00Z",
            end_date: "2024-01-20T21:00:00Z",
            status: "draft",
            coverImage: "/images/events/event-3.jpg",
          },
        ]

        setEvents(mockEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Events</h1>
          <p className="text-muted-foreground">
            Create and manage your events
          </p>
        </div>
        <Link href="/events/new">
          <Button className="bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EventList 
            showFilters={false}
            emptyMessage="You haven't created any events yet. Click 'New Event' to get started."
            filter="all"
          />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <EventList 
            showFilters={false}
            emptyMessage="You don't have any upcoming events. Click 'New Event' to create one."
            filter="upcoming"
          />
        </TabsContent>
        
        <TabsContent value="past">
          <EventList 
            showFilters={false}
            emptyMessage="You don't have any past events yet."
            filter="completed"
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <EventList 
            showFilters={false}
            emptyMessage="You don't have any draft events. Click 'New Event' to start creating one."
            filter="draft"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 