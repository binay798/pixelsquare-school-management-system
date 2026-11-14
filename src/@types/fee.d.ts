/**
 * Contracts of the fee management module.
 *
 * Mirrors the *actual* backend implementation (`backend/src/fee/**`): every field
 * below exists in a response payload or a request schema. Money is always a
 * decimal string (`"1250.00"`), never a float, so the UI never re-computes an
 * amount with binary floating point arithmetic.
 */
declare namespace Fee {
  /* ------------------------------- enums ------------------------------- */
  type BillingFrequency = 'ONE_TIME' | 'MONTHLY' | 'TERM' | 'ANNUAL'
  type RevenueRecognitionPolicy = 'ON_ISSUE' | 'ON_DUE_DATE' | 'DEFERRED'
  type FeeCategory =
    | 'TUITION'
    | 'ADMISSION'
    | 'REGISTRATION'
    | 'EXAMINATION'
    | 'LIBRARY'
    | 'TRANSPORTATION'
    | 'LABORATORY'
    | 'SPORTS'
    | 'COMPUTER'
    | 'HOSTEL'
    | 'OTHER'
  type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  type AssignmentStatus = 'ACTIVE' | 'EXEMPTED' | 'COMPLETED' | 'CANCELLED'
  type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'
  type DiscountCategory =
    | 'MERIT_SCHOLARSHIP'
    | 'ACADEMIC_EXCELLENCE'
    | 'SIBLING_DISCOUNT'
    | 'FINANCIAL_ASSISTANCE'
    | 'STAFF_CHILD'
    | 'SPECIAL_NEEDS'
    | 'GOVERNMENT_SCHOLARSHIP'
    | 'CUSTOM'
  type ConcessionApprovalStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'REVOKED'
  type InvoiceStatus =
    | 'DRAFT'
    | 'ISSUED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELLED'
    | 'VOIDED'
  type PaymentMethod =
    | 'CASH'
    | 'BANK_TRANSFER'
    | 'CARD'
    | 'ONLINE_GATEWAY'
    | 'CHEQUE'
    | 'WALLET'
    | 'OTHER'
  type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVERSED'
  type GatewayStatus =
    | 'NOT_APPLICABLE'
    | 'PENDING'
    | 'AUTHORIZED'
    | 'CAPTURED'
    | 'FAILED'
    | 'REFUNDED'
  type WalletStatus = 'ACTIVE' | 'FROZEN'
  type WalletTransactionType = 'CREDIT' | 'DEBIT'
  type WalletSource =
    | 'ADVANCE_PAYMENT'
    | 'PAYMENT_OVERPAYMENT'
    | 'WALLET_APPLICATION'
    | 'REFUND'
    | 'REVERSAL'
    | 'ADJUSTMENT'
  type LateFeeCalculationType = 'FIXED' | 'PERCENTAGE'
  type LateFeeFrequency = 'ONE_TIME' | 'DAILY' | 'MONTHLY'
  type AdjustmentType =
    | 'PENALTY'
    | 'CREDIT_NOTE'
    | 'DEBIT_NOTE'
    | 'WAIVER'
    | 'WRITE_OFF'
  type AdjustmentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'APPLIED'
    | 'REJECTED'
    | 'REVERSED'
  type RefundType =
    | 'PAYMENT_REFUND'
    | 'OVERPAYMENT_REFUND'
    | 'WALLET_REFUND'
    | 'FEE_CANCELLATION'
  type RefundStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'PROCESSED'
    | 'REJECTED'
    | 'FAILED'
  type IntegrationStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'POSTED'
    | 'FAILED'
    | 'REQUIRES_REVIEW'
  type AgingBucket =
    | 'NOT_DUE'
    | 'DAYS_1_30'
    | 'DAYS_31_60'
    | 'DAYS_61_90'
    | 'ABOVE_90'
  type ReminderChannel = 'SMS' | 'EMAIL' | 'IN_APP'
  type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'
  type AllocationStrategy = 'DUE_DATE' | 'ISSUE_DATE' | 'LARGEST_FIRST'

