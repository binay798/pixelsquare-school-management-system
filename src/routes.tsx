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
            children: [{ path: 'departments', element: <DepartmentPage /> }],
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
