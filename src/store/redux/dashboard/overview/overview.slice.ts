import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { errResponse } from '@src/helpers/errResponse.helper'
import { overviewServices, TOverviewRange } from './overview.service'

interface InitialState {
  summary: Dashboard.IWidget<Dashboard.ISummary>
  academics: Dashboard.IWidget<Dashboard.IAcademics>
  finance: Dashboard.IWidget<Dashboard.IFinance>
  feed: Dashboard.IWidget<Dashboard.IFeed>
}

const initialState: InitialState = {
  summary: { data: null, loading: false, error: null },
  academics: { data: null, loading: false, error: null },
  finance: { data: null, loading: false, error: null },
  feed: { data: null, loading: false, error: null },
}

/** `errResponse` may return one message per validated field. */
const toMessage = (error: unknown) => {
  const message: unknown = errResponse(error)

  if (Array.isArray(message)) {
    return message.join(' ').trim() || 'Unable to load the dashboard.'
  }

  return String(message ?? '').trim() || 'Unable to load the dashboard.'
}

export const loadDashboardSummary = createAsyncThunk<
  Dashboard.ISummary,
  TOverviewRange,
  { rejectValue: string }
>('dashboardOverview/summary', async (range, { rejectWithValue }) => {
  try {
    return await overviewServices.getSummaryService(range)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const loadDashboardAcademics = createAsyncThunk<
  Dashboard.IAcademics,
  TOverviewRange,
  { rejectValue: string }
>('dashboardOverview/academics', async (range, { rejectWithValue }) => {
  try {
    return await overviewServices.getAcademicsService(range)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const loadDashboardFinance = createAsyncThunk<
  Dashboard.IFinance,
  TOverviewRange,
  { rejectValue: string }
>('dashboardOverview/finance', async (range, { rejectWithValue }) => {
  try {
    return await overviewServices.getFinanceService(range)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

export const loadDashboardFeed = createAsyncThunk<
  Dashboard.IFeed,
  { limit?: number } | undefined,
  { rejectValue: string }
>('dashboardOverview/feed', async (params, { rejectWithValue }) => {
  try {
    return await overviewServices.getFeedService(params?.limit ?? 12)
  } catch (error) {
    return rejectWithValue(toMessage(error))
  }
})

const dashboardOverviewSlice = createSlice({
  name: 'dashboardOverview',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardSummary.pending, (state) => {
        state.summary.loading = true
        state.summary.error = null
      })
      .addCase(loadDashboardSummary.fulfilled, (state, action) => {
        state.summary.loading = false
        state.summary.data = action.payload
        state.summary.error = null
      })
      .addCase(loadDashboardSummary.rejected, (state, action) => {
        state.summary.loading = false
        state.summary.error = action.payload ?? 'Unable to load the overview.'
      })

    builder
      .addCase(loadDashboardAcademics.pending, (state) => {
        state.academics.loading = true
        state.academics.error = null
      })
      .addCase(loadDashboardAcademics.fulfilled, (state, action) => {
        state.academics.loading = false
        state.academics.data = action.payload
        state.academics.error = null
      })
      .addCase(loadDashboardAcademics.rejected, (state, action) => {
        state.academics.loading = false
        state.academics.error =
          action.payload ?? 'Unable to load the academic overview.'
      })

    builder
      .addCase(loadDashboardFinance.pending, (state) => {
        state.finance.loading = true
        state.finance.error = null
      })
      .addCase(loadDashboardFinance.fulfilled, (state, action) => {
        state.finance.loading = false
        state.finance.data = action.payload
        state.finance.error = null
      })
      .addCase(loadDashboardFinance.rejected, (state, action) => {
        state.finance.loading = false
        state.finance.error =
          action.payload ?? 'Unable to load the financial overview.'
      })

    builder
      .addCase(loadDashboardFeed.pending, (state) => {
        state.feed.loading = true
        state.feed.error = null
      })
      .addCase(loadDashboardFeed.fulfilled, (state, action) => {
        state.feed.loading = false
        state.feed.data = action.payload
        state.feed.error = null
      })
      .addCase(loadDashboardFeed.rejected, (state, action) => {
        state.feed.loading = false
        state.feed.error = action.payload ?? 'Unable to load the activity feed.'
      })
  },
})

export default dashboardOverviewSlice.reducer
