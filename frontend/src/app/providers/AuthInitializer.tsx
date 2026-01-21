import { useEffect, useRef } from 'react'
import { getCurrentUser } from '@/modules/auth/model/auth.service'
import { useAuthStore } from '@/shared/stores/auth.store'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

/**
 * Component that initializes authentication on app startup
 * Validates existing access token by calling /user/me endpoint
 */
export const AuthInitializer = () => {
  const { setAuthenticated, clearAuth } = useAuthStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization (especially in React StrictMode)
    if (hasInitialized.current) {
      return
    }

    hasInitialized.current = true

    const initializeAuth = async () => {
      try {
        // Validate access token by fetching current user info
        const userInfo = await getCurrentUser()
        
        // If successful, user is authenticated with valid token
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo))
        setAuthenticated(true)
      } catch (error) {
        // Token invalid or expired - clear auth state
        // The interceptor will handle token refresh if needed on subsequent requests
        sessionStorage.removeItem('access_token')
        localStorage.removeItem(STORAGE_KEYS.USER)
        clearAuth()
      }
    }

    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - Zustand functions are stable and we only want to run once

  return null
}
