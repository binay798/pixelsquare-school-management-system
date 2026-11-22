import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  payrollServices,
  IAccountingStatusFilters,
  IAuditFilters,
  ICreateAssignmentDto,
  ICreateAdvanceDto,
  ICreateComponentDto,
  ICreateLeaveDto,
  ICreateLoanDto,
  ICreateOvertimeDto,
  ICreatePeriodDto,
  ICreatePaymentDto,
  ICreateReimbursementDto,
  ICreateRevisionDto,
  ICreateRunDto,
  ICreateSettlementDto,
  ICreateStructureDto,
  IUpdateStructureDto,
  IDecideAttendanceDto,
  IGeneratePeriodsDto,
  IGroupDto,
  IPaymentDetailsDto,
  IPaySettlementDto,
  IProfileFilters,
  ISettlementFilters,
  IUpsertProfileDto,
  IPaymentFilters,
  IPayslipFilters,
  IPeriodFilters,
  IRemittanceFilters,
  IReportFilters,
  IRunEmployeeFilters,
  IRunFilters,
} from './payroll.service'

interface InitialState {
  dashboard: { data: Payroll.IDashboard | null; loading: boolean }
  periods: {
    data: Payroll.IPaginated<Payroll.IPeriod> | null
    loading: boolean
  }
  runs: { data: Payroll.IPaginated<Payroll.IRun> | null; loading: boolean }
  runDetail: { data: Payroll.IRunDetail | null; loading: boolean }
  runEmployees: {
    data: Payroll.IPaginated<Payroll.IRunEmployee> | null
    loading: boolean
  }
  runEmployee: { data: Payroll.IRunEmployeeDetail | null; loading: boolean }
  register: { data: Payroll.IRegister | null; loading: boolean }
  payslips: {
    data: Payroll.IPaginated<Payroll.IPayslip> | null
    loading: boolean
  }
  myPayslips: {
    data: Payroll.IPaginated<Payroll.IPayslip> | null
    loading: boolean
  }
  payments: {
    data: Payroll.IPaginated<Payroll.IPayment> | null
    loading: boolean
  }
  remittances: {
    data: Payroll.IPaginated<Payroll.IRemittance> | null
    loading: boolean
  }
  loans: { data: Payroll.IPaginated<Payroll.ILoan> | null; loading: boolean }
  advances: {
    data: Payroll.IPaginated<Payroll.IAdvance> | null
    loading: boolean
  }
  reimbursements: {
    data: Payroll.IPaginated<Payroll.IReimbursement> | null
    loading: boolean
  }
  adjustments: {
    data: Payroll.IPaginated<Payroll.IAdjustment> | null
    loading: boolean
  }
  departmentExpense: {
    data: Payroll.IDepartmentExpenseRow[] | null
    loading: boolean
  }
  ytd: { data: Payroll.IYtdReport | null; loading: boolean }
  outstanding: {
    data: Payroll.IOutstandingSalary | null
    loading: boolean
  }
  reconciliation: {
    data: Payroll.IReconciliation | null
    loading: boolean
  }
  statutory: { data: Payroll.IStatutoryReport | null; loading: boolean }
  components: {
    data: {
      earnings: Payroll.IComponentBreakdownRow[]
      deductions: Payroll.IComponentBreakdownRow[]
      employer_contributions: Payroll.IComponentBreakdownRow[]
    } | null
    loading: boolean
  }
  settings: { data: Payroll.ISettings | null; loading: boolean }
  salaryComponents: { data: Payroll.IComponent[] | null; loading: boolean }
  structures: { data: Payroll.IStructure[] | null; loading: boolean }
  mappings: { data: Payroll.IMappings | null; loading: boolean }
  profiles: {
    data: Payroll.IPaginated<Payroll.IProfileListItem> | null
    loading: boolean
  }
  auditLogs: {
    data: Payroll.IPaginated<Payroll.IAuditLog> | null
    loading: boolean
  }
  accountingStatus: {
    data: Payroll.IAccountingStatus | null
    loading: boolean
  }
  groups: { data: Payroll.IPayrollGroup[] | null; loading: boolean }
  settlements: {
    data: Payroll.IPaginated<Payroll.IFinalSettlement> | null
    loading: boolean
  }
  leaveTypes: { data: Payroll.ILeaveType[] | null; loading: boolean }
  leaveRequests: {
    data: Payroll.IPaginated<Payroll.ILeaveRequest> | null
    loading: boolean
  }
  overtime: {
    data: Payroll.IPaginated<Payroll.IOvertimeEntry> | null
    loading: boolean
  }
  profileDetail: { data: Payroll.IProfileDetail | null; loading: boolean }
  revisions: {
    data: Payroll.IPaginated<Payroll.ISalaryRevision> | null
    loading: boolean
  }
  arrearsPreview: { data: Payroll.IArrearsPreview | null; loading: boolean }
  mutation: { loading: boolean }
}

const initialState: InitialState = {
  dashboard: { data: null, loading: false },
  periods: { data: null, loading: false },
  runs: { data: null, loading: false },
  runDetail: { data: null, loading: false },
  runEmployees: { data: null, loading: false },
  runEmployee: { data: null, loading: false },
  register: { data: null, loading: false },
  payslips: { data: null, loading: false },
  myPayslips: { data: null, loading: false },
  payments: { data: null, loading: false },
  remittances: { data: null, loading: false },
  loans: { data: null, loading: false },
  advances: { data: null, loading: false },
  reimbursements: { data: null, loading: false },
  adjustments: { data: null, loading: false },
  departmentExpense: { data: null, loading: false },
  ytd: { data: null, loading: false },
  outstanding: { data: null, loading: false },
  reconciliation: { data: null, loading: false },
  statutory: { data: null, loading: false },
  components: { data: null, loading: false },
  settings: { data: null, loading: false },
  salaryComponents: { data: null, loading: false },
  structures: { data: null, loading: false },
  mappings: { data: null, loading: false },
  profiles: { data: null, loading: false },
  auditLogs: { data: null, loading: false },
  accountingStatus: { data: null, loading: false },
  groups: { data: null, loading: false },
  settlements: { data: null, loading: false },
  leaveTypes: { data: null, loading: false },
  leaveRequests: { data: null, loading: false },
  overtime: { data: null, loading: false },
  profileDetail: { data: null, loading: false },
  revisions: { data: null, loading: false },
  arrearsPreview: { data: null, loading: false },
  mutation: { loading: false },
}