  /* ---------------------------- envelopes ------------------------------ */
  /** Standard list envelope of the fee module (`{ rows, total, page, limit }`). */
  interface IList<T> {
    rows: T[]
    total: number
    page: number
    limit: number
  }

  /* ------------------------------ config ------------------------------- */
  interface IFeeType {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    name: string
    code: string
    description: string | null
    default_amount: string | null
    category: FeeCategory
    accounting_account_id: number | null
    revenue_recognition_policy: RevenueRecognitionPolicy
    is_mandatory: boolean
    is_recurring: boolean
    is_refundable: boolean
    is_active: boolean
    /** Joined from `accounts` by the list endpoint. */
    account_code?: string | null
    account_name?: string | null
  }

  interface ITemplateItem {
    id: number
    fee_template_id: number
    fee_type_id: number
    amount: string
    quantity: string
    billing_frequency: BillingFrequency
    is_optional: boolean
    sort_order: number
    fee_type_name?: string
    fee_type_code?: string
    fee_type_category?: FeeCategory
  }

  interface IFeeTemplate {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    name: string
    code: string
    description: string | null
    academic_year_id: number
    class_id: number | null
    section_id: number | null
    total_amount: string
    effective_from: string
    effective_to: string | null
    status: TemplateStatus
    /** Sub-select returned by the list endpoint. */
    item_count?: string | number
  }

  interface IFeeTemplateDetail extends IFeeTemplate {
    items: ITemplateItem[]
  }

  interface IAssignment {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    student_id: number
    academic_year_id: number
    fee_template_id: number | null
    class_id: number | null
    section_id: number | null
    assigned_amount: string | null
    effective_from: string
    effective_to: string | null
    status: AssignmentStatus
    is_exempt: boolean
    notes: string | null
    template_name?: string | null
    template_code?: string | null
  }

  interface IScholarship {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    name: string
    code: string
    description: string | null
    discount_type: DiscountType
    discount_value: string
    discount_category: DiscountCategory
    calculation_priority: number
    applies_to_fee_type_id: number | null
    maximum_discount_amount: string | null
    minimum_fee_amount: string | null
    academic_year_id: number | null
    valid_from: string
    valid_until: string | null
    maximum_beneficiaries: number | null
    requires_approval: boolean
    is_active: boolean
  }

  interface IConcession {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    student_id: number
    scholarship_discount_id: number
    academic_year_id: number
    approval_status: ConcessionApprovalStatus
    valid_from: string
    valid_until: string | null
    remarks: string | null
    approved_by?: number | null
    approved_at?: string | null
    /** Joined from `scholarships_discounts`. */
    name: string
    code: string
    discount_type: DiscountType
    discount_value: string
    discount_category: DiscountCategory
  }

  interface ILateFeeRule {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    name: string
    calculation_type: LateFeeCalculationType
    calculation_value: string
    grace_period_days: number
    maximum_penalty: string | null
    frequency: LateFeeFrequency
    applies_to_fee_type_id: number | null
    accounting_account_id: number | null
    effective_from: string
    effective_until: string | null
    is_active: boolean
  }

  /* ------------------------------ invoices ----------------------------- */
  interface IConcessionBreakdown {
    student_concession_id: number
    scholarship_discount_id: number
    name: string
    code: string
    discount_type: DiscountType
    discount_category: DiscountCategory
    calculation_priority: number
    configured_value: string
    applied_amount_minor: number
    remaining_after_minor: number
  }

  interface IInvoiceLine {
    id: number
    invoice_id: number
    fee_type_id: number | null
    fee_type_name: string | null
    description: string
    account_id: number | null
    quantity: string
    unit_price: string
    gross_amount: string
    discount_amount: string
    penalty_amount: string
    tax_amount: string
    net_amount: string
    revenue_recognition_policy: RevenueRecognitionPolicy
    billing_frequency: BillingFrequency
    /** JSONB column, returned as a string by Knex. */
    concession_breakdown: string | IConcessionBreakdown[] | null
    sort_order: number
  }

