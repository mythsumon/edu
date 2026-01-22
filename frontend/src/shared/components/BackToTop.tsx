import { useState, useEffect, useRef } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

interface BackToTopProps {
  /**
   * Scroll threshold in pixels before button appears
   * @default 300
   */
  threshold?: number
  /**
   * Additional className for the button container
   */
  className?: string
}

export const BackToTop = ({ threshold = 300, className }: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Find the scrollable container (main element with overflow-y-auto)
    const findScrollContainer = (): HTMLElement | null => {
      // First try to find the main element (used in AppShell)
      const mainElement = document.querySelector('main')
      if (mainElement) {
        const style = window.getComputedStyle(mainElement)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return mainElement
        }
      }
      
      // Fallback: find any element with overflow-y-auto
      const allElements = document.querySelectorAll('*')
      for (const el of allElements) {
        const style = window.getComputedStyle(el)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return el as HTMLElement
        }
      }
      
      return null
    }

    let scrollContainer: HTMLElement | null = null
    let toggleVisibility: (() => void) | null = null

    // Use a small timeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      scrollContainer = findScrollContainer()
      scrollContainerRef.current = scrollContainer

      if (!scrollContainer) {
        // No scrollable container found, use window
        toggleVisibility = () => {
          if (window.scrollY > threshold) {
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        }

        toggleVisibility()
        window.addEventListener('scroll', toggleVisibility, { passive: true })
      } else {
        toggleVisibility = () => {
          const scrollTop = scrollContainer!.scrollTop
          if (scrollTop > threshold) {
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        }

        // Initial check
        toggleVisibility()

        scrollContainer.addEventListener('scroll', toggleVisibility, { passive: true })
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (toggleVisibility) {
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', toggleVisibility)
        } else {
          window.removeEventListener('scroll', toggleVisibility)
        }
      }
    }
  }, [threshold])

  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef.current
    
    if (!scrollContainer) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
        'bg-background/95 backdrop-blur-sm border-2 hover:bg-accent',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
        className
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}
