import * as yup from 'yup'

export const createClassSchema = yup.object({
  name: yup.string().required('Class name is required'),
  numeric_name: yup.string().required(),
})
