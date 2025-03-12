import * as yup from 'yup'

export const createDepartmentSchema = yup.object({
  name: yup.string().required(),
})
