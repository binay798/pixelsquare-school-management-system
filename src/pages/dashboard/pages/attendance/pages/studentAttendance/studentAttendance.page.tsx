import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { getClassSectionListAction } from '@src/store/redux/dashboard/academics/classSections/sections.slice'
import {
  createStudentAttendanceSlice,
  getStudentAttendanceListSlice,
  updateStudentAttendanceSlice,
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
import {
  ClassSectionOption,
  StudentFilter,
} from './components/studentFilterComp/studentFilter.component'

const today = () => moment().format('YYYY-MM-DD')

/**
 * Student attendance sheet.
 *
 * Responsibilities kept on the page:
 *  - fetch the class / class section lists and derive the option sets,
 *  - load the sheet of the selected class section and day,
 *  - map the API rows into the shared `AttendancePerson` shape,
 *  - translate the shared submission plan into the existing create / update
 *    endpoints.
 * Everything the user sees is delegated to `AttendanceWorkspace`.
 */
export function StudentAttendancePage() {
  const dispatch = useDispatch()

  const { data: studentList, loading: listLoading } = useSelector(
    (store) => store.attendance.studentAttendance.studentList
  )
  const { loading: creating } = useSelector(
    (store) => store.attendance.studentAttendance.create
  )
  const { loading: updating } = useSelector(
    (store) => store.attendance.studentAttendance.update
  )
  const { data: classSectionList, loading: sectionLoading } = useSelector(
    (store) => store.classSections.sectionList
  )

  const [date, setDate] = useState(today)
  const [reloadToken, setReloadToken] = useState(0)
  const [classOption, setClassOption] = useState<ClassSectionOption | null>(
    null
  )
  const [sectionOption, setSectionOption] = useState<ClassSectionOption | null>(
    null
  )
  const [classOptions, setClassOptions] = useState<ClassSectionOption[]>([])
  const [classLoading, setClassLoading] = useState(true)

  const classId = classOption?.value
  const sectionId = sectionOption?.value

  // MARK: - classes
  useEffect(() => {
    let active = true

    getClassList()
      .then((response) => {
        if (!active) {
          return
        }
        const options = (response?.data?.rows ?? [])
          .map((row) => ({
            label: row.class_details?.name ?? '',
            value: row.class_details?.id ?? 0,
          }))
          .filter((option) => option.value > 0)

        setClassOptions(options)
        setClassOption((prev) => prev ?? options[0] ?? null)
      })
      .catch(() => {
        if (active) {
          setClassOptions([])
        }
      })
      .finally(() => {
        if (active) {
          setClassLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  // MARK: - class sections
  useEffect(() => {
    if (!classId) {
      setSectionOption(null)
      return
    }

    dispatch(
      getClassSectionListAction({
        payload: { classId },
        onSuccess: (list) => {
          const first = list?.[0]?.section_details
          setSectionOption(
            first ? { label: first.name, value: first.id } : null
          )
        },
      })
    )
  }, [classId, dispatch])

  // MARK: - sheet
  useEffect(() => {
    if (!classId || !sectionId) {
      return
    }

    dispatch(
      getStudentAttendanceListSlice({
        classId,
        classSectionId: sectionId,
        date,
      })
    )
  }, [classId, sectionId, date, reloadToken, dispatch])

  const sectionOptions = useMemo(
    () =>
      (classSectionList ?? [])
        .map((row) => ({
          label: row.section_details?.name ?? '',
          value: row.section_details?.id ?? 0,
        }))
        .filter((option) => option.value > 0),
    [classSectionList]
  )

  const handleClassChange = (option: ClassSectionOption | null) => {
    setClassOption(option)
    setSectionOption(null)
  }

  // MARK: - rows
  const people: AttendancePerson[] = useMemo(
    () =>
      (studentList ?? []).map((row) => ({
        id: row.student_details.id,
        code: `STU_${row.student_details.id}`,
        name: getPersonName(row.user_profile_details),
        photo: row.profile_photo_details?.path
          ? getImageUrl(row.profile_photo_details.path)
          : undefined,
        userId: row.user_profile_details?.user_id,
        academicYearRecordId: row.student_academic_year_details.id,
        attendanceId: row.attendance_details?.id,
        status: parseAttendanceStatus(row.attendance_details?.type),
        note: row.attendance_details?.note ?? '',
      })),
    [studentList]
  )

  // MARK: - submit
  const handleSubmit = useCallback(
    async (plan: AttendanceSubmissionPlan): Promise<boolean> => {
      const { creates, updates } = plan

      try {
        if (creates.length > 0) {
          await dispatch(
            createStudentAttendanceSlice({
              payload: creates.map(({ row, status }) => ({
                studentAcademicYearId: row.academicYearRecordId,
                studentId: row.id,
                userId: row.userId,
                date,
                type: status as AttendanceStatus,
                note: row.currentNote || undefined,
              })),
            })
          ).unwrap()
        }

        if (updates.length > 0) {
          await dispatch(
            updateStudentAttendanceSlice({
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

  const badges = [classOption?.label, sectionOption?.label].filter(
    Boolean
  ) as string[]

  return (
    <AttendanceWorkspace
      title="Student attendance"
      subtitle="Pick a class section and a day, mark every student and save the sheet in one go."
      peopleLabel="students"
      sheetKey={`${classId ?? 'none'}-${sectionId ?? 'none'}-${date}`}
      people={people}
      loading={listLoading}
      saving={creating || updating}
      disabled={!sectionId}
      date={date}
      onDateChange={setDate}
      onRefresh={() => setReloadToken((token) => token + 1)}
      badges={badges}
      filters={
        <StudentFilter
          classValue={classOption}
          sectionValue={sectionOption}
          classOptions={classOptions}
          sectionOptions={sectionOptions}
          classLoading={classLoading}
          sectionLoading={sectionLoading}
          onClassChange={handleClassChange}
          onSectionChange={setSectionOption}
        />
      }
      onSubmit={handleSubmit}
    />
  )
}
