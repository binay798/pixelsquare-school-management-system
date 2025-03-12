import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './manageEmployee.service'

interface InitialState {
  createEmployee: {
    loading: boolean
  }
  employeeList: {
    data: Api.IEmployeeList | null
    loading: boolean
  }
}
const initialState: InitialState = {
  createEmployee: {
    loading: false,
  },
  employeeList: {
    data: null,
    loading: false,
  },
}

export const createEmployeeAction = createAsyncThunk(
  'manageEmployee/create',
  catchAsync(
    async (data: {
      payload: Service.ManageEmployee.CreateEmployee
      onSuccess?: () => void
    }) => {
      const res = await services.createEmployeeService(data.payload)
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const getEmployeeListAction = createAsyncThunk(
  'manageEmployee/list',
  catchAsync(
    async (data: {
      payload: { page?: number; limit?: number; search?: string }
    }) => {
      const res = await services.getEmployeeList(
        data.payload?.page,
        data.payload?.limit,
        data.payload?.search
      )

      return res
    }
  )
)

const manageEmployeeSlice = createSlice({
  name: 'maangeEmployee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE EMPLOYEE
    builder.addCase(createEmployeeAction.pending, (state) => {
      state.createEmployee.loading = true
    })
    builder.addCase(createEmployeeAction.fulfilled, (state) => {
      state.createEmployee.loading = false
    })
    builder.addCase(createEmployeeAction.rejected, (state) => {
      state.createEmployee.loading = false
    })
    // GET EMPLOYEE LIST
    builder.addCase(getEmployeeListAction.pending, (state) => {
      state.employeeList.loading = true
    })
    builder.addCase(getEmployeeListAction.fulfilled, (state, action) => {
      state.employeeList.loading = false
      state.employeeList.data = action.payload.data
    })
    builder.addCase(getEmployeeListAction.rejected, (state) => {
      state.employeeList.loading = false
    })
  },
})

export default manageEmployeeSlice.reducer
