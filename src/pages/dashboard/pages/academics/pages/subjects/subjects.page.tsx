import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { GoPlus } from 'react-icons/go'
import { CreateSubjectModal } from './components/createSubjectModal/createSubjectModal.component'
import { useCallback, useEffect, useState } from 'react'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import {
  AsyncSelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { StylesConfig } from 'react-select'
import { isArray, isEmpty } from 'lodash'
import {
  getSubjectListAction,
  updateSelectedClass,
} from '@src/store/redux/dashboard/academics/subjects/subjects.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'

export interface IndivSubject {
  id: number
  name: string
  type: string
  author: string | null
  classDetails: { label: string; value: number }
  teachers: {
    label: string
    value: number
  }[]
}
export function ClassSubjectsPage() {
  const [openCreateSubject, setOpenCreateSubject] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<IndivSubject | null>(
    null
  )
  const toggleCloseCreateSubject = (val: boolean) => {
    setOpenCreateSubject(val)
  }
  const dispatch = useDispatch()
  const selectedClass = useSelector(
    (store) => store.subjects.subjectList.selectedClass
  )
  const { data: subjectList, loading: subjectListLoading } = useSelector(
    (store) => store.subjects.subjectList
  )
  // const dispatch = useDispatch()

  // useEffect(() => {
  //   dispatch(getClassListAction({ onSuccess: () => {} }))
  // }, [])

  useEffect(() => {
    if (selectedClass) {
      dispatch(getSubjectListAction({ body: {}, classId: selectedClass.value }))
    }
  }, [selectedClass])

  const remappedSubjects = useCallback(() => {
    const newSubjectList = subjectList?.map((el) => ({
      id: el.subject_id,
      name: el.subject_details.name,
      type: el.subject_details.type,
      author: el.subject_details.author,
      classDetails: el.class_details,
      teachers: el.teacher_profile_list?.map((i) => ({
        label: `${i.firstname} ${i.lastname}`,
        value: i.id,
      })),
    }))

    return newSubjectList
  }, [subjectList])

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
            Manage Subjects
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
            toggleCloseCreateSubject(true)
            setSelectedSubject(null)
          }}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>
      {/* CREATE SUBJECT MODAL */}
      <CreateSubjectModal
        open={openCreateSubject}
        onClose={() => toggleCloseCreateSubject(false)}
        details={selectedSubject}
      />

      <TableComp
        columns={[
          { field: 'id', name: 'ID', render: (val) => `SUB_${val}` },
          {
            field: 'name',
            name: 'Name',
            render: (val) => `${val}`,
          },
          { field: 'type', name: 'Type' },
          { field: 'author', name: 'Author' },
          {
            field: 'teachers',
            name: 'Assigned Teachers',
            render: (val, item) => {
              if (isArray(val)) {
                const teacherNames = item?.teachers
                  ?.map((el) => `${el.label}`)
                  ?.join(', ')

                return <span>{teacherNames}</span>
              }

              return <></>
            },
          },
        ]}
        loading={subjectListLoading}
        data={remappedSubjects() ?? []}
        actions={{
          onEdit: (item) => {
            setSelectedSubject({
              ...item,
              classDetails: {
                label: item.classDetails.name,
                value: item.classDetails.id,
              },
            })
            setOpenCreateSubject(true)
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
        headerEl={<SubjectHeaderEl />}
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
function SubjectHeaderEl() {
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
