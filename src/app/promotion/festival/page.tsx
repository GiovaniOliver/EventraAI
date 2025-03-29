'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Music, Users, MapPin, Calendar, Clock, Ticket, Speaker, Instagram, Mic, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function FestivalPromotionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/eventraailogo1.png" 
              alt="EventraAI Logo" 
              width={36} 
              height={36} 
              className="h-auto w-auto object-contain mr-2 mt-0.5"
            />
            <span className="eventra-gradient-text font-semibold">EventraAI</span>
          </Link>
          
          <Link
            href="/auth/signup"
            className="rounded-md bg-[hsl(var(--eventra-blue))] px-4 py-1.5 text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors"
          >
            Start Planning
          </Link>
        </div>
      </header>

      {/* Hero section with full-width image and gradient overlay */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/promotion/festival.jpg" 
            alt="Vibrant festival crowd" 
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--eventra-purple))]/90 via-black/50 to-[hsl(var(--eventra-blue))]/80 mix-blend-multiply"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full bg-[hsl(var(--eventra-purple))]/20 blur-2xl"></div>
          <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full bg-[hsl(var(--eventra-blue))]/20 blur-2xl"></div>
          <div className="absolute top-[30%] left-[15%] w-24 h-24 rounded-full bg-pink-500/20 blur-2xl"></div>
        </div>
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <div className="animate-in slide-in-from-top duration-1000">
              <div className="inline-flex items-center justify-center space-x-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 mb-6">
                <Music className="h-4 w-4 text-[hsl(var(--eventra-blue))]" />
                <span className="text-white font-medium">Music & Cultural Festivals</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-pink-500">Unforgettable</span> Festival Experiences
              </h1>
              
              <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto">
                Elevate your music and cultural festivals with powerful planning tools that help you 
                create immersive experiences your attendees will remember forever.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4 justify-center animate-in slide-in-from-bottom duration-1000 delay-300">
              <Link 
                href="/auth/signup" 
                className="rounded-full bg-white px-6 py-3 text-center text-base font-medium text-[hsl(var(--eventra-purple))] hover:bg-white/90 transition-colors focus:outline-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Planning Your Festival
              </Link>
              <Link 
                href="#features" 
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-center text-base font-medium text-white hover:bg-white/20 transition-colors focus:outline-none"
              >
                Explore Features
              </Link>
            </div>
          </div>
          
          {/* Floating event stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-[hsl(var(--eventra-blue))] rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-black/40 backdrop-blur-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">10k+</div>
                <div className="text-sm text-white/80 mt-1">Average Attendees</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-black/40 backdrop-blur-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">42%</div>
                <div className="text-sm text-white/80 mt-1">Faster Planning</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--eventra-purple))] to-pink-500 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-black/40 backdrop-blur-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-sm text-white/80 mt-1">Attendee Satisfaction</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-[hsl(var(--eventra-purple))] rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-black/40 backdrop-blur-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">55%</div>
                <div className="text-sm text-white/80 mt-1">Revenue Increase</div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <a href="#features" className="inline-flex flex-col items-center text-white/80 hover:text-white transition-colors">
              <span className="text-sm mb-2">Discover More</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Festival Planning Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Everything you need to create unforgettable live music experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Artist Management</h3>
              <p className="text-gray-600">
                Manage artist bookings, contracts, riders, and performance schedules all in one place.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Multi-Stage Scheduling</h3>
              <p className="text-gray-600">
                Create complex schedules across multiple stages with easy drag-and-drop interface.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Ticketing Integration</h3>
              <p className="text-gray-600">
                Connect with major ticketing platforms to manage sales, tiers, and promotions.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Venue Layout Planner</h3>
              <p className="text-gray-600">
                Design and optimize festival grounds with interactive maps for stages, vendors, and facilities.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Instagram className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Marketing & Promotion</h3>
              <p className="text-gray-600">
                Create social media campaigns, artist announcements, and email marketing all integrated in one platform.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Staff & Volunteer Coordination</h3>
              <p className="text-gray-600">
                Manage crew assignments, security scheduling, and volunteer coordination efficiently.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Festival types section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Perfect For All Music Events</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              From intimate shows to major festivals, EventraAI scales to fit your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Mic className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Single-Day Festivals</h3>
              <p className="text-gray-600">
                Create focused, impactful one-day music events with multiple artists.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Day Events</h3>
              <p className="text-gray-600">
                Manage complex weekend or week-long festivals with camping and multiple stages.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Music className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Genre-Specific Shows</h3>
              <p className="text-gray-600">
                Create tailored experiences for niche music communities and specialized audiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Speaker className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Concert Series</h3>
              <p className="text-gray-600">
                Plan and promote connected events throughout a season with consistent branding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success metrics section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Festival Success Metrics</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI helps festival organizers achieve remarkable results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">36%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Increased Ticket Sales</h3>
              <p className="text-gray-600 text-center">
                Festivals using EventraAI see on average a 36% increase in advance ticket sales through better promotion tools.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-purple))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">58%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Planning Time Reduction</h3>
              <p className="text-gray-600 text-center">
                Festival planners save up to 58% of their planning time with our integrated scheduling and management system.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">88%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Attendee Satisfaction</h3>
              <p className="text-gray-600 text-center">
                Festivals managed with EventraAI report an 88% attendee satisfaction rate due to better organization and communication.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Festival Organizers Love Us</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from event professionals who've transformed their music festivals with EventraAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "EventraAI revolutionized our festival planning process. The multi-stage scheduling tool alone saved us weeks of planning time and prevented scheduling conflicts."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Jason Rivera</p>
                <p className="text-sm text-gray-600">Festival Director, SoundWave Festival</p>
              </div>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "The volunteer coordination system made managing our 200+ festival staff effortless. Real-time updates and shift management tools are game-changers."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Alyssa Chen</p>
                <p className="text-sm text-gray-600">Operations Manager, Harmony Music Festival</p>
              </div>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "Our ticket sales increased by 42% after switching to EventraAI. The marketing tools and artist announcement features generated incredible buzz for our indie music festival."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Marcus Williams</p>
                <p className="text-sm text-gray-600">Founder, Underground Sounds Festival</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-purple))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Create Your Next Legendary Festival</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join festival organizers worldwide who trust EventraAI to create unforgettable music experiences.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-purple))] hover:bg-gray-100"
            >
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center">
              <Image 
                src="/images/eventraailogo1.png" 
                alt="EventraAI Logo" 
                width={32} 
                height={32} 
                className="h-auto w-auto object-contain mr-2"
              />
              <span className="eventra-gradient-text font-semibold">EventraAI</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                About
              </Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Blog
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Terms
              </Link>
            </div>
            
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} EventraAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 