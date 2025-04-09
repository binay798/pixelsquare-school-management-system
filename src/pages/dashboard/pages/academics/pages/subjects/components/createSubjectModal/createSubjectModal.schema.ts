import * as yup from 'yup'

export const createSubjectSchema = yup.object({
  name: yup.string().required('Class section name is required'),
  class_id: yup.number().integer().required('Class is required'),
  type: yup.string().required('Type is required'),
  teacherIds: yup.array(yup.number().integer().required()).required(),
})
