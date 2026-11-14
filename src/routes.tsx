import { Outlet, RouteObject } from 'react-router-dom'
import { Homepage } from './pages/homepage/homepage.pages'
import { Login } from './pages/auth/login/login.pages'
import {
  PrivateRoute,
  ProtectedRouteComp,
} from './components/auth/routes.component'
import { Dashboard } from './pages/dashboard/dashboard.page'
import { DashboardMain } from './pages/dashboard/pages/main/main.page'
import { Administrator } from './pages/dashboard/pages/administrator/administrator.page'
import { ManageSchool } from './pages/dashboard/pages/administrator/pages/manageSchool/manageSchool.page'
import { AcademicYear } from './pages/dashboard/pages/administrator/pages/academicYear/academicYear.component'
import { CreateAcademicYear } from './pages/dashboard/pages/administrator/pages/academicYear/pages/create/create.page'
import { EditAcademicYear } from './pages/dashboard/pages/administrator/pages/academicYear/pages/edit/edit.page'
import { ManageDesignation } from './pages/dashboard/pages/humanResources/pages/manageDesignation/manageDesignation.page'
import { ManageEmployee } from './pages/dashboard/pages/humanResources/pages/manageEmployee/manageEmployee.page'
import { ListDesignation } from './pages/dashboard/pages/humanResources/pages/manageDesignation/pages/list/list.page'
import { ListEmployeesPage } from './pages/dashboard/pages/humanResources/pages/manageEmployee/pages/list/list.page'
import { CreateEmployeePage } from './pages/dashboard/pages/humanResources/pages/manageEmployee/pages/create/create.page'
import { EditEmployeePage } from './pages/dashboard/pages/humanResources/pages/manageEmployee/pages/edit/edit.page'
import { DepartmentPage } from './pages/dashboard/pages/teachers/pages/departments/departments.page'
import { TeacherPage } from './pages/dashboard/pages/teachers/pages/teachers/teachers.page'
import { CreateTeacherPage } from './pages/dashboard/pages/teachers/pages/teachers/pages/create/create.page'
import { StudentAttendancePage } from './pages/dashboard/pages/attendance/pages/studentAttendance/studentAttendance.page'
import { ClassesPage } from './pages/dashboard/pages/academics/pages/classes/classes.page'
import { ClassSectionsPage } from './pages/dashboard/pages/academics/pages/sections/sections.page'
import { ClassRoutinesPage } from './pages/dashboard/pages/academics/pages/classRoutines/classRoutines.page'
import { ClassSubjectsPage } from './pages/dashboard/pages/academics/pages/subjects/subjects.page'
import { LessonPlanPage } from './pages/dashboard/pages/academics/pages/lessonPlan/lessonPlan.page'
import { CreateLessonPlanPage } from './pages/dashboard/pages/academics/pages/lessonPlan/pages/create/create.page'
import { LessonPlanDetailPage } from './pages/dashboard/pages/academics/pages/lessonPlan/pages/detail/detail.page'
import { WeeklyPlannerPage } from './pages/dashboard/pages/academics/pages/lessonPlan/pages/weekly/weekly.page'
import { SyllabusCompletionPage } from './pages/dashboard/pages/academics/pages/lessonPlan/pages/syllabus/syllabus.page'
import { LessonPlanTemplatesPage } from './pages/dashboard/pages/academics/pages/lessonPlan/pages/templates/templates.page'
import { AnnouncementListPage } from './pages/dashboard/pages/academics/pages/announcements/announcements.page'
import { CreateAnnouncementPage } from './pages/dashboard/pages/academics/pages/announcements/pages/create/create.page'
import { AnnouncementDetailPage } from './pages/dashboard/pages/academics/pages/announcements/pages/detail/detail.page'
import { AnnouncementRecipientsPage } from './pages/dashboard/pages/academics/pages/announcements/pages/recipients/recipients.page'
import { AnnouncementFeedPage } from './pages/dashboard/pages/academics/pages/announcements/pages/feed/feed.page'
import { EditTeacherPage } from './pages/dashboard/pages/teachers/pages/teachers/pages/edit/edit.page'
import { ManageStudent } from './pages/dashboard/pages/manageStudent/manageStudent.page'
import { StudentTypePage } from './pages/dashboard/pages/manageStudent/pages/studentType/studentType.page'
import { AdmitStudentPage } from './pages/dashboard/pages/manageStudent/pages/admitStudent/admitStudent.page'
import { StudentListPage } from './pages/dashboard/pages/manageStudent/pages/studentList/studentList.page'
import { EditStudentPage } from './pages/dashboard/pages/manageStudent/pages/studentList/pages/editStudent/editStudent.page'
import { TeacherAttendancePage } from './pages/dashboard/pages/attendance/pages/teacherAttendance/teacherAttendance.page'
import { EmployeeAttendancePage } from './pages/dashboard/pages/attendance/pages/employeeAttendance/employeeAttendace.page'
import { GuardianPage } from './pages/dashboard/pages/guardian/pages/guardian.page'
import { CreateGuardianPage } from './pages/dashboard/pages/guardian/pages/create/createGuardian.page'
import { EditGuardianPage } from './pages/dashboard/pages/guardian/pages/edit/edit.page'
import { ViewSubjectPage } from './pages/dashboard/pages/academics/pages/subjects/pages/viewSubject/viewSubject.page'
import { AccountPage } from './pages/dashboard/pages/account/account.page'
import { FeeDashboardPage } from './pages/dashboard/pages/fees/dashboard.page'
import { FeeTypesPage } from './pages/dashboard/pages/fees/pages/types/types.page'
import { FeeTemplatesPage } from './pages/dashboard/pages/fees/pages/templates/templates.page'
import { FeeAssignmentsPage } from './pages/dashboard/pages/fees/pages/assignments/assignments.page'
import { FeeScholarshipsPage } from './pages/dashboard/pages/fees/pages/scholarships/scholarships.page'
import { FeeLateFeesPage } from './pages/dashboard/pages/fees/pages/lateFees/lateFees.page'
import { FeeInvoicesPage } from './pages/dashboard/pages/fees/pages/invoices/invoices.page'
import { FeeInvoiceGeneratePage } from './pages/dashboard/pages/fees/pages/invoices/generate.page'
import { FeeInvoiceDetailPage } from './pages/dashboard/pages/fees/pages/invoices/invoiceDetail.page'
import { FeePaymentsPage } from './pages/dashboard/pages/fees/pages/payments/payments.page'
import { FeeCollectPaymentPage } from './pages/dashboard/pages/fees/pages/payments/collect.page'
import { FeeWalletsPage } from './pages/dashboard/pages/fees/pages/wallets/wallets.page'
import { FeeRefundsPage } from './pages/dashboard/pages/fees/pages/refunds/refunds.page'
import { FeeDefaultersPage } from './pages/dashboard/pages/fees/pages/defaulters/defaulters.page'
import { FeeReportsPage } from './pages/dashboard/pages/fees/pages/reports/reports.page'
import { FeeAccountingPage } from './pages/dashboard/pages/fees/pages/accounting/accounting.page'
import { AccountingDashboardPage } from './pages/dashboard/pages/accounting/dashboard.page'
import { AccountingAccountsPage } from './pages/dashboard/pages/accounting/accounts.page'
import { AccountingAccountDetailPage } from './pages/dashboard/pages/accounting/accountDetail.page'
import { AccountingJournalPage } from './pages/dashboard/pages/accounting/journal.page'
import { AccountingJournalCreatePage } from './pages/dashboard/pages/accounting/journalCreate.page'
import { AccountingJournalDetailPage } from './pages/dashboard/pages/accounting/journalDetail.page'
import { AccountingPeriodsPage } from './pages/dashboard/pages/accounting/periods.page'
import { AccountingPeriodDetailPage } from './pages/dashboard/pages/accounting/periodDetail.page'
import { AccountingReportsPage } from './pages/dashboard/pages/accounting/reports.page'

