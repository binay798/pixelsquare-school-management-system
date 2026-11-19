import {
  downloadCsv,
  formatDate,
  formatDateTime,
  formatMoney,
  fromMinor,
  printElement,
  sumMoney,
  toMinor,
  todayIso,
} from '../fees/fees.helpers'
import type { IOption, IStatusMeta } from '../fees/fees.helpers'

/**
 * Payroll helpers: formatting, workflow metadata and the RBAC matrix.
 *
 * Money / date utilities are shared with the fees and accounting modules so the
 * integer minor unit arithmetic stays identical across the application.
 */
export {
  downloadCsv,
  formatDate,
  formatDateTime,
  formatMoney,
  fromMinor,
  printElement,
  sumMoney,
  toMinor,
  todayIso,
}
export type { IOption, IStatusMeta }

export const PAYROLL_BASE_PATH = '/dashboard/payroll'

const tone = (text: string, bg: string, border: string, dot: string) => ({
  text,
  bg,
  border,
  dot,
})

const BLUE = tone('#1d4ed8', '#eff6ff', '#bfdbfe', '#2563eb')
const GREEN = tone('#15803d', '#f0fdf4', '#bbf7d0', '#22c55e')
const AMBER = tone('#b45309', '#fffbeb', '#fde68a', '#f59e0b')
const RED = tone('#b91c1c', '#fef2f2', '#fecaca', '#ef4444')
const PURPLE = tone('#6d28d9', '#f5f3ff', '#ddd6fe', '#8b5cf6')
const GREY = tone('#334155', '#f8fafc', '#e2e8f0', '#94a3b8')

const optionList = <T extends string>(entries: Record<T, string>) =>
  (Object.keys(entries) as T[]).map((value) => ({
    value,
    label: entries[value],
  }))

export const RUN_STATUS_META: Record<Payroll.RunStatus, IStatusMeta> = {
  DRAFT: { ...GREY, label: 'Draft' },
  CALCULATED: { ...BLUE, label: 'Calculated' },
  UNDER_REVIEW: { ...AMBER, label: 'Under review' },
  VERIFIED: { ...BLUE, label: 'Verified' },
  APPROVED: { ...GREEN, label: 'Approved' },
  POSTED: { ...PURPLE, label: 'Posted' },
  PAYMENT_AUTHORIZED: { ...PURPLE, label: 'Payment authorized' },
  PAID: { ...GREEN, label: 'Paid' },
  CLOSED: { ...GREY, label: 'Closed' },
  REJECTED: { ...RED, label: 'Rejected' },
  CANCELLED: { ...RED, label: 'Cancelled' },
  REVERSED: { ...RED, label: 'Reversed' },
}

export const PERIOD_STATUS_META: Record<Payroll.PeriodStatus, IStatusMeta> = {
  OPEN: { ...GREEN, label: 'Open' },
  LOCKED: { ...AMBER, label: 'Locked' },
  CLOSED: { ...GREY, label: 'Closed' },
}

export const PAYMENT_STATUS_META: Record<Payroll.PaymentStatus, IStatusMeta> = {
  DRAFT: { ...GREY, label: 'Draft' },
  COMPLETED: { ...GREEN, label: 'Completed' },
  PARTIALLY_PAID: { ...AMBER, label: 'Partially paid' },
  FAILED: { ...RED, label: 'Failed' },
  REVERSED: { ...RED, label: 'Reversed' },
}

export const RUN_EMPLOYEE_STATUS_META: Record<
  Payroll.RunEmployeeStatus,
  IStatusMeta
> = {
  PENDING: { ...GREY, label: 'Pending' },
  APPROVED: { ...BLUE, label: 'Approved' },
  PARTIALLY_PAID: { ...AMBER, label: 'Partially paid' },
  PAID: { ...GREEN, label: 'Paid' },
  FAILED: { ...RED, label: 'Failed' },
  EXCLUDED: { ...GREY, label: 'Excluded' },
  REVERSED: { ...RED, label: 'Reversed' },
}

export const SEVERITY_META: Record<Payroll.ExceptionSeverity, IStatusMeta> = {
  INFO: { ...BLUE, label: 'Info' },
  WARNING: { ...AMBER, label: 'Warning' },
  BLOCKER: { ...RED, label: 'Blocker' },
}

