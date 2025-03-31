'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { useEvents } from '@/hooks/use-events'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ClipboardList, Users, Sparkles, Clock } from "lucide-react"
import EventImprovements from '@/components/events/event-improvements'
import EventVendors from '@/components/events/event-vendors'
import PlanningWizard from '@/components/events/planning-wizard'

interface EventPageProps {
  params: {
    eventId: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params
  const { user, isLoading: authLoading } = useAuth()
  const { useEvent, deleteEvent } = useEvents()
  const { data: event, isLoading: eventLoading, error } = useEvent(eventId)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPlanningWizardOpen, setIsPlanningWizardOpen] = useState(false)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      setIsDeleting(true)
      try {
        await deleteEvent.mutateAsync(eventId)
        router.push('/events')
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event')
        setIsDeleting(false)
      }
    }
  }
  
  // Loading state
  if (authLoading || eventLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Loading...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null // Will redirect in useEffect
  }

  // Event not found
  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Event Not Found</h1>
          <p className="mb-6 text-gray-600">
            The event you are looking for does not exist or you don't have permission to view it.
          </p>
          <Link
            href="/events"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (event?.status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            href="/events"
            className="mr-4 text-sm flex items-center hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <span
            className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor()}`}
          >
            {event?.status}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsPlanningWizardOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Planning Wizard
          </Button>
          <Link href={`/events/${eventId}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Event Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Date</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{formatDate(event?.date)}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-2 text-primary" />
            <span className="capitalize">{event?.type || 'Not specified'}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Format</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <span className="capitalize">{event?.format || 'Not specified'}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>{new Date(event?.updated_at || '').toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="improvements">AI Suggestions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">
                {event?.description || 'No description provided'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="mt-1">
                  {event?.location || 'No location specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Estimated Guests
                </h3>
                <p className="mt-1">
                  {event?.estimatedGuests || 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                <p className="mt-1">
                  {event?.budget ? `$${event.budget}` : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <p className="text-muted-foreground">
            No tasks yet. Add your first task to get started with planning.
          </p>
          <Button className="mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Task
          </Button>
        </TabsContent>
        
        <TabsContent value="guests" className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Guest Management</h2>
          <p className="text-muted-foreground">
            No guests yet. Add guests to manage your attendees.
          </p>
          <Button className="mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Guest
          </Button>
        </TabsContent>
        
        <TabsContent value="vendors" className="bg-white p-6 rounded-lg border">
          <EventVendors event={event} />
        </TabsContent>
        
        <TabsContent value="improvements" className="bg-white p-6 rounded-lg border">
          <EventImprovements event={event} />
        </TabsContent>
      </Tabs>
      
      {/* Planning Wizard */}
      <PlanningWizard 
        isOpen={isPlanningWizardOpen} 
        onClose={() => setIsPlanningWizardOpen(false)}
      />
    </div>
  )
}