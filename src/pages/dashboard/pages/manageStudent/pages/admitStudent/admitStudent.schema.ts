import * as yup from 'yup'

export const admitStudentSchema = yup.object({
  firstname: yup.string().required(),
  middlename: yup.string(),
  lastname: yup.string().required(),
  mobile: yup.string().required(),
  temporary_address: yup.string().required(),
  permanent_address: yup.string().required(),
  religion: yup.string().required(),
  // Closed set, rendered as a select: A+, A-, B+, B-, AB+, AB-, O+, O-.
  blood_group: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .required(),
  date_of_birth: yup.string().required(),
  gender: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .required(),
  nationality: yup.string().required(),
  email: yup.string().required(),
  // password: yup.string().required(),
  previousSchool: yup.string().optional(),
  class: yup.object({
    label: yup.string().required(),
    value: yup.number().required(),
  }),
  section: yup.object({
    label: yup.string().required(),
    value: yup.number().required(),
  }),
  rollNo: yup.number().required(),
  // Optional: a student can be admitted first and linked to guardians later.
  guardians: yup
    .array()
    .of(
      yup.object({
        label: yup.string().required(),
        value: yup.number().required(),
      })
    )
    .max(10, 'Select at most 10 guardians')
    .optional(),
})
