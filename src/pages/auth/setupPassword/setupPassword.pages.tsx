import { Alert } from '@mui/material'
import { useFormik } from 'formik'
import { AlertCircle, ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ButtonComp } from '@src/components/button/button.component'
import { LoginPasswordField } from '../login/components/loginTextField.component'
import { LOGIN_BRAND } from '../login/login.constants'
import {
  SetupBrandHeader,
  SetupCompleted,
  SetupLinkInvalid,
  SetupLinkMissing,
} from './components/setupPasswordStates.component'
import {
  errorAlertSx,
  primaryButtonSx,
  resolveSetupError,
} from './setupPassword.helpers'
import {
  PASSWORD_SETUP_TOKEN_PATTERN,
  setupPasswordValidationSchema,
} from './setupPassword.schema'
import { completePasswordSetup } from './setupPassword.service'
import {
  CapsHint,
  FieldGroup,
  RuleItem,
  RuleList,
  SetupCard,
  SetupFooter,
  SetupForm,
  SetupKicker,
  SetupPage,
  SetupSub,
  SetupTitle,
} from './setupPassword.styles'

/**
 * `/setup-password?token=…`
 *
 * Landing page of the invitation email sent when a student, guardian, teacher or
 * employee is created. Public: the one-time token is the credential, so the page
 * must work without a session and without a school code.
 */
export function SetupPassword() {
  const [searchParams] = useSearchParams()
  const token = (searchParams.get('token') ?? '').trim()

  const [serverError, setServerError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: setupPasswordValidationSchema,
    onSubmit: async (values) => {
      if (!token) {
        return
      }

      setServerError('')

      try {
        await completePasswordSetup({
          token,
          newPassword: values.newPassword,
        })
        setCompleted(true)
      } catch (error) {
        setServerError(resolveSetupError(error))
      }
    },
  })

  // Move focus to the first invalid field so keyboard and screen-reader users
  // hear the error instead of hunting for it.
  useEffect(() => {
    if (formik.submitCount === 0) {
      return
    }

    if (formik.errors.newPassword) {
      document.getElementById('setup-password')?.focus()
    } else if (formik.errors.confirmPassword) {
      document.getElementById('setup-password-confirm')?.focus()
    }
  }, [
    formik.submitCount,
    formik.errors.newPassword,
    formik.errors.confirmPassword,
  ])

  const handlePasswordKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLock(event.getModifierState('CapsLock'))
    }
  }

  if (!token) {
    return <SetupLinkMissing />
  }

  if (!PASSWORD_SETUP_TOKEN_PATTERN.test(token.toLowerCase())) {
    return <SetupLinkInvalid />
  }

  if (completed) {
    return <SetupCompleted />
  }

  return (
    <SetupPage>
      <SetupCard>
        <SetupBrandHeader />
        <SetupKicker>
          <Lock size={13} />
          Secure account setup
        </SetupKicker>
        <SetupTitle>Choose your password</SetupTitle>
        <SetupSub>
          Create the password you will use to sign in to {LOGIN_BRAND.shortName}
          . This link works only once.
        </SetupSub>

        <SetupForm
          noValidate
          aria-busy={formik.isSubmitting}
          onSubmit={formik.handleSubmit}
        >
          {serverError ? (
            <Alert
              severity="error"
              icon={<AlertCircle size={18} />}
              onClose={() => setServerError('')}
              sx={errorAlertSx}
            >
              {serverError}
            </Alert>
          ) : null}

          <FieldGroup>
            <LoginPasswordField
              id="setup-password"
              name="newPassword"
              label="New password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={(event) => {
                formik.handleBlur(event)
                setCapsLock(false)
              }}
              onKeyUp={handlePasswordKeyUp}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              autoFocus
              startIcon={<Lock size={16} />}
              error={
                formik.touched.newPassword
                  ? formik.errors.newPassword
                  : undefined
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

            <LoginPasswordField
              id="setup-password-confirm"
              name="confirmPassword"
              label="Confirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Repeat your password"
              autoComplete="new-password"
              startIcon={<ShieldCheck size={16} />}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined
              }
            />

            <RuleList>
              <RuleItem>At least 8 characters</RuleItem>
              <RuleItem>At least one letter and one number</RuleItem>
            </RuleList>
          </FieldGroup>

          <ButtonComp
            type="submit"
            size="large"
            fullWidth
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            sx={primaryButtonSx}
          >
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {formik.isSubmitting ? 'Saving…' : 'Set my password'}
              {formik.isSubmitting ? null : <ArrowRight size={16} />}
            </span>
          </ButtonComp>
        </SetupForm>

        <SetupFooter>
          <ShieldCheck size={14} />
          <span>Need a new link? Ask your school administrator.</span>
        </SetupFooter>
      </SetupCard>
    </SetupPage>
  )
}
