/**
 * Wire types of the payroll module.
 *
 * They mirror `backend/src/types/payroll.types.ts` and the rows returned by the
 * payroll services one to one. Money is a decimal **string** (`numeric(14,2)` on
 * the database side) — it is never converted to a float for storage, only to
 * integer minor units for display arithmetic (`toMinor` / `fromMinor`).
 */
declare namespace Payroll {
  type PeriodStatus = 'OPEN' | 'LOCKED' | 'CLOSED'
  type RunStatus =
    | 'DRAFT'
    | 'CALCULATED'
    | 'UNDER_REVIEW'
    | 'VERIFIED'
    | 'APPROVED'
    | 'POSTED'
    | 'PAYMENT_AUTHORIZED'
    | 'PAID'
    | 'CLOSED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'REVERSED'
  type RunType =
    | 'REGULAR'
    | 'OFF_CYCLE'
    | 'BONUS'
    | 'ARREARS'
    | 'FINAL_SETTLEMENT'
  type RunEmployeeStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'FAILED'
    | 'EXCLUDED'
    | 'REVERSED'
  type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'ONLINE'
  type PaymentStatus =
    | 'DRAFT'
    | 'COMPLETED'
    | 'PARTIALLY_PAID'
    | 'FAILED'
    | 'REVERSED'
  type PayslipStatus = 'GENERATED' | 'SENT' | 'VIEWED'
  type ExceptionSeverity = 'INFO' | 'WARNING' | 'BLOCKER'
  type ExceptionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'WAIVED' | 'RESOLVED'
  type LineItemType = 'EARNING' | 'DEDUCTION' | 'EMPLOYER_CONTRIBUTION'
  type RemittanceCode = 'TDS' | 'PF' | 'SSF' | 'CIT' | 'INSURANCE'
  type RemittanceStatus = 'PENDING' | 'PAID'
  type LoanStatus =
    | 'REQUESTED'
    | 'APPROVED'
    | 'ACTIVE'
    | 'REJECTED'
    | 'CLOSED'
    | 'WRITTEN_OFF'
  type AdvanceStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'SETTLED'
  type ReimbursementStatus =
    | 'SUBMITTED'
    | 'DEPARTMENT_VERIFIED'
    | 'ACCOUNTANT_REVIEWED'
    | 'APPROVED'
    | 'REJECTED'
    | 'PAID'
  type AdjustmentType =
    | 'BONUS'
    | 'INCENTIVE'
    | 'ARREAR'
    | 'MANUAL_EARNING'
    | 'MANUAL_DEDUCTION'
    | 'LEAVE_ENCASHMENT'
    | 'REIMBURSEMENT'
    | 'OTHER'
  type AdjustmentStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'APPLIED'
  type InterestMethod = 'NONE' | 'FLAT' | 'REDUCING'

  /** Shape of `pagination()` from `backend/src/utils/pagination.ts`. */
  interface IPaginated<T> {
    total: number | string
    rows: T[]
    isLast: boolean
  }

  interface IPeriod {
    id: number
    period_key: string
    frequency: string
    start_date: string
    end_date: string
    cutoff_date: string | null
    pay_date: string
    status: PeriodStatus
    payroll_group_id: number | null
    created_at: string
    updated_at: string
  }

  interface IRun {
    id: number
    period_id: number
    payroll_group_id: number | null
    run_number: string
    run_type: RunType
    status: RunStatus
    policy_version_id: number | null
    currency: string
    total_gross: string
    total_deductions: string
    total_employer_contributions: string
    total_net: string
    total_cost: string
    employee_count: number
    prepared_by: number | null
    verified_by: number | null
    approved_by: number | null
    payment_authorized_by: number | null
    calculated_at: string | null
    finalized_at: string | null
    accounting_transaction_id: number | null
    accounting_event_status: string | null
    accounting_last_error: string | null
    period_key?: string
    period_start?: string
    period_end?: string
    pay_date?: string
    payroll_group_name?: string | null
    created_at: string
    updated_at: string
  }

  interface IApproval {
    id: number
    run_id: number
    sequence: number
    stage: string
    status: string
    actor_user_id: number | null
    actor_role: string | null
    acted_at: string | null
    comment: string | null
  }

  interface IException {
    id: number
    run_id: number
    run_employee_id: number | null
    code: string
    severity: ExceptionSeverity
    message: string
    status: ExceptionStatus
    note: string | null
    resolved_at: string | null
  }

