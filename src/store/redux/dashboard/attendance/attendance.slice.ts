import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  attendanceServices,
  CreateStudentAttendanceDto,
  UpdateStudentAttendanceDto,
} from './attendance.service'

interface InitialState {
  studentAttendance: {
    studentList: {
      data: Attendance.IStudentAttendance[] | null
      loading: boolean
    }
    create: {
      loading: boolean
    }
    update: {
      loading: boolean
    }
  }
}
const initialState: InitialState = {
  studentAttendance: {
    studentList: {
      data: null,
      loading: false,
    },
    create: {
      loading: false,
    },
    update: {
      loading: false,
    },
  },
}

export const getStudentAttendanceListSlice = createAsyncThunk(
  'attendance/studentAttendanceList',
  catchAsync(
    async (data: { classId: number; classSectionId: number; date: string }) => {
      const res = await attendanceServices.getStudentAttendanceList(
        data.classId,
        data.classSectionId,
        data.date
      )

      return res
    }
  )
)

export const createStudentAttendanceSlice = createAsyncThunk(
  'attendance/createStudentAttendance',
  catchAsync(async (data: CreateStudentAttendanceDto) => {
    const res = await attendanceServices.createStudentAttendance(data)

    return res
  })
)

export const updateStudentAttendanceSlice = createAsyncThunk(
  'attendance/updateStudentAttendance',
  catchAsync(
    async (data: {
      payload: UpdateStudentAttendanceDto[]
      onSuccess: () => void
    }) => {
      const res = await attendanceServices.updateStudentAttendance(data.payload)
      data?.onSuccess()

      return res
    },
    true
  )
)

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET STUDENT ATTENDANCE LIST
    builder.addCase(getStudentAttendanceListSlice.pending, (state) => {
      state.studentAttendance.studentList.loading = true
    })
    builder.addCase(
      getStudentAttendanceListSlice.fulfilled,
      (state, action) => {
        state.studentAttendance.studentList.loading = false
        state.studentAttendance.studentList.data = action.payload.data
      }
    )
    builder.addCase(getStudentAttendanceListSlice.rejected, (state) => {
      state.studentAttendance.studentList.loading = false
    })
    // CREATE STUDENT ATTENDANCE LIST
    builder.addCase(createStudentAttendanceSlice.pending, (state) => {
      state.studentAttendance.create.loading = true
    })
    builder.addCase(createStudentAttendanceSlice.fulfilled, (state) => {
      state.studentAttendance.create.loading = false
    })
    builder.addCase(createStudentAttendanceSlice.rejected, (state) => {
      state.studentAttendance.create.loading = false
    })
    // UPDATE STUDENT ATTENDANCE
    builder.addCase(updateStudentAttendanceSlice.pending, (state) => {
      state.studentAttendance.update.loading = true
    })
    builder.addCase(updateStudentAttendanceSlice.fulfilled, (state) => {
      state.studentAttendance.update.loading = false
    })
    builder.addCase(updateStudentAttendanceSlice.rejected, (state) => {
      state.studentAttendance.update.loading = false
    })
  },
})

export default attendanceSlice.reducer
