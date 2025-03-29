'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Using (auth) layout instead of MainLayout
import { CheckCircle, Mail } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()
  
  const handleResend = () => {
    // Implement resend functionality here
    alert('Confirmation email has been resent')
  }
  return (
    <div className="w-full max-w-md px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
            <p className="mt-2 text-lg text-gray-600">
              We've sent a confirmation link to your email address
            </p>
            
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex justify-center">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <p className="mt-4 text-gray-700">
                Please check your inbox and click the confirmation link to activate your account.
                If you don't see the email, please check your spam folder.
              </p>
              
              <div className="mt-6 rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Didn't receive an email?</span> Please check your spam
                  folder or <button onClick={handleResend} className="text-indigo-600 hover:text-indigo-500">resend the confirmation email</button>.
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <Link
                href="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to login
              </Link>
            </div>
          </div>
      </div>
  )
}