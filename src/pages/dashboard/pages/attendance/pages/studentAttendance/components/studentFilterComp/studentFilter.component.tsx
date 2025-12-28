import { Box, FormControl, FormLabel, Stack } from '@mui/material'
import {
  AsyncSelectField,
  customReactSelectStyles,
  SelectField,
} from '@src/components/select/select.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { StylesConfig } from 'react-select'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { IoSearch } from 'react-icons/io5'
import { useCallback, useEffect } from 'react'
import { isEmpty } from 'lodash'
import { useFormik } from 'formik'
import { getClassSectionListAction } from '@src/store/redux/dashboard/academics/classSections/sections.slice'
import { getStudentAttendanceListSlice } from '@src/store/redux/dashboard/attendance/attendance.slice'

interface Props {
  date: string
}
export function StudentFilter({ date }: Props) {
  const formik = useFormik<{
    class: { label: string; value: number } | null
    section: { label: string; value: number } | null
  }>({
    initialValues: {
      class: null,
      section: null,
    },
    onSubmit: () => {},
  })

  const { data: classSectionList, loading: sectionListLoading } = useSelector(
    (store) => store.classSections.sectionList
  )
  const { loading: searchStudentLoading } = useSelector(
    (store) => store.attendance.studentAttendance.studentList
  )
  const { loading: classListLoading } = useSelector(
    (store) => store.classes.getClassList
  )
  const dispatch = useDispatch()
  const remappedClassList = async () => {
    const data = await getClassList()

    return data.data.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el.class_details?.id,
    }))
  }
  const remappedClassSectionList = useCallback(() => {
    return classSectionList?.map((el) => ({
      label: el.section_details?.name,
      value: el.section_details?.id,
    }))
  }, [classSectionList])
  useEffect(() => {
    const classId = formik.values.class?.value
    if (classId) {
      dispatch(
        getClassSectionListAction({
          payload: { classId: classId },
          onSuccess: () => {
            // formik.resetForm()
          },
        })
      )
    }
  }, [formik.values.class?.value])

  // useEffect(() => {
  //   if (formik.values.section?.value) {
  //     if (formik.values.class?.value && formik.values.section?.value) {
  //       dispatch(
  //         getStudentAttendanceListSlice({
  //           classId: formik.values.class.value,
  //           classSectionId: formik.values.section.value,
  //           date: date,
  //         })
  //       )
  //     }
  //   }
  // }, [formik.values.section?.value])

  // useEffect(() => {
  //   // eslint-disable-next-line no-extra-semi
  //   ;(async () => {
  //     const classList = await remappedClassList()
  //     if (!isEmpty(classList)) {
  //       dispatch(updateSelectedClass(classList[0]))
  //     }
  //   })()
  // }, [])

  const searchStudents = () => {
    if (formik.values.class?.value && formik.values.section?.value) {
      dispatch(
        getStudentAttendanceListSlice({
          classId: formik.values.class.value,
          classSectionId: formik.values.section.value,
          date: date,
        })
      )
    }
  }

  return (
    <Box mt={2}>
      <Stack direction="row" gap={2} alignItems={'flex-end'}>
        <FormControl required sx={{ flex: 1 }}>
          <FormLabel
            sx={{
              fontSize: 13,
              mb: 1,
              color: colors.grey[600],
            }}
          >
            Student Class
          </FormLabel>
          <AsyncSelectField
            // menuPlacement="top"
            placeholder="Select class"
            loadOptions={() => remappedClassList()}
            defaultOptions
            value={formik.values.class}
            // @ts-ignore
            onChange={(e: { label: string; value: number }) => {
              // formik.setFieldValue('class_id', (e as { value: string }).value)
              // setSelectedValue(e)
              formik.setFieldValue('class', e)
              // dispatch(updateSelectedClass(e))
            }}
            styles={{
              ...classReactSelectStyles,
            }}
          />
        </FormControl>
        <FormControl fullWidth required sx={{ flex: 1 }}>
          <FormLabel
            sx={{
              fontSize: 13,
              mb: 1,
              color: colors.grey[600],
            }}
          >
            Class Section
          </FormLabel>
          <SelectField
            isLoading={sectionListLoading}
            placeholder={'Select class section'}
            options={remappedClassSectionList() ?? []}
            onChange={(e) => {
              formik.setFieldValue('section', e)
            }}
            isDisabled={
              isEmpty(formik.values.class?.label) ||
              classListLoading ||
              sectionListLoading
            }
            value={formik.values.section}
          />
        </FormControl>
        <ButtonComp
          onClick={searchStudents}
          startIcon={<IoSearch size={20} />}
          size="large"
          loading={searchStudentLoading}
        >
          Search
        </ButtonComp>
      </Stack>
    </Box>
  )
}
const classReactSelectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
  container: () => ({
    // width: 200,
  }),
}
