import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import {
  createEmployeeAttendanceSlice,
  getEmployeeAttendanceListSlice,
  updateEmployeeAttendanceSlice,
} from '@src/store/redux/dashboard/attendance/attendance.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import {
  AttendancePerson,
  AttendanceStatus,
  AttendanceSubmissionPlan,
} from '../../attendance.types'
import { getPersonName, parseAttendanceStatus } from '../../attendance.helpers'
import { AttendanceWorkspace } from '../../components/attendanceWorkspace/attendanceWorkspace.component'

const today = () => moment().format('YYYY-MM-DD')

/**
 * Employee attendance sheet, built on the same workspace as the students and
 * the teachers. The endpoint is global for the day, so the page only owns the
 * selected day, the reload token and the write actions.
 */
export function EmployeeAttendancePage() {
  const dispatch = useDispatch()

  const { data: employeeList, loading: listLoading } = useSelector(
    (store) => store.attendance.employeeAttendance.list
  )
  const { loading: creating } = useSelector(
    (store) => store.attendance.employeeAttendance.create
  )
  const { loading: updating } = useSelector(
    (store) => store.attendance.employeeAttendance.update
  )

  const [date, setDate] = useState(today)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    dispatch(getEmployeeAttendanceListSlice({ date }))
  }, [date, reloadToken, dispatch])

  const people: AttendancePerson[] = useMemo(
    () =>
      (employeeList ?? []).map((row) => ({
        id: row.employee_details.id,
        code: `EMP_${row.employee_details.id}`,
        name: getPersonName(row.user_profile_details),
        photo: row.profile_photo_details?.path
          ? getImageUrl(row.profile_photo_details.path)
          : undefined,
        userId: row.user_profile_details?.user_id,
        academicYearRecordId: row.employee_academic_year_details.id,
        attendanceId: row.attendance_details?.id,
        status: parseAttendanceStatus(row.attendance_details?.type),
        note: row.attendance_details?.note ?? '',
      })),
    [employeeList]
  )

  const handleSubmit = useCallback(
    async (plan: AttendanceSubmissionPlan): Promise<boolean> => {
      const { creates, updates } = plan

      try {
        if (creates.length > 0) {
          await dispatch(
            createEmployeeAttendanceSlice({
              payload: creates.map(({ row, status }) => ({
                employeeId: row.id,
                userId: row.userId,
                date,
                type: status as AttendanceStatus,
                note: row.currentNote || undefined,
              })),
              onSuccess: () => undefined,
            })
          ).unwrap()
        }

        if (updates.length > 0) {
          await dispatch(
            updateEmployeeAttendanceSlice({
              payload: updates
                .filter(({ row }) => Boolean(row.attendanceId))
                .map(({ row, status }) => ({
                  attendanceId: row.attendanceId as number,
                  type: status as AttendanceStatus,
                  note: row.currentNote || undefined,
                })),
              onSuccess: () => undefined,
            })
          ).unwrap()
        }

        return true
      } catch {
        return false
      } finally {
        setReloadToken((token) => token + 1)
      }
    },
    [date, dispatch]
  )

  return (
    <AttendanceWorkspace
      title="Employee attendance"
      subtitle="Mark the non teaching staff of the selected day. Unmarked employees are saved as absent while the day is still empty."
      peopleLabel="employees"
      sheetKey={`employees-${date}`}
      people={people}
      loading={listLoading}
      saving={creating || updating}
      date={date}
      onDateChange={setDate}
      onRefresh={() => setReloadToken((token) => token + 1)}
      onSubmit={handleSubmit}
    />
  )
}
