import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { CreateClassSectionModal } from './components/createSectionModal/createSectionModal.component'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassListAction } from '@src/store/redux/dashboard/academics/classes/classes.slice'
import { getClassSectionListAction } from '@src/store/redux/dashboard/academics/classSections/sections.slice'

export function ClassSectionsPage() {
  const [openCreateSection, setOpenCreateSection] = useState(false)
  const toggleCreateSection = (val: boolean) => {
    setOpenCreateSection(val)
  }
  const [editSectionDetails] = useState<Academics.IClassSection | null>(null)
  const dispatch = useDispatch()
  const { data: sectionList, loading: sectionListLoading } = useSelector(
    (store) => store.classSections.sectionList
  )

  useEffect(() => {
    dispatch(
      getClassListAction({
        onSuccess: () => {
          // const selectedClass = classes.rows?.[0]?.class_details?.id
          dispatch(
            getClassSectionListAction({
              payload: { classId: 1 },
              onSuccess: () => {},
            })
          )
        },
      })
    )
  }, [])

  const remappedSectionList = useCallback(() => {
    const data = sectionList?.map((el) => ({
      id: el.section_details.id,
      class_id: el.class_details.id,
      name: el.section_details.name,
      class_name: el.class_details.name,
      created_at: el.section_details.created_at,
      updated_at: el.section_details.updated_at,
      numeric_name: el.class_details.numeric_name,
    }))

    return data
  }, [sectionList])

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
            Manage Class Sections
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
            toggleCreateSection(true)
          }}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>

      {/* CREATE CLASS SECTION MODAL */}
      <CreateClassSectionModal
        open={openCreateSection}
        onClose={() => {
          toggleCreateSection(false)
        }}
        details={editSectionDetails}
      />

      <TableComp
        columns={[
          { field: 'id', name: 'ID', render: (val) => `SEC_${val}` },
          {
            field: 'class_id',
            name: 'Class ID',
            render: (val) => `CLS_${val}`,
          },
          { field: 'name', name: 'Section Name' },
          { field: 'class_name', name: 'Class' },
          { field: 'numeric_name', name: 'Numeric' },
          { field: 'created_at', name: 'Created At' },
          { field: 'updated_at', name: 'Updated At' },
        ]}
        loading={sectionListLoading}
        data={remappedSectionList() ?? []}
        actions={{
          onEdit: () => {
            // setEditClassDetails(item)
            // setOpenCreateClass(true)
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
