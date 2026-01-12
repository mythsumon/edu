import { useEffect } from 'react'
import { refreshToken, getCurrentUser } from '@/modules/auth/model/auth.service'
import { useAuthStore } from '@/shared/stores/auth.store'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

/**
 * Component that initializes authentication on app startup
 * Attempts to refresh token if refresh_token cookie exists
 */
export const AuthInitializer = () => {
  const { setAuthenticated, clearAuth } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh token (reads refresh_token from HttpOnly cookie)
        const refreshData = await refreshToken()
        
        if (refreshData.access_token) {
          // Save new access_token to sessionStorage
          sessionStorage.setItem('access_token', refreshData.access_token)
          setAuthenticated(true)
          
          // Fetch and save user info to localStorage
          try {
            const userInfo = await getCurrentUser()
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo))
          } catch (error) {
            console.error('Failed to fetch user info on startup:', error)
            // Still authenticated even if user fetch fails
          }
        }
      } catch (error) {
        // No refresh token or refresh failed - clear auth state
        sessionStorage.removeItem('access_token')
        localStorage.removeItem(STORAGE_KEYS.USER)
        clearAuth()
      }
    }

    initializeAuth()
  }, [setAuthenticated, clearAuth])

  return null
}
