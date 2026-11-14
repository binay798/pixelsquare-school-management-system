import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  feeServices,
  IAdjustmentFilters,
  ICreateAdjustmentDto,
  IRefundFilters,
  IRequestRefundDto,
} from './fee.service'

interface InitialState {
  refunds: { data: Fee.IList<Fee.IRefund> | null; loading: boolean }
  refundMutation: { loading: boolean }
  adjustments: { data: Fee.IList<Fee.IAdjustment> | null; loading: boolean }
  adjustmentMutation: { loading: boolean }
}

const initialState: InitialState = {
  refunds: { data: null, loading: false },
  refundMutation: { loading: false },
  adjustments: { data: null, loading: false },
  adjustmentMutation: { loading: false },
}

/* -------------------------------- refunds ------------------------------- */

export const getRefundsAction = createAsyncThunk(
  'feeRefunds/getRefunds',
  catchAsync(
    async (data: { filters?: IRefundFilters; page?: number; limit?: number }) =>
      await feeServices.listRefundsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const requestRefundAction = createAsyncThunk(
  'feeRefunds/requestRefund',
  catchAsync(
    async (data: {
      payload: IRequestRefundDto
      onSuccess?: (refund: Fee.IRefund) => void
    }) => {
      const res = await feeServices.requestRefundService(data.payload)
      data.onSuccess?.(res.refund)

      return res
    },
    true,
    false,
    'Refund request submitted'
  )
)

export const approveRefundAction = createAsyncThunk(
  'feeRefunds/approveRefund',
  catchAsync(
    async (data: { refundId: number; onSuccess?: () => void }) => {
      const res = await feeServices.approveRefundService(data.refundId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Refund approved'
  )
)

export const rejectRefundAction = createAsyncThunk(
  'feeRefunds/rejectRefund',
  catchAsync(
    async (data: { refundId: number; onSuccess?: () => void }) => {
      const res = await feeServices.rejectRefundService(data.refundId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Refund rejected'
  )
)

export const processRefundAction = createAsyncThunk(
  'feeRefunds/processRefund',
  catchAsync(
    async (data: { refundId: number; onSuccess?: () => void }) => {
      const res = await feeServices.processRefundService(data.refundId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Refund processed'
  )
)

/* ------------------------------ adjustments ----------------------------- */

export const getAdjustmentsAction = createAsyncThunk(
  'feeRefunds/getAdjustments',
  catchAsync(
    async (data: {
      filters?: IAdjustmentFilters
      page?: number
      limit?: number
    }) =>
      await feeServices.listAdjustmentsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createAdjustmentAction = createAsyncThunk(
  'feeRefunds/createAdjustment',
  catchAsync(
    async (data: {
      invoiceId: number
      payload: ICreateAdjustmentDto
      onSuccess?: (applied: boolean) => void
    }) => {
      const res = await feeServices.createAdjustmentService(
        data.invoiceId,
        data.payload
      )
      data.onSuccess?.(res.applied)

      return res
    },
    true,
    false,
    'Adjustment recorded'
  )
)

export const approveAdjustmentAction = createAsyncThunk(
  'feeRefunds/approveAdjustment',
  catchAsync(
    async (data: { adjustmentId: number; onSuccess?: () => void }) => {
      const res = await feeServices.approveAdjustmentService(data.adjustmentId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Adjustment approved and applied'
  )
)

export const rejectAdjustmentAction = createAsyncThunk(
  'feeRefunds/rejectAdjustment',
  catchAsync(
    async (data: { adjustmentId: number; onSuccess?: () => void }) => {
      const res = await feeServices.rejectAdjustmentService(data.adjustmentId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Adjustment rejected'
  )
)

const feeRefundsSlice = createSlice({
  name: 'feeRefunds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRefundsAction.pending, (state) => {
      state.refunds.loading = true
    })
    builder.addCase(getRefundsAction.fulfilled, (state, action) => {
      state.refunds.loading = false
      state.refunds.data = action.payload
    })
    builder.addCase(getRefundsAction.rejected, (state) => {
      state.refunds.loading = false
    })
    builder.addCase(requestRefundAction.pending, (state) => {
      state.refundMutation.loading = true
    })
    builder.addCase(requestRefundAction.fulfilled, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(requestRefundAction.rejected, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(approveRefundAction.pending, (state) => {
      state.refundMutation.loading = true
    })
    builder.addCase(approveRefundAction.fulfilled, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(approveRefundAction.rejected, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(rejectRefundAction.pending, (state) => {
      state.refundMutation.loading = true
    })
    builder.addCase(rejectRefundAction.fulfilled, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(rejectRefundAction.rejected, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(processRefundAction.pending, (state) => {
      state.refundMutation.loading = true
    })
    builder.addCase(processRefundAction.fulfilled, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(processRefundAction.rejected, (state) => {
      state.refundMutation.loading = false
    })
    builder.addCase(getAdjustmentsAction.pending, (state) => {
      state.adjustments.loading = true
    })
    builder.addCase(getAdjustmentsAction.fulfilled, (state, action) => {
      state.adjustments.loading = false
      state.adjustments.data = action.payload
    })
    builder.addCase(getAdjustmentsAction.rejected, (state) => {
      state.adjustments.loading = false
    })
    builder.addCase(createAdjustmentAction.pending, (state) => {
      state.adjustmentMutation.loading = true
    })
    builder.addCase(createAdjustmentAction.fulfilled, (state) => {
      state.adjustmentMutation.loading = false
    })
    builder.addCase(createAdjustmentAction.rejected, (state) => {
      state.adjustmentMutation.loading = false
    })
    builder.addCase(approveAdjustmentAction.pending, (state) => {
      state.adjustmentMutation.loading = true
    })
    builder.addCase(approveAdjustmentAction.fulfilled, (state) => {
      state.adjustmentMutation.loading = false
    })
    builder.addCase(approveAdjustmentAction.rejected, (state) => {
      state.adjustmentMutation.loading = false
    })
    builder.addCase(rejectAdjustmentAction.pending, (state) => {
      state.adjustmentMutation.loading = true
    })
    builder.addCase(rejectAdjustmentAction.fulfilled, (state) => {
      state.adjustmentMutation.loading = false
    })
    builder.addCase(rejectAdjustmentAction.rejected, (state) => {
      state.adjustmentMutation.loading = false
    })
  },
})

export default feeRefundsSlice.reducer
