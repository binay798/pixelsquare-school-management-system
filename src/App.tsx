import './App.css'
import { AuthRouter } from '@src/hooks/authRouter.hooks'
import './helpers/api.helpers'
import { useDispatch, useSelector } from './store/hooks.store'
import { useEffect, useState } from 'react'
import { authSliceGetUserSession } from './store/redux/auth/auth.slice'

// TODO: Need to add ThemeProvider responsiveFontSizes(theme)
function App() {
  const [loading, setLoading] = useState(true)
  const user = useSelector((store) => store.auth.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(authSliceGetUserSession({}))
  }, [])

  useEffect(() => {
    if (user.loading || user.sessionLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [user.loading, user.sessionLoading])

  return (
    <AuthRouter
      auth={{
        user: { user: {}, userRoles: [] },
        loading,
      }}
      loading={user.sessionLoading}
    ></AuthRouter>
  )
}

export default App
