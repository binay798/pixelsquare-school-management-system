import * as Yup from 'yup'

/**
 * Mirrors the backend policy of `src/account/password/password.schema.ts`.
 * bcrypt reads at most 72 bytes, so the maximum length is a hard limit.
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const CHANGE_PASSWORD_SCHEMA = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(
      PASSWORD_MIN_LENGTH,
      `Must be at least ${PASSWORD_MIN_LENGTH} characters`
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `Must be at most ${PASSWORD_MAX_LENGTH} characters`
    )
    .matches(/[a-zA-Z]/, 'Must contain at least one letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .notOneOf(
      [Yup.ref('currentPassword')],
      'New password must be different from the current password'
    ),
  confirmNewPassword: Yup.string()
    .required('Please confirm the new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
})
