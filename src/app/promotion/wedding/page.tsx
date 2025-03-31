'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Users, Clock, Heart, Gift, Utensils, MapPin, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function WeddingPromotionPage() {
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
            href="/signup"
            className="rounded-md bg-[hsl(var(--eventra-blue))] px-4 py-1.5 text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors"
          >
            Start Planning
          </Link>
        </div>
      </header>

      {/* Hero section with decorative elements */}
      <section className="relative bg-white pt-16 pb-24 md:py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-64 bg-[hsl(var(--eventra-purple))]/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-40 bg-[hsl(var(--eventra-blue))]/5 rounded-tr-full"></div>
        
        {/* Decorative rings */}
        <div className="absolute top-20 left-10 w-16 h-16 border-8 border-[hsl(var(--eventra-purple))]/10 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border-8 border-[hsl(var(--eventra-blue))]/10 rounded-full"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Content */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="md:pr-6">
                <div className="inline-block px-4 py-1 mb-6 rounded-full border border-[hsl(var(--eventra-purple))]/30 text-[hsl(var(--eventra-purple))] text-sm font-medium">
                  Wedding Planning Made Simple
                </div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                  Plan Your Perfect <span className="eventra-gradient-text">Wedding</span> With EventraAI
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  Seamlessly organize your special day with our AI-powered wedding planning tools. 
                  From venue selection to guest list management, EventraAI helps create 
                  the wedding of your dreams without the stress.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link 
                    href="/signup" 
                    className="rounded-md bg-[hsl(var(--eventra-blue))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors focus:outline-none"
                  >
                    Start Planning Your Wedding
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
            
            {/* Image container with overlapping elements */}
            <div className="md:col-span-6 lg:col-span-7 relative">
              <div className="relative ml-auto max-w-lg">
                {/* Main image */}
                <div className="rounded-lg overflow-hidden shadow-xl relative z-20">
                  <Image 
                    src="/images/promotion/wedding.jpg" 
                    alt="Couple planning their wedding with EventraAI" 
                    width={600} 
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[hsl(var(--eventra-purple))]/10 rounded-lg z-10"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[hsl(var(--eventra-blue))]/10 rounded-lg z-10"></div>
                
                {/* Success stat */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 z-30">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-2 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Happy Couples</div>
                      <div className="text-xl font-bold text-[hsl(var(--eventra-blue))]">1,000+</div>
                    </div>
                  </div>
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
            <h2 className="text-3xl font-bold text-gray-900">Wedding Planning Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Everything you need to plan the perfect wedding, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Guest List Management</h3>
              <p className="text-gray-600">
                Easily create and manage your guest list, track RSVPs, and organize seating arrangements.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Venue Selection</h3>
              <p className="text-gray-600">
                Browse and compare venues, schedule visits, and keep track of all venue details in one place.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Timeline Creation</h3>
              <p className="text-gray-600">
                Build a detailed wedding day timeline, from getting ready to the last dance.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Vendor Management</h3>
              <p className="text-gray-600">
                Find and coordinate with caterers, photographers, florists, and other vendors.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gift Registry</h3>
              <p className="text-gray-600">
                Create and manage your wedding registry, making it easy for guests to find the perfect gift.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Budget Tracking</h3>
              <p className="text-gray-600">
                Set a wedding budget and track expenses to ensure you stay on target for your big day.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Couples Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from couples who used EventraAI to plan their perfect wedding day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "EventraAI made planning our wedding so much easier! The guest management features saved us countless hours of work."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Emily & Michael</p>
                <p className="text-sm text-gray-600">Wedding Date: June 2024</p>
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
                "The budget tracking feature kept us on target. We were able to have our dream wedding without the financial stress!"
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Sarah & David</p>
                <p className="text-sm text-gray-600">Wedding Date: September 2024</p>
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
                "The AI-powered vendor recommendations were spot on! We found our photographer and caterer through EventraAI and couldn't be happier."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Jessica & Andrew</p>
                <p className="text-sm text-gray-600">Wedding Date: May 2024</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Start Planning Your Dream Wedding Today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join thousands of couples who have planned their perfect wedding day with EventraAI.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
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