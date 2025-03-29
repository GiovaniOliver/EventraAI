'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return
    }
    
    const media = window.matchMedia(query)
    
    // Initial check
    setMatches(media.matches)
    
    // Setup listener for changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    } 
    // Fallback for older browsers
    else {
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query])
  
  return matches
}
