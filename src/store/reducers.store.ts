import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manageSchool: manageSchoolReducer,
  },
})
