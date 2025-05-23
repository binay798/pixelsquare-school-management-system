import * as yup from 'yup'

export const createClassSectionSchema = yup.object({
  name: yup.string().required('Class section name is required'),
  class_id: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .required('Class is required'),
})
