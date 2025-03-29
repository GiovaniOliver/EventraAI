'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks'
// Using (auth) layout instead of MainLayout
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setError('')
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          {isSubmitted ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
                <p className="mt-2 text-gray-600">
                  We've sent a password reset link to <span className="font-medium">{email}</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  If you don't see the email in your inbox, please check your spam folder
                </p>
                
                <div className="mt-6">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Send to a different email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
      </div>
  )
}