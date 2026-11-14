import moment from 'moment'

/**
 * Shared helpers of the fee management module: money handling, status metadata,
 * select options and the frontend mirror of the backend role matrix
 * (`backend/src/fee/fee.roles.ts`).
 *
 * Money never goes through binary floating point: amounts are parsed to integer
 * minor units exactly like `toMinorUnits` of the accounting engine.
 */

export const FEE_BASE_PATH = '/dashboard/fees'

/* ------------------------------------------------------------------ *
 * Money
 * ------------------------------------------------------------------ */

const MONEY_PATTERN = /^\d{1,15}(\.\d{1,2})?$/

export const isMoney = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return false
  }

  return MONEY_PATTERN.test(String(value).trim())
}

/** `"1250.5"` -> `125050`. Mirrors `toMinorUnits` of the accounting engine. */
export const toMinor = (value?: string | number | null): number => {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const raw = String(value).trim()

  if (!MONEY_PATTERN.test(raw)) {
    return 0
  }

  const [whole, decimals = ''] = raw.split('.')

  return Number(whole) * 100 + Number(decimals.padEnd(2, '0'))
}

/** `125050` -> `"1250.50"`. Mirrors `fromMinorUnits`. */
export const fromMinor = (minor: number): string => {
  const safe = Math.round(minor)
  const sign = safe < 0 ? '-' : ''
  const absolute = Math.abs(safe)

  return `${sign}${Math.floor(absolute / 100)}.${String(
    absolute % 100
  ).padStart(2, '0')}`
}

/** Sum of money strings, done on integer minor units. Returns a money string. */
export const sumMoney = (...values: (string | number | null | undefined)[]) =>
  fromMinor(values.reduce<number>((total, value) => total + toMinor(value), 0))

export const subtractMoney = (
  value: string | number | null | undefined,
  ...deductions: (string | number | null | undefined)[]
) =>
  fromMinor(
    toMinor(value) -
      deductions.reduce<number>((total, item) => total + toMinor(item), 0)
  )

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** `"1250.5"` -> `"Rs 1,250.50"`. Display only, never used for arithmetic. */
export const formatMoney = (
  value?: string | number | null,
  options: { symbol?: string; compact?: boolean } = {}
) => {
  const symbol = options.symbol ?? 'Rs'
  const minor = toMinor(value)
  const absolute = Math.abs(minor) / 100
  const formatted =
    options.compact && absolute >= 100000
      ? `${(absolute / 100000).toFixed(2)}L`
      : moneyFormatter.format(absolute)

  return `${minor < 0 ? '-' : ''}${symbol} ${formatted}`
}

export const formatMinorMoney = (minor: number, symbol = 'Rs') =>
  formatMoney(fromMinor(minor), { symbol })

export const formatPercent = (value?: number | string | null, digits = 1) =>
  `${Number(value ?? 0).toFixed(digits)}%`

/* ------------------------------------------------------------------ *
 * Dates and people
 * ------------------------------------------------------------------ */

export const formatDate = (value?: string | null, format = 'DD MMM YYYY') => {
  if (!value || !moment(value).isValid()) {
    return '—'
  }

  return moment(value).format(format)
}

export const formatDateTime = (value?: string | null) => {
  if (!value || !moment(value).isValid()) {
    return '—'
  }

  return moment(value).format('DD MMM YYYY, hh:mm A')
}

export const todayIso = () => moment().format('YYYY-MM-DD')

export const fullName = (firstname?: string | null, lastname?: string | null) =>
  [firstname, lastname].filter(Boolean).join(' ') || 'Unknown'

export const initialsOf = (
  firstname?: string | null,
  lastname?: string | null
) =>
  `${(firstname ?? '').charAt(0)}${(lastname ?? '').charAt(0)}`.toUpperCase() ||
  '—'

export const ratioPercent = (part?: string | null, whole?: string | null) => {
  const wholeMinor = toMinor(whole)

  if (wholeMinor <= 0) {
    return 0
  }

  return Number(((toMinor(part) / wholeMinor) * 100).toFixed(2))
}

/* ------------------------------------------------------------------ *
 * Status metadata (single palette for every fee screen)
 * ------------------------------------------------------------------ */

export interface IStatusMeta {
  label: string
  text: string
  bg: string
  border: string
  dot: string
}

const tone = (text: string, bg: string, border: string, dot: string) => ({
  text,
  bg,
  border,
  dot,
})

