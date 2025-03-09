import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'
import academicYearReducer from './redux/dashboard/academicYear/academicYear.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manageSchool: manageSchoolReducer,
    academicYear: academicYearReducer,
  },
})
