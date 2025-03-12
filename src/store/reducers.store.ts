import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'
import academicYearReducer from './redux/dashboard/academicYear/academicYear.slice'
import designationReducer from './redux/dashboard/humanResources/designations/designations.slice'
import manageEmployeeReducer from './redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manageSchool: manageSchoolReducer,
    academicYear: academicYearReducer,
    designations: designationReducer,
    employees: manageEmployeeReducer,
  },
})
