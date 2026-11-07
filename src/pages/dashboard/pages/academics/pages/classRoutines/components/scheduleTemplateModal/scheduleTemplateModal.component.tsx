import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useFormik } from 'formik'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createScheduleTemplateAction,
  updateScheduleTemplateAction,
} from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { scheduleTemplateSchema } from '../../classRoutines.schema'

interface Props {
  open: boolean
  onClose: () => void
  classId: number | null
  details: Academics.IScheduleTemplate | null
  onSuccess: () => void
}

export function ScheduleTemplateModal(props: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector(
    (store) => store.classRoutines.scheduleTemplateMutation
  )

  const formik = useFormik({
    initialValues: {
      name: props.details?.name ?? '',
      is_active: props.details?.is_active ?? true,
    },
    enableReinitialize: true,
    validationSchema: scheduleTemplateSchema,
    onSubmit: (values) => {
      if (!props.classId) {
        return
      }

      const onSuccess = () => {
        props.onClose()
        props.onSuccess()
      }

      const body = {
        name: values.name.trim(),
        is_active: values.is_active,
      }

      if (props.details) {
        dispatch(
          updateScheduleTemplateAction({
            classId: props.classId,
            scheduleTemplateId: props.details.id,
            body,
            onSuccess,
          })
        )

        return
      }

      dispatch(
        createScheduleTemplateAction({
          classId: props.classId,
          body,
          onSuccess,
        })
      )
    },
  })

  const fieldError = (key: keyof typeof formik.errors) =>
    Boolean(formik.touched[key]) && Boolean(formik.errors[key])

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {props.details ? 'Edit' : 'Create'} Schedule Template
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          Schedule templates group the time slots of a class routine.
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <InputField
              placeholder="e.g. Morning Shift"
              labelDetail={{ text: 'Template Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={fieldError('name')}
              helperText={fieldError('name') ? String(formik.errors.name) : ''}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.is_active}
                  onChange={(e) =>
                    formik.setFieldValue('is_active', e.target.checked)
                  }
                />
              }
              label="Active template"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
            />
          </Stack>

          <Stack direction="row" mt={3} gap={2} justifyContent="flex-end">
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp type="submit" size="medium" loading={loading}>
              {props.details ? 'Update' : 'Create'}
            </ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
