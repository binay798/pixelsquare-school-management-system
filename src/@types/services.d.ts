declare namespace Service {
  namespace Auth {
    interface Login {
      email: string
      password: string
      schoolId: number
    }
  }

  namespace Account {
    /** `PATCH /api/account/password` */
    interface UpdatePassword {
      currentPassword: string
      newPassword: string
    }

    /**
     * `PATCH /api/account/profile`
     *
     * Every detail is optional so a single detail can be updated on its own.
     * The form of the account page always sends the complete set.
     */
    interface UpdateProfile {
      firstname?: string
      middlename?: string
      lastname?: string
      mobile?: string
      temporary_address?: string
      permanent_address?: string
      religion?: string
      blood_group?: string
      date_of_birth?: string
      gender?: string
      nationality?: string
    }
  }

  namespace ManageEmployee {
    interface CreateEmployee {
      image: File
      user_profile: Omit<
        User.IUserProfile,
        'id' | 'created_at' | 'updated_at' | 'user_id'
      >
      user_credential: Pick<User.IUser, 'email'>
      employee_profile: Pick<
        HumanResource.IEmployee,
        'employee_designation_id' | 'joining_date' | 'national_id'
      > & { role: string }
    }

    interface UpdateEmployee {
      user_profile: Partial<
        Omit<User.IUserProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>
      >
      employee_profile: Partial<
        Pick<
          HumanResource.IEmployee,
          'employee_designation_id' | 'joining_date' | 'national_id'
        > & { role: string }
      >
    }
  }
}
