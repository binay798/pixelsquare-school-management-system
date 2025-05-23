declare namespace Teachers {
  interface ITeacher {
    id: number
    created_at: string
    updated_at: string
    user_id: number
    school_department_id: number
    national_id: string
    joining_date: string
    school_id: number
    profile_photo: number
    resume_asset_id: number
  }
  interface ITeacherList
    extends Api.PaginatedData<{
      user_profile_details: Pick<
        User.IUserProfile,
        'id' | 'firstname' | 'lastname'
      >
      user_details: Pick<User.IUser, 'email' | 'id'>
      department_details: Pick<School.IDepartment, 'name'>
      teacher_details: { id: number }
    }> {
    total_count: string
  }
  interface ITeacherDetail {
    user_profile_details: User.IUserProfile
    user_details: Pick<User.IUser, 'email' | 'id'>
    department_details: { name: string }
    teacher_details: Pick<
      ITeacher,
      'national_id' | 'id' | 'joining_date' | 'school_department_id'
    >
    profile_photo_details: Asset.IAsset
  }
}
