export const ROLE = {
  superadmin: 'superadmin',
  admin: 'admin',
  student: 'student',
  teacher: 'teacher',
  accountant: 'accountant',
  staff: 'staff',
  librarian: 'librarian',
  guardian: 'guardian',
  all: [
    'superadmin',
    'admin',
    'student',
    'teacher',
    'accountant',
    'staff',
    'librarian',
    'staff',
    'guardian',
  ],
} as const
export const EMPLOYEE_ROLE = [
  ROLE.accountant,
  ROLE.guardian,
  ROLE.librarian,
  ROLE.staff,
]
export type UserRoleType =
  | 'superadmin'
  | 'admin'
  | 'student'
  | 'teacher'
  | 'accountant'
  | 'staff'
  | 'librarian'
  | 'guardian'
