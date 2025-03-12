import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { CreateDepartmentModal } from './components/createDepartmentModal/createDepartmentModal.component'
import { useEffect, useState } from 'react'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getDepartmentListAction } from '@src/store/redux/dashboard/teachers/departments/departments.slice'

export function DepartmentPage() {
  const [openCreateDepartment, setOpenCreateDepartment] = useState(false)
  const { page, limit } = usePage()
  const dispatch = useDispatch()
  const { loading: departmentListLoading, data: departmentList } = useSelector(
    (store) => store.departments.departmentList
  )
  useEffect(() => {
    dispatch(getDepartmentListAction({ payload: { page, limit } }))
  }, [page, limit])

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
              Departments
            </Typography>

            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              // navigate('/dashboard/human-resources/manage-employee/create')
              // toggleOpenCreateModal(true)
              setOpenCreateDepartment(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
      </Box>
      {/* CREATE DEPARTMENT MODAL */}
      <CreateDepartmentModal
        open={openCreateDepartment}
        onClose={() => setOpenCreateDepartment(false)}
      />
      <TableComp
        columns={[
          { field: 'name', name: 'Name' },
          { field: 'created_at', name: 'Created At' },
          { field: 'updated_at', name: 'Updated At' },
        ]}
        loading={departmentListLoading}
        data={departmentList?.rows ?? []}
        actions={{
          onEdit: () => {
            // navigate(
            //   `/dashboard/human-resources/manage-employee/edit/${item.employee_id}`
            // )
          },
          onDelete: () => {},
        }}
        count={Math.ceil(Number(departmentList?.total) / Number(limit))}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
        // search={(txt) => {
        //   handleSearchEmployee(txt)
        // }}
      ></TableComp>
    </Box>
  )
}
