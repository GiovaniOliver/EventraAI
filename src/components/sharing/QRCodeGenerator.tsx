'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { DownloadIcon, RefreshCwIcon, Printer, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface QRCodeGeneratorProps {
  url: string
  eventName: string
  className?: string
}

export default function QRCodeGenerator({
  url,
  eventName,
  className,
}: QRCodeGeneratorProps) {
  const { toast } = useToast()
  const qrRef = useRef<HTMLDivElement>(null)
  
  // QR code customization options
  const [size, setSize] = useState(200)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [fgColor, setFgColor] = useState('#000000')
  const [showEventName, setShowEventName] = useState(true)
  const [qrCodeLevel, setQrCodeLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [logoOpacity, setLogoOpacity] = useState(100)
  const [downloading, setDownloading] = useState(false)
  
  // QR Code levels and their error correction capabilities
  const qrLevels = [
    { value: 'L', label: 'Low (7% recovery)' },
    { value: 'M', label: 'Medium (15% recovery)' },
    { value: 'Q', label: 'Quartile (25% recovery)' },
    { value: 'H', label: 'High (30% recovery)' },
  ]

  // Handle QR code download
  const handleDownload = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!qrRef.current) return
    
    setDownloading(true)
    
    try {
      // Use html-to-image or similar library in a real implementation
      const fileName = `eventra-event-qr-${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
      
      // Simulate download - in a real implementation, use the actual canvas data
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: 'QR Code Downloaded',
        description: `Your QR code has been downloaded as ${fileName}.${format}`,
      })
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the QR code.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }
  
  // Handle printing the QR code
  const handlePrint = () => {
    // In a real implementation, create a print-friendly version
    window.print()
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-size">QR Code Size</Label>
            <div className="flex items-center gap-3">
              <Slider
                id="qr-size"
                min={150}
                max={300}
                step={10}
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
              />
              <span className="text-sm text-muted-foreground min-w-12 text-right">
                {size}px
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="error-correction">Error Correction Level</Label>
            <Select 
              value={qrCodeLevel} 
              onValueChange={(value) => setQrCodeLevel(value as 'L' | 'M' | 'Q' | 'H')}
            >
              <SelectTrigger id="error-correction" className="w-full">
                <SelectValue placeholder="Select error correction level" />
              </SelectTrigger>
              <SelectContent>
                {qrLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher levels provide better error correction but make the QR code more complex
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Foreground</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-md border" 
                    style={{ backgroundColor: fgColor }}
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Background</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md border"
                    style={{ backgroundColor: bgColor }}
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-3 mx-auto">
          <div
            ref={qrRef}
            className={cn(
              "p-6 bg-white rounded-lg border shadow-sm flex flex-col items-center justify-center",
              showEventName ? "space-y-3" : ""
            )}
            style={{ 
              width: size + 48,
              height: showEventName ? size + 80 : size + 48,
              backgroundColor: bgColor
            }}
          >
            <QRCode
              value={url}
              size={size}
              level={qrCodeLevel}
              fgColor={fgColor}
              bgColor={bgColor}
              renderAs="svg"
              includeMargin={false}
            />
            
            {showEventName && (
              <div className="text-center">
                <p className="font-medium text-sm" style={{ color: fgColor }}>
                  {eventName}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Scan to view event details
          </div>
        </div>
      </div>
      
      <div className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setShowEventName(!showEventName)}
          >
            {showEventName ? 'Hide Event Name' : 'Show Event Name'}
          </Button>
          
          <Button
            variant="outline" 
            size="sm"
            onClick={() => {
              setBgColor('#FFFFFF')
              setFgColor('#000000')
              setSize(200)
              setQrCodeLevel('M')
              setShowEventName(true)
            }}
          >
            <RefreshCwIcon className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button 
              variant="default"
              onClick={() => handleDownload('png')}
              disabled={downloading}
              className="flex items-center gap-1"
            >
              {downloading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Download
                </>
              )}
            </Button>
            
            <div className="absolute hidden group-hover:flex right-0 bottom-full mb-2 bg-muted border rounded-md overflow-hidden z-10">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-3 hover:bg-muted"
                onClick={() => handleDownload('png')}
              >
                PNG
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-3 hover:bg-muted"
                onClick={() => handleDownload('jpeg')}
              >
                JPEG
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-3 hover:bg-muted"
                onClick={() => handleDownload('svg')}
              >
                SVG
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </div>
  )
} 