'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Clock, ArrowLeft, ExternalLink, Copy, QrCode } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import EventPreview from '@/components/sharing/EventPreview'
import QRCodePreview from '@/components/sharing/QRCodePreview'
import { Event } from '@/hooks/use-events'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SharedEventPageProps {
  params: { eventId: string }
}

export default function SharedEventPage({ 
  params 
}: SharedEventPageProps) {
  const searchParams = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Get display options from URL params
  const showImage = searchParams.get('img') !== '0'
  const showDetails = searchParams.get('details') !== '0'
  const activeTab = searchParams.get('tab') === 'qrcode' ? 'qrcode' : 'info'
  
  // Track page view
  useEffect(() => {
    const trackView = async () => {
      if (!params.eventId) return
      
      try {
        // Get referrer information
        const referrer = document.referrer ? 
          new URL(document.referrer).hostname : 
          'direct'
        
        // Call the view tracking API
        await fetch('/api/events/shared/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: params.eventId,
            referrer
          }),
        })
        
        // No need to handle the response or show errors to the user
        // This is just analytics tracking
      } catch (err) {
        // Silently log errors but don't show to user
        console.error('Error tracking view:', err)
      }
    }
    
    // Only track view after the event data is loaded
    if (event) {
      trackView()
    }
  }, [params.eventId, event])
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/events/shared/${params.eventId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to load event')
        }
        
        const eventData = await response.json()
        setEvent(eventData as Event)
      } catch (err) {
        console.error('Error fetching event: ', err)
        setError(err instanceof Error ? err.message : 'Unable to load event details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [params.eventId])
  
  // Handle copying link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "The event link has been copied to your clipboard."
      })
    } catch (err) {
      console.error('Failed to copy link:', err)
      toast({
        title: "Copy failed",
        description: "Could not copy the link. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <Card className="mb-4">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4 mt-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>
              {error || "We couldn't find the event you're looking for."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Homepage
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Format date for display
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE, MMMM d, yyyy')
    } catch (error) {
      return 'Date not available'
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <EventPreview 
              event={event} 
              showImage={showImage} 
              showDetails={showDetails}
              className="shadow-md"
            />
          </div>
          
          <div className="space-y-4">
            <Tabs defaultValue={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Event Info</TabsTrigger>
                <TabsTrigger value="qrcode">QR Code</TabsTrigger>
              </TabsList>
            
              <TabsContent value="info" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatEventDate(event.date || event.start_date || '')}
                        </p>
                        <p className="text-xs text-muted-foreground">Save the date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(event.date || event.start_date || '').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">Start time</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" asChild>
                      <Link href={`/events/${event.id}`}>
                        Register for Event
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="mt-4 bg-muted p-4 rounded-lg border border-border/60">
                  <h3 className="text-sm font-medium mb-2">Share this Event</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" /> Copy Link
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="qrcode" className="pt-4">
                <QRCodePreview 
                  url={window.location.href} 
                  title="Event QR Code"
                />
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <p>Scan this QR code to share this event with others</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 