import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFormik } from 'formik'
import { createDepartmentSchema } from './createDepartment.schema'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createDepartmentAction } from '@src/store/redux/dashboard/teachers/departments/departments.slice'
import { isEmpty } from 'lodash'

interface Props {
  open: boolean
  onClose: () => void
}
export function CreateDepartmentModal(props: Props) {
  const dispatch = useDispatch()
  const { loading: createLoading } = useSelector(
    (store) => store.departments.createDepartment
  )
  const { data: activeAcaYr } = useSelector(
    (store) => store.academicYear.activeAcademicYearOfSchool
  )
  const formik = useFormik({
    initialValues: { name: '' },
    onSubmit: (values) => {
      if (!isEmpty(activeAcaYr)) {
        dispatch(
          createDepartmentAction({
            payload: { name: values.name, academicYearId: activeAcaYr?.id },
            onSuccess: () => {
              props.onClose()
              formik.resetForm()
            },
          })
        )
      }
      // dispatch(
      //   createDesignationAction({
      //     payload: values,
      //     onSuccess: () => {
      //       props.onClose()
      //       formik.resetForm()
      //       dispatch(listDesignationAction({ payload: { page, limit } }))
      //     },
      //   })
      // )
    },
    validationSchema: createDepartmentSchema,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Create Department
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>School Departments</AlertTitle>
            Departments categorize academic and administrative units within the
            school, facilitating curriculum planning, faculty assignments, and
            resource management.
          </Alert>
          <InputField
            type="text"
            placeholder="Mathematics"
            labelDetail={{ required: true, text: 'Department' }}
            value={formik.values.name}
            onChange={formik.handleChange}
            name="name"
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : undefined}
          />
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={createLoading}
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
