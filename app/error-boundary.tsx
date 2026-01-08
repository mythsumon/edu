'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      // Suppress known React Strict Mode DOM errors
      if (
        error.message?.includes('removeChild') ||
        error.message?.includes('NotFoundError') ||
        error.name === 'NotFoundError'
      ) {
        // These errors are often caused by React Strict Mode double rendering
        // and don't affect functionality
        return
      }
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Suppress known React Strict Mode DOM errors
      if (
        this.state.error?.message?.includes('removeChild') ||
        this.state.error?.message?.includes('NotFoundError') ||
        this.state.error?.name === 'NotFoundError'
      ) {
        // Reset error state and continue rendering
        this.setState({ hasError: false, error: null })
        return this.props.children
      }

      // For other errors, show fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Something went wrong
              </h1>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

