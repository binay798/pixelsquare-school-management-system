import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { createClassSectionSchema } from './createSectionModal.schema'
import { ButtonComp } from '@src/components/button/button.component'
import {
  AsyncSelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import { StylesConfig } from 'react-select'
import {
  createClassSectionAction,
  getClassSectionListAction,
  updateSectionAction,
} from '@src/store/redux/dashboard/academics/classSections/sections.slice'
import { isEmpty } from 'lodash'

interface Props {
  open: boolean
  onClose: () => void
  details: {
    className: string
    classId: number
    sectionName: string
    sectionId: number
  } | null
}

const classReactSelectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}

export function CreateClassSectionModal(props: Props) {
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const { loading: updateSectionLoading } = useSelector(
    (store) => store.classSections.updateSection
  )
  const { loading: createSectionLoading } = useSelector(
    (store) => store.classSections.createSection
  )

  useEffect(() => {
    if (props?.details) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [props.details])

  // useEffect(() => {
  //   dispatch(getClassListAction({}))
  // }, [])
  const selectedClass = useSelector(
    (store) => store.subjects.subjectList.selectedClass
  )

  const formik = useFormik({
    initialValues: {
      name: props?.details?.sectionName ?? '',
      class_id: {
        label: props.details?.className ?? '',
        value: props.details?.classId ?? 0,
      },
    },
    enableReinitialize: true,

    onSubmit: (values) => {
      if (isEmpty(props.details)) {
        dispatch(
          createClassSectionAction({
            payload: { classId: values.class_id.value, name: values.name },
            onSuccess: () => {
              props.onClose()
              if (selectedClass) {
                dispatch(
                  getClassSectionListAction({
                    payload: { classId: selectedClass.value },
                    onSuccess: () => {},
                  })
                )
              }
            },
          })
        )
      } else {
        // EDIT
        dispatch(
          updateSectionAction({
            classId: props.details.classId,
            sectionId: props.details.sectionId,
            name: values.name,
            onSuccess: () => {
              props.onClose()
              if (selectedClass) {
                dispatch(
                  getClassSectionListAction({
                    payload: { classId: selectedClass.value },
                    onSuccess: () => {},
                  })
                )
              }
            },
          })
        )
      }
    },
    validationSchema: createClassSectionSchema,
  })

  const remappedClassList = async () => {
    const data = await getClassList()

    return data.data.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el.class_details?.id,
    }))
  }

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {editMode ? 'Edit' : 'Create'} Section
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Classes</AlertTitle>
            Create and manage class sections effortlessly. Assign class section
            names, and link them to teachers and students for seamless
            organization.
          </Alert>
          <Stack direction={'row'} spacing={2}>
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
                isDisabled={!isEmpty(props.details)}
                value={formik.values.class_id}
                onChange={(e) => {
                  formik.setFieldValue('class_id', e)
                }}
                styles={{
                  ...classReactSelectStyles,
                }}
              />
            </FormControl>
            <InputField
              placeholder="Class Section Name"
              labelDetail={{ text: 'Class Section Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
          </Stack>
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={updateSectionLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createSectionLoading}
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
