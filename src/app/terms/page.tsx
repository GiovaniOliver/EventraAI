import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Terms of Service | EventraAI',
  description: 'Terms and conditions for using the EventraAI platform and services.'
}

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-700">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            The rules and guidelines for using EventraAI's services
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
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using EventraAI's services, you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access the service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              2. Account Registration
            </h2>
            <p>
              To use certain features of our service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              3. Service Usage and Limitations
            </h2>
            <p>
              EventraAI grants you a non-exclusive, non-transferable right to use our services for personal 
              or business event planning. You may not:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Use the service for illegal purposes</li>
              <li>Copy, modify, or create derivative works</li>
              <li>Reverse engineer or access the service to build a competing product</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Transfer, sell, or lease the service to third parties</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              4. Intellectual Property
            </h2>
            <p>
              The service and its original content, features, and functionality are owned by EventraAI and are 
              protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              5. User Content
            </h2>
            <p>
              When you create events, upload materials, or submit content to our service, you retain ownership 
              of your intellectual property. By submitting content, you grant EventraAI a worldwide, non-exclusive 
              license to use, reproduce, and display the content in connection with providing and promoting the service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              6. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior notice or 
              liability, for any reason, including without limitation if you breach the Terms.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              In no event shall EventraAI be liable for any indirect, incidental, special, consequential or 
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              8. Governing Law
            </h2>
            <p>
              These Terms shall be governed by the laws of the State of California, without respect to its 
              conflict of law principles.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              9. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
              provide at least 30 days' notice before the new terms take effect.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mb-2">
              <strong>Email:</strong> legal@eventraai.com
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