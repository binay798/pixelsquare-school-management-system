import { isAxiosError } from 'axios'
import { colors } from '@src/helpers/colors.helpers'

const GENERIC_ERROR = 'We could not set your password. Please try again.'
const NETWORK_ERROR =
  'We could not reach the server. Check your connection and try again.'
const INVALID_LINK =
  'This password setup link is invalid or has expired. Please ask your school administrator to send a new one.'

/**
 * Turns a setup failure into copy the person can act on.
 *
 * The backend answers invalid, already-used and expired tokens with the same
 * generic message on purpose, so that message is preferred when it is present.
 */
export function resolveSetupError(error: unknown) {
  if (!isAxiosError(error)) {
    return GENERIC_ERROR
  }

  const status = error.response?.status
  if (!status) {
    return NETWORK_ERROR
  }

  const body = error.response?.data as
    | { data?: { message?: string; data?: unknown } }
    | undefined

  // Validation failures come back as a list of { param, message } entries, while
  // an invalid/expired token is a single human readable message.
  const details = body?.data?.data
  if (Array.isArray(details)) {
    const first = details.find(
      (detail): detail is { message?: string } =>
        typeof (detail as { message?: unknown })?.message === 'string'
    )
    if (first?.message) {
      return first.message
    }
  }

  const message = body?.data?.message
  if (message && message !== 'Bad Request') {
    return message
  }

  return INVALID_LINK
}

/** Shared primary button look of the sign-in / setup screens. */
export const primaryButtonSx = {
  height: 48,
  borderRadius: '12px',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.1px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%)',
  color: '#fff',
  boxShadow: '0 14px 26px -14px rgba(37, 99, 235, 0.85)',
  '&:hover': {
    filter: 'brightness(1.06)',
    transform: 'translateY(-1px)',
    boxShadow: '0 18px 30px -14px rgba(37, 99, 235, 0.9)',
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(135deg, #93b4f8 0%, #7ea3f5 100%)',
    color: 'rgba(255, 255, 255, 0.92)',
  },
}

export const errorAlertSx = {
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
}
