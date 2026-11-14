import { api } from '@src/helpers/api.helpers'

/**
 * Accounting API client.
 *
 * Every function maps to exactly one route of
 * `backend/src/accounting/accounting.routes.ts` (mounted at `/accounting`):
 *
 *  - `/accounting/accounts`     chart of accounts + ledger of one account
 *  - `/accounting/transactions` journal entries and their workflow
 *  - `/accounting/periods`      fiscal periods (close / reopen)
 *
 * Nothing is invented here: payloads mirror the zod schemas of the backend and
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

export interface IAccountFilters {
  account_type?: Accounting.AccountType
  account_subtype?: Accounting.AccountSubtype
  parent_account_id?: number
  is_active?: boolean
  search?: string
}

export interface IJournalFilters {
  status?: Accounting.TransactionStatus
  transaction_type?: Accounting.TransactionType
  source_module?: Accounting.SourceModule
  date_from?: string
  date_to?: string
  account_id?: number
  created_by?: number
  search?: string
}

export interface IPeriodFilters {
  status?: Accounting.PeriodStatus
  fiscal_year?: string
}

export interface ILedgerFilters {
  date_from?: string
  date_to?: string
}

export interface ICreateAccountDto {
  account_code: string
  account_name: string
  description?: string
  account_type: Accounting.AccountType
  account_subtype?: Accounting.AccountSubtype
  parent_account_id?: number | null
  is_active?: boolean
}

export interface IUpdateAccountDto {
  account_name?: string
  description?: string | null
  parent_account_id?: number | null
  normal_balance?: Accounting.NormalBalance
  is_active?: boolean
}

export interface IJournalLineDto {
  account_id: number
  description?: string
  debit_amount?: string
  credit_amount?: string
  party_type?: Accounting.PartyType
  party_id?: number
}

export interface ICreateJournalDto {
  transaction_date: string
  description: string
  reference_number?: string
  transaction_type?: Accounting.TransactionType
  source_module?: Accounting.SourceModule
  idempotency_key?: string
  auto_post?: boolean
  lines: IJournalLineDto[]
}

export interface IReverseJournalDto {
  reason: string
  reversal_date?: string
}

export interface ICreatePeriodDto {
  period_name: string
  start_date: string
  end_date: string
  fiscal_year?: string
}

/* ------------------------------------------------------------------ *
 * Chart of accounts
 * ------------------------------------------------------------------ */

