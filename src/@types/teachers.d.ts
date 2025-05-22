declare namespace Teachers {
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
}