type TListRequest<F> = { filters?: F; page?: number; limit?: number }

/* -------------------------------- loaders ----------------------------- */

export const getPayrollDashboardAction = createAsyncThunk<
  Payroll.IDashboard,
  void
>(
  'payroll/getDashboard',
  catchAsync<Payroll.IDashboard, void>(
    async () => await payrollServices.getDashboardService()
  )
)

export const getPeriodsAction = createAsyncThunk(
  'payroll/getPeriods',
  catchAsync(async (data: TListRequest<IPeriodFilters>) =>
    payrollServices.listPeriodsService(data?.filters, data?.page, data?.limit)
  )
)

export const getRunsAction = createAsyncThunk(
  'payroll/getRuns',
  catchAsync(async (data: TListRequest<IRunFilters>) =>
    payrollServices.listRunsService(data?.filters, data?.page, data?.limit)
  )
)

export const getRunDetailAction = createAsyncThunk(
  'payroll/getRunDetail',
  catchAsync(async (runId: number) => payrollServices.getRunService(runId))
)

export const getRunEmployeesAction = createAsyncThunk(
  'payroll/getRunEmployees',
  catchAsync(
    async (data: { runId: number } & TListRequest<IRunEmployeeFilters>) =>
      payrollServices.getRunEmployeesService(
        data.runId,
        data.filters,
        data.page,
        data.limit
      )
  )
)

export const getRunEmployeeAction = createAsyncThunk(
  'payroll/getRunEmployee',
  catchAsync(async (data: { runId: number; runEmployeeId: number }) =>
    payrollServices.getRunEmployeeService(data.runId, data.runEmployeeId)
  )
)

export const getRunRegisterAction = createAsyncThunk(
  'payroll/getRunRegister',
  catchAsync(async (runId: number) =>
    payrollServices.getRunRegisterService(runId)
  )
)

export const getPayslipsAction = createAsyncThunk(
  'payroll/getPayslips',
  catchAsync(async (data: TListRequest<IPayslipFilters>) =>
    payrollServices.listPayslipsService(data?.filters, data?.page, data?.limit)
  )
)

export const getMyPayslipsAction = createAsyncThunk(
  'payroll/getMyPayslips',
  catchAsync(async (data: { page?: number; limit?: number }) =>
    payrollServices.listMyPayslipsService(data?.page, data?.limit)
  )
)

export const getPaymentsAction = createAsyncThunk(
  'payroll/getPayments',
  catchAsync(async (data: TListRequest<IPaymentFilters>) =>
    payrollServices.listPaymentsService(data?.filters, data?.page, data?.limit)
  )
)

export const getRemittancesAction = createAsyncThunk(
  'payroll/getRemittances',
  catchAsync(async (data: TListRequest<IRemittanceFilters>) =>
    payrollServices.listRemittancesService(
      data?.filters,
      data?.page,
      data?.limit
    )
  )
)

export const getLoansAction = createAsyncThunk(
  'payroll/getLoans',
  catchAsync(
    async (
      data: TListRequest<{ employee_id?: number; status?: Payroll.LoanStatus }>
    ) =>
      payrollServices.listLoansService(data?.filters, data?.page, data?.limit)
  )
)

