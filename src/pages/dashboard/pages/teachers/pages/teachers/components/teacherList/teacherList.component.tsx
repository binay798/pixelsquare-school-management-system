import { Box } from '@mui/material'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getTeacherListAction } from '@src/store/redux/dashboard/teachers/teachers.slice'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function TeacherList() {
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: teacherList, loading: teacherListLoading } = useSelector(
    (store) => store.teachers.teacherList
  )

  useEffect(() => {
    dispatch(getTeacherListAction({ page, limit }))
  }, [page, limit])

  const remappedTeacherList = useCallback(() => {
    const modifiedData = teacherList?.rows?.map((el) => ({
      id: el.teacher_details.id,
      firstname: el.user_profile_details.firstname,
      lastname: el.user_profile_details.lastname,
      email: el.user_details.email,
      department: el.department_details.name,
    }))

    return modifiedData
  }, [teacherList])

  return (
    <Box>
      <TableComp
        columns={[
          { field: 'id', name: 'ID', render: (val) => `D_${val}` },
          { field: 'firstname', name: 'Firstname' },
          { field: 'lastname', name: 'Lastname' },
          { field: 'email', name: 'Email' },
          { field: 'department', name: 'Department' },
        ]}
        loading={teacherListLoading}
        data={remappedTeacherList() ?? []}
        actions={{
          onEdit: (item) => {
            navigate(`/dashboard/teachers/edit/${item.id}`)
            // setSelectedDepartment(item)
            // navigate(
            //   `/dashboard/human-resources/manage-employee/edit/${item.employee_id}`
            // )
          },
          onDelete: () => {},
        }}
        count={Math.ceil(Number(teacherList?.total) / Number(limit))}
        page={page}
        rowsPerPage={10}
        showPagination={true}
        // search={(txt) => {
        //   handleSearchEmployee(txt)
        // }}
      ></TableComp>
    </Box>
  )
}
