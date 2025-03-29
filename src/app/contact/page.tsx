'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }
    
    setError('')
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Email Us</h3>
                <p className="text-gray-600">Our friendly team is here to help</p>
                <a href="mailto:hello@eventraai.com" className="mt-3 block font-medium text-indigo-600">
                  hello@eventraai.com
                </a>
              </div>
              
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Phone className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Call Us</h3>
                <p className="text-gray-600">Mon-Fri from 8am to 5pm</p>
                <a href="tel:+1234567890" className="mt-3 block font-medium text-indigo-600">
                  +1 (234) 567-890
                </a>
              </div>
              
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Visit Us</h3>
                <p className="text-gray-600">Come say hello at our office</p>
                <span className="mt-3 block font-medium text-indigo-600">
                  123 Event St, San Francisco, CA
                </span>
              </div>
            </div>
            
            <div className="mt-16 rounded-lg bg-white p-8 shadow-md">
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Send Us a Message</h2>
                <p className="text-gray-600">
                  Have a question or want to learn more? Fill out the form below and we'll get back to you shortly.
                </p>
              </div>
              
              {isSubmitted ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-green-800">Message Sent!</h3>
                  <p className="text-green-700">
                    Thanks for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="mb-3 text-lg font-semibold">What is your response time?</h3>
              <p className="text-gray-700">
                We typically respond to all inquiries within 24 hours during business days. For urgent 
                matters, please call our support line.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="mb-3 text-lg font-semibold">Do you offer demos?</h3>
              <p className="text-gray-700">
                Yes! We offer personalized demos for teams interested in our professional and business plans. 
                Please request a demo through our contact form.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="mb-3 text-lg font-semibold">How can I report a bug?</h3>
              <p className="text-gray-700">
                If you encounter any issues, please contact our support team through the form above 
                or email us directly at support@eventraai.com.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="mb-3 text-lg font-semibold">Where are you located?</h3>
              <p className="text-gray-700">
                Our headquarters is in San Francisco, but we have team members across the globe to provide 
                support in multiple time zones.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}