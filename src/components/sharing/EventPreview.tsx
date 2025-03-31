'use client'

import React from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Clock, MapPin, Users, ChevronRight } from 'lucide-react'
import { Event } from '@/hooks/use-events'
import { cn } from '@/lib/utils'

const EVENT_TYPE_IMAGES = {
  conference: '/images/event-types/conference.jpg',
  workshop: '/images/event-types/workshop.jpg',
  webinar: '/images/event-types/webinar.jpg',
  meetup: '/images/event-types/meetup.jpg',
  party: '/images/event-types/party.jpg',
  default: '/images/event-types/default.jpg',
}

interface EventPreviewProps {
  event: Event
  showImage?: boolean
  showDetails?: boolean
  isLink?: boolean
  className?: string
}

export default function EventPreview({
  event,
  showImage = true,
  showDetails = true,
  isLink = false,
  className,
}: EventPreviewProps) {
  // Helper to format the date
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE, MMMM d, yyyy')
    } catch (error) {
      return dateString
    }
  }

  // Helper to format the time
  const formatEventTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'h:mm a')
    } catch (error) {
      return ''
    }
  }

  // Get event image based on type
  const getEventImage = () => {
    const type = (event.type || '').toLowerCase()
    return EVENT_TYPE_IMAGES[type as keyof typeof EVENT_TYPE_IMAGES] || EVENT_TYPE_IMAGES.default
  }

  // Get event title (handling both name and title properties)
  const eventTitle = event.title || event.name || ''

  // Use the appropriate date field (supporting both date and start_date formats)
  const eventDate = event.start_date || event.date || ''

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isLink && "hover:shadow-md",
      className
    )}>
      {showImage && (
        <div className="relative h-48 w-full">
          <Image
            src={getEventImage()}
            alt={eventTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-4">
            <Badge className="mb-2">
              {event.type && event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
            <h2 className="text-white text-xl font-semibold">{eventTitle}</h2>
          </div>
        </div>
      )}

      <CardHeader className={!showImage ? '' : 'pt-0'}>
        {!showImage && (
          <>
            <CardTitle>{eventTitle}</CardTitle>
            {event.type && (
              <Badge className="w-fit">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            )}
          </>
        )}
        
        {event.format && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-xs">
              {event.format.charAt(0).toUpperCase() + event.format.slice(1)}
            </Badge>
          </div>
        )}
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          <div className="flex items-start space-y-1 space-x-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{formatEventDate(eventDate)}</p>
              <p className="text-xs text-muted-foreground">{formatEventTime(eventDate)}</p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start space-y-1 space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{event.location}</p>
              </div>
            </div>
          )}

          {event.estimatedGuests && (
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">{event.estimatedGuests} expected guests</p>
            </div>
          )}

          {event.description && (
            <div className="pt-2 mt-2 border-t">
              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className="border-t bg-muted/20 pt-4">
        <Button className="w-full flex items-center justify-center gap-1">
          View Event Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 