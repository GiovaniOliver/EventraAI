'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Clock, GraduationCap, Calendar, Award, BarChart, FileText, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function EducationalPromotionPage() {
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

      {/* Hero section with centered content and flanking icons */}
      <section className="bg-gradient-to-br from-white via-blue-50 to-purple-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {/* Floating icons */}
            <div className="relative w-full max-w-4xl mx-auto mb-8">
              <div className="absolute -left-4 md:left-0 top-0 opacity-20 md:opacity-30 transform scale-75 md:scale-100">
                <div className="rounded-full bg-[hsl(var(--eventra-blue))]/20 p-6 w-24 h-24 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                  <BookOpen className="h-12 w-12" />
                </div>
              </div>
              <div className="absolute -right-4 md:right-0 top-10 opacity-20 md:opacity-30 transform scale-75 md:scale-100">
                <div className="rounded-full bg-[hsl(var(--eventra-purple))]/20 p-6 w-24 h-24 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                  <GraduationCap className="h-12 w-12" />
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--eventra-blue))]/10 to-[hsl(var(--eventra-purple))]/10 text-sm font-medium text-[hsl(var(--eventra-blue))]">
                Educational Events & Learning Experiences
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                Elevate <span className="eventra-gradient-text">Educational Events</span> With EventraAI
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                From workshops and seminars to conferences and training sessions, 
                EventraAI helps you create impactful learning experiences 
                that engage and inspire participants.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/auth/signup" 
                  className="rounded-md bg-[hsl(var(--eventra-blue))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors focus:outline-none"
                >
                  Start Planning Your Event
                </Link>
                <Link 
                  href="#features" 
                  className="rounded-md border border-gray-300 bg-white/70 backdrop-blur-sm px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Explore Features
                </Link>
              </div>
            </div>
            
            {/* Bottom image */}
            <div className="mt-12 md:mt-16 relative w-full max-w-4xl">
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100">
                <Image 
                  src="/images/promotion/educational.jpg" 
                  alt="Planning an educational event with EventraAI" 
                  width={900} 
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 border-t border-l border-r border-white/20 rounded-lg pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Educational Event Features</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Everything you need to create engaging and impactful learning experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Instructor Management</h3>
              <p className="text-gray-600">
                Coordinate speakers, trainers, and facilitators with detailed profiles and availability tracking.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Session Scheduling</h3>
              <p className="text-gray-600">
                Create customizable agendas with parallel tracks, breaks, and flexible time slots.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Registration & Attendance</h3>
              <p className="text-gray-600">
                Manage participant registrations, track attendance, and handle waitlists automatically.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Content Management</h3>
              <p className="text-gray-600">
                Organize presentations, handouts, and learning materials with secure sharing options.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Feedback & Assessment</h3>
              <p className="text-gray-600">
                Create surveys, quizzes, and evaluations to measure learning outcomes and gather feedback.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow subtle-gradient-card">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 w-12 h-12 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Certification Tools</h3>
              <p className="text-gray-600">
                Generate and distribute digital certificates for course completion and continuing education.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Event types section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">For Every Learning Format</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI adapts to all types of educational events and learning models.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <PenTool className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Workshops & Trainings</h3>
              <p className="text-gray-600">
                Interactive skill-building sessions with hands-on activities and practical exercises.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Academic Conferences</h3>
              <p className="text-gray-600">
                Research presentations, panel discussions, and peer networking for academic communities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-blue))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-blue))]">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Corporate Training</h3>
              <p className="text-gray-600">
                Professional development programs for employees with progress tracking and reporting.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto rounded-full bg-[hsl(var(--eventra-purple))]/10 p-4 w-16 h-16 flex items-center justify-center text-[hsl(var(--eventra-purple))]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certification Programs</h3>
              <p className="text-gray-600">
                Structured learning paths with assessments, credentials, and completion tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Proven Educational Results</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI helps educational institutions and training providers achieve measurable outcomes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">52%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Increased Engagement</h3>
              <p className="text-gray-600 text-center">
                Educational events using EventraAI report 52% higher participant engagement and information retention.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-purple))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-purple))]">40%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Administrative Efficiency</h3>
              <p className="text-gray-600 text-center">
                On average, organizations reduce administrative workload by 40% with our automated workflows.
              </p>
            </Card>
            
            <Card className="p-6 subtle-gradient-card">
              <div className="mb-4 flex items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--eventra-blue))]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[hsl(var(--eventra-blue))]">94%</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-center">Participant Satisfaction</h3>
              <p className="text-gray-600 text-center">
                Events managed with EventraAI receive an average 94% satisfaction rating from attendees.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Trusted By Educators</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Hear from educational professionals who've transformed their events with EventraAI.
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
                "EventraAI transformed how we manage our professional development workshops. The certification tracking and participant engagement tools are exceptional."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Dr. Emily Rodriguez</p>
                <p className="text-sm text-gray-600">Director of Training, Global Education Institute</p>
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
                "Our annual academic conference became significantly easier to organize with EventraAI. The multi-track scheduling and abstract submission features are perfectly designed."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Professor David Thompson</p>
                <p className="text-sm text-gray-600">Conference Chair, International Science Association</p>
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
                "We rolled out corporate training to 5,000+ employees using EventraAI. The analytics dashboard and reporting features gave us clear insights into learning outcomes."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Michelle Park</p>
                <p className="text-sm text-gray-600">Head of Learning & Development, TechInnovate Inc.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Create Impactful Learning Experiences</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Join educational institutions and training providers who use EventraAI to design engaging and effective learning events.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-blue))] hover:bg-gray-100"
            >
              Start Free Educational Trial <ArrowRight className="ml-2 h-4 w-4" />
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