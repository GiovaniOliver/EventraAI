'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import AuthLayout from '@/components/layout/auth-layout'

// Use development mode if enabled in environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true';

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setError('')
    setIsLoading(true)
    
    try {
      console.log('[DEBUG] Login attempt with:', email);
      await login(email, password)
      // Redirect handled in the login function
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  // Helper function to fill in test credentials in dev mode
  const fillTestCredentials = () => {
    setEmail('demo@example.com')
    setPassword('demo1234')
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your event planning dashboard
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            {isDevelopmentMode && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={fillTestCredentials}
                  className="w-full rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
                >
                  Fill Test Credentials
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
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
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
          <span className="text-gray-600">Don't have an account?</span>
          <Link href="/signup" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
            Sign up now
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}