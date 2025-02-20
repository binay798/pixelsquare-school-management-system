import { FullPageLoader } from '@src/components/loader/loader.component'
import { privateRoutes, protectedRoutes, publicRoutes } from '@src/routes'
import { createContext, useContext } from 'react'
import { RouterProvider, createHashRouter, Navigate } from 'react-router-dom'

const combinedRoutes = [
  ...publicRoutes,
  ...privateRoutes,
  ...protectedRoutes,
  { path: '*', element: <Navigate to="/" /> },
]

interface AuthType {
  user: Api.Auth.Login | null
  loading: boolean
}
const AuthContext = createContext<AuthType | null>(null)

export function AuthRouter(props: { auth: AuthType | null; loading: boolean }) {
  const finalRoutes = props?.loading
    ? [{ path: '*', element: <FullPageLoader /> }]
    : combinedRoutes

  return (
    <AuthContext.Provider value={props.auth}>
      <RouterProvider
        router={createHashRouter(finalRoutes)}
        fallbackElement={<FullPageLoader />}
      ></RouterProvider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const user = useContext(AuthContext)

  return user
}
