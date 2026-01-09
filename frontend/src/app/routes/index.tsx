import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { publicRoutes } from './public.routes'
import { protectedRoutes } from './protected.routes'
import { notFoundRoutes } from './notFound.routes'
import { ROUTES } from '@/shared/constants/routes'

const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  ...notFoundRoutes,
  {
    path: '*',
    element: <Navigate to={ROUTES.NOT_FOUND} replace />,
  },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}

