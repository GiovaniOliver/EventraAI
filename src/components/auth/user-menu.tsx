'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'

export function UserMenu() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <div className="flex space-x-2">
        <Link
          href="/auth/login"
          className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Login
        </Link>
        <Link
          href="/auth/signup"
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
          {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="border-b px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user.display_name || user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
          {user.is_admin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            role="menuitem"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
} 