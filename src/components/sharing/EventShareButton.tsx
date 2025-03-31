'use client'

import React, { useState } from 'react'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { 
  Button,
  ButtonProps
} from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Check,
  Copy,
  Facebook,
  Link as LinkIcon,
  Mail,
  QrCode,
  Share2,
  Twitter,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { Event } from '@/hooks/use-events'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface EventShareButtonProps extends ButtonProps {
  event: Event
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
}

// Add tracking function to track share events
const trackShare = async (eventId: string, platform: string, shareType: string = 'link') => {
  try {
    // Call the share tracking API
    await fetch(`/api/events/${eventId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        shareType
      }),
    })
    
    // No need to handle the response or show errors to the user
    // This is just analytics tracking
  } catch (err) {
    // Silently log errors but don't show to user
    console.error('Error tracking share:', err)
  }
}

export default function EventShareButton({
  event,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  className,
  ...props
}: EventShareButtonProps) {
  const [shareLink, setShareLink] = useState('')
  const [showImage, setShowImage] = useState(true)
  const [showDetails, setShowDetails] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  
  // Generate share link based on options
  const generateShareLink = () => {
    const baseUrl = `${window.location.origin}/events/share/${event.id}`
    const params = new URLSearchParams()
    
    if (!showImage) params.append('img', '0')
    if (!showDetails) params.append('details', '0')
    
    const queryString = params.toString()
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl
    
    setShareLink(fullUrl)
    return fullUrl
  }
  
  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    const link = generateShareLink()
    
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The event link has been copied to your clipboard."
      })
      
      // Track the share
      trackShare(event.id, 'clipboard', 'link')
      
      // Reset copied state after a delay
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      toast({
        title: "Copy failed",
        description: "Could not copy the link. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Share via various platforms
  const handleShare = (platform: string) => {
    const link = generateShareLink()
    const text = `Check out this event: ${event.title || event.name || 'Upcoming Event'}`
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + '\n\n' + link)}`
        break
      default:
        // Use Web Share API if available
        if (navigator.share) {
          navigator.share({
            title: event.title || event.name || 'Upcoming Event',
            text: text,
            url: link
          })
          .then(() => {
            // Track successful share
            trackShare(event.id, 'web-share-api', 'native')
          })
          .catch(err => console.error('Error sharing:', err))
          return
        } else {
          handleCopyLink()
          return
        }
    }
    
    // Open share URL in new window
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      // Track the share
      trackShare(event.id, platform, 'social')
    }
  }
  
  // Generate QR code data (uses external API for simplicity)
  const getQrCodeUrl = () => {
    const link = generateShareLink()
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          {...props}
        >
          <Share2 className={iconOnly ? '' : 'mr-2'} size={16} />
          {!iconOnly && "Share"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Tabs defaultValue="link">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Customize Link</h3>
              <div className="flex items-start gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="showImage" 
                      checked={showImage} 
                      onCheckedChange={(checked) => setShowImage(checked as boolean)}
                    />
                    <Label htmlFor="showImage" className="text-sm font-normal">Show event image</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="showDetails" 
                      checked={showDetails} 
                      onCheckedChange={(checked) => setShowDetails(checked as boolean)}
                    />
                    <Label htmlFor="showDetails" className="text-sm font-normal">Show event details</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shareLink">Share Link</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="shareLink" 
                  value={shareLink || generateShareLink()}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleCopyLink} 
                  className="shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-4">
            <div className="bg-white p-3 rounded-md flex items-center justify-center">
              <div className="relative w-48 h-48">
                <img 
                  src={getQrCodeUrl()} 
                  alt="Event QR Code" 
                  className="w-full h-full" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleCopyLink} className="w-full">
                <LinkIcon className="mr-2" size={16} />
                Copy Link
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/events/share/${event.id}?tab=qrcode`} target="_blank" rel="noopener noreferrer">
                  <QrCode className="mr-2" size={16} />
                  Open QR Code Page
                  <ExternalLink className="ml-2" size={14} />
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2" size={16} />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="mr-2" size={16} />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleShare('whatsapp')}
              >
                <MessageSquare className="mr-2" size={16} />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => handleShare('email')}
              >
                <Mail className="mr-2" size={16} />
                Email
              </Button>
            </div>
            <Button onClick={handleCopyLink} className="w-full">
              <Copy className="mr-2" size={16} />
              Copy Link
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
} 