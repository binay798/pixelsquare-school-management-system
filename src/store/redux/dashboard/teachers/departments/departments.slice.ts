import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './departments.service'

interface InitialState {
  createDepartment: {
    loading: boolean
  }
  departmentList: {
    data: Api.IDepartmentList | null
    loading: boolean
  }
  updateDepartment: {
    loading: boolean
  }
}
const initialState: InitialState = {
  createDepartment: {
    loading: false,
  },
  updateDepartment: {
    loading: false,
  },
  departmentList: {
    data: null,
    loading: false,
  },
}

export const createDepartmentAction = createAsyncThunk(
  'departments/create',
  catchAsync(
    async (data: {
      payload: { name: string; academicYearId: number }
      onSuccess?: () => void
    }) => {
      const res = await services.createDepartment(data.payload)
      data?.onSuccess?.()

      return res
    }
  )
)

export const getDepartmentListAction = createAsyncThunk(
  'departments/get-list',
  catchAsync(async (data: { payload: { page?: number; limit?: number } }) => {
    const res = await services.getDepartmentList(
      data.payload?.page,
      data.payload?.limit
    )

    return res
  })
)

export const updateDepartmentAction = createAsyncThunk(
  'departments/update',
  catchAsync(
    async (data: {
      payload: { departmentId: number; name: string }
      onSuccess?: () => void
    }) => {
      const res = await services.updateDepartment(
        data.payload.departmentId,
        data.payload.name
      )
      data?.onSuccess?.()

      return res
    },
    true
  )
)

export const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE DEPARTMENT
    builder.addCase(createDepartmentAction.pending, (state) => {
      state.createDepartment.loading = true
    })
    builder.addCase(createDepartmentAction.fulfilled, (state) => {
      state.createDepartment.loading = false
    })
    builder.addCase(createDepartmentAction.rejected, (state) => {
      state.createDepartment.loading = false
    })
    // GET DEPARTMENT LIST
    builder.addCase(getDepartmentListAction.pending, (state) => {
      state.departmentList.loading = true
    })
    builder.addCase(getDepartmentListAction.fulfilled, (state, action) => {
      state.departmentList.loading = false
      state.departmentList.data = action.payload.data
    })
    builder.addCase(getDepartmentListAction.rejected, (state) => {
      state.departmentList.loading = false
    })
    // UPDATE DEPARTMENT
    builder.addCase(updateDepartmentAction.pending, (state) => {
      state.updateDepartment.loading = true
    })
    builder.addCase(updateDepartmentAction.fulfilled, (state) => {
      state.updateDepartment.loading = false
    })
    builder.addCase(updateDepartmentAction.rejected, (state) => {
      state.updateDepartment.loading = false
    })
  },
})

export default departmentSlice.reducer
