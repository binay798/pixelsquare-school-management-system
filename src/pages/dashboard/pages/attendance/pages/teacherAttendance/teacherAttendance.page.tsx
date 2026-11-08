import {
  Avatar,
  Box,
  Stack,
  Radio as CRadio,
  styled,
  Card,
} from '@mui/material'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ButtonComp } from '@src/components/button/button.component'
import { AsyncSelectField } from '@src/components/select/select.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  CreateTeacherAttendanceDto,
  UpdateTeacherAttendanceDto,
} from '@src/store/redux/dashboard/attendance/attendance.service'
import {
  createTeacherAttendanceSlice,
  getTeacherAttendanceListSlice,
  updateTeacherAttendanceSlice,
} from '@src/store/redux/dashboard/attendance/attendance.slice'
import { isEmpty } from 'lodash'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { FaRegSave } from 'react-icons/fa'

const Radio = styled(CRadio)(() => ({
  padding: 2,
  '&.Mui-checked': {
    color: '#2ecc71', // green fill when selected
  },
}))

interface TableTeacherRow {
  teacherId: number
  name: string
  present: string
  absent: string
  leave: string
  note?: string
  photo?: string
  userId: number
  teacherAcademicYearId: number
  /** empty until the day of the teacher is submitted */
  attendanceId?: number
}
export function TeacherAttendancePage() {
  const dispatch = useDispatch()
  const [createAttendanceButton, setCreateAttendanceButton] = useState(true)
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
  const [remappedTeachersList, setRemappedTeachersList] = useState<
    TableTeacherRow[] | null
  >(null)
  const { data: teacherList, loading: teacherListLoading } = useSelector(
    (store) => store.attendance.teacherAttendance.list
  )
  const { loading: updateTeacherLoading } = useSelector(
    (store) => store.attendance.teacherAttendance.update
  )
  const { loading: createTeacherLoading } = useSelector(
    (store) => store.attendance.teacherAttendance.create
  )

  useEffect(() => {
    dispatch(getTeacherAttendanceListSlice({ date: currentDate }))
  }, [currentDate])

  useEffect(() => {
    if (!isEmpty(teacherList) && teacherList) {
      const data: TableTeacherRow[] = teacherList.map((el) => ({
        teacherId: el.teacher_details.id,
        absent: el?.attendance_details?.type ?? '',
        attendanceId: el?.attendance_details?.id,
        leave: el?.attendance_details?.type ?? '',
        name: `${el.user_profile_details.firstname} ${
          el.user_profile_details.middlename ?? ''
        } ${el.user_profile_details.lastname}`,
        present: el?.attendance_details?.type ?? '',
        teacherAcademicYearId: el.teacher_academic_year_details.id,
        userId: el.user_profile_details.user_id,
        note: el?.attendance_details?.note ?? '',
        photo: el?.profile_photo_details?.path
          ? getImageUrl(el.profile_photo_details.path)
          : undefined,
      }))
      setRemappedTeachersList(data)

      const hasAttendanceDetails = !isEmpty(
        teacherList?.filter((el) => el.attendance_details)
      )
      if (hasAttendanceDetails) {
        setCreateAttendanceButton(false)
      } else {
        setCreateAttendanceButton(true)
      }
    } else {
      setRemappedTeachersList([])
    }
  }, [teacherList])

  const reloadSheet = () => {
    dispatch(getTeacherAttendanceListSlice({ date: currentDate }))
  }

  const createTeacherAttendance = () => {
    const payload: CreateTeacherAttendanceDto = {
      payload:
        remappedTeachersList?.map((el) => ({
          userId: el.userId,
          // the selected day of the calendar, never `today`
          date: currentDate,
          teacherId: el.teacherId,
          type: !isEmpty(el.present)
            ? el.present
            : !isEmpty(el.absent)
            ? el.absent
            : !isEmpty(el.leave)
            ? el.leave
            : el.absent,
          note: isEmpty(el.note) ? undefined : el.note,
        })) ?? [],
    }
    if (isEmpty(payload.payload)) {
      return
    }
    dispatch(
      createTeacherAttendanceSlice({ body: payload, onSuccess: reloadSheet })
    )
  }

  const updateAttendance = () => {
    if (remappedTeachersList) {
      const data: UpdateTeacherAttendanceDto[] = remappedTeachersList
        .filter(
          (el): el is TableTeacherRow & { attendanceId: number } =>
            !isEmpty(el.attendanceId)
        )
        .map((el) => ({
          attendanceId: el.attendanceId,
          type: el.present
            ? el.present
            : el.absent
            ? el.absent
            : el.leave
            ? el.leave
            : el.present,
          note: isEmpty(el.note) ? undefined : el.note,
        }))
      if (isEmpty(data)) {
        return
      }
      dispatch(
        updateTeacherAttendanceSlice({ payload: data, onSuccess: reloadSheet })
      )
    }
  }

  return (
    <Box>
      <Stack direction={'column'} spacing={2}>
        <Box maxWidth={300}>
          <AsyncSelectField placeholder="Select Department" />
        </Box>
        <Stack direction={'row'} spacing={2}>
          <Box flex={1}>
            <Stack direction={'column'} spacing={2}>
              <TableComp
                columns={[
                  {
                    field: 'teacherId',
                    name: 'ID',
                    render: (val) => `STA_${val}`,
                  },
                  {
                    field: 'photo',
                    name: 'Photo',
                    render: (val) => <Avatar src={val as string} />,
                  },
                  { field: 'name', name: 'Name' },
                  {
                    field: 'present',
                    name: 'Present',
                    render: (_, item) => {
                      return (
                        <Radio
                          // checked={selectedValue === 'apple'}
                          // onChange={handleChange}
                          onChange={() => {
                            const stringItem = JSON.parse(
                              JSON.stringify(remappedTeachersList)
                            ) as TableTeacherRow[]
                            stringItem.forEach((el) => {
                              if (el.teacherId === item.teacherId) {
                                el.present = 'present'
                                el.absent = ''
                                el.leave = ''
                              }
                            })
                            setRemappedTeachersList(stringItem)
                          }}
                          value="present"
                          name="attendance"
                          checked={item.present === 'present'}
                        />
                      )
                    },
                  },
                  {
                    field: 'absent',
                    name: 'Absent',
                    render: (val, item) => (
                      <Radio
                        // checked={selectedValue === 'apple'}
                        // onChange={handleChange}
                        onChange={() => {
                          const stringItem = JSON.parse(
                            JSON.stringify(remappedTeachersList)
                          ) as TableTeacherRow[]
                          stringItem.forEach((el) => {
                            if (el.teacherId === item.teacherId) {
                              el.present = ''
                              el.absent = 'absent'
                              el.leave = ''
                            }
                          })
                          setRemappedTeachersList(stringItem)
                        }}
                        value="absent"
                        name="attendance"
                        checked={val === 'absent'}
                      />
                    ),
                  },
                  {
                    field: 'leave',
                    name: 'Leave',
                    render: (val, item) => (
                      <Radio
                        // checked={selectedValue === 'apple'}
                        // onChange={handleChange}
                        onChange={() => {
                          const stringItem = JSON.parse(
                            JSON.stringify(remappedTeachersList)
                          ) as TableTeacherRow[]
                          stringItem.forEach((el) => {
                            if (el.teacherId === item.teacherId) {
                              el.present = ''
                              el.absent = ''
                              el.leave = 'leave'
                            }
                          })
                          setRemappedTeachersList(stringItem)
                        }}
                        value="leave"
                        name="attendance"
                        checked={val === 'leave'}
                      />
                    ),
                  },
                  {
                    field: 'note',
                    name: 'Note',
                  },
                ]}
                data={remappedTeachersList ?? []}
                loading={teacherListLoading}
                // count={Math.ceil(Number(studentList?.total) / Number(limit))}
                // page={page}
                // rowsPerPage={limit}
                showPagination={false}
              ></TableComp>
              {createAttendanceButton ? (
                <ButtonComp
                  startIcon={<FaRegSave />}
                  size="medium"
                  color="secondary"
                  style={{ alignSelf: 'flex-end' }}
                  loading={createTeacherLoading}
                  onClick={createTeacherAttendance}
                >
                  Create Attendance
                </ButtonComp>
              ) : (
                <ButtonComp
                  startIcon={<FaRegSave />}
                  size="medium"
                  color="secondary"
                  style={{ alignSelf: 'flex-end' }}
                  loading={updateTeacherLoading}
                  onClick={updateAttendance}
                >
                  Update Attendance
                </ButtonComp>
              )}
            </Stack>
          </Box>
          <Box>
            <Card style={{ position: 'sticky', top: 100 }}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateCalendar
                  defaultValue={moment()}
                  onChange={(e: Moment) => {
                    setCurrentDate(e.format('YYYY-MM-DD'))
                  }}
                />
              </LocalizationProvider>
            </Card>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
