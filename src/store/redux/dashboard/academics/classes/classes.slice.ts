import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as services from './classes.service'
import { catchAsync } from '@src/helpers/catchAsync.helpers'

interface InitialState {
  createClass: {
    loading: boolean
  }
  editClass: {
    loading: boolean
  }
  getClassList: {
    loading: boolean
    data: Api.IClassList | null
  }
}

const initialState: InitialState = {
  createClass: {
    loading: false,
  },
  editClass: {
    loading: false,
  },
  getClassList: {
    loading: false,
    data: null,
  },
}

export const createClassAction = createAsyncThunk(
  'classSlice/create',
  catchAsync(
    async (data: {
      payload: { name: string; numeric_name: string }
      onSuccess?: () => void
    }) => {
      const res = await services.createClassService(data.payload)
      data?.onSuccess?.()

      return res
    },
    true
  )
)

export const getClassListAction = createAsyncThunk(
  'classSlice/getList',
  catchAsync(async () => {
    const res = await services.getClassList()

    return res
  })
)

export const updateClassAction = createAsyncThunk(
  'classSlice/edit',
  catchAsync(
    async (data: {
      classId: number
      payload: { name: string; numeric_name: string }
      onSuccess?: () => void
    }) => {
      const res = await services.editClassService(data.classId, data.payload)
      data?.onSuccess?.()

      return res
    },
    true
  )
)

const classesSlice = createSlice({
  name: 'classSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE CLASS
    builder.addCase(createClassAction.pending, (state) => {
      state.createClass.loading = true
    })
    builder.addCase(createClassAction.fulfilled, (state) => {
      state.createClass.loading = false
    })
    builder.addCase(createClassAction.rejected, (state) => {
      state.createClass.loading = false
    })
    // GET CLASS LIST
    builder.addCase(getClassListAction.pending, (state) => {
      state.getClassList.loading = true
    })
    builder.addCase(getClassListAction.fulfilled, (state, action) => {
      state.getClassList.loading = false
      state.getClassList.data = action.payload.data
    })
    builder.addCase(getClassListAction.rejected, (state) => {
      state.getClassList.loading = false
    })
    // UPDATE CLASS ACTION
    builder.addCase(updateClassAction.pending, (state) => {
      state.editClass.loading = true
    })
    builder.addCase(updateClassAction.fulfilled, (state) => {
      state.editClass.loading = false
    })
    builder.addCase(updateClassAction.rejected, (state) => {
      state.editClass.loading = false
    })
  },
})

export default classesSlice.reducer
