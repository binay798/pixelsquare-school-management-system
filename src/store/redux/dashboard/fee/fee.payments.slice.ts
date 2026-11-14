import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { feeServices, ICollectPaymentDto, IPaymentFilters } from './fee.service'

interface InitialState {
  payments: { data: Fee.IList<Fee.IPayment> | null; loading: boolean }
  paymentDetail: { data: Fee.IPaymentDetail | null; loading: boolean }
  receipt: { data: Fee.IPaymentReceipt | null; loading: boolean }
  unallocated: { data: Fee.IList<Fee.IPayment> | null; loading: boolean }
  paymentMutation: { loading: boolean }
}

const initialState: InitialState = {
  payments: { data: null, loading: false },
  paymentDetail: { data: null, loading: false },
  receipt: { data: null, loading: false },
  unallocated: { data: null, loading: false },
  paymentMutation: { loading: false },
}

export const getPaymentsAction = createAsyncThunk(
  'feePayments/getList',
  catchAsync(
    async (data: {
      filters?: IPaymentFilters
      page?: number
      limit?: number
    }) =>
      await feeServices.listPaymentsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getPaymentDetailAction = createAsyncThunk(
  'feePayments/getDetail',
  catchAsync(
    async (data: { paymentId: number }) =>
      await feeServices.getPaymentService(data.paymentId)
  )
)

export const getPaymentReceiptAction = createAsyncThunk(
  'feePayments/getReceipt',
  catchAsync(
    async (data: { paymentId: number }) =>
      await feeServices.getPaymentReceiptService(data.paymentId)
  )
)

export const getUnallocatedPaymentsAction = createAsyncThunk(
  'feePayments/getUnallocated',
  catchAsync(
    async (data: { page?: number; limit?: number }) =>
      await feeServices.listUnallocatedPaymentsService(data?.page, data?.limit)
  )
)

export const collectPaymentAction = createAsyncThunk(
  'feePayments/collect',
  catchAsync(
    async (data: {
      payload: ICollectPaymentDto
      onSuccess?: (payment: Fee.IPaymentDetail) => void
    }) => {
      const res = await feeServices.collectPaymentService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Payment collected'
  )
)

export const reversePaymentAction = createAsyncThunk(
  'feePayments/reverse',
  catchAsync(
    async (data: {
      paymentId: number
      reason: string
      onSuccess?: () => void
    }) => {
      const res = await feeServices.reversePaymentService(
        data.paymentId,
        data.reason
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Payment reversed'
  )
)

export const confirmGatewayPaymentAction = createAsyncThunk(
  'feePayments/confirmGateway',
  catchAsync(
    async (data: {
      gateway_reference: string
      gateway_status?: 'CAPTURED' | 'FAILED' | 'REFUNDED'
      amount?: string
      onSuccess?: () => void
    }) => {
      const res = await feeServices.confirmGatewayPaymentService({
        gateway_reference: data.gateway_reference,
        gateway_status: data.gateway_status,
        amount: data.amount,
      })
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Gateway payment confirmed'
  )
)

const feePaymentsSlice = createSlice({
  name: 'feePayments',
  initialState,
  reducers: {
    resetPaymentDetail: (state) => {
      state.paymentDetail.data = null
    },
    resetReceipt: (state) => {
      state.receipt.data = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPaymentsAction.pending, (state) => {
      state.payments.loading = true
    })
    builder.addCase(getPaymentsAction.fulfilled, (state, action) => {
      state.payments.loading = false
      state.payments.data = action.payload
    })
    builder.addCase(getPaymentsAction.rejected, (state) => {
      state.payments.loading = false
    })
    builder.addCase(getPaymentDetailAction.pending, (state) => {
      state.paymentDetail.loading = true
    })
    builder.addCase(getPaymentDetailAction.fulfilled, (state, action) => {
      state.paymentDetail.loading = false
      state.paymentDetail.data = action.payload
    })
    builder.addCase(getPaymentDetailAction.rejected, (state) => {
      state.paymentDetail.loading = false
    })
    builder.addCase(getPaymentReceiptAction.pending, (state) => {
      state.receipt.loading = true
    })
    builder.addCase(getPaymentReceiptAction.fulfilled, (state, action) => {
      state.receipt.loading = false
      state.receipt.data = action.payload
    })
    builder.addCase(getPaymentReceiptAction.rejected, (state) => {
      state.receipt.loading = false
    })
    builder.addCase(getUnallocatedPaymentsAction.pending, (state) => {
      state.unallocated.loading = true
    })
    builder.addCase(getUnallocatedPaymentsAction.fulfilled, (state, action) => {
      state.unallocated.loading = false
      state.unallocated.data = action.payload
    })
    builder.addCase(getUnallocatedPaymentsAction.rejected, (state) => {
      state.unallocated.loading = false
    })
    builder.addCase(collectPaymentAction.pending, (state) => {
      state.paymentMutation.loading = true
    })
    builder.addCase(collectPaymentAction.fulfilled, (state) => {
      state.paymentMutation.loading = false
    })
    builder.addCase(collectPaymentAction.rejected, (state) => {
      state.paymentMutation.loading = false
    })
    builder.addCase(reversePaymentAction.pending, (state) => {
      state.paymentMutation.loading = true
    })
    builder.addCase(reversePaymentAction.fulfilled, (state) => {
      state.paymentMutation.loading = false
    })
    builder.addCase(reversePaymentAction.rejected, (state) => {
      state.paymentMutation.loading = false
    })
    builder.addCase(confirmGatewayPaymentAction.pending, (state) => {
      state.paymentMutation.loading = true
    })
    builder.addCase(confirmGatewayPaymentAction.fulfilled, (state) => {
      state.paymentMutation.loading = false
    })
    builder.addCase(confirmGatewayPaymentAction.rejected, (state) => {
      state.paymentMutation.loading = false
    })
  },
})

export const { resetPaymentDetail, resetReceipt } = feePaymentsSlice.actions
export default feePaymentsSlice.reducer
