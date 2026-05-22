declare namespace Guardian {
  interface IList
    extends Api.PaginatedData<{
      guardian_details: {
        id: number
      }
      user_profile_details: {
        mobile: number
        lastname: string
        firstname: string
        gender: string
      }
      user_details: {
        email: string
      }
      asset_details: {
        id: number
        path: string
        label: string
        file_type: string
      }
    }> {}

  interface IGuardianDetail {
    guardian_details: {
      id: number
    }
    user_profile_details: {
      id: number
      created_at: string
      updated_at: string
      mobile: number
      lastname: string
      firstname: string
      middlename?: string
      gender: string
      user_id: number
      religion: string
      blood_group: string
      nationality: string
      date_of_birth: string
      permanent_address: string
      temporary_address: string
    }
    user_details: {
      email: string
    }
    asset_details: {
      id: number
      path: string
      label: string
      file_type: string
    }
  }
}
