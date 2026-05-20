import { Avatar, Box, Card, Radio, Stack, Typography } from '@mui/material'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  CreateEmployeeAttendanceDto,
  UpdateEmployeeAttendanceDto,
} from '@src/store/redux/dashboard/attendance/attendance.service'
import {
  createEmployeeAttendanceSlice,
  getEmployeeAttendanceListSlice,
  updateEmployeeAttendanceSlice,
} from '@src/store/redux/dashboard/attendance/attendance.slice'
import { isEmpty } from 'lodash'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { FaRegSave } from 'react-icons/fa'

interface TableEmployeeRow {
  employeeId: number
  name: string
  present: string
  absent: string
  leave: string
  note?: string
  photo?: string
  userId: number
  employeeAcademicYearId: number
  attendanceId: number
}

export function EmployeeAttendancePage() {
  const [createAttendanceButton, setCreateAttendanceButton] = useState(true)
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
  const [remappedTeacherList, setRemappedTeacherList] = useState<
    TableEmployeeRow[]
  >([])
  const dispatch = useDispatch()
  const { list } = useSelector((store) => store.attendance.employeeAttendance)
  const { loading: employeeListLoading } = useSelector(
    (store) => store.attendance.employeeAttendance.list
  )
  const { loading: createEmployeeAttendanceLoading } = useSelector(
    (store) => store.attendance.employeeAttendance.create
  )
  const { loading: updateEmployeeAttendanceLoading } = useSelector(
    (store) => store.attendance.employeeAttendance.update
  )
  useEffect(() => {
    dispatch(getEmployeeAttendanceListSlice({ date: currentDate }))
  }, [currentDate])
  useEffect(() => {
    if (!isEmpty(list.data)) {
      const data = list?.data?.map((el) => ({
        employeeId: el.employee_details.id,
        name: `${el.user_profile_details.firstname} ${
          el.user_profile_details.middlename ?? ''
        } ${el.user_profile_details.lastname}`,
        present: el?.attendance_details?.type ?? '',
        absent: el?.attendance_details?.type ?? '',
        leave: el?.attendance_details?.type ?? '',
        note: '',
        photo: getImageUrl(`${el.profile_photo_details?.path}`),
        userId: el.user_profile_details.user_id,
        employeeAcademicYearId: el.employee_academic_year_details.id,
        attendanceId: el.attendance_details?.id,
      }))
      if (data) {
        setRemappedTeacherList(data)
      }
      const hasAttendanceDetails = !isEmpty(
        list?.data?.filter((el) => el.attendance_details)
      )
      if (hasAttendanceDetails) {
        setCreateAttendanceButton(false)
      } else {
        setCreateAttendanceButton(true)
      }
    } else {
      setRemappedTeacherList([])
    }
  }, [list.data])

  const createAttendance = () => {
    const data: CreateEmployeeAttendanceDto[] = remappedTeacherList?.map(
      (el) => {
        const type = !isEmpty(el.present)
          ? el.present
          : !isEmpty(el.absent)
          ? el.absent
          : !isEmpty(el.leave)
          ? el.leave
          : el.absent
        return {
          date: moment().format('YYYY-MM-DD'),
          employeeAcademicYearId: el.employeeAcademicYearId,
          employeeId: el.employeeId,
          type: type,
          userId: el.userId,
          note: el.note,
        }
      }
    )
    dispatch(createEmployeeAttendanceSlice({ payload: data }))
  }
  const updateAttendance = () => {
    const data: UpdateEmployeeAttendanceDto[] = remappedTeacherList?.map(
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
      updateEmployeeAttendanceSlice({ payload: data, onSuccess: () => {} })
    )
  }
  return (
    <Box>
      <Stack direction={'row'} spacing={2}>
        <Box flex={3}>
          <Stack direction="column" gap={2}>
            <Box mb={1}>
              <Typography variant="h5" fontWeight={600}>
                Employee Attendance
              </Typography>
            </Box>
            <TableComp
              columns={[
                {
                  field: 'employeeId',
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
                            JSON.stringify(remappedTeacherList)
                          ) as TableEmployeeRow[]
                          stringItem.forEach((el) => {
                            if (el.employeeId === item.employeeId) {
                              el.present = 'present'
                              el.absent = ''
                              el.leave = ''
                            }
                          })
                          setRemappedTeacherList(stringItem)
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
                          JSON.stringify(remappedTeacherList)
                        ) as TableEmployeeRow[]
                        stringItem.forEach((el) => {
                          if (el.employeeId === item.employeeId) {
                            el.present = ''
                            el.absent = 'absent'
                            el.leave = ''
                          }
                        })
                        setRemappedTeacherList(stringItem)
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
                          JSON.stringify(remappedTeacherList)
                        ) as TableEmployeeRow[]
                        stringItem.forEach((el) => {
                          if (el.employeeId === item.employeeId) {
                            el.present = ''
                            el.absent = ''
                            el.leave = 'leave'
                          }
                        })
                        setRemappedTeacherList(stringItem)
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
                  // render: (_, item) =>
                  //   item.leave === 'leave' ? (
                  //     <ButtonComp
                  //       startIcon={<FaPlus size={12} />}
                  //       color="secondary"
                  //     >
                  //       Add Note
                  //     </ButtonComp>
                  //   ) : null,
                },
              ]}
              loading={employeeListLoading}
              data={remappedTeacherList ?? []}
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
                onClick={() => createAttendance()}
                loading={createEmployeeAttendanceLoading}
              >
                Create Attendance
              </ButtonComp>
            ) : (
              <ButtonComp
                startIcon={<FaRegSave />}
                size="medium"
                color="secondary"
                style={{ alignSelf: 'flex-end' }}
                onClick={() => updateAttendance()}
                loading={updateEmployeeAttendanceLoading}
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
