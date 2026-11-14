import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  feeServices,
  IDefaulterFilters,
  IReminderFilters,
  IReportFilters,
  IScheduleRemindersDto,
} from './fee.service'

interface InitialState {
  dashboard: { data: Fee.IFeeDashboard | null; loading: boolean }
  aging: { data: Fee.IAgingSummary | null; loading: boolean }
  defaulters: { data: Fee.IDefaulterList | null; loading: boolean }
  reminders: { data: Fee.IList<Fee.IReminder> | null; loading: boolean }
  reminderMutation: {
    loading: boolean
    scheduleResult: Fee.IReminderScheduleResult | null
    dispatchResult: { sent: number; failed: number } | null
  }
  collections: { data: Fee.ICollectionReport | null; loading: boolean }
  outstanding: { data: Fee.IGroupedReport | null; loading: boolean }
  discounts: {
    data: { rows: Fee.IDiscountReportRow[]; total_discount: string } | null
    loading: boolean
  }
  refundReport: {
    data: { rows: Fee.IRefundReportRow[]; total_refunded: string } | null
    loading: boolean
  }
  walletReport: {
    data: { rows: Fee.IWalletReportRow[]; total: number } | null
    loading: boolean
  }
  lateFeeReport: {
    data: { rows: Fee.ILateFeeReportRow[]; total_penalty: string } | null
    loading: boolean
  }
  accounting: {
    status: Fee.IAccountingEventsStatus | null
    loading: boolean
    retrying: boolean
    retryResult: Fee.IIntegrationRetryResult | null
    journal: Fee.IJournalTransaction | null
    journalLoading: boolean
  }
  accounts: { data: Fee.IAccountOption[] | null; loading: boolean }
}

const initialState: InitialState = {
  dashboard: { data: null, loading: false },
  aging: { data: null, loading: false },
  defaulters: { data: null, loading: false },
  reminders: { data: null, loading: false },
  reminderMutation: {
    loading: false,
    scheduleResult: null,
    dispatchResult: null,
  },
  collections: { data: null, loading: false },
  outstanding: { data: null, loading: false },
  discounts: { data: null, loading: false },
  refundReport: { data: null, loading: false },
  walletReport: { data: null, loading: false },
  lateFeeReport: { data: null, loading: false },
  accounting: {
    status: null,
    loading: false,
    retrying: false,
    retryResult: null,
    journal: null,
    journalLoading: false,
  },
  accounts: { data: null, loading: false },
}

/* --------------------------- dashboard / aging -------------------------- */

export const getFeeDashboardAction = createAsyncThunk(
  'feeDashboard/getDashboard',
  catchAsync(
    async (data?: { filters?: IReportFilters }) =>
      await feeServices.getFeeDashboardService(data?.filters)
  )
)

export const getAgingSummaryAction = createAsyncThunk(
  'feeDashboard/getAging',
  catchAsync(
    async (data?: { academic_year_id?: number }) =>
      await feeServices.getAgingSummaryService(data?.academic_year_id)
  )
)

