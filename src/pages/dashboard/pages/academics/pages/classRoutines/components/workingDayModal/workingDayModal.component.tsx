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
  createWorkingDayAction,
  updateWorkingDayAction,
} from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { workingDaySchema } from '../../classRoutines.schema'

interface Props {
  open: boolean
  onClose: () => void
  classId: number | null
  details: Academics.IWorkingDay | null
  onSuccess: () => void
}

export function WorkingDayModal(props: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector(
    (store) => store.classRoutines.workingDayMutation
  )

  const formik = useFormik({
    initialValues: {
      name: props.details?.name ?? '',
      sequence_order:
        props.details?.sequence_order !== undefined
          ? String(props.details.sequence_order)
          : '',
      is_working_day: props.details?.is_working_day ?? true,
    },
    enableReinitialize: true,
    validationSchema: workingDaySchema,
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
        sequence_order: values.sequence_order
          ? Number(values.sequence_order)
          : undefined,
        is_working_day: values.is_working_day,
      }

      if (props.details) {
        dispatch(
          updateWorkingDayAction({
            classId: props.classId,
            workingDayId: props.details.id,
            body,
            onSuccess,
          })
        )

        return
      }

      dispatch(
        createWorkingDayAction({
          classId: props.classId,
          body,
          onSuccess,
        })
      )
    },
  })

  const fieldError = (key: keyof typeof formik.errors) =>
    Boolean(formik.touched[key]) && Boolean(formik.errors[key])

  const helperText = (key: keyof typeof formik.errors) =>
    fieldError(key) ? String(formik.errors[key]) : ''

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {props.details ? 'Edit' : 'Create'} Working Day
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          Working days are the days of the week the class routine is followed.
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <InputField
              placeholder="e.g. Sunday"
              labelDetail={{ text: 'Day Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={fieldError('name')}
              helperText={helperText('name')}
            />
            <InputField
              type="number"
              placeholder="e.g. 1"
              labelDetail={{ text: 'Sequence Order', required: false }}
              value={formik.values.sequence_order}
              onChange={formik.handleChange}
              name="sequence_order"
              onBlur={formik.handleBlur}
              error={fieldError('sequence_order')}
              helperText={helperText('sequence_order')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.is_working_day}
                  onChange={(e) =>
                    formik.setFieldValue('is_working_day', e.target.checked)
                  }
                />
              }
              label="This is a working day"
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
