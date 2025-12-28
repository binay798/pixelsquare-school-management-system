declare namespace Attendance {
  interface IStudentAttendance {
    user_profile_details: {
      id: number
      lastname: string
      firstname: string
      middlename?: string
      user_id: number
    }
    student_details: {
      id: number
    }
    student_academic_year_details: {
      id: number
      academic_year_id: number
    }
    profile_photo_details: {
      id: number
      path: string
      label: string
      file_type: string
    }
    attendance_details: {
      id: number
      note?: string
      type: string
      attendance_date: string
    }
    student_attendance_details: {
      id: number
      student_id: number
      student_academic_year_id: number
      academic_year_id: number
    }
  }
}
