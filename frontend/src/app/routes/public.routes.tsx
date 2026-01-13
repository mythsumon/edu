import { RouteObject } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { LoginPage } from '@/modules/auth'

export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
]

