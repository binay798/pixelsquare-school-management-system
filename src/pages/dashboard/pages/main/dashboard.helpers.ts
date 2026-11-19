import moment from 'moment'
import {
  Banknote,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Coins,
  FilePlus2,
  FileText,
  GraduationCap,
  Landmark,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  RefreshCw,
  Scale,
  School,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROLE } from '@src/constants/users.constants'
import { formatDate, formatMoney, formatPercent } from '../fees/fees.helpers'

/* ------------------------------------------------------------------ *
 * Access
 * ------------------------------------------------------------------ */

/**
 * Roles allowed to open the operational admin dashboard. The list mirrors
 * `DASHBOARD_ROLES` of `backend/src/dashboard/dashboard.routes.ts`; the API
 * still rejects every other role, this only decides which view is rendered.
 */
export const ADMIN_DASHBOARD_ROLES: string[] = [
  ROLE.superadmin,
  ROLE.admin,
  ROLE.accountant,
  ROLE.finance_manager,
  ROLE.auditor,
]

export const hasAnyRole = (roles: string[] | undefined, allowed: string[]) =>
  Boolean(roles?.some((role) => allowed.includes(role)))

/* ------------------------------------------------------------------ *
 * Date range + greetings
 * ------------------------------------------------------------------ */

export type TDashboardRangeKey = 'month' | 'last30' | 'quarter' | 'year'

export const DASHBOARD_RANGES: {
  key: TDashboardRangeKey
  label: string
}[] = [
  { key: 'month', label: 'This month' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'quarter', label: 'This quarter' },
  { key: 'year', label: 'This year' },
]

/** Range preset -> `YYYY-MM-DD` boundaries (end inclusive). */
export const buildDashboardRange = (
  key: TDashboardRangeKey
): Dashboard.IRange => {
  const to = moment().format('YYYY-MM-DD')

  switch (key) {
    case 'last30':
      return {
        date_from: moment().subtract(29, 'days').format('YYYY-MM-DD'),
        date_to: to,
      }
    case 'quarter':
      return {
        date_from: moment().startOf('quarter').format('YYYY-MM-DD'),
        date_to: to,
      }
    case 'year':
      return {
        date_from: moment().startOf('year').format('YYYY-MM-DD'),
        date_to: to,
      }
    case 'month':
    default:
      return {
        date_from: moment().startOf('month').format('YYYY-MM-DD'),
        date_to: to,
      }
  }
}

