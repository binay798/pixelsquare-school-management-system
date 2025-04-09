import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFormik } from 'formik'
import { createClassSchema } from './createClassModal.schema'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createClassAction,
  getClassListAction,
  updateClassAction,
} from '@src/store/redux/dashboard/academics/classes/classes.slice'
import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  details: { id: number; name: string; numeric_name: string } | null
}
export function CreateClassModal(props: Props) {
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (props?.details) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [props.details])
  const { loading: createClassLoading } = useSelector(
    (store) => store.classes.createClass
  )
  const { loading: editClassLoading } = useSelector(
    (store) => store.classes.editClass
  )
  const formik = useFormik({
    initialValues: {
      name: props?.details?.name ?? '',
      numeric_name: props?.details?.numeric_name ?? '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!editMode) {
        dispatch(
          createClassAction({
            payload: values,
            onSuccess: () => {
              props.onClose()
              formik.resetForm()
              dispatch(getClassListAction({ onSuccess: () => {} }))
            },
          })
        )
      } else {
        // EDIT HANDLER
        if (props?.details) {
          dispatch(
            updateClassAction({
              classId: props?.details?.id,
              payload: {
                name: values?.name,
                numeric_name: values?.numeric_name,
              },
              onSuccess: () => {
                props.onClose()
                dispatch(getClassListAction({ onSuccess: () => {} }))
                formik.resetForm()
              },
            })
          )
        }
      }
    },
    validationSchema: createClassSchema,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {editMode ? 'Edit' : 'Create'} Class
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Classes</AlertTitle>
            Create and manage classes effortlessly. Assign class names,
            sections, and academic sessions, and link them to teachers and
            students for seamless organization.
          </Alert>
          <Stack direction={'row'} spacing={2}>
            <InputField
              placeholder="Class Name"
              labelDetail={{ text: 'Class Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <InputField
              placeholder="Numeric Name"
              labelDetail={{ text: 'Numeric Name', required: true }}
              value={formik.values.numeric_name}
              onChange={formik.handleChange}
              name="numeric_name"
              onBlur={formik.handleBlur}
              error={
                formik.touched.numeric_name &&
                Boolean(formik.errors.numeric_name)
              }
              helperText={
                formik.touched.numeric_name
                  ? formik.errors.numeric_name
                  : undefined
              }
            />
          </Stack>
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={editClassLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createClassLoading}
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