  interface IInvoice {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    invoice_number: string
    student_id: number
    academic_year_id: number
    academic_term_id: number | null
    fee_template_id: number | null
    batch_reference: string | null
    issue_date: string
    due_date: string
    period_start: string | null
    period_end: string | null
    billing_period_key: string | null
    currency: string
    subtotal: string
    total_discount: string
    total_penalty: string
    tax_amount: string
    total_amount: string
    wallet_amount_applied: string
    paid_amount: string
    outstanding_amount: string
    status: InvoiceStatus
    notes: string | null
    issued_at: string | null
    cancelled_at: string | null
    cancel_reason: string | null
    accounting_transaction_id: number | null
    accounting_event_status: IntegrationStatus
    accounting_last_error: string | null
    created_by: number | null
    /** Joined by the list endpoint. */
    firstname?: string | null
    lastname?: string | null
    overdue_days?: number | string | null
  }

  interface IInvoiceDetail extends IInvoice {
    lines: IInvoiceLine[]
  }

  /** One priced line of an invoice preview (nothing is persisted yet). */
  interface IPreparedLine {
    fee_type_id: number | null
    fee_type_name: string | null
    description: string
    account_id: number | null
    account_code: string
    revenue_recognition_policy: RevenueRecognitionPolicy
    billing_frequency: BillingFrequency
    quantity: string
    unit_price: string
    calculated: {
      gross_amount_minor: number
      discount_amount_minor: number
      tax_amount_minor: number
      net_amount_minor: number
      concession_breakdown: IConcessionBreakdown[]
    }
  }

  interface IPreparedInvoice {
    studentId: number
    academicYearId: number
    feeTemplateId: number | null
    academicTermId: number | null
    issueDate: string
    dueDate: string
    periodStart: string
    periodEnd: string
    periodKey: string
    billingFrequency: BillingFrequency
    lines: IPreparedLine[]
    totals: {
      subtotal_minor: number
      discount_minor: number
      penalty_minor: number
      tax_minor: number
      total_minor: number
    }
  }

  type TBulkRowStatus = 'READY' | 'ALREADY_INVOICED' | 'SKIPPED' | 'ERROR'

  interface IBulkPreviewRow {
    student_id: number
    fee_template_id: number | null
    total_amount: string
    period_key: string | null
    status: TBulkRowStatus
    message?: string
    invoice_id?: number
    invoice_number?: string
  }

  interface IBulkPreview {
    rows: IBulkPreviewRow[]
    totals: {
      ready: number
      already_invoiced: number
      skipped: number
      errors: number
      amount: string
    }
  }

  interface IBulkGeneration {
    batch_reference: string
    created: number
    failed: number
    skipped: number
    rows: IBulkPreviewRow[]
  }

  interface IAdjustment {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    invoice_id: number
    adjustment_type: AdjustmentType
    amount: string
    reason: string | null
    status: AdjustmentStatus
    late_fee_rule_id: number | null
    effective_date: string
    approved_by: number | null
    approved_at: string | null
    accounting_transaction_id: number | null
    accounting_event_status: IntegrationStatus
    accounting_last_error: string | null
    /** Joined by the list endpoint. */
    invoice_number?: string
    student_id?: number
  }

  /* ------------------------------ payments ----------------------------- */
  interface IPayment {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    payment_number: string
    student_id: number
    payer_guardian_id: number | null
    payment_date: string
    total_amount: string
    allocated_amount: string
    unallocated_amount: string
    payment_method: PaymentMethod
    payment_reference: string | null
    gateway_reference: string | null
    gateway_status: GatewayStatus
    status: PaymentStatus
    received_by: number | null
    notes: string | null
    reversed_at: string | null
    reversal_reason: string | null
    accounting_transaction_id: number | null
    accounting_event_status: IntegrationStatus
    accounting_last_error: string | null
    /** Joined by the list endpoint. */
    firstname?: string | null
    lastname?: string | null
  }

