import { CircleDashed, Clock3, UserCheck, UserX, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { AttendanceStatus, AttendanceStatusFilter } from './attendance.types'

export interface IAttendanceStatusMeta {
  /** full label, used in tooltips and the report */
  label: string
  /** short label used inside the segmented control */
  shortLabel: string
  /** solid colour of the state (button, dot, icon) */
  accent: string
  /** tinted background of the state (card of the summary) */
  soft: string
  icon: LucideIcon
}

/**
 * The colours mirror the ones of the other dashboard screens: green = positive,
 * red = negative, orange = neutral exception (leave).
 */
export const ATTENDANCE_STATUS_META: Record<
  AttendanceStatus,
  IAttendanceStatusMeta
> = {
  present: {
    label: 'Present',
    shortLabel: 'Present',
    accent: colors.green[600],
    soft: colors.green[50],
    icon: UserCheck,
  },
  absent: {
    label: 'Absent',
    shortLabel: 'Absent',
    accent: colors.red[500],
    soft: colors.red[50],
    icon: UserX,
  },
  leave: {
    label: 'On leave',
    shortLabel: 'Leave',
    accent: colors.orange[800],
    soft: colors.orange[50],
    icon: Clock3,
  },
}

/** Order of the segmented control and of the report. */
export const ATTENDANCE_STATUS_LIST: AttendanceStatus[] = [
  'present',
  'absent',
  'leave',
]

export const ATTENDANCE_UNMARKED_META = {
  label: 'Not marked',
  accent: colors.grey[500],
  soft: colors.grey[100],
  icon: CircleDashed,
}

export const ATTENDANCE_TOTAL_META = {
  label: 'People',
  accent: colors.blue[600],
  soft: colors.blue[50],
  icon: Users,
}

export const ATTENDANCE_STATUS_FILTER_OPTIONS: {
  label: string
  value: AttendanceStatusFilter
}[] = [
  { label: 'All', value: 'all' },
  ...ATTENDANCE_STATUS_LIST.map((status) => ({
    label: ATTENDANCE_STATUS_META[status].label,
    value: status as AttendanceStatusFilter,
  })),
  { label: 'Not marked', value: 'unmarked' as AttendanceStatusFilter },
]
