import * as yup from 'yup'

export const admitStudentSchema = yup.object({
  firstname: yup.string().required(),
  middlename: yup.string(),
  lastname: yup.string().required(),
  mobile: yup.string().required(),
  temporary_address: yup.string().required(),
  permanent_address: yup.string().required(),
  religion: yup.string().required(),
  blood_group: yup.string().required(),
  date_of_birth: yup.string().required(),
  gender: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .required(),
  nationality: yup.string().required(),
  email: yup.string().required(),
  password: yup.string().required(),
  previousSchool: yup.string().optional(),
  fatherName: yup.string().required(),
  fatherMobile: yup.number().required(),
  motherName: yup.string().required(),
  motherMobile: yup.number(),
  class: yup.object({
    label: yup.string().required(),
    value: yup.number().required(),
  }),
  section: yup.object({
    label: yup.string().required(),
    value: yup.number().required(),
  }),
  rollNo: yup.number().required(),
})
