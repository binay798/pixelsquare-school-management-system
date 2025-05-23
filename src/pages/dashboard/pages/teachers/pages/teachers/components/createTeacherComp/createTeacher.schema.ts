import * as yup from 'yup'

export const createTeacherSchema = yup.object({
  firstname: yup.string().required(),
  middlename: yup.string(),
  lastname: yup.string().required(),
  mobile: yup.string().required(),
  temporary_address: yup.string().required(),
  permanent_address: yup.string().required(),
  religion: yup.string().required(),
  blood_group: yup.string().required(),
  date_of_birth: yup.string().required(),
  gender: yup.string().required(),
  nationality: yup.string().required(),
  email: yup.string().required(),
  password: yup.string().required(),
  department: yup.object({
    label: yup.string().required(),
    value: yup.number().required(),
  }),
  national_id: yup.string().required(),
  joining_date: yup.string().required(),
})
