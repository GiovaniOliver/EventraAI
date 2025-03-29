import Image from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Check, Heart, Zap, Shield, Users, Award, LifeBuoy } from 'lucide-react'

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Mission Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900">Our Mission</h1>
            <p className="mt-6 text-lg text-gray-600">
              At Eventra AI, we're building the future of event planning with 
              AI-powered tools that make creating exceptional events of all 
              types accessible to everyone.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <Check className="mr-3 h-6 w-6 text-indigo-600" />
                <p className="text-gray-700">Simplify the event planning process with intuitive tools</p>
              </div>
              <div className="flex items-start">
                <Check className="mr-3 h-6 w-6 text-indigo-600" />
                <p className="text-gray-700">Leverage AI to provide personalized recommendations</p>
              </div>
              <div className="flex items-start">
                <Check className="mr-3 h-6 w-6 text-indigo-600" />
                <p className="text-gray-700">Enable seamless collaboration between team members</p>
              </div>
              <div className="flex items-start">
                <Check className="mr-3 h-6 w-6 text-indigo-600" />
                <p className="text-gray-700">Increase attendee engagement through data-driven insights</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/mission-image.jpg" 
                alt="Team planning event with sticky notes"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
          </div>
          
          <div className="mx-auto max-w-3xl text-gray-700">
            <p className="mb-6">
              Founded in 2023, Eventra AI emerged from a simple observation: event planning was unnecessarily complex and 
              stressful. Our team of event industry veterans and technology experts came together with a shared vision to 
              revolutionize how all types of events are planned and executed.
            </p>
            
            <p className="mb-6">
              We recognized that while events offer incredible opportunities for engagement and connection, the tools 
              available to planners weren't evolving quickly enough to meet their needs. Fragmented solutions, tedious 
              manual processes, and a lack of collaborative features were making event planning more difficult than it needed 
              to be.
            </p>
            
            <p className="mb-6">
              Our answer was to create an all-in-one platform that combines the power of artificial intelligence with user-
              friendly tools designed specifically for the needs of modern event planners. By focusing on intuitive workflows, 
              real-time collaboration, and data-driven insights, we've built a solution that transforms the event planning 
              experience.
            </p>
            
            <p className="mb-6">
              Today, we're proud to serve thousands of event planners worldwide, from individual professionals to large 
              enterprise teams. Eventra AI helps them create seamless, engaging events while saving time, reducing stress, and 
              increasing attendee satisfaction.
            </p>
            
            <p>
              As we continue to grow, our commitment remains the same: to empower event professionals with innovative AI-
              powered tools that make their work easier and more effective, allowing them to focus on what truly matters – 
              creating exceptional experiences for their attendees.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              These core principles guide everything we do, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">User-Centered</h3>
              <p className="text-gray-600">
                We put our users at the center of everything we build, focusing on their needs and experiences.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
              <p className="text-gray-600">
                We continuously explore new technologies and approaches to solve event planning challenges.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Reliability</h3>
              <p className="text-gray-600">
                We build robust, dependable tools that event planners can count on when it matters.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of teamwork, both within our company and for our users' success.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in our platform, service, and support.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-indigo-600">
                <LifeBuoy className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Support</h3>
              <p className="text-gray-600">
                We're committed to providing outstanding assistance to help our users succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              The passionate people behind our mission to transform event planning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
                <img 
                  src="/team/alex.jpg" 
                  alt="Alex Johnson" 
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Alex Johnson</h3>
              <p className="text-indigo-600">Founder & CEO</p>
              <p className="mt-2 text-sm text-gray-600">
                Former event director with 15 years of experience in corporate and social events.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
                <img 
                  src="/team/maria.jpg" 
                  alt="Maria Rodriguez" 
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Maria Rodriguez</h3>
              <p className="text-indigo-600">Chief Product Officer</p>
              <p className="mt-2 text-sm text-gray-600">
                Tech leader focused on creating user-friendly planning solutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
                <img 
                  src="/team/james.jpg" 
                  alt="James Chen" 
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">James Chen</h3>
              <p className="text-indigo-600">Head of AI Development</p>
              <p className="mt-2 text-sm text-gray-600">
                AI specialist focused on creating intelligent planning recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
                <img 
                  src="/team/sarah.jpg" 
                  alt="Sarah Williams" 
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Sarah Williams</h3>
              <p className="text-indigo-600">Customer Success Director</p>
              <p className="mt-2 text-sm text-gray-600">
                Dedicated to ensuring clients maximize value from our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Join Us on Our Mission</h2>
          <p className="mx-auto mt-4 max-w-2xl">
            Experience the difference Eventra AI can make for planning your next event.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/auth/signup"
              className="rounded-md bg-white px-6 py-3 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="rounded-md border border-white bg-transparent px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
