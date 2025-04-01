'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Search, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import NotificationPopover from '@/components/notifications/NotificationPopover'

const Navbar = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Close mobile menu when pathname changes (navigation occurs)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  
  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint in Tailwind
        setMobileMenuOpen(false)
      }
    }
    
    // Check initial size
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Handle clicks outside the mobile menu to close it
  useEffect(() => {
    if (!mobileMenuOpen) return
    
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [mobileMenuOpen])
  
  return (
    <header className="relative w-full border-b border-gray-100 bg-white navbar">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
            src="/images/eventraailogo1.png" 
            alt="EventraAI Logo" 
            width={36} 
            height={36} 
            className="h-auto w-auto object-contain mr-2 mt-3 logo"
            />
            <span className="eventra-gradient-text font-semibold">EventraAI</span>
          </Link>
          
          <nav className="ml-10 hidden md:flex">
            <Link 
              href="/about"
              className={`mx-2 px-2 py-1 text-sm ${pathname === '/about' ? 'text-[hsl(var(--eventra-blue))]' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              About
            </Link>
            <Link 
              href="/blog"
              className={`mx-2 px-2 py-1 text-sm ${pathname === '/blog' ? 'text-[hsl(var(--eventra-blue))]' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Blog
            </Link>
            <Link 
              href="/special-offer"
              className={`mx-2 px-2 py-1 text-sm ${pathname === '/special-offer' ? 'text-[hsl(var(--eventra-blue))]' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Special Offer
            </Link>
            <Link 
              href="/pricing"
              className={`mx-2 px-2 py-1 text-sm ${pathname === '/pricing' ? 'text-[hsl(var(--eventra-blue))]' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Pricing
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationPopover />
          {/* Desktop navigation buttons */}
          <div className="hidden md:flex md:items-center">
            <button className="mr-4 text-gray-600 hover:text-[hsl(var(--eventra-blue))] notification-icon">
              <Bell size={20} className="notification-icon" />
            </button>
            <button className="mr-6 text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
              <Search size={20} />
            </button>
            <Link
            href="/login"
            className="rounded-md bg-[hsl(var(--eventra-blue))] px-4 py-1.5 text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors btn-primary"
            >
              Sign In
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button ml-2 p-2 text-gray-600 hover:text-[hsl(var(--eventra-blue))] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu absolute left-0 right-0 top-16 z-20 animate-fadeIn bg-white px-4 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/about"
              className={`px-2 py-1 text-sm ${pathname === '/about' ? 'text-[hsl(var(--eventra-blue))] font-medium' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              About
            </Link>
            <Link 
              href="/blog"
              className={`px-2 py-1 text-sm ${pathname === '/blog' ? 'text-[hsl(var(--eventra-blue))] font-medium' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Blog
            </Link>
            <Link 
              href="/special-offer"
              className={`px-2 py-1 text-sm ${pathname === '/special-offer' ? 'text-[hsl(var(--eventra-blue))] font-medium' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Special Offer
            </Link>
            <Link 
              href="/pricing"
              className={`px-2 py-1 text-sm ${pathname === '/pricing' ? 'text-[hsl(var(--eventra-blue))] font-medium' : 'text-gray-600 hover:text-[hsl(var(--eventra-blue))]'}`}
            >
              Pricing
            </Link>
            
            <div className="my-2 border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-4 pb-2">
                <button className="text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                  <Bell size={20} />
                </button>
                <button className="text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                  <Search size={20} />
                </button>
              </div>
              
              <Link
                href="/login"
                className="mt-2 block w-full rounded-md bg-[hsl(var(--eventra-blue))] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar