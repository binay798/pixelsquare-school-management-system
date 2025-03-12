import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './designations.service'

interface InitialState {
  createDesignation: {
    loading: boolean
  }
  designationList: {
    data: Api.IDesignationList | null
    loading: boolean
  }
  deleteDesignation: {
    loading: boolean
  }
  editDesignation: {
    loading: boolean
  }
}
const initialState: InitialState = {
  createDesignation: {
    loading: false,
  },
  editDesignation: {
    loading: false,
  },
  designationList: {
    data: null,
    loading: false,
  },
  deleteDesignation: {
    loading: false,
  },
}

export const createDesignationAction = createAsyncThunk(
  'designations/create',
  catchAsync(
    async (data: {
      payload: { designation: string }
      onSuccess?: () => void
    }) => {
      const res = await services.createDesignation(data.payload)
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Designation creation successfull'
  )
)
export const editDesignationAction = createAsyncThunk(
  'designations/edit',
  catchAsync(
    async (data: {
      payload: { designation: string; designationId: number }
      onSuccess?: () => void
    }) => {
      const res = await services.editDesignation(data.payload.designationId, {
        designation: data.payload.designation,
      })
      data?.onSuccess?.()

      return res
    },
    true,
    undefined
  )
)

export const listDesignationAction = createAsyncThunk(
  'designations/list',
  catchAsync(
    async (data: {
      payload: { page?: number; limit?: number }
      onSuccess?: () => void
    }) => {
      const res = await services.listDesignations(
        data.payload?.page,
        data.payload?.limit
      )

      return res
    }
  )
)

export const deleteDesignationAction = createAsyncThunk(
  'designations/delete',
  catchAsync(
    async (data: {
      payload: { designationId: number }
      onSuccess?: () => void
    }) => {
      const res = await services.deleteDesignation(data.payload.designationId)
      data?.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Successfully deleted'
  )
)

export const designationSlice = createSlice({
  name: 'designations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE DESIGNATION
    builder.addCase(createDesignationAction.pending, (state) => {
      state.createDesignation.loading = true
    })
    builder.addCase(createDesignationAction.fulfilled, (state) => {
      state.createDesignation.loading = false
    })
    builder.addCase(createDesignationAction.rejected, (state) => {
      state.createDesignation.loading = false
    })
    // EDIT DESIGNATION
    builder.addCase(editDesignationAction.pending, (state) => {
      state.editDesignation.loading = true
    })
    builder.addCase(editDesignationAction.fulfilled, (state) => {
      state.editDesignation.loading = false
    })
    builder.addCase(editDesignationAction.rejected, (state) => {
      state.editDesignation.loading = false
    })
    // LIST DESIGNATIONS
    builder.addCase(listDesignationAction.pending, (state) => {
      state.designationList.loading = true
    })
    builder.addCase(listDesignationAction.fulfilled, (state, action) => {
      state.designationList.loading = false
      state.designationList.data = action.payload.data
    })
    builder.addCase(listDesignationAction.rejected, (state) => {
      state.designationList.loading = false
    })
    // DELETE DESIGNATION
    builder.addCase(deleteDesignationAction.pending, (state) => {
      state.deleteDesignation.loading = true
    })
    builder.addCase(deleteDesignationAction.fulfilled, (state) => {
      state.deleteDesignation.loading = false
    })
    builder.addCase(deleteDesignationAction.rejected, (state) => {
      state.deleteDesignation.loading = false
    })
  },
})

export default designationSlice.reducer
