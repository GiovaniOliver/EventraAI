'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Clock, Calendar, BarChart, MapPin, Briefcase, Building, Presentation, Layers, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ConferencePromotionPage() {
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

      {/* Hero section with angled layout */}
      <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {/* Angled divider */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[hsl(var(--eventra-blue))]/5 transform -skew-y-6"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="max-w-xl">
              <div className="flex space-x-2 items-center mb-6">
                <div className="h-px w-8 bg-[hsl(var(--eventra-blue))]"></div>
                <span className="text-[hsl(var(--eventra-blue))] font-semibold tracking-wider uppercase text-sm">
                  Corporate & Business Events
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Elevate Your <span className="eventra-gradient-text">Business Events</span> With Precision
              </h1>
              
              <p className="mt-6 text-lg text-gray-600">
                Transform your conferences, workshops, and corporate gatherings with EventraAI's 
                powerful planning platform. Designed specifically for business professionals who 
                demand excellence and efficiency.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link 
                  href="/auth/signup" 
                  className="rounded-md bg-[hsl(var(--eventra-blue))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors focus:outline-none"
                >
                  Start Planning Your Event
                </Link>
                <a 
                  href="#features" 
                  className="group rounded-md border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none inline-flex items-center"
                >
                  Explore Features
                  <ArrowRight className="ml-2 h-4 w-4 text-gray-500 group-hover:text-[hsl(var(--eventra-blue))] transition-colors" />
                </a>
              </div>
              
              {/* Metrics */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">35%</div>
                  <div className="text-sm text-gray-600 mt-1">Planning Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">98%</div>
                  <div className="text-sm text-gray-600 mt-1">Client Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">5x</div>
                  <div className="text-sm text-gray-600 mt-1">ROI Improvement</div>
                </div>
              </div>
            </div>
            
            {/* Image with overlay elements */}
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src="/images/promotion/conference.jpg" 
                  alt="Business professionals at a conference" 
                  width={600} 
                  height={400}
                  className="h-auto w-full object-cover"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-5 -right-5 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                  <span className="text-gray-900 font-medium">Streamlined Scheduling</span>
                </div>
              </div>
              
              <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--eventra-purple))]" />
                  <span className="text-gray-900 font-medium">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Conference Planning Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Our specialized tools for business events help you create professional, impactful conferences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Registration Management</h3>
              <p className="text-gray-600">
                Streamline attendee registration with customizable forms, automatic confirmations, and badge generation.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Presentation className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Speaker & Agenda Planning</h3>
              <p className="text-gray-600">
                Organize speakers, schedule sessions, and create detailed agendas with our intuitive tools.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Venue Selection</h3>
              <p className="text-gray-600">
                Find and compare venues, manage floor plans, and coordinate room setups for your business event.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Exhibitor Management</h3>
              <p className="text-gray-600">
                Coordinate exhibitors, booth assignments, and sponsorship packages with ease.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analytics & Reporting</h3>
              <p className="text-gray-600">
                Gain insights from comprehensive event data, attendance metrics, and feedback analysis.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Budget Management</h3>
              <p className="text-gray-600">
                Track expenses, manage payments, and monitor your budget in real-time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Conference types section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ideal For All Business Events</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI adapts to any type of professional gathering or corporate event.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Building className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Industry Conferences</h3>
              <p className="text-gray-600">
                Large-scale professional gatherings with multiple tracks, speakers, and networking opportunities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Workshops</h3>
              <p className="text-gray-600">
                Focused sessions for teams to collaborate, brainstorm, and develop new strategies.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trade Shows</h3>
              <p className="text-gray-600">
                Exhibitions featuring multiple vendors, product demonstrations, and industry networking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Corporate Retreats</h3>
              <p className="text-gray-600">
                Team-building events and strategic planning sessions in unique venues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI section with cards in horizontal layout */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Measurable Business Benefits</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI delivers tangible return on investment for your business events.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">35%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Time Savings</h3>
              <p className="text-gray-600 text-center">
                Reduce planning time by 35% with our streamlined workflows and automation tools.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-purple))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">24%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Higher Attendance</h3>
              <p className="text-gray-600 text-center">
                Events planned with EventraAI see an average 24% increase in attendee registration rates.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">18%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Cost Reduction</h3>
              <p className="text-gray-600 text-center">
                Optimize your budget and reduce overall event costs by up to 18% through better planning tools.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Business Leaders Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from professionals who've transformed their business events with EventraAI.
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
                "EventraAI revolutionized how we manage our annual tech conference. The registration system and analytics tools gave us insights we never had before."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Jennifer Mitchell</p>
                <p className="text-sm text-gray-600">Director of Events, TechCorp International</p>
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
                "The speaker management and scheduling tools saved our team countless hours of work. We'll never plan another corporate event without EventraAI."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Robert Chang</p>
                <p className="text-sm text-gray-600">CEO, Innovate Partners</p>
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
                "We reduced our event planning costs by 22% while increasing attendee satisfaction. The ROI from switching to EventraAI was immediate and substantial."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Maria Rodriguez</p>
                <p className="text-sm text-gray-600">Event Manager, Global Solutions Group</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Start Planning Your Business Event</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join industry leaders who trust EventraAI to deliver exceptional business events.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-blue))] hover:bg-gray-100"
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