export const ADJUSTMENT_STATUS_META: Record<
  Payroll.AdjustmentStatus,
  IStatusMeta
> = {
  DRAFT: { ...GREY, label: 'Draft' },
  PENDING: { ...AMBER, label: 'Pending approval' },
  APPROVED: { ...GREEN, label: 'Approved' },
  REJECTED: { ...RED, label: 'Rejected' },
  APPLIED: { ...PURPLE, label: 'Applied' },
}

export const LOAN_STATUS_META: Record<Payroll.LoanStatus, IStatusMeta> = {
  REQUESTED: { ...AMBER, label: 'Requested' },
  APPROVED: { ...BLUE, label: 'Approved' },
  ACTIVE: { ...GREEN, label: 'Active' },
  REJECTED: { ...RED, label: 'Rejected' },
  CLOSED: { ...GREY, label: 'Closed' },
  WRITTEN_OFF: { ...RED, label: 'Written off' },
}

export const ADVANCE_STATUS_META: Record<Payroll.AdvanceStatus, IStatusMeta> = {
  REQUESTED: { ...AMBER, label: 'Requested' },
  APPROVED: { ...BLUE, label: 'Approved' },
  REJECTED: { ...RED, label: 'Rejected' },
  SETTLED: { ...GREY, label: 'Settled' },
}

export const REIMBURSEMENT_STATUS_META: Record<
  Payroll.ReimbursementStatus,
  IStatusMeta
> = {
  SUBMITTED: { ...GREY, label: 'Submitted' },
  DEPARTMENT_VERIFIED: { ...BLUE, label: 'Dept. verified' },
  ACCOUNTANT_REVIEWED: { ...BLUE, label: 'Reviewed' },
  APPROVED: { ...GREEN, label: 'Approved' },
  REJECTED: { ...RED, label: 'Rejected' },
  PAID: { ...PURPLE, label: 'Paid' },
}

export const REMITTANCE_STATUS_META: Record<
  Payroll.RemittanceStatus,
  IStatusMeta
> = {
  PENDING: { ...AMBER, label: 'Pending' },
  PAID: { ...GREEN, label: 'Paid' },
}

export const REMITTANCE_CODE_OPTIONS: IOption<Payroll.RemittanceCode>[] = [
  { value: 'TDS', label: 'TDS (income tax)' },
  { value: 'PF', label: 'PF' },
  { value: 'SSF', label: 'SSF' },
  { value: 'CIT', label: 'CIT' },
  { value: 'INSURANCE', label: 'Insurance' },
]

export const REMITTANCE_STATUS_OPTIONS: IOption<Payroll.RemittanceStatus>[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
]

export const ADJUSTMENT_TYPE_OPTIONS: IOption<Payroll.AdjustmentType>[] = [
  { value: 'BONUS', label: 'Bonus' },
  { value: 'INCENTIVE', label: 'Incentive' },
  { value: 'ARREAR', label: 'Arrears' },
  { value: 'MANUAL_EARNING', label: 'Manual earning' },
  { value: 'MANUAL_DEDUCTION', label: 'Manual deduction' },
  { value: 'LEAVE_ENCASHMENT', label: 'Leave encashment' },
  { value: 'REIMBURSEMENT', label: 'Reimbursement' },
  { value: 'OTHER', label: 'Other' },
]

export const INTEREST_METHOD_OPTIONS: IOption<Payroll.InterestMethod>[] = [
  { value: 'NONE', label: 'Interest free' },
  { value: 'FLAT', label: 'Flat interest' },
  { value: 'REDUCING', label: 'Reducing balance' },
]

/* ------------------------------------------------------------------ *
 * Configuration metadata
 * ------------------------------------------------------------------ */

export const COMPONENT_TYPE_META: Record<
  Payroll.SalaryComponentType,
  IStatusMeta
> = {
  EARNING: { ...GREEN, label: 'Earning' },
  DEDUCTION: { ...RED, label: 'Deduction' },
  EMPLOYER_CONTRIBUTION: { ...PURPLE, label: 'Employer contribution' },
}

