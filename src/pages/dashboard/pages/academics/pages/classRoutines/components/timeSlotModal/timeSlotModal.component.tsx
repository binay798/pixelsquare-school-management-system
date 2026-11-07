import { Box, FormControl, FormLabel, Stack, Typography } from '@mui/material'
import { useFormik } from 'formik'
import { useMemo } from 'react'
import { StylesConfig } from 'react-select'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import {
  SelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createTimeSlotAction,
  updateTimeSlotAction,
} from '@src/store/redux/dashboard/academics/classRoutines/classRoutines.slice'
import { timeSlotSchema } from '../../classRoutines.schema'
import {
  SLOT_TYPE_OPTIONS,
  routineSelectPortalProps,
} from '../../classRoutines.helpers'

const selectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}

interface ISelectOption {
  label: string
  value: number
}

interface ISlotTypeOption {
  label: string
  value: string
}

const toTimeInputValue = (value?: string) => (value ? value.slice(0, 5) : '')
const toApiTimeValue = (value: string) =>
  value.length === 5 ? `${value}:00` : value

const getSlotTypeOption = (slotType?: string): ISlotTypeOption => {
  const matched = SLOT_TYPE_OPTIONS.find((el) => el.value === slotType)

  return matched
    ? { label: matched.label, value: matched.value }
    : { label: SLOT_TYPE_OPTIONS[0].label, value: SLOT_TYPE_OPTIONS[0].value }
}

interface Props {
  open: boolean
  onClose: () => void
  classId: number | null
  workingDayList: Academics.IWorkingDayList[] | null
  scheduleTemplateList: Academics.IScheduleTemplateList[] | null
  details: Academics.ITimeSlotList | null
  onSuccess: () => void
}

export function TimeSlotModal(props: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector(
    (store) => store.classRoutines.timeSlotMutation
  )

  const workingDayOptions: ISelectOption[] = useMemo(
    () =>
      (props.workingDayList ?? []).map((el) => ({
        label: el.working_day_details.name,
        value: el.working_day_details.id,
      })),
    [props.workingDayList]
  )

  const templateOptions: ISelectOption[] = useMemo(
    () =>
      (props.scheduleTemplateList ?? []).map((el) => ({
        label: el.schedule_template_details.name,
        value: el.schedule_template_details.id,
      })),
    [props.scheduleTemplateList]
  )

  const formik = useFormik({
    initialValues: {
      schedule_template_id: props.details
        ? {
            label: props.details.schedule_template_details?.name,
            value: props.details.time_slot_details?.schedule_template_id,
          }
        : (null as ISelectOption | null),
      working_day_id: props.details
        ? {
            label: props.details.working_day_details?.name,
            value: props.details.time_slot_details?.working_day_id,
          }
        : (null as ISelectOption | null),
      name: props.details?.time_slot_details?.name ?? '',
      start_time: toTimeInputValue(
        props.details?.time_slot_details?.start_time
      ),
      end_time: toTimeInputValue(props.details?.time_slot_details?.end_time),
      slot_type: getSlotTypeOption(props.details?.time_slot_details?.slot_type),
      sequence_order:
        props.details?.time_slot_details?.sequence_order !== undefined
          ? String(props.details?.time_slot_details?.sequence_order)
          : '',
    },
    enableReinitialize: true,
    validationSchema: timeSlotSchema,
    onSubmit: (values) => {
      if (!props.classId || !values.schedule_template_id) {
        return
      }

      const onSuccess = () => {
        props.onClose()
        props.onSuccess()
      }

      const body = {
        schedule_template_id: values.schedule_template_id.value,
        working_day_id: values.working_day_id?.value as number,
        name: values.name.trim(),
        start_time: toApiTimeValue(values.start_time),
        end_time: toApiTimeValue(values.end_time),
        slot_type: values.slot_type.value,
        sequence_order: values.sequence_order
          ? Number(values.sequence_order)
          : undefined,
      }

      if (props.details) {
        dispatch(
          updateTimeSlotAction({
            classId: props.classId,
            timeSlotId: props.details.time_slot_details.id,
            body,
            onSuccess,
          })
        )

        return
      }

      dispatch(
        createTimeSlotAction({
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
    <SpringModal open={props.open} close={props.onClose} size="md">
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {props.details ? 'Edit' : 'Create'} Time Slot
        </Typography>
        <Typography fontSize={13} color={colors.grey[600]} mb={2.5}>
          Time slots define the periods and breaks of a working day.
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Schedule Template
                </FormLabel>
                <SelectField
                  placeholder="Select schedule template"
                  options={templateOptions}
                  value={formik.values.schedule_template_id}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'schedule_template_id',
                      e as ISelectOption | null
                    )
                  }
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('schedule_template_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('schedule_template_id')}
                  </Typography>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Working Day
                </FormLabel>
                <SelectField
                  placeholder="Select working day"
                  options={workingDayOptions}
                  value={formik.values.working_day_id}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'working_day_id',
                      e as ISelectOption | null
                    )
                  }
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('working_day_id') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('working_day_id')}
                  </Typography>
                ) : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                placeholder="e.g. Period 1"
                labelDetail={{ text: 'Slot Name', required: true }}
                value={formik.values.name}
                onChange={formik.handleChange}
                name="name"
                onBlur={formik.handleBlur}
                error={fieldError('name')}
                helperText={helperText('name')}
              />
              <FormControl fullWidth>
                <FormLabel
                  sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                >
                  Slot Type
                </FormLabel>
                <SelectField
                  placeholder="Select slot type"
                  options={SLOT_TYPE_OPTIONS}
                  value={formik.values.slot_type}
                  onChange={(e) => {
                    formik.setFieldValue(
                      'slot_type',
                      e as ISlotTypeOption | null
                    )
                  }}
                  {...routineSelectPortalProps}
                  styles={selectStyles}
                />
                {fieldError('slot_type') ? (
                  <Typography fontSize={11.5} color="error" mt={0.5}>
                    {helperText('slot_type')}
                  </Typography>
                ) : null}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <InputField
                type="time"
                labelDetail={{ text: 'Start Time', required: true }}
                value={formik.values.start_time}
                onChange={formik.handleChange}
                name="start_time"
                onBlur={formik.handleBlur}
                error={fieldError('start_time')}
                helperText={helperText('start_time')}
              />
              <InputField
                type="time"
                labelDetail={{ text: 'End Time', required: true }}
                value={formik.values.end_time}
                onChange={formik.handleChange}
                name="end_time"
                onBlur={formik.handleBlur}
                error={fieldError('end_time')}
                helperText={helperText('end_time')}
              />
            </Stack>

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
