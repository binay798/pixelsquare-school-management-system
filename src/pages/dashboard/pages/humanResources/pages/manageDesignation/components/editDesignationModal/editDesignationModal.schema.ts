import * as yup from 'yup'

export const editDesignationSchema = yup.object({
  designation: yup.string().required('Required'),
})
