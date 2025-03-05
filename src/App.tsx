import './App.css'
import { AuthRouter } from '@src/hooks/authRouter.hooks'
import './helpers/api.helpers'
import { useDispatch, useSelector } from './store/hooks.store'
import { useEffect, useState } from 'react'
import { authSliceGetUserSession } from './store/redux/auth/auth.slice'
import { getSchoolDetailSlice } from './store/redux/dashboard/manageSchool/manageSchool.slice'
import { isEmpty } from 'lodash'

// TODO: Need to add ThemeProvider responsiveFontSizes(theme)
function App() {
  const [loading, setLoading] = useState(true)
  const user = useSelector((store) => store.auth.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(authSliceGetUserSession({}))
  }, [])

  useEffect(() => {
    if (!isEmpty(user.data?.user)) {
      dispatch(getSchoolDetailSlice({}))
    }
  }, [user.data?.user])

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
        user: user.data,
        loading,
      }}
      loading={user.sessionLoading}
    ></AuthRouter>
  )
}

export default App
