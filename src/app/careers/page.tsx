import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Briefcase, GraduationCap, Globe, MapPin, Clock, Users } from 'lucide-react'

export const metadata = {
  title: 'Careers | EventraAI',
  description: 'Join the EventraAI team and help transform the event planning industry with AI technology.'
}

export default function CareersPage() {
  // Team values
  const companyValues = [
    {
      title: 'Innovation',
      description: 'We push boundaries and embrace new ideas to transform event planning.',
      icon: <GraduationCap className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Collaboration',
      description: 'We work together across teams to achieve our shared mission.',
      icon: <Users className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Customer Focus',
      description: 'Our customers are at the center of everything we do.',
      icon: <Briefcase className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Global Mindset',
      description: 'We build for a diverse, worldwide community of event planners.',
      icon: <Globe className="h-6 w-6 text-indigo-600" />
    }
  ]

  // Open positions
  const openPositions = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote (US/Canada)',
      type: 'Full-time',
      description: 'Build and scale our event planning platform using modern technologies.',
      slug: 'senior-full-stack-engineer'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Lead the development of innovative features that transform event planning.',
      slug: 'product-manager'
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote (US/Europe)',
      type: 'Full-time',
      description: 'Create intuitive and beautiful experiences for event planners worldwide.',
      slug: 'ux-ui-designer'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'New York, NY',
      type: 'Full-time',
      description: 'Help our enterprise customers succeed and grow with our platform.',
      slug: 'customer-success-manager'
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote (Global)',
      type: 'Full-time',
      description: 'Drive growth and awareness for our event planning platform.',
      slug: 'marketing-specialist'
    },
    {
      title: 'AI Research Intern',
      department: 'Research',
      location: 'San Francisco, CA',
      type: 'Internship (Summer)',
      description: 'Research and develop AI solutions for event planning challenges.',
      slug: 'ai-research-intern'
    }
  ]

  // Benefits
  const benefits = [
    'Competitive salary and equity',
    'Health, dental, and vision insurance',
    'Unlimited PTO policy',
    'Remote-first culture',
    '401(k) matching',
    'Learning and development stipend',
    'Home office stipend',
    'Regular team retreats',
    'Parental leave'
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
              <p className="text-xl text-white/80 mb-6">
                Help us transform how events are planned and executed around the world
              </p>
              <a 
                href="#open-positions" 
                className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                View Open Positions
              </a>
            </div>
            <div className="hidden md:block">
              <Image 
                src="/images/eventraailogo1.png" 
                alt="EventraAI Team"
                width={500}
                height={350}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Open Positions</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Join us in our mission to make event planning seamless, intuitive, and intelligent
          </p>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{position.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {position.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {position.type}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/careers/${position.slug}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <p className="mt-4 text-gray-600">{position.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Don't see a role that fits your skills?</p>
            <Link 
              href="/contact?careers=true" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Submit Your Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits & Perks */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Benefits & Perks</h2>
            <p className="text-center text-gray-600 mb-12">
              We believe in taking care of our team so they can focus on what matters
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Explore our open positions and become part of a team that's changing how events are planned around the world.
          </p>
          <a 
            href="#open-positions" 
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            View Open Positions
          </a>
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
              <span className="font-semibold">EventraAI</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600">
                About
              </Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-indigo-600">
                Blog
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600">
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