  interface IPaymentAllocation {
    id: number
    payment_id: number
    invoice_id: number
    allocated_amount: string
    allocation_date: string
    invoice_number: string
    invoice_status: InvoiceStatus
  }

  interface IPaymentDetail extends IPayment {
    allocations: IPaymentAllocation[]
  }

  interface IPaymentReceipt {
    receipt_number: string
    payment: IPaymentDetail
    student: {
      id: number
      firstname: string
      middlename?: string | null
      lastname: string
      email: string
      mobile: string
    } | null
    payer_guardian: {
      id: number
      firstname: string
      lastname: string
      mobile: string
    } | null
    currency: string
  }

  /* ------------------------------- wallets ----------------------------- */
  interface IWallet {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    student_id: number
    currency: string
    current_balance: string
    status: WalletStatus
  }

  interface IWalletTransaction {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    wallet_id: number
    transaction_type: WalletTransactionType
    amount: string
    balance_after: string
    source_type: WalletSource
    source_reference_id: number | null
    description: string | null
    created_by: number | null
  }

  interface IWalletApplyResult {
    applied_minor: number
    payment_id: number | null
    invoice_ids: number[]
    balance_remaining: string
  }

  interface IStudentStatement {
    student_id: number
    invoices: IInvoice[]
    payments: IPayment[]
    wallet_balance: string
    totals: {
      invoiced: string
      outstanding: string
      overdue_invoices: number
    }
  }

  /* ------------------------------- refunds ----------------------------- */
  interface IRefund {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    refund_number: string
    student_id: number
    payment_id: number | null
    invoice_id: number | null
    wallet_id: number | null
    refund_type: RefundType
    amount: string
    reason: string
    status: RefundStatus
    payment_method: PaymentMethod
    reference: string | null
    requested_by: number | null
    approved_by: number | null
    approved_at: string | null
    processed_at: string | null
    rejected_reason: string | null
    accounting_transaction_id: number | null
    accounting_event_status: IntegrationStatus
    accounting_last_error: string | null
  }

  /* ----------------------------- automation ---------------------------- */
  interface IDefaulterRow {
    invoice_id: number
    invoice_number: string
    issue_date: string
    due_date: string
    total_amount: string
    paid_amount: string
    outstanding_amount: string
    status: InvoiceStatus
    academic_year_id: number
    student_id: number
    firstname: string | null
    lastname: string | null
    class_name: string | null
    section_name: string | null
    guardian_id: number | null
    guardian_firstname: string | null
    guardian_lastname: string | null
    overdue_days: number
    aging_bucket: AgingBucket
  }

  interface IDefaulterList extends IList<IDefaulterRow> {
    as_of_date: string
  }

  interface IAgingSummary {
    as_of_date: string
    total_outstanding: string
    buckets: Record<AgingBucket, string>
  }

  interface IReminder {
    id: number
    created_at: string
    updated_at: string
    school_id: number
    student_id: number
    guardian_id: number | null
    invoice_id: number | null
    channel: ReminderChannel
    status: ReminderStatus
    reminder_type: string
    scheduled_for: string
    sent_at: string | null
    error: string | null
    dedupe_key: string
  }

  interface ILateFeeAssessment {
    as_of_date: string
    assessed: number
    skipped: number
    total_penalty: string
    dry_run: boolean
  }

  interface IReminderScheduleResult {
    scheduled: number
    skipped: number
    dry_run: boolean
    reminder_type: string
  }

  /* --------------------------- dashboard / reports --------------------- */
  interface IRecentInvoiceRow {
    id: number
    invoice_number: string
    student_id: number
    firstname?: string | null
    lastname?: string | null
    issue_date: string
    due_date: string
    total_amount: string
    outstanding_amount: string
    status: InvoiceStatus
  }

