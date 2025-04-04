'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEvents, Event } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import NewEventModal from '@/components/modals/new-event-modal'
import { Calendar, PlusCircle } from 'lucide-react'

// Status badge component
const StatusBadge = ({ status }: { status: Event['status'] }) => {
  const getStatusStyles = () => {
    switch (status) {
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
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles()}`}>
      {status}
    </span>
  )
}

// Event list props
interface EventListProps {
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  emptyMessage?: string
  onSelect?: (event: Event) => void
  filter?: string
}

export default function EventList({
  limit = 10,
  showFilters = true,
  showPagination = true,
  emptyMessage = 'No events found',
  onSelect,
  filter: initialFilter,
}: EventListProps) {
  const {
    events,
    pagination,
    isLoading,
    filter,
    updateFilter,
    changePage,
    changeLimit,
    deleteEvent,
  } = useEvents(initialFilter)

  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)

  // Handle status filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    updateFilter({
      ...filter,
      status: value === 'all' ? undefined : value as Event['status'],
    })
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setIsDeleting(id)
      try {
        await deleteEvent.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event')
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="w-full">
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="status-filter"
              value={filter.status || 'all'}
              onChange={handleStatusChange}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit-select" className="mr-2 text-sm font-medium text-gray-700">
              Show:
            </label>
            <select
              id="limit-select"
              value={pagination.limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
          <span className="ml-2">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, rgba(var(--eventra-teal-rgb), 0.05), rgba(var(--eventra-blue-rgb), 0.07), rgba(var(--eventra-purple-rgb), 0.05))",
            border: "1px solid rgba(var(--eventra-blue-rgb), 0.1)"
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-5 right-5 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl"></div>
            <div className="absolute bottom-5 left-5 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-xl"></div>
          </div>
          
          {/* Icon Container */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] p-[2px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Calendar className="h-8 w-8 text-[hsl(var(--eventra-blue))]" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2 text-foreground">No Events Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{emptyMessage}</p>
          <Button 
            onClick={() => setIsNewEventModalOpen(true)}
            className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Create New Event
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
          {events.map((event) => (
            <li
              key={event.id}
              className={`flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between ${
                onSelect ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => onSelect && onSelect(event)}
            >
              <div className="mb-2 sm:mb-0">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  {event.start_date && (
                    <span>
                      {new Date(event.start_date).toLocaleDateString()}
                      {event.end_date &&
                        ` - ${new Date(event.end_date).toLocaleDateString()}`}
                    </span>
                  )}
                  {event.location && <span>{event.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={event.status} />
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(event.id)
                  }}
                  disabled={isDeleting === event.id}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting === event.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {showPagination && pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {pagination.offset + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(pagination.offset + pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> events
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => changePage(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0}
              className="rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => changePage(pagination.offset + pagination.limit)}
              disabled={
                pagination.offset + pagination.limit >= pagination.total
              }
              className="rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add the modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
      />
    </div>
  )
} 