declare namespace User {
  import { BaseAttribute } from './base'
  interface IUser extends BaseAttribute {
    email: string
    password: string
    is_active: boolean
    completed_password_setup: boolean
  }
  interface IUserProfile extends BaseAttribute {
    firstname: string
    middlename?: string
    lastname: string
    mobile: string
    temporary_address: string
    permanent_address: string
    religion: string
    blood_group: string
    date_of_birth: string
    gender: string
    nationality: string
    user_id: number
  }

  interface IUserRole extends BaseAttribute {
    user_id: number
    role: string
    is_active: boolean
  }
}
