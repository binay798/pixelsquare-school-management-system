import { api } from '@src/helpers/api.helpers'

/**
 * Fee management API client.
 *
 * Every function maps to exactly one route of `backend/src/fee/fee.routes.ts`
 * (mounted at `/fees`) or to the accounting endpoints used for the account
 * mapping / journal drill down. Nothing is invented here: the request payloads
 * mirror `backend/src/fee/fee.schema.ts` and the responses mirror the services
 * of the fee module.
 *
 * Money is sent as a decimal *string* (the backend converts it to integer minor
 * units), never as a float.
 */

type TQuery = { [key: string]: number | string }

/** `{ rows, total, page, limit }` envelope returned by every fee list route. */
const unwrap = <T>(response: { data: Api.Base<T> }) => response.data.data.data

/* ------------------------------------------------------------------ *
 * Request payloads (mirror of fee.schema.ts)
 * ------------------------------------------------------------------ */

export interface ICreateFeeTypeDto {
  name: string
  code: string
  description?: string | null
  default_amount?: string | null
  category?: Fee.FeeCategory
  accounting_account_id?: number | null
  revenue_recognition_policy?: Fee.RevenueRecognitionPolicy
  is_mandatory?: boolean
  is_recurring?: boolean
  is_refundable?: boolean
  is_active?: boolean
}

export type IUpdateFeeTypeDto = Partial<ICreateFeeTypeDto>

export interface IFeeTemplateItemDto {
  fee_type_id: number
  amount: string
  quantity?: string
  billing_frequency?: Fee.BillingFrequency
  is_optional?: boolean
  sort_order?: number
}

export interface ICreateFeeTemplateDto {
  name: string
  code: string
  description?: string | null
  academic_year_id: number
  class_id?: number | null
  section_id?: number | null
  effective_from: string
  effective_to?: string | null
  status?: Fee.TemplateStatus
  items: IFeeTemplateItemDto[]
}

export type IUpdateFeeTemplateDto = Partial<ICreateFeeTemplateDto>

export interface IDuplicateFeeTemplateDto {
  code: string
  name?: string
  academic_year_id?: number
}

export interface ICreateAssignmentDto {
  student_id: number
  academic_year_id: number
  fee_template_id?: number | null
  assigned_amount?: string | null
  effective_from?: string
  effective_to?: string | null
  is_exempt?: boolean
  notes?: string | null
}

export interface IBulkAssignmentDto {
  fee_template_id: number
  academic_year_id: number
  class_id?: number | null
  section_id?: number | null
}

export interface ICreateScholarshipDto {
  name: string
  code: string
  description?: string | null
  discount_type: Fee.DiscountType
  discount_value: string
  discount_category?: Fee.DiscountCategory
  calculation_priority?: number
  applies_to_fee_type_id?: number | null
  maximum_discount_amount?: string | null
  minimum_fee_amount?: string | null
  academic_year_id?: number | null
  valid_from: string
  valid_until?: string | null
  maximum_beneficiaries?: number | null
  requires_approval?: boolean
  is_active?: boolean
}

export type IUpdateScholarshipDto = Partial<ICreateScholarshipDto>

export interface IAssignConcessionDto {
  student_id: number
  scholarship_discount_id: number
  academic_year_id: number
  valid_from?: string
  valid_until?: string | null
  remarks?: string | null
}

export interface ILateFeeRuleDto {
  name: string
  calculation_type: Fee.LateFeeCalculationType
  calculation_value: string
  grace_period_days?: number
  maximum_penalty?: string | null
  frequency?: Fee.LateFeeFrequency
  applies_to_fee_type_id?: number | null
  accounting_account_id?: number | null
  effective_from: string
  effective_until?: string | null
  is_active?: boolean
}

export type IUpdateLateFeeRuleDto = Partial<ILateFeeRuleDto>

export interface IInvoiceLineDto {
  fee_type_id?: number | null
  description?: string
  quantity?: string
  unit_price: string
  tax_rate?: string
  billing_frequency?: Fee.BillingFrequency
}

