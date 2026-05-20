import { api } from '@src/helpers/api.helpers'

const getStudentAttendanceList = async (
  classId: number,
  classSectionId: number,
  date: string
) => {
  const res = await api<Api.Base<Attendance.IStudentAttendance[]>>('get')(
    'attendance/students',
    {
      classId,
      classSectionId,
      date,
    }
  )

  return res.data.data
}

export interface CreateStudentAttendanceDto {
  payload: {
    userId: number
    date: string
    type: string
    note?: string
    studentId: number
    studentAcademicYearId: number
  }[]
}
const createStudentAttendance = async (data: CreateStudentAttendanceDto) => {
  const res = await api<Api.Base<object>>('post')(
    'attendance/students',
    undefined,
    data.payload
  )

  return res.data.data
}

export interface UpdateStudentAttendanceDto {
  attendanceId: number
  type: string
  note?: string
}
const updateStudentAttendance = async (data: UpdateStudentAttendanceDto[]) => {
  const res = await api<Api.Base<object>>('patch')(
    'attendance/students',
    undefined,
    data
  )

  return res.data.data
}

// TEACHERS ATTENDANCE

const getTeachersAttendanceList = async ({ date }: { date: string }) => {
  const res = await api<Api.Base<Attendance.ITeacherAttendance[]>>('get')(
    '/attendance/teachers',
    { date }
  )

  return res.data.data
}

export interface CreateTeacherAttendanceDto {
  payload: {
    userId: number
    date: string
    type: string
    note?: string
    teacherId: number
  }[]
}
const createTeacherAttendance = async (data: CreateTeacherAttendanceDto) => {
  const res = await api<Api.Base<object>>('post')(
    'attendance/teachers',
    undefined,
    data.payload
  )

  return res.data.data
}

export interface UpdateTeacherAttendanceDto {
  attendanceId: number
  type: string
  note?: string
}

const updateTeacherAttendance = async (data: UpdateTeacherAttendanceDto[]) => {
  const res = await api<Api.Base<object>>('patch')(
    'attendance/teachers',
    undefined,
    data
  )

  return res.data.data
}

// EMPLOYEE ATTENDANCE
const getEmployeeAttendanceList = async ({ date }: { date: string }) => {
  const res = await api<Api.Base<Attendance.IEmployeeAttendance[]>>('get')(
    'attendance/employees',
    { date }
  )

  return res.data.data
}

export interface CreateEmployeeAttendanceDto {
  userId: number
  date: string
  type: string
  note?: string
  employeeId: number
}

const createEmployeeAttendance = async (
  data: CreateEmployeeAttendanceDto[]
) => {
  const res = await api<Api.Base<object>>('post')(
    'attendance/employees',
    undefined,
    data
  )

  return res.data.data
}

export interface UpdateEmployeeAttendanceDto {
  attendanceId: number
  type: string
  note?: string
}
const updateEmployeeAttendance = async (
  data: UpdateEmployeeAttendanceDto[]
) => {
  const res = await api<Api.Base<object>>('patch')(
    'attendance/employees',
    undefined,
    data
  )

  return res.data.data
}

export const attendanceServices = {
  getStudentAttendanceList,
  createStudentAttendance,
  updateStudentAttendance,
  getTeachersAttendanceList,
  createTeacherAttendance,
  updateTeacherAttendance,
  getEmployeeAttendanceList,
  createEmployeeAttendance,
  updateEmployeeAttendance,
}
