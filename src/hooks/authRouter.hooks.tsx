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
