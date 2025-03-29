import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Check, Calendar, Users, Clock, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
              Limited Time Offer
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              20% Off Annual Plans
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Transform your event planning experience with our premium features. Save time, reduce stress, 
              and create exceptional events of any type.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="#pricing" 
                className="rounded-md bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
              >
                View Plans
              </Link>
              <Link 
                href="/contact" 
                className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/event-audience.jpg"
                alt="Event audience during a presentation"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Revolutionize Your Event Planning
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start">
              <div className="mb-4 text-indigo-600">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI-Powered Event Planning</h3>
              <p className="text-gray-600">
                Leverage artificial intelligence to create, organize, and optimize your events and insights.
              </p>
            </div>
            
            <div className="flex flex-col items-start">
              <div className="mb-4 text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Seamless Team Collaboration</h3>
              <p className="text-gray-600">
                Collaborate with your team in real-time, assign tasks, track progress, and streamline the planning process.
              </p>
            </div>
            
            <div className="flex flex-col items-start">
              <div className="mb-4 text-indigo-600">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Comprehensive Event Management</h3>
              <p className="text-gray-600">
                Manage every aspect of your events from a centralized dashboard — registrations, budgets, and vendors.
              </p>
            </div>
            
            <div className="flex flex-col items-start">
              <div className="mb-4 text-indigo-600">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Time-Saving Automation</h3>
              <p className="text-gray-600">
                Automate repetitive tasks and workflows to save time and reduce the manual event planning process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Special Promotional Pricing</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              For a limited time, get 20% off all annual plans. Upgrade now to unlock amazing savings.
            </p>
          </div>
          
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-md">
              <button className="rounded-l-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                Monthly
              </button>
              <button className="rounded-r-lg border border-gray-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                Annually <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs">Save 20%</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Starter Plan */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Starter</h3>
              <p className="mt-2 text-sm text-gray-500">For individuals and small events</p>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">$11.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Billed annually ($143.88)</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Up to 5 events</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Standard templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>1 GB file storage</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>1 team member</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <button className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Get Started
                </button>
              </div>
            </div>
            
            {/* Professional Plan */}
            <div className="relative rounded-lg border-2 border-indigo-600 bg-white p-8 shadow-md">
              <div className="absolute -top-5 right-0 left-0 mx-auto w-32 rounded-full bg-indigo-600 py-1 text-center text-xs font-semibold uppercase text-white">
                Most Popular
              </div>
              
              <h3 className="text-lg font-medium text-gray-900">Professional</h3>
              <p className="mt-2 text-sm text-gray-500">For businesses and growing events</p>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">$23.99</span>
                <span className="text-gray-500">/month</span>
                </div>
              <p className="mt-1 text-sm text-gray-500">Billed annually ($287.88)</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Up to 15 events</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Premium templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>10 GB file storage</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Guest emailing</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>10 AI assistant calls per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>5 team members</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <button className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Get Started
                </button>
        </div>
      </div>
            
            {/* Business Plan */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Business</h3>
              <p className="mt-2 text-sm text-gray-500">For established businesses</p>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">$47.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Billed annually ($575.88)</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Up to 50 events</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Comprehensive analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>Custom branding</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>50 GB storage</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>White labeling</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>100 AI assistant calls per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  <span>15 team members</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <button className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Try Business
                </button>
              </div>
            </div>
      </div>
          
          <p className="mt-6 text-center text-sm text-gray-500">
            All plans include a 14-day free trial. No credit card required.<br />
            Need a custom solution? <a href="/contact" className="text-indigo-600 hover:text-indigo-800">Contact our sales team</a>.
        </p>
      </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            What Our Customers Say
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "This platform has transformed how we run our conferences. The AI suggestions have saved us countless hours of planning time and increased engagement by 40%."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Sarah J.</p>
                <p className="text-sm text-gray-600">Event Manager, TechCrunch Global</p>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "I was skeptical about using AI for event planning, but the recommendations were spot-on. It's like having an experienced event planner on your team."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Michael T.</p>
                <p className="text-sm text-gray-600">Marketing Director, Innovate Inc.</p>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                "The collaborative features make it extremely easy to work together on events. Everything is streamlined, and we've eliminated email threads."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Priya K.</p>
                <p className="text-sm text-gray-600">Events Manager, Remote Company</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">How does the AI assistant help with event planning?</h3>
              <p className="text-gray-700">
                Our AI assistant analyzes your event requirements, attendee demographics, and industry trends to provide personalized recommendations for venues, schedules, speakers, and more. It helps optimize your planning workflow, saving time and improving outcomes.
              </p>
            </div>
            
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">Can I upgrade or downgrade my subscription at any time?</h3>
              <p className="text-gray-700">
                Yes, you can upgrade your subscription at any time and the new features will be immediately available. If you downgrade, you'll continue to have access to your current plan until the end of your billing cycle, after which the new plan will take effect.
              </p>
            </div>
            
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">Is there a limit to how many team members I can add?</h3>
              <p className="text-gray-700">
                Each plan has a specific limit for team members. The Starter plan allows 1 member, Professional allows 5 business members, and Enterprise offers additional team members. You can always upgrade your plan if you need to add more team members.
              </p>
            </div>
            
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">How are AI assistant calls counted?</h3>
              <p className="text-gray-700">
                An AI assistant call is counted whenever you request specific recommendations, analysis, or optimization from the AI. Simple interactions like checking information or navigation recommendations aren't counted as additional calls.
              </p>
            </div>
            
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">Do you offer custom solutions for larger organizations?</h3>
              <p className="text-gray-700">
                Yes, we offer Enterprise-grade custom solutions tailored to the specific needs of larger organizations. This includes dedicated account management, custom feature development, extended product and client success, advanced analytics, and personalized onboarding support.
              </p>
      </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-lg font-semibold">Can I try the platform before committing to a subscription?</h3>
              <p className="text-gray-700">
                Yes, we offer a 14-day free trial that gives you access to all the features in the Professional plan. No credit card is required to start a trial, and you can upgrade or downgrade to whichever plan suits your needs.
              </p>
            </div>
      </div>
    </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Limited Time Offer: 20% Off Annual Plans</h2>
          <p className="mx-auto mt-4 max-w-2xl">
            Don't miss this opportunity to save on our comprehensive event planning platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#pricing"
              className="rounded-md bg-white px-6 py-3 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              View Plans & Pricing
            </a>
            <a
              href="/contact"
              className="rounded-md border border-white bg-transparent px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Start Free Trial
            </a>
          </div>
          <p className="mt-6 text-sm text-indigo-200">No credit card required. 14-day free trial period.</p>
        </div>
      </section>
    </MainLayout>
  )
}
