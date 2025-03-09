import { BaseAttribute } from './base'

declare namespace AcademicYear {
  interface IAcademicYear extends BaseAttribute {
    name: string
    session_start_at: string
    session_end_at: string
    note?: string
    is_active: boolean
  }
}
