import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material'
import {
  AlertCircle,
  ArrowRight,
  GraduationCap,
  LifeBuoy,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import { LOCAL_STORAGE } from '@src/constants/global.constants'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { authSliceLogin } from '@src/store/redux/auth/auth.slice'
import type { IAuthError } from '@src/store/redux/auth/auth.slice'
import { LoginBrandPanel } from './components/loginBrandPanel.component'
import { LoginHelpModal } from './components/loginHelpModal.component'
import {
  LoginPasswordField,
  LoginTextField,
} from './components/loginTextField.component'
import { LOGIN_BRAND, REMEMBERED_EMAIL_KEY } from './login.constants'
import { loginValidationSchema } from './login.schema'
import {
  CapsHint,
  FieldGroup,
  FormArea,
  FormHeading,
  FormKicker,
  FormPanel,
  FormShell,
  FormSub,
  HelpLabel,
  LoginFooter,
  LoginForm,
  LoginPage,
  MetaRow,
  MobileBrand,
  MobileBrandName,
  MobileMark,
  SecureNote,
  TextLink,
  TopBar,
} from './login.styles'

const GENERIC_ERROR = 'We could not sign you in. Please try again.'
const NETWORK_ERROR =
  'We could not reach the server. Check your connection and try again.'
const INVALID_CREDENTIALS =
  'Incorrect email or password. Please check your details and try again.'

type LoginFailure = Partial<IAuthError>

/**
 * Turns an API failure into copy a person can act on:
 * - 400/403 on this endpoint mean the credential pair did not match, so the
 *   message stays generic instead of confirming whether the email exists.
 * - No status at all is a connectivity problem, not a password problem.
 */
function resolveLoginError(error: unknown) {
  const failure = (error ?? {}) as LoginFailure
  const status = failure.status
  const message = failure.message

  if (status === 400 || status === 403) {
    return INVALID_CREDENTIALS
  }

  if (message && message !== 'Something went wrong') {
    return message
  }

  return status ? GENERIC_ERROR : NETWORK_ERROR
}

function readRememberedEmail() {
  try {
    return LOCAL_STORAGE.getItem(REMEMBERED_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistRememberedEmail(email: string, remember: boolean) {
  try {
    if (remember && email) {
      LOCAL_STORAGE.setItem(REMEMBERED_EMAIL_KEY, email)
    } else {
      LOCAL_STORAGE.removeItem(REMEMBERED_EMAIL_KEY)
    }
  } catch {
    // Storage can be blocked (private mode). Remembering the email is optional.
  }
}

export function Login() {
  const authLoginStore = useSelector((store) => store.auth.user)
  const dispatch = useDispatch()

  const rememberedEmail = useMemo(readRememberedEmail, [])
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail))
  const [serverError, setServerError] = useState('')
  const [capsLock, setCapsLock] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: rememberedEmail,
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      if (authLoginStore.loading) {
        return
      }

      setServerError('')

      try {
        await dispatch(
          authSliceLogin({
            body: {
              email: values.email.trim(),
              password: values.password,
              schoolId: Number(import.meta.env.VITE_APP_SCHOOL_URL),
            },
          })
        ).unwrap()

        persistRememberedEmail(values.email.trim(), rememberEmail)
      } catch (error) {
        setServerError(resolveLoginError(error))
      }
    },
  })

  const submitting = authLoginStore.loading || formik.isSubmitting

  // Move focus to the first invalid field so keyboard and screen-reader users
  // hear the error instead of hunting for it.
  useEffect(() => {
    if (formik.submitCount === 0) {
      return
    }

    if (formik.errors.email) {
      document.getElementById('login-email')?.focus()
    } else if (formik.errors.password) {
      document.getElementById('login-password')?.focus()
    }
  }, [formik.submitCount, formik.errors.email, formik.errors.password])

  const handlePasswordKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLock(event.getModifierState('CapsLock'))
    }
  }

  return (
    <LoginPage>
      <LoginBrandPanel />

      <FormPanel>
        <TopBar>
          <MobileBrand>
            <MobileMark>
              <GraduationCap size={18} />
            </MobileMark>
            <MobileBrandName>{LOGIN_BRAND.shortName}</MobileBrandName>
          </MobileBrand>

          <ButtonComp
            type="button"
            variant="text"
            size="small"
            aria-label="Need help signing in?"
            onClick={() => setHelpOpen(true)}
            startIcon={<LifeBuoy size={14} />}
            sx={{
              ml: 'auto',
              height: 34,
              px: 1.5,
              borderRadius: '9px',
              fontSize: 12,
              fontWeight: 600,
              color: colors.grey[600],
              '& .MuiButton-startIcon': { mr: 0.75 },
              '&:hover': {
                bgcolor: colors.grey[100],
                color: colors.grey[900],
              },
              '&:focus-visible': {
                outline: '2px solid #2463eb',
                outlineOffset: 2,
              },
            }}
          >
            <HelpLabel>Need help?</HelpLabel>
          </ButtonComp>
        </TopBar>

        <FormArea>
          <FormShell>
            <FormKicker>
              <ShieldCheck size={13} />
              Secure sign-in
            </FormKicker>
            <FormHeading>Welcome back</FormHeading>
            <FormSub>
              Sign in with your school account to continue to your workspace.
            </FormSub>

            <LoginForm
              noValidate
              aria-busy={submitting}
              onSubmit={formik.handleSubmit}
            >
              {serverError ? (
                <Alert
                  severity="error"
                  icon={<AlertCircle size={18} />}
                  onClose={() => setServerError('')}
                  sx={{
                    mb: 2.5,
                    borderRadius: '12px',
                    alignItems: 'center',
                    bgcolor: colors.red[50],
                    color: colors.red[800],
                    border: `1px solid ${colors.red[200]}`,
                    '& .MuiAlert-icon': { color: colors.red[500] },
                    '& .MuiAlert-message': {
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    },
                  }}
                >
                  {serverError}
                </Alert>
              ) : null}

              <FieldGroup>
                <LoginTextField
                  id="login-email"
                  name="email"
                  label="Email address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@school.edu"
                  autoComplete="username"
                  autoFocus
                  startIcon={<Mail size={16} />}
                  error={formik.touched.email ? formik.errors.email : undefined}
                />

                <LoginPasswordField
                  id="login-password"
                  name="password"
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={(event) => {
                    formik.handleBlur(event)
                    setCapsLock(false)
                  }}
                  onKeyUp={handlePasswordKeyUp}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  startIcon={<Lock size={16} />}
                  error={
                    formik.touched.password ? formik.errors.password : undefined
                  }
                  hint={
                    capsLock ? (
                      <CapsHint>
                        <AlertCircle size={12} />
                        Caps Lock is on
                      </CapsHint>
                    ) : undefined
                  }
                />

                <MetaRow>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberEmail}
                        onChange={(event) =>
                          setRememberEmail(event.target.checked)
                        }
                        sx={{
                          p: 0.5,
                          mr: 0.75,
                          color: colors.grey[400],
                          '&.Mui-checked': { color: colors.blue[600] },
                        }}
                      />
                    }
                    label={
                      <Typography fontSize={12.5} color={colors.grey[600]}>
                        Remember my email
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  <TextLink type="button" onClick={() => setHelpOpen(true)}>
                    Forgot password?
                  </TextLink>
                </MetaRow>

                <Box>
                  <ButtonComp
                    type="submit"
                    size="large"
                    fullWidth
                    loading={submitting}
                    disabled={submitting}
                    sx={{
                      height: 48,
                      borderRadius: '12px',
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: '0.1px',
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)',
                      color: '#fff',
                      boxShadow: '0 14px 26px -14px rgba(37, 99, 235, 0.85)',
                      transition:
                        'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
                      '&:hover': {
                        filter: 'brightness(1.06)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 18px 30px -14px rgba(37, 99, 235, 0.9)',
                      },
                      '&.Mui-disabled': {
                        background:
                          'linear-gradient(135deg, #93b4f8 0%, #7ea3f5 100%)',
                        color: 'rgba(255, 255, 255, 0.92)',
                      },
                      '&:focus-visible': {
                        outline: '2px solid #1d4ed8',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {submitting ? 'Signing in…' : 'Sign in'}
                      {submitting ? null : <ArrowRight size={16} />}
                    </span>
                  </ButtonComp>
                </Box>
              </FieldGroup>
            </LoginForm>

            <SecureNote>
              <ShieldCheck size={14} />
              <span>
                Protected by role-based access control and encrypted sessions.
              </span>
            </SecureNote>
          </FormShell>
        </FormArea>

        <LoginFooter>
          <span>
            © {new Date().getFullYear()} {LOGIN_BRAND.product}
          </span>
          <span>All rights reserved.</span>
        </LoginFooter>
      </FormPanel>

      <LoginHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </LoginPage>
  )
}
