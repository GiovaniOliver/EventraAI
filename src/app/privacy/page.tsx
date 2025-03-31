import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Privacy Policy | EventraAI',
  description: 'Learn how EventraAI protects your privacy and handles your data.'
}

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-700">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            How EventraAI protects your data and respects your privacy
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg mx-auto">
          <section className="mb-12">
            <p className="text-gray-600 mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p>
              At EventraAI, we value your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Create an account</li>
              <li>Plan an event</li>
              <li>Use our event management features</li>
              <li>Contact our support team</li>
              <li>Subscribe to our newsletter</li>
            </ul>
            <p>
              This may include your name, email address, phone number, and payment information.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              How We Use Your Information
            </h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Data Security
            </h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Your Rights
            </h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Accessing your data</li>
              <li>Correcting inaccurate information</li>
              <li>Deleting your data</li>
              <li>Restricting or objecting to processing</li>
              <li>Data portability</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-2">
              <strong>Email:</strong> privacy@eventraai.com
            </p>
            <p>
              <strong>Address:</strong> EventraAI Headquarters, 123 Event Lane, San Francisco, CA 94105
            </p>
          </section>
        </div>
      </main>

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