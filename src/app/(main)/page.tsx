'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks'

export default function Home() {
  const { user, loading } = useAuth()
  
  return (
    <>
      {/* Hero section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Event Planning Made<br />
                <span className="text-indigo-200">Simple with AI</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg">
                EventraAI combines powerful planning tools with AI assistance to make your event organization effortless.
              </p>
              <div className="mt-10 flex gap-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-md hover:bg-indigo-50"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-md hover:bg-indigo-50"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/auth/login"
                      className="rounded-md border border-white bg-transparent px-6 py-3 text-base font-medium text-white hover:bg-white/10"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="h-64 w-full rounded-md bg-white/20 shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Features & Capabilities
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-500">
              Everything you need to plan successful events
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-3 shadow-lg">
                        <div className="h-6 w-6 text-white" aria-hidden="true">
                          {feature.icon}
                        </div>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-indigo-600 shadow-xl">
            <div className="px-6 py-12 sm:px-16 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Ready to start planning?
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-indigo-100">
                  Create your first event in minutes and experience the power of AI-assisted planning.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href={user ? "/dashboard" : "/auth/signup"}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    {user ? "Go to Dashboard" : "Get Started"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Feature list with icons
const features = [
  {
    name: 'AI Planning Assistant',
    description: 'Get intelligent suggestions for venues, themes, budgets, and more based on your event requirements.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.929m0 2.25v.428m-1.5-6.929l-6-3m11.25 1.928l-6-3m7.5 3v4.072m0 0l4.5-2.25M13.5 12.75v-1.5m0 0l-3-1.5M18 11.25l-3-1.5M8.5 13.5l-2-1" /></svg>,
  },
  {
    name: 'Real-time Collaboration',
    description: 'Work together with your team on event planning with live updates and seamless collaborative editing.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  },
  {
    name: 'Event Analytics',
    description: 'Track your event metrics and get insights on attendance, engagement, and ROI to optimize your planning.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    name: 'Vendor Management',
    description: 'Manage all your event vendors in one place with integrated communication and document sharing.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  },
  {
    name: 'Task Management',
    description: 'Create and assign tasks to team members with deadlines and priority settings to keep everyone on track.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    name: 'Budget Tools',
    description: 'Plan and track your event budget with itemized expenses, payment tracking, and forecast tools.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
] 