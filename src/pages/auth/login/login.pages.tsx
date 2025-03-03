import { Stack, Typography } from '@mui/material'
import {
  LoginCardContainer,
  LoginContainer,
  LoginLeftContainer,
  LoginRightContainer,
} from './login.styles'
import { InputField } from '@src/components/input/input.component'
import { ButtonComp } from '@src/components/button/button.component'
import { authSliceLogin } from '@src/store/redux/auth/auth.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import school from '@src/assets/images/school.png'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export function Login() {
  const authLoginStore = useSelector((store) => store.auth.user)
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is Required'),
      password: Yup.string()
        .min(3, 'Password must be at least 6 characters')
        .required('Password is Required'),
    }),
    onSubmit: (values) => {
      dispatch(
        authSliceLogin({
          body: {
            email: values.email,
            password: values.password,
            schoolId: Number(import.meta.env.VITE_APP_SCHOOL_URL),
          },
          onSuccess: () => {},
        })
      )
    },
  })

  return (
    <LoginContainer>
      <LoginCardContainer>
        <LoginLeftContainer>
          <Typography mb={2} variant="h4" fontWeight={800}>
            Hi, Welcome back 👋
          </Typography>
          <Typography variant="body1" mb={1}>
            We&apos;re glad to have you here! Let&apos;s get started
          </Typography>
          <img src={school} alt="school" />
        </LoginLeftContainer>
        <LoginRightContainer>
          <Typography mb={1} variant="h5" fontWeight={700}>
            Let&apos;s Get Started 🚀
          </Typography>
          <Typography mb={4}>Login to get all features on dashboard</Typography>
          <form onSubmit={formik.handleSubmit}>
            <Stack gap={2}>
              <InputField
                placeholder="Email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="email"
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={
                  formik.touched.email ? formik.errors.email : undefined
                }
              />
              <InputField
                type="password"
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="password"
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={
                  formik.touched.password ? formik.errors.password : undefined
                }
              />
              <ButtonComp
                loading={authLoginStore.loading}
                type="submit"
                size="large"
                sx={{
                  background:
                    'linear-gradient(to right,rgb(47, 58, 158),rgb(28, 22, 194))',
                  color: 'white',
                  borderRadius: '8px',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                Login
              </ButtonComp>
            </Stack>
          </form>
        </LoginRightContainer>
      </LoginCardContainer>
    </LoginContainer>
  )
}
