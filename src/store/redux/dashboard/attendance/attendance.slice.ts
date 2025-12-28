import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  attendanceServices,
  CreateStudentAttendanceDto,
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
  },
})

export default attendanceSlice.reducer
