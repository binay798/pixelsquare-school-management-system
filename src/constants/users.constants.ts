export const ROLE = {
  superadmin: 'superadmin',
  admin: 'admin',
  student: 'student',
  teacher: 'teacher',
  accountant: 'accountant',
  finance_manager: 'finance_manager',
  auditor: 'auditor',
  staff: 'staff',
  librarian: 'librarian',
  guardian: 'guardian',
  hr_manager: 'hr_manager',
  principal: 'principal',
  all: [
    'superadmin',
    'admin',
    'student',
    'teacher',
    'accountant',
    'finance_manager',
    'auditor',
    'staff',
    'librarian',
    'guardian',
    'hr_manager',
    'principal',
  ],
} as const

/**
 * Roles an employee account can be created with. Teachers are provisioned from the
 * teachers module, so every other role is offered here.
 */
export const EMPLOYEE_ROLE = [
  ROLE.superadmin,
  ROLE.admin,
  ROLE.student,
  ROLE.accountant,
  ROLE.finance_manager,
  ROLE.auditor,
  ROLE.staff,
  ROLE.librarian,
  ROLE.hr_manager,
  ROLE.principal,
]

/**
 * Teacher accounts are created from the teachers module, but a teacher is still
 * an employee, so the role has to be visible (and keepable) when an existing
 * employee record — payroll profile, salary, leave — is edited.
 */
export const EMPLOYEE_ROLE_EDIT = [...EMPLOYEE_ROLE, ROLE.teacher]

export const EMPLOYEE_ROLE_LABEL: Record<string, string> = {
  superadmin: 'Super admin',
  admin: 'Admin',
  student: 'Student',
  accountant: 'Accountant',
  finance_manager: 'Finance manager',
  auditor: 'Auditor',
  staff: 'Staff',
  librarian: 'Librarian',
  hr_manager: 'HR manager',
  principal: 'Principal',
  teacher: 'Teacher',
}

export type UserRoleType =
  | 'superadmin'
  | 'admin'
  | 'student'
  | 'teacher'
  | 'accountant'
  | 'finance_manager'
  | 'auditor'
  | 'staff'
  | 'librarian'
  | 'guardian'
  | 'hr_manager'
  | 'principal'
