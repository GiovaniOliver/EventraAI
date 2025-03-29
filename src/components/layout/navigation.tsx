'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' }
  ]
  
  // Add special promotion navigation when available
  if (process.env.NEXT_PUBLIC_SHOW_PROMOTION === 'true') {
    navItems.push({ name: 'Special Offer', href: '/promotion' })
  }
  
  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      {navItems.map(item => (
        <Link 
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-foreground font-semibold"
              : "text-muted-foreground"
          )}
        >
          {item.name}
        </Link>
      ))}
      
      {!user && (
        <Button asChild size="sm">
          <Link href="/auth">
            Sign In
          </Link>
        </Button>
      )}
    </nav>
  )
}
