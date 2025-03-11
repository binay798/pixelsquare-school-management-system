import * as yup from 'yup'

export const createDesignationSchema = yup.object({
  designation: yup.string().required('Required'),
})
