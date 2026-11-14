import {
  downloadCsv,
  formatDate,
  formatDateTime,
  formatMinorMoney,
  formatMoney,
  fromMinor,
  printElement,
  sumMoney,
  toMinor,
  todayIso,
} from '../fees/fees.helpers'
import type { IOption, IStatusMeta } from '../fees/fees.helpers'

/**
 * Accounting helpers: formatting, enum metadata and the RBAC matrix.
 *
 * The money / date utilities are shared with the fees module — both modules deal
 * with the same `numeric(18,2)` decimal-string amounts, so the integer minor
 * unit arithmetic (`toMinor` / `fromMinor`) must stay identical.
 */
export {
  downloadCsv,
  formatDate,
  formatDateTime,
  formatMinorMoney,
  formatMoney,
  fromMinor,
  printElement,
  sumMoney,
  toMinor,
  todayIso,
}
export type { IOption, IStatusMeta }

export const ACCOUNTING_BASE_PATH = '/dashboard/accounting'

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

export const ACCOUNT_TYPE_META: Record<Accounting.AccountType, IStatusMeta> = {
  ASSET: { ...BLUE, label: 'Asset' },
  LIABILITY: { ...AMBER, label: 'Liability' },
  EQUITY: { ...PURPLE, label: 'Equity' },
  REVENUE: { ...GREEN, label: 'Revenue' },
  EXPENSE: { ...RED, label: 'Expense' },
}

export const TRANSACTION_STATUS_META: Record<
  Accounting.TransactionStatus,
  IStatusMeta
> = {
  DRAFT: { ...GREY, label: 'Draft' },
  POSTED: { ...GREEN, label: 'Posted' },
  REVERSED: { ...RED, label: 'Reversed' },
}

export const TRANSACTION_TYPE_META: Record<
  Accounting.TransactionType,
  IStatusMeta
> = {
  MANUAL: { ...BLUE, label: 'Manual' },
  AUTOMATIC: { ...PURPLE, label: 'Automatic' },
  OPENING_BALANCE: { ...GREY, label: 'Opening balance' },
  ADJUSTMENT: { ...AMBER, label: 'Adjustment' },
  REVERSAL: { ...RED, label: 'Reversal' },
  CLOSING: { ...GREEN, label: 'Closing' },
}

export const PERIOD_STATUS_META: Record<Accounting.PeriodStatus, IStatusMeta> =
  {
    OPEN: { ...GREEN, label: 'Open' },
    CLOSED: { ...GREY, label: 'Closed' },
  }

const optionList = <T extends string>(entries: Record<T, string>) =>
  (Object.keys(entries) as T[]).map((value) => ({
    value,
    label: entries[value],
  }))

export const ACCOUNT_TYPE_OPTIONS: IOption<Accounting.AccountType>[] =
  optionList<Accounting.AccountType>({
    ASSET: 'Asset',
    LIABILITY: 'Liability',
    EQUITY: 'Equity',
    REVENUE: 'Revenue',
    EXPENSE: 'Expense',
  })

export const NORMAL_BALANCE_OPTIONS: IOption<Accounting.NormalBalance>[] =
  optionList<Accounting.NormalBalance>({ DEBIT: 'Debit', CREDIT: 'Credit' })

/** Human labels of the subtypes, grouped by their natural account type. */
export const ACCOUNT_SUBTYPE_LABEL: Record<Accounting.AccountSubtype, string> =
  {
    CURRENT_ASSET: 'Current asset',
    CASH: 'Cash',
    BANK: 'Bank',
    RECEIVABLE: 'Receivable',
    PREPAID: 'Prepaid expense',
    FIXED_ASSET: 'Fixed asset',
    ACCUMULATED_DEPRECIATION: 'Accumulated depreciation',
    CURRENT_LIABILITY: 'Current liability',
    PAYABLE: 'Payable',
    TAX_PAYABLE: 'Tax payable',
    STUDENT_ADVANCE: 'Student advance',
    DEFERRED_REVENUE: 'Deferred revenue',
    EQUITY: 'Equity',
    RETAINED_EARNINGS: 'Retained earnings',
    OPERATING_REVENUE: 'Operating revenue',
    OTHER_INCOME: 'Other income',
    OPERATING_EXPENSE: 'Operating expense',
    COST_OF_SERVICES: 'Cost of services',
    DEPRECIATION: 'Depreciation',
    OTHER_EXPENSE: 'Other expense',
  }

