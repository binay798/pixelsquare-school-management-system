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

export const attendanceServices = {
  getStudentAttendanceList,
  createStudentAttendance,
}
