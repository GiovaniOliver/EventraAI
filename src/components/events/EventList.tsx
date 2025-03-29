'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEvents, Event } from '@/hooks/use-events'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, 
  MapPin, 
  Edit, 
  Trash2 
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

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
    <Badge variant="outline" className={getStatusStyles()}>
      {status}
    </Badge>
  )
}

// Event list props
interface EventListProps {
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  emptyMessage?: string
  onSelect?: (event: Event) => void
}

export default function EventList({
  limit = 10,
  showFilters = true,
  showPagination = true,
  emptyMessage = 'No events found',
  onSelect,
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
  } = useEvents()

  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Handle status filter changes
  const handleStatusChange = (value: string) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Your Events</CardTitle>
        <CardDescription>Manage all your events from one place</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select
                value={filter.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Show:</span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => changeLimit(Number(value))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            <Button asChild>
              <Link href="/events/new">Create New Event</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow 
                  key={event.id}
                  className={onSelect ? "cursor-pointer hover:bg-accent/50" : ""}
                  onClick={() => onSelect && onSelect(event)}
                >
                  <TableCell>
                    <div className="font-medium">{event.title}</div>
                    {event.location && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.start_date && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.start_date).toLocaleDateString()}
                        {event.end_date &&
                          ` - ${new Date(event.end_date).toLocaleDateString()}`}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/events/${event.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(event.id)
                        }}
                        disabled={isDeleting === event.id}
                      >
                        {isDeleting === event.id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {showPagination && pagination.total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => changePage(Math.max(0, pagination.offset - pagination.limit))}
                disabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => changePage(pagination.offset + pagination.limit)}
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