/** Subtypes accepted per account type (drives the create form). */
export const ACCOUNT_SUBTYPE_BY_TYPE: Record<
  Accounting.AccountType,
  Accounting.AccountSubtype[]
> = {
  ASSET: [
    'CURRENT_ASSET',
    'CASH',
    'BANK',
    'RECEIVABLE',
    'PREPAID',
    'FIXED_ASSET',
    'ACCUMULATED_DEPRECIATION',
  ],
  LIABILITY: [
    'CURRENT_LIABILITY',
    'PAYABLE',
    'TAX_PAYABLE',
    'STUDENT_ADVANCE',
    'DEFERRED_REVENUE',
  ],
  EQUITY: ['EQUITY', 'RETAINED_EARNINGS'],
  REVENUE: ['OPERATING_REVENUE', 'OTHER_INCOME'],
  EXPENSE: [
    'OPERATING_EXPENSE',
    'COST_OF_SERVICES',
    'DEPRECIATION',
    'OTHER_EXPENSE',
  ],
}

export const TRANSACTION_STATUS_OPTIONS: IOption<Accounting.TransactionStatus>[] =
  optionList<Accounting.TransactionStatus>({
    DRAFT: 'Draft',
    POSTED: 'Posted',
    REVERSED: 'Reversed',
  })

export const TRANSACTION_TYPE_OPTIONS: IOption<Accounting.TransactionType>[] =
  optionList<Accounting.TransactionType>({
    MANUAL: 'Manual',
    AUTOMATIC: 'Automatic',
    OPENING_BALANCE: 'Opening balance',
    ADJUSTMENT: 'Adjustment',
    REVERSAL: 'Reversal',
    CLOSING: 'Closing',
  })

export const SOURCE_MODULE_LABEL: Record<Accounting.SourceModule, string> = {
  FEE_INVOICE: 'Fee invoice',
  FEE_COLLECTION: 'Fee collection',
  FEE_REFUND: 'Fee refund',
  PAYROLL: 'Payroll',
  EXPENSE: 'Expense',
  PURCHASE: 'Purchase',
  SUPPLIER_PAYMENT: 'Supplier payment',
  ASSET_PURCHASE: 'Asset purchase',
  DEPRECIATION: 'Depreciation',
  ACCRUAL_ADJUSTMENT: 'Accrual adjustment',
  MANUAL_JOURNAL: 'Manual journal',
  OPENING_BALANCE: 'Opening balance',
  BANK_ADJUSTMENT: 'Bank adjustment',
  CLOSING_ENTRY: 'Closing entry',
  RECONCILIATION: 'Reconciliation',
}

export const SOURCE_MODULE_OPTIONS: IOption<Accounting.SourceModule>[] =
  optionList<Accounting.SourceModule>(SOURCE_MODULE_LABEL)

export const PERIOD_STATUS_OPTIONS: IOption<Accounting.PeriodStatus>[] =
  optionList<Accounting.PeriodStatus>({ OPEN: 'Open', CLOSED: 'Closed' })

export const ACCOUNT_ACTIVE_OPTIONS: IOption<string>[] = [
  { value: 'true', label: 'Active only' },
  { value: 'false', label: 'Inactive only' },
]

/** Sort preference of the chart of accounts (assets first). */
export const ACCOUNT_TYPE_ORDER: Accounting.AccountType[] = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
]

