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
import { getTeacherAttendanceListSlice } from '@src/store/redux/dashboard/attendance/attendance.slice'
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
  attendanceId: number
}
export function TeacherAttendancePage() {
  const dispatch = useDispatch()
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
  const [remappedTeachersList, setRemappedTeachersList] = useState<
    TableTeacherRow[] | null
  >(null)
  const { data: teacherList, loading: teacherListLoading } = useSelector(
    (store) => store.attendance.teacherAttendance.list
  )

  useEffect(() => {
    dispatch(getTeacherAttendanceListSlice({ date: currentDate }))
  }, [])

  useEffect(() => {
    if (!isEmpty(teacherList) && teacherList) {
      const data: TableTeacherRow[] = teacherList.map((el) => ({
        teacherId: el.teacher_details.id,
        absent: '',
        attendanceId: el?.attendance_details?.id,
        leave: '',
        name: `${el.user_profile_details.firstname} ${
          el.user_profile_details.middlename ?? ''
        } ${el.user_profile_details.lastname}`,
        present: '',
        teacherAcademicYearId: el.teacher_academic_year_details.id,
        userId: el.user_profile_details.user_id,
        note: '',
        photo: getImageUrl(`${el.profile_photo_details?.path}`),
      }))
      setRemappedTeachersList(data)
    }
  }, [teacherList])

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
                          onChange={() => {}}
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
                    render: (val) => (
                      <Radio
                        // checked={selectedValue === 'apple'}
                        // onChange={handleChange}
                        value="absent"
                        name="attendance"
                        checked={val === 'absent'}
                        onChange={() => {}}
                      />
                    ),
                  },
                  {
                    field: 'leave',
                    name: 'Leave',
                    render: (val) => (
                      <Radio
                        // checked={selectedValue === 'apple'}
                        // onChange={handleChange}
                        onChange={() => {}}
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
              <ButtonComp
                startIcon={<FaRegSave />}
                size="medium"
                color="secondary"
                style={{ alignSelf: 'flex-end' }}
                // onClick={createAttendance}
                // loading={createStudentAttendanceLoading}
              >
                Create Attendance
              </ButtonComp>
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
