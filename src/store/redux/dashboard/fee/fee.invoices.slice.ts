import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  feeServices,
  IBulkInvoiceDto,
  IGenerateInvoiceDto,
  IInvoiceFilters,
} from './fee.service'

interface InitialState {
  invoices: { data: Fee.IList<Fee.IInvoice> | null; loading: boolean }
  invoiceDetail: { data: Fee.IInvoiceDetail | null; loading: boolean }
  preview: { data: Fee.IPreparedInvoice | null; loading: boolean }
  bulkPreview: { data: Fee.IBulkPreview | null; loading: boolean }
  bulkGeneration: { data: Fee.IBulkGeneration | null; loading: boolean }
  invoiceMutation: { loading: boolean }
}

const initialState: InitialState = {
  invoices: { data: null, loading: false },
  invoiceDetail: { data: null, loading: false },
  preview: { data: null, loading: false },
  bulkPreview: { data: null, loading: false },
  bulkGeneration: { data: null, loading: false },
  invoiceMutation: { loading: false },
}

export const getInvoicesAction = createAsyncThunk(
  'feeInvoices/getList',
  catchAsync(
    async (data: {
      filters?: IInvoiceFilters
      page?: number
      limit?: number
    }) =>
      await feeServices.listInvoicesService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getInvoiceDetailAction = createAsyncThunk(
  'feeInvoices/getDetail',
  catchAsync(
    async (data: { invoiceId: number }) =>
      await feeServices.getInvoiceService(data.invoiceId)
  )
)

export const previewInvoiceAction = createAsyncThunk(
  'feeInvoices/preview',
  catchAsync(
    async (data: {
      payload: IGenerateInvoiceDto
      onSuccess?: (preview: Fee.IPreparedInvoice) => void
    }) => {
      const res = await feeServices.previewInvoiceService(data.payload)
      data.onSuccess?.(res)

      return res
    }
  )
)

export const generateInvoiceAction = createAsyncThunk(
  'feeInvoices/generate',
  catchAsync(
    async (data: {
      payload: IGenerateInvoiceDto
      onSuccess?: (invoice: Fee.IInvoice) => void
    }) => {
      const res = await feeServices.generateInvoiceService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Invoice generated'
  )
)

export const previewBulkInvoicesAction = createAsyncThunk(
  'feeInvoices/previewBulk',
  catchAsync(
    async (data: {
      payload: IBulkInvoiceDto
      onSuccess?: (preview: Fee.IBulkPreview) => void
    }) => {
      const res = await feeServices.previewBulkInvoicesService(data.payload)
      data.onSuccess?.(res)

      return res
    }
  )
)

export const generateBulkInvoicesAction = createAsyncThunk(
  'feeInvoices/generateBulk',
  catchAsync(
    async (data: {
      payload: IBulkInvoiceDto
      onSuccess?: (result: Fee.IBulkGeneration) => void
    }) => {
      const res = await feeServices.generateBulkInvoicesService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Bulk invoice generation completed'
  )
)

export const issueInvoiceAction = createAsyncThunk(
  'feeInvoices/issue',
  catchAsync(
    async (data: { invoiceId: number; onSuccess?: () => void }) => {
      const res = await feeServices.issueInvoiceService(data.invoiceId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Invoice issued'
  )
)

export const cancelInvoiceAction = createAsyncThunk(
  'feeInvoices/cancel',
  catchAsync(
    async (data: {
      invoiceId: number
      reason: string
      onSuccess?: () => void
    }) => {
      const res = await feeServices.cancelInvoiceService(
        data.invoiceId,
        data.reason
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Invoice cancelled'
  )
)

export const applyWalletAction = createAsyncThunk(
  'feeInvoices/applyWallet',
  catchAsync(
    async (data: {
      invoiceId: number
      studentId: number
      amount?: string
      invoiceIds?: number[]
      strategy?: Fee.AllocationStrategy
      onSuccess?: (result: Fee.IWalletApplyResult) => void
    }) => {
      const res = await feeServices.applyWalletService(data.invoiceId, {
        student_id: data.studentId,
        amount: data.amount,
        invoice_ids: data.invoiceIds,
        strategy: data.strategy,
      })
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Wallet balance applied'
  )
)

export const refreshOverdueAction = createAsyncThunk(
  'feeInvoices/refreshOverdue',
  catchAsync(
    async (data?: { onSuccess?: (updated: number) => void }) => {
      const res = await feeServices.refreshOverdueService()
      data?.onSuccess?.(res.updated)

      return res
    },
    true,
    false,
    'Overdue statuses refreshed'
  )
)

const feeInvoicesSlice = createSlice({
  name: 'feeInvoices',
  initialState,
  reducers: {
    resetInvoiceDetail: (state) => {
      state.invoiceDetail.data = null
    },
    resetPreview: (state) => {
      state.preview.data = null
    },
    resetBulk: (state) => {
      state.bulkPreview.data = null
      state.bulkGeneration.data = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getInvoicesAction.pending, (state) => {
      state.invoices.loading = true
    })
    builder.addCase(getInvoicesAction.fulfilled, (state, action) => {
      state.invoices.loading = false
      state.invoices.data = action.payload
    })
    builder.addCase(getInvoicesAction.rejected, (state) => {
      state.invoices.loading = false
    })

    builder.addCase(getInvoiceDetailAction.pending, (state) => {
      state.invoiceDetail.loading = true
    })
    builder.addCase(getInvoiceDetailAction.fulfilled, (state, action) => {
      state.invoiceDetail.loading = false
      state.invoiceDetail.data = action.payload
    })
    builder.addCase(getInvoiceDetailAction.rejected, (state) => {
      state.invoiceDetail.loading = false
    })

    builder.addCase(previewInvoiceAction.pending, (state) => {
      state.preview.loading = true
      state.preview.data = null
    })
    builder.addCase(previewInvoiceAction.fulfilled, (state, action) => {
      state.preview.loading = false
      state.preview.data = action.payload
    })
    builder.addCase(previewInvoiceAction.rejected, (state) => {
      state.preview.loading = false
    })

    builder.addCase(previewBulkInvoicesAction.pending, (state) => {
      state.bulkPreview.loading = true
      state.bulkPreview.data = null
    })
    builder.addCase(previewBulkInvoicesAction.fulfilled, (state, action) => {
      state.bulkPreview.loading = false
      state.bulkPreview.data = action.payload
    })
    builder.addCase(previewBulkInvoicesAction.rejected, (state) => {
      state.bulkPreview.loading = false
    })

    builder.addCase(generateBulkInvoicesAction.pending, (state) => {
      state.bulkGeneration.loading = true
      state.bulkGeneration.data = null
    })
    builder.addCase(generateBulkInvoicesAction.fulfilled, (state, action) => {
      state.bulkGeneration.loading = false
      state.bulkGeneration.data = action.payload
    })
    builder.addCase(generateBulkInvoicesAction.rejected, (state) => {
      state.bulkGeneration.loading = false
    })

    builder.addCase(generateInvoiceAction.pending, (state) => {
      state.invoiceMutation.loading = true
    })
    builder.addCase(generateInvoiceAction.fulfilled, (state) => {
      state.invoiceMutation.loading = false
    })
    builder.addCase(generateInvoiceAction.rejected, (state) => {
      state.invoiceMutation.loading = false
    })

    builder.addCase(issueInvoiceAction.pending, (state) => {
      state.invoiceMutation.loading = true
    })
    builder.addCase(issueInvoiceAction.fulfilled, (state) => {
      state.invoiceMutation.loading = false
    })
    builder.addCase(issueInvoiceAction.rejected, (state) => {
      state.invoiceMutation.loading = false
    })

    builder.addCase(cancelInvoiceAction.pending, (state) => {
      state.invoiceMutation.loading = true
    })
    builder.addCase(cancelInvoiceAction.fulfilled, (state) => {
      state.invoiceMutation.loading = false
    })
    builder.addCase(cancelInvoiceAction.rejected, (state) => {
      state.invoiceMutation.loading = false
    })

    builder.addCase(applyWalletAction.pending, (state) => {
      state.invoiceMutation.loading = true
    })
    builder.addCase(applyWalletAction.fulfilled, (state) => {
      state.invoiceMutation.loading = false
    })
    builder.addCase(applyWalletAction.rejected, (state) => {
      state.invoiceMutation.loading = false
    })
  },
})

export const { resetInvoiceDetail, resetPreview, resetBulk } =
  feeInvoicesSlice.actions
export default feeInvoicesSlice.reducer
