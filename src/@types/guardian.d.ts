declare namespace Guardian {
  type TRelationship =
    | 'father'
    | 'mother'
    | 'grandparent'
    | 'sibling'
    | 'relative'
    | 'local_guardian'
    | 'other'

  interface IPermissionFlags {
    can_pickup_student: boolean
    can_view_academics: boolean
    can_view_fees: boolean
    receives_announcements: boolean
    is_emergency_contact: boolean
  }

  interface IStudentGuardianLink extends IPermissionFlags {
    id: number
    student_id: number
    guardian_id: number
    relationship: TRelationship | null
    is_primary: boolean
    notes: string | null
  }

  // Link row returned inside the student detail (`guardians`).
  interface ILinkedGuardianRow {
    link_details: IStudentGuardianLink
    guardian_details: {
      id: number
      user_id: number
      school_id: number
    }
    user_profile_details: User.IUserProfile
    user_details: Pick<User.IUser, 'id' | 'email' | 'is_active'>
    asset_details: Asset.IAsset | null
  }

  // Student row returned for a guardian (`/guardians/:id/students`).
  interface ILinkedStudentRow {
    link_details: IStudentGuardianLink
    user_profile_details: Pick<
      User.IUserProfile,
      'id' | 'firstname' | 'middlename' | 'lastname' | 'gender' | 'mobile'
    >
    student_details: {
      id: number
    }
    student_academic_year_details: Pick<
      Students.IStudentAcademicYear,
      'id' | 'roll_no'
    > | null
    class_details: Pick<Academics.IClass, 'id' | 'name' | 'numeric_name'> | null
    class_section_details: Pick<Academics.IClassSection, 'id' | 'name'> | null
    asset_details: Asset.IAsset | null
  }

  interface ILinkedStudentList extends Api.PaginatedData<ILinkedStudentRow> {
    total: string
  }

  // Student row returned from the "available students" search.
  type IAvailableStudentRow = Omit<ILinkedStudentRow, 'link_details'>

  interface IAvailableStudentList
    extends Api.PaginatedData<IAvailableStudentRow> {
    total: string
  }

  interface IGuardianStudentLinkPayload extends Partial<IPermissionFlags> {
    relationship?: TRelationship | null
    is_primary?: boolean
    notes?: string | null
  }

  interface IAttachStudentPayload extends IGuardianStudentLinkPayload {
    student_id: number
  }

  interface IFeeSummaryRow {
    student_id: number
    student_name: string
    class_name: string | null
    class_section_name: string | null
    relationship: TRelationship | null
    is_primary: boolean
    invoice_count: number
    total_billed: number
    total_paid: number
    total_outstanding: number
    last_payment_date: string | null
  }

  interface IFeeSummary {
    total_billed: number
    total_paid: number
    total_outstanding: number
    students: IFeeSummaryRow[]
  }

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
