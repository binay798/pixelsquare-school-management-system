import * as Yup from 'yup'
import {
  GENDER_OPTIONS,
  PROFILE_ADDRESS_MAX_LENGTH,
  PROFILE_BLOOD_GROUP_MAX_LENGTH,
  PROFILE_MOBILE_MAX_DIGITS,
  PROFILE_MOBILE_MIN_DIGITS,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NATIONALITY_MAX_LENGTH,
  PROFILE_RELIGION_MAX_LENGTH,
} from '@src/constants/profile.constants'

/** Values of the profile details form, every detail is a plain string. */
export interface IProfileDetailsValues {
  firstname: string
  middlename: string
  lastname: string
  mobile: string
  temporary_address: string
  permanent_address: string
  religion: string
  blood_group: string
  date_of_birth: string
  gender: string
  nationality: string
}

const tooLong = (max: number) => `Must be at most ${max} characters`

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`)

  // `new Date('2026-02-31T00:00:00.000Z')` does not fail, it silently rolls over.
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

/**
 * Mirrors the backend constraints of `src/account/profile/profile.schema.ts`,
 * so a value of the form is never refused by the API.
 *
 * The name, the mobile number and the gender are required because they are the
 * details a profile cannot be created without; everything else is optional.
 */
export const PROFILE_DETAILS_SCHEMA = Yup.object({
  firstname: Yup.string()
    .trim()
    .required('First name is required')
    .max(PROFILE_NAME_MAX_LENGTH, tooLong(PROFILE_NAME_MAX_LENGTH)),
  middlename: Yup.string()
    .trim()
    .max(PROFILE_NAME_MAX_LENGTH, tooLong(PROFILE_NAME_MAX_LENGTH)),
  lastname: Yup.string()
    .trim()
    .required('Last name is required')
    .max(PROFILE_NAME_MAX_LENGTH, tooLong(PROFILE_NAME_MAX_LENGTH)),
  mobile: Yup.string()
    .trim()
    .required('Mobile number is required')
    .matches(
      new RegExp(
        `^[0-9]{${PROFILE_MOBILE_MIN_DIGITS},${PROFILE_MOBILE_MAX_DIGITS}}$`
      ),
      `Must be ${PROFILE_MOBILE_MIN_DIGITS} to ${PROFILE_MOBILE_MAX_DIGITS} digits`
    ),
  temporary_address: Yup.string()
    .trim()
    .max(PROFILE_ADDRESS_MAX_LENGTH, tooLong(PROFILE_ADDRESS_MAX_LENGTH)),
  permanent_address: Yup.string()
    .trim()
    .max(PROFILE_ADDRESS_MAX_LENGTH, tooLong(PROFILE_ADDRESS_MAX_LENGTH)),
  religion: Yup.string()
    .trim()
    .max(PROFILE_RELIGION_MAX_LENGTH, tooLong(PROFILE_RELIGION_MAX_LENGTH)),
  blood_group: Yup.string()
    .trim()
    .max(
      PROFILE_BLOOD_GROUP_MAX_LENGTH,
      tooLong(PROFILE_BLOOD_GROUP_MAX_LENGTH)
    ),
  date_of_birth: Yup.string()
    .trim()
    .test('is-real-date', 'Enter a valid date', (value) =>
      !value ? true : isRealDate(value)
    )
    .test('is-past', 'Date of birth cannot be in the future', (value) =>
      !value ? true : value <= new Date().toISOString().slice(0, 10)
    ),
  gender: Yup.string()
    .trim()
    .required('Gender is required')
    .oneOf(
      GENDER_OPTIONS.map((option) => option.value),
      'Select a gender from the list'
    ),
  nationality: Yup.string()
    .trim()
    .max(
      PROFILE_NATIONALITY_MAX_LENGTH,
      tooLong(PROFILE_NATIONALITY_MAX_LENGTH)
    ),
})

/**
 * Details the API clears (stores as NULL) when an empty value is sent, so
 * emptying one of these inputs really removes the stored detail.
 */
const DETAILS_CLEARED_WHEN_EMPTY: (keyof IProfileDetailsValues)[] = [
  'middlename',
  'religion',
  'blood_group',
]

/**
 * Turns the values of the form into the body of `PATCH /api/account/profile`.
 *
 * The other optional details (addresses, date of birth, nationality) are only
 * validated by the API when they are present, so an empty input is simply left
 * out instead of being sent as an empty string.
 */
export const buildProfilePayload = (
  values: IProfileDetailsValues
): Service.Account.UpdateProfile => {
  const payload: Service.Account.UpdateProfile = {}
  const keys = Object.keys(values) as (keyof IProfileDetailsValues)[]

  keys.forEach((key) => {
    const value = values[key].trim()
    if (value !== '') {
      payload[key] = value
      return
    }
    if (DETAILS_CLEARED_WHEN_EMPTY.includes(key)) {
      payload[key] = ''
    }
  })

  return payload
}
