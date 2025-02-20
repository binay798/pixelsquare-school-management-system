import { RouteObject } from 'react-router-dom'
import { Homepage } from './pages/homepage/homepage.pages'
import { Login } from './pages/auth/login/login.pages'
import {
  PrivateRoute,
  ProtectedRouteComp,
} from './components/auth/routes.component'
import { Dashboard } from './pages/dashboard/dashboard.page'

/** Public routes can be accessed by all users. for eg: homepage */
export const publicRoutes: RouteObject[] = [
  { path: '/', element: <Homepage /> },
]

/** Private routes can only be accessed by authenticated user. for eg: admin, superadmin
 * Essentially those users that has access to admin panel or dashboard
 */
export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateRoute />,
    children: [{ path: '/dashboard', element: <Dashboard /> }],
  },
]

/** Example of protected routes are : Login , signup page
 * These pages should not be accessed by logged in users
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRouteComp />,
    children: [{ path: '/login', element: <Login /> }],
  },
]
