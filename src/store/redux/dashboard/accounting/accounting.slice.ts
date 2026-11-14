import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  accountingServices,
  IAccountFilters,
  ICreateAccountDto,
  ICreateJournalDto,
  ICreatePeriodDto,
  IJournalFilters,
  ILedgerFilters,
  IPeriodFilters,
  IReverseJournalDto,
  IUpdateAccountDto,
} from './accounting.service'

interface InitialState {
  dashboard: { data: Accounting.IAccountingDashboard | null; loading: boolean }
  accounts: {
    data: Accounting.IPaginated<Accounting.IAccountWithBalance> | null
    loading: boolean
  }
  accountTree: { data: Accounting.IAccountNode[] | null; loading: boolean }
  accountOptions: { data: Accounting.IAccountOption[] | null; loading: boolean }
  accountDetail: { data: Accounting.IAccountDetail | null; loading: boolean }
  accountMutation: { loading: boolean }
  chartSetup: { loading: boolean }
  journals: {
    data: Accounting.IPaginated<Accounting.IJournal> | null
    loading: boolean
  }
  journalDetail: { data: Accounting.IJournalDetail | null; loading: boolean }
  journalValidation: {
    data: Accounting.IJournalValidation | null
    loading: boolean
  }
  journalMutation: { loading: boolean }
  periods: {
    data: Accounting.IPaginated<Accounting.IPeriod> | null
    loading: boolean
  }
  openPeriods: { data: Accounting.IPeriodOption[] | null; loading: boolean }
  periodDetail: { data: Accounting.IPeriodSummary | null; loading: boolean }
  periodMutation: { loading: boolean }
}

const initialState: InitialState = {
  dashboard: { data: null, loading: false },
  accounts: { data: null, loading: false },
  accountTree: { data: null, loading: false },
  accountOptions: { data: null, loading: false },
  accountDetail: { data: null, loading: false },
  accountMutation: { loading: false },
  chartSetup: { loading: false },
  journals: { data: null, loading: false },
  journalDetail: { data: null, loading: false },
  journalValidation: { data: null, loading: false },
  journalMutation: { loading: false },
  periods: { data: null, loading: false },
  openPeriods: { data: null, loading: false },
  periodDetail: { data: null, loading: false },
  periodMutation: { loading: false },
}

type TListRequest<F> = { filters?: F; page?: number; limit?: number }

/* -------------------------------- dashboard ------------------------------- */

export const getAccountingDashboardAction = createAsyncThunk<
  Accounting.IAccountingDashboard,
  void
>(
  'accounting/getDashboard',
  catchAsync<Accounting.IAccountingDashboard, void>(
    async () => await accountingServices.getDashboardService()
  )
)

/* ---------------------------- chart of accounts --------------------------- */

