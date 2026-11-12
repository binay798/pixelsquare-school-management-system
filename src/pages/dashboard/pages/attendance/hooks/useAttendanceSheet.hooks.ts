import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildSheetRows,
  computeAttendanceStats,
  filterAttendanceRows,
} from '../attendance.helpers'
import {
  AttendancePerson,
  AttendanceSheetRow,
  AttendanceStats,
  AttendanceStatus,
  AttendanceStatusFilter,
} from '../attendance.types'

interface Params {
  /** the people of the selected day, already mapped by the page */
  people: AttendancePerson[]
  /**
   * identity of the loaded sheet (class section + date). When it changes the
   * unsaved values of the previous sheet are dropped.
   */
  sheetKey: string
}

interface Result {
  rows: AttendanceSheetRow[]
  /** rows matching the search field and the status cards */
  visibleRows: AttendanceSheetRow[]
  stats: AttendanceStats
  search: string
  setSearch: (search: string) => void
  statusFilter: AttendanceStatusFilter
  setStatusFilter: (filter: AttendanceStatusFilter) => void
  setStatus: (row: AttendanceSheetRow, status: AttendanceStatus) => void
  markRows: (rows: AttendanceSheetRow[], status: AttendanceStatus) => void
  setNote: (row: AttendanceSheetRow, note: string) => void
  resetDraft: () => void
  /** at least one local value differs from the stored one */
  hasChanges: boolean
}

/**
 * Local state of an attendance sheet.
 *
 * The statuses and the notes are kept as drafts so a half finished sheet is
 * never lost by an accidental click, and only the *changed* rows are sent back
 * to the API. A draft is dropped as soon as the server value matches it again,
 * which is how a successful save clears the sheet without a manual reset.
 */
export function useAttendanceSheet({ people, sheetKey }: Params): Result {
  const [draftStatuses, setDraftStatuses] = useState<
    Record<number, AttendanceStatus>
  >({})
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<AttendanceStatusFilter>('all')

  // another class section or another day: the drafts of the previous sheet
  // belong to other records and would be saved on the wrong people
  useEffect(() => {
    setDraftStatuses({})
    setDraftNotes({})
    setSearch('')
    setStatusFilter('all')
  }, [sheetKey])

  // a reloaded sheet (after a save or a day switch) drops the drafts which now
  // match the value stored on the server
  useEffect(() => {
    setDraftStatuses((prev) => {
      if (Object.keys(prev).length === 0) {
        return prev
      }

      const next = { ...prev }
      let changed = false

      people.forEach((person) => {
        const draft = prev[person.id]

        if (draft !== undefined && draft === person.status) {
          delete next[person.id]
          changed = true
        }
      })

      return changed ? next : prev
    })

    setDraftNotes((prev) => {
      if (Object.keys(prev).length === 0) {
        return prev
      }

      const next = { ...prev }
      let changed = false

      people.forEach((person) => {
        const draft = prev[person.id]

        if (draft !== undefined && draft === (person.note ?? '')) {
          delete next[person.id]
          changed = true
        }
      })

      return changed ? next : prev
    })
  }, [people])

  const rows = useMemo(
    () => buildSheetRows(people, draftStatuses, draftNotes),
    [people, draftStatuses, draftNotes]
  )

  const visibleRows = useMemo(
    () => filterAttendanceRows(rows, search, statusFilter),
    [rows, search, statusFilter]
  )

  const stats = useMemo(() => computeAttendanceStats(rows), [rows])

  const setStatus = useCallback(
    (row: AttendanceSheetRow, status: AttendanceStatus) => {
      setDraftStatuses((prev) =>
        prev[row.id] === status ? prev : { ...prev, [row.id]: status }
      )
    },
    []
  )

  const markRows = useCallback(
    (targets: AttendanceSheetRow[], status: AttendanceStatus) => {
      if (targets.length === 0) {
        return
      }

      setDraftStatuses((prev) => {
        const next = { ...prev }
        targets.forEach((row) => {
          next[row.id] = status
        })

        return next
      })
    },
    []
  )

  const setNote = useCallback((row: AttendanceSheetRow, note: string) => {
    setDraftNotes((prev) =>
      prev[row.id] === note ? prev : { ...prev, [row.id]: note }
    )
  }, [])

  const resetDraft = useCallback(() => {
    setDraftStatuses({})
    setDraftNotes({})
  }, [])

  return {
    rows,
    visibleRows,
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setStatus,
    markRows,
    setNote,
    resetDraft,
    hasChanges: stats.dirty > 0,
  }
}
