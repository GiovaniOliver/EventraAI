'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useEvents } from '@/hooks/use-events'
import Link from 'next/link'

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
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
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
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null // Will redirect in useEffect
  }

  // Event not found
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Event Not Found</h1>
          <p className="mb-6 text-gray-600">
            The event you are looking for does not exist or you don't have permission to view it.
          </p>
          <Link
            href="/events"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
          <div className="flex items-center">
            <Link
              href="/events"
              className="mr-4 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              &larr; Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/events/${eventId}/edit`}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit Event
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{event?.title}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor()}`}
              >
                {event?.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Created {new Date(event?.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event?.description || 'No description provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event?.location || 'No location specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(event?.start_date)}
                  {event?.end_date && ` - ${formatDate(event?.end_date)}`}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(event?.updated_at || '').toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Add task section or other related content here */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Tasks for this Event</h3>
          <p className="mt-2 text-gray-600">No tasks yet. Add your first task to get started.</p>
          <button
            onClick={() => alert('Task creation functionality would go here')}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Task
          </button>
        </div>
      </main>
    </div>
  )
} 