  interface IRecentPaymentRow {
    id: number
    payment_number: string
    student_id: number
    firstname?: string | null
    lastname?: string | null
    payment_date: string
    total_amount: string
    payment_method: PaymentMethod
    status: PaymentStatus
  }

  interface ITopOutstandingRow {
    student_id: number
    firstname: string | null
    lastname: string | null
    outstanding: string
  }

  interface IFeeDashboard {
    period: { date_from: string; date_to: string }
    totals: {
      invoiced: string
      collected: string
      outstanding: string
      overdue: string
      advances: string
      discounts: string
      refunded: string
      collection_rate: number
      invoice_count: number
      payment_count: number
      refund_count: number
    }
    daily_collection: { date: string; amount: string }[]
    monthly_collection: { month: string; amount: string }[]
    class_wise_collection: { class_name: string; amount: string }[]
    fee_type_wise: { fee_type_name: string; amount: string; discount: string }[]
    recent_payments: IRecentPaymentRow[]
    recent_invoices: IRecentInvoiceRow[]
    top_outstanding: ITopOutstandingRow[]
  }

  interface ICollectionReport {
    group_by: string
    period: { date_from: string; date_to: string }
    rows: { bucket: string; amount: string; payments: string }[]
    total: string
    note: string
  }

  interface IGroupedReportRow {
    group_by?: string
    class_id?: number
    class_name?: string
    section_id?: number
    section_name?: string
    fee_type_id?: number
    fee_type_name?: string
    bucket?: string
    invoice_count?: string | number
    payments?: string | number
    invoiced?: string
    collected?: string
    outstanding?: string
    overdue?: string
    discount?: string
    student_id?: number
    firstname?: string | null
    lastname?: string | null
  }

  interface IGroupedReport {
    group_by: string
    rows: IGroupedReportRow[]
    total?: string
    total_discount?: string
    total_refunded?: string
    total_penalty?: string
    period?: { date_from: string; date_to: string }
    note?: string
  }

  interface IDiscountReportRow {
    scholarship_id?: number
    name?: string
    code?: string
    discount_category?: DiscountCategory
    discount_type?: DiscountType
    beneficiaries?: string | number
    discount?: string
    applied?: string
  }

  interface IRefundReportRow {
    refund_number?: string
    student_id?: number
    refund_type?: RefundType
    status?: RefundStatus
    amount?: string
    created_at?: string
    processed_at?: string | null
  }

  interface IWalletReportRow {
    student_id: number
    firstname?: string | null
    lastname?: string | null
    balance?: string
    current_balance?: string
    credits?: string
    debits?: string
    last_activity_at?: string | null
  }

  interface ILateFeeReportRow {
    invoice_id?: number
    invoice_number?: string
    student_id?: number
    rule_name?: string
    amount?: string
    effective_date?: string
    status?: AdjustmentStatus
  }

  /* -------------------------- accounting bridge ------------------------ */
  interface IAccountingEventsStatus {
    summary: Record<string, number>
    unresolved: {
      id: number
      event_key: string
      event_type: string
      source_reference_id: number | null
      status: IntegrationStatus
      attempts: number
      last_error: string | null
      created_at: string
    }[]
    currency: string
  }

  interface IIntegrationRetryResult {
    processed: number
    failed: number
    results: { id?: number; status?: string; error?: string }[]
  }

  interface IAccountOption {
    id: number
    account_code: string
    account_name: string
    account_type: string
    account_subtype: string | null
    normal_balance: string
    is_active: boolean
  }

  interface IJournalEntry {
    id: number
    account_id: number
    debit_amount: string
    credit_amount: string
    description?: string | null
    account_code?: string | null
    account_name?: string | null
  }

  interface IJournalTransaction {
    id: number
    transaction_date?: string
    reference_number?: string | null
    description?: string | null
    status?: string
    total_debit?: string
    total_credit?: string
    entries?: IJournalEntry[]
    [key: string]: unknown
  }
}
