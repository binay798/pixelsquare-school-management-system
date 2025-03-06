import * as Yup from 'yup'

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is Required'),
  password: Yup.string()
    .min(3, 'Password must be at least 3 characters')
    .required('Password is Required'),
})

export default loginValidationSchema
