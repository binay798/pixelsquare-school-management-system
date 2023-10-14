import { useAuth } from '@src/hooks/authRouter.hooks'
import { Navigate, Outlet } from 'react-router-dom'
import { isEmpty } from 'lodash'

export function PrivateRoute() {
  const auth = useAuth()
  if (!isEmpty(auth?.user)) {
    return <Outlet />
  }

  return <Navigate to={'/'} />
}

export function ProtectedRouteComp() {
  const auth = useAuth()

  if (!isEmpty(auth?.user)) {
    return <Navigate to="/" />
  } else {
    return <Outlet />
  }
}
