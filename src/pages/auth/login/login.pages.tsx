import { Stack, Typography } from '@mui/material'
import {
  LoginCardContainer,
  LoginContainer,
  LoginLeftContainer,
  LoginRightContainer,
} from './login.styles'
import { InputField } from '@src/components/input/input.component'
import { ButtonComp } from '@src/components/button/button.component'
import { useState } from 'react'
import { authSliceLogin } from '@src/store/redux/auth/auth.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import school from '@src/assets/images/school.png'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const authLoginStore = useSelector((store) => store.auth.user)
  const dispatch = useDispatch()
  const submitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault()
    dispatch(
      authSliceLogin({
        body: {
          email,
          password,
          schoolId: Number(import.meta.env.VITE_APP_SCHOOL_URL),
        },
        onSuccess: () => {},
      })
    )
  }

  // const getGreeting = () => {
  //   const hour = new Date().getHours()
  //   if (hour < 12) return 'Good Morning! 🌞'
  //   if (hour < 18) return 'Good Afternoon! 🌤️'
  //   return 'Good Evening! 🌙'
  // }

  return (
    <LoginContainer>
      <LoginCardContainer>
        <LoginLeftContainer>
          <Typography mb={2} variant="h4" fontWeight={800}>
            Hi, Welcome back 👋
          </Typography>
          <Typography variant="body1" mb={1}>
            We&apos;re glad to have you here ! let&apos;s get started
          </Typography>
          <img src={school} alt="school" />
        </LoginLeftContainer>
        <LoginRightContainer>
          <Typography mb={1} variant="h5" fontWeight={700}>
            Let&apos;s Get Started 🚀
          </Typography>
          <Typography mb={4}>Login to get all features on dashboard</Typography>
          <form onSubmit={submitHandler}>
            <Stack gap={2}>
              <InputField
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
