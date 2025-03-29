import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowRight, Calendar, Gift, Check } from 'lucide-react'

export default function SpecialOfferPage() {
  return (
    <MainLayout>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Special Limited-Time Offer</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl">
            Get 20% off annual plans plus exclusive bonuses when you sign up before April 30, 2025
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 rounded-lg bg-indigo-50 p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Annual Plan Discount</h2>
                <div className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                  20% OFF
                </div>
              </div>
              
              <p className="mb-6 text-gray-700">
                For a limited time, we're offering 20% off all annual plans. This exclusive discount 
                applies to all subscription tiers, helping you save while getting access to our 
                powerful event planning platform.
              </p>
              
              <div className="mb-6 rounded-lg bg-white p-4">
                <div className="text-lg font-medium text-gray-900">Discount applies to:</div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Starter Plan: <span className="font-semibold">$143.88/year</span> (Regular: $179.88)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Professional Plan: <span className="font-semibold">$287.88/year</span> (Regular: $359.88)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Business Plan: <span className="font-semibold">$575.88/year</span> (Regular: $719.88)</span>
                  </li>
                </ul>
              </div>
              
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View Pricing Details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Exclusive Bonus Benefits</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 text-indigo-600">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Extended Free Trial</h3>
                  <p className="text-gray-600">
                    Get 30 days of free access instead of the standard 14-day trial period, giving you more 
                    time to explore all features.
                  </p>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 text-indigo-600">
                    <Gift className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Premium Templates</h3>
                  <p className="text-gray-600">
                    Receive access to our premium template library with 50+ professional event templates 
                    ($99 value).
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">How to Claim Your Offer</h2>
              
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <ol className="ml-6 list-decimal space-y-4">
                  <li className="text-gray-700">
                    <span className="font-medium">Visit our pricing page</span> - Browse our subscription tiers and 
                    select the plan that best fits your needs.
                  </li>
                  <li className="text-gray-700">
                    <span className="font-medium">Choose annual billing</span> - Select the annual billing option 
                    to activate the 20% discount.
                  </li>
                  <li className="text-gray-700">
                    <span className="font-medium">Use promo code</span> - Enter code <span className="rounded bg-gray-100 px-2 py-1 font-mono">SPRING2025</span> at checkout.
                  </li>
                  <li className="text-gray-700">
                    <span className="font-medium">Complete registration</span> - Fill in your details to create your account 
                    and start your extended trial.
                  </li>
                </ol>
              </div>
            </div>
            
            <div className="rounded-lg bg-indigo-50 p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Limited Time Only</h2>
              <p className="mb-6 text-gray-700">
                This special offer expires on April 30, 2025. Lock in your discount today!
              </p>
              
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                Claim Your 20% Discount
              </Link>
              
              <p className="mt-4 text-sm text-gray-500">
                No credit card required to start your 30-day free trial.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
