import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'
import classSectionReducer from './redux/dashboard/academics/classSections/sections.slice'
import academicYearReducer from './redux/dashboard/academicYear/academicYear.slice'
import designationReducer from './redux/dashboard/humanResources/designations/designations.slice'
import manageEmployeeReducer from './redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'
import departmentReducer from './redux/dashboard/teachers/departments/departments.slice'
import classReducer from './redux/dashboard/academics/classes/classes.slice'
import subjectReducer from './redux/dashboard/academics/subjects/subjects.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manageSchool: manageSchoolReducer,
    academicYear: academicYearReducer,
    designations: designationReducer,
    employees: manageEmployeeReducer,
    departments: departmentReducer,
    classes: classReducer,
    classSections: classSectionReducer,
    subjects: subjectReducer,
  },
})
