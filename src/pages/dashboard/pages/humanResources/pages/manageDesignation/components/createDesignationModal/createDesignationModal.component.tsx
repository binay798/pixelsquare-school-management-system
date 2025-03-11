import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useFormik } from 'formik'
import { createDesignationSchema } from './createDesignation.schema'
import {
  createDesignationAction,
  listDesignationAction,
} from '@src/store/redux/dashboard/humanResources/designations/designations.slice'
import { usePage } from '@src/helpers/getPageParams.helper'

interface Props {
  open: boolean
  onClose: () => void
}
export function CreateDesignationModal(props: Props) {
  const dispatch = useDispatch()
  const { page, limit } = usePage()
  const { loading: createDesignationLoading } = useSelector(
    (store) => store.designations.createDesignation
  )
  const formik = useFormik({
    initialValues: { designation: '' },
    onSubmit: (values) => {
      dispatch(
        createDesignationAction({
          payload: values,
          onSuccess: () => {
            props.onClose()
            formik.resetForm()
            dispatch(listDesignationAction({ payload: { page, limit } }))
          },
        })
      )
    },
    validationSchema: createDesignationSchema,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Create Designation
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Employee Designation</AlertTitle>
            Employees are assigned designations, which serve as a basis for
            performance analysis, career progression, and organizational
            structuring.
          </Alert>
          <InputField
            type="text"
            placeholder="Librarian"
            labelDetail={{ required: true, text: 'Designation' }}
            value={formik.values.designation}
            onChange={formik.handleChange}
            name="designation"
            onBlur={formik.handleBlur}
            error={
              formik.touched.designation && Boolean(formik.errors.designation)
            }
            helperText={
              formik.touched.designation ? formik.errors.designation : undefined
            }
          />
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={createDesignationLoading}
              type="submit"
              size="medium"
              disabled={!formik.dirty}
            >
              Create
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
