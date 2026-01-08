'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Suppress known React Strict Mode DOM errors
    if (
      error.message?.includes('removeChild') ||
      error.message?.includes('NotFoundError') ||
      error.name === 'NotFoundError' ||
      error.message?.includes('Failed to execute \'removeChild\'')
    ) {
      // These errors are often caused by React Strict Mode double rendering
      // and don't affect functionality - silently ignore them
      return
    }
    
    // Log other errors to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-card shadow-card p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-6">
          페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  )
}

