import * as Yup from 'yup'

/**
 * Mirrors the backend policy in
 * `backend/src/account/password/password.schema.ts` exactly, so the form never
 * accepts something the API rejects.
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

/** Same shape as the backend token: 32 random bytes as 64 hex characters. */
export const PASSWORD_SETUP_TOKEN_PATTERN = /^[a-f0-9]{64}$/

export const setupPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)
    .matches(/[a-zA-Z]/, 'Include at least one letter')
    .matches(/[0-9]/, 'Include at least one number')
    .required('Choose a password'),
  confirmPassword: Yup.string()
    .required('Confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
})

export default setupPasswordValidationSchema
