import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  TCreateTeacherDto,
  teacherServices,
  TUpdateTeacherDetailDto,
} from './teachers.service'
import { catchAsync } from '@src/helpers/catchAsync.helpers'

interface InitialState {
  teacherList: {
    data: Teachers.ITeacherList | null
    loading: boolean
  }
  createTeacher: {
    loading: boolean
  }
  changeProfilePic: {
    loading: boolean
  }
  teacherDetail: {
    data: Teachers.ITeacherDetail | null
    loading: boolean
  }
  editTeacher: {
    loading: boolean
  }
}
const initialState: InitialState = {
  teacherList: {
    data: null,
    loading: false,
  },
  teacherDetail: {
    data: null,
    loading: false,
  },
  editTeacher: {
    loading: false,
  },
  createTeacher: {
    loading: false,
  },
  changeProfilePic: {
    loading: false,
  },
}

export const getTeacherListAction = createAsyncThunk(
  'teacherSlice/getList',
  catchAsync(
    async (data: { page?: number; limit?: number; onSuccess?: () => void }) => {
      const res = await teacherServices.getTeacherList(data.page, data.limit)
      data.onSuccess?.()

      return res
    }
  )
)

export const createTeacherAction = createAsyncThunk(
  'teacherSlice/create',
  catchAsync(
    async (data: { body: TCreateTeacherDto; onSuccess?: () => void }) => {
      const res = await teacherServices.createTeacherService(data.body)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created teacher.'
  )
)

export const getTeacherDetailAction = createAsyncThunk(
  'teacherSlice/getDetails',
  catchAsync(async (data: { teacherId: number }) => {
    const res = await teacherServices.getTeacherDetails(data.teacherId)

    return res
  })
)

export const editTeacherDetailAction = createAsyncThunk(
  'teacherSlice/editDetail',
  catchAsync(
    async (data: {
      teacherId: number
      body: TUpdateTeacherDetailDto
      onSuccess?: () => void
    }) => {
      const res = await teacherServices.editTeacherDetails(
        data.teacherId,
        data.body
      )

      return res
    },
    true
  )
)

export const changeTeacherProfilePicAction = createAsyncThunk(
  'teacherSlice/changeProfilePic',
  catchAsync(
    async (data: {
      image: File
      teacherId: number
      onSuccess?: () => void
    }) => {
      const res = await teacherServices.changeTeacherProfilePicService(
        data.teacherId,
        data.image
      )

      return res
    }
  )
)

export const teacherSlice = createSlice({
  name: 'teacherSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET TEACHER LIST ACTION
    builder.addCase(getTeacherListAction.pending, (state) => {
      state.teacherList.loading = true
    })
    builder.addCase(getTeacherListAction.fulfilled, (state, action) => {
      state.teacherList.loading = false
      state.teacherList.data = action.payload.data
    })
    builder.addCase(getTeacherListAction.rejected, (state) => {
      state.teacherList.loading = false
    })
    // CREATE TEACHER ACTION
    builder.addCase(createTeacherAction.pending, (state) => {
      state.createTeacher.loading = true
    })
    builder.addCase(createTeacherAction.fulfilled, (state) => {
      state.createTeacher.loading = false
    })
    builder.addCase(createTeacherAction.rejected, (state) => {
      state.createTeacher.loading = false
    })
    // GET TEACHER DETAIL
    builder.addCase(getTeacherDetailAction.pending, (state) => {
      state.teacherDetail.loading = true
    })
    builder.addCase(getTeacherDetailAction.fulfilled, (state, action) => {
      state.teacherDetail.loading = false
      state.teacherDetail.data = action.payload.data
    })
    builder.addCase(getTeacherDetailAction.rejected, (state) => {
      state.teacherDetail.loading = false
    })
    // EDIT TEACHER DETAIL ACTION
    builder.addCase(editTeacherDetailAction.pending, (state) => {
      state.editTeacher.loading = true
    })
    builder.addCase(editTeacherDetailAction.fulfilled, (state) => {
      state.editTeacher.loading = false
    })
    builder.addCase(editTeacherDetailAction.rejected, (state) => {
      state.editTeacher.loading = false
    })
    // CHANGE TEACHER PROFILE PICTURE ACTION
    builder.addCase(changeTeacherProfilePicAction.pending, (state) => {
      state.changeProfilePic.loading = true
    })
    builder.addCase(changeTeacherProfilePicAction.fulfilled, (state) => {
      state.changeProfilePic.loading = false
    })
    builder.addCase(changeTeacherProfilePicAction.rejected, (state) => {
      state.changeProfilePic.loading = false
    })
  },
})

export default teacherSlice.reducer