export const getAccountsAction = createAsyncThunk(
  'accounting/getAccounts',
  catchAsync(
    async (data: TListRequest<IAccountFilters>) =>
      await accountingServices.listAccountsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getAccountTreeAction = createAsyncThunk(
  'accounting/getAccountTree',
  catchAsync(
    async (data: { filters?: IAccountFilters }) =>
      await accountingServices.getAccountTreeService(data?.filters)
  )
)

export const getAccountOptionsAction = createAsyncThunk(
  'accounting/getAccountOptions',
  catchAsync(
    async (data: { activeOnly?: boolean }) =>
      await accountingServices.listAccountOptionsService(data?.activeOnly)
  )
)

export const getAccountDetailAction = createAsyncThunk(
  'accounting/getAccountDetail',
  catchAsync(
    async (data: {
      accountId: number
      filters?: ILedgerFilters
      page?: number
      limit?: number
    }) =>
      await accountingServices.getAccountService(
        data.accountId,
        data.filters,
        data.page,
        data.limit
      )
  )
)

export const createAccountAction = createAsyncThunk(
  'accounting/createAccount',
  catchAsync(
    async (data: { payload: ICreateAccountDto; onSuccess?: () => void }) => {
      const res = await accountingServices.createAccountService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Account created'
  )
)

export const updateAccountAction = createAsyncThunk(
  'accounting/updateAccount',
  catchAsync(
    async (data: {
      accountId: number
      payload: IUpdateAccountDto
      onSuccess?: () => void
    }) => {
      const res = await accountingServices.updateAccountService(
        data.accountId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Account updated'
  )
)

export const deleteAccountAction = createAsyncThunk(
  'accounting/deleteAccount',
  catchAsync(
    async (data: { accountId: number; onSuccess?: () => void }) => {
      const res = await accountingServices.deleteAccountService(data.accountId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Account deactivated'
  )
)

export const setupChartOfAccountsAction = createAsyncThunk(
  'accounting/setupChart',
  catchAsync(
    async (data: { onSuccess?: () => void }) => {
      const res = await accountingServices.setupChartOfAccountsService()
      data?.onSuccess?.()

      return res
    },
    true,
    false,
    'Default chart of accounts provisioned'
  )
)

/* ---------------------------- journal transactions ------------------------ */

export const getJournalsAction = createAsyncThunk(
  'accounting/getJournals',
  catchAsync(
    async (data: TListRequest<IJournalFilters>) =>
      await accountingServices.listJournalsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getJournalDetailAction = createAsyncThunk(
  'accounting/getJournalDetail',
  catchAsync(
    async (data: { transactionId: number }) =>
      await accountingServices.getJournalService(data.transactionId)
  )
)

export const validateJournalAction = createAsyncThunk(
  'accounting/validateJournal',
  catchAsync(
    async (data: { transactionId: number }) =>
      await accountingServices.validateJournalService(data.transactionId)
  )
)

export const createJournalAction = createAsyncThunk(
  'accounting/createJournal',
  catchAsync(
    async (data: {
      payload: ICreateJournalDto
      onSuccess?: (created: Accounting.IJournalCreated) => void
    }) => {
      const res = await accountingServices.createJournalService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Journal entry created'
  )
)

export const approveJournalAction = createAsyncThunk(
  'accounting/approveJournal',
  catchAsync(
    async (data: { transactionId: number; onSuccess?: () => void }) => {
      const res = await accountingServices.approveJournalService(
        data.transactionId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Journal entry approved'
  )
)

export const postJournalAction = createAsyncThunk(
  'accounting/postJournal',
  catchAsync(
    async (data: { transactionId: number; onSuccess?: () => void }) => {
      const res = await accountingServices.postJournalService(
        data.transactionId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Journal entry posted'
  )
)

export const reverseJournalAction = createAsyncThunk(
  'accounting/reverseJournal',
  catchAsync(
    async (data: {
      transactionId: number
      payload: IReverseJournalDto
      onSuccess?: () => void
    }) => {
      const res = await accountingServices.reverseJournalService(
        data.transactionId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Journal entry reversed'
  )
)

/* ------------------------------ fiscal periods ---------------------------- */

export const getPeriodsAction = createAsyncThunk(
  'accounting/getPeriods',
  catchAsync(
    async (data: TListRequest<IPeriodFilters>) =>
      await accountingServices.listPeriodsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getOpenPeriodsAction = createAsyncThunk(
  'accounting/getOpenPeriods',
  catchAsync(
    async (data: { fiscalYear?: string }) =>
      await accountingServices.getOpenPeriodsService(data?.fiscalYear)
  )
)

export const getPeriodDetailAction = createAsyncThunk(
  'accounting/getPeriodDetail',
  catchAsync(
    async (data: { periodId: number }) =>
      await accountingServices.getPeriodService(data.periodId)
  )
)

export const createPeriodAction = createAsyncThunk(
  'accounting/createPeriod',
  catchAsync(
    async (data: { payload: ICreatePeriodDto; onSuccess?: () => void }) => {
      const res = await accountingServices.createPeriodService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Accounting period created'
  )
)

export const closePeriodAction = createAsyncThunk(
  'accounting/closePeriod',
  catchAsync(
    async (data: { periodId: number; onSuccess?: () => void }) => {
      const res = await accountingServices.closePeriodService(data.periodId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Accounting period closed'
  )
)

export const reopenPeriodAction = createAsyncThunk(
  'accounting/reopenPeriod',
  catchAsync(
    async (data: {
      periodId: number
      reopenReason: string
      onSuccess?: () => void
    }) => {
      const res = await accountingServices.reopenPeriodService(
        data.periodId,
        data.reopenReason
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Accounting period reopened'
  )
)

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {
    resetAccountDetail: (state) => {
      state.accountDetail.data = null
    },
    resetJournalDetail: (state) => {
      state.journalDetail.data = null
      state.journalValidation.data = null
    },
    resetJournalValidation: (state) => {
      state.journalValidation.data = null
    },
    resetPeriodDetail: (state) => {
      state.periodDetail.data = null
    },
  },
  extraReducers: (builder) => {
    /* -------------------------------- dashboard ------------------------------ */
    builder.addCase(getAccountingDashboardAction.pending, (state) => {
      state.dashboard.loading = true
    })
    builder.addCase(getAccountingDashboardAction.fulfilled, (state, action) => {
      state.dashboard.loading = false
      state.dashboard.data = action.payload
    })
    builder.addCase(getAccountingDashboardAction.rejected, (state) => {
      state.dashboard.loading = false
    })

    /* --------------------------------- accounts ------------------------------ */
    builder.addCase(getAccountsAction.pending, (state) => {
      state.accounts.loading = true
    })
    builder.addCase(getAccountsAction.fulfilled, (state, action) => {
      state.accounts.loading = false
      state.accounts.data = action.payload
    })
    builder.addCase(getAccountsAction.rejected, (state) => {
      state.accounts.loading = false
    })

    builder.addCase(getAccountTreeAction.pending, (state) => {
      state.accountTree.loading = true
    })
    builder.addCase(getAccountTreeAction.fulfilled, (state, action) => {
      state.accountTree.loading = false
      state.accountTree.data = action.payload
    })
    builder.addCase(getAccountTreeAction.rejected, (state) => {
      state.accountTree.loading = false
    })

    builder.addCase(getAccountOptionsAction.pending, (state) => {
      state.accountOptions.loading = true
    })
    builder.addCase(getAccountOptionsAction.fulfilled, (state, action) => {
      state.accountOptions.loading = false
      state.accountOptions.data = action.payload
    })
    builder.addCase(getAccountOptionsAction.rejected, (state) => {
      state.accountOptions.loading = false
    })

    builder.addCase(getAccountDetailAction.pending, (state) => {
      state.accountDetail.loading = true
    })
    builder.addCase(getAccountDetailAction.fulfilled, (state, action) => {
      state.accountDetail.loading = false
      state.accountDetail.data = action.payload
    })
    builder.addCase(getAccountDetailAction.rejected, (state) => {
      state.accountDetail.loading = false
    })

    builder.addCase(createAccountAction.pending, (state) => {
      state.accountMutation.loading = true
    })
    builder.addCase(createAccountAction.fulfilled, (state) => {
      state.accountMutation.loading = false
    })
    builder.addCase(createAccountAction.rejected, (state) => {
      state.accountMutation.loading = false
    })

    builder.addCase(updateAccountAction.pending, (state) => {
      state.accountMutation.loading = true
    })
    builder.addCase(updateAccountAction.fulfilled, (state) => {
      state.accountMutation.loading = false
    })
    builder.addCase(updateAccountAction.rejected, (state) => {
      state.accountMutation.loading = false
    })

    builder.addCase(deleteAccountAction.pending, (state) => {
      state.accountMutation.loading = true
    })
    builder.addCase(deleteAccountAction.fulfilled, (state) => {
      state.accountMutation.loading = false
    })
    builder.addCase(deleteAccountAction.rejected, (state) => {
      state.accountMutation.loading = false
    })

    builder.addCase(setupChartOfAccountsAction.pending, (state) => {
      state.chartSetup.loading = true
    })
    builder.addCase(setupChartOfAccountsAction.fulfilled, (state) => {
      state.chartSetup.loading = false
    })
    builder.addCase(setupChartOfAccountsAction.rejected, (state) => {
      state.chartSetup.loading = false
    })

    /* --------------------------------- journals ------------------------------ */
    builder.addCase(getJournalsAction.pending, (state) => {
      state.journals.loading = true
    })
    builder.addCase(getJournalsAction.fulfilled, (state, action) => {
      state.journals.loading = false
      state.journals.data = action.payload
    })
    builder.addCase(getJournalsAction.rejected, (state) => {
      state.journals.loading = false
    })

    builder.addCase(getJournalDetailAction.pending, (state) => {
      state.journalDetail.loading = true
    })
    builder.addCase(getJournalDetailAction.fulfilled, (state, action) => {
      state.journalDetail.loading = false
      state.journalDetail.data = action.payload
    })
    builder.addCase(getJournalDetailAction.rejected, (state) => {
      state.journalDetail.loading = false
    })

    builder.addCase(validateJournalAction.pending, (state) => {
      state.journalValidation.loading = true
    })
    builder.addCase(validateJournalAction.fulfilled, (state, action) => {
      state.journalValidation.loading = false
      state.journalValidation.data = action.payload
    })
    builder.addCase(validateJournalAction.rejected, (state) => {
      state.journalValidation.loading = false
    })

    builder.addCase(createJournalAction.pending, (state) => {
      state.journalMutation.loading = true
    })
    builder.addCase(createJournalAction.fulfilled, (state) => {
      state.journalMutation.loading = false
    })
    builder.addCase(createJournalAction.rejected, (state) => {
      state.journalMutation.loading = false
    })

    builder.addCase(approveJournalAction.pending, (state) => {
      state.journalMutation.loading = true
    })
    builder.addCase(approveJournalAction.fulfilled, (state) => {
      state.journalMutation.loading = false
    })
    builder.addCase(approveJournalAction.rejected, (state) => {
      state.journalMutation.loading = false
    })

    builder.addCase(postJournalAction.pending, (state) => {
      state.journalMutation.loading = true
    })
    builder.addCase(postJournalAction.fulfilled, (state) => {
      state.journalMutation.loading = false
    })
    builder.addCase(postJournalAction.rejected, (state) => {
      state.journalMutation.loading = false
    })

    builder.addCase(reverseJournalAction.pending, (state) => {
      state.journalMutation.loading = true
    })
    builder.addCase(reverseJournalAction.fulfilled, (state) => {
      state.journalMutation.loading = false
    })
    builder.addCase(reverseJournalAction.rejected, (state) => {
      state.journalMutation.loading = false
    })

    /* ------------------------------ fiscal periods ---------------------------- */
    builder.addCase(getPeriodsAction.pending, (state) => {
      state.periods.loading = true
    })
    builder.addCase(getPeriodsAction.fulfilled, (state, action) => {
      state.periods.loading = false
      state.periods.data = action.payload
    })
    builder.addCase(getPeriodsAction.rejected, (state) => {
      state.periods.loading = false
    })

    builder.addCase(getOpenPeriodsAction.pending, (state) => {
      state.openPeriods.loading = true
    })
    builder.addCase(getOpenPeriodsAction.fulfilled, (state, action) => {
      state.openPeriods.loading = false
      state.openPeriods.data = action.payload
    })
    builder.addCase(getOpenPeriodsAction.rejected, (state) => {
      state.openPeriods.loading = false
    })

    builder.addCase(getPeriodDetailAction.pending, (state) => {
      state.periodDetail.loading = true
    })
    builder.addCase(getPeriodDetailAction.fulfilled, (state, action) => {
      state.periodDetail.loading = false
      state.periodDetail.data = action.payload
    })
    builder.addCase(getPeriodDetailAction.rejected, (state) => {
      state.periodDetail.loading = false
    })

    builder.addCase(createPeriodAction.pending, (state) => {
      state.periodMutation.loading = true
    })
    builder.addCase(createPeriodAction.fulfilled, (state) => {
      state.periodMutation.loading = false
    })
    builder.addCase(createPeriodAction.rejected, (state) => {
      state.periodMutation.loading = false
    })

    builder.addCase(closePeriodAction.pending, (state) => {
      state.periodMutation.loading = true
    })
    builder.addCase(closePeriodAction.fulfilled, (state) => {
      state.periodMutation.loading = false
    })
    builder.addCase(closePeriodAction.rejected, (state) => {
      state.periodMutation.loading = false
    })

    builder.addCase(reopenPeriodAction.pending, (state) => {
      state.periodMutation.loading = true
    })
    builder.addCase(reopenPeriodAction.fulfilled, (state) => {
      state.periodMutation.loading = false
    })
    builder.addCase(reopenPeriodAction.rejected, (state) => {
      state.periodMutation.loading = false
    })
  },
})

export const {
  resetAccountDetail,
  resetJournalDetail,
  resetJournalValidation,
  resetPeriodDetail,
} = accountingSlice.actions
export default accountingSlice.reducer
