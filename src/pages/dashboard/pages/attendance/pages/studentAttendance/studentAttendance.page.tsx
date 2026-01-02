import {
  Avatar,
  Box,
  Card,
  Radio as CRadio,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { StudentFilter } from './components/studentFilterComp/studentFilter.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { FaPlus, FaRegSave } from 'react-icons/fa'
import { isEmpty } from 'lodash'
import {
  CreateStudentAttendanceDto,
  UpdateStudentAttendanceDto,
} from '@src/store/redux/dashboard/attendance/attendance.service'
import {
  createStudentAttendanceSlice,
  updateStudentAttendanceSlice,
} from '@src/store/redux/dashboard/attendance/attendance.slice'

const Radio = styled(CRadio)(() => ({
  padding: 2,
  '&.Mui-checked': {
    color: '#2ecc71', // green fill when selected
  },
}))

interface TableStudentRow {
  studentId: number
  name: string
  present: string
  absent: string
  leave: string
  note?: string
  photo?: string
  userId: number
  studentAcademicYearId: number
  attendanceId: number
}

export function StudentAttendancePage() {
  const [createAttendanceButton, setCreateAttendanceButton] = useState(true)
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
  const [remappedStudentList, setRemappedStudentList] = useState<
    TableStudentRow[]
  >([])
  const dispatch = useDispatch()
  const { studentList } = useSelector(
    (store) => store.attendance.studentAttendance
  )
  const { loading: studentListLoading } = useSelector(
    (store) => store.attendance.studentAttendance.studentList
  )
  const { loading: createStudentAttendanceLoading } = useSelector(
    (store) => store.attendance.studentAttendance.create
  )
  const { loading: updateStudentAttendanceLoading } = useSelector(
    (store) => store.attendance.studentAttendance.update
  )

  useEffect(() => {
    if (!isEmpty(studentList.data)) {
      const data = studentList?.data?.map((el) => ({
        studentId: el.student_details.id,
        name: `${el.user_profile_details.firstname} ${
          el.user_profile_details.middlename ?? ''
        } ${el.user_profile_details.lastname}`,
        present: el?.attendance_details?.type ?? '',
        absent: el?.attendance_details?.type ?? '',
        leave: el?.attendance_details?.type ?? '',
        note: '',
        photo: getImageUrl(`${el.profile_photo_details?.path}`),
        userId: el.user_profile_details.user_id,
        studentAcademicYearId: el.student_academic_year_details.id,
        attendanceId: el.attendance_details?.id,
      }))
      if (data) {
        setRemappedStudentList(data)
      }
      const hasAttendanceDetails = !isEmpty(
        studentList?.data?.filter((el) => el.attendance_details)
      )
      if (hasAttendanceDetails) {
        setCreateAttendanceButton(false)
      } else {
        setCreateAttendanceButton(true)
      }
    } else {
      setRemappedStudentList([])
    }
  }, [studentList.data])

  const createAttendance = () => {
    const data: CreateStudentAttendanceDto['payload'] =
      remappedStudentList?.map((el) => {
        const type = !isEmpty(el.present)
          ? el.present
          : !isEmpty(el.absent)
          ? el.absent
          : !isEmpty(el.leave)
          ? el.leave
          : el.absent
        return {
          date: moment().format('YYYY-MM-DD'),
          studentAcademicYearId: el.studentAcademicYearId,
          studentId: el.studentId,
          type: type,
          userId: el.userId,
          note: el.note,
        }
      })
    dispatch(createStudentAttendanceSlice({ payload: data }))
  }
  const updateAttendance = () => {
    const data: UpdateStudentAttendanceDto[] = remappedStudentList?.map(
      (el) => ({
        attendanceId: el.attendanceId,
        type: el.present
          ? el.present
          : el.absent
          ? el.absent
          : el.leave
          ? el.leave
          : el.present,
        note: el.note,
      })
    )
    dispatch(
      updateStudentAttendanceSlice({ payload: data, onSuccess: () => {} })
    )
  }

  return (
    <Box>
      <Stack direction={'row'} spacing={2}>
        <Box flex={3}>
          <Stack direction="column" gap={2}>
            <Card sx={{ p: 2, overflow: 'visible' }}>
              <Box mb={3}>
                <Typography variant="h5" fontWeight={600}>
                  Student Attendance
                </Typography>
                {/* <Typography variant="body2" mt={1}>
                Update the school&apos;s details to keep records accurate and
                up-to-date.
              </Typography> */}
                <StudentFilter date={currentDate} />
              </Box>
            </Card>
            <TableComp
              columns={[
                {
                  field: 'studentId',
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
                            JSON.stringify(remappedStudentList)
                          ) as TableStudentRow[]
                          stringItem.forEach((el) => {
                            if (el.studentId === item.studentId) {
                              el.present = 'present'
                              el.absent = ''
                              el.leave = ''
                            }
                          })
                          setRemappedStudentList(stringItem)
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
                      value="absent"
                      name="attendance"
                      checked={val === 'absent'}
                      onChange={() => {
                        const stringItem = JSON.parse(
                          JSON.stringify(remappedStudentList)
                        ) as TableStudentRow[]
                        stringItem.forEach((el) => {
                          if (el.studentId === item.studentId) {
                            el.present = ''
                            el.absent = 'absent'
                            el.leave = ''
                          }
                        })
                        setRemappedStudentList(stringItem)
                      }}
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
                          JSON.stringify(remappedStudentList)
                        ) as TableStudentRow[]
                        stringItem.forEach((el) => {
                          if (el.studentId === item.studentId) {
                            el.present = ''
                            el.absent = ''
                            el.leave = 'leave'
                          }
                        })
                        setRemappedStudentList(stringItem)
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
                  render: (_, item) =>
                    item.leave === 'leave' ? (
                      <ButtonComp
                        startIcon={<FaPlus size={12} />}
                        color="secondary"
                      >
                        Add Note
                      </ButtonComp>
                    ) : null,
                },
              ]}
              loading={studentListLoading}
              data={remappedStudentList ?? []}
              // count={Math.ceil(Number(studentList?.total) / Number(limit))}
              // page={page}
              // rowsPerPage={limit}
              showPagination={false}
            ></TableComp>
            {createAttendanceButton ? (
              <ButtonComp
                startIcon={<FaRegSave />}
                size="medium"
                color="warning"
                style={{ alignSelf: 'flex-end' }}
                onClick={createAttendance}
                loading={createStudentAttendanceLoading}
              >
                Create Attendance
              </ButtonComp>
            ) : (
              <ButtonComp
                startIcon={<FaRegSave />}
                size="medium"
                color="warning"
                style={{ alignSelf: 'flex-end' }}
                onClick={updateAttendance}
                loading={updateStudentAttendanceLoading}
              >
                Update Attendance
              </ButtonComp>
            )}
          </Stack>
        </Box>
        <Box flex={1.3}>
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
    </Box>
  )
}
