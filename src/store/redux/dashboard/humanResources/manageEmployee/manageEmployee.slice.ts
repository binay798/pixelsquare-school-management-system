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
  selectedEmployee: {
    data: Api.IEmployeeDetails | null
    loading: boolean
  }
  changeProfilePic: {
    loading: boolean
  }
  updateEmployee: {
    loading: boolean
  }
}

const initialState: InitialState = {
  createEmployee: {
    loading: false,
  },
  updateEmployee: {
    loading: false,
  },
  employeeList: {
    data: null,
    loading: false,
  },
  selectedEmployee: {
    data: null,
    loading: false,
  },
  changeProfilePic: {
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

export const getEmployeeDetailsAction = createAsyncThunk(
  'manageEmployee/getDetails',
  catchAsync(async (data: { payload: { employeeId: number } }) => {
    const res = await services.getEmployeeDetails(data.payload.employeeId)

    return res
  })
)

export const changeEmployeeProfileAction = createAsyncThunk(
  'manageEmployee/change-profile-pic',
  catchAsync(
    async (data: {
      payload: { employeeId: number; file: File }
      onSuccess?: () => void
    }) => {
      const res = await services.changeEmployeeProfilePic(
        data.payload.employeeId,
        data.payload.file
      )
      data.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Successfully changed profile picture'
  )
)

export const updateEmployeeDetailAction = createAsyncThunk(
  'manageEmployee/update',
  catchAsync(
    async (data: {
      payload: {
        employeeId: number
        data: Service.ManageEmployee.UpdateEmployee
      }
      onSuccess?: () => void
    }) => {
      const res = await services.updateEmployee(
        data.payload.employeeId,
        data.payload.data
      )
      data.onSuccess?.()

      return res
    },
    true,
    undefined,
    'Employee profile updated successfully'
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
    // GET EMPLOYEE DETAILS
    builder.addCase(getEmployeeDetailsAction.pending, (state) => {
      state.selectedEmployee.loading = true
    })
    builder.addCase(getEmployeeDetailsAction.fulfilled, (state, action) => {
      state.selectedEmployee.loading = false
      state.selectedEmployee.data = action.payload.data
    })
    builder.addCase(getEmployeeDetailsAction.rejected, (state) => {
      state.selectedEmployee.loading = false
    })
    // CHANGE EMPLOYEE PROFILE PIC
    builder.addCase(changeEmployeeProfileAction.pending, (state) => {
      state.changeProfilePic.loading = true
    })
    builder.addCase(changeEmployeeProfileAction.fulfilled, (state) => {
      state.changeProfilePic.loading = false
    })
    builder.addCase(changeEmployeeProfileAction.rejected, (state) => {
      state.changeProfilePic.loading = false
    })
    // UPDATE EMPLOYEE DETIAILS
    builder.addCase(updateEmployeeDetailAction.pending, (state) => {
      state.updateEmployee.loading = true
    })
    builder.addCase(updateEmployeeDetailAction.fulfilled, (state) => {
      state.updateEmployee.loading = false
    })
    builder.addCase(updateEmployeeDetailAction.rejected, (state) => {
      state.updateEmployee.loading = false
    })
  },
})

export default manageEmployeeSlice.reducer
