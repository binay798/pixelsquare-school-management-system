declare namespace Api {
  interface Base<T> {
    success: boolean
    data: {
      type: string
      message: string
      data: T
    }
  }

  interface PaginatedData<T> {
    total: string
    rows: Array<T>
    isLast: boolean
  }

  namespace Auth {
    interface Login {
      user: Omit<User.IUser, 'password', 'completed_password_setup'>
      userRoles: string[]
    }
  }

  interface ISchool {
    id: number
    created_at: string
    updated_at: string
    name: string
    address: string
    phone: string
    email: string
    is_active: boolean
    school_type: 'private' | 'public' | 'government' | 'other'
    affiliation: string
    established_year: string
    slogan: string
    website_url: string
    gps_coordinate: string
    principal_name: string
    vice_principal_name: string
    school_ownership: string
    grades_offered: string
    medium_of_instruction: string
    number_of_classrooms: string
    library_availability: boolean
    laboratories: string
    playground_availability: boolean
    sports_facilities: string
    transportation_services: string
    facebook_link: string
    twitter_link: string
    linkedin_link: string
    instagram_link: string
  }

  interface IDesignationList extends PaginatedData<HumanResource.IDesignation> {
    total: string
  }

  interface IEmployeeList
    extends PaginatedData<{
      employee_details: {
        id: number
      }
      user_profile_details: {
        id: number
        firstname: string
        lastname: string
        gender: string
        mobile: string
      }
      user_details: {
        id: number
        email: string
      }
      designation_details: {
        id: number
        designation: string
      }
    }> {
    total: string
  }

  interface IEmployeeDetails {
    employee_details: Pick<
      HumanResource.IEmployee,
      'id' | 'national_id' | 'joining_date'
    >
    user_profile_details: User.IUserProfile
    user_details: Pick<User.IUser, 'email' | 'id'>
    designation_details: Pick<HumanResource.IDesignation, 'id' | 'designation'>
    user_roles: Pick<User.IUserRole, 'id' | 'role'>[]
    profile_pic_details: Asset.IAsset | null
  }
}
