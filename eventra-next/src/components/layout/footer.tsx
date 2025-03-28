export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} EventraAI. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">Privacy Policy</span>
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">Terms of Service</span>
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">Contact</span>
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 