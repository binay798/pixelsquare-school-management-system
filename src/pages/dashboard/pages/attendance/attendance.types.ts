/**
 * Shared types of the attendance screens.
 *
 * The three modules (students, teachers, employees) talk to three different
 * endpoints which return three different shapes (`Attendance.IStudentAttendance`,
 * ...). Every page maps its own rows into `AttendancePerson`, so the whole UI
 * below works on one shape and no business rule is duplicated.
 */

/** The only three values accepted by every attendance endpoint. */
export type AttendanceStatus = 'present' | 'absent' | 'leave'

/** `all` shows everybody, `unmarked` the people without a record of the day. */
export type AttendanceStatusFilter = 'all' | 'unmarked' | AttendanceStatus

/** One person of the sheet, mapped from the module specific API row. */
export interface AttendancePerson {
  /** id of the student / teacher / employee */
  id: number
  /** human readable identifier printed in the sheet (`STA_12`) */
  code: string
  name: string
  photo?: string
  /** class / section / designation, when the endpoint exposes it */
  meta?: string
  /** user behind the person, resolved again by the backend */
  userId?: number
  /** id of the row of the active academic year (`studentAcademicYearId`) */
  academicYearRecordId: number
  /** id of the attendance record of the day, `undefined` while not submitted */
  attendanceId?: number
  /** status stored on the record of the day */
  status?: AttendanceStatus
  /** note stored on the record of the day */
  note?: string
}

/** A person of the sheet merged with the local (not yet saved) values. */
export interface AttendanceSheetRow extends AttendancePerson {
  currentStatus?: AttendanceStatus
  currentNote: string
  /** a local value differs from the stored one */
  dirty: boolean
}

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  leave: number
  /** people of the day without any status */
  unmarked: number
  /** people with a status, saved or not */
  marked: number
  /** present / marked, 0 when nothing is marked yet */
  attendanceRate: number
  /** marked / total */
  markingProgress: number
  /** rows changed but not saved yet */
  dirty: number
}

/** A row which has to be written, with the status to store. */
export interface AttendanceWrite {
  row: AttendanceSheetRow
  status: AttendanceStatus
}

export interface AttendanceSubmissionPlan {
  /** at least one row of the day already has an attendance record */
  hasSavedRecords: boolean
  /** rows to POST (they have no attendance record yet) */
  creates: AttendanceWrite[]
  /** rows to PATCH (they have an attendance record already) */
  updates: AttendanceWrite[]
  /** people without any status */
  unmarked: number
}