  interface IEmployeeName {
    firstname: string | null
    lastname: string | null
  }

  interface IRunDetail extends IRun {
    period: IPeriod
    payroll_group: { id: number; name: string } | null
    approvals: IApproval[]
    exceptions: IException[]
    exception_counts: {
      severity: ExceptionSeverity
      status: ExceptionStatus
      count: number
    }[]
  }

  interface IRunEmployee {
    id: number
    employee_id: number
    department_id: number | null
    department_name: string | null
    employment_type: string
    days_payable: string
    base_amount: string
    gross_amount: string
    total_deductions: string
    total_employer_contributions: string
    net_amount: string
    paid_amount: string
    outstanding_amount: string
    status: RunEmployeeStatus
    warning_count: number
    blocker_count: number
    role: string
    employee: IEmployeeName
  }

  interface ILineItem {
    id: number
    run_employee_id: number
    component_id: number | null
    component_code: string
    component_name: string
    component_type: LineItemType
    source: string
    quantity: string | null
    rate: string | null
    amount: string
    is_taxable: boolean
    statutory_code: string | null
    sequence: number
    description: string | null
  }

  interface IInputSnapshot {
    id: number
    working_days: string
    present_days: string
    absent_days: string
    paid_leave_days: string
    unpaid_leave_days: string
    half_days: string
    holidays: string
    weekends: string
    late_count: number
    early_departure_count: number
    overtime_hours: string
  }

  interface IRunEmployeeDetail extends IRunEmployee {
    lines: ILineItem[]
    input_snapshot: IInputSnapshot | null
    exceptions: IException[]
  }

  interface IRegisterRow {
    employee_id: number
    firstname: string | null
    lastname: string | null
    role: string
    department_name: string | null
    employment_type: string
    days_payable: string
    base_amount: string
    gross_amount: string
    total_deductions: string
    total_employer_contributions: string
    net_amount: string
    paid_amount: string
    outstanding_amount: string
    status: RunEmployeeStatus
  }

  interface IRegister {
    run_number: string
    rows: IRegisterRow[]
    totals: {
      gross: string
      deductions: string
      employer_contributions: string
      net: string
      employee_count: number
    }
  }

  interface IPayslip {
    id: number
    run_employee_id: number
    payslip_number: string
    employee_id: number
    period_key: string
    gross_amount: string
    total_deductions: string
    net_amount: string
    ytd: Record<string, string | number> | null
    pdf_path: string | null
    status: PayslipStatus
    published_at: string | null
    run_id?: number
    run_number?: string
    pay_date?: string
    period_start?: string
    period_end?: string
    role?: string
    department_name?: string | null
    employee?: IEmployeeName
  }

  interface IPayment {
    id: number
    payroll_run_id: number
    payment_number: string
    payment_date: string
    payment_method: PaymentMethod
    bank_account_id: number
    total_amount: string
    status: PaymentStatus
    reference_number: string | null
    cheque_number: string | null
    notes: string | null
    accounting_transaction_id: number | null
    run_number: string
    period_key: string
    cash_account_code: string | null
    allocation_count: number
  }

  interface IRemittance {
    id: number
    remittance_number: string
    code: RemittanceCode
    period_from: string
    period_to: string
    due_date: string | null
    amount: string
    status: RemittanceStatus
    paid_at: string | null
    payment_reference: string | null
    cash_account_id: number | null
    accounting_transaction_id: number | null
  }

  interface ILoan {
    id: number
    employee_id: number
    loan_number: string
    principal_amount: string
    interest_rate: string
    interest_method: InterestMethod
    instalment_count: number
    instalment_amount: string
    start_date: string
    first_deduction_period_key: string | null
    outstanding_principal: string
    outstanding_interest: string
    status: LoanStatus
    purpose: string | null
    approved_at: string | null
    disbursement_transaction_id: number | null
    role?: string
    employee?: IEmployeeName
  }

  interface IAdvance {
    id: number
    employee_id: number
    advance_number: string
    amount: string
    recovered_amount: string
    outstanding_amount: string
    requested_on: string
    recovery_period_key: string | null
    status: AdvanceStatus
    reason: string | null
    role?: string
    employee?: IEmployeeName
  }

