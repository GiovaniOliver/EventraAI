'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  MoreVertical, 
  Pencil, 
  Copy, 
  Trash2,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EventShareButton from '@/components/sharing/EventShareButton'

// Type definitions
export interface EventCardProps {
  id: string
  title: string
  date: string
  location?: string
  type: string
  estimatedGuests?: number
  status: string
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export function EventCard({
  id,
  title,
  date,
  location,
  type,
  estimatedGuests,
  status,
  onEdit,
  onDuplicate,
  onDelete,
  className,
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Format date
  let formattedDate = 'TBD'
  let formattedTime = ''
  
  try {
    if (date) {
      const dateObj = new Date(date)
      formattedDate = format(dateObj, 'MMM d, yyyy')
      formattedTime = format(dateObj, 'h:mm a')
    }
  } catch (error) {
    console.error('Date formatting error:', error)
  }
  
  // Status badge styling
  const statusStyles = {
    draft: 'bg-gray-100 text-gray-800',
    planning: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  
  const statusStyle = statusStyles[status.toLowerCase() as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
  
  // Event type badge styling
  const typeStyles = {
    wedding: 'bg-pink-100 text-pink-800',
    corporate: 'bg-indigo-100 text-indigo-800',
    social: 'bg-amber-100 text-amber-800',
    conference: 'bg-cyan-100 text-cyan-800',
    party: 'bg-violet-100 text-violet-800',
    other: 'bg-gray-100 text-gray-800',
  }
  
  const typeStyle = typeStyles[type.toLowerCase() as keyof typeof typeStyles] || 'bg-gray-100 text-gray-800'
  
  // Create an event object for the share button
  const eventObj = {
    id,
    title,
    date,
    location,
    type,
    estimatedGuests,
    status
  }
  
  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Event Card Header with status badge */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white">
            <h3 className="mr-8 line-clamp-1 text-lg font-semibold">{title}</h3>
            <div className="absolute right-2 top-2">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit?.(id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EventShareButton 
                      event={eventObj as any}
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto font-normal text-sm"
                    />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => onDelete?.(id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Event Info */}
          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className={cn('font-normal', statusStyle)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="secondary" className={cn('font-normal', typeStyle)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                <span>{formattedDate}</span>
              </div>
              
              {formattedTime && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>{formattedTime}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-indigo-500" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
              
              {estimatedGuests && (
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>{estimatedGuests} guests</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 p-4">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => onEdit?.(id)}
        >
          Edit Details
        </Button>
        <div className="flex gap-2">
          <EventShareButton 
            event={eventObj as any}
            size="sm"
            variant="outline"
            iconOnly={true}
          />
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            asChild
          >
            <Link href={`/events/${id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
