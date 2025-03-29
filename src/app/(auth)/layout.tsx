export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white py-4 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-indigo-600">
                EventraAI
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>
      <footer className="bg-white py-4 shadow-inner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EventraAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}