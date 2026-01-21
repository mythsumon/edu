import { Navigate } from 'react-router-dom'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { ROUTES } from '@/shared/constants/routes'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

/**
 * Root redirect component that redirects authenticated users to their role-based dashboard
 * and unauthenticated users to the login page
 * 
 * Uses localStorage directly (like ProtectedLayout) for consistency and to avoid timing issues
 */
export const RootRedirect = () => {
  // Check authentication by looking at localStorage directly (consistent with ProtectedLayout)
  const userStr = localStorage.getItem(STORAGE_KEYS.USER)
  
  // If not authenticated, redirect to login
  if (!userStr) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Try to get user info from localStorage
  try {
    const user: UserResponseDto = JSON.parse(userStr)
    const roleName = user.roleName?.toUpperCase()

    // Redirect based on role
    if (roleName === 'ADMIN') {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD_FULL} replace />
    } else if (roleName === 'INSTRUCTOR') {
      return <Navigate to={ROUTES.INSTRUCTOR_DASHBOARD_FULL} replace />
    } else if (roleName === 'TEACHER') {
      return <Navigate to={ROUTES.TEACHER_DASHBOARD_FULL} replace />
    } else if (roleName === 'STAFF') {
      return <Navigate to={ROUTES.STAFF_DASHBOARD_FULL} replace />
    }
  } catch (error) {
    // If parsing fails, fall through to login redirect
    console.error('Failed to parse user info:', error)
  }

  // Fallback: redirect to login if role cannot be determined
  return <Navigate to={ROUTES.LOGIN} replace />
}
