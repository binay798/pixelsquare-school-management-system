import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { manageStudentServices } from './manageStudents.service'
import { catchAsync } from '@src/helpers/catchAsync.helpers'

interface InitialState {
  studentType: {
    create: {
      loading: boolean
    }
    update: {
      loading: boolean
    }
    studentTypeList: {
      data: Students.IStudentType[] | null
      loading: boolean
    }
  }
}

const initialState: InitialState = {
  studentType: {
    create: {
      loading: false,
    },
    update: {
      loading: false,
    },
    studentTypeList: {
      data: null,
      loading: false,
    },
  },
}

export const createStudentTypeAction = createAsyncThunk(
  'manageStudent/createStudentType',
  catchAsync(
    async (data: { payload: { name: string }; onSuccess?: () => void }) => {
      const res = await manageStudentServices.createStudentTypeService(
        data.payload.name
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const updateStudentTypeAction = createAsyncThunk(
  'manageStudent/updateStudentType',
  catchAsync(
    async (data: {
      payload: { studentTypeId: number; name: string }
      onSuccess?: () => void
    }) => {
      const res = await manageStudentServices.updateStudentType(
        data.payload.studentTypeId,
        data.payload.name
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)
export const getStudentTypeListAction = createAsyncThunk(
  'manageStudent/getStudentTypeList',
  catchAsync(async () => {
    const res = await manageStudentServices.getStudentTypeList()

    return res
  })
)

const manageStudentSlice = createSlice({
  name: 'manageStudents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE STUDENT TYPE ACTION
    builder.addCase(createStudentTypeAction.pending, (state) => {
      state.studentType.create.loading = true
    })
    builder.addCase(createStudentTypeAction.fulfilled, (state) => {
      state.studentType.create.loading = false
    })
    builder.addCase(createStudentTypeAction.rejected, (state) => {
      state.studentType.create.loading = false
    })
    // UPDATE STUDENT TYPE ACTION
    builder.addCase(updateStudentTypeAction.pending, (state) => {
      state.studentType.update.loading = true
    })
    builder.addCase(updateStudentTypeAction.fulfilled, (state) => {
      state.studentType.update.loading = false
    })
    builder.addCase(updateStudentTypeAction.rejected, (state) => {
      state.studentType.update.loading = false
    })
    // GET STUDENT TYPE LIST ACTION
    builder.addCase(getStudentTypeListAction.pending, (state) => {
      state.studentType.studentTypeList.loading = true
    })
    builder.addCase(getStudentTypeListAction.fulfilled, (state, action) => {
      state.studentType.studentTypeList.loading = false
      state.studentType.studentTypeList.data = action.payload.data
    })
    builder.addCase(getStudentTypeListAction.rejected, (state) => {
      state.studentType.studentTypeList.loading = false
    })
  },
})

export default manageStudentSlice.reducer
