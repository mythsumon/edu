import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const ProtectedLayout = () => {
  const isAuthenticated = !!localStorage.getItem(STORAGE_KEYS.USER)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}

