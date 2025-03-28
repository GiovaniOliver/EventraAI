import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">EventraAI</span>
          </div>
          <nav className="flex space-x-8">
            <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/features" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <h1 className="max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Event Planning Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              EventraAI helps you manage your events with ease. From planning to execution, we've got you covered with smart AI-powered tools.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/signup"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link href="/features" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative h-80 lg:h-auto w-[364px] text-center">
              <div className="absolute left-1/2 top-0 -z-10 h-[364px] w-[364px] -translate-x-1/2 translate-y-1/4 rounded-full bg-indigo-100/80 blur-[80px]"></div>
              <div className="relative mx-auto h-[400px] w-full overflow-hidden rounded-xl bg-gray-50 p-4 shadow-xl ring-1 ring-gray-200">
                <div className="h-full w-full rounded-lg bg-white p-4">
                  <div className="flex justify-between border-b pb-2">
                    <div className="font-medium">Event Dashboard</div>
                    <div className="text-sm text-gray-500">Today</div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg bg-indigo-50 p-3">
                      <div className="text-sm font-medium">Team Meeting</div>
                      <div className="text-xs text-gray-500">10:00 AM - 11:30 AM</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="text-sm font-medium">Client Presentation</div>
                      <div className="text-xs text-gray-500">1:00 PM - 2:30 PM</div>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <div className="text-sm font-medium">Project Planning</div>
                      <div className="text-xs text-gray-500">3:00 PM - 4:00 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Smarter Planning</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your events
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform provides all the tools you need to plan, organize, and execute successful events.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2">
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <dt className="text-base font-semibold leading-7 text-gray-900">AI-Powered Planning</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Smart suggestions and automated scheduling to help you plan more efficiently.
                </dd>
              </div>
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <dt className="text-base font-semibold leading-7 text-gray-900">Task Management</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Keep track of all your tasks and assignments in one organized dashboard.
                </dd>
              </div>
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <dt className="text-base font-semibold leading-7 text-gray-900">Team Collaboration</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Work together with your team in real-time with shared access and updates.
                </dd>
              </div>
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <dt className="text-base font-semibold leading-7 text-gray-900">Budget Tracking</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Monitor expenses and stay within budget with our financial tools.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your event planning?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Join thousands of event planners who use EventraAI to deliver exceptional experiences.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/signup"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started for free
              </Link>
              <Link href="/demo" className="text-sm font-semibold leading-6 text-white">
                Request a demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} EventraAI. All rights reserved.
            </p>
          </div>
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
