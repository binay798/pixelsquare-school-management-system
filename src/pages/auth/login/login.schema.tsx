import * as Yup from 'yup'

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Your email address is required'),
  password: Yup.string()
    .min(3, 'Password must be at least 3 characters')
    .required('Your password is required'),
})

export default loginValidationSchema
