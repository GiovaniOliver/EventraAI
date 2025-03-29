'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark,
  DollarSign,
  CheckSquare,
  AlertCircle,
  Pencil,
  ChevronLeft,
  Share2,
  Trash2
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// Type for event details
interface EventDetail {
  id: string
  title: string
  description?: string
  type: string
  format: string
  date?: string
  startDate?: string
  endDate?: string
  location?: string
  status: string
  estimatedGuests?: number
  budget?: number
  completedTasks?: number
  totalTasks?: number
}

interface EventDetailViewProps {
  event: EventDetail
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function EventDetailView({ event, onEdit, onDelete }: EventDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  
  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this event with others.',
    })
  }
  
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete?.(event.id)
      router.push('/events')
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000) // Reset after 3 seconds
    }
  }
  
  // Format date
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return 'TBD'
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE, MMMM d, yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  const formatEventTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'h:mm a')
    } catch (error) {
      return ''
    }
  }
  
  // Status badge styling
  const statusStyles = {
    draft: 'bg-gray-100 text-gray-800',
    planning: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  
  const statusStyle = statusStyles[event.status.toLowerCase() as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
  
  // Calculate task completion percentage
  const taskCompletion = event.totalTasks 
    ? Math.round((event.completedTasks || 0) / event.totalTasks * 100) 
    : 0
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button 
          variant="ghost" 
          className="mb-2 p-0 text-muted-foreground" 
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      
      {/* Event header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {event.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className={cn(statusStyle)}>
              {event.status}
            </Badge>
            <Badge variant="outline">
              {event.type}
            </Badge>
            {event.format && (
              <Badge variant="outline">
                {event.format}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(event.id)}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button
            variant={confirmDelete ? "destructive" : "outline"}
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {confirmDelete ? "Confirm" : "Delete"}
          </Button>
        </div>
      </div>
      
      {/* Event details */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          {/* Basic info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatEventDate(event.date || event.startDate)}
                    </p>
                  </div>
                </div>
                
                {(event.date || event.startDate) && (
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventTime(event.date || event.startDate)}
                        {event.endDate && ` - ${formatEventTime(event.endDate)}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {event.estimatedGuests && (
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium">Estimated Guests</p>
                      <p className="text-sm text-muted-foreground">{event.estimatedGuests}</p>
                    </div>
                  </div>
                )}
                
                {event.budget && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="mt-0.5 h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-sm text-muted-foreground">
                        ${event.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <Bookmark className="mt-0.5 h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium">Type & Format</p>
                    <p className="text-sm text-muted-foreground">
                      {event.type} - {event.format}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Description card */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Task Completion</CardTitle>
                <Badge variant="outline" className="gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {event.completedTasks || 0}/{event.totalTasks || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{taskCompletion}%</span>
                </div>
                <Progress value={taskCompletion} className="h-2" />
              </div>
              
              {(event.totalTasks || 0) === 0 ? (
                <div className="flex items-center justify-center rounded-md bg-muted p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No tasks have been added yet</p>
                    <Button size="sm" variant="outline">
                      Add Tasks
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Button className="w-full">View All Tasks</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Budget Overview</CardTitle>
                <div className="text-right">
                  <p className="text-sm font-medium">Total Budget</p>
                  <p className="text-xl font-bold">${event.budget?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {event.budget ? (
                <div className="text-center">
                  <Button className="w-full">View Budget Details</Button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-md bg-muted p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <DollarSign className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No budget has been set</p>
                    <Button size="sm" variant="outline">
                      Set Budget
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
