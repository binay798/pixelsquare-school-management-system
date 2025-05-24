import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFormik } from 'formik'
import { createStudentTypeSchema } from './createStudentTypeModal.schema'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createStudentTypeAction,
  getStudentTypeListAction,
  updateStudentTypeAction,
} from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'
import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash'

interface Props {
  open: boolean
  onClose: () => void
  details: Students.IStudentType | null
}
export function CreateStudentTypeModal(props: Props) {
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const { loading: createLoading } = useSelector(
    (store) => store.manageStudents.studentType.create
  )
  const { loading: updateLoading } = useSelector(
    (store) => store.manageStudents.studentType.update
  )
  useEffect(() => {
    if (!isEmpty(props.details)) {
      setEditMode(true)
    }
  }, [props.details])
  const formik = useFormik({
    initialValues: { type: props?.details?.name ?? '' },
    onSubmit: (values) => {
      if (!editMode) {
        dispatch(
          createStudentTypeAction({
            payload: { name: values.type },
            onSuccess: () => {
              props.onClose()
              formik.resetForm()
              dispatch(getStudentTypeListAction({}))
            },
          })
        )
      } else {
        // EDIT
        if (props.details) {
          dispatch(
            updateStudentTypeAction({
              payload: { name: values.type, studentTypeId: props.details?.id },
              onSuccess: () => {
                props.onClose()
                formik.resetForm()
                dispatch(getStudentTypeListAction({}))
              },
            })
          )
        }
      }
    },
    validationSchema: createStudentTypeSchema,
    enableReinitialize: true,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Create Student Type
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Student Type</AlertTitle>
            Departments categorize academic and administrative units within the
            school, facilitating curriculum planning, faculty assignments, and
            resource management.
          </Alert>
          <InputField
            type="text"
            placeholder="Regular"
            labelDetail={{ required: true, text: 'Type' }}
            value={formik.values.type}
            onChange={formik.handleChange}
            name="type"
            onBlur={formik.handleBlur}
            error={formik.touched.type && Boolean(formik.errors.type)}
            helperText={formik.touched.type ? formik.errors.type : undefined}
          />
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            {!editMode ? (
              <ButtonComp
                loading={createLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Create
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={updateLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            )}
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
