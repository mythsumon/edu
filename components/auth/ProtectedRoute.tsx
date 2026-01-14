'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Spin } from 'antd'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const { userRole, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (isLoading) {
      return
    }

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(userRole as string)) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'admin') {
          router.push('/admin')
        } else if (userRole === 'instructor') {
          router.push('/instructor/dashboard')
        } else if (userRole === 'teacher') {
          router.push('/teacher/dashboard')
        } else {
          router.push(redirectTo)
        }
        return
      }
    }
  }, [isAuthenticated, userRole, requiredRole, redirectTo, router, isLoading])

  // Show loading spinner while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // Check role access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(userRole as string)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
            <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}