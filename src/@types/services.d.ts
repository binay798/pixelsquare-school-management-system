declare namespace Service {
  namespace Auth {
    interface Login {
      email: string
      password: string
      schoolId: number
    }
  }

  namespace ManageEmployee {
    interface CreateEmployee {
      image: File
      user_profile: Omit<
        User.IUserProfile,
        'id' | 'created_at' | 'updated_at' | 'user_id'
      >
      user_credential: Pick<User.IUser, 'email' | 'password'>
      employee_profile: Pick<
        HumanResource.IEmployee,
        'employee_designation_id' | 'joining_date' | 'national_id'
      > & { role: string }
    }
  }
}
