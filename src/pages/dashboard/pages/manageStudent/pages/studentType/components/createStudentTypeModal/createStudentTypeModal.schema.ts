import * as yup from 'yup'

export const createStudentTypeSchema = yup.object({
  type: yup.string().required('Required'),
})