export const COMPONENT_TYPE_OPTIONS: IOption<Payroll.SalaryComponentType>[] =
  optionList<Payroll.SalaryComponentType>({
    EARNING: 'Earning',
    DEDUCTION: 'Deduction',
    EMPLOYER_CONTRIBUTION: 'Employer contribution',
  })

export const CALCULATION_TYPE_OPTIONS: IOption<Payroll.CalculationType>[] =
  optionList<Payroll.CalculationType>({
    FIXED: 'Fixed amount',
    PERCENT_OF_BASIC: 'Percent of basic',
    PERCENT_OF_GROSS: 'Percent of gross',
    FORMULA: 'Formula',
    ATTENDANCE_DERIVED: 'Attendance derived',
    STATUTORY: 'Statutory rule',
  })

export const EMPLOYMENT_TYPE_OPTIONS: IOption<Payroll.EmploymentType>[] =
  optionList<Payroll.EmploymentType>({
    PERMANENT: 'Permanent',
    CONTRACT: 'Contract',
    PART_TIME: 'Part time',
    VISITING: 'Visiting',
    TEMPORARY: 'Temporary',
    SUBSTITUTE: 'Substitute',
    DAILY_WAGE: 'Daily wage',
    HOURLY: 'Hourly',
  })

export const FREQUENCY_OPTIONS: IOption<Payroll.Frequency>[] =
  optionList<Payroll.Frequency>({
    MONTHLY: 'Monthly',
    WEEKLY: 'Weekly',
    BIWEEKLY: 'Biweekly',
    CUSTOM: 'Custom',
  })

export const PAYABLE_BASIS_OPTIONS: IOption<Payroll.PayableDayBasis>[] =
  optionList<Payroll.PayableDayBasis>({
    ACTUAL_WORKDAYS: 'Actual workdays',
    FIXED_DAYS: 'Fixed days per month',
    CALENDAR_DAYS: 'Calendar days',
  })

export const ROUNDING_MODE_OPTIONS: IOption<Payroll.RoundingMode>[] =
  optionList<Payroll.RoundingMode>({
    HALF_UP: 'Half up',
    DOWN: 'Down',
    UP: 'Up',
  })

export const OVERTIME_BASIS_OPTIONS: IOption<Payroll.OvertimeBasis>[] =
  optionList<Payroll.OvertimeBasis>({
    BASIC: 'Basic salary',
    BASIC_PLUS_ALLOWANCES: 'Basic + allowances',
  })

export const LATE_DEDUCTION_MODE_OPTIONS: IOption<Payroll.LateDeductionMode>[] =
  optionList<Payroll.LateDeductionMode>({
    NONE: 'No deduction',
    PER_OCCURRENCE: 'Per occurrence',
    PER_HOUR: 'Per hour',
  })

export const MAPPING_KEY_LABEL: Record<Payroll.MappingKey, string> = {
  SALARY_PAYABLE: 'Salary payable',
  TAX_PAYABLE: 'Tax payable (TDS)',
  PF_PAYABLE: 'PF payable',
  SSF_PAYABLE: 'SSF payable',
  INSURANCE_PAYABLE: 'Insurance payable',
  OTHER_DEDUCTIONS_PAYABLE: 'Other deductions payable',
  LOAN_RECEIVABLE: 'Employee loans receivable',
  ADVANCE_RECEIVABLE: 'Salary advances receivable',
  EMPLOYER_CONTRIBUTION_EXPENSE: 'Employer contribution expense',
  REIMBURSEMENT_EXPENSE: 'Staff reimbursement expense',
  ROUNDING: 'Rounding gain / loss',
}

export const MAPPING_KEYS = Object.keys(
  MAPPING_KEY_LABEL
) as Payroll.MappingKey[]

export const PROFILE_STATUS_META: Record<
  Payroll.PayrollProfileStatus,
  IStatusMeta
> = {
  ACTIVE: { ...GREEN, label: 'Active' },
  SUSPENDED: { ...AMBER, label: 'Suspended' },
  TERMINATED: { ...RED, label: 'Terminated' },
}