  interface IReimbursement {
    id: number
    employee_id: number
    claim_number: string
    category: string
    amount: string
    description: string | null
    status: ReimbursementStatus
    rejected_reason: string | null
    role?: string
    employee?: IEmployeeName
    attachment_count?: number
  }

  interface IAdjustment {
    id: number
    employee_id: number
    type: AdjustmentType
    component_code: string
    amount: string
    reason: string | null
    status: AdjustmentStatus
    source_type: string | null
    source_id: number | null
    period_key: string | null
    effective_date: string | null
    details: {
      periods?: {
        period_key: string
        expected_basic: string
        paid_basic: string
        difference: string
      }[]
      overpaid?: string
    } | null
    role?: string
    employee?: IEmployeeName
  }

  interface IDashboard {
    employees: number
    pending_approvals: number
    unpaid_salary: { amount: string; runs_scope: string[] }
    latest_run: (IRun & { period_key: string; pay_date: string }) | null
    recent_runs: {
      id: number
      run_number: string
      status: RunStatus
      total_net: string
      employee_count: number
      period_key: string
    }[]
  }

  interface IDepartmentExpenseRow {
    department: string
    employees: number
    runs: number
    gross: string
    deductions: string
    employer_contributions: string
    net: string
    total_cost: string
  }

  interface IComponentBreakdownRow {
    component_type: LineItemType
    component_code: string
    component_name: string
    line_count: number
    amount: string
  }

  interface IStatutoryReport {
    schemes: {
      statutory_code: RemittanceCode
      employee_amount: string
      employer_amount: string
      line_count: number
    }[]
    total: string
  }

  interface IYtdReport {
    fiscal_year: { fiscal_year?: string; start_date: string; end_date: string }
    rows: {
      employee_id: number
      firstname: string | null
      lastname: string | null
      role: string
      runs: number
      gross: string
      deductions: string
      employer_contributions: string
      net: string
    }[]
  }

  interface IOutstandingSalary {
    runs: {
      run_id: number
      run_number: string
      status: RunStatus
      period_key: string
      pay_date: string
      employees_with_balance: number
      outstanding: string
    }[]
    total: string
  }

  interface IPaymentHistoryRow {
    payment_date: string
    payment_method: PaymentMethod
    status: PaymentStatus
    payments: number
    amount: string
  }

  interface IReconciliation {
    salary_payable: {
      ledger_balance: string
      payroll_outstanding: string
      variance: string
      is_reconciled: boolean
    }
    statutory: {
      ledger_balance: string
      accrued: string
      remitted: string
      liability: string
      variance: string
      is_reconciled: boolean
    }
    ledger_accounts: {
      account_code: string
      credit: string
      debit: string
      balance: string
    }[]
    scope_statuses: string[]
  }

  /* ----------------------------- configuration ---------------------------- */

  type Frequency = 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'CUSTOM'
  type PayableDayBasis = 'ACTUAL_WORKDAYS' | 'FIXED_DAYS' | 'CALENDAR_DAYS'
  type RoundingMode = 'HALF_UP' | 'DOWN' | 'UP'
  type OvertimeBasis = 'BASIC' | 'BASIC_PLUS_ALLOWANCES'
  type LateDeductionMode = 'NONE' | 'PER_OCCURRENCE' | 'PER_HOUR'
  type EmploymentType =
    | 'PERMANENT'
    | 'CONTRACT'
    | 'PART_TIME'
    | 'VISITING'
    | 'TEMPORARY'
    | 'SUBSTITUTE'
    | 'DAILY_WAGE'
    | 'HOURLY'
  type SalaryComponentType = 'EARNING' | 'DEDUCTION' | 'EMPLOYER_CONTRIBUTION'
  type CalculationType =
    | 'FIXED'
    | 'PERCENT_OF_BASIC'
    | 'PERCENT_OF_GROSS'
    | 'FORMULA'
    | 'ATTENDANCE_DERIVED'
    | 'STATUTORY'
  type MappingKey =
    | 'SALARY_PAYABLE'
    | 'TAX_PAYABLE'
    | 'PF_PAYABLE'
    | 'SSF_PAYABLE'
    | 'INSURANCE_PAYABLE'
    | 'OTHER_DEDUCTIONS_PAYABLE'
    | 'LOAN_RECEIVABLE'
    | 'ADVANCE_RECEIVABLE'
    | 'EMPLOYER_CONTRIBUTION_EXPENSE'
    | 'REIMBURSEMENT_EXPENSE'
    | 'ROUNDING'
  type StructureStatus = 'ACTIVE' | 'INACTIVE'

