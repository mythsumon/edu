'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // Find the scrollable main container
  useEffect(() => {
    // Find the main element that has overflow-y-auto
    const mainElement = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement
    if (mainElement) {
      scrollContainerRef.current = mainElement
    }
  }, [])

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollContainer = scrollContainerRef.current || window
      const scrollY = scrollContainer === window 
        ? window.scrollY 
        : (scrollContainer as HTMLElement).scrollTop

      // Show button when user scrolls down 300px
      if (scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const scrollContainer = scrollContainerRef.current || window
    scrollContainer.addEventListener('scroll', toggleVisibility)

    // Initial check
    toggleVisibility()

    return () => {
      scrollContainer.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef.current || window
    
    if (scrollContainer === window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      (scrollContainer as HTMLElement).scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-button shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="맨 위로 이동"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  )
}
