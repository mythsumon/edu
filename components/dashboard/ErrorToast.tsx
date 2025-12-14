'use client'

import { X, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ErrorToastProps {
  message: string
  onClose?: () => void
  duration?: number
}

export function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="bg-white rounded-lg shadow-lg border border-red-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}





