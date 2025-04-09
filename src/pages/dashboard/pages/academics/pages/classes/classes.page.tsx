import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { CreateClassModal } from './components/createClassModal/createClassModal.component'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassListAction } from '@src/store/redux/dashboard/academics/classes/classes.slice'

export function ClassesPage() {
  const [openCreateClass, setOpenCreateClass] = useState(false)
  const [editClassDetails, setEditClassDetails] = useState<
    Api.IClassList['rows'][0]['class_details'] | null
  >(null)
  const dispatch = useDispatch()
  const { data: classList, loading: classListLoading } = useSelector(
    (store) => store.classes.getClassList
  )

  const toggleOpenCreateClass = (val: boolean) => {
    setOpenCreateClass(val)
  }

  useEffect(() => {
    dispatch(getClassListAction({ onSuccess: () => {} }))
  }, [])

  const remappedClassList = useCallback(() => {
    const list = classList?.rows?.map((el) => el.class_details)

    return list
  }, [classList])

  return (
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
            Manage Classes
          </Typography>

          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
        <ButtonComp
          onClick={() => {
            // navigate('/dashboard/teachers/create')
            // toggleOpenCreateModal(true)
            // setOpenCreateDepartment(true)
            toggleOpenCreateClass(true)
          }}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>
      {/* CREATE CLASS MODAL */}
      <CreateClassModal
        open={openCreateClass}
        onClose={() => {
          toggleOpenCreateClass(false)
          setEditClassDetails(null)
        }}
        details={editClassDetails}
      />

      <TableComp
        columns={[
          { field: 'id', name: 'ID', render: (_, item) => `CLS_${item.id}` },
          { field: 'name', name: 'Name' },
          { field: 'numeric_name', name: 'Numeric Name' },
          { field: 'created_at', name: 'Created At' },
        ]}
        loading={classListLoading}
        data={remappedClassList() ?? []}
        actions={{
          onEdit: (item) => {
            setEditClassDetails(item)
            setOpenCreateClass(true)
            // navigate(
            //   `/dashboard/human-resources/manage-employee/edit/${item.employee_id}`
            // )
          },
          onDelete: () => {},
        }}
        showPagination={false}
        search={() => {
          // handleSearchEmployee(txt)
        }}
      ></TableComp>
    </Box>
  )
}
