'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import EventForm from '@/components/EventForm'
import Link from 'next/link'

interface EditEventPageProps {
  params: {
    eventId: string
  }
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = params
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Loading...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center p-4 px-6">
          <Link
            href={`/events/${eventId}`}
            className="mr-4 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            &larr; Back to Event
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <EventForm 
            eventId={eventId} 
            onSuccess={(event) => router.push(`/events/${event.id}`)} 
            onCancel={() => router.push(`/events/${eventId}`)}
          />
        </div>
      </main>
    </div>
  )
} 