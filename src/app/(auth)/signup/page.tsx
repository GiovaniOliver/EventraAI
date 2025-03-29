'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
// Using (auth) layout instead of MainLayout

// Use development mode if enabled in environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true';

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setError('')
    setIsLoading(true)
    
    try {
      await register(
        formData.email, 
        formData.password, 
        formData.username, 
        formData.displayName || formData.username
      )
      
      // Redirect is handled in the register function
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account')
      setIsLoading(false)
    }
  }

  // Helper function to fill test data in dev mode
  const fillTestData = () => {
    setFormData({
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      username: `testuser${Math.floor(Math.random() * 1000)}`,
      displayName: 'Test User',
      password: 'password123',
      confirmPassword: 'password123'
    });
  };

  return (
    <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-gray-600">
              Join thousands of event planners using EventraAI
            </p>
          </div>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="johndoe"
                />
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
                </label>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
              
              {isDevelopmentMode && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={fillTestData}
                    className="w-full rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
                  >
                    Fill Test Data
                  </button>
                </div>
              )}
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M20.64 12.2c0-.638-.057-1.252-.164-1.84H12v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H3.957v2.332A8.997 8.997 0 0012 21z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.964 13.71c-.18-.54-.282-1.116-.282-1.71s.102-1.17.282-1.71V7.958H3.957A8.996 8.996 0 003 12c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C16.463 2.825 14.426 2 12 2A8.997 8.997 0 003.957 7.958l3.007 2.332C7.672 7.163 9.655 5.58 12 5.58z"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                
                <button type="button" className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg className="h-5 w-5 text-[#3b5998]" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>
            <Link href="/login" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
      </div>
  )
}