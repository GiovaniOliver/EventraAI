'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Users, Clock, Cake, Gift, Sparkles, MapPin, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function BirthdayPromotionPage() {
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
              className="h-auto w-auto object-contain mr-2 mt-3"
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

      {/* Hero section with circular elements */}
      <section className="relative bg-white py-16 md:py-24 overflow-hidden">
        {/* Decorative confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-12 h-12 bg-[hsl(var(--eventra-purple))]/10 rounded-full"></div>
          <div className="absolute top-40 left-[20%] w-8 h-8 bg-[hsl(var(--eventra-blue))]/10 rounded-full"></div>
          <div className="absolute top-60 left-[5%] w-6 h-6 bg-[hsl(var(--eventra-purple))]/20 rounded-full"></div>
          
          <div className="absolute top-20 right-[5%] w-10 h-10 bg-[hsl(var(--eventra-blue))]/10 rounded-full"></div>
          <div className="absolute top-60 right-[15%] w-16 h-16 bg-[hsl(var(--eventra-purple))]/10 rounded-full"></div>
          <div className="absolute top-80 right-[10%] w-6 h-6 bg-[hsl(var(--eventra-blue))]/20 rounded-full"></div>
          
          <div className="absolute -bottom-4 left-[30%] w-20 h-20 bg-[hsl(var(--eventra-purple))]/5 rounded-full"></div>
          <div className="absolute -bottom-10 right-[25%] w-24 h-24 bg-[hsl(var(--eventra-blue))]/5 rounded-full"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Circular image */}
            <div className="md:w-1/2 flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-dashed border-[hsl(var(--eventra-purple))]/30 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white shadow-xl">
                  <Image 
                    src="/images/promotion/birthday.jpg" 
                    alt="Person planning a birthday party with EventraAI" 
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 bg-white rounded-full shadow-lg p-3">
                  <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-2 w-10 h-10 flex items-center justify-center">
                    <Cake className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                  </div>
                </div>
                
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-lg p-3">
                  <div className="rounded-full bg-[hsl(var(--eventra-purple))]/10 p-2 w-10 h-10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-[hsl(var(--eventra-purple))]" />
                  </div>
                </div>
                
                <div className="absolute top-1/2 transform -translate-y-1/2 -right-12 bg-white rounded-lg shadow-lg p-2">
                  <div className="text-sm font-medium text-[hsl(var(--eventra-blue))]">Create Memories</div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="max-w-lg">
                <div className="inline-block px-4 py-2 mb-4 bg-[hsl(var(--eventra-purple))]/10 rounded-full text-[hsl(var(--eventra-purple))] text-sm font-medium">
                  Birthday Planning Simplified
                </div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                  Throw An Unforgettable <span className="eventra-gradient-text">Birthday</span> With EventraAI
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  Make any birthday celebration special with our AI-powered planning tools.
                  From intimate gatherings to grand parties, EventraAI helps you create
                  memorable birthday experiences without the hassle.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link 
                    href="/auth/signup" 
                    className="rounded-md bg-[hsl(var(--eventra-blue))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors focus:outline-none"
                  >
                    Start Planning Your Birthday
                  </Link>
                  <Link 
                    href="#features" 
                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Birthday Planning Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Everything you need to plan the perfect birthday celebration, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Guest Management</h3>
              <p className="text-gray-600">
                Create digital invitations, track RSVPs, and manage your guest list with ease.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Venue Ideas</h3>
              <p className="text-gray-600">
                Discover perfect birthday venues based on your party size, location, and budget.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Cake className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Theme Inspiration</h3>
              <p className="text-gray-600">
                Browse trending birthday themes and get personalized decoration ideas.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Entertainment Planning</h3>
              <p className="text-gray-600">
                Plan games, activities, and entertainment options to keep your guests engaged.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gift Coordination</h3>
              <p className="text-gray-600">
                Create wish lists and coordinate gifts to avoid duplicates and ensure satisfaction.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Scheduling Tools</h3>
              <p className="text-gray-600">
                Create a timeline for your birthday celebration and set reminders for important tasks.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Party Types section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Perfect For Any Birthday Celebration</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Whether you're planning an intimate gathering or a milestone celebration, EventraAI has you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kids' Birthdays</h3>
              <p className="text-gray-600">
                Create magical experiences with themed parties, entertainment, and activities designed for children.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Cake className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Milestone Birthdays</h3>
              <p className="text-gray-600">
                Plan memorable 30th, 40th, 50th, and other milestone celebrations with personalized touches.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Surprise Parties</h3>
              <p className="text-gray-600">
                Coordinate secret plans, guest arrivals, and surprise moments without getting caught.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Music className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adult Celebrations</h3>
              <p className="text-gray-600">
                Design sophisticated gatherings with curated entertainment, drinks, and dining options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from people who planned amazing birthday celebrations with EventraAI.
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
                "Planning my son's 10th birthday was a breeze with EventraAI. The theme suggestions and entertainment ideas were perfect for his age group!"
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Jennifer K.</p>
                <p className="text-sm text-gray-600">Kid's Birthday Party</p>
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
                "The surprise party I planned for my wife's 40th was flawless thanks to EventraAI. The scheduling and coordination tools helped me keep everything secret!"
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Robert T.</p>
                <p className="text-sm text-gray-600">Surprise 40th Birthday</p>
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
                "I used EventraAI to plan my 30th birthday party. The venue recommendations were spot on and saved me hours of research!"
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Alicia M.</p>
                <p className="text-sm text-gray-600">30th Birthday Celebration</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Start Planning Your Birthday Celebration Today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join thousands of users who have created memorable birthday experiences with EventraAI.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-blue))] hover:bg-gray-100"
            >
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
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