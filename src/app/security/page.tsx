import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Database, Check, Server, AlertCircle, FileText, Eye, Users } from 'lucide-react'

export const metadata = {
  title: 'Security | EventraAI',
  description: 'Learn about EventraAI\'s commitment to security and how we protect your data.'
}

export default function SecurityPage() {
  // Security principles
  const securityPrinciples = [
    {
      title: 'Data Encryption',
      description: 'All data in transit and at rest is encrypted using industry-standard protocols.',
      icon: <Lock className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Access Controls',
      description: 'Strict access controls and authentication systems protect your account and information.',
      icon: <Shield className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Regular Audits',
      description: 'Regular security audits and penetration testing to identify and address vulnerabilities.',
      icon: <FileText className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Privacy by Design',
      description: 'Security and privacy considerations are built into our development process from the start.',
      icon: <Eye className="h-6 w-6 text-indigo-600" />
    }
  ]

  // Security measures
  const securityMeasures = [
    {
      title: 'Infrastructure Security',
      description: 'Our infrastructure is hosted on secure cloud providers with ISO 27001, SOC 2, and other compliance certifications. We implement multiple layers of security including firewalls, intrusion detection, and DDoS protection.',
      icon: <Server className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Data Protection',
      description: 'We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. All sensitive data, including passwords, are hashed using strong, modern algorithms.',
      icon: <Database className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Authentication & Access',
      description: 'We support multi-factor authentication, single sign-on, and role-based access controls. Login attempts are monitored for suspicious activity, and strict session management is enforced.',
      icon: <Users className="h-5 w-5 text-indigo-600" />
    },
    {
      title: 'Incident Response',
      description: 'Our security team has established incident response procedures to quickly address any security issues. We maintain a detailed security incident management policy and conduct regular drills.',
      icon: <AlertCircle className="h-5 w-5 text-indigo-600" />
    }
  ]

  // Compliance badges
  const complianceCertifications = [
    {
      name: 'SOC 2 Type II',
      image: '/images/eventraailogo1.png',
      description: 'Service Organization Control 2 certification for security, availability, and confidentiality.'
    },
    {
      name: 'GDPR Compliant',
      image: '/images/eventraailogo1.png',
      description: 'Compliant with European Union\'s General Data Protection Regulation.'
    },
    {
      name: 'ISO 27001',
      image: '/images/eventraailogo1.png',
      description: 'International standard for information security management systems.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-indigo-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Security at EventraAI</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Our commitment to protecting your data and ensuring platform security
          </p>
        </div>
      </header>

      {/* Core Principles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Security Principles</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Security is at the heart of everything we do. Our platform is built on these fundamental principles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityPrinciples.map((principle, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{principle.title}</h3>
                <p className="text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Security Measures</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              How we implement security across our platform and operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {securityMeasures.map((measure, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-50 rounded-full mr-4">
                    {measure.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{measure.title}</h3>
                </div>
                <p className="text-gray-600">{measure.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices for Users */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Security Best Practices for Users</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-4 mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Use Strong, Unique Passwords</h3>
                  <p className="text-gray-600">Create complex passwords that are at least 12 characters long, including numbers, symbols, and mixed case letters. Use a different password for each online account.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-4 mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Enable Multi-Factor Authentication</h3>
                  <p className="text-gray-600">Add an extra layer of security to your EventraAI account by enabling multi-factor authentication, which requires a second verification step beyond your password.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-4 mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Keep Your Devices Secure</h3>
                  <p className="text-gray-600">Ensure your devices have the latest security updates, use antivirus software, and lock your devices when not in use.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-4 mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Be Cautious of Phishing Attempts</h3>
                  <p className="text-gray-600">Be wary of unexpected emails or messages asking for your credentials. EventraAI will never ask for your password via email or chat.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 bg-green-100 rounded-full mr-4 mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Manage Access Permissions</h3>
                  <p className="text-gray-600">Regularly review who has access to your EventraAI events and data. Remove access for team members who no longer need it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance and Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Compliance & Certifications</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We maintain rigorous standards and comply with industry regulations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {complianceCertifications.map((cert, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image 
                      src={cert.image} 
                      alt={cert.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Contact */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Report a Security Issue</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            If you believe you've found a security vulnerability in our platform, please let us know immediately.
            We appreciate your help in keeping EventraAI secure.
          </p>
          <Link 
            href="/contact?security=true" 
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Security Team
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