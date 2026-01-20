import * as React from 'react'
// import { useTranslation } from 'react-i18next'
import { ErrorState } from './ErrorState'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    // TODO: Log to error reporting service in production
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <ErrorBoundaryFallback error={this.state.error} resetError={this.resetError} />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Boundary Fallback Component
 */
const ErrorBoundaryFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  // const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <ErrorState error={error} onRetry={resetError} />
      </div>
    </div>
  )
}
