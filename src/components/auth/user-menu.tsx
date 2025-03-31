'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" size="icon">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={user.display_name} />
            <AvatarFallback>
              {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px]">
        <SheetHeader>
          <SheetTitle>My Account</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-4 py-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-user.jpg" alt={user.display_name} />
              <AvatarFallback>
                {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.display_name || user.username}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard">
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/profile">
              <span>Profile</span>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/settings">
              <span>Settings</span>
            </Link>
          </Button>
          {user.is_admin && (
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin">
                <span>Admin</span>
              </Link>
            </Button>
          )}
        </div>
        <SheetFooter className="mt-auto pt-4">
          <Button variant="destructive" onClick={handleLogout} className="w-full">Log out</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 