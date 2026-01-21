import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { ROUTES } from '@/shared/constants/routes'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

/**
 * Get the base path for institution management based on user role
 */
export function getInstitutionBasePath(): string {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (userStr) {
      const user: UserResponseDto = JSON.parse(userStr)
      const userRole = user?.roleName?.toUpperCase()
      return userRole === 'STAFF' ? ROUTES.STAFF_INSTITUTION_FULL : ROUTES.ADMIN_INSTITUTION_FULL
    }
  } catch (error) {
    console.error('Failed to get user role for navigation:', error)
  }
  return ROUTES.ADMIN_INSTITUTION_FULL // Default fallback
}
