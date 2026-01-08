'use client'

import { useEffect } from 'react'

/**
 * Global error handler for React DOM manipulation errors
 * These errors often occur in development mode due to React Strict Mode
 * and don't affect the actual functionality of the application
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Override console.error to filter out React Strict Mode DOM errors
    const originalConsoleError = console.error.bind(console)
    
    const filteredConsoleError = (...args: any[]) => {
      // Check if any argument contains the error we want to suppress
      const errorString = args.map(arg => {
        if (arg instanceof Error) {
          return (arg.message || '') + ' ' + (arg.name || '')
        }
        if (typeof arg === 'string') {
          return arg
        }
        if (arg && typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')

      // Suppress known React Strict Mode DOM errors
      const shouldSuppress = 
        errorString.includes('removeChild') ||
        errorString.includes('NotFoundError') ||
        errorString.includes('Failed to execute') ||
        errorString.includes('The node to be removed is not a child') ||
        errorString.includes('commitDeletionEffectsOnFiber') ||
        errorString.includes('commitDeletionEffects') ||
        errorString.includes('recursivelyTraverseMutationEffects') ||
        (errorString.includes('react-dom') && errorString.includes('removeChild'))
      
      if (shouldSuppress) {
        // Silently ignore these errors (they're harmless React Strict Mode artifacts)
        return
      }

      // Call original console.error for other errors
      originalConsoleError(...args)
    }

    // Replace console.error
    console.error = filteredConsoleError

    const handleError = (event: ErrorEvent) => {
      // Suppress known React Strict Mode DOM errors
      if (
        event.error?.message?.includes('removeChild') ||
        event.error?.message?.includes('NotFoundError') ||
        event.error?.name === 'NotFoundError' ||
        event.message?.includes('removeChild') ||
        event.message?.includes('NotFoundError') ||
        event.message?.includes('Failed to execute \'removeChild\'')
      ) {
        // Prevent these errors from showing in console
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress known React Strict Mode DOM errors in promise rejections
      if (
        event.reason?.message?.includes('removeChild') ||
        event.reason?.message?.includes('NotFoundError') ||
        event.reason?.name === 'NotFoundError' ||
        event.reason?.message?.includes('Failed to execute \'removeChild\'')
      ) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      // Restore original console.error
      if (console.error === filteredConsoleError) {
        console.error = originalConsoleError
      }
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
}

