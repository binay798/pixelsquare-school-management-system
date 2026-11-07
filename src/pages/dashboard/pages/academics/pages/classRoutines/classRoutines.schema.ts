import * as yup from 'yup'

const selectOptionSchema = (message: string) =>
  yup
    .object({ label: yup.string(), value: yup.string().required() })
    .nullable()
    .required(message)

export const assignRoutineSchema = yup.object({
  class_section_id: selectOptionSchema('Class section is required'),
  teacher_id: selectOptionSchema('Teacher is required'),
  subject_id: selectOptionSchema('Subject is required'),
  working_day_id: selectOptionSchema('Working day is required'),
  time_slot_id: selectOptionSchema('Time slot is required'),
})

export const timeSlotSchema = yup.object({
  schedule_template_id: selectOptionSchema('Schedule template is required'),
  working_day_id: selectOptionSchema('Working day is required'),
  name: yup.string().trim().required('Time slot name is required'),
  start_time: yup.string().required('Start time is required'),
  end_time: yup.string().required('End time is required'),
  slot_type: selectOptionSchema('Slot type is required'),
  sequence_order: yup
    .number()
    .typeError('Sequence order must be a number')
    .min(0, 'Sequence order cannot be negative')
    .nullable(),
})

export const workingDaySchema = yup.object({
  name: yup.string().trim().required('Working day name is required'),
  sequence_order: yup
    .number()
    .typeError('Sequence order must be a number')
    .min(0, 'Sequence order cannot be negative')
    .nullable(),
  is_working_day: yup.boolean(),
})

export const scheduleTemplateSchema = yup.object({
  name: yup.string().trim().required('Schedule template name is required'),
  is_active: yup.boolean(),
})
