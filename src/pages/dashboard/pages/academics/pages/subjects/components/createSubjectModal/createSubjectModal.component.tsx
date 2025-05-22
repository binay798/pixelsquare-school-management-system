import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import SpringModal from '@src/components/modal/modal.component'
// import { useDispatch } from '@src/store/hooks.store'
import { useCallback, useEffect, useState } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import {
  AsyncSelectField,
  customReactSelectStyles,
  SelectField,
} from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { useFormik } from 'formik'
import { createSubjectSchema } from './createSubjectModal.schema'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createSubjectAction,
  getSubjectListAction,
  getTeacherList,
  updateSubjectAction,
} from '@src/store/redux/dashboard/academics/subjects/subjects.slice'
import { isEmpty } from 'lodash'
import { IndivSubject } from '../../subjects.page'

const classReactSelectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}
interface Props {
  open: boolean
  onClose: () => void
  details: IndivSubject | null
}
export function CreateSubjectModal(props: Props) {
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const { data: teacherList } = useSelector(
    (store) => store.subjects.createSubject.teachers
  )
  const { loading: createSubjectLoading } = useSelector(
    (store) => store.subjects.createSubject
  )
  const selectedClass = useSelector(
    (store) => store.subjects.subjectList.selectedClass
  )

  const { loading: updateSubjectLoading } = useSelector(
    (store) => store.subjects.updateSubject
  )

  useEffect(() => {
    if (props?.details) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [props.details])

  useEffect(() => {
    dispatch(getTeacherList({}))
  }, [])
  const remapTeacherList = useCallback(() => {
    const res = teacherList?.rows?.map((el) => ({
      label: `T${el.teacher_details.id} ${el.user_profile_details?.firstname} ${el.user_profile_details?.lastname}`,
      value: el.teacher_details.id,
    }))

    return res
  }, [teacherList])

  const remappedClassList = async () => {
    const data = await getClassList()

    const classData = data.data.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el.class_details?.id,
    }))

    return classData
  }

  const formik = useFormik({
    initialValues: {
      name: props.details?.name ?? '',
      class_id: props.details?.classDetails ?? { label: '', value: 0 },
      type: props?.details?.type ?? '',
      teacherIds: props?.details?.teachers ?? [],
      author: props?.details?.author ?? '',
    },
    enableReinitialize: true,

    onSubmit: (values) => {
      if (isEmpty(props.details)) {
        dispatch(
          createSubjectAction({
            body: {
              name: values.name,
              teacherIds: values.teacherIds?.map((el) => el.value),
              type: values.type,
              author: values.author,
            },
            classId: values.class_id.value,
            onSuccess: () => {
              props.onClose()
              if (selectedClass) {
                dispatch(
                  getSubjectListAction({
                    body: {},
                    classId: selectedClass?.value,
                  })
                )
              }
            },
          })
        )
      } else {
        const details = formik.values
        dispatch(
          updateSubjectAction({
            subjectId: props.details.id,
            classId: props.details.classDetails.value,
            body: {
              author: details.author ?? '',
              name: details.name,
              teacherIds: details.teacherIds?.map((el) => el.value),
              type: details.type,
            },
            onSuccess: () => {
              props.onClose()
              if (selectedClass) {
                dispatch(
                  getSubjectListAction({
                    body: {},
                    classId: selectedClass?.value,
                  })
                )
              }
            },
          })
        )
      }
    },

    validationSchema: createSubjectSchema,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {editMode ? 'Edit' : 'Create'} Subject
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Subjects</AlertTitle>
            Create and manage class sections effortlessly. Assign class section
            names, and link them to teachers and students for seamless
            organization.
          </Alert>
          <Stack direction={'row'} spacing={2}>
            <InputField
              placeholder="Subject Name"
              labelDetail={{ text: 'Subject Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <FormControl fullWidth required>
              <FormLabel
                sx={{
                  fontSize: 13,
                  mb: 1,
                  color: colors.grey[600],
                }}
              >
                Class
              </FormLabel>
              <AsyncSelectField
                menuPlacement="top"
                placeholder="Select class"
                loadOptions={() => remappedClassList()}
                defaultOptions
                value={formik.values.class_id}
                // isDisabled={isEmpty(remapTeacherList())}
                isDisabled={!isEmpty(props.details)}
                onChange={(e) => {
                  // setClassDefaultValue(e)
                  formik.setFieldValue('class_id', e)
                }}
                styles={{
                  ...classReactSelectStyles,
                }}
              />
            </FormControl>
          </Stack>
          <Stack direction={'row'} spacing={2} mt={2}>
            <FormControl fullWidth required>
              <FormLabel
                sx={{
                  fontSize: 13,
                  mb: 1,
                  color: colors.grey[600],
                }}
              >
                Assign Teacher
              </FormLabel>
              {!isEmpty(remapTeacherList()) ? (
                <SelectField
                  menuPlacement="top"
                  isMulti
                  placeholder="Select class"
                  value={formik.values.teacherIds}
                  onChange={(e) => {
                    // if (isArray(e)) {
                    //   const ids = e?.map((el) => el.value)
                    //   formik.setFieldValue('teacherIds', ids)
                    // }
                    formik.setFieldValue('teacherIds', e)
                  }}
                  options={remapTeacherList() ?? []}
                  styles={{
                    ...classReactSelectStyles,
                  }}
                />
              ) : null}
            </FormControl>

            <InputField
              placeholder="Author name"
              labelDetail={{ text: 'Author', required: false }}
              value={formik.values.author}
              onChange={formik.handleChange}
              name="author"
              onBlur={formik.handleBlur}
              error={formik.touched.author && Boolean(formik.errors.author)}
              helperText={
                formik.touched.author ? formik.errors.author : undefined
              }
            />
          </Stack>
          <Stack>
            <FormControl
              fullWidth
              error={formik.touched.type && Boolean(formik.errors.type)}
            >
              <FormLabel
                id="demo-row-radio-buttons-group-label"
                sx={{
                  fontSize: 13,
                  mb: 1,
                  color: colors.grey[800],
                }}
              >
                Subject Type
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="type"
                onChange={formik.handleChange}
                value={formik.values.type}
              >
                <FormControlLabel
                  value="mandatory"
                  control={<Radio />}
                  label="Mandatory"
                />
                <FormControlLabel
                  value="optional"
                  control={<Radio />}
                  label="Optional"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={updateSubjectLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createSubjectLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Create
              </ButtonComp>
            )}
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
