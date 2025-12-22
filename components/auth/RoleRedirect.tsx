'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function RoleRedirect() {
  const router = useRouter()
  const { userRole, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        router.push('/admin')
      } else if (userRole === 'instructor') {
        router.push('/instructor/dashboard')
      } else {
        // Default redirect for other roles or if role is not recognized
        router.push('/')
      }
    }
  }, [isAuthenticated, userRole, router])

  return null
}