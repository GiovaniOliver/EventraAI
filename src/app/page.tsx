import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowRight, CalendarCheck, Users, Clock, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Plan Amazing<br />Events with <span className="eventra-gradient-text">EventraAI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Streamline your event planning process with intelligent tools,
              real-time collaboration, and data-driven insights for any event
              type.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="/auth/signup" 
                className="rounded-md bg-[hsl(var(--eventra-blue))] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors focus:outline-none"
              >
                Get Started
              </Link>
              <Link 
                href="/features" 
                className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <Image 
                src="/images/hero-image.jpg"
                alt="Conference event with speaker on stage"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Seamless Event Planning</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              EventraAI combines cutting-edge AI with intuitive tools to make your event planning process 
              efficient and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 text-[hsl(var(--eventra-blue))]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI-Powered Planning</h3>
              <p className="text-gray-600">
                Leverage artificial intelligence to get smart suggestions for your events
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 text-[hsl(var(--eventra-purple))]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-Time Collaboration</h3>
              <p className="text-gray-600">
                Plan events with your team in real-time with our collaborative tools
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-blue))]/10 p-3 text-[hsl(var(--eventra-blue))]">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">All Event Types</h3>
              <p className="text-gray-600">
                Perfect for conferences, weddings, corporate events, and more
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-[hsl(var(--eventra-purple))]/10 p-3 text-[hsl(var(--eventra-purple))]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Time-Saving Workflows</h3>
              <p className="text-gray-600">
                Streamline your planning process with our efficient workflow tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Our streamlined process makes event planning efficient and stress-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--eventra-blue))]/10 text-[hsl(var(--eventra-blue))]">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Create Your Event</h3>
              <p className="text-gray-600">
                Start with basic details and let our AI help you build a comprehensive event plan.
              </p>
            </div>
            
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--eventra-purple))]/10 text-[hsl(var(--eventra-purple))]">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Collaborate with Your Team</h3>
              <p className="text-gray-600">
                Invite team members to contribute, assign tasks, and track progress in real-time.
              </p>
            </div>
            
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--eventra-blue))]/10 text-[hsl(var(--eventra-blue))]">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Host & Analyze</h3>
              <p className="text-gray-600">
                Execute your event and gain valuable insights from our analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Join thousands of event planners who are transforming their events with EventraAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "EventraAI transformed how we plan our conferences. The AI suggestions saved us countless hours of planning time."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-gray-600">Non-Profit Organization</p>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "The collaborative tools made it easy for our team to work together even though we're spread across different time zones."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-gray-600">Global Events Inc.</p>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "We increased attendee engagement by 45% using the analytics and suggestions from EventraAI for our corporate events."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Jessica Rodriguez</p>
                <p className="text-sm text-gray-600">Community Builders Association</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[hsl(var(--eventra-blue))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Transform Your Event Planning?</h2>
          <p className="mx-auto mt-4 max-w-2xl">
            Join thousands of event planners already using EventraAI to create exceptional
            experiences for all kinds of events.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-blue))] hover:bg-gray-100"
            >
              Start Planning Today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
