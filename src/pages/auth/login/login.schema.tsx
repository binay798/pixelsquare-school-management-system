import * as Yup from 'yup'

/** Same shape as the backend `SCHOOL_CODE_REGEX`: three letters + serial. */
export const SCHOOL_CODE_PATTERN = /^[A-Z]{3}\d{2,3}$/

/**
 * Accepts what people actually type: `bks-01`, `BKS 01` and `bks01` all become
 * `BKS01`. The backend normalises again before the indexed lookup.
 */
export const normalizeSchoolCode = (value: string) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

export const loginValidationSchema = Yup.object({
  schoolCode: Yup.string()
    .required('Your school code is required')
    .transform((value) => normalizeSchoolCode(value ?? ''))
    .matches(
      SCHOOL_CODE_PATTERN,
      'Enter the code your school gave you, for example BKS01'
    ),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Your email address is required'),
  password: Yup.string()
    .min(3, 'Password must be at least 3 characters')
    .required('Your password is required'),
})

export default loginValidationSchema
