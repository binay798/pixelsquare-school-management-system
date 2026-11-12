import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import {
  createTeacherAttendanceSlice,
  getTeacherAttendanceListSlice,
  updateTeacherAttendanceSlice,
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
 * Teacher attendance sheet: same workspace as the students, the endpoint is
 * global for the day so only the day and the reload are controlled here.
 */
export function TeacherAttendancePage() {
  const dispatch = useDispatch()

  const { data: teacherList, loading: listLoading } = useSelector(
    (store) => store.attendance.teacherAttendance.list
  )
  const { loading: creating } = useSelector(
    (store) => store.attendance.teacherAttendance.create
  )
  const { loading: updating } = useSelector(
    (store) => store.attendance.teacherAttendance.update
  )

  const [date, setDate] = useState(today)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    dispatch(getTeacherAttendanceListSlice({ date }))
  }, [date, reloadToken, dispatch])

  const people: AttendancePerson[] = useMemo(
    () =>
      (teacherList ?? []).map((row) => ({
        id: row.teacher_details.id,
        code: `STA_${row.teacher_details.id}`,
        name: getPersonName(row.user_profile_details),
        photo: row.profile_photo_details?.path
          ? getImageUrl(row.profile_photo_details.path)
          : undefined,
        userId: row.user_profile_details?.user_id,
        academicYearRecordId: row.teacher_academic_year_details.id,
        attendanceId: row.attendance_details?.id,
        status: parseAttendanceStatus(row.attendance_details?.type),
        note: row.attendance_details?.note ?? '',
      })),
    [teacherList]
  )

  const handleSubmit = useCallback(
    async (plan: AttendanceSubmissionPlan): Promise<boolean> => {
      const { creates, updates } = plan

      try {
        if (creates.length > 0) {
          await dispatch(
            createTeacherAttendanceSlice({
              body: {
                payload: creates.map(({ row, status }) => ({
                  teacherId: row.id,
                  userId: row.userId,
                  date,
                  type: status as AttendanceStatus,
                  note: row.currentNote || undefined,
                })),
              },
              onSuccess: () => undefined,
            })
          ).unwrap()
        }

        if (updates.length > 0) {
          await dispatch(
            updateTeacherAttendanceSlice({
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
      title="Teacher attendance"
      subtitle="Mark the teaching staff of the selected day. Unmarked teachers are saved as absent while the day is still empty."
      peopleLabel="teachers"
      sheetKey={`teachers-${date}`}
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