const GREY = tone('#475569', '#f1f5f9', '#e2e8f0', '#94a3b8')
const BLUE = tone('#1d4ed8', '#eff6ff', '#bfdbfe', '#3b82f6')
const GREEN = tone('#047857', '#ecfdf5', '#a7f3d0', '#10b981')
const AMBER = tone('#b45309', '#fffbeb', '#fde68a', '#f59e0b')
const RED = tone('#b91c1c', '#fef2f2', '#fecaca', '#ef4444')
const VIOLET = tone('#4338ca', '#eef2ff', '#c7d2fe', '#6366f1')

export const INVOICE_STATUS_META: Record<Fee.InvoiceStatus, IStatusMeta> = {
  DRAFT: { ...GREY, label: 'Draft' },
  ISSUED: { ...BLUE, label: 'Issued' },
  PARTIALLY_PAID: { ...AMBER, label: 'Partially paid' },
  PAID: { ...GREEN, label: 'Paid' },
  OVERDUE: { ...RED, label: 'Overdue' },
  CANCELLED: { ...GREY, label: 'Cancelled' },
  VOIDED: { ...GREY, label: 'Voided' },
}

export const PAYMENT_STATUS_META: Record<Fee.PaymentStatus, IStatusMeta> = {
  PENDING: { ...AMBER, label: 'Pending' },
  CONFIRMED: { ...GREEN, label: 'Confirmed' },
  FAILED: { ...RED, label: 'Failed' },
  REVERSED: { ...GREY, label: 'Reversed' },
}

export const REFUND_STATUS_META: Record<Fee.RefundStatus, IStatusMeta> = {
  PENDING: { ...AMBER, label: 'Pending' },
  APPROVED: { ...BLUE, label: 'Approved' },
  PROCESSED: { ...GREEN, label: 'Processed' },
  REJECTED: { ...RED, label: 'Rejected' },
  FAILED: { ...RED, label: 'Failed' },
}

export const ADJUSTMENT_STATUS_META: Record<Fee.AdjustmentStatus, IStatusMeta> =
  {
    PENDING: { ...AMBER, label: 'Pending' },
    APPROVED: { ...BLUE, label: 'Approved' },
    APPLIED: { ...GREEN, label: 'Applied' },
    REJECTED: { ...RED, label: 'Rejected' },
    REVERSED: { ...GREY, label: 'Reversed' },
  }

export const CONCESSION_STATUS_META: Record<
  Fee.ConcessionApprovalStatus,
  IStatusMeta
> = {
  PENDING: { ...AMBER, label: 'Pending' },
  APPROVED: { ...GREEN, label: 'Approved' },
  REJECTED: { ...RED, label: 'Rejected' },
  REVOKED: { ...GREY, label: 'Revoked' },
}

export const TEMPLATE_STATUS_META: Record<Fee.TemplateStatus, IStatusMeta> = {
  DRAFT: { ...GREY, label: 'Draft' },
  ACTIVE: { ...GREEN, label: 'Active' },
  INACTIVE: { ...AMBER, label: 'Inactive' },
  ARCHIVED: { ...VIOLET, label: 'Archived' },
}

export const ASSIGNMENT_STATUS_META: Record<Fee.AssignmentStatus, IStatusMeta> =
  {
    ACTIVE: { ...GREEN, label: 'Active' },
    EXEMPTED: { ...VIOLET, label: 'Exempted' },
    COMPLETED: { ...BLUE, label: 'Completed' },
    CANCELLED: { ...GREY, label: 'Cancelled' },
  }

/** Fee -> ledger synchronization status. */
export const INTEGRATION_STATUS_META: Record<
  Fee.IntegrationStatus,
  IStatusMeta
> = {
  PENDING: { ...GREY, label: 'Pending' },
  PROCESSING: { ...AMBER, label: 'Processing' },
  POSTED: { ...GREEN, label: 'Posted' },
  FAILED: { ...RED, label: 'Failed' },
  REQUIRES_REVIEW: { ...VIOLET, label: 'Requires review' },
}

export const AGING_BUCKET_META: Record<Fee.AgingBucket, IStatusMeta> = {
  NOT_DUE: { ...GREY, label: 'Not due' },
  DAYS_1_30: { ...AMBER, label: '1–30 days' },
  DAYS_31_60: {
    ...tone('#c2410c', '#fff7ed', '#fed7aa', '#f97316'),
    label: '31–60 days',
  },
  DAYS_61_90: {
    ...tone('#b91c1c', '#fef2f2', '#fecaca', '#dc2626'),
    label: '61–90 days',
  },
  ABOVE_90: {
    ...tone('#7f1d1d', '#fef2f2', '#fca5a5', '#991b1b'),
    label: 'Above 90 days',
  },
}

