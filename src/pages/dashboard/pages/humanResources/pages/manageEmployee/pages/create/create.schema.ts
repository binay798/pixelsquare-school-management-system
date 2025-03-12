import * as yup from 'yup'

export const createEmployeeSchema = yup.object({
  firstname: yup.string().required(),
  middlename: yup.string(),
  lastname: yup.string().required(),
  mobile: yup.string().required(),
  temporary_address: yup.string().required(),
  permanent_address: yup.string().required(),
  religion: yup.string(),
  blood_group: yup.string(),
  date_of_birth: yup.string(),
  gender: yup.string().required(),
  nationality: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
  employee_designation_id: yup.object({
    label: yup.string().required(),
    value: yup.string().required(),
  }),
  national_id: yup.string(),
  joining_date: yup.string().required(),
  role: yup.string().required(),
})
