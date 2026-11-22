import { api } from '@src/helpers/api.helpers'

/**
 * Payroll API client.
 *
 * Every function maps to exactly one route of `backend/src/payroll/payroll.routes.ts`
 * (mounted at `/payroll`). Payloads mirror the zod schemas of the backend and
 * responses mirror its services. Money is always sent as a decimal string so the
 * engine can convert it to integer minor units.
 */

type TQuery = { [key: string]: number | string }

const unwrap = <T>(response: { data: Api.Base<T> }) => response.data.data.data

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
 * Filters / payloads (mirror of the backend zod schemas)
 * ------------------------------------------------------------------ */

export interface IPeriodFilters {
  status?: Payroll.PeriodStatus
  fiscal_year?: number
}

export interface ICreatePeriodDto {
  period_key: string
  frequency?: string
  start_date: string
  end_date: string
  cutoff_date?: string | null
  pay_date: string
  payroll_group_id?: number | null
}

export interface IGeneratePeriodsDto {
  year: number
  payroll_group_id?: number | null
  pay_day?: number
}

export interface IRunFilters {
  status?: Payroll.RunStatus
  period_id?: number
  run_type?: Payroll.RunType
}

export interface ICreateRunDto {
  period_id: number
  payroll_group_id?: number | null
  run_type?: Payroll.RunType
}

export interface IRunEmployeeFilters {
  search?: string
  department_id?: number
  status?: Payroll.RunEmployeeStatus
}

export interface IPayslipFilters {
  employee_id?: number
  period_key?: string
  status?: Payroll.PayslipStatus
  run_id?: number
}

export interface IPaymentFilters {
  run_id?: number
  status?: Payroll.PaymentStatus
}

export interface ICreatePaymentDto {
  payment_date: string
  payment_method?: Payroll.PaymentMethod
  cash_account_id: number
  reference_number?: string | null
  cheque_number?: string | null
  notes?: string | null
  idempotency_key?: string | null
  requested?: { run_employee_id: number; amount: string }[]
  run_employee_ids?: number[]
}

export interface IRemittanceFilters {
  code?: Payroll.RemittanceCode
  status?: Payroll.RemittanceStatus
}

export interface ICreateRemittanceDto {
  code: Payroll.RemittanceCode
  period_from: string
  period_to: string
  due_date?: string | null
  amount: string
  cash_account_id?: number | null
}

export interface IReportFilters {
  run_id?: number
  employee_id?: number
  date_from?: string
  date_to?: string
  fiscal_year_start?: string
}

export interface ITransitionDto {
  comment?: string | null
}

export interface ICreateLoanDto {
  employee_id: number
  principal_amount: string
  interest_method?: Payroll.InterestMethod
  interest_rate?: string | null
  instalment_count: number
  start_date: string
  first_deduction_period_key?: string | null
  purpose?: string | null
}

export interface ICreateAdvanceDto {
  employee_id: number
  amount: string
  requested_on: string
  recovery_period_key?: string | null
  reason?: string | null
}

export interface ICreateReimbursementDto {
  employee_id: number
  category: string
  amount: string
  description?: string | null
  asset_ids?: number[]
}

export interface ICreateComponentDto {
  code: string
  name: string
  component_type: Payroll.SalaryComponentType
  calculation_type: Payroll.CalculationType
  formula?: string | null
  percentage?: string | null
  default_amount?: string | null
  is_taxable?: boolean
  is_prorated?: boolean
  show_on_payslip?: boolean
  sequence?: number
  accounting_account_id?: number | null
  statutory_code?: string | null
  effective_from?: string
  effective_to?: string | null
  is_active?: boolean
}

export interface ICreateStructureDto {
  code: string
  name: string
  employment_type?: Payroll.EmploymentType
  grade?: string | null
  currency?: string
  effective_from?: string
  effective_to?: string | null
  status?: Payroll.StructureStatus
  components?: {
    component_id: number
    amount_override?: string | null
    percentage_override?: string | null
    sequence_override?: number | null
    is_mandatory?: boolean
  }[]
}

/* -------------------------------- periods ----------------------------- */