const listAccountsService = async (
  filters: IAccountFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<
    Api.Base<Accounting.IPaginated<Accounting.IAccountWithBalance>>
  >('get')('accounting/accounts', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const getAccountTreeService = async (filters: IAccountFilters = {}) => {
  const res = await api<Api.Base<{ accounts: Accounting.IAccountNode[] }>>(
    'get'
  )('accounting/accounts/tree', compact({ ...filters }))

  return unwrap(res).accounts
}

const listAccountOptionsService = async (activeOnly = true) => {
  const res = await api<Api.Base<{ accounts: Accounting.IAccountOption[] }>>(
    'get'
  )('accounting/accounts/options', compact({ active_only: activeOnly }))

  return unwrap(res).accounts
}

/** Account header + paged ledger (`GET /accounting/accounts/:accountId`). */
const getAccountService = async (
  accountId: number,
  filters: ILedgerFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Accounting.IAccountDetail>>('get')(
    `accounting/accounts/${accountId}`,
    { ...compact({ ...filters }), ...paginate(page, limit) }
  )

  return unwrap(res)
}

const createAccountService = async (payload: ICreateAccountDto) => {
  const res = await api<Api.Base<Accounting.IAccount>>('post')(
    'accounting/accounts',
    undefined,
    payload
  )

  return unwrap(res)
}

const updateAccountService = async (
  accountId: number,
  payload: IUpdateAccountDto
) => {
  const res = await api<Api.Base<Accounting.IAccount>>('patch')(
    `accounting/accounts/${accountId}`,
    undefined,
    payload
  )

  return unwrap(res)
}

/** System accounts are deactivated server side, never hard deleted. */
const deleteAccountService = async (accountId: number) => {
  const res = await api<Api.Base<Record<string, never>>>('delete')(
    `accounting/accounts/${accountId}`
  )

  return unwrap(res)
}

/** Idempotent provisioning of the default chart of accounts. */
const setupChartOfAccountsService = async () => {
  const res = await api<Api.Base<{ created: number; skipped: number }>>('post')(
    'accounting/accounts/setup'
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Journal transactions
 * ------------------------------------------------------------------ */

const listJournalsService = async (
  filters: IJournalFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Accounting.IPaginated<Accounting.IJournal>>>(
    'get'
  )('accounting/transactions', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const getJournalService = async (transactionId: number) => {
  const res = await api<Api.Base<Accounting.IJournalDetail>>('get')(
    `accounting/transactions/${transactionId}`
  )

  return unwrap(res)
}

const validateJournalService = async (transactionId: number) => {
  const res = await api<Api.Base<Accounting.IJournalValidation>>('get')(
    `accounting/transactions/${transactionId}/validate`
  )

  return unwrap(res)
}

const createJournalService = async (payload: ICreateJournalDto) => {
  const res = await api<Api.Base<Accounting.IJournalCreated>>('post')(
    'accounting/transactions',
    undefined,
    payload
  )

  return unwrap(res)
}

const approveJournalService = async (transactionId: number) => {
  const res = await api<Api.Base<Accounting.IJournal>>('patch')(
    `accounting/transactions/${transactionId}/approve`
  )

  return unwrap(res)
}

const postJournalService = async (transactionId: number) => {
  const res = await api<Api.Base<Accounting.IJournal>>('patch')(
    `accounting/transactions/${transactionId}/post`
  )

  return unwrap(res)
}

const reverseJournalService = async (
  transactionId: number,
  payload: IReverseJournalDto
) => {
  const res = await api<Api.Base<Accounting.IJournalReversal>>('patch')(
    `accounting/transactions/${transactionId}/reverse`,
    undefined,
    payload
  )

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Accounting periods
 * ------------------------------------------------------------------ */

const listPeriodsService = async (
  filters: IPeriodFilters = {},
  page = 1,
  limit = 20
) => {
  const res = await api<Api.Base<Accounting.IPaginated<Accounting.IPeriod>>>(
    'get'
  )('accounting/periods', {
    ...compact({ ...filters }),
    ...paginate(page, limit),
  })

  return unwrap(res)
}

const getOpenPeriodsService = async (fiscalYear?: string) => {
  const res = await api<Api.Base<{ periods: Accounting.IPeriodOption[] }>>(
    'get'
  )('accounting/periods/open', compact({ fiscal_year: fiscalYear }))

  return unwrap(res).periods
}

const getPeriodService = async (periodId: number) => {
  const res = await api<Api.Base<Accounting.IPeriodSummary>>('get')(
    `accounting/periods/${periodId}`
  )

  return unwrap(res)
}

const createPeriodService = async (payload: ICreatePeriodDto) => {
  const res = await api<Api.Base<Accounting.IPeriod>>('post')(
    'accounting/periods',
    undefined,
    payload
  )

  return unwrap(res)
}

const closePeriodService = async (periodId: number) => {
  const res = await api<Api.Base<Accounting.IPeriod>>('patch')(
    `accounting/periods/${periodId}/close`
  )

  return unwrap(res)
}

const reopenPeriodService = async (periodId: number, reopenReason: string) => {
  const res = await api<Api.Base<Accounting.IPeriod>>('patch')(
    `accounting/periods/${periodId}/reopen`,
    undefined,
    { reopen_reason: reopenReason }
  )

  return unwrap(res)
}

/** Resolve (and create on demand) the period that covers a date. */
const ensurePeriodService = async (date: string) => {
  const res = await api<
    Api.Base<{ period: Accounting.IPeriod; fiscal_year: string }>
  >('post')('accounting/periods/ensure', undefined, { date })

  return unwrap(res)
}

/* ------------------------------------------------------------------ *
 * Dashboard aggregate (several real calls, nothing derived)
 * ------------------------------------------------------------------ */

const getDashboardService =
  async (): Promise<Accounting.IAccountingDashboard> => {
    const [accounts, periods, recent, openPeriods, drafts, posted, reversed] =
      await Promise.all([
        listAccountsService({}, 1, 200),
        listPeriodsService({}, 1, 12),
        listJournalsService({}, 1, 8),
        getOpenPeriodsService(),
        listJournalsService({ status: 'DRAFT' }, 1, 1),
        listJournalsService({ status: 'POSTED' }, 1, 1),
        listJournalsService({ status: 'REVERSED' }, 1, 1),
      ])

    return {
      accounts,
      periods,
      recent,
      openPeriods,
      counts: {
        draft: Number(drafts.total ?? 0),
        posted: Number(posted.total ?? 0),
        reversed: Number(reversed.total ?? 0),
      },
    }
  }

export const accountingServices = {
  /* accounts */
  listAccountsService,
  getAccountTreeService,
  listAccountOptionsService,
  getAccountService,
  createAccountService,
  updateAccountService,
  deleteAccountService,
  setupChartOfAccountsService,
  /* journals */
  listJournalsService,
  getJournalService,
  validateJournalService,
  createJournalService,
  approveJournalService,
  postJournalService,
  reverseJournalService,
  /* periods */
  listPeriodsService,
  getOpenPeriodsService,
  getPeriodService,
  createPeriodService,
  closePeriodService,
  reopenPeriodService,
  ensurePeriodService,
  /* dashboard */
  getDashboardService,
}