export const PROFILE_STATUS_OPTIONS: IOption<Payroll.PayrollProfileStatus>[] =
  optionList<Payroll.PayrollProfileStatus>({
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    TERMINATED: 'Terminated',
  })

export const REVISION_STATUS_META: Record<Payroll.RevisionStatus, IStatusMeta> =
  {
    PENDING: { ...AMBER, label: 'Pending' },
    APPROVED: { ...GREEN, label: 'Approved' },
    REJECTED: { ...RED, label: 'Rejected' },
    APPLIED: { ...PURPLE, label: 'Applied' },
  }

export const REVISION_STATUS_OPTIONS: IOption<Payroll.RevisionStatus>[] =
  optionList<Payroll.RevisionStatus>({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    APPLIED: 'Applied',
  })

export const ELIGIBLE_OPTIONS: IOption<string>[] = [
  { value: 'true', label: 'Eligible only' },
  { value: 'false', label: 'Not eligible only' },
]

export const INCREMENT_TYPE_OPTIONS: IOption<Payroll.IncrementType>[] = [
  { value: 'AMOUNT', label: 'Amount' },
  { value: 'PERCENT', label: 'Percent' },
]

export const RUN_STATUS_OPTIONS: IOption<Payroll.RunStatus>[] =
  optionList<Payroll.RunStatus>({
    DRAFT: 'Draft',
    CALCULATED: 'Calculated',
    UNDER_REVIEW: 'Under review',
    VERIFIED: 'Verified',
    APPROVED: 'Approved',
    POSTED: 'Posted',
    PAYMENT_AUTHORIZED: 'Payment authorized',
    PAID: 'Paid',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    REVERSED: 'Reversed',
  })

export const PERIOD_STATUS_OPTIONS: IOption<Payroll.PeriodStatus>[] =
  optionList<Payroll.PeriodStatus>({
    OPEN: 'Open',
    LOCKED: 'Locked',
    CLOSED: 'Closed',
  })

export const PAYMENT_METHOD_META: Record<Payroll.PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank transfer',
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
}

export const PAYMENT_METHOD_OPTIONS: IOption<Payroll.PaymentMethod>[] =
  optionList<Payroll.PaymentMethod>(PAYMENT_METHOD_META)

export const RUN_TYPE_OPTIONS: IOption<Payroll.RunType>[] =
  optionList<Payroll.RunType>({
    REGULAR: 'Regular',
    OFF_CYCLE: 'Off cycle',
    BONUS: 'Bonus',
    ARREARS: 'Arrears',
    FINAL_SETTLEMENT: 'Final settlement',
  })

/** The five stages of the Process Payroll wizard. */
export const PROCESS_STEPS = [
  { key: 'period', label: 'Period' },
  { key: 'run', label: 'Run' },
  { key: 'calculate', label: 'Calculate' },
  { key: 'approve', label: 'Approve' },
  { key: 'pay', label: 'Post & pay' },
] as const

export type ProcessStepKey = (typeof PROCESS_STEPS)[number]['key']

/** Which wizard step a run status maps to (used to resume a run). */
export const runStepOf = (status?: Payroll.RunStatus): ProcessStepKey => {
  switch (status) {
    case undefined:
    case 'DRAFT':
      return 'run'
    case 'CALCULATED':
    case 'UNDER_REVIEW':
    case 'VERIFIED':
      return 'approve'
    case 'APPROVED':
    case 'POSTED':
    case 'PAYMENT_AUTHORIZED':
      return 'pay'
    default:
      return 'pay'
  }
}

export type RunAction =
  | 'calculate'
  | 'submit'
  | 'verify'
  | 'approve'
  | 'reject'
  | 'post'
  | 'authorize'
  | 'close'
  | 'cancel'

/**
 * Workflow edges, mirroring `payroll.workflow.ts` of the backend.
 *
 * Kept strictly in sync with `PAYROLL_RUN_TRANSITIONS`: a verified/approved/posted
 * run can no longer be cancelled (it has to be reversed), and `close` only
 * applies to a run that was actually paid.
 */
