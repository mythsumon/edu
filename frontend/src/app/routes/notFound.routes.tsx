import { RouteObject } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-4">Page not found</p>
      <Link
        to={ROUTES.HOME}
        className="text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  </div>
)

export const notFoundRoutes: RouteObject[] = [
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
]