const listPeriodsService = async (
  filters: IPeriodFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IPeriod>>>('get')(
    'payroll/periods',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createPeriodService = async (payload: ICreatePeriodDto) => {
  const res = await api<Api.Base<Payroll.IPeriod>>('post')(
    'payroll/periods',
    undefined,
    payload
  )

  return unwrap(res)
}

const generatePeriodsService = async (payload: IGeneratePeriodsDto) => {
  const res = await api<Api.Base<Payroll.IPeriod[]>>('post')(
    'payroll/periods/generate',
    undefined,
    payload
  )

  return unwrap(res)
}

const updatePeriodStatusService = async (
  periodId: number,
  status: Payroll.PeriodStatus
) => {
  const res = await api<Api.Base<Payroll.IPeriod>>('patch')(
    `payroll/periods/${periodId}/status`,
    undefined,
    { status }
  )

  return unwrap(res)
}

/* --------------------------------- runs ------------------------------- */

const listRunsService = async (
  filters: IRunFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IRun>>>('get')(
    'payroll/runs',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createRunService = async (payload: ICreateRunDto) => {
  const res = await api<Api.Base<Payroll.IRun>>('post')(
    'payroll/runs',
    undefined,
    payload
  )

  return unwrap(res)
}

const getRunService = async (runId: number) => {
  const res = await api<Api.Base<Payroll.IRunDetail>>('get')(
    `payroll/runs/${runId}`
  )

  return unwrap(res)
}

const calculateRunService = async (runId: number) => {
  const res = await api<Api.Base<Payroll.IRunDetail>>('post')(
    `payroll/runs/${runId}/calculate`
  )

  return unwrap(res)
}

const getRunEmployeesService = async (
  runId: number,
  filters: IRunEmployeeFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IRunEmployee>>>(
    'get'
  )(`payroll/runs/${runId}/employees`, {
    ...compact({ ...filters }),
    ...paginate(page, limit ?? 25),
  })

  return unwrap(res)
}

const getRunEmployeeService = async (runId: number, runEmployeeId: number) => {
  const res = await api<Api.Base<Payroll.IRunEmployeeDetail>>('get')(
    `payroll/runs/${runId}/employees/${runEmployeeId}`
  )

  return unwrap(res)
}

const getRunRegisterService = async (runId: number) => {
  const res = await api<Api.Base<Payroll.IRegister>>('get')(
    `payroll/runs/${runId}/register`
  )

  return unwrap(res)
}

/* ------------------------------- workflow ----------------------------- */

type TRunTransition =
  | 'submit'
  | 'verify'
  | 'approve'
  | 'reject'
  | 'authorize-payment'
  | 'close'
  | 'cancel'

const transitionRunService = async (
  runId: number,
  transition: TRunTransition,
  payload: ITransitionDto = {}
) => {
  const res = await api<Api.Base<Payroll.IRunDetail>>('post')(
    `payroll/runs/${runId}/${transition}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const postRunToAccountingService = async (runId: number) => {
  const res = await api<Api.Base<{ run: Payroll.IRun; transaction: unknown }>>(
    'post'
  )(`payroll/runs/${runId}/post-to-accounting`)

  return unwrap(res)
}

/**
 * Hard deletes a run that never became financial history (backend refuses
 * anything with journals, payments, payslips, recoveries or settlements).
 */
const deleteRunService = async (runId: number) => {
  const res = await api<
    Api.Base<{ run_id: number; run_number: string; deleted_employees: number }>
  >('delete')(`payroll/runs/${runId}`)

  return unwrap(res)
}

const resolveExceptionService = async (
  runId: number,
  exceptionId: number,
  payload: { status: Payroll.ExceptionStatus; note?: string | null }
) => {
  const res = await api<Api.Base<Payroll.IException>>('post')(
    `payroll/runs/${runId}/exceptions/${exceptionId}/resolve`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------------- payslips ----------------------------- */

const listPayslipsService = async (
  filters: IPayslipFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IPayslip>>>('get')(
    'payroll/payslips',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getPayslipService = async (payslipId: number) => {
  const res = await api<Api.Base<Payroll.IPayslip>>('get')(
    `payroll/payslips/${payslipId}`
  )

  return unwrap(res)
}

/** The PDF is proxied by the backend, so the browser gets it with the session. */
const downloadPayslipPdfService = async (payslipId: number) => {
  const res = await api<Blob>('get')(
    `payroll/payslips/${payslipId}/pdf`,
    undefined,
    undefined,
    { responseType: 'blob' }
  )

  return res.data
}

const generatePayslipsService = async (runId: number) => {
  const res = await api<Api.Base<{ generated: number; skipped: number }>>(
    'post'
  )(`payroll/runs/${runId}/payslips/generate`)

  return unwrap(res)
}

/** Employee self service: only the payslips of the signed in user. */
const listMyPayslipsService = async (page?: number, limit?: number) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IPayslip>>>('get')(
    'payroll/me/payslips',
    paginate(page, limit)
  )

  return unwrap(res)
}

const downloadMyPayslipPdfService = async (payslipId: number) => {
  const res = await api<Blob>('get')(
    `payroll/me/payslips/${payslipId}/pdf`,
    undefined,
    undefined,
    { responseType: 'blob' }
  )

  return res.data
}

/* --------------------------- salary payments -------------------------- */

const listPaymentsService = async (
  filters: IPaymentFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IPayment>>>('get')(
    'payroll/payments',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getPaymentService = async (paymentId: number) => {
  const res = await api<Api.Base<Payroll.IPayment>>('get')(
    `payroll/payments/${paymentId}`
  )

  return unwrap(res)
}

const createPaymentService = async (
  runId: number,
  payload: ICreatePaymentDto
) => {
  const res = await api<Api.Base<Payroll.IPayment>>('post')(
    `payroll/runs/${runId}/payments`,
    undefined,
    payload
  )

  return unwrap(res)
}

const completePaymentService = async (paymentId: number) => {
  const res = await api<
    Api.Base<{ payment: Payroll.IPayment; transaction: unknown }>
  >('post')(`payroll/payments/${paymentId}/complete`)

  return unwrap(res)
}

const cancelPaymentService = async (
  paymentId: number,
  payload: { reason?: string | null } = {}
) => {
  const res = await api<Api.Base<Payroll.IPayment>>('post')(
    `payroll/payments/${paymentId}/cancel`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------- statutory remittances ---------------------- */

const listRemittancesService = async (
  filters: IRemittanceFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IRemittance>>>(
    'get'
  )('payroll/remittances', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const createRemittanceService = async (payload: ICreateRemittanceDto) => {
  const res = await api<Api.Base<Payroll.IRemittance>>('post')(
    'payroll/remittances',
    undefined,
    payload
  )

  return unwrap(res)
}

const payRemittanceService = async (
  remittanceId: number,
  payload: {
    payment_date: string
    payment_reference?: string | null
    cash_account_id?: number | null
  }
) => {
  const res = await api<Api.Base<{ remittance: Payroll.IRemittance }>>('post')(
    `payroll/remittances/${remittanceId}/pay`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------------- documents ---------------------------- */

const listLoansService = async (
  filters: { employee_id?: number; status?: Payroll.LoanStatus } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.ILoan>>>('get')(
    'payroll/loans',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getLoanService = async (loanId: number) => {
  const res = await api<Api.Base<Payroll.ILoan>>('get')(
    `payroll/loans/${loanId}`
  )

  return unwrap(res)
}

const approveLoanService = async (loanId: number) => {
  const res = await api<Api.Base<Payroll.ILoan>>('post')(
    `payroll/loans/${loanId}/approve`
  )

  return unwrap(res)
}

const createLoanService = async (payload: {
  employee_id: number
  principal_amount: string
  interest_method?: Payroll.InterestMethod
  interest_rate?: string | null
  instalment_count: number
  start_date: string
  first_deduction_period_key?: string | null
  purpose?: string | null
}) => {
  const res = await api<Api.Base<Payroll.ILoan>>('post')(
    'payroll/loans',
    undefined,
    payload
  )

  return unwrap(res)
}

const rejectLoanService = async (loanId: number, reason?: string | null) => {
  const res = await api<Api.Base<Payroll.ILoan>>('post')(
    `payroll/loans/${loanId}/reject`,
    undefined,
    { reason }
  )

  return unwrap(res)
}

const disburseLoanService = async (
  loanId: number,
  payload: {
    cash_account_id: number
    transaction_date: string
    reference_number?: string | null
  }
) => {
  const res = await api<Api.Base<{ loan: Payroll.ILoan }>>('post')(
    `payroll/loans/${loanId}/disburse`,
    undefined,
    payload
  )

  return unwrap(res)
}

const closeLoanService = async (
  loanId: number,
  payload: { write_off?: boolean; reason?: string | null } = {}
) => {
  const res = await api<Api.Base<{ loan: Payroll.ILoan }>>('post')(
    `payroll/loans/${loanId}/close`,
    undefined,
    payload
  )

  return unwrap(res)
}

const createAdvanceService = async (payload: {
  employee_id: number
  amount: string
  requested_on: string
  recovery_period_key?: string | null
  reason?: string | null
}) => {
  const res = await api<Api.Base<Payroll.IAdvance>>('post')(
    'payroll/advances',
    undefined,
    payload
  )

  return unwrap(res)
}

const listAdvancesService = async (
  filters: { employee_id?: number; status?: Payroll.AdvanceStatus } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IAdvance>>>('get')(
    'payroll/advances',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const decideAdvanceService = async (
  advanceId: number,
  payload: { decision: 'APPROVE' | 'REJECT'; reason?: string | null }
) => {
  const res = await api<Api.Base<Payroll.IAdvance>>('post')(
    `payroll/advances/${advanceId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

const createReimbursementService = async (payload: {
  employee_id: number
  category: string
  amount: string
  description?: string | null
  asset_ids?: number[]
}) => {
  const res = await api<Api.Base<Payroll.IReimbursement>>('post')(
    'payroll/reimbursements',
    undefined,
    payload
  )

  return unwrap(res)
}

const getReimbursementService = async (claimId: number) => {
  const res = await api<Api.Base<Payroll.IReimbursement>>('get')(
    `payroll/reimbursements/${claimId}`
  )

  return unwrap(res)
}

const listReimbursementsService = async (
  filters: {
    employee_id?: number
    status?: Payroll.ReimbursementStatus
    category?: string
  } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IReimbursement>>>(
    'get'
  )('payroll/reimbursements', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const transitionReimbursementService = async (
  claimId: number,
  transition: 'verify' | 'review' | 'approve' | 'reject',
  payload: { reason?: string | null } = {}
) => {
  const res = await api<Api.Base<Payroll.IReimbursement>>('post')(
    `payroll/reimbursements/${claimId}/${transition}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const payReimbursementService = async (
  claimId: number,
  payload: {
    cash_account_id: number
    payment_date: string
    reference_number?: string | null
  }
) => {
  const res = await api<Api.Base<{ reimbursement: Payroll.IReimbursement }>>(
    'post'
  )(`payroll/reimbursements/${claimId}/pay`, undefined, payload)

  return unwrap(res)
}

const listAdjustmentsService = async (
  filters: {
    employee_id?: number
    status?: Payroll.AdjustmentStatus
    type?: Payroll.AdjustmentType
  } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IAdjustment>>>(
    'get'
  )('payroll/adjustments', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const decideAdjustmentService = async (
  adjustmentId: number,
  payload: { decision: 'APPROVE' | 'REJECT'; note?: string | null }
) => {
  const res = await api<Api.Base<Payroll.IAdjustment>>('post')(
    `payroll/adjustments/${adjustmentId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

const createArrearsService = async (revisionId: number) => {
  const res = await api<Api.Base<Payroll.IAdjustment>>('post')(
    `payroll/revisions/${revisionId}/arrears`
  )

  return unwrap(res)
}

/* --------------------------- payroll profiles -------------------------- */

export interface IProfileFilters {
  department_id?: number
  employment_type?: Payroll.EmploymentType
  is_payroll_eligible?: boolean
  payroll_status?: Payroll.PayrollProfileStatus
  search?: string
}

export interface IUpsertProfileDto {
  department_id?: number | null
  employment_type?: Payroll.EmploymentType
  payroll_group_id?: number | null
  salary_structure_id?: number | null
  pay_frequency?: Payroll.Frequency
  payment_method?: Payroll.PaymentMethod
  tax_status?: string | null
  marital_status?: string | null
  pan_number?: string | null
  ssf_number?: string | null
  pf_number?: string | null
  is_payroll_eligible?: boolean
  payroll_status?: Payroll.PayrollProfileStatus
  effective_from?: string
  termination_date?: string | null
  last_working_day?: string | null
}

export interface IPaymentDetailsDto {
  payment_method?: Payroll.PaymentMethod
  bank_name?: string | null
  bank_account_number?: string | null
  branch_code?: string | null
  note?: string | null
}

export interface ICreateAssignmentDto {
  employee_id: number
  salary_structure_id: number
  base_amount: string
  ctc_amount?: string | null
  effective_from: string
  effective_to?: string | null
  reason?: string | null
}

export interface ICreateRevisionDto {
  employee_id: number
  assignment_id?: number
  new_amount?: string
  increment_type?: Payroll.IncrementType
  increment_value?: string
  effective_date: string
  reason?: string | null
}

const listProfilesService = async (
  filters: IProfileFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IProfileListItem>>>(
    'get'
  )('payroll/employees', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const listUnprofiledEmployeesService = async (
  filters: { search?: string } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<
    Api.Base<Payroll.IPaginated<Payroll.IUnprofiledEmployee>>
  >('get')('payroll/employees/unprofiled', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const getProfileService = async (employeeId: number) => {
  const res = await api<Api.Base<Payroll.IProfileDetail>>('get')(
    `payroll/employees/${employeeId}/profile`
  )

  return unwrap(res)
}

const upsertProfileService = async (
  employeeId: number,
  payload: IUpsertProfileDto
) => {
  const res = await api<Api.Base<Payroll.IPayrollProfile>>('put')(
    `payroll/employees/${employeeId}/profile`,
    undefined,
    payload
  )

  return unwrap(res)
}

const updatePaymentDetailsService = async (
  employeeId: number,
  payload: IPaymentDetailsDto
) => {
  const res = await api<Api.Base<Payroll.IPayrollProfile>>('patch')(
    `payroll/employees/${employeeId}/payment-details`,
    undefined,
    payload
  )

  return unwrap(res)
}

const listAssignmentsService = async (employeeId: number) => {
  const res = await api<Api.Base<{ assignments: Payroll.ISalaryAssignment[] }>>(
    'get'
  )(`payroll/employees/${employeeId}/assignments`)

  return unwrap(res).assignments
}

const createAssignmentService = async (payload: ICreateAssignmentDto) => {
  const res = await api<Api.Base<Payroll.ISalaryAssignment>>('post')(
    'payroll/assignments',
    undefined,
    payload
  )

  return unwrap(res)
}

const listRevisionsService = async (
  filters: { employee_id?: number; status?: Payroll.RevisionStatus } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.ISalaryRevision>>>(
    'get'
  )('payroll/revisions', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const createRevisionService = async (payload: ICreateRevisionDto) => {
  const res = await api<Api.Base<Payroll.ISalaryRevision>>('post')(
    'payroll/revisions',
    undefined,
    payload
  )

  return unwrap(res)
}

const decideRevisionService = async (
  revisionId: number,
  payload: { decision: 'APPROVE' | 'REJECT'; comment?: string | null }
) => {
  const res = await api<Api.Base<Payroll.ISalaryRevision>>('post')(
    `payroll/revisions/${revisionId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

const previewArrearsService = async (revisionId: number) => {
  const res = await api<Api.Base<Payroll.IArrearsPreview>>('get')(
    `payroll/revisions/${revisionId}/arrears`
  )

  return unwrap(res)
}

/* ------------------------------ configuration -------------------------- */

const getSettingsService = async () => {
  const res = await api<Api.Base<Payroll.ISettings>>('get')('payroll/settings')

  return unwrap(res)
}

/**
 * Creates the payroll defaults of the school (chart of accounts, components,
 * `DEFAULT` structure, policy v1, accounting mapping, statutory placeholders,
 * leave types). Idempotent: an already provisioned school receives no change.
 */
const provisionPayrollService = async () => {
  const res = await api<Api.Base<Payroll.IProvisioningSummary>>('post')(
    'payroll/settings/provision'
  )

  return unwrap(res)
}

const createPolicyVersionService = async (payload: {
  effective_from?: string
  policy: Partial<Payroll.IPolicy>
}) => {
  const res = await api<Api.Base<Payroll.IPolicyVersion>>('post')(
    'payroll/settings',
    undefined,
    payload
  )

  return unwrap(res)
}

const listComponentsService = async (
  filters: {
    component_type?: Payroll.SalaryComponentType
    is_active?: boolean
    search?: string
  } = {}
) => {
  const res = await api<Api.Base<{ components: Payroll.IComponent[] }>>('get')(
    'payroll/components',
    compact({ ...filters })
  )

  return unwrap(res).components
}

const getComponentService = async (componentId: number) => {
  const res = await api<Api.Base<Payroll.IComponent>>('get')(
    `payroll/components/${componentId}`
  )

  return unwrap(res)
}

const createComponentService = async (payload: ICreateComponentDto) => {
  const res = await api<Api.Base<Payroll.IComponent>>('post')(
    'payroll/components',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateComponentService = async (
  componentId: number,
  payload: Partial<Omit<ICreateComponentDto, 'code'>>
) => {
  const res = await api<Api.Base<Payroll.IComponent>>('patch')(
    `payroll/components/${componentId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const deactivateComponentService = async (componentId: number) => {
  const res = await api<Api.Base<Payroll.IComponent>>('delete')(
    `payroll/components/${componentId}`
  )

  return unwrap(res)
}

const listStructuresService = async () => {
  const res =
    await api<Api.Base<{ structures: Payroll.IStructure[] }>>('get')(
      'payroll/structures'
    )

  return unwrap(res).structures
}

const getStructureService = async (structureId: number) => {
  const res = await api<Api.Base<Payroll.IStructureDetail>>('get')(
    `payroll/structures/${structureId}`
  )

  return unwrap(res)
}

const createStructureService = async (payload: ICreateStructureDto) => {
  const res = await api<Api.Base<Payroll.IStructureDetail>>('post')(
    'payroll/structures',
    undefined,
    payload
  )

  return unwrap(res)
}

const deactivateStructureService = async (structureId: number) => {
  const res = await api<Api.Base<Payroll.IStructure>>('delete')(
    `payroll/structures/${structureId}`
  )

  return unwrap(res)
}

export type IUpdateStructureDto = Omit<ICreateStructureDto, 'code'>

const updateStructureService = async (
  structureId: number,
  payload: IUpdateStructureDto
) => {
  const res = await api<Api.Base<Payroll.IStructureDetail>>('patch')(
    `payroll/structures/${structureId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const activateStructureService = async (structureId: number) => {
  const res = await api<Api.Base<Payroll.IStructure>>('post')(
    `payroll/structures/${structureId}/activate`
  )

  return unwrap(res)
}

const getMappingsService = async () => {
  const res = await api<Api.Base<Payroll.IMappings>>('get')(
    'payroll/accounting/mappings'
  )

  return unwrap(res)
}

const upsertMappingService = async (payload: {
  mapping_key: Payroll.MappingKey
  account_id: number
}) => {
  const res = await api<Api.Base<Payroll.IMapping>>('put')(
    'payroll/accounting/mappings',
    undefined,
    payload
  )

  return unwrap(res)
}

/* ---------------------------- leave & overtime ------------------------- */

export interface ICreateLeaveDto {
  employee_id: number
  leave_type_id: number
  from_date: string
  to_date: string
  days?: number
  reason?: string | null
}

export interface ICreateOvertimeDto {
  employee_id: number
  work_date: string
  hours: number
  rate_multiplier?: string | null
  note?: string | null
}

export interface IDecideAttendanceDto {
  decision: 'APPROVE' | 'REJECT'
  comment?: string | null
}

const listLeaveTypesService = async () => {
  const res = await api<Api.Base<{ leaveTypes: Payroll.ILeaveType[] }>>('get')(
    'payroll/leave-types'
  )

  return unwrap(res).leaveTypes
}

const listLeaveRequestsService = async (
  filters: {
    employee_id?: number
    leave_type_id?: number
    status?: Payroll.LeaveRequestStatus
    date_from?: string
    date_to?: string
  } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.ILeaveRequest>>>(
    'get'
  )('payroll/leave-requests', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const createLeaveRequestService = async (payload: ICreateLeaveDto) => {
  const res = await api<Api.Base<Payroll.ILeaveRequest>>('post')(
    'payroll/leave-requests',
    undefined,
    payload
  )

  return unwrap(res)
}

const decideLeaveRequestService = async (
  requestId: number,
  payload: IDecideAttendanceDto
) => {
  const res = await api<Api.Base<Payroll.ILeaveRequest>>('post')(
    `payroll/leave-requests/${requestId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

const listOvertimeService = async (
  filters: {
    employee_id?: number
    status?: Payroll.OvertimeStatus
    date_from?: string
    date_to?: string
  } = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IOvertimeEntry>>>(
    'get'
  )('payroll/overtime', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const createOvertimeService = async (payload: ICreateOvertimeDto) => {
  const res = await api<Api.Base<Payroll.IOvertimeEntry>>('post')(
    'payroll/overtime',
    undefined,
    payload
  )

  return unwrap(res)
}

const decideOvertimeService = async (
  overtimeId: number,
  payload: IDecideAttendanceDto
) => {
  const res = await api<Api.Base<Payroll.IOvertimeEntry>>('post')(
    `payroll/overtime/${overtimeId}/decision`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* --------------------------- final settlement -------------------------- */

export interface ISettlementFilters {
  employee_id?: number
  status?: Payroll.SettlementStatus
}

export interface ICreateSettlementDto {
  employee_id: number
  termination_date: string
  last_working_day?: string | null
  leave_days_encashed?: number
  note?: string | null
}

export interface IPaySettlementDto {
  cash_account_id: number
  payment_date: string
  reference_number?: string | null
}

const listSettlementsService = async (
  filters: ISettlementFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IFinalSettlement>>>(
    'get'
  )('payroll/settlements', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const createSettlementService = async (payload: ICreateSettlementDto) => {
  const res = await api<Api.Base<Payroll.IFinalSettlement>>('post')(
    'payroll/settlements',
    undefined,
    payload
  )

  return unwrap(res)
}

const approveSettlementService = async (settlementId: number) => {
  const res = await api<Api.Base<Payroll.IFinalSettlement>>('post')(
    `payroll/settlements/${settlementId}/approve`
  )

  return unwrap(res)
}

const cancelSettlementService = async (
  settlementId: number,
  reason?: string | null
) => {
  const res = await api<Api.Base<Payroll.IFinalSettlement>>('post')(
    `payroll/settlements/${settlementId}/cancel`,
    undefined,
    { reason }
  )

  return unwrap(res)
}

const paySettlementService = async (
  settlementId: number,
  payload: IPaySettlementDto
) => {
  const res = await api<Api.Base<{ settlement: Payroll.IFinalSettlement }>>(
    'post'
  )(`payroll/settlements/${settlementId}/pay`, undefined, payload)

  return unwrap(res)
}

/* --------------------------- audit & operations ------------------------ */

export interface IAuditFilters {
  action?: string
  entity_type?: string
  date_from?: string
  date_to?: string
}

export interface IAccountingStatusFilters {
  document_type?: string
  status?: string
}

export interface IGroupDto {
  name: string
  frequency?: Payroll.Frequency
  default_structure_id?: number | null
  is_active?: boolean
}

const listAuditLogsService = async (
  filters: IAuditFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IPaginated<Payroll.IAuditLog>>>('get')(
    'payroll/audit-logs',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const getAccountingStatusService = async (
  filters: IAccountingStatusFilters = {},
  page?: number,
  limit?: number
) => {
  const res = await api<Api.Base<Payroll.IAccountingStatus>>('get')(
    'payroll/accounting/status',
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const retryAccountingService = async (runId: number) => {
  const res = await api<Api.Base<unknown>>('post')(
    'payroll/accounting/retry',
    undefined,
    { run_id: runId }
  )

  return unwrap(res)
}

const listGroupsService = async () => {
  const res =
    await api<Api.Base<{ groups: Payroll.IPayrollGroup[] }>>('get')(
      'payroll/groups'
    )

  return unwrap(res).groups
}

const createGroupService = async (payload: IGroupDto) => {
  const res = await api<Api.Base<Payroll.IPayrollGroup>>('post')(
    'payroll/groups',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateGroupService = async (
  groupId: number,
  payload: Partial<IGroupDto>
) => {
  const res = await api<Api.Base<Payroll.IPayrollGroup>>('patch')(
    `payroll/groups/${groupId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

const deactivateGroupService = async (groupId: number) => {
  const res = await api<Api.Base<Payroll.IPayrollGroup>>('delete')(
    `payroll/groups/${groupId}`
  )

  return unwrap(res)
}

/* -------------------------------- reports ----------------------------- */

const getDashboardService = async () => {
  const res = await api<Api.Base<Payroll.IDashboard>>('get')(
    'payroll/reports/dashboard'
  )

  return unwrap(res)
}

const getDepartmentExpenseService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<{ rows: Payroll.IDepartmentExpenseRow[] }>>(
    'get'
  )('payroll/reports/department-expense', compact({ ...filters }))

  return unwrap(res).rows
}

const getComponentBreakdownService = async (runId: number) => {
  const res = await api<
    Api.Base<{
      earnings: Payroll.IComponentBreakdownRow[]
      deductions: Payroll.IComponentBreakdownRow[]
      employer_contributions: Payroll.IComponentBreakdownRow[]
    }>
  >('get')('payroll/reports/earnings-deductions', compact({ run_id: runId }))

  return unwrap(res)
}

const getStatutoryReportService = async (runId: number) => {
  const res = await api<Api.Base<Payroll.IStatutoryReport>>('get')(
    'payroll/reports/statutory',
    compact({ run_id: runId })
  )

  return unwrap(res)
}

const getYtdReportService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<Payroll.IYtdReport>>('get')(
    'payroll/reports/ytd',
    compact({ ...filters })
  )

  return unwrap(res)
}

const getOutstandingSalaryService = async () => {
  const res = await api<Api.Base<Payroll.IOutstandingSalary>>('get')(
    'payroll/reports/outstanding'
  )

  return unwrap(res)
}

const getPaymentHistoryService = async (filters: IReportFilters = {}) => {
  const res = await api<Api.Base<{ rows: Payroll.IPaymentHistoryRow[] }>>(
    'get'
  )('payroll/reports/payments', compact({ ...filters }))

  return unwrap(res).rows
}

const getReconciliationService = async () => {
  const res = await api<Api.Base<Payroll.IReconciliation>>('get')(
    'payroll/reports/reconciliation'
  )

  return unwrap(res)
}

export const payrollServices = {
  /* periods */
  listPeriodsService,
  createPeriodService,
  generatePeriodsService,
  updatePeriodStatusService,
  /* runs */
  listRunsService,
  createRunService,
  getRunService,
  calculateRunService,
  getRunEmployeesService,
  getRunEmployeeService,
  getRunRegisterService,
  transitionRunService,
  deleteRunService,
  postRunToAccountingService,
  resolveExceptionService,
  /* payslips */
  listPayslipsService,
  getPayslipService,
  downloadPayslipPdfService,
  generatePayslipsService,
  listMyPayslipsService,
  downloadMyPayslipPdfService,
  /* payments */
  listPaymentsService,
  getPaymentService,
  createPaymentService,
  completePaymentService,
  cancelPaymentService,
  /* remittances */
  listRemittancesService,
  createRemittanceService,
  payRemittanceService,
  /* documents */
  listLoansService,
  getLoanService,
  createLoanService,
  approveLoanService,
  rejectLoanService,
  disburseLoanService,
  closeLoanService,
  listAdvancesService,
  createAdvanceService,
  decideAdvanceService,
  listReimbursementsService,
  createReimbursementService,
  getReimbursementService,
  transitionReimbursementService,
  payReimbursementService,
  listAdjustmentsService,
  decideAdjustmentService,
  createArrearsService,
  /* payroll profiles */
  listProfilesService,
  listUnprofiledEmployeesService,
  getProfileService,
  upsertProfileService,
  updatePaymentDetailsService,
  listAssignmentsService,
  createAssignmentService,
  listRevisionsService,
  createRevisionService,
  decideRevisionService,
  previewArrearsService,
  /* configuration */
  getSettingsService,
  provisionPayrollService,
  createPolicyVersionService,
  listComponentsService,
  getComponentService,
  createComponentService,
  updateComponentService,
  deactivateComponentService,
  listStructuresService,
  getStructureService,
  createStructureService,
  updateStructureService,
  deactivateStructureService,
  activateStructureService,
  getMappingsService,
  upsertMappingService,
  /* leave & overtime */
  listLeaveTypesService,
  listLeaveRequestsService,
  createLeaveRequestService,
  decideLeaveRequestService,
  listOvertimeService,
  createOvertimeService,
  decideOvertimeService,
  /* final settlement */
  listSettlementsService,
  createSettlementService,
  approveSettlementService,
  cancelSettlementService,
  paySettlementService,
  /* audit & operations */
  listAuditLogsService,
  getAccountingStatusService,
  retryAccountingService,
  listGroupsService,
  createGroupService,
  updateGroupService,
  deactivateGroupService,
  /* reports */
  getDashboardService,
  getDepartmentExpenseService,
  getComponentBreakdownService,
  getStatutoryReportService,
  getYtdReportService,
  getOutstandingSalaryService,
  getPaymentHistoryService,
  getReconciliationService,
}
