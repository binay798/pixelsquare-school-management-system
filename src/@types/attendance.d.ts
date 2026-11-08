declare namespace Attendance {
  /**
   * Every nested detail of a row is `null` when the left join of the query did
   * not match: a student without photo, a day which is not submitted yet.
   */
  interface IAttendanceDetails {
    id: number
    note?: string | null
    type: string
    attendance_date: string
  }

  interface IUserProfileDetails {
    id: number
    lastname: string
    firstname: string
    middlename?: string
    user_id: number
  }

  interface IProfilePhotoDetails {
    id: number
    path: string
    label: string
    file_type: string
  }

  interface IStudentAttendance {
    user_profile_details: IUserProfileDetails
    student_details: {
      id: number
    }
    student_academic_year_details: {
      id: number
      academic_year_id: number
    }
    profile_photo_details: IProfilePhotoDetails | null
    attendance_details: IAttendanceDetails | null
    student_attendance_details: {
      id: number
      student_id: number
      student_academic_year_id: number
      academic_year_id: number
    } | null
  }

  interface ITeacherAttendance {
    user_profile_details: IUserProfileDetails
    teacher_details: {
      id: number
    }
    teacher_academic_year_details: {
      id: number
      academic_year_id: number
    }
    profile_photo_details: IProfilePhotoDetails | null
    attendance_details: IAttendanceDetails | null
    teacher_attendance_details: {
      id: number
      teacher_id: number
      teacher_academic_year_id: number
      academic_year_id: number
    } | null
  }

  interface IEmployeeAttendance {
    user_profile_details: IUserProfileDetails
    employee_details: {
      id: number
    }
    employee_academic_year_details: {
      id: number
      academic_year_id: number
    }
    profile_photo_details: IProfilePhotoDetails | null
    attendance_details: IAttendanceDetails | null
    employee_attendance_details: {
      id: number
      employee_id: number
      academic_year_id: number
    } | null
  }
}