export const RUN_ACTIONS_BY_STATUS: Record<Payroll.RunStatus, RunAction[]> = {
  DRAFT: ['calculate', 'cancel'],
  CALCULATED: ['calculate', 'submit', 'cancel'],
  UNDER_REVIEW: ['verify', 'reject', 'cancel'],
  VERIFIED: ['approve', 'reject'],
  APPROVED: ['post', 'authorize'],
  POSTED: ['authorize'],
  PAYMENT_AUTHORIZED: [],
  PAID: ['close'],
  CLOSED: [],
  REJECTED: ['calculate', 'cancel'],
  CANCELLED: [],
  REVERSED: [],
}

export const canRunAction = (status: Payroll.RunStatus, action: RunAction) =>
  RUN_ACTIONS_BY_STATUS[status]?.includes(action) ?? false

/**
 * Statuses in which a run can still be hard deleted (mirror of
 * `PAYROLL_DELETABLE_STATUSES` on the backend). A run that reached the approval
 * chain is financial evidence: it can only be cancelled or reversed.
 */
export const RUN_DELETABLE_STATUSES: Payroll.RunStatus[] = [
  'DRAFT',
  'CALCULATED',
  'REJECTED',
  'CANCELLED',
]

export const canDeleteRun = (status: Payroll.RunStatus) =>
  RUN_DELETABLE_STATUSES.includes(status)

/**
 * Statuses in which a run can be (re)calculated (mirror of
 * `PAYROLL_EDITABLE_STATUSES` on the backend). Recalculating is how a run is set
 * free from the exceptions raised by an earlier calculation: the draft employees
 * and the open exceptions are rebuilt from scratch.
 */
export const RUN_RECALCULABLE_STATUSES: Payroll.RunStatus[] = [
  'DRAFT',
  'CALCULATED',
  'REJECTED',
]

export const canRecalculateRun = (status: Payroll.RunStatus) =>
  RUN_RECALCULABLE_STATUSES.includes(status)

/* ------------------------------------------------------------------ *
 * RBAC — mirror of `PAYROLL_PERMISSIONS_BY_ROLE` (backend constants)
 * ------------------------------------------------------------------ */

export type PayrollPermission =
  | 'payroll.dashboard.view'
  | 'payroll.profiles.view'
  | 'payroll.profiles.manage'
  | 'payroll.bank_details.view'
  | 'payroll.structures.manage'
  | 'payroll.revisions.request'
  | 'payroll.revisions.approve'
  | 'payroll.periods.manage'
  | 'payroll.runs.view'
  | 'payroll.runs.prepare'
  | 'payroll.runs.calculate'
  | 'payroll.runs.submit'
  | 'payroll.runs.verify'
  | 'payroll.runs.approve'
  | 'payroll.runs.authorize_payment'
  | 'payroll.runs.post'
  | 'payroll.runs.finalize'
  | 'payroll.payslips.view'
  | 'payroll.payslips.generate'
  | 'payroll.payslips.publish'
  | 'payroll.payments.view'
  | 'payroll.payments.create'
  | 'payroll.payments.reverse'
  | 'payroll.remittances.manage'
  | 'payroll.loans.manage'
  | 'payroll.loans.approve'
  | 'payroll.advances.manage'
  | 'payroll.advances.approve'
  | 'payroll.reimbursements.manage'
  | 'payroll.reimbursements.approve'
  | 'payroll.adjustments.manage'
  | 'payroll.adjustments.approve'
  | 'payroll.settlement.manage'
  | 'payroll.settlement.approve'
  | 'payroll.reports.view'
  | 'payroll.accounting_sync.view'
  | 'payroll.accounting_sync.retry'
  | 'payroll.settings.manage'
  | 'payroll.audit.view'
  | 'payroll.self_service'

const READ_ROLES = [
  'superadmin',
  'admin',
  'hr_manager',
  'accountant',
  'principal',
  'finance_manager',
  'auditor',
]

export const PAYROLL_READ_ONLY_PERMISSIONS: PayrollPermission[] = [
  'payroll.dashboard.view',
  'payroll.profiles.view',
  'payroll.structures.manage',
  'payroll.runs.view',
  'payroll.payslips.view',
  'payroll.payments.view',
  'payroll.reports.view',
  'payroll.accounting_sync.view',
  'payroll.audit.view',
]