export const getAdvancesAction = createAsyncThunk(
  'payroll/getAdvances',
  catchAsync(
    async (
      data: TListRequest<{
        employee_id?: number
        status?: Payroll.AdvanceStatus
      }>
    ) =>
      payrollServices.listAdvancesService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getReimbursementsAction = createAsyncThunk(
  'payroll/getReimbursements',
  catchAsync(
    async (
      data: TListRequest<{
        employee_id?: number
        status?: Payroll.ReimbursementStatus
        category?: string
      }>
    ) =>
      payrollServices.listReimbursementsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getAdjustmentsAction = createAsyncThunk(
  'payroll/getAdjustments',
  catchAsync(
    async (
      data: TListRequest<{
        employee_id?: number
        status?: Payroll.AdjustmentStatus
        type?: Payroll.AdjustmentType
      }>
    ) =>
      payrollServices.listAdjustmentsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getDepartmentExpenseAction = createAsyncThunk(
  'payroll/getDepartmentExpense',
  catchAsync(async (filters: IReportFilters) =>
    payrollServices.getDepartmentExpenseService(filters)
  )
)

export const getYtdAction = createAsyncThunk(
  'payroll/getYtd',
  catchAsync(async (filters: IReportFilters) =>
    payrollServices.getYtdReportService(filters)
  )
)

export const getOutstandingAction = createAsyncThunk<
  Payroll.IOutstandingSalary,
  void
>(
  'payroll/getOutstanding',
  catchAsync<Payroll.IOutstandingSalary, void>(async () =>
    payrollServices.getOutstandingSalaryService()
  )
)

export const getReconciliationAction = createAsyncThunk<
  Payroll.IReconciliation,
  void
>(
  'payroll/getReconciliation',
  catchAsync<Payroll.IReconciliation, void>(async () =>
    payrollServices.getReconciliationService()
  )
)

export const getStatutoryAction = createAsyncThunk(
  'payroll/getStatutory',
  catchAsync(async (runId: number) =>
    payrollServices.getStatutoryReportService(runId)
  )
)

export const getComponentBreakdownAction = createAsyncThunk(
  'payroll/getComponents',
  catchAsync(async (runId: number) =>
    payrollServices.getComponentBreakdownService(runId)
  )
)

/* ------------------------------- mutations ----------------------------- */

export const generatePeriodsAction = createAsyncThunk(
  'payroll/generatePeriods',
  catchAsync(
    async (payload: IGeneratePeriodsDto) =>
      payrollServices.generatePeriodsService(payload),
    true,
    false,
    'Payroll periods generated'
  )
)

export const updatePeriodStatusAction = createAsyncThunk(
  'payroll/updatePeriodStatus',
  catchAsync(
    async (payload: { periodId: number; status: Payroll.PeriodStatus }) =>
      payrollServices.updatePeriodStatusService(
        payload.periodId,
        payload.status
      ),
    true,
    false,
    'Period updated'
  )
)

export const createPeriodAction = createAsyncThunk(
  'payroll/createPeriod',
  catchAsync(
    async (payload: ICreatePeriodDto) =>
      payrollServices.createPeriodService(payload),
    true,
    false,
    'Payroll period created'
  )
)

export const createRunAction = createAsyncThunk(
  'payroll/createRun',
  catchAsync(
    async (payload: ICreateRunDto) => payrollServices.createRunService(payload),
    true,
    false,
    'Payroll run created'
  )
)

export const calculateRunAction = createAsyncThunk(
  'payroll/calculateRun',
  catchAsync(
    async (runId: number) => payrollServices.calculateRunService(runId),
    true,
    false,
    'Payroll calculated'
  )
)

export const transitionRunAction = createAsyncThunk(
  'payroll/transitionRun',
  catchAsync(
    async (payload: {
      runId: number
      transition:
        | 'submit'
        | 'verify'
        | 'approve'
        | 'reject'
        | 'authorize-payment'
        | 'close'
        | 'cancel'
      comment?: string | null
    }) =>
      payrollServices.transitionRunService(payload.runId, payload.transition, {
        comment: payload.comment,
      }),
    true,
    false,
    'Payroll run updated'
  )
)

export const postRunToAccountingAction = createAsyncThunk(
  'payroll/postRunToAccounting',
  catchAsync(
    async (runId: number) => payrollServices.postRunToAccountingService(runId),
    true,
    false,
    'Payroll posted to the ledger'
  )
)

/** Removes a run that never became financial history (backend enforces the guards). */
export const deleteRunAction = createAsyncThunk(
  'payroll/deleteRun',
  catchAsync(
    async (runId: number) => payrollServices.deleteRunService(runId),
    true,
    false,
    'Payroll run deleted'
  )
)

export const generatePayslipsAction = createAsyncThunk(
  'payroll/generatePayslips',
  catchAsync(
    async (runId: number) => payrollServices.generatePayslipsService(runId),
    true,
    false,
    'Payslips generated'
  )
)

export const createPaymentAction = createAsyncThunk(
  'payroll/createPayment',
  catchAsync(
    async (payload: { runId: number; payment: ICreatePaymentDto }) =>
      payrollServices.createPaymentService(payload.runId, payload.payment),
    true,
    false,
    'Payment batch created'
  )
)

export const completePaymentAction = createAsyncThunk(
  'payroll/completePayment',
  catchAsync(
    async (paymentId: number) =>
      payrollServices.completePaymentService(paymentId),
    true,
    false,
    'Payment completed and posted'
  )
)

export const cancelPaymentAction = createAsyncThunk(
  'payroll/cancelPayment',
  catchAsync(
    async (payload: { paymentId: number; reason?: string | null }) =>
      payrollServices.cancelPaymentService(payload.paymentId, {
        reason: payload.reason,
      }),
    true,
    false,
    'Payment cancelled'
  )
)

export const createLoanAction = createAsyncThunk(
  'payroll/requestLoan',
  catchAsync(
    async (payload: ICreateLoanDto) =>
      payrollServices.createLoanService(payload),
    true,
    false,
    'Loan request created'
  )
)

export const createAdvanceAction = createAsyncThunk(
  'payroll/requestAdvance',
  catchAsync(
    async (payload: ICreateAdvanceDto) =>
      payrollServices.createAdvanceService(payload),
    true,
    false,
    'Advance request created'
  )
)

export const createReimbursementAction = createAsyncThunk(
  'payroll/requestReimbursement',
  catchAsync(
    async (payload: ICreateReimbursementDto) =>
      payrollServices.createReimbursementService(payload),
    true,
    false,
    'Reimbursement claim submitted'
  )
)

export const approveLoanAction = createAsyncThunk(
  'payroll/approveLoan',
  catchAsync(
    async (loanId: number) => payrollServices.approveLoanService(loanId),
    true,
    false,
    'Loan approved'
  )
)

export const decideAdvanceAction = createAsyncThunk(
  'payroll/decideAdvance',
  catchAsync(
    async (payload: {
      advanceId: number
      decision: 'APPROVE' | 'REJECT'
      reason?: string | null
    }) =>
      payrollServices.decideAdvanceService(payload.advanceId, {
        decision: payload.decision,
        reason: payload.reason,
      }),
    true,
    false,
    'Advance updated'
  )
)

export const transitionReimbursementAction = createAsyncThunk(
  'payroll/transitionReimbursement',
  catchAsync(
    async (payload: {
      claimId: number
      transition: 'verify' | 'review' | 'approve' | 'reject'
      reason?: string | null
    }) =>
      payrollServices.transitionReimbursementService(
        payload.claimId,
        payload.transition,
        { reason: payload.reason }
      ),
    true,
    false,
    'Reimbursement updated'
  )
)

export const decideAdjustmentAction = createAsyncThunk(
  'payroll/decideAdjustment',
  catchAsync(
    async (payload: {
      adjustmentId: number
      decision: 'APPROVE' | 'REJECT'
      note?: string | null
    }) =>
      payrollServices.decideAdjustmentService(payload.adjustmentId, {
        decision: payload.decision,
        note: payload.note,
      }),
    true,
    false,
    'Adjustment updated'
  )
)

export const disburseLoanAction = createAsyncThunk(
  'payroll/disburseLoan',
  catchAsync(
    async (payload: {
      loanId: number
      cashAccountId: number
      transactionDate: string
      referenceNumber?: string | null
    }) =>
      payrollServices.disburseLoanService(payload.loanId, {
        cash_account_id: payload.cashAccountId,
        transaction_date: payload.transactionDate,
        reference_number: payload.referenceNumber,
      }),
    true,
    false,
    'Loan disbursed'
  )
)

export const rejectLoanAction = createAsyncThunk(
  'payroll/rejectLoan',
  catchAsync(
    async (payload: { loanId: number; reason?: string | null }) =>
      payrollServices.rejectLoanService(payload.loanId, payload.reason),
    true,
    false,
    'Loan rejected'
  )
)

export const closeLoanAction = createAsyncThunk(
  'payroll/closeLoan',
  catchAsync(
    async (payload: { loanId: number; writeOff?: boolean }) =>
      payrollServices.closeLoanService(payload.loanId, {
        write_off: payload.writeOff,
      }),
    true,
    false,
    'Loan closed'
  )
)

export const payReimbursementAction = createAsyncThunk(
  'payroll/payReimbursement',
  catchAsync(
    async (payload: {
      claimId: number
      cashAccountId: number
      paymentDate: string
      referenceNumber?: string | null
    }) =>
      payrollServices.payReimbursementService(payload.claimId, {
        cash_account_id: payload.cashAccountId,
        payment_date: payload.paymentDate,
        reference_number: payload.referenceNumber,
      }),
    true,
    false,
    'Reimbursement paid'
  )
)

export const createRemittanceAction = createAsyncThunk(
  'payroll/createRemittance',
  catchAsync(
    async (payload: {
      code: Payroll.RemittanceCode
      periodFrom: string
      periodTo: string
      dueDate?: string | null
      amount: string
      cashAccountId?: number | null
    }) =>
      payrollServices.createRemittanceService({
        code: payload.code,
        period_from: payload.periodFrom,
        period_to: payload.periodTo,
        due_date: payload.dueDate ?? null,
        amount: payload.amount,
        cash_account_id: payload.cashAccountId ?? null,
      }),
    true,
    false,
    'Remittance created'
  )
)

export const payRemittanceAction = createAsyncThunk(
  'payroll/payRemittance',
  catchAsync(
    async (payload: {
      remittanceId: number
      paymentDate: string
      paymentReference?: string | null
      cashAccountId?: number | null
    }) =>
      payrollServices.payRemittanceService(payload.remittanceId, {
        payment_date: payload.paymentDate,
        payment_reference: payload.paymentReference ?? null,
        cash_account_id: payload.cashAccountId ?? null,
      }),
    true,
    false,
    'Remittance paid'
  )
)

/* --------------------------- payroll profiles -------------------------- */

export const getProfilesAction = createAsyncThunk(
  'payroll/getProfiles',
  catchAsync(
    async (data: {
      filters?: IProfileFilters
      page?: number
      limit?: number
    }) =>
      payrollServices.listProfilesService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getProfileAction = createAsyncThunk(
  'payroll/getProfile',
  catchAsync(async (employeeId: number) =>
    payrollServices.getProfileService(employeeId)
  )
)

export const getRevisionsAction = createAsyncThunk(
  'payroll/getRevisions',
  catchAsync(
    async (data: {
      filters?: { employee_id?: number; status?: Payroll.RevisionStatus }
      page?: number
      limit?: number
    }) =>
      payrollServices.listRevisionsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getArrearsPreviewAction = createAsyncThunk(
  'payroll/getArrearsPreview',
  catchAsync(async (revisionId: number) =>
    payrollServices.previewArrearsService(revisionId)
  )
)

export const upsertProfileAction = createAsyncThunk(
  'payroll/upsertProfile',
  catchAsync(
    async (payload: { employeeId: number; changes: IUpsertProfileDto }) =>
      payrollServices.upsertProfileService(payload.employeeId, payload.changes),
    true,
    false,
    'Payroll profile saved'
  )
)

export const updatePaymentDetailsAction = createAsyncThunk(
  'payroll/updatePaymentDetails',
  catchAsync(
    async (payload: { employeeId: number; changes: IPaymentDetailsDto }) =>
      payrollServices.updatePaymentDetailsService(
        payload.employeeId,
        payload.changes
      ),
    true,
    false,
    'Payment details updated'
  )
)

export const createAssignmentAction = createAsyncThunk(
  'payroll/createAssignment',
  catchAsync(
    async (payload: ICreateAssignmentDto) =>
      payrollServices.createAssignmentService(payload),
    true,
    false,
    'Salary assignment created'
  )
)

export const createRevisionAction = createAsyncThunk(
  'payroll/createRevision',
  catchAsync(
    async (payload: ICreateRevisionDto) =>
      payrollServices.createRevisionService(payload),
    true,
    false,
    'Salary revision requested'
  )
)

export const decideRevisionAction = createAsyncThunk(
  'payroll/decideRevision',
  catchAsync(
    async (payload: {
      revisionId: number
      decision: 'APPROVE' | 'REJECT'
      comment?: string | null
    }) =>
      payrollServices.decideRevisionService(payload.revisionId, {
        decision: payload.decision,
        comment: payload.comment,
      }),
    true,
    false,
    'Salary revision updated'
  )
)

export const createArrearsAction = createAsyncThunk(
  'payroll/createArrears',
  catchAsync(
    async (revisionId: number) =>
      payrollServices.createArrearsService(revisionId),
    true,
    false,
    'Arrears adjustment created'
  )
)

/* ---------------------------- leave & overtime ------------------------- */

export const getLeaveTypesAction = createAsyncThunk<Payroll.ILeaveType[], void>(
  'payroll/getLeaveTypes',
  catchAsync<Payroll.ILeaveType[], void>(async () =>
    payrollServices.listLeaveTypesService()
  )
)

export const getLeaveRequestsAction = createAsyncThunk(
  'payroll/getLeaveRequests',
  catchAsync(
    async (data: {
      filters?: {
        employee_id?: number
        status?: Payroll.LeaveRequestStatus
        date_from?: string
        date_to?: string
      }
      page?: number
      limit?: number
    }) =>
      payrollServices.listLeaveRequestsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createLeaveAction = createAsyncThunk(
  'payroll/createLeave',
  catchAsync(
    async (payload: ICreateLeaveDto) =>
      payrollServices.createLeaveRequestService(payload),
    true,
    false,
    'Leave request submitted'
  )
)

export const decideLeaveAction = createAsyncThunk(
  'payroll/decideLeave',
  catchAsync(
    async (payload: { requestId: number } & IDecideAttendanceDto) =>
      payrollServices.decideLeaveRequestService(payload.requestId, {
        decision: payload.decision,
        comment: payload.comment,
      }),
    true,
    false,
    'Leave request updated'
  )
)

export const getOvertimeAction = createAsyncThunk(
  'payroll/getOvertime',
  catchAsync(
    async (data: {
      filters?: {
        employee_id?: number
        status?: Payroll.OvertimeStatus
        date_from?: string
        date_to?: string
      }
      page?: number
      limit?: number
    }) =>
      payrollServices.listOvertimeService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createOvertimeAction = createAsyncThunk(
  'payroll/createOvertime',
  catchAsync(
    async (payload: ICreateOvertimeDto) =>
      payrollServices.createOvertimeService(payload),
    true,
    false,
    'Overtime entry submitted'
  )
)

export const decideOvertimeAction = createAsyncThunk(
  'payroll/decideOvertime',
  catchAsync(
    async (payload: { overtimeId: number } & IDecideAttendanceDto) =>
      payrollServices.decideOvertimeService(payload.overtimeId, {
        decision: payload.decision,
        comment: payload.comment,
      }),
    true,
    false,
    'Overtime entry updated'
  )
)

/* --------------------------- final settlement -------------------------- */

export const getSettlementsAction = createAsyncThunk(
  'payroll/getSettlements',
  catchAsync(
    async (data: {
      filters?: ISettlementFilters
      page?: number
      limit?: number
    }) =>
      payrollServices.listSettlementsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createSettlementAction = createAsyncThunk(
  'payroll/createSettlement',
  catchAsync(
    async (payload: ICreateSettlementDto) =>
      payrollServices.createSettlementService(payload),
    true,
    false,
    'Final settlement drafted'
  )
)

export const approveSettlementAction = createAsyncThunk(
  'payroll/approveSettlement',
  catchAsync(
    async (settlementId: number) =>
      payrollServices.approveSettlementService(settlementId),
    true,
    false,
    'Final settlement approved'
  )
)

export const cancelSettlementAction = createAsyncThunk(
  'payroll/cancelSettlement',
  catchAsync(
    async (payload: { settlementId: number; reason?: string | null }) =>
      payrollServices.cancelSettlementService(
        payload.settlementId,
        payload.reason
      ),
    true,
    false,
    'Final settlement cancelled'
  )
)

export const paySettlementAction = createAsyncThunk(
  'payroll/paySettlement',
  catchAsync(
    async (payload: { settlementId: number; payment: IPaySettlementDto }) =>
      payrollServices.paySettlementService(
        payload.settlementId,
        payload.payment
      ),
    true,
    false,
    'Final settlement paid'
  )
)

/* --------------------------- audit & operations ------------------------ */

export const getAuditLogsAction = createAsyncThunk(
  'payroll/getAuditLogs',
  catchAsync(
    async (data: { filters?: IAuditFilters; page?: number; limit?: number }) =>
      payrollServices.listAuditLogsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getAccountingStatusAction = createAsyncThunk(
  'payroll/getAccountingStatus',
  catchAsync(
    async (data: {
      filters?: IAccountingStatusFilters
      page?: number
      limit?: number
    }) =>
      payrollServices.getAccountingStatusService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const retryAccountingAction = createAsyncThunk(
  'payroll/retryAccounting',
  catchAsync(
    async (runId: number) => payrollServices.retryAccountingService(runId),
    true,
    false,
    'Payroll re-posted to the ledger'
  )
)

export const getGroupsAction = createAsyncThunk<Payroll.IPayrollGroup[], void>(
  'payroll/getGroups',
  catchAsync<Payroll.IPayrollGroup[], void>(async () =>
    payrollServices.listGroupsService()
  )
)

export const createGroupAction = createAsyncThunk(
  'payroll/createGroup',
  catchAsync(
    async (payload: IGroupDto) => payrollServices.createGroupService(payload),
    true,
    false,
    'Payroll group created'
  )
)

export const updateGroupAction = createAsyncThunk(
  'payroll/updateGroup',
  catchAsync(
    async (payload: { groupId: number; changes: Partial<IGroupDto> }) =>
      payrollServices.updateGroupService(payload.groupId, payload.changes),
    true,
    false,
    'Payroll group updated'
  )
)

export const deactivateGroupAction = createAsyncThunk(
  'payroll/deactivateGroup',
  catchAsync(
    async (groupId: number) => payrollServices.deactivateGroupService(groupId),
    true,
    false,
    'Payroll group deactivated'
  )
)

/* ---------------------------- configuration ---------------------------- */

export const getSettingsAction = createAsyncThunk<Payroll.ISettings, void>(
  'payroll/getSettings',
  catchAsync<Payroll.ISettings, void>(async () =>
    payrollServices.getSettingsService()
  )
)

export const createPolicyVersionAction = createAsyncThunk(
  'payroll/createPolicyVersion',
  catchAsync(
    async (payload: {
      effective_from?: string
      policy: Partial<Payroll.IPolicy>
    }) => payrollServices.createPolicyVersionService(payload),
    true,
    false,
    'Payroll policy version created'
  )
)

/** One-click provisioning of the payroll defaults of the school (idempotent). */
export const provisionPayrollAction = createAsyncThunk<
  Payroll.IProvisioningSummary,
  void
>(
  'payroll/provisionPayroll',
  catchAsync<Payroll.IProvisioningSummary, void>(
    async () => payrollServices.provisionPayrollService(),
    true,
    false,
    'Payroll provisioned'
  )
)

export const getComponentsAction = createAsyncThunk<
  Payroll.IComponent[],
  {
    component_type?: Payroll.SalaryComponentType
    is_active?: boolean
    search?: string
  }
>(
  'payroll/getComponentsList',
  catchAsync(
    async (filters: {
      component_type?: Payroll.SalaryComponentType
      is_active?: boolean
      search?: string
    }) => payrollServices.listComponentsService(filters)
  )
)

export const createComponentAction = createAsyncThunk(
  'payroll/createComponent',
  catchAsync(
    async (payload: ICreateComponentDto) =>
      payrollServices.createComponentService(payload),
    true,
    false,
    'Salary component created'
  )
)

export const updateComponentAction = createAsyncThunk(
  'payroll/updateComponent',
  catchAsync(
    async (payload: {
      componentId: number
      changes: Partial<Omit<ICreateComponentDto, 'code'>>
    }) =>
      payrollServices.updateComponentService(
        payload.componentId,
        payload.changes
      ),
    true,
    false,
    'Salary component updated'
  )
)

export const deactivateComponentAction = createAsyncThunk(
  'payroll/deactivateComponent',
  catchAsync(
    async (componentId: number) =>
      payrollServices.deactivateComponentService(componentId),
    true,
    false,
    'Salary component deactivated'
  )
)

export const getStructuresAction = createAsyncThunk<Payroll.IStructure[], void>(
  'payroll/getStructuresList',
  catchAsync<Payroll.IStructure[], void>(async () =>
    payrollServices.listStructuresService()
  )
)

export const createStructureAction = createAsyncThunk(
  'payroll/createStructure',
  catchAsync(
    async (payload: ICreateStructureDto) =>
      payrollServices.createStructureService(payload),
    true,
    false,
    'Salary structure created'
  )
)

export const deactivateStructureAction = createAsyncThunk(
  'payroll/deactivateStructure',
  catchAsync(
    async (structureId: number) =>
      payrollServices.deactivateStructureService(structureId),
    true,
    false,
    'Salary structure deactivated'
  )
)

export const activateStructureAction = createAsyncThunk(
  'payroll/activateStructure',
  catchAsync(
    async (structureId: number) =>
      payrollServices.activateStructureService(structureId),
    true,
    false,
    'Salary structure activated'
  )
)

export const getStructureDetailAction = createAsyncThunk<
  Payroll.IStructureDetail,
  number
>(
  'payroll/getStructureDetail',
  catchAsync<Payroll.IStructureDetail, number>(async (structureId: number) =>
    payrollServices.getStructureService(structureId)
  )
)

export const updateStructureAction = createAsyncThunk(
  'payroll/updateStructure',
  catchAsync(
    async (payload: { structureId: number; changes: IUpdateStructureDto }) =>
      payrollServices.updateStructureService(
        payload.structureId,
        payload.changes
      ),
    true,
    false,
    'Salary structure updated'
  )
)

export const getMappingsAction = createAsyncThunk<Payroll.IMappings, void>(
  'payroll/getMappings',
  catchAsync<Payroll.IMappings, void>(async () =>
    payrollServices.getMappingsService()
  )
)

export const upsertMappingAction = createAsyncThunk(
  'payroll/upsertMapping',
  catchAsync(
    async (payload: { mapping_key: Payroll.MappingKey; account_id: number }) =>
      payrollServices.upsertMappingService(payload),
    true,
    false,
    'Accounting mapping saved'
  )
)

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPayrollDashboardAction.pending, (state) => {
        state.dashboard.loading = true
      })
      .addCase(getPayrollDashboardAction.fulfilled, (state, action) => {
        state.dashboard.data = action.payload
        state.dashboard.loading = false
      })
      .addCase(getPayrollDashboardAction.rejected, (state) => {
        state.dashboard.loading = false
      })
      .addCase(getPeriodsAction.pending, (state) => {
        state.periods.loading = true
      })
      .addCase(getPeriodsAction.fulfilled, (state, action) => {
        state.periods.data = action.payload
        state.periods.loading = false
      })
      .addCase(getPeriodsAction.rejected, (state) => {
        state.periods.loading = false
      })
      .addCase(getRunsAction.pending, (state) => {
        state.runs.loading = true
      })
      .addCase(getRunsAction.fulfilled, (state, action) => {
        state.runs.data = action.payload
        state.runs.loading = false
      })
      .addCase(getRunsAction.rejected, (state) => {
        state.runs.loading = false
      })
      .addCase(getRunDetailAction.pending, (state) => {
        state.runDetail.loading = true
      })
      .addCase(getRunDetailAction.fulfilled, (state, action) => {
        state.runDetail.data = action.payload
        state.runDetail.loading = false
      })
      .addCase(getRunDetailAction.rejected, (state) => {
        state.runDetail.loading = false
      })
      .addCase(getRunEmployeesAction.pending, (state) => {
        state.runEmployees.loading = true
      })
      .addCase(getRunEmployeesAction.fulfilled, (state, action) => {
        state.runEmployees.data = action.payload
        state.runEmployees.loading = false
      })
      .addCase(getRunEmployeesAction.rejected, (state) => {
        state.runEmployees.loading = false
      })
      .addCase(getRunEmployeeAction.pending, (state) => {
        state.runEmployee.loading = true
      })
      .addCase(getRunEmployeeAction.fulfilled, (state, action) => {
        state.runEmployee.data = action.payload
        state.runEmployee.loading = false
      })
      .addCase(getRunEmployeeAction.rejected, (state) => {
        state.runEmployee.loading = false
      })
      .addCase(getRunRegisterAction.pending, (state) => {
        state.register.loading = true
      })
      .addCase(getRunRegisterAction.fulfilled, (state, action) => {
        state.register.data = action.payload
        state.register.loading = false
      })
      .addCase(getRunRegisterAction.rejected, (state) => {
        state.register.loading = false
      })

    builder
      .addCase(getPayslipsAction.pending, (state) => {
        state.payslips.loading = true
      })
      .addCase(getPayslipsAction.fulfilled, (state, action) => {
        state.payslips.data = action.payload
        state.payslips.loading = false
      })
      .addCase(getPayslipsAction.rejected, (state) => {
        state.payslips.loading = false
      })
      .addCase(getMyPayslipsAction.pending, (state) => {
        state.myPayslips.loading = true
      })
      .addCase(getMyPayslipsAction.fulfilled, (state, action) => {
        state.myPayslips.data = action.payload
        state.myPayslips.loading = false
      })
      .addCase(getMyPayslipsAction.rejected, (state) => {
        state.myPayslips.loading = false
      })
      .addCase(getPaymentsAction.pending, (state) => {
        state.payments.loading = true
      })
      .addCase(getPaymentsAction.fulfilled, (state, action) => {
        state.payments.data = action.payload
        state.payments.loading = false
      })
      .addCase(getPaymentsAction.rejected, (state) => {
        state.payments.loading = false
      })
      .addCase(getRemittancesAction.pending, (state) => {
        state.remittances.loading = true
      })
      .addCase(getRemittancesAction.fulfilled, (state, action) => {
        state.remittances.data = action.payload
        state.remittances.loading = false
      })
      .addCase(getRemittancesAction.rejected, (state) => {
        state.remittances.loading = false
      })
      .addCase(getLoansAction.pending, (state) => {
        state.loans.loading = true
      })
      .addCase(getLoansAction.fulfilled, (state, action) => {
        state.loans.data = action.payload
        state.loans.loading = false
      })
      .addCase(getLoansAction.rejected, (state) => {
        state.loans.loading = false
      })
      .addCase(getAdvancesAction.pending, (state) => {
        state.advances.loading = true
      })
      .addCase(getAdvancesAction.fulfilled, (state, action) => {
        state.advances.data = action.payload
        state.advances.loading = false
      })
      .addCase(getAdvancesAction.rejected, (state) => {
        state.advances.loading = false
      })
      .addCase(getReimbursementsAction.pending, (state) => {
        state.reimbursements.loading = true
      })
      .addCase(getReimbursementsAction.fulfilled, (state, action) => {
        state.reimbursements.data = action.payload
        state.reimbursements.loading = false
      })
      .addCase(getReimbursementsAction.rejected, (state) => {
        state.reimbursements.loading = false
      })
      .addCase(getAdjustmentsAction.pending, (state) => {
        state.adjustments.loading = true
      })
      .addCase(getAdjustmentsAction.fulfilled, (state, action) => {
        state.adjustments.data = action.payload
        state.adjustments.loading = false
      })
      .addCase(getAdjustmentsAction.rejected, (state) => {
        state.adjustments.loading = false
      })

    builder
      .addCase(getDepartmentExpenseAction.pending, (state) => {
        state.departmentExpense.loading = true
      })
      .addCase(getDepartmentExpenseAction.fulfilled, (state, action) => {
        state.departmentExpense.data = action.payload
        state.departmentExpense.loading = false
      })
      .addCase(getDepartmentExpenseAction.rejected, (state) => {
        state.departmentExpense.loading = false
      })
      .addCase(getYtdAction.pending, (state) => {
        state.ytd.loading = true
      })
      .addCase(getYtdAction.fulfilled, (state, action) => {
        state.ytd.data = action.payload
        state.ytd.loading = false
      })
      .addCase(getYtdAction.rejected, (state) => {
        state.ytd.loading = false
      })
      .addCase(getOutstandingAction.pending, (state) => {
        state.outstanding.loading = true
      })
      .addCase(getOutstandingAction.fulfilled, (state, action) => {
        state.outstanding.data = action.payload
        state.outstanding.loading = false
      })
      .addCase(getOutstandingAction.rejected, (state) => {
        state.outstanding.loading = false
      })
      .addCase(getReconciliationAction.pending, (state) => {
        state.reconciliation.loading = true
      })
      .addCase(getReconciliationAction.fulfilled, (state, action) => {
        state.reconciliation.data = action.payload
        state.reconciliation.loading = false
      })
      .addCase(getReconciliationAction.rejected, (state) => {
        state.reconciliation.loading = false
      })
      .addCase(getStatutoryAction.pending, (state) => {
        state.statutory.loading = true
      })
      .addCase(getStatutoryAction.fulfilled, (state, action) => {
        state.statutory.data = action.payload
        state.statutory.loading = false
      })
      .addCase(getStatutoryAction.rejected, (state) => {
        state.statutory.loading = false
      })
      .addCase(getComponentBreakdownAction.pending, (state) => {
        state.components.loading = true
      })
      .addCase(getComponentBreakdownAction.fulfilled, (state, action) => {
        state.components.data = action.payload
        state.components.loading = false
      })
      .addCase(getComponentBreakdownAction.rejected, (state) => {
        state.components.loading = false
      })
      .addCase(getSettingsAction.pending, (state) => {
        state.settings.loading = true
      })
      .addCase(getSettingsAction.fulfilled, (state, action) => {
        state.settings.data = action.payload
        state.settings.loading = false
      })
      .addCase(getSettingsAction.rejected, (state) => {
        state.settings.loading = false
      })
      .addCase(getComponentsAction.pending, (state) => {
        state.salaryComponents.loading = true
      })
      .addCase(getComponentsAction.fulfilled, (state, action) => {
        state.salaryComponents.data = action.payload
        state.salaryComponents.loading = false
      })
      .addCase(getComponentsAction.rejected, (state) => {
        state.salaryComponents.loading = false
      })
      .addCase(getStructuresAction.pending, (state) => {
        state.structures.loading = true
      })
      .addCase(getStructuresAction.fulfilled, (state, action) => {
        state.structures.data = action.payload
        state.structures.loading = false
      })
      .addCase(getStructuresAction.rejected, (state) => {
        state.structures.loading = false
      })
      .addCase(getMappingsAction.pending, (state) => {
        state.mappings.loading = true
      })
      .addCase(getMappingsAction.fulfilled, (state, action) => {
        state.mappings.data = action.payload
        state.mappings.loading = false
      })
      .addCase(getMappingsAction.rejected, (state) => {
        state.mappings.loading = false
      })
      .addCase(getProfilesAction.pending, (state) => {
        state.profiles.loading = true
      })
      .addCase(getProfilesAction.fulfilled, (state, action) => {
        state.profiles.data = action.payload
        state.profiles.loading = false
      })
      .addCase(getProfilesAction.rejected, (state) => {
        state.profiles.loading = false
      })
      .addCase(getProfileAction.pending, (state) => {
        state.profileDetail.loading = true
      })
      .addCase(getProfileAction.fulfilled, (state, action) => {
        state.profileDetail.data = action.payload
        state.profileDetail.loading = false
      })
      .addCase(getProfileAction.rejected, (state) => {
        state.profileDetail.loading = false
      })
      .addCase(getRevisionsAction.pending, (state) => {
        state.revisions.loading = true
      })
      .addCase(getRevisionsAction.fulfilled, (state, action) => {
        state.revisions.data = action.payload
        state.revisions.loading = false
      })
      .addCase(getRevisionsAction.rejected, (state) => {
        state.revisions.loading = false
      })
      .addCase(getArrearsPreviewAction.pending, (state) => {
        state.arrearsPreview.loading = true
      })
      .addCase(getArrearsPreviewAction.fulfilled, (state, action) => {
        state.arrearsPreview.data = action.payload
        state.arrearsPreview.loading = false
      })
      .addCase(getArrearsPreviewAction.rejected, (state) => {
        state.arrearsPreview.loading = false
      })
      .addCase(getAuditLogsAction.pending, (state) => {
        state.auditLogs.loading = true
      })
      .addCase(getAuditLogsAction.fulfilled, (state, action) => {
        state.auditLogs.data = action.payload
        state.auditLogs.loading = false
      })
      .addCase(getAuditLogsAction.rejected, (state) => {
        state.auditLogs.loading = false
      })
      .addCase(getAccountingStatusAction.pending, (state) => {
        state.accountingStatus.loading = true
      })
      .addCase(getAccountingStatusAction.fulfilled, (state, action) => {
        state.accountingStatus.data = action.payload
        state.accountingStatus.loading = false
      })
      .addCase(getAccountingStatusAction.rejected, (state) => {
        state.accountingStatus.loading = false
      })
      .addCase(getGroupsAction.pending, (state) => {
        state.groups.loading = true
      })
      .addCase(getGroupsAction.fulfilled, (state, action) => {
        state.groups.data = action.payload
        state.groups.loading = false
      })
      .addCase(getGroupsAction.rejected, (state) => {
        state.groups.loading = false
      })
      .addCase(getSettlementsAction.pending, (state) => {
        state.settlements.loading = true
      })
      .addCase(getSettlementsAction.fulfilled, (state, action) => {
        state.settlements.data = action.payload
        state.settlements.loading = false
      })
      .addCase(getSettlementsAction.rejected, (state) => {
        state.settlements.loading = false
      })
      .addCase(getLeaveTypesAction.pending, (state) => {
        state.leaveTypes.loading = true
      })
      .addCase(getLeaveTypesAction.fulfilled, (state, action) => {
        state.leaveTypes.data = action.payload
        state.leaveTypes.loading = false
      })
      .addCase(getLeaveTypesAction.rejected, (state) => {
        state.leaveTypes.loading = false
      })
      .addCase(getLeaveRequestsAction.pending, (state) => {
        state.leaveRequests.loading = true
      })
      .addCase(getLeaveRequestsAction.fulfilled, (state, action) => {
        state.leaveRequests.data = action.payload
        state.leaveRequests.loading = false
      })
      .addCase(getLeaveRequestsAction.rejected, (state) => {
        state.leaveRequests.loading = false
      })
      .addCase(getOvertimeAction.pending, (state) => {
        state.overtime.loading = true
      })
      .addCase(getOvertimeAction.fulfilled, (state, action) => {
        state.overtime.data = action.payload
        state.overtime.loading = false
      })
      .addCase(getOvertimeAction.rejected, (state) => {
        state.overtime.loading = false
      })
  },
})

export default payrollSlice.reducer
