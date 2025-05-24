import { Avatar, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getStudentListAction } from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'
import { useCallback, useEffect } from 'react'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export function StudentListPage() {
  const navigate = useNavigate()
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const { data: studentList, loading: studentListLoading } = useSelector(
    (store) => store.manageStudents.students.list
  )

  useEffect(() => {
    dispatch(
      getStudentListAction({
        payload: { page: Number(page), limit: Number(limit) },
      })
    )
  }, [page, limit])

  const remappedStudentList = useCallback(() => {
    return studentList?.rows?.map((el) => ({
      id: el.student_details.id,
      firstname: el.user_profile_details.firstname,
      middlename: el.user_profile_details.middlename,
      lastname: el.user_profile_details.lastname,
      gender: el.user_profile_details.gender,
      fatherName: el.student_details.father_name,
      fatherMobile: el.student_details.father_mobile,
      rollNo: el?.student_academic_year_details?.roll_no,
      class: el.class_details.name,
      classSection: el.class_section_details.name,
      profilePhoto: el.asset_details?.path,
    }))
  }, [studentList])

  return (
    <Box>
      <Box>
        <Stack
          mb={3}
          direction={'row'}
          spacing={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Student List
            </Typography>

            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              navigate('/dashboard/manage-students/admit-students')
              // toggleOpenCreateModal(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Admit Students
          </ButtonComp>
        </Stack>
      </Box>
      <TableComp
        columns={[
          {
            field: 'profilePhoto',
            name: 'Profile Picture',
            render: (val) => (
              <Avatar
                sx={{ width: 60, height: 60, objectFit: 'cover' }}
                src={getImageUrl(val as string)}
              />
            ),
          },
          {
            field: 'firstname',
            name: 'Student Name',
            render: (_, item) =>
              `${item?.firstname} ${item?.middlename} ${item?.lastname}`,
          },
          { field: 'class', name: 'Class' },
          { field: 'classSection', name: 'Section' },
          { field: 'rollNo', name: 'Roll No.' },
          { field: 'gender', name: 'Gender' },
          {
            field: 'fatherName',
            name: 'Father Name',
            render: (val, item) => `${val} (${item.fatherMobile})`,
          },
        ]}
        loading={studentListLoading}
        data={remappedStudentList() ?? []}
        actions={{
          onEdit: (item) => {
            navigate(`/dashboard/manage-students/students-list/edit/${item.id}`)
          },
          onDelete: () => {},
        }}
        count={Math.ceil(Number(studentList?.total) / Number(limit))}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
      ></TableComp>
    </Box>
  )
}
