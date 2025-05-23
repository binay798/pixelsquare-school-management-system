import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { CreateClassSectionModal } from './components/createSectionModal/createSectionModal.component'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassSectionListAction } from '@src/store/redux/dashboard/academics/classSections/sections.slice'
import { StylesConfig } from 'react-select'
import {
  AsyncSelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { isEmpty } from 'lodash'
import { updateSelectedClass } from '@src/store/redux/dashboard/academics/subjects/subjects.slice'

export function ClassSectionsPage() {
  const [openCreateSection, setOpenCreateSection] = useState(false)
  const toggleCreateSection = (val: boolean) => {
    setOpenCreateSection(val)
  }
  const [editSectionDetails, setEditSectionDetails] = useState<{
    className: string
    classId: number
    sectionName: string
    sectionId: number
  } | null>(null)
  const dispatch = useDispatch()
  const { data: sectionList, loading: sectionListLoading } = useSelector(
    (store) => store.classSections.sectionList
  )
  const selectedClass = useSelector(
    (store) => store.subjects.subjectList.selectedClass
  )

  useEffect(() => {
    if (selectedClass) {
      dispatch(
        getClassSectionListAction({
          payload: { classId: selectedClass.value },
          onSuccess: () => {},
        })
      )
    }
  }, [selectedClass])

  const remappedSectionList = useCallback(() => {
    const data = sectionList?.map((el) => ({
      id: el.section_details.id,
      class_id: el.class_details.id,
      name: el.section_details.name,
      class_name: el.class_details.name,
      created_at: el.section_details.created_at,
      updated_at: el.section_details.updated_at,
      numeric_name: el.class_details.numeric_name,
      section_id: el.section_details.id,
      section_name: el.section_details.name,
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
            setEditSectionDetails(null)
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
          setEditSectionDetails(null)
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
          onEdit: (item) => {
            // setEditClassDetails(item)
            // setOpenCreateClass(true)
            // navigate(
            //   `/dashboard/human-resources/manage-employee/edit/${item.employee_id}`
            // )
            setOpenCreateSection(true)
            setEditSectionDetails({
              classId: item.class_id,
              className: item.class_name,
              sectionName: item.section_name,
              sectionId: item.id,
            })
          },
          onDelete: () => {},
        }}
        showPagination={false}
        headerEl={<SectionHeaderEl />}
        search={() => {
          // handleSearchEmployee(txt)
        }}
      ></TableComp>
    </Box>
  )
}

const classReactSelectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}
function SectionHeaderEl() {
  const selectedValue = useSelector(
    (store) => store.subjects.subjectList.selectedClass
  )
  const dispatch = useDispatch()
  const remappedClassList = async () => {
    const data = await getClassList()

    return data.data.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el.class_details?.id,
    }))
  }

  useEffect(() => {
    // eslint-disable-next-line no-extra-semi
    ;(async () => {
      const classList = await remappedClassList()
      if (!isEmpty(classList)) {
        dispatch(updateSelectedClass(classList[0]))
      }
    })()
  }, [])

  return (
    <Box sx={{ width: 200 }} flex={1}>
      <AsyncSelectField
        // menuPlacement="top"
        placeholder="Select class"
        loadOptions={() => remappedClassList()}
        defaultOptions
        value={selectedValue}
        // @ts-ignore
        onChange={(e: { label: string; value: number }) => {
          // formik.setFieldValue('class_id', (e as { value: string }).value)
          // setSelectedValue(e)
          dispatch(updateSelectedClass(e))
        }}
        styles={{
          ...classReactSelectStyles,
        }}
      />
    </Box>
  )
}