export const getDefaultersAction = createAsyncThunk(
  'feeDashboard/getDefaulters',
  catchAsync(
    async (data: {
      filters?: IDefaulterFilters
      page?: number
      limit?: number
    }) =>
      await feeServices.getDefaultersService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

/* -------------------------------- reminders ----------------------------- */

export const getRemindersAction = createAsyncThunk(
  'feeDashboard/getReminders',
  catchAsync(
    async (data: {
      filters?: IReminderFilters
      page?: number
      limit?: number
    }) =>
      await feeServices.listRemindersService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const scheduleRemindersAction = createAsyncThunk(
  'feeDashboard/scheduleReminders',
  catchAsync(
    async (data: {
      payload: IScheduleRemindersDto
      onSuccess?: (result: Fee.IReminderScheduleResult) => void
    }) => {
      const res = await feeServices.scheduleRemindersService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Reminders scheduled'
  )
)

export const dispatchRemindersAction = createAsyncThunk(
  'feeDashboard/dispatchReminders',
  catchAsync(
    async (data?: { onSuccess?: (sent: number) => void }) => {
      const res = await feeServices.dispatchRemindersService()
      data?.onSuccess?.(res.sent)

      return res
    },
    true,
    false,
    'Reminders dispatched'
  )
)

/* -------------------------------- reports ------------------------------- */

export const getCollectionReportAction = createAsyncThunk(
  'feeDashboard/getCollectionReport',
  catchAsync(
    async (data: { filters?: IReportFilters }) =>
      await feeServices.getCollectionReportService(data?.filters)
  )
)

export const getOutstandingReportAction = createAsyncThunk(
  'feeDashboard/getOutstandingReport',
  catchAsync(
    async (data: { filters?: IReportFilters }) =>
      await feeServices.getOutstandingReportService(data?.filters)
  )
)

export const getDiscountReportAction = createAsyncThunk(
  'feeDashboard/getDiscountReport',
  catchAsync(
    async (data: { filters?: IReportFilters }) =>
      await feeServices.getDiscountReportService(data?.filters)
  )
)

export const getRefundReportAction = createAsyncThunk(
  'feeDashboard/getRefundReport',
  catchAsync(
    async (data: { filters?: IReportFilters }) =>
      await feeServices.getRefundReportService(data?.filters)
  )
)

export const getWalletReportAction = createAsyncThunk(
  'feeDashboard/getWalletReport',
  catchAsync(
    async (data?: { page?: number; limit?: number }) =>
      await feeServices.getWalletReportService(data?.page, data?.limit)
  )
)

export const getLateFeeReportAction = createAsyncThunk(
  'feeDashboard/getLateFeeReport',
  catchAsync(
    async (data: { filters?: IReportFilters }) =>
      await feeServices.getLateFeeReportService(data?.filters)
  )
)

/* --------------------------- accounting bridge -------------------------- */

export const getAccountingStatusAction = createAsyncThunk(
  'feeDashboard/getAccountingStatus',
  catchAsync(async () => await feeServices.getAccountingStatusService())
)

export const retryAccountingEventsAction = createAsyncThunk(
  'feeDashboard/retryAccountingEvents',
  catchAsync(
    async (data: {
      event_ids?: number[]
      limit?: number
      onSuccess?: (result: Fee.IIntegrationRetryResult) => void
    }) => {
      const res = await feeServices.retryAccountingEventsService({
        event_ids: data.event_ids,
        limit: data.limit,
      })
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Accounting events reprocessed'
  )
)

export const getJournalTransactionAction = createAsyncThunk(
  'feeDashboard/getJournalTransaction',
  catchAsync(
    async (data: { transactionId: number }) =>
      await feeServices.getJournalTransactionService(data.transactionId)
  )
)

export const getAccountOptionsAction = createAsyncThunk(
  'feeDashboard/getAccountOptions',
  catchAsync(async () => await feeServices.getAccountOptionsService())
)

const feeDashboardSlice = createSlice({
  name: 'feeDashboard',
  initialState,
  reducers: {
    resetAccountingJournal: (state) => {
      state.accounting.journal = null
    },
    resetRetryResult: (state) => {
      state.accounting.retryResult = null
    },
    resetReminderResults: (state) => {
      state.reminderMutation.scheduleResult = null
      state.reminderMutation.dispatchResult = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFeeDashboardAction.pending, (state) => {
      state.dashboard.loading = true
    })
    builder.addCase(getFeeDashboardAction.fulfilled, (state, action) => {
      state.dashboard.loading = false
      state.dashboard.data = action.payload
    })
    builder.addCase(getFeeDashboardAction.rejected, (state) => {
      state.dashboard.loading = false
    })
    builder.addCase(getAgingSummaryAction.pending, (state) => {
      state.aging.loading = true
    })
    builder.addCase(getAgingSummaryAction.fulfilled, (state, action) => {
      state.aging.loading = false
      state.aging.data = action.payload
    })
    builder.addCase(getAgingSummaryAction.rejected, (state) => {
      state.aging.loading = false
    })
    builder.addCase(getDefaultersAction.pending, (state) => {
      state.defaulters.loading = true
    })
    builder.addCase(getDefaultersAction.fulfilled, (state, action) => {
      state.defaulters.loading = false
      state.defaulters.data = action.payload
    })
    builder.addCase(getDefaultersAction.rejected, (state) => {
      state.defaulters.loading = false
    })
    builder.addCase(getRemindersAction.pending, (state) => {
      state.reminders.loading = true
    })
    builder.addCase(getRemindersAction.fulfilled, (state, action) => {
      state.reminders.loading = false
      state.reminders.data = action.payload
    })
    builder.addCase(getRemindersAction.rejected, (state) => {
      state.reminders.loading = false
    })
    builder.addCase(scheduleRemindersAction.pending, (state) => {
      state.reminderMutation.loading = true
      state.reminderMutation.scheduleResult = null
    })
    builder.addCase(scheduleRemindersAction.fulfilled, (state, action) => {
      state.reminderMutation.loading = false
      state.reminderMutation.scheduleResult = action.payload
    })
    builder.addCase(scheduleRemindersAction.rejected, (state) => {
      state.reminderMutation.loading = false
    })
    builder.addCase(dispatchRemindersAction.pending, (state) => {
      state.reminderMutation.loading = true
      state.reminderMutation.dispatchResult = null
    })
    builder.addCase(dispatchRemindersAction.fulfilled, (state, action) => {
      state.reminderMutation.loading = false
      state.reminderMutation.dispatchResult = action.payload
    })
    builder.addCase(dispatchRemindersAction.rejected, (state) => {
      state.reminderMutation.loading = false
    })

    /* -------------------------------- reports ------------------------------- */
    builder.addCase(getCollectionReportAction.pending, (state) => {
      state.collections.loading = true
    })
    builder.addCase(getCollectionReportAction.fulfilled, (state, action) => {
      state.collections.loading = false
      state.collections.data = action.payload
    })
    builder.addCase(getCollectionReportAction.rejected, (state) => {
      state.collections.loading = false
    })
    builder.addCase(getOutstandingReportAction.pending, (state) => {
      state.outstanding.loading = true
    })
    builder.addCase(getOutstandingReportAction.fulfilled, (state, action) => {
      state.outstanding.loading = false
      state.outstanding.data = action.payload
    })
    builder.addCase(getOutstandingReportAction.rejected, (state) => {
      state.outstanding.loading = false
    })
    builder.addCase(getDiscountReportAction.pending, (state) => {
      state.discounts.loading = true
    })
    builder.addCase(getDiscountReportAction.fulfilled, (state, action) => {
      state.discounts.loading = false
      state.discounts.data = action.payload
    })
    builder.addCase(getDiscountReportAction.rejected, (state) => {
      state.discounts.loading = false
    })
    builder.addCase(getRefundReportAction.pending, (state) => {
      state.refundReport.loading = true
    })
    builder.addCase(getRefundReportAction.fulfilled, (state, action) => {
      state.refundReport.loading = false
      state.refundReport.data = action.payload
    })
    builder.addCase(getRefundReportAction.rejected, (state) => {
      state.refundReport.loading = false
    })
    builder.addCase(getWalletReportAction.pending, (state) => {
      state.walletReport.loading = true
    })
    builder.addCase(getWalletReportAction.fulfilled, (state, action) => {
      state.walletReport.loading = false
      state.walletReport.data = action.payload
    })
    builder.addCase(getWalletReportAction.rejected, (state) => {
      state.walletReport.loading = false
    })
    builder.addCase(getLateFeeReportAction.pending, (state) => {
      state.lateFeeReport.loading = true
    })
    builder.addCase(getLateFeeReportAction.fulfilled, (state, action) => {
      state.lateFeeReport.loading = false
      state.lateFeeReport.data = action.payload
    })
    builder.addCase(getLateFeeReportAction.rejected, (state) => {
      state.lateFeeReport.loading = false
    })

    /* ----------------------------- accounting bridge ------------------------ */
    builder.addCase(getAccountingStatusAction.pending, (state) => {
      state.accounting.loading = true
    })
    builder.addCase(getAccountingStatusAction.fulfilled, (state, action) => {
      state.accounting.loading = false
      state.accounting.status = action.payload
    })
    builder.addCase(getAccountingStatusAction.rejected, (state) => {
      state.accounting.loading = false
    })
    builder.addCase(retryAccountingEventsAction.pending, (state) => {
      state.accounting.retrying = true
      state.accounting.retryResult = null
    })
    builder.addCase(retryAccountingEventsAction.fulfilled, (state, action) => {
      state.accounting.retrying = false
      state.accounting.retryResult = action.payload
    })
    builder.addCase(retryAccountingEventsAction.rejected, (state) => {
      state.accounting.retrying = false
    })
    builder.addCase(getJournalTransactionAction.pending, (state) => {
      state.accounting.journalLoading = true
      state.accounting.journal = null
    })
    builder.addCase(getJournalTransactionAction.fulfilled, (state, action) => {
      state.accounting.journalLoading = false
      state.accounting.journal = action.payload
    })
    builder.addCase(getJournalTransactionAction.rejected, (state) => {
      state.accounting.journalLoading = false
    })
    builder.addCase(getAccountOptionsAction.pending, (state) => {
      state.accounts.loading = true
    })
    builder.addCase(getAccountOptionsAction.fulfilled, (state, action) => {
      state.accounts.loading = false
      state.accounts.data = action.payload
    })
    builder.addCase(getAccountOptionsAction.rejected, (state) => {
      state.accounts.loading = false
    })
  },
})

export const {
  resetAccountingJournal,
  resetRetryResult,
  resetReminderResults,
} = feeDashboardSlice.actions
export default feeDashboardSlice.reducer
