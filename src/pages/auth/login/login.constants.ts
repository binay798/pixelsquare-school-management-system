/**
 * Copy and small configuration for the sign-in screen.
 * Keeping it here means the marketing/brand text can change without touching
 * the form logic.
 */
export const LOGIN_BRAND = {
  product: 'School Management System',
  shortName: 'School Management',
  platform: 'School operations platform',
  eyebrow: 'Built for modern schools',
  headline: 'Every part of your school, finally in one place.',
  description:
    'Attendance, academics, fees, payroll and parent communication — one secure workspace for your entire campus.',
  features: [
    {
      title: 'Attendance & academics',
      description: 'Daily registers, timetables, exams and report cards.',
    },
    {
      title: 'Fees, accounting & payroll',
      description: 'Invoices, collections and staff salaries in one ledger.',
    },
    {
      title: 'Communication & complaints',
      description: 'Tickets, announcements and updates for the right people.',
    },
  ],
  modules: [
    'Attendance',
    'Academics',
    'Fees',
    'Payroll',
    'Complaints',
    'Reports',
  ],
  trust: ['Role-based access', 'Encrypted sessions', 'Audit-ready records'],
}

/** Key used to remember the last email address typed on this device. */
export const REMEMBERED_EMAIL_KEY = 'sms.login.rememberedEmail'

/**
 * Key used to remember the last school code typed on this device. A school
 * computer is always used with the same school, so retyping the code every day
 * would be pointless friction.
 */
export const REMEMBERED_SCHOOL_CODE_KEY = 'sms.login.rememberedSchoolCode'
