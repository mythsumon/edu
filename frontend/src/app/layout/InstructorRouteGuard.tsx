import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

export const InstructorRouteGuard = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER)
  
  if (!userStr) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  try {
    const user: UserResponseDto = JSON.parse(userStr)
    const userRole = user?.roleName?.toUpperCase()

    if (userRole !== 'INSTRUCTOR') {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />
    }

    return <Outlet />
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error)
    return <Navigate to={ROUTES.LOGIN} replace />
  }
}