  interface IPolicy {
    frequency: Frequency
    payable_day_basis: PayableDayBasis
    fixed_working_days_per_month: number
    daily_working_hours: number
    overtime_multiplier: number
    overtime_basis: OvertimeBasis
    half_day_weight: number
    deduct_unpaid_leave: boolean
    late_deduction_mode: LateDeductionMode
    late_deduction_amount?: string | null
    rounding_mode: RoundingMode
    periods_per_year: number
    late_deduction_component_code?: string | null
    approval_chain?: { stage: string; role: string }[]
  }

  interface IPolicyVersion {
    id: number
    version: number
    effective_from: string
    policy: IPolicy
    is_active: boolean
    created_at: string
  }

  interface ISettings {
    effective_policy: IPolicy
    policy_version: IPolicyVersion
    versions: IPolicyVersion[]
  }

  /** Result of `POST /payroll/settings/provision` (idempotent defaults). */
  interface IProvisioningSummary {
    already_provisioned: boolean
    accounts_created: number
    salary_components_created: number
    salary_structure_created: boolean
    structure_components_created: number
    policy_version_created: boolean
    accounting_mappings_created: number
    statutory_rules_created: number
    leave_types_created: number
  }

  interface IComponent {
    id: number
    code: string
    name: string
    component_type: SalaryComponentType
    calculation_type: CalculationType
    formula: string | null
    percentage: string | null
    default_amount: string | null
    is_taxable: boolean
    is_prorated: boolean
    show_on_payslip: boolean
    sequence: number
    statutory_code: string | null
    accounting_account_id: number | null
    is_active: boolean
    effective_from: string | null
    effective_to: string | null
  }

  interface IStructure {
    id: number
    code: string
    name: string
    employment_type: EmploymentType | null
    grade: string | null
    currency: string
    effective_from: string | null
    effective_to: string | null
    status: StructureStatus
    component_count: number
    assignment_count: number
  }

  interface IStructureComponent {
    id: number
    component_id: number
    code: string
    name: string
    component_type: SalaryComponentType
    amount_override: string | null
    percentage_override: string | null
    sequence_override: number | null
    is_mandatory: boolean
  }

  interface IStructureDetail extends IStructure {
    components: IStructureComponent[]
  }

  interface IDocumentListQuery {
    employee_id?: number
    status?: string
  }

  /* --------------------------- payroll profiles --------------------------- */

  type PayrollProfileStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
  type AssignmentStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED'
  type RevisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'APPLIED'
  type IncrementType = 'AMOUNT' | 'PERCENT'

  interface IPayrollProfile {
    id: number
    employee_id: number
    department_id: number | null
    employment_type: Payroll.EmploymentType
    payroll_group_id: number | null
    salary_structure_id: number | null
    pay_frequency: Payroll.Frequency
    payment_method: Payroll.PaymentMethod
    bank_name: string | null
    bank_account_last4: string | null
    branch_code: string | null
    tax_status: string | null
    marital_status: string | null
    pan_number: string | null
    ssf_number: string | null
    pf_number: string | null
    is_payroll_eligible: boolean
    payroll_status: PayrollProfileStatus
    effective_from: string | null
    termination_date: string | null
    last_working_day: string | null
  }

  interface IUnprofiledEmployee {
    employee_id: number
    joining_date: string | null
    role: string
    employee: {
      firstname: string | null
      lastname: string | null
      email: string | null
    }
  }

  interface IProfileListItem {
    id: number
    employee_id: number
    department_id: number | null
    department_name: string | null
    employment_type: Payroll.EmploymentType
    payroll_status: PayrollProfileStatus
    is_payroll_eligible: boolean
    pay_frequency: Payroll.Frequency
    payment_method: Payroll.PaymentMethod
    bank_account_last4: string | null
    termination_date: string | null
    role: string
    employee: {
      firstname: string | null
      lastname: string | null
      email: string | null
    }
    base_amount: string | null
    salary_effective_from: string | null
  }

  interface ISalaryAssignment {
    id: number
    employee_id: number
    salary_structure_id: number
    base_amount: string
    ctc_amount: string | null
    currency: string
    effective_from: string
    effective_to: string | null
    status: AssignmentStatus
    reason: string | null
    structure_code: string
    structure_name: string
  }

