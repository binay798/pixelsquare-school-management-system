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
import { EditTeacherPage } from './pages/dashboard/pages/teachers/pages/teachers/pages/edit/edit.page'
import { ManageStudent } from './pages/dashboard/pages/manageStudent/manageStudent.page'
import { StudentTypePage } from './pages/dashboard/pages/manageStudent/pages/studentType/studentType.page'
import { AdmitStudentPage } from './pages/dashboard/pages/manageStudent/pages/admitStudent/admitStudent.page'
import { StudentListPage } from './pages/dashboard/pages/manageStudent/pages/studentList/studentList.page'
import { EditStudentPage } from './pages/dashboard/pages/manageStudent/pages/studentList/pages/editStudent/editStudent.page'
import { TeacherAttendancePage } from './pages/dashboard/pages/attendance/pages/teacherAttendance/teacherAttendance.page'

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
            ],
          },
          {
            path: 'academics',
            element: <Outlet />,
            children: [
              { path: 'classes', element: <ClassesPage /> },
              { path: 'class-sections', element: <ClassSectionsPage /> },
              { path: 'class-routines', element: <ClassRoutinesPage /> },
              { path: 'class-subjects', element: <ClassSubjectsPage /> },
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
