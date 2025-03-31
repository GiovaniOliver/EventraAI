'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Users, Clock, Heart, Gift, DollarSign, MapPin, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function FundraiserPromotionPage() {
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

      {/* Hero section with impact-focused split layout */}
      <section className="relative bg-gradient-to-r from-[hsl(var(--eventra-purple))]/5 to-white">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-cover bg-center hidden lg:block" 
             style={{backgroundImage: "url('/fundraising-event.jpg')"}}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/50"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-[hsl(var(--eventra-purple))]/10 px-3 py-1 text-sm font-medium text-[hsl(var(--eventra-purple))] mb-6">
                <Heart className="h-4 w-4" />
                <span>For a Cause That Matters</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="block">Amplify Your</span>
                <span className="eventra-gradient-text">Fundraising Impact</span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-600">
                Organize meaningful fundraisers that inspire generosity and drive change. 
                Our platform helps charitable organizations and cause advocates create 
                impactful events that maximize donations and supporter engagement.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link 
                  href="/signup" 
                  className="rounded-md bg-[hsl(var(--eventra-purple))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-blue))] transition-colors focus:outline-none shadow-md"
                >
                  Start Your Fundraiser
                </Link>
                <Link 
                  href="#features" 
                  className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none border border-gray-200 shadow-sm"
                >
                  See How It Works
                </Link>
              </div>
              
              {/* Impact stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[hsl(var(--eventra-purple))] to-[hsl(var(--eventra-blue))] opacity-20 blur"></div>
                  <div className="relative rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">45%</div>
                    <div className="text-sm text-gray-600 mt-1">More Donations</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[hsl(var(--eventra-purple))] to-[hsl(var(--eventra-blue))] opacity-20 blur"></div>
                  <div className="relative rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">3x</div>
                    <div className="text-sm text-gray-600 mt-1">Wider Reach</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[hsl(var(--eventra-purple))] to-[hsl(var(--eventra-blue))] opacity-20 blur"></div>
                  <div className="relative rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">60%</div>
                    <div className="text-sm text-gray-600 mt-1">Less Admin Time</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main image with stats overlay */}
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              <Image 
                src="/images/promotion/fundraiser.jpg" 
                alt="Fundraising event planning with EventraAI" 
                width={600} 
                height={400}
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Fundraiser Planning Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Everything you need to plan successful charity events and fundraisers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Donation Management</h3>
              <p className="text-gray-600">
                Track donations, manage pledges, and integrate with popular donation platforms.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Volunteer Coordination</h3>
              <p className="text-gray-600">
                Recruit, schedule, and manage volunteers for your fundraising events.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sponsor Management</h3>
              <p className="text-gray-600">
                Attract and manage sponsors, create sponsorship packages, and track contributions.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Auction Management</h3>
              <p className="text-gray-600">
                Organize silent and live auctions with item tracking and bidding systems.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Donor Engagement</h3>
              <p className="text-gray-600">
                Create personalized communications and recognition programs for donors.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Impact Reporting</h3>
              <p className="text-gray-600">
                Generate detailed reports on funds raised and potential impact for your cause.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Fundraiser types section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Perfect For Any Charitable Event</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI supports a wide range of fundraising events to help you make a difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Gift className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Charity Galas</h3>
              <p className="text-gray-600">
                Organize elegant black-tie fundraisers with auctions, entertainment, and high-end donor experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Drives</h3>
              <p className="text-gray-600">
                Coordinate donation drives, volunteer recruitment, and community outreach events.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Benefit Concerts</h3>
              <p className="text-gray-600">
                Plan music events and performances that raise funds and awareness for your cause.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Athletic Fundraisers</h3>
              <p className="text-gray-600">
                Organize walkathons, races, and sports tournaments that combine fitness with philanthropy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Maximize Your Impact</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI helps nonprofits and charitable organizations achieve real results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">47%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Increased Donations</h3>
              <p className="text-gray-600 text-center">
                Organizations using EventraAI report an average 47% increase in donations compared to previous methods.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-purple))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">3.5x</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Donor Retention</h3>
              <p className="text-gray-600 text-center">
                Our engagement tools help improve donor retention rates by 3.5 times the industry average.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">62%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Cost Reduction</h3>
              <p className="text-gray-600 text-center">
                Streamlined planning and volunteer coordination result in an average 62% reduction in administrative costs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from nonprofit leaders who've elevated their fundraising with EventraAI.
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
                "EventraAI helped us raise over $250,000 at our annual gala — a 45% increase from last year. The donor engagement tools were particularly effective."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Sarah Thompson</p>
                <p className="text-sm text-gray-600">Executive Director, Children's Hope Foundation</p>
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
                "We coordinated 300+ volunteers across 15 locations for our community drive using EventraAI. The platform's volunteer management tools are exceptional."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Michael Johnson</p>
                <p className="text-sm text-gray-600">Volunteer Coordinator, Coastal Conservation Trust</p>
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
                "Our charity auction raised twice as much as expected thanks to EventraAI's seamless bidding system and donor engagement features."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Lisa Fernandez</p>
                <p className="text-sm text-gray-600">Development Director, Arts Education Initiative</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Make Your Next Fundraiser a Success</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join hundreds of nonprofit organizations using EventraAI to create impactful fundraising events.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-blue))] hover:bg-gray-100"
            >
              Start Free Nonprofit Trial <ArrowRight className="ml-2 h-4 w-4" />
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