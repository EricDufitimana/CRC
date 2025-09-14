'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import PreLoader from './PreLoader'

export default function LoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    // Only show loading if pathname has changed
    if (previousPathname.current !== pathname) {
      setIsLoading(true)
      previousPathname.current = pathname
      
      // Hide loading after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  return isLoading ? <PreLoader /> : null
}
