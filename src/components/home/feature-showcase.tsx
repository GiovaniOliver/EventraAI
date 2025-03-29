'use client'

import { 
  CalendarDays, 
  Sparkles, 
  Users, 
  MoveRight, 
  BarChart4, 
  PanelLeftClose, 
  BadgeCheck, 
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Feature {
  icon: React.ElementType
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'AI-Powered Planning',
    description: 'Smart suggestions for venues, vendors, and schedules based on your event type and preferences.'
  },
  {
    icon: CalendarDays,
    title: 'Smart Scheduling',
    description: 'Automatically schedule tasks and reminders with optimal timing for flawless execution.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members, assign tasks, and coordinate efficiently in real-time.'
  },
  {
    icon: BarChart4,
    title: 'Advanced Analytics',
    description: 'Track attendance, engagement, and feedback to measure success and improve future events.'
  },
  {
    icon: PanelLeftClose,
    title: 'Customizable Templates',
    description: 'Start with proven templates for different event types and customize to your needs.'
  },
  {
    icon: Palette,
    title: 'Beautiful Invitations',
    description: 'Create stunning digital invitations and landing pages for your events.'
  }
]

export function FeatureShowcase() {
  return (
    <section className="py-16 sm:py-24" id="features">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl sm:text-4xl tracking-tight mb-4">
            Everything you need to create <span className="text-primary">successful events</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines AI technology with powerful planning tools to make your event organization seamless and stress-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 rounded-2xl p-6 sm:p-10 bg-primary/5 border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <BadgeCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-2xl font-bold tracking-tight mb-4">
                Ready to transform your event planning experience?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of event planners who are creating memorable experiences with less stress and better results.
              </p>
              <Button asChild size="lg">
                <Link href="/pricing">
                  View Pricing
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-xl lg:ml-auto">
              <img 
                src="/images/event-preview.webp" 
                alt="EventraAI Event Preview" 
                className="w-full h-auto"
                width={500}
                height={320}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
