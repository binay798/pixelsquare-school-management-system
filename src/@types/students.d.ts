declare namespace Students {
  interface IStudentType {
    id: number
    created_at: string
    updated_at: string
    name: string
    school_id: number
  }

  interface IStudent {
    id: number
    created_at: string
    updated_at: string
    user_id: string
    profile_photo: number
    school_id: number
    previous_school: string
    guardian_id?: number | null
    father_name: string
    father_mobile: string
    mother_name: string
    mother_mobile: string
  }
  interface IStudentAcademicYear {
    id: number
    created_at: string
    updated_at: string
    student_id: number
    academic_year_id: number
    roll_no: number
    class_id: number
    class_section_id: number
  }

  interface IStudentList
    extends Api.PaginatedData<{
      user_profile_details: Pick<
        User.IUserProfile,
        'id' | 'gender' | 'firstname' | 'lastname' | 'middlename'
      >
      student_details: Pick<IStudent, 'father_name' | 'father_mobile' | 'id'>
      student_academic_year_details: Pick<
        IStudentAcademicYear,
        'id' | 'roll_no'
      >
      class_details: Pick<Academics.IClass, 'id' | 'name' | 'numeric_name'>
      class_section_details: Pick<Academics.IClassSection, 'id' | 'name'>
      asset_details?: Asset.IAsset
    }> {
    total: string
  }

  interface IStudentDetail {
    user_profile_details: User.IUserProfile
    student_details: IStudent
    student_academic_year_details: Pick<IStudentAcademicYear, 'id' | 'roll_no'>
    class_details: Pick<Academics.IClass, 'id' | 'name' | 'numeric_name'>
    class_section_details: Pick<Academics.IClassSection, 'id' | 'name'>
    asset_details: Asset.IAsset
    user_details: Pick<User.IUser, 'id' | 'email'>
  }
}