/** Public routes can be accessed by all users. for eg: homepage */
export const publicRoutes: RouteObject[] = [
  { path: '/', element: <Homepage /> },
]

/** Private routes can only be accessed by authenticated user. for eg: admin, superadmin
 * Essentially those users that has access to admin panel or dashboard
 */
export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
          { path: '/dashboard', element: <DashboardMain /> },
          { path: '/dashboard/account', element: <AccountPage /> },
          {
            path: '/dashboard/administrator',
            element: <Administrator />,
            children: [
              {
                path: '/dashboard/administrator/manage-school',
                element: <ManageSchool />,
              },
              {
                path: '/dashboard/administrator/academic-year',
                element: <Outlet />,
                children: [
                  {
                    path: '/dashboard/administrator/academic-year',
                    element: <AcademicYear />,
                  },
                  {
                    path: '/dashboard/administrator/academic-year/create',
                    element: <CreateAcademicYear />,
                  },
                  {
                    path: '/dashboard/administrator/academic-year/:academicYearId/edit',
                    element: <EditAcademicYear />,
                  },
                ],
              },
            ],
          },
          {
            path: '/dashboard/human-resources',
            element: <Outlet />,
            children: [
              {
                path: '',
                element: <ManageDesignation />,
                children: [
                  {
                    path: '',
                    element: <ListDesignation />,
                  },
                ],
              },
              {
                path: '/dashboard/human-resources/manage-employee',
                element: <ManageEmployee />,
                children: [
                  { path: '', element: <ListEmployeesPage /> },
                  { path: 'create', element: <CreateEmployeePage /> },
                  { path: 'edit/:employeeId', element: <EditEmployeePage /> },
                ],
              },
            ],
          },
          {
            path: 'teachers',
            element: <Outlet />,
            children: [
              {
                path: '',
                element: <TeacherPage />,
              },
              { path: 'create', element: <CreateTeacherPage /> },
              { path: 'edit/:teacherId', element: <EditTeacherPage /> },
              { path: 'departments', element: <DepartmentPage /> },
            ],
          },
          {
            path: 'manage-students',
            element: <ManageStudent />,
            children: [
              { path: 'student-type', element: <StudentTypePage /> },
              { path: 'admit-students', element: <AdmitStudentPage /> },
              { path: 'students-list', element: <StudentListPage /> },
              {
                path: 'students-list/edit/:studentId',
                element: <EditStudentPage />,
              },
            ],
          },

          {
            path: 'attendance',
            element: <Outlet />,
            children: [
              { path: 'student', element: <StudentAttendancePage /> },
              { path: 'teachers', element: <TeacherAttendancePage /> },
              { path: 'employees', element: <EmployeeAttendancePage /> },
            ],
          },
          {
            path: 'academics',
            element: <Outlet />,
            children: [
              { path: 'classes', element: <ClassesPage /> },
              { path: 'class-sections', element: <ClassSectionsPage /> },
              { path: 'class-routines', element: <ClassRoutinesPage /> },
              {
                path: 'lesson-plan',
                element: <Outlet />,
                children: [
                  { path: '', element: <LessonPlanPage /> },
                  { path: 'create', element: <CreateLessonPlanPage /> },
                  { path: 'weekly', element: <WeeklyPlannerPage /> },
                  { path: 'syllabus', element: <SyllabusCompletionPage /> },
                  { path: 'templates', element: <LessonPlanTemplatesPage /> },
                  { path: ':lessonPlanId', element: <LessonPlanDetailPage /> },
                  {
                    path: ':lessonPlanId/edit',
                    element: <CreateLessonPlanPage />,
                  },
                ],
              },
              {
                path: 'class-subjects',
                element: <Outlet />,
                children: [
                  { path: '', element: <ClassSubjectsPage /> },
                  { path: ':subjectId/view', element: <ViewSubjectPage /> },
                ],
              },
              {
                path: 'announcements',
                element: <Outlet />,
                children: [
                  { path: '', element: <AnnouncementListPage /> },
                  { path: 'create', element: <CreateAnnouncementPage /> },
                  { path: 'feed', element: <AnnouncementFeedPage /> },
                  {
                    path: ':announcementId',
                    element: <AnnouncementDetailPage />,
                  },
                  {
                    path: ':announcementId/edit',
                    element: <CreateAnnouncementPage />,
                  },
                  {
                    path: ':announcementId/recipients',
                    element: <AnnouncementRecipientsPage />,
                  },
                ],
              },
            ],
          },
          {
            path: 'fees',
            element: <Outlet />,
            children: [
              { path: '', element: <FeeDashboardPage /> },
              { path: 'types', element: <FeeTypesPage /> },
              { path: 'templates', element: <FeeTemplatesPage /> },
              { path: 'assignments', element: <FeeAssignmentsPage /> },
              { path: 'scholarships', element: <FeeScholarshipsPage /> },
              { path: 'late-fees', element: <FeeLateFeesPage /> },
              {
                path: 'invoices',
                element: <Outlet />,
                children: [
                  { path: '', element: <FeeInvoicesPage /> },
                  { path: 'generate', element: <FeeInvoiceGeneratePage /> },
                  { path: ':invoiceId', element: <FeeInvoiceDetailPage /> },
                ],
              },
              {
                path: 'payments',
                element: <Outlet />,
                children: [
                  { path: '', element: <FeePaymentsPage /> },
                  { path: 'collect', element: <FeeCollectPaymentPage /> },
                ],
              },
              { path: 'wallets', element: <FeeWalletsPage /> },
              { path: 'refunds', element: <FeeRefundsPage /> },
              { path: 'defaulters', element: <FeeDefaultersPage /> },
              { path: 'reports', element: <FeeReportsPage /> },
              { path: 'accounting', element: <FeeAccountingPage /> },
            ],
          },
          {
            path: 'accounting',
            element: <Outlet />,
            children: [
              { path: '', element: <AccountingDashboardPage /> },
              {
                path: 'accounts',
                element: <Outlet />,
                children: [
                  { path: '', element: <AccountingAccountsPage /> },
                  { path: ':id', element: <AccountingAccountDetailPage /> },
                ],
              },
              {
                path: 'journal',
                element: <Outlet />,
                children: [
                  { path: '', element: <AccountingJournalPage /> },
                  { path: 'new', element: <AccountingJournalCreatePage /> },
                  { path: ':id', element: <AccountingJournalDetailPage /> },
                ],
              },
              {
                path: 'periods',
                element: <Outlet />,
                children: [
                  { path: '', element: <AccountingPeriodsPage /> },
                  { path: ':id', element: <AccountingPeriodDetailPage /> },
                ],
              },
              { path: 'reports', element: <AccountingReportsPage /> },
            ],
          },
          {
            path: '/dashboard/guardian',

            children: [
              { path: '/dashboard/guardian', element: <GuardianPage /> },
              {
                path: '/dashboard/guardian/create',
                element: <CreateGuardianPage />,
              },
              {
                path: '/dashboard/guardian/edit/:guardianId',
                element: <EditGuardianPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]

/** Example of protected routes are : Login , signup page
 * These pages should not be accessed by logged in users
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRouteComp />,
    children: [{ path: '/login', element: <Login /> }],
  },
]
