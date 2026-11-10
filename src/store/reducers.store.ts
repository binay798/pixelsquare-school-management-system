import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import accountPasswordReducer from './redux/dashboard/account/password/password.slice'
import accountProfileReducer from './redux/dashboard/account/profile/profile.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'
import classSectionReducer from './redux/dashboard/academics/classSections/sections.slice'
import academicYearReducer from './redux/dashboard/academicYear/academicYear.slice'
import designationReducer from './redux/dashboard/humanResources/designations/designations.slice'
import manageEmployeeReducer from './redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'
import departmentReducer from './redux/dashboard/teachers/departments/departments.slice'
import classReducer from './redux/dashboard/academics/classes/classes.slice'
import subjectReducer from './redux/dashboard/academics/subjects/subjects.slice'
import topicReducer from './redux/dashboard/academics/topics/topics.slice'
import teacherReduder from './redux/dashboard/teachers/teachers.slice'
import manageStudentReducer from './redux/dashboard/manageStudents/manageStudents.slice'
import attendanceReducer from './redux/dashboard/attendance/attendance.slice'
import guardianReducer from './redux/dashboard/guardian/guardian.slice'
import classRoutineReducer from './redux/dashboard/academics/classRoutines/classRoutines.slice'
import lessonPlanReducer from './redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import announcementReducer from './redux/dashboard/academics/announcements/announcements.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accountPassword: accountPasswordReducer,
    accountProfile: accountProfileReducer,
    attendance: attendanceReducer,
    manageSchool: manageSchoolReducer,
    academicYear: academicYearReducer,
    designations: designationReducer,
    employees: manageEmployeeReducer,
    departments: departmentReducer,
    classes: classReducer,
    classSections: classSectionReducer,
    subjects: subjectReducer,
    topics: topicReducer,
    teachers: teacherReduder,
    manageStudents: manageStudentReducer,
    guardians: guardianReducer,
    classRoutines: classRoutineReducer,
    lessonPlans: lessonPlanReducer,
    announcements: announcementReducer,
  },
})
