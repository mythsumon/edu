import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, logout } from '../model/auth.service'
import type { LoginRequestDto } from '../model/auth.types'
import { useAuthStore } from '@/shared/stores/auth.store'
import { ROUTES } from '@/shared/constants/routes'
import { authQueryKeys } from './queryKeys'

/**
 * Login mutation hook
 */
export const useLoginMutation = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationKey: authQueryKeys.login(),
    mutationFn: (credentials: LoginRequestDto) => login(credentials),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate(ROUTES.DASHBOARD, { replace: true })
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
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    },
    onError: () => {
      // Even if logout fails on server, clear local auth
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}
