import * as yup from 'yup'

export const createClassSectionSchema = yup.object({
  name: yup.string().required('Class section name is required'),
  class_id: yup.number().integer().required('Class is required'),
})