const HR = ['superadmin', 'admin', 'hr_manager']
const PREPARE = ['superadmin', 'admin', 'accountant']
const APPROVAL = ['superadmin', 'admin', 'principal', 'finance_manager']
const FINANCE = ['superadmin', 'admin', 'finance_manager']
const PAYMENT_CREW = ['superadmin', 'admin', 'accountant', 'finance_manager']

/**
 * Role → permission matrix mirroring `PAYROLL_PERMISSIONS_BY_ROLE` of
 * `backend/src/config/payroll.constants.ts`. The backend re-validates every
 * request: this map only hides what the API would reject.
 */
export const PAYROLL_PERMISSION_ROLES: Record<PayrollPermission, string[]> = {
  'payroll.dashboard.view': READ_ROLES,
  'payroll.profiles.view': READ_ROLES,
  'payroll.profiles.manage': HR,
  'payroll.bank_details.view': [
    'superadmin',
    'admin',
    'hr_manager',
    'accountant',
    'finance_manager',
  ],
  'payroll.structures.manage': HR,
  'payroll.revisions.request': HR,
  'payroll.revisions.approve': [
    'superadmin',
    'admin',
    'hr_manager',
    'principal',
  ],
  'payroll.periods.manage': [...HR, 'accountant'],
  'payroll.runs.view': READ_ROLES,
  'payroll.runs.prepare': PREPARE,
  'payroll.runs.calculate': PREPARE,
  'payroll.runs.submit': PREPARE,
  'payroll.runs.verify': ['superadmin', 'admin', 'hr_manager', 'principal'],
  'payroll.runs.approve': APPROVAL,
  'payroll.runs.authorize_payment': FINANCE,
  'payroll.runs.post': [...PREPARE, 'finance_manager'],
  'payroll.runs.finalize': FINANCE,
  'payroll.payslips.view': READ_ROLES,
  'payroll.payslips.generate': [...HR, 'accountant'],
  'payroll.payslips.publish': [...HR, 'finance_manager'],
  'payroll.payments.view': [
    'superadmin',
    'admin',
    'accountant',
    'finance_manager',
    'auditor',
  ],
  'payroll.payments.create': PAYMENT_CREW,
  'payroll.payments.reverse': FINANCE,
  'payroll.remittances.manage': PAYMENT_CREW,
  'payroll.loans.manage': [...HR, 'accountant'],
  'payroll.loans.approve': FINANCE,
  'payroll.advances.manage': [...HR, 'accountant'],
  'payroll.advances.approve': FINANCE,
  'payroll.reimbursements.manage': [...HR, 'accountant'],
  'payroll.reimbursements.approve': FINANCE,
  'payroll.adjustments.manage': [...HR, 'accountant'],
  'payroll.adjustments.approve': FINANCE,
  'payroll.settlement.manage': HR,
  'payroll.settlement.approve': FINANCE,
  'payroll.reports.view': READ_ROLES,
  'payroll.accounting_sync.view': READ_ROLES,
  'payroll.accounting_sync.retry': PAYMENT_CREW,
  'payroll.settings.manage': FINANCE,
  'payroll.audit.view': [
    'superadmin',
    'admin',
    'principal',
    'finance_manager',
    'auditor',
  ],
  'payroll.self_service': [
    'superadmin',
    'admin',
    'teacher',
    'staff',
    'accountant',
    'librarian',
    'hr_manager',
    'principal',
    'finance_manager',
  ],
}

export const isPayrollPermission = (
  permission: string
): permission is PayrollPermission =>
  Object.prototype.hasOwnProperty.call(PAYROLL_PERMISSION_ROLES, permission)

export const hasPayrollPermission = (
  roles: string[] | undefined,
  permission: PayrollPermission
) => {
  if (!roles?.length) {
    return false
  }

  const allowed = PAYROLL_PERMISSION_ROLES[permission]

  return roles.some((role) => allowed.includes(String(role).toLowerCase()))
}

export const canViewPayrollModule = (roles: string[] | undefined) =>
  hasPayrollPermission(roles, 'payroll.dashboard.view')
