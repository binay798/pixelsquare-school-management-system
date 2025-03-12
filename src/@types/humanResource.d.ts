declare namespace HumanResource {
  interface IDesignation {
    school_id: number
    designation: string
    id: number
    created_at: string
    updated_at: string
  }

  interface IEmployee {
    id: number
    created_at: string
    updated_at: string
    user_id: number
    employee_designation_id: number
    national_id: string
    profile_photo: number
    joining_date: string
    school_id: number
    resume_asset_id: number
  }
}
