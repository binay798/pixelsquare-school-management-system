import * as yup from 'yup'

const selectOption = yup
  .object({ label: yup.string(), value: yup.mixed() })
  .nullable()

const requiredSelect = (message: string) =>
  yup
    .object({ label: yup.string(), value: yup.mixed().required() })
    .nullable()
    .required(message)

export const roomFormSchema = yup.object({
  name: yup.string().trim().required('Room name is required'),
  code: yup.string().trim().required('Room code is required'),
  capacity: yup
    .number()
    .typeError('Capacity must be a number')
    .min(0, 'Capacity cannot be negative')
    .required('Capacity is required'),
  area: yup
    .number()
    .typeError('Area must be a number')
    .min(0, 'Area cannot be negative')
    .nullable(),
  status: requiredSelect('Status is required'),
  building_id: selectOption,
  floor_id: selectOption,
  room_type_id: selectOption,
  available_from: yup.string().nullable(),
  available_to: yup
    .string()
    .nullable()
    .test(
      'window',
      'Closing time must be after opening time',
      function (value) {
        const { available_from } = this.parent

        if (!value || !available_from) {
          return true
        }

        return value > available_from
      }
    ),
})

export const buildingFormSchema = yup.object({
  name: yup.string().trim().required('Building name is required'),
  code: yup.string().trim().required('Building code is required'),
  description: yup.string().nullable(),
})

export const floorFormSchema = yup.object({
  name: yup.string().trim().required('Floor name is required'),
  floor_number: yup
    .number()
    .typeError('Floor number must be a number')
    .required('Floor number is required'),
  description: yup.string().nullable(),
})

export const masterRecordFormSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  code: yup.string().trim().required('Code is required'),
  description: yup.string().nullable(),
})

export const allocationFormSchema = yup.object({
  academic_year_id: requiredSelect('Academic year is required'),
  section_id: requiredSelect('Class section is required'),
  room_id: requiredSelect('Room is required'),
  effective_from: yup.string().required('Start date is required'),
  effective_to: yup
    .string()
    .nullable()
    .test('window', 'End date must be after the start date', function (value) {
      const { effective_from } = this.parent

      if (!value || !effective_from) {
        return true
      }

      return value >= effective_from
    }),
})

export const maintenanceFormSchema = yup.object({
  room_id: requiredSelect('Room is required'),
  issue: yup.string().trim().required('Issue is required'),
  status: requiredSelect('Status is required'),
  maintenance_date: yup.string().required('Reported date is required'),
  scheduled_from: yup.string().nullable(),
  scheduled_to: yup
    .string()
    .nullable()
    .test('window', 'Maintenance must end after it starts', function (value) {
      const { scheduled_from } = this.parent

      if (!value || !scheduled_from) {
        return true
      }

      return value >= scheduled_from
    }),
  cost: yup.number().typeError('Cost must be a number').min(0).nullable(),
})

export const bookingFormSchema = yup.object({
  room_id: requiredSelect('Room is required'),
  purpose_type: requiredSelect('Purpose is required'),
  title: yup.string().trim().required('Title is required'),
  booking_date: yup.string().required('Date is required'),
  start_time: yup.string().required('Start time is required'),
  end_time: yup
    .string()
    .required('End time is required')
    .test('window', 'End time must be after start time', function (value) {
      const { start_time } = this.parent

      if (!value || !start_time) {
        return true
      }

      return value > start_time
    }),
  expected_capacity: yup
    .number()
    .typeError('Expected capacity must be a number')
    .min(0)
    .nullable(),
  booking_type: requiredSelect('Booking type is required'),
  recurrence_frequency: selectOption,
  recurrence_until: yup.string().nullable(),
  recurrence_days: yup.array().of(yup.number()).nullable(),
})
