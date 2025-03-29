'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: number
  content: string
  author: {
    name: string
    role: string
    company?: string
    avatar?: string
  }
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "EventraAI transformed how we organize corporate events. The AI suggestions saved us countless hours, and the analytics provided valuable insights for improving future gatherings.",
    author: {
      name: "Sarah Johnson",
      role: "Events Director",
      company: "TechCorp Global",
      avatar: "/images/testimonials/sarah.webp"
    },
    rating: 5
  },
  {
    id: 2,
    content: "Planning my daughter's wedding was surprisingly stress-free thanks to EventraAI. The vendor recommendations were spot-on, and the collaboration tools kept everyone on the same page.",
    author: {
      name: "Michael Rodriguez",
      role: "Parent of the Bride",
      avatar: "/images/testimonials/michael.webp"
    },
    rating: 5
  },
  {
    id: 3,
    content: "As a conference organizer, I've tried numerous platforms. EventraAI stands out with its intuitive interface and powerful AI capabilities. It's become our go-to solution for all events.",
    author: {
      name: "Jennifer Chen",
      role: "Conference Manager",
      company: "InnovateX Summits",
      avatar: "/images/testimonials/jennifer.webp"
    },
    rating: 4
  },
  {
    id: 4,
    content: "The analytics dashboard alone is worth the subscription. Being able to track attendee engagement and get automated feedback reports has elevated our university events.",
    author: {
      name: "Dr. David Morris",
      role: "University Events Coordinator",
      company: "Westfield College",
      avatar: "/images/testimonials/david.webp"
    },
    rating: 5
  },
  {
    id: 5,
    content: "EventraAI's collaborative tools made planning our nonprofit fundraiser seamless, even with volunteers across different time zones. Highly recommend!",
    author: {
      name: "Aisha Washington",
      role: "Nonprofit Founder",
      company: "HopeRise Foundation",
      avatar: "/images/testimonials/aisha.webp"
    },
    rating: 5
  }
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleTestimonials = 3
  
  const next = () => {
    setActiveIndex((current) => 
      current + 1 >= testimonials.length ? 0 : current + 1
    )
  }
  
  const prev = () => {
    setActiveIndex((current) => 
      current - 1 < 0 ? testimonials.length - 1 : current - 1
    )
  }
  
  // Calculate visible testimonials with wrap-around
  const getVisibleTestimonials = () => {
    const results = []
    for (let i = 0; i < visibleTestimonials; i++) {
      const index = (activeIndex + i) % testimonials.length
      results.push(testimonials[index])
    }
    return results
  }
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          "h-4 w-4", 
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )} 
      />
    ))
  }
  
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl sm:text-4xl tracking-tight mb-4">
            Loved by event planners <span className="text-primary">worldwide</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our customers have to say about how EventraAI has transformed their event planning process.
          </p>
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisibleTestimonials().map((testimonial, index) => (
              <Card key={testimonial.id} className={cn(
                "transition-all duration-300 h-full",
                index === 1 ? "md:scale-105 md:shadow-lg" : "md:opacity-90"
              )}>
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="h-10 w-10 text-primary/20 mb-4" />
                  
                  <div className="flex mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-foreground mb-6 flex-grow">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center mt-auto pt-4 border-t">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={testimonial.author.avatar} alt={testimonial.author.name} />
                      <AvatarFallback>{testimonial.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {testimonial.author.role}
                        {testimonial.author.company && ` • ${testimonial.author.company}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline" 
              size="icon"
              onClick={prev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" 
              size="icon"
              onClick={next}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