export interface IGenerateInvoiceDto {
  student_id: number
  academic_year_id: number
  fee_template_id?: number | null
  academic_term_id?: number | null
  issue_date?: string
  due_date?: string
  billing_frequency?: Fee.BillingFrequency
  lines?: IInvoiceLineDto[]
  optional_fee_type_ids?: number[]
  notes?: string | null
  auto_issue?: boolean
  auto_apply_wallet?: boolean
  idempotency_key?: string
}

export interface IBulkInvoiceDto {
  academic_year_id: number
  fee_template_id?: number | null
  class_id?: number | null
  section_id?: number | null
  student_ids?: number[]
  issue_date?: string
  due_date?: string
  billing_frequency?: Fee.BillingFrequency
  auto_issue?: boolean
  auto_apply_wallet?: boolean
}

export interface ICreateAdjustmentDto {
  adjustment_type: Fee.AdjustmentType
  amount: string
  reason?: string
  effective_date?: string
  apply_immediately?: boolean
}

export interface ICollectPaymentDto {
  student_id: number
  amount: string
  payment_method: Fee.PaymentMethod
  payer_guardian_id?: number | null
  payment_date?: string
  payment_reference?: string | null
  gateway_reference?: string | null
  gateway_status?: Fee.GatewayStatus
  notes?: string | null
  idempotency_key?: string
  allocations?: { invoice_id: number; amount: string }[]
  allow_advance?: boolean
}

export interface IRequestRefundDto {
  student_id: number
  refund_type: Fee.RefundType
  amount: string
  reason: string
  payment_method: Fee.PaymentMethod
  payment_id?: number | null
  invoice_id?: number | null
  wallet_id?: number | null
  reference?: string | null
  idempotency_key?: string
}

export interface IScheduleRemindersDto {
  invoice_ids?: number[]
  channels?: Fee.ReminderChannel[]
  reminder_type?: string
  dry_run?: boolean
}

/* ------------------------------------------------------------------ *
 * Query filters
 * ------------------------------------------------------------------ */

export interface IFeeTypeFilters {
  is_active?: boolean
  category?: string
  search?: string
}

export interface ITemplateFilters {
  academic_year_id?: number
  class_id?: number
  section_id?: number
  status?: string
}

export interface IAssignmentFilters {
  student_id?: number
  academic_year_id?: number
  fee_template_id?: number
  status?: string
}

export interface IScholarshipFilters {
  academic_year_id?: number
  is_active?: boolean
  category?: string
}

export interface IConcessionFilters {
  student_id?: number
  academic_year_id?: number
  approval_status?: string
}

export interface IInvoiceFilters {
  student_id?: number
  academic_year_id?: number
  academic_term_id?: number
  fee_template_id?: number
  status?: string
  date_from?: string
  date_to?: string
  due_from?: string
  due_to?: string
  outstanding_only?: boolean
  search?: string
}

export interface IPaymentFilters {
  student_id?: number
  status?: string
  payment_method?: string
  date_from?: string
  date_to?: string
  search?: string
  unallocated_only?: boolean
}

export interface IRefundFilters {
  student_id?: number
  status?: string
  refund_type?: string
}

export interface IAdjustmentFilters {
  invoice_id?: number
  status?: string
  adjustment_type?: string
}

export interface IDefaulterFilters {
  academic_year_id?: number
  academic_term_id?: number
  class_id?: number
  section_id?: number
  student_id?: number
  guardian_id?: number
  due_from?: string
  due_to?: string
  min_outstanding?: string
  bucket?: string
}

export interface IReminderFilters {
  student_id?: number
  status?: string
  channel?: string
}

export interface IReportFilters {
  academic_year_id?: number
  academic_term_id?: number
  class_id?: number
  section_id?: number
  student_id?: number
  fee_type_id?: number
  payment_method?: string
  status?: string
  date_from?: string
  date_to?: string
  group_by?: string
}

