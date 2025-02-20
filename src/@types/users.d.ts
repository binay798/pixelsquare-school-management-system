declare namespace User {
  import { BaseAttribute } from './base'
  interface IUser extends BaseAttribute {
    email: string
    password: string
    is_active: boolean
    completed_password_setup: boolean
  }
}
