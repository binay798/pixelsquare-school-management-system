/**
 * Wire types of the accounting module.
 *
 * They mirror `backend/src/types/accounting.types.ts` and the raw rows returned
 * by the accounting services one to one. Amounts are decimal *strings*
 * (`numeric(18,2)` on the database side) — they are never converted to floats
 * for storage, only to integer minor units for display arithmetic.
 */
declare namespace Accounting {
  type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  type AccountSubtype =
    | 'CURRENT_ASSET'
    | 'CASH'
    | 'BANK'
    | 'RECEIVABLE'
    | 'PREPAID'
    | 'FIXED_ASSET'
    | 'ACCUMULATED_DEPRECIATION'
    | 'CURRENT_LIABILITY'
    | 'PAYABLE'
    | 'TAX_PAYABLE'
    | 'STUDENT_ADVANCE'
    | 'DEFERRED_REVENUE'
    | 'EQUITY'
    | 'RETAINED_EARNINGS'
    | 'OPERATING_REVENUE'
    | 'OTHER_INCOME'
    | 'OPERATING_EXPENSE'
    | 'COST_OF_SERVICES'
    | 'DEPRECIATION'
    | 'OTHER_EXPENSE'
  type NormalBalance = 'DEBIT' | 'CREDIT'
  type TransactionStatus = 'DRAFT' | 'POSTED' | 'REVERSED'
  type TransactionType =
    | 'MANUAL'
    | 'AUTOMATIC'
    | 'OPENING_BALANCE'
    | 'ADJUSTMENT'
    | 'REVERSAL'
    | 'CLOSING'
  type SourceModule =
    | 'FEE_INVOICE'
    | 'FEE_COLLECTION'
    | 'FEE_REFUND'
    | 'PAYROLL'
    | 'EXPENSE'
    | 'PURCHASE'
    | 'SUPPLIER_PAYMENT'
    | 'ASSET_PURCHASE'
    | 'DEPRECIATION'
    | 'ACCRUAL_ADJUSTMENT'
    | 'MANUAL_JOURNAL'
    | 'OPENING_BALANCE'
    | 'BANK_ADJUSTMENT'
    | 'CLOSING_ENTRY'
    | 'RECONCILIATION'
  type PartyType = 'STUDENT' | 'VENDOR' | 'EMPLOYEE' | 'OTHER'
  type PeriodStatus = 'OPEN' | 'CLOSED'

  /** Shape of `pagination()` from `backend/src/utils/pagination.ts`. */
  interface IPaginated<T> {
    total: number | string
    rows: T[]
    isLast: boolean
  }

  interface IAccount {
    id: number
    school_id: number
    account_code: string
    account_name: string
    description: string | null
    account_type: AccountType
    account_subtype: AccountSubtype | null
    parent_account_id: number | null
    normal_balance: NormalBalance
    is_system_account: boolean
    is_active: boolean
    created_at: string
    updated_at: string
  }

  /** `GET /accounting/accounts` adds the posted movement of the account. */
  interface IAccountWithBalance extends IAccount {
    total_debit: string
    total_credit: string
  }

  /** `GET /accounting/accounts/options` (feeding every account selector). */
  interface IAccountOption {
    id: number
    account_code: string
    account_name: string
    account_type: AccountType
    account_subtype: AccountSubtype | null
    normal_balance: NormalBalance
    is_active: boolean
  }

  /** `GET /accounting/accounts/tree`. */
  interface IAccountNode {
    id: number
    account_code: string
    account_name: string
    account_type: AccountType
    account_subtype: AccountSubtype | null
    parent_account_id: number | null
    normal_balance: NormalBalance
    is_system_account: boolean
    is_active: boolean
    children: IAccountNode[]
  }

  /** One posted line of the ledger of an account (`GET /accounts/:id`). */
  interface ILedgerRow {
    id: number
    transaction_id: number
    transaction_number: string
    transaction_date: string
    transaction_type: TransactionType
    source_module: SourceModule
    status: TransactionStatus
    debit_amount: string
    credit_amount: string
    description: string | null
    party_type: PartyType | null
    party_id: number | null
    line_number: number
  }

  interface IAccountDetail {
    account: IAccount
    ledger: IPaginated<ILedgerRow>
  }

  interface IPeriod {
    id: number
    school_id: number
    period_name: string
    fiscal_year: string
    start_date: string
    end_date: string
    status: PeriodStatus
    closed_by: number | null
    closed_at: string | null
    reopened_by: number | null
    reopened_at: string | null
    reopen_reason: string | null
    created_at: string
    /** Aggregates added by `GET /accounting/periods` (absent on the raw row). */
    transaction_count?: number | string
    draft_count?: number | string
    posted_debit?: string
    posted_credit?: string
  }

  /** `GET /accounting/periods/:id`. */
  interface IPeriodSummary {
    period: IPeriod
    transaction_count: number
    draft_count: number
    posted_count: number
    total_debit: string
    total_credit: string
  }

  /** Period selector row (`GET /accounting/periods/open`). */
  interface IPeriodOption {
    id: number
    period_name: string
    fiscal_year: string
    start_date: string
    end_date: string
    status: PeriodStatus
  }

  /** Journal line joined with its account (`getJournalLinesWithAccounts`). */
  interface IJournalLine {
    id: number
    transaction_id: number
    account_id: number
    description: string | null
    debit_amount: string
    credit_amount: string
    party_type: PartyType | null
    party_id: number | null
    line_number: number
    account_code: string
    account_name: string
    account_type: AccountType
    normal_balance: NormalBalance
  }

  /** Row of `GET /accounting/transactions`. */
  interface IJournal {
    id: number
    transaction_number: string
    transaction_date: string
    description: string
    reference_number: string | null
    transaction_type: TransactionType
    source_module: SourceModule
    source_reference_id: number | null
    status: TransactionStatus
    currency: string
    total_debit: string
    total_credit: string
    accounting_period_id: number | null
    period_name?: string | null
    reversal_of_transaction_id: number | null
    reversal_reason: string | null
    posted_at: string | null
    created_at: string
  }

  /** `GET /accounting/transactions/:id` = header + lines. */
  interface IJournalDetail extends IJournal {
    school_id: number
    idempotency_key: string | null
    created_by: number
    approved_by: number | null
    approved_at: string | null
    posted_by: number | null
    updated_at: string
    lines: IJournalLine[]
  }

  /** `GET /accounting/transactions/:id/validate` (dry run before posting). */
  interface IJournalValidation {
    id: number
    transaction_number: string
    status: TransactionStatus
    transaction_date: string
    line_count: number
    total_debit: string
    total_credit: string
    is_balanced: boolean
    requires_approval: boolean
    approved: boolean
    can_post: boolean
  }

  /** `POST /accounting/transactions`. */
  interface IJournalCreated {
    transaction: IJournal
    lines: IJournalLine[]
  }

  /** `PATCH /accounting/transactions/:id/reverse`. */
  interface IJournalReversal {
    reversal: IJournal
    original: IJournal
  }

  /** Aggregated payload of the accounting dashboard (real calls only). */
  interface IAccountingDashboard {
    accounts: IPaginated<IAccountWithBalance>
    periods: IPaginated<IPeriod>
    recent: IPaginated<IJournal>
    openPeriods: IPeriodOption[]
    counts: { draft: number; posted: number; reversed: number }
  }
}
