import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, logout, getCurrentUser } from '../model/auth.service'
import type { LoginRequestDto } from '../model/auth.types'
import { useAuthStore } from '@/shared/stores/auth.store'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { authQueryKeys } from './queryKeys'

/**
 * Login mutation hook
 */
export const useLoginMutation = () => {
  const navigate = useNavigate()
  const { setAuthenticated } = useAuthStore()

  return useMutation({
    mutationKey: authQueryKeys.login(),
    mutationFn: async (credentials: LoginRequestDto) => {
      // Login and get tokens
      const loginData = await login(credentials)
      
      // Save access_token to sessionStorage
      if (loginData.access_token) {
        sessionStorage.setItem('access_token', loginData.access_token)
        setAuthenticated(true)
        
        // Fetch user info and save to localStorage
        try {
          const userInfo = await getCurrentUser()
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo))
          
          // Return user info for navigation
          return { loginData, userInfo }
        } catch (error) {
          console.error('Failed to fetch user info:', error)
          return { loginData, userInfo: null }
        }
      }
      
      return { loginData, userInfo: null }
    },
    onSuccess: (data) => {
      // Navigate to role-specific dashboard
      const userRole = data.userInfo?.roleName?.toUpperCase()
      if (userRole === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD_FULL, { replace: true })
      } else if (userRole === 'INSTRUCTOR') {
        navigate(ROUTES.INSTRUCTOR_DASHBOARD_FULL, { replace: true })
      } else if (userRole === 'TEACHER') {
        navigate(ROUTES.TEACHER_DASHBOARD_FULL, { replace: true })
      } else {
        // Fallback for unknown roles
        navigate(ROUTES.LOGIN, { replace: true })
      }
    },
  })
}

/**
 * Logout mutation hook
 */
export const useLogoutMutation = () => {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationKey: authQueryKeys.logout(),
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear sessionStorage and localStorage
      sessionStorage.removeItem('access_token')
      localStorage.removeItem(STORAGE_KEYS.USER)
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    },
    onError: () => {
      // Even if logout fails on server, clear local storage
      sessionStorage.removeItem('access_token')
      localStorage.removeItem(STORAGE_KEYS.USER)
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}
