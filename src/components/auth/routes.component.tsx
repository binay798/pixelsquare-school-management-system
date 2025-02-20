import { useAuth } from '@src/hooks/authRouter.hooks'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { isEmpty } from 'lodash'

export function PrivateRoute() {
  const auth = useAuth()
  if (!isEmpty(auth?.user)) {
    return <Outlet />
  }

  if (auth?.loading) {
    return <Outlet />
  }

  return <Navigate to={'/'} />
}

export function ProtectedRouteComp() {
  const auth = useAuth()

  const location = useLocation()

  if (!isEmpty(auth?.user)) {
    if (location.pathname === '/login') {
      return <Navigate to="/dashboard" />
    }

    return <Navigate to="/" />
  } else {
    return <Outlet />
  }
}

export function VerifyRoleRoute({
  children,
  roles,
}: {
  roles: string[]
  children?: React.ReactElement
}) {
  const auth = useAuth()
  const validRoles = auth?.user?.userRoles ?? []
  const mainRoles = new Set(roles)
  const exist = validRoles.some((str) => mainRoles.has(str))
  const navigate = useNavigate()
  if (!exist) {
    if (!isEmpty(auth?.user?.user)) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return <>{children}</>
}
