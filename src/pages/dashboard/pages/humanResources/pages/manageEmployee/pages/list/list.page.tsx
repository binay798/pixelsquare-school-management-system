import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getEmployeeListAction } from '@src/store/redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'
import { useCallback, useEffect } from 'react'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export function ListEmployeesPage() {
  const navigate = useNavigate()
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const { data: employeeList, loading: employeeListLoading } = useSelector(
    (store) => store.employees.employeeList
  )
  const remappedEmployeeList = useCallback(() => {
    return employeeList?.rows?.map((el) => ({
      employee_id: el.employee_details.id,
      name: `${el.user_profile_details.firstname} ${el.user_profile_details.lastname}`,
      email: el.user_details.email,
      designation: el.designation_details.designation,
      mobile: el.user_profile_details.mobile,
      gender: el.user_profile_details.gender,
    }))
  }, [employeeList])

  useEffect(() => {
    dispatch(getEmployeeListAction({ payload: { page, limit } }))
  }, [page, limit])

  const handleSearchEmployee = (search: string) => {
    dispatch(getEmployeeListAction({ payload: { page, limit, search } }))
  }

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
              Manage Employee
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              navigate('/dashboard/human-resources/manage-employee/create')
              // toggleOpenCreateModal(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
      </Box>
      <TableComp
        columns={[
          { field: 'name', name: 'Name' },
          { field: 'email', name: 'Email Address' },
          { field: 'mobile', name: 'Mobile' },
          { field: 'designation', name: 'Designation' },
          { field: 'gender', name: 'Gender' },
        ]}
        loading={employeeListLoading}
        data={remappedEmployeeList() ?? []}
        actions={{ onEdit: () => {}, onDelete: () => {} }}
        count={Math.ceil(Number(employeeList?.total) / Number(limit))}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
        search={(txt) => {
          handleSearchEmployee(txt)
        }}
      ></TableComp>
    </Box>
  )
}
