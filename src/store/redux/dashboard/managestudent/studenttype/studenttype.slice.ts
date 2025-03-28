import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as services from './studenttype.service'

interface InitialState {
  createStudentType: {
    loading: boolean
    error: string | null
  }
  studentTypelist: {
    data: Api.IStudentTypeList | null
    loading: boolean
  }
  editStudentType: {
    loading: boolean
  }
}

const initialState: InitialState = {
  createStudentType: {
    loading: false,
    error: null,
  },
  studentTypelist: {
    data: null,
    loading: false,
  },
  editStudentType: {
    loading: false,
  },
}

export const createStudentTypeAction = createAsyncThunk(
  'studentType/create',
  catchAsync(
    async (body: { name: string; onSuccess?: () => void }) => {
      const res = await services.createStudentType(body)
      body.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created student type'
  )
)

export const getStudentTypeListAction = createAsyncThunk(
  'studentType/list',
  catchAsync(async (data: { payload: { page?: number; limit?: number } }) => {
    const res = await services.getStudentTypeList(
      data.payload?.page,
      data.payload?.limit
    )
    return res
  })
)

export const editStudentTypeAction = createAsyncThunk(
  'studentTypes/edit',
  catchAsync(
    async (data: {
      payload: { studentType: string; studentTypeId: number }
      onSuccess?: () => void
    }) => {
      const res = await services.editStudentType(data.payload.studentTypeId, {
        studentType: data.payload.studentType,
      })
      data?.onSuccess?.()

      return res
    },
    true,
    undefined
  )
)

const studentTypeSlice = createSlice({
  name: 'studentType',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //CREATE STUDENTTYPE
    builder.addCase(createStudentTypeAction.pending, (state) => {
      state.createStudentType.loading = true
      state.createStudentType.error = null
    })
    builder.addCase(createStudentTypeAction.fulfilled, (state) => {
      state.createStudentType.loading = false
    })
    builder.addCase(createStudentTypeAction.rejected, (state, action) => {
      state.createStudentType.loading = false
      state.createStudentType.error =
        action.error.message ?? 'Failed to create student type'
    })
    //GET STUDENTTYPE LIST
    builder.addCase(getStudentTypeListAction.pending, (state) => {
      state.studentTypelist.loading = true
    })
    builder.addCase(getStudentTypeListAction.fulfilled, (state, action) => {
      state.studentTypelist.loading = false
      state.studentTypelist.data = action.payload.data
    })
    builder.addCase(getStudentTypeListAction.rejected, (state) => {
      state.studentTypelist.loading = false
    })

    //EDIT STUDENTTYPE
    builder.addCase(editStudentTypeAction.pending, (state) => {
      state.editStudentType.loading = true
    })
    builder.addCase(editStudentTypeAction.fulfilled, (state) => {
      state.editStudentType.loading = false
    })
    builder.addCase(editStudentTypeAction.rejected, (state) => {
      state.editStudentType.loading = false
    })
  },
})

export default studentTypeSlice.reducer
