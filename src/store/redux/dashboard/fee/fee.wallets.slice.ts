import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { feeServices } from './fee.service'

interface InitialState {
  wallet: { data: Fee.IWallet | null; loading: boolean }
  transactions: {
    data: (Fee.IList<Fee.IWalletTransaction> & { wallet: Fee.IWallet }) | null
    loading: boolean
  }
  statement: { data: Fee.IStudentStatement | null; loading: boolean }
}

const initialState: InitialState = {
  wallet: { data: null, loading: false },
  transactions: { data: null, loading: false },
  statement: { data: null, loading: false },
}

export const getWalletAction = createAsyncThunk(
  'feeWallets/getWallet',
  catchAsync(
    async (data: { studentId: number }) =>
      await feeServices.getStudentWalletService(data.studentId)
  )
)

export const getWalletTransactionsAction = createAsyncThunk(
  'feeWallets/getTransactions',
  catchAsync(
    async (data: {
      studentId: number
      page?: number
      limit?: number
      date_from?: string
      date_to?: string
    }) =>
      await feeServices.getWalletTransactionsService(
        data.studentId,
        data.page,
        data.limit,
        { date_from: data.date_from, date_to: data.date_to }
      )
  )
)

export const getStudentStatementAction = createAsyncThunk(
  'feeWallets/getStatement',
  catchAsync(
    async (data: {
      studentId: number
      academic_year_id?: number
      date_from?: string
      date_to?: string
    }) =>
      await feeServices.getStudentStatementService(data.studentId, {
        academic_year_id: data.academic_year_id,
        date_from: data.date_from,
        date_to: data.date_to,
      })
  )
)

const feeWalletsSlice = createSlice({
  name: 'feeWallets',
  initialState,
  reducers: {
    resetWallet: (state) => {
      state.wallet.data = null
      state.transactions.data = null
      state.statement.data = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWalletAction.pending, (state) => {
      state.wallet.loading = true
    })
    builder.addCase(getWalletAction.fulfilled, (state, action) => {
      state.wallet.loading = false
      state.wallet.data = action.payload
    })
    builder.addCase(getWalletAction.rejected, (state) => {
      state.wallet.loading = false
    })
    builder.addCase(getWalletTransactionsAction.pending, (state) => {
      state.transactions.loading = true
    })
    builder.addCase(getWalletTransactionsAction.fulfilled, (state, action) => {
      state.transactions.loading = false
      state.transactions.data = action.payload
    })
    builder.addCase(getWalletTransactionsAction.rejected, (state) => {
      state.transactions.loading = false
    })
    builder.addCase(getStudentStatementAction.pending, (state) => {
      state.statement.loading = true
    })
    builder.addCase(getStudentStatementAction.fulfilled, (state, action) => {
      state.statement.loading = false
      state.statement.data = action.payload
    })
    builder.addCase(getStudentStatementAction.rejected, (state) => {
      state.statement.loading = false
    })
  },
})

export const { resetWallet } = feeWalletsSlice.actions
export default feeWalletsSlice.reducer
