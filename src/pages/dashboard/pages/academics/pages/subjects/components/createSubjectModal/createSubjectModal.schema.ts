import * as yup from 'yup'

export const createSubjectSchema = yup.object({
  name: yup.string().required('Class section name is required'),
  class_id: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .required('Class is required'),
  type: yup.string().required('Type is required'),
  teacherIds: yup
    .array(
      yup
        .object({
          label: yup.string().required(),
          value: yup.string().required(),
        })
        .required()
    )
    .required(),
  author: yup.string().optional(),
})