/* ------------------------------------------------------------------ *
 * RBAC
 * ------------------------------------------------------------------ */

export type AccountingPermission =
  | 'accounting.view'
  | 'accounting.accounts.manage'
  | 'accounting.journal.create'
  | 'accounting.journal.approve'
  | 'accounting.journal.post'
  | 'accounting.journal.reverse'
  | 'accounting.periods.manage'
  | 'accounting.periods.close'
  | 'accounting.reports.view'

const READ_ROLES = [
  'superadmin',
  'admin',
  'accountant',
  'finance_manager',
  'auditor',
]

const WRITE_ROLES = ['superadmin', 'admin', 'accountant', 'finance_manager']
const APPROVAL_ROLES = ['superadmin', 'admin', 'finance_manager']
const PERIOD_CONTROL_ROLES = ['superadmin', 'admin', 'finance_manager']

/**
 * Role → permission matrix.
 *
 * It mirrors the guard chain of `accounting.routes.ts`:
 *  - read endpoints: any accounting role (`accounting.roles.ts`)
 *  - write endpoints: `assertAccountingWrite` (accountant and above)
 *  - approve / post / reverse / periods: `assertAccountingApproval` +
 *    the period-control guard, hence the narrower approval list.
 */
export const ACCOUNTING_PERMISSION_ROLES: Record<
  AccountingPermission,
  string[]
> = {
  'accounting.view': READ_ROLES,
  'accounting.reports.view': READ_ROLES,
  'accounting.accounts.manage': WRITE_ROLES,
  'accounting.journal.create': WRITE_ROLES,
  'accounting.journal.post': WRITE_ROLES,
  'accounting.journal.approve': APPROVAL_ROLES,
  'accounting.journal.reverse': APPROVAL_ROLES,
  'accounting.periods.manage': WRITE_ROLES,
  'accounting.periods.close': PERIOD_CONTROL_ROLES,
}

export const isAccountingPermission = (
  permission: string
): permission is AccountingPermission =>
  Object.prototype.hasOwnProperty.call(ACCOUNTING_PERMISSION_ROLES, permission)

export const hasAccountingPermission = (
  roles: string[] | undefined,
  permission: AccountingPermission
) => {
  if (!roles?.length) {
    return false
  }

  const allowed = ACCOUNTING_PERMISSION_ROLES[permission]

  return roles.some((role) => allowed.includes(String(role).toLowerCase()))
}

export const canViewAccountingModule = (roles: string[] | undefined) =>
  hasAccountingPermission(roles, 'accounting.view')

/* ------------------------------------------------------------------ *
 * Money helpers (integer minor units, never floats)
 * ------------------------------------------------------------------ */

/** Net movement of an account expressed in its own normal direction. */
export const accountBalance = (row: {
  normal_balance: Accounting.NormalBalance
  total_debit?: string
  total_credit?: string
}) => {
  const debit = toMinor(row.total_debit)
  const credit = toMinor(row.total_credit)

  return fromMinor(
    row.normal_balance === 'DEBIT' ? debit - credit : credit - debit
  )
}

export const accountMovement = (row: {
  total_debit?: string
  total_credit?: string
}) => {
  const debit = toMinor(row.total_debit)
  const credit = toMinor(row.total_credit)

  return { debit: fromMinor(debit), credit: fromMinor(credit) }
}

/** Totals of a set of journal lines (used by the manual entry form). */
export const journalTotals = (
  lines: { debit_amount?: string; credit_amount?: string }[]
) => {
  const debitMinor = lines.reduce(
    (total, line) => total + toMinor(line.debit_amount),
    0
  )
  const creditMinor = lines.reduce(
    (total, line) => total + toMinor(line.credit_amount),
    0
  )

  return {
    debit: fromMinor(debitMinor),
    credit: fromMinor(creditMinor),
    difference: fromMinor(debitMinor - creditMinor),
    balanced: debitMinor === creditMinor && debitMinor > 0,
  }
}