export const getGreeting = (date = moment()) => {
  const hour = date.hour()

  if (hour < 12) {
    return 'Good morning'
  }
  if (hour < 17) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

export const formatLongDate = (value = moment()) =>
  moment(value).format('dddd, D MMMM YYYY')

export const formatRangeLabel = (range: Dashboard.IRange) => {
  const from = moment(range.date_from)
  const to = moment(range.date_to)

  if (from.isSame(to, 'day')) {
    return from.format('D MMM YYYY')
  }

  return `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`
}

export const formatMonth = (value: string, format = 'MMM') => {
  const parsed = moment(value, ['YYYY-MM', 'YYYY-MM-DD'])

  return parsed.isValid() ? parsed.format(format) : value
}

export const formatTimeAgo = (value?: string | null) => {
  const parsed = value ? moment(value) : null

  return parsed?.isValid() ? parsed.fromNow() : '—'
}

export const formatDay = (value: string) => {
  const parsed = moment(value)

  return {
    day: parsed.isValid() ? parsed.format('DD') : '--',
    month: parsed.isValid() ? parsed.format('MMM').toUpperCase() : '---',
  }
}

/* ------------------------------------------------------------------ *
 * Numbers + money (display only)
 * ------------------------------------------------------------------ */

const numberFormatter = new Intl.NumberFormat('en-IN')

export const formatNumber = (value?: number | null) =>
  numberFormatter.format(Number(value ?? 0))

/**
 * Money strings can be negative on the dashboard (a bank overdraft, a deficit,
 * a credit balance). The fee formatter only accepts unsigned decimals, so the
 * sign is split off first and never lost.
 */
export const formatSignedMoney = (
  value?: string | number | null,
  options: { compact?: boolean } = {}
) => {
  const amount = Number(value ?? 0)
  const safe = Number.isFinite(amount) ? amount : 0
  const formatted = formatMoney(String(Math.abs(safe)), options)

  return safe < 0 ? `-${formatted}` : formatted
}

/** Decimal string -> `Rs 1.25L` style compact label for KPI cards. */
export const formatCompactMoney = (value?: string | number | null) =>
  formatSignedMoney(value, { compact: true })

/** Exact money label (2 decimals) that keeps a negative sign. */
export const formatFullMoney = (value?: string | number | null) =>
  formatSignedMoney(value)

export { formatDate, formatPercent }

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */

export const CHART_COLORS = {
  blue: '#2463eb',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  violet: '#7c3aed',
  teal: '#0d9488',
  slate: '#64748b',
  sky: '#0ea5e9',
}

/* ------------------------------------------------------------------ *
 * Pending actions
 * ------------------------------------------------------------------ */

export type TPendingActionKey = keyof Dashboard.ISummary['actions']

export interface IPendingActionMeta {
  key: TPendingActionKey
  label: string
  hint: string
  href: string
  priority: 'high' | 'medium' | 'low'
  icon: LucideIcon
  accent: string
  /** `today` renders the current date, `as_of` the dashboard generation time. */
  dateMode: 'today' | 'as_of'
}

export const PENDING_ACTION_META: IPendingActionMeta[] = [
  {
    key: 'classes_without_attendance',
    label: 'Attendance not marked',
    hint: "Classes waiting for today's register",
    href: '/dashboard/attendance/student',
    priority: 'high',
    icon: ClipboardCheck,
    accent: CHART_COLORS.blue,
    dateMode: 'today',
  },
  {
    key: 'overdue_invoices',
    label: 'Overdue fee invoices',
    hint: 'Outstanding invoices past their due date',
    href: '/dashboard/fees/defaulters',
    priority: 'high',
    icon: Receipt,
    accent: CHART_COLORS.red,
    dateMode: 'as_of',
  },
  {
    key: 'payroll_runs_awaiting_approval',
    label: 'Payroll awaiting approval',
    hint: 'Runs verified and waiting for a decision',
    href: '/dashboard/payroll/runs',
    priority: 'high',
    icon: Wallet,
    accent: CHART_COLORS.violet,
    dateMode: 'as_of',
  },
  {
    key: 'unposted_journals',
    label: 'Unposted journal entries',
    hint: 'Draft journals that are not in the ledger yet',
    href: '/dashboard/accounting/journal',
    priority: 'medium',
    icon: Scale,
    accent: CHART_COLORS.teal,
    dateMode: 'as_of',
  },
  {
    key: 'pending_concessions',
    label: 'Fee concessions to approve',
    hint: 'Scholarship assignments waiting for approval',
    href: '/dashboard/fees/scholarships',
    priority: 'medium',
    icon: GraduationCap,
    accent: CHART_COLORS.amber,
    dateMode: 'as_of',
  },
  {
    key: 'pending_refunds',
    label: 'Refunds awaiting approval',
    hint: 'Refund requests submitted by the fee desk',
    href: '/dashboard/fees/refunds',
    priority: 'medium',
    icon: Banknote,
    accent: CHART_COLORS.green,
    dateMode: 'as_of',
  },
  {
    key: 'pending_leave_requests',
    label: 'Leave requests to review',
    hint: 'Staff leave waiting for a decision',
    href: '/dashboard/payroll/attendance',
    priority: 'medium',
    icon: CalendarClock,
    accent: CHART_COLORS.sky,
    dateMode: 'as_of',
  },
  {
    key: 'open_complaints',
    label: 'Open complaints',
    hint: 'Tickets that are not resolved yet',
    href: '/dashboard/complaints',
    priority: 'medium',
    icon: MessageSquareWarning,
    accent: CHART_COLORS.red,
    dateMode: 'as_of',
  },
  {
    key: 'draft_announcements',
    label: 'Draft announcements',
    hint: 'Notices prepared but not published',
    href: '/dashboard/academics/announcements',
    priority: 'low',
    icon: FileText,
    accent: CHART_COLORS.slate,
    dateMode: 'as_of',
  },
]

export const PENDING_PRIORITY_META: Record<
  IPendingActionMeta['priority'],
  { label: string; color: string; bg: string; border: string }
> = {
  high: {
    label: 'High',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  medium: {
    label: 'Medium',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  low: {
    label: 'Low',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
}

/* ------------------------------------------------------------------ *
 * Activity + events
 * ------------------------------------------------------------------ */

export interface IActivityMeta {
  icon: LucideIcon
  accent: string
  href: (id: number) => string
  verb: string
}

export const ACTIVITY_META: Record<Dashboard.ActivityEntity, IActivityMeta> = {
  fee_payment: {
    icon: Banknote,
    accent: CHART_COLORS.green,
    href: () => '/dashboard/fees/payments',
    verb: 'Payment',
  },
  accounting_journal: {
    icon: Scale,
    accent: CHART_COLORS.violet,
    href: (id) => `/dashboard/accounting/journal/${id}`,
    verb: 'Journal',
  },
  student: {
    icon: UserPlus,
    accent: CHART_COLORS.blue,
    href: () => '/dashboard/manage-students/students-list',
    verb: 'Admission',
  },
  announcement: {
    icon: Megaphone,
    accent: CHART_COLORS.amber,
    href: (id) => `/dashboard/academics/announcements/${id}`,
    verb: 'Announcement',
  },
  payroll_run: {
    icon: Wallet,
    accent: CHART_COLORS.teal,
    href: (id) => `/dashboard/payroll/runs/${id}`,
    verb: 'Payroll',
  },
  leave_request: {
    icon: CalendarClock,
    accent: CHART_COLORS.sky,
    href: () => '/dashboard/payroll/attendance',
    verb: 'Leave',
  },
  complaint: {
    icon: MessageSquareWarning,
    accent: CHART_COLORS.red,
    href: (id) => `/dashboard/complaints/${id}`,
    verb: 'Complaint',
  },
}

export interface IEventMeta {
  icon: LucideIcon
  accent: string
  href: string | null
}

export const EVENT_META: Record<Dashboard.EventType, IEventMeta> = {
  fee_deadline: {
    icon: Receipt,
    accent: CHART_COLORS.amber,
    href: '/dashboard/fees/invoices',
  },
  holiday: {
    icon: CalendarDays,
    accent: CHART_COLORS.green,
    href: null,
  },
  announcement: {
    icon: Megaphone,
    accent: CHART_COLORS.blue,
    href: '/dashboard/academics/announcements',
  },
  payroll: {
    icon: Wallet,
    accent: CHART_COLORS.violet,
    href: '/dashboard/payroll/runs',
  },
}

/* ------------------------------------------------------------------ *
 * Quick actions
 * ------------------------------------------------------------------ */

export interface IQuickAction {
  key: string
  label: string
  href: string
  icon: LucideIcon
  accent: string
  /** Optional permission resolved by the fee / accounting hooks. */
  permission?: 'fee.collect' | 'accounting.journal'
  roles?: string[]
}

const ACADEMIC_WRITERS = [ROLE.superadmin, ROLE.admin, ROLE.principal]
const HR_WRITERS = [
  ROLE.superadmin,
  ROLE.admin,
  ROLE.principal,
  ROLE.hr_manager,
]

export const QUICK_ACTIONS: IQuickAction[] = [
  {
    key: 'add-student',
    label: 'Add student',
    href: '/dashboard/manage-students/admit-students',
    icon: UserPlus,
    accent: CHART_COLORS.blue,
    roles: ACADEMIC_WRITERS,
  },
  {
    key: 'register-admission',
    label: 'Register admission',
    href: '/dashboard/manage-students/admit-students',
    icon: FilePlus2,
    accent: CHART_COLORS.green,
    roles: ACADEMIC_WRITERS,
  },
  {
    key: 'add-teacher',
    label: 'Add teacher',
    href: '/dashboard/teachers/create',
    icon: GraduationCap,
    accent: CHART_COLORS.violet,
    roles: ACADEMIC_WRITERS,
  },
  {
    key: 'add-employee',
    label: 'Add employee',
    href: '/dashboard/human-resources/manage-employee/create',
    icon: Users,
    accent: CHART_COLORS.teal,
    roles: HR_WRITERS,
  },
  {
    key: 'mark-attendance',
    label: 'Mark attendance',
    href: '/dashboard/attendance/student',
    icon: ClipboardCheck,
    accent: CHART_COLORS.sky,
    roles: ACADEMIC_WRITERS,
  },
  {
    key: 'announcement',
    label: 'Create announcement',
    href: '/dashboard/academics/announcements/create',
    icon: Megaphone,
    accent: CHART_COLORS.amber,
    roles: [ROLE.superadmin, ROLE.admin, ROLE.staff],
  },
  {
    key: 'collect-payment',
    label: 'Record fee payment',
    href: '/dashboard/fees/payments/collect',
    icon: Banknote,
    accent: CHART_COLORS.green,
    permission: 'fee.collect',
  },
  {
    key: 'journal-entry',
    label: 'Create journal entry',
    href: '/dashboard/accounting/journal/new',
    icon: Scale,
    accent: CHART_COLORS.violet,
    permission: 'accounting.journal',
  },
]

/* Icons reused by the KPI grid and the financial position panel. */
export const DASHBOARD_ICONS = {
  students: GraduationCap,
  attendance: ClipboardCheck,
  teachers: Users,
  employees: Building2,
  collected: Banknote,
  outstanding: Receipt,
  cash: Coins,
  bank: Landmark,
  receivable: Receipt,
  payable: FileText,
  payroll: Wallet,
  refresh: RefreshCw,
  school: School,
  performance: BookOpenCheck,
}
