import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { manageStudentServices, TCreateStudent } from './manageStudents.service'
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
  students: {
    create: {
      loading: boolean
    }
    update: {
      loading: boolean
    }
    list: {
      data: Students.IStudentList | null
      loading: boolean
    }
    selectedStudent: {
      data: Students.IStudentDetail | null
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
  students: {
    create: {
      loading: false,
    },
    update: {
      loading: false,
    },
    list: {
      data: null,
      loading: false,
    },
    selectedStudent: {
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

export const createStudentAction = createAsyncThunk(
  'manageStudents/create',
  catchAsync(
    async (data: { payload: TCreateStudent; onSuccess?: () => void }) => {
      const res = await manageStudentServices.createStudent(data.payload)
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const updateStudentAction = createAsyncThunk(
  'manageStudents/update',
  catchAsync(
    async (data: {
      payload: {
        body: Partial<Omit<TCreateStudent, 'image' | 'user_credential'>>
        studentId: number
      }
      onSuccess?: () => void
    }) => {
      const res = await manageStudentServices.updateStudent(
        data.payload.studentId,
        data.payload.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const getStudentListAction = createAsyncThunk(
  'manageStudents/getList',
  catchAsync(
    async (data: {
      payload: { page?: number; limit?: number; search?: string }
      onSuccess?: () => void
    }) => {
      const res = await manageStudentServices.getStudentList(
        data.payload.page,
        data.payload.limit,
        data.payload.search
      )
      data.onSuccess?.()

      return res
    }
  )
)

export const getStudentDetailAction = createAsyncThunk(
  'manageStudent/getStudentDetail',
  catchAsync(async (data: { studentId: number; onSuccess?: () => void }) => {
    const res = await manageStudentServices.getStudentDetail(data.studentId)
    data.onSuccess?.()

    return res
  })
)

const manageStudentSlice = createSlice({
  name: 'manageStudents',
  initialState,
  reducers: {
    resetSelectedStudent: (state) => {
      state.students.selectedStudent.data = null
    },
  },
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
    // CREATE STUDENT ACTION
    builder.addCase(createStudentAction.pending, (state) => {
      state.students.create.loading = true
    })
    builder.addCase(createStudentAction.fulfilled, (state) => {
      state.students.create.loading = false
    })
    builder.addCase(createStudentAction.rejected, (state) => {
      state.students.create.loading = false
    })
    // UPDATE STUDENT ACTION
    builder.addCase(updateStudentAction.pending, (state) => {
      state.students.update.loading = true
    })
    builder.addCase(updateStudentAction.fulfilled, (state) => {
      state.students.update.loading = false
    })
    builder.addCase(updateStudentAction.rejected, (state) => {
      state.students.update.loading = false
    })
    // GET STUDENTS LIST
    builder.addCase(getStudentListAction.pending, (state) => {
      state.students.list.loading = true
    })
    builder.addCase(getStudentListAction.fulfilled, (state, action) => {
      state.students.list.loading = false
      state.students.list.data = action.payload.data
    })
    builder.addCase(getStudentListAction.rejected, (state) => {
      state.students.list.loading = false
    })
    // GET STUDENT DETAIL
    builder.addCase(getStudentDetailAction.pending, (state) => {
      state.students.selectedStudent.loading = true
    })
    builder.addCase(getStudentDetailAction.fulfilled, (state, action) => {
      state.students.selectedStudent.loading = false
      state.students.selectedStudent.data = action.payload.data
    })
    builder.addCase(getStudentDetailAction.rejected, (state) => {
      state.students.selectedStudent.loading = false
    })
  },
})

export default manageStudentSlice.reducer
export const { resetSelectedStudent } = manageStudentSlice.actions
