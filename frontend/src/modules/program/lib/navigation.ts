import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { ROUTES } from '@/shared/constants/routes'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

/**
 * Get the base path for program management based on user role
 */
export function getProgramBasePath(): string {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (userStr) {
      const user: UserResponseDto = JSON.parse(userStr)
      const userRole = user?.roleName?.toUpperCase()
      return userRole === 'STAFF' ? ROUTES.STAFF_PROGRAM_FULL : ROUTES.ADMIN_PROGRAM_FULL
    }
  } catch (error) {
    console.error('Failed to get user role for navigation:', error)
  }
  return ROUTES.ADMIN_PROGRAM_FULL // Default fallback
}
