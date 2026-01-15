import { RouteObject } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { Link } from 'react-router-dom'

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">403</h1>
      <p className="text-muted-foreground mb-4">You don't have permission to access this page</p>
      <Link
        to={ROUTES.HOME}
        className="text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  </div>
)

export const unauthorizedRoutes: RouteObject[] = [
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
]
