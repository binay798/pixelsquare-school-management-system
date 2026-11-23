import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import accountPasswordReducer from './redux/dashboard/account/password/password.slice'
import accountProfileReducer from './redux/dashboard/account/profile/profile.slice'
import manageSchoolReducer from './redux/dashboard/manageSchool/manageSchool.slice'
import classSectionReducer from './redux/dashboard/academics/classSections/sections.slice'
import academicYearReducer from './redux/dashboard/academicYear/academicYear.slice'
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
import feeConfigReducer from './redux/dashboard/fee/fee.config.slice'
import feeDashboardReducer from './redux/dashboard/fee/fee.dashboard.slice'
import feeInvoicesReducer from './redux/dashboard/fee/fee.invoices.slice'
import feePaymentsReducer from './redux/dashboard/fee/fee.payments.slice'
import feeRefundsReducer from './redux/dashboard/fee/fee.refunds.slice'
import feeWalletsReducer from './redux/dashboard/fee/fee.wallets.slice'
import accountingReducer from './redux/dashboard/accounting/accounting.slice'
import complaintReducer from './redux/dashboard/complaints/complaints.slice'
import complaintConfigReducer from './redux/dashboard/complaints/complaintConfig.slice'
import payrollReducer from './redux/dashboard/payroll/payroll.slice'
import roomsReducer from './redux/dashboard/rooms/rooms.slice'
import dashboardOverviewReducer from './redux/dashboard/overview/overview.slice'

/**
 * One frontend build serves every school, so a sign-out has to forget everything
 * the previous tenant loaded. Without the reset below, the rows of school A stay
 * in memory and render under the token of the next user of school B.
 */
export const RESET_APP_STATE = 'app/reset'
export const resetAppState = () => ({ type: RESET_APP_STATE })

const appReducer = combineReducers({
  auth: authReducer,
  accountPassword: accountPasswordReducer,
  accountProfile: accountProfileReducer,
  attendance: attendanceReducer,
  manageSchool: manageSchoolReducer,
  academicYear: academicYearReducer,
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
  feeConfig: feeConfigReducer,
  feeDashboard: feeDashboardReducer,
  feeInvoices: feeInvoicesReducer,
  feePayments: feePaymentsReducer,
  feeRefunds: feeRefundsReducer,
  feeWallets: feeWalletsReducer,
  accounting: accountingReducer,
  complaints: complaintReducer,
  complaintConfig: complaintConfigReducer,
  payroll: payrollReducer,
  rooms: roomsReducer,
  dashboardOverview: dashboardOverviewReducer,
})

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === RESET_APP_STATE) {
    return appReducer(undefined, action)
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
})
