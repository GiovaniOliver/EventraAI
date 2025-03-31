import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, Building, CheckCircle, ExternalLink, Globe, Users } from 'lucide-react'

export const metadata = {
  title: 'Partners | EventraAI',
  description: 'Work with our global network of partners to enhance your event planning capabilities.'
}

export default function PartnersPage() {
  // Partner categories
  const partnerCategories = [
    {
      title: 'Technology Partners',
      description: 'Companies that have integrated their technology with EventraAI',
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: 'Service Partners',
      description: 'Event service providers who work with our platform',
      icon: <Briefcase className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: 'Implementation Partners',
      description: 'Experts who help you set up and optimize EventraAI',
      icon: <Building className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: 'Referral Partners',
      description: 'Businesses who refer clients to EventraAI',
      icon: <Users className="h-6 w-6 text-indigo-600" />,
    },
  ]

  // Featured partners
  const featuredPartners = [
    {
      name: 'Venue Connect',
      logo: '/images/partners/placeholder-logo1.png',
      description: 'The leading venue booking platform with over 10,000 venues worldwide.',
      category: 'Technology Partners',
      website: 'https://example.com/venueconnect'
    },
    {
      name: 'EventTech Solutions',
      logo: '/images/partners/placeholder-logo2.png',
      description: 'Premium event technology provider specializing in hybrid events.',
      category: 'Service Partners',
      website: 'https://example.com/eventtech'
    },
    {
      name: 'Global Catering Network',
      logo: '/images/partners/placeholder-logo3.png',
      description: 'Connect with top-tier catering services for any type of event.',
      category: 'Service Partners',
      website: 'https://example.com/catering'
    },
    {
      name: 'EventraAI Consultants',
      logo: '/images/partners/placeholder-logo4.png',
      description: 'Certified implementation specialists for EventraAI platform.',
      category: 'Implementation Partners',
      website: 'https://example.com/consultants'
    },
    {
      name: 'Eventify Agency',
      logo: '/images/partners/placeholder-logo5.png',
      description: 'Full-service event planning agency with global reach.',
      category: 'Referral Partners',
      website: 'https://example.com/eventify'
    },
    {
      name: 'Tech Integrators',
      logo: '/images/partners/placeholder-logo6.png',
      description: 'Custom integration specialists for event tech stacks.',
      category: 'Implementation Partners',
      website: 'https://example.com/integrators'
    }
  ]

  // Benefits of partnership
  const partnershipBenefits = [
    'Access to EventraAI API and developer tools',
    'Co-marketing opportunities',
    'Partner certification program',
    'Dedicated partner support',
    'Commission on referrals',
    'Access to exclusive events',
    'Early access to new features',
    'Joint case studies and success stories'
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Partner with EventraAI</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join our ecosystem of industry-leading event services and technology providers
          </p>
        </div>
      </header>

      {/* Partner Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Types of Partnerships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerCategories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Featured Partners</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            We work with the best in the industry to provide complete event planning solutions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPartners.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-16 mb-4">
                  <div className="w-32 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    {partner.logo ? (
                      <Image 
                        src={partner.logo} 
                        alt={`${partner.name} logo`}
                        width={120}
                        height={60}
                        className="object-contain"
                      />
                    ) : (
                      <Building className="h-8 w-8" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {partner.category}
                </span>
                <h3 className="text-xl font-semibold mt-2 mb-2">{partner.name}</h3>
                <p className="text-gray-600 mb-4">{partner.description}</p>
                <a 
                  href={partner.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Visit website <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Benefits of Partnership</h2>
            <p className="text-center text-gray-600 mb-12">
              Join our partner program and unlock exclusive benefits
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnershipBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Interested in partnering with EventraAI? Fill out our partner application form and our team will get in touch with you.
          </p>
          <Link 
            href="/contact?partnership=true" 
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Apply to Partner Program
          </Link>
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