export const REMINDER_STATUS_META: Record<Fee.ReminderStatus, IStatusMeta> = {
  PENDING: { ...AMBER, label: 'Pending' },
  SENT: { ...GREEN, label: 'Sent' },
  FAILED: { ...RED, label: 'Failed' },
  SKIPPED: { ...GREY, label: 'Skipped' },
}

export const WALLET_TX_TYPE_META: Record<
  Fee.WalletTransactionType,
  IStatusMeta
> = {
  CREDIT: { ...GREEN, label: 'Credit' },
  DEBIT: { ...RED, label: 'Debit' },
}

/* ------------------------------------------------------------------ *
 * Select options (values are the backend enums)
 * ------------------------------------------------------------------ */

/**
 * `FeePanel` applies `overflow: hidden` (fee modals use scrollable MUI cards),
 * which clips the react-select menu so the dropdown options become invisible.
 * Rendering the menu inside a portal attached to `document.body` keeps it
 * visible above panels, tables and modals — same approach as
 * `routineSelectPortalProps` of the class routine module.
 */
export const feeSelectPortalProps = {
  menuPortalTarget:
    typeof document === 'undefined' ? null : (document.body as HTMLElement),
  menuPosition: 'fixed' as const,
  menuPlacement: 'auto' as const,
}

export interface IOption<T extends string = string> {
  label: string
  value: T
}

const optionList = <T extends string>(
  entries: Record<T, string>
): IOption<T>[] =>
  (Object.keys(entries) as T[]).map((value) => ({
    value,
    label: entries[value],
  }))

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const FEE_CATEGORY_OPTIONS: IOption<Fee.FeeCategory>[] = [
  'TUITION',
  'ADMISSION',
  'REGISTRATION',
  'EXAMINATION',
  'LIBRARY',
  'TRANSPORTATION',
  'LABORATORY',
  'SPORTS',
  'COMPUTER',
  'HOSTEL',
  'OTHER',
].map((value) => ({ value: value as Fee.FeeCategory, label: titleCase(value) }))

export const BILLING_FREQUENCY_OPTIONS: IOption<Fee.BillingFrequency>[] = [
  { value: 'ONE_TIME', label: 'One time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'TERM', label: 'Per term' },
  { value: 'ANNUAL', label: 'Annual' },
]

export const BILLING_FREQUENCY_LABEL: Record<Fee.BillingFrequency, string> = {
  ONE_TIME: 'One time',
  MONTHLY: 'Monthly',
  TERM: 'Term',
  ANNUAL: 'Annual',
}

export const REVENUE_POLICY_OPTIONS: IOption<Fee.RevenueRecognitionPolicy>[] = [
  { value: 'ON_ISSUE', label: 'Recognize on issue' },
  { value: 'ON_DUE_DATE', label: 'Recognize on due date' },
  { value: 'DEFERRED', label: 'Deferred revenue' },
]

export const TEMPLATE_STATUS_OPTIONS: IOption<Fee.TemplateStatus>[] =
  optionList<Fee.TemplateStatus>({
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    ARCHIVED: 'Archived',
  })

export const ASSIGNMENT_STATUS_OPTIONS: IOption<Fee.AssignmentStatus>[] =
  optionList<Fee.AssignmentStatus>({
    ACTIVE: 'Active',
    EXEMPTED: 'Exempted',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  })

export const INVOICE_STATUS_OPTIONS: IOption<Fee.InvoiceStatus>[] =
  optionList<Fee.InvoiceStatus>({
    DRAFT: 'Draft',
    ISSUED: 'Issued',
    PARTIALLY_PAID: 'Partially paid',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
    VOIDED: 'Voided',
  })

export const PAYMENT_METHOD_OPTIONS: IOption<Fee.PaymentMethod>[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'ONLINE_GATEWAY', label: 'Online gateway' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
]

export const PAYMENT_METHOD_LABEL: Record<Fee.PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
  ONLINE_GATEWAY: 'Online gateway',
  CHEQUE: 'Cheque',
  WALLET: 'Wallet',
  OTHER: 'Other',
}

export const PAYMENT_STATUS_OPTIONS: IOption<Fee.PaymentStatus>[] =
  optionList<Fee.PaymentStatus>({
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    FAILED: 'Failed',
    REVERSED: 'Reversed',
  })

export const DISCOUNT_TYPE_OPTIONS: IOption<Fee.DiscountType>[] = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED_AMOUNT', label: 'Fixed amount' },
]

