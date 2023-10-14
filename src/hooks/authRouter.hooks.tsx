import {
  PrivateRoute,
  ProtectedRouteComp,
} from '@src/components/auth/routes.component'
import { Login } from '@src/pages/auth/login/login.pages'
import { Homepage } from '@src/pages/homepage/homepage.pages'
import { createContext, useContext } from 'react'
import {
  RouterProvider,
  createHashRouter,
  RouteObject,
  Navigate,
} from 'react-router-dom'

const publicRoutes: RouteObject[] = [{ path: '/', element: <Homepage /> }]
const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateRoute />,
    children: [{ path: '/dashboard', element: <div>dashboard</div> }],
  },
]
const protectedRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <ProtectedRouteComp />,
    children: [{ path: '', element: <Login /> }],
  },
]

const combinedRoutes = [
  ...publicRoutes,
  ...privateRoutes,
  ...protectedRoutes,
  { path: '*', element: <Navigate to="/" /> },
]

interface AuthType {
  user: object
  token: string
}
const AuthContext = createContext<AuthType | null>(null)

export function AuthRouter(props: { auth: AuthType | null; loading: boolean }) {
  const finalRoutes = props?.loading
    ? [{ path: '*', element: <div>Loading...</div> }]
    : combinedRoutes

  return (
    <AuthContext.Provider value={props.auth}>
      <RouterProvider
        router={createHashRouter(finalRoutes)}
        fallbackElement={<div>Loading...</div>}
      ></RouterProvider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const user = useContext(AuthContext)

  return user
}
