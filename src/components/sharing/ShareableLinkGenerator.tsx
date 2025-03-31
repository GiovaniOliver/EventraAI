'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check as CheckIcon, Copy as ClipboardCopyIcon, QrCode as QrCodeIcon, Share as ShareIcon, Facebook as FacebookIcon, Twitter as TwitterIcon, Linkedin as LinkedinIcon, Link as LinkIcon, Instagram as InstagramIcon, Mail as MailIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import EventPreview from './EventPreview'
import QRCodeGenerator from './QRCodeGenerator'
import { Event } from '@/hooks/use-events'

interface ShareableLinkGeneratorProps {
  event: Event
  onClose?: () => void
  className?: string
}

export default function ShareableLinkGenerator({
  event,
  onClose,
  className
}: ShareableLinkGeneratorProps) {
  const { toast } = useToast()
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [tab, setTab] = useState('link')
  const [includeImage, setIncludeImage] = useState(true)
  const [includeDetails, setIncludeDetails] = useState(true)

  // Generate the shareable URL based on the event ID
  useEffect(() => {
    if (typeof window !== 'undefined' && event) {
      const baseUrl = window.location.origin
      const url = new URL(`${baseUrl}/events/share/${event.id}`)
      
      // Add query parameters for customization
      if (includeImage) {
        url.searchParams.append('img', '1')
      }
      if (includeDetails) {
        url.searchParams.append('details', '1')
      }
      
      setShareUrl(url.toString())
    }
  }, [event, includeImage, includeDetails])

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: 'Link copied!',
        description: 'The shareable link has been copied to your clipboard.',
      })
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy the link to your clipboard.',
        variant: 'destructive',
      })
    }
  }

  // Share to social media
  const handleShare = (platform: string) => {
    let shareUrl = ''
    const eventTitle = event.title || event.name || ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this event: ${eventTitle}`)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Invitation: ${eventTitle}`)}&body=${encodeURIComponent(`I'd like to invite you to this event: ${shareUrl}`)}`
        break
      default:
        shareUrl = ''
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ShareIcon className="h-5 w-5 text-primary" />
              Share Event
            </CardTitle>
            <CardDescription>
              Generate a shareable link with custom preview for your event
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {event.status === 'planning' ? 'Planning' : 
             event.status === 'upcoming' ? 'Upcoming' : 
             event.status === 'in-progress' ? 'In Progress' : 
             event.status === 'completed' ? 'Completed' : 
             event.status === 'cancelled' ? 'Cancelled' : 'Draft'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="link" value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input 
                    value={shareUrl}
                    readOnly
                    className="bg-muted/50 text-sm"
                  />
                </div>
                <Button 
                  onClick={handleCopy} 
                  variant="outline" 
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? 
                    <CheckIcon className="h-4 w-4 text-green-500" /> : 
                    <ClipboardCopyIcon className="h-4 w-4" />
                  }
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will directly open a preview of your event that can be shared with anyone
              </p>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/60 space-y-4">
              <h3 className="text-sm font-medium">Link Preview Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-image" className="text-sm">Include Event Image</Label>
                  <p className="text-xs text-muted-foreground">Display event image in the preview</p>
                </div>
                <Switch 
                  id="include-image" 
                  checked={includeImage} 
                  onCheckedChange={setIncludeImage}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-details" className="text-sm">Include Event Details</Label>
                  <p className="text-xs text-muted-foreground">Show date, location, and description</p>
                </div>
                <Switch 
                  id="include-details" 
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode" className="pt-4">
            <QRCodeGenerator url={shareUrl} eventName={event.title || event.name || ''} />
          </TabsContent>
          
          <TabsContent value="social" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Share to social media</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  onClick={() => handleShare('facebook')}
                >
                  <FacebookIcon className="h-4 w-4" />
                  Facebook
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
                  onClick={() => handleShare('twitter')}
                >
                  <TwitterIcon className="h-4 w-4" />
                  Twitter
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                  onClick={() => handleShare('linkedin')}
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  onClick={() => handleShare('email')}
                >
                  <MailIcon className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {showPreview && tab === 'link' && (
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium">Link Preview</h3>
                <p className="text-xs text-muted-foreground">How others will see your event</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900">
              <EventPreview 
                event={event} 
                showImage={includeImage} 
                showDetails={includeDetails} 
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Anyone with this link can view your event's details
        </p>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button onClick={handleCopy} className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 