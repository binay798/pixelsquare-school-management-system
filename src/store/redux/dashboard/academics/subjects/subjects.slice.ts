import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import * as teacherServices from '@src/store/redux/dashboard/teachers/teachers.service'
import {
  subjectServices,
  TCreateSubject,
} from '@src/store/redux/dashboard/academics/subjects/subjects.service'

interface InitialState {
  createSubject: {
    loading: boolean
    teachers: {
      data: Teachers.ITeacherList | null
      loading: boolean
    }
  }
  updateSubject: {
    loading: boolean
  }
  subjectList: {
    selectedClass: { label: string; value: number } | null
    data: Academics.ISubjectList[] | null
    loading: boolean
  }
}
const initialState: InitialState = {
  createSubject: {
    loading: false,
    teachers: {
      data: null,
      loading: false,
    },
  },
  updateSubject: {
    loading: false,
  },
  subjectList: {
    selectedClass: null,
    data: null,
    loading: false,
  },
}

export const getTeacherList = createAsyncThunk(
  'subjectSlice/getTeacherList',
  catchAsync(async () => {
    const res = await teacherServices.getTeacherList(1, 100)

    return res
  })
)

export const createSubjectAction = createAsyncThunk(
  'subjectSlice/create',
  catchAsync(
    async (data: {
      body: TCreateSubject
      classId: number
      onSuccess?: () => void
    }) => {
      const res = await subjectServices.createSubjectService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const updateSubjectAction = createAsyncThunk(
  'subjectSlice/update',
  catchAsync(
    async (data: {
      subjectId: number
      classId: number
      body: Partial<TCreateSubject>
      onSuccess?: () => void
    }) => {
      const res = await subjectServices.updateSubjectService(
        data.subjectId,
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true
  )
)

export const getSubjectListAction = createAsyncThunk(
  'subjectSlice/getSubjectList',
  catchAsync(
    async (data: {
      body: { page?: number; limit?: number }
      classId: number
    }) => {
      const res = await subjectServices.getSubjectListService(
        data.classId,
        data.body.page,
        data.body.limit
      )

      return res
    }
  )
)

const subjectSlice = createSlice({
  name: 'SubjectSlice',
  initialState,
  reducers: {
    updateSelectedClass: (
      state,
      action: { payload: { label: string; value: number } }
    ) => {
      state.subjectList.selectedClass = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTeacherList.pending, (state) => {
      state.createSubject.teachers.loading = true
    })
    builder.addCase(getTeacherList.fulfilled, (state, action) => {
      state.createSubject.teachers.loading = false
      state.createSubject.teachers.data = action.payload.data
    })
    builder.addCase(getTeacherList.rejected, (state) => {
      state.createSubject.teachers.loading = false
    })
    // CREATE SUBJECT
    builder.addCase(createSubjectAction.pending, (state) => {
      state.createSubject.loading = true
    })
    builder.addCase(createSubjectAction.fulfilled, (state) => {
      state.createSubject.loading = false
    })
    builder.addCase(createSubjectAction.rejected, (state) => {
      state.createSubject.loading = false
    })
    // GET SUBJECT LIST ACTION
    builder.addCase(getSubjectListAction.pending, (state) => {
      state.subjectList.loading = true
    })
    builder.addCase(getSubjectListAction.fulfilled, (state, action) => {
      state.subjectList.loading = false
      state.subjectList.data = action.payload.data
    })
    builder.addCase(getSubjectListAction.rejected, (state) => {
      state.subjectList.loading = false
    })
    // UPDATE SUBJECT ACTION
    builder.addCase(updateSubjectAction.pending, (state) => {
      state.updateSubject.loading = true
    })
    builder.addCase(updateSubjectAction.fulfilled, (state) => {
      state.updateSubject.loading = false
    })
    builder.addCase(updateSubjectAction.rejected, (state) => {
      state.updateSubject.loading = false
    })
  },
})

export default subjectSlice.reducer
export const { updateSelectedClass } = subjectSlice.actions
