'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks'
import { 
  Calendar, 
  SparkleIcon, 
  WandSparkles, 
  ChevronRight 
} from 'lucide-react'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const { user } = useAuth()
  
  return (
    <section className={`relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24 ${className}`}>
      <div className="absolute inset-0 opacity-20">
        <svg
          className="h-full w-full"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(300,300)">
            <path
              d="M125,-160.4C159.9,-146.7,184.6,-107.3,190.4,-67C196.2,-26.6,183.1,14.6,169.8,58.5C156.4,102.4,142.9,148.9,111.1,164.3C79.3,179.7,29.3,164,1,148C-27.3,132,-32.8,115.7,-48.9,102.1C-64.9,88.5,-91.5,77.7,-107.5,57.4C-123.6,37.2,-129.1,7.5,-123.4,-18.3C-117.7,-44.2,-100.7,-66.1,-79.3,-80.5C-57.9,-94.9,-31.9,-101.8,5.4,-109.4C42.7,-117,90.1,-124.1,125,-160.4Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20 items-center">
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <div className="bg-primary/10 text-primary rounded-full py-1 px-3 text-sm inline-flex items-center">
                <SparkleIcon className="h-3.5 w-3.5 mr-1" />
                <span>AI-powered event planning</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Plan perfect events <br />
                <span className="text-primary">with AI assistance</span>
              </h1>
              
              <p className="mt-4 text-xl text-muted-foreground max-w-lg">
                Create, organize, and manage unforgettable events with intelligent 
                suggestions, automated tasks, and seamless collaboration.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/auth">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 text-sm text-muted-foreground">
              <p className="flex items-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Free for up to 3 events. No credit card required.
              </p>
            </div>
          </div>
          
          <div className="relative lg:ml-auto">
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border bg-background shadow-lg">
                <div className="p-1">
                  <img
                    src="/images/dashboard-preview.webp"
                    alt="EventraAI dashboard preview"
                    className="rounded-lg shadow-md w-full"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
              
              <div className="absolute -right-6 -top-6 overflow-hidden rounded-lg border bg-background shadow-lg">
                <div className="flex items-center gap-2 p-3">
                  <WandSparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm">AI suggests tasks</span>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 overflow-hidden rounded-lg border bg-background shadow-lg">
                <div className="flex items-center gap-2 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm">Smart Scheduling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
