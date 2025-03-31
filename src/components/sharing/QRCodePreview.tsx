'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRCodePreviewProps {
  url: string
  size?: number
  className?: string
  title?: string
}

export default function QRCodePreview({
  url,
  size = 200,
  className,
  title = 'QR Code'
}: QRCodePreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [qrError, setQrError] = useState(false)
  const { toast } = useToast()
  
  // Generate QR code URL using external API
  const getQrCodeUrl = () => {
    // Use QR Server API for simplicity
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`
  }
  
  // Handle QR code download
  const handleDownload = async () => {
    try {
      setIsLoading(true)
      
      // Fetch the QR code image
      const response = await fetch(getQrCodeUrl())
      const blob = await response.blob()
      
      // Create a temporary link to download the image
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `eventra-qr-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'QR Code Downloaded',
        description: 'The QR code has been saved to your device.'
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast({
        title: 'Download Failed',
        description: 'Could not download the QR code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle error when QR code image fails to load
  const handleImageError = () => {
    setQrError(true)
    toast({
      title: 'QR Code Generation Failed',
      description: 'Could not generate the QR code. Please try refreshing.',
      variant: 'destructive'
    })
  }
  
  // Retry loading QR code
  const handleRetry = () => {
    setQrError(false)
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-white p-3 rounded-md w-full flex justify-center">
          {qrError ? (
            <div className="flex flex-col items-center justify-center h-48 w-48 bg-muted border rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Failed to load QR code</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative h-48 w-48">
              <img 
                src={getQrCodeUrl()} 
                alt="Event QR Code" 
                className="w-full h-full"
                onError={handleImageError}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Scan this code to view event details</p>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleDownload} 
          disabled={isLoading || qrError}
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  )
} 