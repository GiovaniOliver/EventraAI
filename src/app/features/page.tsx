import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Calendar, Users, Layout, MessageSquare, Clock, Zap, LineChart, Database, Shield } from 'lucide-react'

export const metadata = {
  title: 'Features | EventraAI',
  description: 'Discover the powerful features that make EventraAI the ultimate platform for event planning and management.'
}

export default function FeaturesPage() {
  // Primary features
  const primaryFeatures = [
    {
      title: 'AI-Powered Event Planning',
      description: 'Our AI assistant helps create personalized event plans based on your specific requirements and preferences.',
      icon: <Zap className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Smart Scheduling',
      description: 'Optimize your event timeline with intelligent scheduling that considers dependencies and resource availability.',
      icon: <Calendar className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Collaborative Workspaces',
      description: 'Work seamlessly with your team, vendors, and clients in real-time collaborative environments.',
      icon: <Users className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Comprehensive Dashboard',
      description: 'Monitor all aspects of your events from a centralized, customizable dashboard.',
      icon: <Layout className="h-6 w-6 text-indigo-600" />
    }
  ]

  // Secondary features with more detail
  const secondaryFeatures = [
    {
      title: 'Vendor Management',
      description: 'Find, connect with, and manage vendors through our integrated platform. Track communications, contracts, and payments in one place.',
      icon: <Database className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Budget Tracking',
      description: 'Create detailed budgets, track expenses in real-time, and receive alerts when you\'re approaching limits.',
      icon: <LineChart className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Guest Management',
      description: 'Handle RSVPs, create seating charts, and communicate with attendees through automated messaging.',
      icon: <Users className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Timeline Management',
      description: 'Keep track of planning milestones, day-of schedules, and post-event follow-ups with customizable timelines.',
      icon: <Clock className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'In-app Communication',
      description: 'Collaborate with team members and vendors through integrated messaging and comment threads.',
      icon: <MessageSquare className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Security & Privacy',
      description: 'Enterprise-grade security ensures your event data and communications remain confidential and protected.',
      icon: <Shield className="h-5 w-5 text-indigo-600" />
    }
  ]

  // Feature comparison by subscription tier
  const featureTiers = [
    {
      tier: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Essential tools for individuals planning simple events',
      features: [
        'AI-assisted planning basics',
        'Up to 2 concurrent events',
        'Basic guest management',
        'Standard templates',
        'Email support'
      ],
      cta: 'Get Started',
      ctaLink: '/signup'
    },
    {
      tier: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Advanced features for professional event planners',
      features: [
        'Everything in Free',
        'Unlimited events',
        'Advanced AI planning tools',
        'Custom templates',
        'Budget tracking',
        'Vendor management',
        'Priority support'
      ],
      cta: 'Try Pro Free',
      ctaLink: '/signup?plan=pro',
      highlighted: true
    },
    {
      tier: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Comprehensive solution for organizations and large-scale events',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'Multi-team management',
        'Analytics and insights',
        'SLA guarantees'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact?enterprise=true'
    }
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-700 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Powerful Features for Seamless Event Planning</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Discover why event planners worldwide choose EventraAI to create exceptional experiences
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-white text-indigo-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Start Planning Today
          </Link>
        </div>
      </header>

      {/* Primary Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Streamline Your Event Planning</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines AI technology with practical tools to help you plan and execute flawless events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {primaryFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase with Image */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">AI-Powered Planning Assistant</h2>
              <p className="text-gray-600 mb-8">
                Our intelligent assistant helps you create the perfect event plan tailored to your specific needs. From budget optimization to vendor recommendations, our AI handles the complex details so you can focus on creating memorable experiences.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Personalized event recommendations based on your preferences</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Smart budget allocation to maximize impact</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Automated timeline creation with intelligent reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Theme and decor suggestions tailored to your event type</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-80 rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src="/images/eventraailogo1.png" 
                  alt="AI Planning Assistant"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Planning Tools</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Everything you need to plan, manage, and execute successful events from start to finish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-lg font-semibold ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Features Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose the Right Plan for You</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Compare our pricing plans to find the perfect fit for your event planning needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {featureTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden ${tier.highlighted ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200'}`}
              >
                <div className={`p-6 ${tier.highlighted ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                  <h3 className="text-xl font-bold mb-1">{tier.tier}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className={`ml-1 text-sm ${tier.highlighted ? 'text-white/70' : 'text-gray-500'}`}>{tier.period}</span>
                  </div>
                  <p className={`mt-2 text-sm ${tier.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                    {tier.description}
                  </p>
                </div>
                <div className="p-6 bg-white">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href={tier.ctaLink} 
                    className={`block w-full text-center py-2 rounded-md font-medium ${
                      tier.highlighted 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                    } transition-colors`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Event Planning?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of event planners who trust EventraAI to create memorable experiences
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              href="/contact" 
              className="inline-block bg-transparent text-white border border-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Schedule a Demo
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