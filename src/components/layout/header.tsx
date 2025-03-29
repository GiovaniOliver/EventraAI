"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks"
import { Squirrel, User, LogOut, Settings, Calendar, ChevronDown, Search, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const isProtectedPage = ['/dashboard', '/events', '/discover', '/analytics', '/profile', '/settings', '/tasks'].some(
    path => pathname === path || pathname?.startsWith(`${path}/`)
  )

  // Handle scroll event to add shadow to header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await logout()
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "U"
    
    if (user.display_name) {
      const names = user.display_name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return user.display_name[0].toUpperCase()
    }
    
    return user.email?.[0].toUpperCase() || "U"
  }

  // Use different styling for protected pages
  const headerClass = cn(
    "fixed top-0 z-50 w-full transition-all duration-200",
    isProtectedPage && user 
      ? "bg-transparent border-b border-white/10" 
      : isScrolled 
        ? "bg-background/95 backdrop-blur-sm shadow-md" 
        : "bg-background/95 backdrop-blur-sm"
  )

  return (
    <header className={headerClass}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 flex items-center justify-center">
            <Image 
              src="/images/eventraailogo1.png" 
              alt="EventraAI Logo" 
              width={42} 
              height={42} 
              className="h-auto w-auto object-contain"
              priority
            />
          </div>
          <span className={cn(
            "hidden font-bold text-xl md:inline-block eventra-gradient-text",
            isProtectedPage && user ? "opacity-90" : "opacity-100"
          )}>
            EventraAI
          </span>
        </Link>

        {/* Center search - only show on larger screens and for logged in users */}
        {user && (
          <div className="hidden max-w-sm flex-1 mx-4 md:flex">
            <div className="relative w-full">
              <Search className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isProtectedPage ? "text-white/50" : "text-muted-foreground"
              )} />
              <Input
                type="search"
                placeholder="Search events..."
                className={cn(
                  "w-full pl-9 focus-visible:ring-[hsl(var(--eventra-blue))]",
                  isProtectedPage 
                    ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" 
                    : "bg-muted/30"
                )}
              />
            </div>
          </div>
        )}

        {/* User menu or login button */}
        <div className="flex items-center gap-2">
          {user && isProtectedPage && (
            <button className="relative bg-white/10 p-2 rounded-full mr-1">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-[hsl(var(--manako-accent))] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                2
              </span>
            </button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto hover:bg-transparent">
                  <Avatar className={cn(
                    "h-9 w-9",
                    isProtectedPage 
                      ? "border-2 border-white/30" 
                      : "border border-[hsl(var(--eventra-blue))]/10"
                  )}>
                    <AvatarFallback className={cn(
                      isProtectedPage 
                        ? "bg-[hsl(var(--eventra-purple))] text-white" 
                        : "bg-[hsl(var(--eventra-blue))]/5 text-[hsl(var(--eventra-blue))]"
                    )}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={cn(
                    "h-4 w-4",
                    isProtectedPage ? "text-white/70" : "text-muted-foreground"
                  )} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.display_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/events" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>My Events</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className={isProtectedPage ? "text-white hover:bg-white/10" : ""} asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button className={isProtectedPage ? "bg-white text-[hsl(var(--eventra-blue))] hover:bg-white/90" : ""} asChild>
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 