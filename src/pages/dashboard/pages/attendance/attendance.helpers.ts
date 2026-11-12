import moment from 'moment'
import { ATTENDANCE_STATUS_LIST } from './attendance.constants'
import {
  AttendancePerson,
  AttendanceSheetRow,
  AttendanceStats,
  AttendanceStatus,
  AttendanceStatusFilter,
  AttendanceSubmissionPlan,
} from './attendance.types'

/**
 * The API returns a free `type` column, only the three known values are states
 * of the sheet: anything else is treated as "no status yet".
 */
export function parseAttendanceStatus(
  type?: string | null
): AttendanceStatus | undefined {
  if (!type) {
    return undefined
  }

  const normalized = type.trim().toLowerCase()

  return ATTENDANCE_STATUS_LIST.find((status) => status === normalized)
}

/** Builds `firstname middlename lastname` without the empty parts. */
export function getPersonName(
  profile?: {
    firstname?: string | null
    middlename?: string | null
    lastname?: string | null
  } | null
) {
  if (!profile) {
    return ''
  }

  return [profile.firstname, profile.middlename, profile.lastname]
    .map((part) => (part ?? '').trim())
    .filter((part) => part.length > 0)
    .join(' ')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** Merges the persisted values of a person with the local drafts. */
export function buildSheetRows(
  people: AttendancePerson[],
  draftStatuses: Record<number, AttendanceStatus>,
  draftNotes: Record<number, string>
): AttendanceSheetRow[] {
  return people.map((person) => {
    const currentStatus = draftStatuses[person.id] ?? person.status
    const currentNote = draftNotes[person.id] ?? person.note ?? ''

    return {
      ...person,
      currentStatus,
      currentNote,
      dirty:
        currentStatus !== person.status || currentNote !== (person.note ?? ''),
    }
  })
}

export function computeAttendanceStats(
  rows: AttendanceSheetRow[]
): AttendanceStats {
  const total = rows.length
  let present = 0
  let absent = 0
  let leave = 0
  let dirty = 0

  rows.forEach((row) => {
    if (row.currentStatus === 'present') {
      present += 1
    } else if (row.currentStatus === 'absent') {
      absent += 1
    } else if (row.currentStatus === 'leave') {
      leave += 1
    }

    if (row.dirty) {
      dirty += 1
    }
  })

  const marked = present + absent + leave

  return {
    total,
    present,
    absent,
    leave,
    marked,
    unmarked: total - marked,
    dirty,
    attendanceRate: marked === 0 ? 0 : Math.round((present / marked) * 100),
    markingProgress: total === 0 ? 0 : Math.round((marked / total) * 100),
  }
}

/**
 * The search and the status cards are applied on the sheet already loaded: the
 * attendance endpoints take a class section and a date, not a free text query.
 */
export function filterAttendanceRows(
  rows: AttendanceSheetRow[],
  search: string,
  statusFilter: AttendanceStatusFilter
) {
  const query = search.trim().toLowerCase()

  return rows.filter((row) => {
    if (statusFilter === 'unmarked' && row.currentStatus) {
      return false
    }

    if (
      statusFilter !== 'all' &&
      statusFilter !== 'unmarked' &&
      row.currentStatus !== statusFilter
    ) {
      return false
    }

    if (query.length === 0) {
      return true
    }

    return (
      row.name.toLowerCase().includes(query) ||
      row.code.toLowerCase().includes(query)
    )
  })
}

/**
 * Splits the sheet into the rows to POST and the rows to PATCH.
 *
 * - a day which is not submitted yet stores every row, unmarked people are
 *   saved as absent (the behaviour of the previous sheet),
 * - a day which already has records only stores the rows the user marked or
 *   changed, so saving the sheet never creates silent absences.
 */
export function buildSubmissionPlan(
  rows: AttendanceSheetRow[]
): AttendanceSubmissionPlan {
  const hasSavedRecords = rows.some((row) => row.attendanceId !== undefined)
  const plan: AttendanceSubmissionPlan = {
    hasSavedRecords,
    creates: [],
    updates: [],
    unmarked: rows.filter((row) => !row.currentStatus).length,
  }

  rows.forEach((row) => {
    if (row.attendanceId !== undefined) {
      if (row.dirty && row.currentStatus) {
        plan.updates.push({ row, status: row.currentStatus })
      }

      return
    }

    if (!hasSavedRecords) {
      plan.creates.push({ row, status: row.currentStatus ?? 'absent' })

      return
    }

    if (row.currentStatus) {
      plan.creates.push({ row, status: row.currentStatus })
    }
  })

  return plan
}

export function formatAttendanceDay(date: string) {
  return moment(date).format('ddd, DD MMM YYYY')
}

export function isToday(date: string) {
  return moment(date).isSame(moment(), 'day')
}

export function shiftDay(date: string, amount: number) {
  return moment(date).add(amount, 'day').format('YYYY-MM-DD')
}

export function formatSavedAt(value: Date) {
  return moment(value).format('HH:mm')
}

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`

/**
 * The attendance endpoints do not expose an export route, the report of the day
 * is therefore built from the sheet already loaded in the screen.
 */
export function buildAttendanceCsv(rows: AttendanceSheetRow[], date: string) {
  const header = ['ID', 'Name', 'Status', 'Note', 'Date']
  const lines = rows.map((row) =>
    [
      row.code,
      row.name,
      row.currentStatus ?? 'not_marked',
      row.currentNote,
      date,
    ]
      .map(escapeCsvValue)
      .join(',')
  )

  return [header.join(','), ...lines].join('\n')
}

export function downloadAttendanceCsv(
  rows: AttendanceSheetRow[],
  date: string
) {
  const blob = new Blob([buildAttendanceCsv(rows, date)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `attendance-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