/* ------------------------------------------------------------------ *
 * Query string builders (only defined values are sent)
 * ------------------------------------------------------------------ */

const compact = (source: Record<string, unknown>): TQuery => {
  const params: TQuery = {}

  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    params[key] =
      typeof value === 'boolean' ? String(value) : (value as number | string)
  })

  return params
}

const paginate = (page?: number, limit?: number): TQuery =>
  compact({ page: page ?? 1, limit: limit ?? 20 })

/* ------------------------------------------------------------------ *
 * Fee types
 * ------------------------------------------------------------------ */

const listFeeTypesService = async (
  filters: IFeeTypeFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IFeeType>>>('get')(
    'fees/types',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createFeeTypeService = async (payload: ICreateFeeTypeDto) => {
  const res = await api<Api.Base<Fee.IFeeType>>('post')(
    'fees/types',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateFeeTypeService = async (
  feeTypeId: number,
  payload: IUpdateFeeTypeDto
) => {
  const res = await api<Api.Base<Fee.IFeeType>>('patch')(
    `fees/types/${feeTypeId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

/** Soft delete: the backend deactivates the fee type (`DELETE /fees/types/:id`). */
const deactivateFeeTypeService = async (feeTypeId: number) => {
  const res = await api<Api.Base<Fee.IFeeType>>('delete')(
    `fees/types/${feeTypeId}`
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Fee templates
 * ------------------------------------------------------------------ */

const listFeeTemplatesService = async (
  filters: ITemplateFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IFeeTemplate>>>('get')(
    'fees/templates',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getFeeTemplateService = async (templateId: number) => {
  const res = await api<Api.Base<Fee.IFeeTemplateDetail>>('get')(
    `fees/templates/${templateId}`
  )

  return unwrap(res)
}

const createFeeTemplateService = async (payload: ICreateFeeTemplateDto) => {
  const res = await api<Api.Base<Fee.IFeeTemplateDetail>>('post')(
    'fees/templates',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateFeeTemplateService = async (
  templateId: number,
  payload: IUpdateFeeTemplateDto
) => {
  const res = await api<Api.Base<Fee.IFeeTemplateDetail>>('patch')(
    `fees/templates/${templateId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const duplicateFeeTemplateService = async (
  templateId: number,
  payload: IDuplicateFeeTemplateDto
) => {
  const res = await api<Api.Base<Fee.IFeeTemplateDetail>>('post')(
    `fees/templates/${templateId}/duplicate`,
    undefined,
    payload
  )

  return unwrap(res)
}

const deactivateFeeTemplateService = async (templateId: number) => {
  const res = await api<Api.Base<Fee.IFeeTemplate>>('delete')(
    `fees/templates/${templateId}`
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Student fee assignments
 * ------------------------------------------------------------------ */

const listAssignmentsService = async (
  filters: IAssignmentFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IAssignment>>>('get')(
    'fees/assignments',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createAssignmentService = async (payload: ICreateAssignmentDto) => {
  const res = await api<Api.Base<Fee.IAssignment>>('post')(
    'fees/assignments',
    undefined,
    payload
  )

  return unwrap(res)
}

const bulkAssignTemplateService = async (payload: IBulkAssignmentDto) => {
  const res = await api<
    Api.Base<{ students: number; created: number; skipped: number }>
  >('post')('fees/assignments/bulk', undefined, payload)

  return unwrap(res)
}

const cancelAssignmentService = async (assignmentId: number) => {
  const res = await api<Api.Base<Fee.IAssignment>>('delete')(
    `fees/assignments/${assignmentId}`
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Scholarships, discounts and student concessions
 * ------------------------------------------------------------------ */

const listScholarshipsService = async (
  filters: IScholarshipFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IScholarship>>>('get')(
    'fees/concessions/rules',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createScholarshipService = async (payload: ICreateScholarshipDto) => {
  const res = await api<Api.Base<Fee.IScholarship>>('post')(
    'fees/concessions/rules',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateScholarshipService = async (
  scholarshipId: number,
  payload: IUpdateScholarshipDto
) => {
  const res = await api<Api.Base<Fee.IScholarship>>('patch')(
    `fees/concessions/rules/${scholarshipId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const listConcessionsService = async (
  filters: IConcessionFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IConcession>>>('get')(
    'fees/concessions',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const assignConcessionService = async (payload: IAssignConcessionDto) => {
  const res = await api<Api.Base<Fee.IConcession>>('post')(
    'fees/concessions',
    undefined,
    payload
  )

  return unwrap(res)
}

const decideConcessionService = async (
  concessionId: number,
  payload: {
    decision: Fee.ConcessionApprovalStatus
    remarks?: string
  }
) => {
  const res = await api<Api.Base<Fee.IConcession>>('patch')(
    `fees/concessions/${concessionId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Late fee rules and assessment
 * ------------------------------------------------------------------ */

const listLateFeeRulesService = async () => {
  const res = await api<Api.Base<{ rows: Fee.ILateFeeRule[]; total: number }>>(
    'get'
  )('fees/late-fees/rules')

  return unwrap(res)
}

const createLateFeeRuleService = async (payload: ILateFeeRuleDto) => {
  const res = await api<Api.Base<Fee.ILateFeeRule>>('post')(
    'fees/late-fees/rules',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateLateFeeRuleService = async (
  ruleId: number,
  payload: IUpdateLateFeeRuleDto
) => {
  const res = await api<Api.Base<Fee.ILateFeeRule>>('patch')(
    `fees/late-fees/rules/${ruleId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const deactivateLateFeeRuleService = async (ruleId: number) => {
  const res = await api<Api.Base<Fee.ILateFeeRule>>('delete')(
    `fees/late-fees/rules/${ruleId}`
  )

  return unwrap(res)
}

const assessLateFeesService = async (payload: {
  as_of_date?: string
  rule_id?: number
  dry_run?: boolean
}) => {
  const res = await api<Api.Base<Fee.ILateFeeAssessment>>('post')(
    'fees/late-fees/assess',
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Invoices
 * ------------------------------------------------------------------ */

const listInvoicesService = async (
  filters: IInvoiceFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IInvoice>>>('get')(
    'fees/invoices',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getInvoiceService = async (invoiceId: number) => {
  const res = await api<Api.Base<Fee.IInvoiceDetail>>('get')(
    `fees/invoices/${invoiceId}`
  )

  return unwrap(res)
}

/** Prices the invoice server side without persisting anything. */
const previewInvoiceService = async (payload: IGenerateInvoiceDto) => {
  const res = await api<Api.Base<Fee.IPreparedInvoice>>('post')(
    'fees/invoices/preview',
    undefined,
    payload
  )

  return unwrap(res)
}

const generateInvoiceService = async (payload: IGenerateInvoiceDto) => {
  const res = await api<Api.Base<Fee.IInvoice>>('post')(
    'fees/invoices',
    undefined,
    payload
  )

  return unwrap(res)
}

const previewBulkInvoicesService = async (payload: IBulkInvoiceDto) => {
  const res = await api<Api.Base<Fee.IBulkPreview>>('post')(
    'fees/invoices/bulk/preview',
    undefined,
    payload
  )

  return unwrap(res)
}

const generateBulkInvoicesService = async (payload: IBulkInvoiceDto) => {
  const res = await api<Api.Base<Fee.IBulkGeneration>>('post')(
    'fees/invoices/bulk',
    undefined,
    payload
  )

  return unwrap(res)
}

const issueInvoiceService = async (invoiceId: number) => {
  const res = await api<Api.Base<Fee.IInvoice>>('post')(
    `fees/invoices/${invoiceId}/issue`
  )

  return unwrap(res)
}

const cancelInvoiceService = async (invoiceId: number, reason: string) => {
  const res = await api<Api.Base<Fee.IInvoice>>('post')(
    `fees/invoices/${invoiceId}/cancel`,
    undefined,
    { reason }
  )

  return unwrap(res)
}

const applyWalletService = async (
  invoiceId: number,
  payload: {
    student_id: number
    invoice_ids?: number[]
    amount?: string
    strategy?: Fee.AllocationStrategy
  }
) => {
  const res = await api<Api.Base<Fee.IWalletApplyResult>>('post')(
    `fees/invoices/${invoiceId}/apply-wallet`,
    undefined,
    payload
  )

  return unwrap(res)
}

/** Refresh of the derived OVERDUE status (scheduled job, also manual). */
const refreshOverdueService = async () => {
  const res = await api<Api.Base<{ updated: number; as_of_date: string }>>(
    'post'
  )('fees/invoices/refresh-overdue')

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Payments
 * ------------------------------------------------------------------ */

const listPaymentsService = async (
  filters: IPaymentFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IPayment>>>('get')(
    'fees/payments',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getPaymentService = async (paymentId: number) => {
  const res = await api<Api.Base<Fee.IPaymentDetail>>('get')(
    `fees/payments/${paymentId}`
  )

  return unwrap(res)
}

const getPaymentReceiptService = async (paymentId: number) => {
  const res = await api<Api.Base<Fee.IPaymentReceipt>>('get')(
    `fees/payments/${paymentId}/receipt`
  )

  return unwrap(res)
}

const collectPaymentService = async (payload: ICollectPaymentDto) => {
  const res = await api<Api.Base<Fee.IPaymentDetail>>('post')(
    'fees/payments',
    undefined,
    payload
  )

  return unwrap(res)
}

const reversePaymentService = async (paymentId: number, reason: string) => {
  const res = await api<Api.Base<Fee.IPaymentDetail>>('post')(
    `fees/payments/${paymentId}/reverse`,
    undefined,
    { reason }
  )

  return unwrap(res)
}

const confirmGatewayPaymentService = async (payload: {
  gateway_reference: string
  gateway_status?: 'CAPTURED' | 'FAILED' | 'REFUNDED'
  amount?: string
}) => {
  const res = await api<Api.Base<Fee.IPaymentDetail>>('post')(
    'fees/payments/gateway/confirm',
    undefined,
    payload
  )

  return unwrap(res)
}

const listUnallocatedPaymentsService = async (page = 1, limit = 20) => {
  const res = await api<Api.Base<Fee.IList<Fee.IPayment>>>('get')(
    'fees/reports/unallocated-payments',
    paginate(page, limit)
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Wallets and student statement
 * ------------------------------------------------------------------ */

const getStudentWalletService = async (studentId: number) => {
  const res = await api<Api.Base<Fee.IWallet>>('get')(
    `fees/students/${studentId}/wallet`
  )

  return unwrap(res)
}

const getWalletTransactionsService = async (
  studentId: number,
  page = 1,
  limit = 20,
  dateFilters: { date_from?: string; date_to?: string } = {}
) => {
  const res = await api<
    Api.Base<Fee.IList<Fee.IWalletTransaction> & { wallet: Fee.IWallet }>
  >('get')(`fees/students/${studentId}/wallet/transactions`, {
    ...compact({ ...dateFilters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const getStudentStatementService = async (
  studentId: number,
  filters: {
    academic_year_id?: number
    date_from?: string
    date_to?: string
  } = {}
) => {
  const res = await api<Api.Base<Fee.IStudentStatement>>('get')(
    `fees/students/${studentId}/statement`,
    compact({ ...filters })
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Refunds
 * ------------------------------------------------------------------ */

const listRefundsService = async (
  filters: IRefundFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IRefund>>>('get')(
    'fees/refunds',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const requestRefundService = async (payload: IRequestRefundDto) => {
  const res = await api<Api.Base<{ refund: Fee.IRefund; created: boolean }>>(
    'post'
  )('fees/refunds', undefined, payload)

  return unwrap(res)
}

const approveRefundService = async (refundId: number) => {
  const res = await api<Api.Base<Fee.IRefund>>('post')(
    `fees/refunds/${refundId}/approve`
  )

  return unwrap(res)
}

const rejectRefundService = async (refundId: number) => {
  const res = await api<Api.Base<Fee.IRefund>>('post')(
    `fees/refunds/${refundId}/reject`
  )

  return unwrap(res)
}

const processRefundService = async (refundId: number) => {
  const res = await api<Api.Base<Fee.IRefund>>('post')(
    `fees/refunds/${refundId}/process`
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Invoice adjustments (penalties, credit / debit notes, waivers)
 * ------------------------------------------------------------------ */

const listAdjustmentsService = async (
  filters: IAdjustmentFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IAdjustment>>>('get')(
    'fees/adjustments',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createAdjustmentService = async (
  invoiceId: number,
  payload: ICreateAdjustmentDto
) => {
  const res = await api<
    Api.Base<
      Record<string, unknown> & {
        applied: boolean
        adjustment: Fee.IAdjustment
      }
    >
  >('post')(`fees/invoices/${invoiceId}/adjustments`, undefined, payload)

  return unwrap(res)
}

const approveAdjustmentService = async (adjustmentId: number) => {
  const res = await api<Api.Base<{ applied: boolean }>>('post')(
    `fees/adjustments/${adjustmentId}/approve`
  )

  return unwrap(res)
}

const rejectAdjustmentService = async (adjustmentId: number) => {
  const res = await api<Api.Base<Fee.IAdjustment>>('post')(
    `fees/adjustments/${adjustmentId}/reject`
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Defaulters, aging, reminders
 * ------------------------------------------------------------------ */

const getDefaultersService = async (
  filters: IDefaulterFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IDefaulterList>>('get')(
    'fees/defaulters',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getAgingSummaryService = async (academicYearId?: number) => {
  const res = await api<Api.Base<Fee.IAgingSummary>>('get')(
    'fees/defaulters/aging',
    compact({ academic_year_id: academicYearId })
  )

  return unwrap(res)
}

const listRemindersService = async (
  filters: IReminderFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Fee.IList<Fee.IReminder>>>('get')(
    'fees/reminders',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const scheduleRemindersService = async (payload: IScheduleRemindersDto) => {
  const res = await api<Api.Base<Fee.IReminderScheduleResult>>('post')(
    'fees/reminders/schedule',
    undefined,
    payload
  )

  return unwrap(res)
}

const dispatchRemindersService = async () => {
  const res = await api<Api.Base<{ sent: number; failed: number }>>('post')(
    'fees/reminders/dispatch'
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Dashboard and operational reports
 * ------------------------------------------------------------------ */

const getFeeDashboardService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<Fee.IFeeDashboard>>('get')(
    'fees/dashboard',
    compact({ ...filters })
  )

  return unwrap(res)
}

const getCollectionReportService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<Fee.ICollectionReport>>('get')(
    'fees/reports/collections',
    compact({ ...filters })
  )

  return unwrap(res)
}

const getOutstandingReportService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<Fee.IGroupedReport>>('get')(
    'fees/reports/outstanding',
    compact({ ...filters })
  )

  return unwrap(res)
}

const getDiscountReportService = async (filters: IReportFilters = {}) => {
  const res = await api<
    Api.Base<{ rows: Fee.IDiscountReportRow[]; total_discount: string }>
  >('get')('fees/reports/discounts', compact({ ...filters }))

  return unwrap(res)
}

const getRefundReportService = async (filters: IReportFilters = {}) => {
  const res = await api<
    Api.Base<{ rows: Fee.IRefundReportRow[]; total_refunded: string }>
  >('get')('fees/reports/refunds', compact({ ...filters }))

  return unwrap(res)
}

const getWalletReportService = async (page = 1, limit = 20) => {
  const res = await api<
    Api.Base<{ rows: Fee.IWalletReportRow[]; total: number }>
  >('get')('fees/reports/wallets', paginate(page, limit))

  return unwrap(res)
}

const getLateFeeReportService = async (filters: IReportFilters = {}) => {
  const res = await api<
    Api.Base<{ rows: Fee.ILateFeeReportRow[]; total_penalty: string }>
  >('get')('fees/reports/late-fees', compact({ ...filters }))

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Accounting integration (fee <-> ledger bridge)
 * ------------------------------------------------------------------ */

const getAccountingStatusService = async () => {
  const res = await api<Api.Base<Fee.IAccountingEventsStatus>>('get')(
    'fees/accounting/status'
  )

  return unwrap(res)
}

const retryAccountingEventsService = async (payload: {
  event_ids?: number[]
  limit?: number
}) => {
  const res = await api<Api.Base<Fee.IIntegrationRetryResult>>('post')(
    'fees/accounting/retry',
    undefined,
    payload
  )

  return unwrap(res)
}

/** Chart of accounts used by the fee type / late fee rule account mapping. */
const getAccountOptionsService = async () => {
  const res = await api<Api.Base<{ accounts: Fee.IAccountOption[] }>>('get')(
    'accounting/accounts/options'
  )

  return unwrap(res).accounts
}

/** Journal drill down of an accounting event (`accounting_transaction_id`). */
const getJournalTransactionService = async (transactionId: number) => {
  const res = await api<Api.Base<Fee.IJournalTransaction>>('get')(
    `accounting/transactions/${transactionId}`
  )

  return unwrap(res)
}

export const feeServices = {
  /* fee types */
  listFeeTypesService,
  createFeeTypeService,
  updateFeeTypeService,
  deactivateFeeTypeService,
  /* templates */
  listFeeTemplatesService,
  getFeeTemplateService,
  createFeeTemplateService,
  updateFeeTemplateService,
  duplicateFeeTemplateService,
  deactivateFeeTemplateService,
  /* assignments */
  listAssignmentsService,
  createAssignmentService,
  bulkAssignTemplateService,
  cancelAssignmentService,
  /* scholarships and concessions */
  listScholarshipsService,
  createScholarshipService,
  updateScholarshipService,
  listConcessionsService,
  assignConcessionService,
  decideConcessionService,
  /* late fees */
  listLateFeeRulesService,
  createLateFeeRuleService,
  updateLateFeeRuleService,
  deactivateLateFeeRuleService,
  assessLateFeesService,
  /* invoices */
  listInvoicesService,
  getInvoiceService,
  previewInvoiceService,
  generateInvoiceService,
  previewBulkInvoicesService,
  generateBulkInvoicesService,
  issueInvoiceService,
  cancelInvoiceService,
  applyWalletService,
  refreshOverdueService,
  /* payments */
  listPaymentsService,
  getPaymentService,
  getPaymentReceiptService,
  collectPaymentService,
  reversePaymentService,
  confirmGatewayPaymentService,
  listUnallocatedPaymentsService,
  /* wallets */
  getStudentWalletService,
  getWalletTransactionsService,
  getStudentStatementService,
  /* refunds */
  listRefundsService,
  requestRefundService,
  approveRefundService,
  rejectRefundService,
  processRefundService,
  /* adjustments */
  listAdjustmentsService,
  createAdjustmentService,
  approveAdjustmentService,
  rejectAdjustmentService,
  /* automation */
  getDefaultersService,
  getAgingSummaryService,
  listRemindersService,
  scheduleRemindersService,
  dispatchRemindersService,
  /* dashboard and reports */
  getFeeDashboardService,
  getCollectionReportService,
  getOutstandingReportService,
  getDiscountReportService,
  getRefundReportService,
  getWalletReportService,
  getLateFeeReportService,
  /* accounting */
  getAccountingStatusService,
  retryAccountingEventsService,
  getAccountOptionsService,
  getJournalTransactionService,
}