export const DISCOUNT_CATEGORY_OPTIONS: IOption<Fee.DiscountCategory>[] = [
  { value: 'MERIT_SCHOLARSHIP', label: 'Merit scholarship' },
  { value: 'ACADEMIC_EXCELLENCE', label: 'Academic excellence' },
  { value: 'SIBLING_DISCOUNT', label: 'Sibling discount' },
  { value: 'FINANCIAL_ASSISTANCE', label: 'Financial assistance' },
  { value: 'STAFF_CHILD', label: 'Staff child' },
  { value: 'SPECIAL_NEEDS', label: 'Special needs' },
  { value: 'GOVERNMENT_SCHOLARSHIP', label: 'Government scholarship' },
  { value: 'CUSTOM', label: 'Custom' },
]

export const CONCESSION_STATUS_OPTIONS: IOption<Fee.ConcessionApprovalStatus>[] =
  optionList<Fee.ConcessionApprovalStatus>({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    REVOKED: 'Revoked',
  })

export const LATE_FEE_TYPE_OPTIONS: IOption<Fee.LateFeeCalculationType>[] = [
  { value: 'FIXED', label: 'Fixed amount' },
  { value: 'PERCENTAGE', label: 'Percentage' },
]

export const LATE_FEE_FREQUENCY_OPTIONS: IOption<Fee.LateFeeFrequency>[] = [
  { value: 'ONE_TIME', label: 'One time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'MONTHLY', label: 'Monthly' },
]

export const ADJUSTMENT_TYPE_OPTIONS: IOption<Fee.AdjustmentType>[] = [
  { value: 'PENALTY', label: 'Penalty (late fee)' },
  { value: 'CREDIT_NOTE', label: 'Credit note' },
  { value: 'DEBIT_NOTE', label: 'Debit note' },
  { value: 'WAIVER', label: 'Waiver' },
  { value: 'WRITE_OFF', label: 'Write off' },
]

export const ADJUSTMENT_STATUS_OPTIONS: IOption<Fee.AdjustmentStatus>[] =
  optionList<Fee.AdjustmentStatus>({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    APPLIED: 'Applied',
    REJECTED: 'Rejected',
    REVERSED: 'Reversed',
  })

export const REFUND_TYPE_OPTIONS: IOption<Fee.RefundType>[] = [
  { value: 'PAYMENT_REFUND', label: 'Payment refund' },
  { value: 'OVERPAYMENT_REFUND', label: 'Overpayment refund' },
  { value: 'WALLET_REFUND', label: 'Wallet refund' },
  { value: 'FEE_CANCELLATION', label: 'Fee cancellation' },
]

export const REFUND_STATUS_OPTIONS: IOption<Fee.RefundStatus>[] =
  optionList<Fee.RefundStatus>({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PROCESSED: 'Processed',
    REJECTED: 'Rejected',
    FAILED: 'Failed',
  })

export const REMINDER_CHANNEL_OPTIONS: IOption<Fee.ReminderChannel>[] = [
  { value: 'SMS', label: 'SMS' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'IN_APP', label: 'In-app' },
]

export const REMINDER_STATUS_OPTIONS: IOption<Fee.ReminderStatus>[] =
  optionList<Fee.ReminderStatus>({
    PENDING: 'Pending',
    SENT: 'Sent',
    FAILED: 'Failed',
    SKIPPED: 'Skipped',
  })

export const AGING_BUCKET_OPTIONS: IOption<Fee.AgingBucket>[] =
  optionList<Fee.AgingBucket>({
    NOT_DUE: 'Not due',
    DAYS_1_30: '1–30 days',
    DAYS_31_60: '31–60 days',
    DAYS_61_90: '61–90 days',
    ABOVE_90: 'Above 90 days',
  })

/* ------------------------------------------------------------------ *
 * Permission map (mirror of backend/src/fee/fee.roles.ts)
 *
 * The backend always re-validates the role; this map only decides what the UI
 * renders. Roles are the ones returned by the session (`userRoles`).
 * ------------------------------------------------------------------ */

const READ_ROLES = [
  'superadmin',
  'admin',
  'accountant',
  'finance_manager',
  'auditor',
]
const CONFIG_ROLES = ['superadmin', 'admin', 'accountant']
const COLLECTION_ROLES = [
  'superadmin',
  'admin',
  'accountant',
  'finance_manager',
]
const APPROVAL_ROLES = ['superadmin', 'admin', 'finance_manager']

export type FeePermission =
  | 'fee.dashboard.view'
  | 'fee.types.view'
  | 'fee.types.create'
  | 'fee.types.update'
  | 'fee.templates.view'
  | 'fee.templates.create'
  | 'fee.templates.update'
  | 'fee.assignments.manage'
  | 'fee.scholarships.manage'
  | 'fee.invoices.view'
  | 'fee.invoices.generate'
  | 'fee.invoices.cancel'
  | 'fee.payments.view'
  | 'fee.payments.collect'
  | 'fee.payments.reverse'
  | 'fee.wallets.view'
  | 'fee.wallets.manage'
  | 'fee.refunds.view'
  | 'fee.refunds.request'
  | 'fee.refunds.approve'
  | 'fee.adjustments.approve'
  | 'fee.late_fees.manage'
  | 'fee.late_fees.assess'
  | 'fee.defaulters.view'
  | 'fee.notifications.send'
  | 'fee.reports.view'
  | 'fee.accounting_sync.view'
  | 'fee.accounting_sync.retry'

export const FEE_PERMISSION_ROLES: Record<FeePermission, string[]> = {
  'fee.dashboard.view': READ_ROLES,
  'fee.types.view': READ_ROLES,
  'fee.types.create': CONFIG_ROLES,
  'fee.types.update': CONFIG_ROLES,
  'fee.templates.view': READ_ROLES,
  'fee.templates.create': CONFIG_ROLES,
  'fee.templates.update': CONFIG_ROLES,
  'fee.assignments.manage': CONFIG_ROLES,
  'fee.scholarships.manage': CONFIG_ROLES,
  'fee.invoices.view': READ_ROLES,
  'fee.invoices.generate': COLLECTION_ROLES,
  'fee.invoices.cancel': COLLECTION_ROLES,
  'fee.payments.view': READ_ROLES,
  'fee.payments.collect': COLLECTION_ROLES,
  'fee.payments.reverse': APPROVAL_ROLES,
  'fee.wallets.view': READ_ROLES,
  'fee.wallets.manage': COLLECTION_ROLES,
  'fee.refunds.view': READ_ROLES,
  'fee.refunds.request': COLLECTION_ROLES,
  'fee.refunds.approve': APPROVAL_ROLES,
  'fee.adjustments.approve': APPROVAL_ROLES,
  'fee.late_fees.manage': CONFIG_ROLES,
  'fee.late_fees.assess': COLLECTION_ROLES,
  'fee.defaulters.view': READ_ROLES,
  'fee.notifications.send': COLLECTION_ROLES,
  'fee.reports.view': READ_ROLES,
  'fee.accounting_sync.view': READ_ROLES,
  'fee.accounting_sync.retry': COLLECTION_ROLES,
}

export const hasFeePermission = (
  roles: string[] | undefined,
  permission: FeePermission
) =>
  Boolean(
    roles?.some((role) => FEE_PERMISSION_ROLES[permission].includes(role))
  )

export const hasAnyFeePermission = (
  roles: string[] | undefined,
  permissions: FeePermission[]
) => permissions.some((permission) => hasFeePermission(roles, permission))

/** Can the current user open the fee module at all? */
export const canViewFeeModule = (roles: string[] | undefined) =>
  hasFeePermission(roles, 'fee.dashboard.view')

/* ------------------------------------------------------------------ *
 * Export / print (client side, from the *server computed* rows)
 * ------------------------------------------------------------------ */

export const downloadCsv = (
  filename: string,
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[]
) => {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value)

    return `"${text.replace(/"/g, '""')}"`
  }

  const header = columns.map((column) => escape(column.label)).join(',')
  const body = rows.map((row) =>
    columns.map((column) => escape(row[column.key])).join(',')
  )

  const blob = new Blob([[header, ...body].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${filename}-${moment().format('YYYYMMDD-HHmm')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Print any DOM subtree (invoice, receipt, report) through the browser. */
export const printElement = (elementId: string, title: string) => {
  const element = document.getElementById(elementId)

  if (!element) {
    return
  }

  const frame = document.createElement('iframe')

  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  document.body.appendChild(frame)

  const doc = frame.contentWindow?.document

  if (!doc) {
    document.body.removeChild(frame)

    return
  }

  doc.open()
  doc.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Inter, Arial, sans-serif; color: #0f172a; padding: 32px; }
      h1, h2, h3 { margin: 0 0 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12.5px; }
      th { text-transform: uppercase; letter-spacing: .4px; font-size: 11px; color: #64748b; }
      .no-print { display: none !important; }
      .amount { text-align: right; font-variant-numeric: tabular-nums; }
    </style></head><body>${element.innerHTML}</body></html>`)
  doc.close()

  const cleanup = () => {
    if (frame.parentNode) {
      document.body.removeChild(frame)
    }
  }

  frame.onload = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(cleanup, 500)
  }
}