  interface ISalaryRevision {
    id: number
    employee_id: number
    assignment_id: number | null
    previous_amount: string
    new_amount: string
    increment_type: IncrementType | null
    increment_value: string | null
    effective_date: string
    reason: string | null
    status: RevisionStatus
    is_retroactive: boolean
    applied_payroll_run_id: number | null
    approved_at: string | null
  }

  interface IProfileDetail {
    employee_id: number
    joining_date: string | null
    national_id: string | null
    role: string
    employee: {
      firstname: string | null
      lastname: string | null
      email: string | null
    }
    payroll_profile: IPayrollProfile | null
    assignments: ISalaryAssignment[]
    revisions: ISalaryRevision[]
  }

  interface IArrearsPreview {
    revision: ISalaryRevision
    arrears: {
      periods: {
        period_key: string
        expected_basic: string
        paid_basic: string
        difference: string
      }[]
      total: string
      overpaid: string
    } | null
    paid_periods: number
  }

  interface IMapping {
    id: number
    mapping_key: MappingKey
    account_id: number
    description: string | null
    account_code: string
    account_name: string
    account_type: string
  }

  interface IMappings {
    mappings: IMapping[]
    resolved: Record<string, number | null>
  }

  /* ------------------------- audit & operations --------------------------- */

  interface IAuditLog {
    id: number
    created_at: string
    action: string
    entity_type: string
    entity_id: number | null
    details: Record<string, unknown> | null
    ip_address: string | null
    performed_by: {
      id: number | null
      firstname: string | null
      lastname: string | null
      email: string | null
    } | null
  }

  type JournalLinkStatus = 'POSTED' | 'PENDING' | 'FAILED'

  interface IJournalLink {
    id: number
    document_type: string
    document_id: number
    event_key: string
    status: JournalLinkStatus
    attempts: number
    last_error: string | null
    posted_at: string | null
    created_at: string
    accounting_transaction_id: number | null
    run_number: string | null
    run_status: Payroll.RunStatus | null
    period_key: string | null
  }

  interface IAccountingStatus {
    links: IPaginated<IJournalLink>
    counts: { status: string; count: number }[]
    failed_runs: {
      id: number
      run_number: string
      status: Payroll.RunStatus
      accounting_event_status: string | null
      accounting_last_error: string | null
      period_key: string
    }[]
  }

  interface IPayrollGroup {
    id: number
    name: string
    frequency: Payroll.Frequency
    default_structure_id: number | null
    filter: Record<string, unknown> | null
    is_active: boolean
    period_count: number
    run_count: number
    created_at: string
    updated_at: string
  }

  /* ---------------------------- leave & overtime -------------------------- */

  type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  type OvertimeStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

  interface ILeaveType {
    id: number
    code: string
    name: string
    is_paid: boolean
    max_days_per_year: number
    carry_forward: boolean
    encashable: boolean
    is_active: boolean
  }

  interface ILeaveRequest {
    id: number
    employee_id: number
    leave_type_id: number
    from_date: string
    to_date: string
    days: string
    reason: string | null
    status: LeaveRequestStatus
    approved_at: string | null
    leave_type_code: string
    leave_type_name: string
    is_paid: boolean
    role: string
    employee?: IEmployeeName
  }

  interface IOvertimeEntry {
    id: number
    employee_id: number
    work_date: string
    hours: string
    rate_multiplier: string | null
    status: OvertimeStatus
    approved_at: string | null
    note: string | null
    role: string
    employee?: IEmployeeName
  }

  /* --------------------------- final settlement --------------------------- */

  type SettlementStatus = 'DRAFT' | 'APPROVED' | 'PROCESSED' | 'CANCELLED'

  interface IFinalSettlement {
    id: number
    employee_id: number
    termination_date: string
    last_working_day: string
    payroll_run_id: number | null
    gross_amount: string
    total_deductions: string
    net_amount: string
    components: {
      reference_run?: {
        id: number
        run_number: string
        period_key: string
        base_amount: string
        days_payable: string
        gross: string
        deductions: string
        net: string
      }
      daily_rate?: string
      leave_days_encashed?: number
      leave_encashment?: string
      note?: string | null
    } | null
    status: SettlementStatus
    approved_at: string | null
    run_number?: string | null
    period_key?: string | null
    role?: string
    employee?: IEmployeeName
  }
}
