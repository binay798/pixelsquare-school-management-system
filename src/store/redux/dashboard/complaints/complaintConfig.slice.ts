import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import { complaintServices } from './complaints.service'

interface InitialState {
  categories: { data: Complaint.ICategory[] | null; loading: boolean }
  slaPolicies: { data: Complaint.ISlaPolicy[] | null; loading: boolean }
  categoryMutation: { loading: boolean }
  policyMutation: { loading: boolean }
}

const initialState: InitialState = {
  categories: { data: null, loading: false },
  slaPolicies: { data: null, loading: false },
  categoryMutation: { loading: false },
  policyMutation: { loading: false },
}

export const getComplaintCategoriesAction = createAsyncThunk(
  'complaintConfigSlice/getCategories',
  catchAsync(async (includeInactive: boolean = true) =>
    complaintServices.getComplaintCategoriesService(includeInactive)
  )
)

export const createComplaintCategoryAction = createAsyncThunk(
  'complaintConfigSlice/createCategory',
  catchAsync(
    async (data: {
      payload: Parameters<
        typeof complaintServices.createComplaintCategoryService
      >[0]
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.createComplaintCategoryService(
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Category created'
  )
)

export const updateComplaintCategoryAction = createAsyncThunk(
  'complaintConfigSlice/updateCategory',
  catchAsync(
    async (data: {
      categoryId: number
      payload: Parameters<
        typeof complaintServices.updateComplaintCategoryService
      >[1]
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.updateComplaintCategoryService(
        data.categoryId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Category updated'
  )
)

export const deleteComplaintCategoryAction = createAsyncThunk(
  'complaintConfigSlice/deleteCategory',
  catchAsync(
    async (data: { categoryId: number; onSuccess?: () => void }) => {
      const res = await complaintServices.deleteComplaintCategoryService(
        data.categoryId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Category deleted'
  )
)

export const getComplaintSlaPoliciesAction = createAsyncThunk(
  'complaintConfigSlice/getPolicies',
  catchAsync<Complaint.ISlaPolicy[], void>(async () =>
    complaintServices.getComplaintSlaPoliciesService()
  )
)

export const createComplaintSlaPolicyAction = createAsyncThunk(
  'complaintConfigSlice/createPolicy',
  catchAsync(
    async (data: {
      payload: Parameters<
        typeof complaintServices.createComplaintSlaPolicyService
      >[0]
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.createComplaintSlaPolicyService(
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'SLA policy created'
  )
)

export const updateComplaintSlaPolicyAction = createAsyncThunk(
  'complaintConfigSlice/updatePolicy',
  catchAsync(
    async (data: {
      policyId: number
      payload: Parameters<
        typeof complaintServices.updateComplaintSlaPolicyService
      >[1]
      onSuccess?: () => void
    }) => {
      const res = await complaintServices.updateComplaintSlaPolicyService(
        data.policyId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'SLA policy updated'
  )
)

export const deleteComplaintSlaPolicyAction = createAsyncThunk(
  'complaintConfigSlice/deletePolicy',
  catchAsync(
    async (data: { policyId: number; onSuccess?: () => void }) => {
      const res = await complaintServices.deleteComplaintSlaPolicyService(
        data.policyId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'SLA policy deleted'
  )
)

const complaintConfigSlice = createSlice({
  name: 'complaintConfig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getComplaintCategoriesAction.pending, (state) => {
        state.categories.loading = true
      })
      .addCase(getComplaintCategoriesAction.fulfilled, (state, action) => {
        state.categories = { data: action.payload, loading: false }
      })
      .addCase(getComplaintCategoriesAction.rejected, (state) => {
        state.categories.loading = false
      })
      .addCase(getComplaintSlaPoliciesAction.pending, (state) => {
        state.slaPolicies.loading = true
      })
      .addCase(getComplaintSlaPoliciesAction.fulfilled, (state, action) => {
        state.slaPolicies = { data: action.payload, loading: false }
      })
      .addCase(getComplaintSlaPoliciesAction.rejected, (state) => {
        state.slaPolicies.loading = false
      })

      .addCase(createComplaintCategoryAction.pending, (state) => {
        state.categoryMutation.loading = true
      })
      .addCase(createComplaintCategoryAction.fulfilled, (state) => {
        state.categoryMutation.loading = false
      })
      .addCase(createComplaintCategoryAction.rejected, (state) => {
        state.categoryMutation.loading = false
      })
      .addCase(updateComplaintCategoryAction.pending, (state) => {
        state.categoryMutation.loading = true
      })
      .addCase(updateComplaintCategoryAction.fulfilled, (state) => {
        state.categoryMutation.loading = false
      })
      .addCase(updateComplaintCategoryAction.rejected, (state) => {
        state.categoryMutation.loading = false
      })
      .addCase(deleteComplaintCategoryAction.pending, (state) => {
        state.categoryMutation.loading = true
      })
      .addCase(deleteComplaintCategoryAction.fulfilled, (state) => {
        state.categoryMutation.loading = false
      })
      .addCase(deleteComplaintCategoryAction.rejected, (state) => {
        state.categoryMutation.loading = false
      })

      .addCase(createComplaintSlaPolicyAction.pending, (state) => {
        state.policyMutation.loading = true
      })
      .addCase(createComplaintSlaPolicyAction.fulfilled, (state) => {
        state.policyMutation.loading = false
      })
      .addCase(createComplaintSlaPolicyAction.rejected, (state) => {
        state.policyMutation.loading = false
      })
      .addCase(updateComplaintSlaPolicyAction.pending, (state) => {
        state.policyMutation.loading = true
      })
      .addCase(updateComplaintSlaPolicyAction.fulfilled, (state) => {
        state.policyMutation.loading = false
      })
      .addCase(updateComplaintSlaPolicyAction.rejected, (state) => {
        state.policyMutation.loading = false
      })
      .addCase(deleteComplaintSlaPolicyAction.pending, (state) => {
        state.policyMutation.loading = true
      })
      .addCase(deleteComplaintSlaPolicyAction.fulfilled, (state) => {
        state.policyMutation.loading = false
      })
      .addCase(deleteComplaintSlaPolicyAction.rejected, (state) => {
        state.policyMutation.loading = false
      })
  },
})

export default complaintConfigSlice.reducer
