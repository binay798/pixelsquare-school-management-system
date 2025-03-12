import * as yup from 'yup'

export const editEmployeeSchema = yup.object({
  firstname: yup.string().optional(),
  middlename: yup.string(),
  lastname: yup.string().optional(),
  mobile: yup.string().optional(),
  temporary_address: yup.string().optional(),
  permanent_address: yup.string().optional(),
  religion: yup.string(),
  blood_group: yup.string(),
  date_of_birth: yup.string(),
  gender: yup.string().optional(),
  nationality: yup.string().optional(),
  // email: yup.string().email().optional(),
  // password: yup.string().optional(),
  employee_designation_id: yup.object({
    label: yup.string().optional(),
    value: yup.string().optional(),
  }),
  national_id: yup.string(),
  joining_date: yup.string().optional(),
  role: yup.string().optional(),
})
