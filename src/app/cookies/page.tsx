import Link from 'next/link'
import Image from 'next/image'
import { Info, Shield, Cookie, Settings } from 'lucide-react'

export const metadata = {
  title: 'Cookie Policy | EventraAI',
  description: 'Learn how EventraAI uses cookies to improve your experience and provide essential website functionality.'
}

export default function CookiePolicyPage() {
  // Cookie types
  const cookieTypes = [
    {
      title: 'Essential Cookies',
      description: 'Required for the website to function properly. These cannot be disabled and are necessary for basic features like login and security.',
      icon: <Shield className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Performance Cookies',
      description: 'Help us understand how visitors interact with our website by collecting anonymous information to improve our services.',
      icon: <Settings className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Functional Cookies',
      description: 'Allow the website to remember choices you make and provide enhanced, personalized features.',
      icon: <Cookie className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements and measure their effectiveness.',
      icon: <Info className="h-6 w-6 text-indigo-600" />
    }
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            How we use cookies to improve your experience on EventraAI
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
              This Cookie Policy explains how EventraAI ("we", "us", and "our") uses cookies and similar technologies 
              to recognize you when you visit our website. It explains what these technologies are and why we use them, 
              as well as your rights to control our use of them.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              What Are Cookies?
            </h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, EventraAI) are called "first-party cookies". 
              Cookies set by parties other than the website owner are called "third-party cookies". 
              Third-party cookies enable third-party features or functionality to be provided on or through the website 
              (e.g., advertising, interactive content, and analytics).
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Types of Cookies We Use
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {cookieTypes.map((type, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-50 rounded-full mr-4">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{type.title}</h3>
                  </div>
                  <p className="text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How Long Do Cookies Stay On Your Device?
            </h2>
            <p>
              The length of time a cookie will remain on your device depends on whether it is a "persistent" or "session" cookie.
              Session cookies will remain on your device until you stop browsing. Persistent cookies remain on your device until
              they expire or are deleted.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              How Can You Control Cookies?
            </h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the 
              appropriate opt-out links provided in our cookie notice.
            </p>
            <p>
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our 
              website, though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies 
              through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Specific Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-4 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">eventra-auth</td>
                    <td className="border border-gray-300 px-4 py-2">Used to store authentication information</td>
                    <td className="border border-gray-300 px-4 py-2">Session</td>
                    <td className="border border-gray-300 px-4 py-2">Essential</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">eventra-preferences</td>
                    <td className="border border-gray-300 px-4 py-2">Stores user preferences for the platform</td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                    <td className="border border-gray-300 px-4 py-2">Functional</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_ga</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics - Used to distinguish users</td>
                    <td className="border border-gray-300 px-4 py-2">2 years</td>
                    <td className="border border-gray-300 px-4 py-2">Performance</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">_gid</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics - Used to distinguish users</td>
                    <td className="border border-gray-300 px-4 py-2">24 hours</td>
                    <td className="border border-gray-300 px-4 py-2">Performance</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Changes to This Cookie Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, 
              legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and 
              related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
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