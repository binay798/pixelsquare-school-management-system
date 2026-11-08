/**
 * Options of the profile details form of the account page.
 *
 * The gender values mirror `PROFILE_GENDERS` of the backend
 * (`src/account/profile/profile.schema.ts`), so a selected value can never be
 * refused by the API.
 */
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

export const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
].map((bloodGroup) => ({ label: bloodGroup, value: bloodGroup }))

export const PROFILE_NAME_MAX_LENGTH = 100
export const PROFILE_ADDRESS_MAX_LENGTH = 255
export const PROFILE_RELIGION_MAX_LENGTH = 50
export const PROFILE_BLOOD_GROUP_MAX_LENGTH = 10
export const PROFILE_NATIONALITY_MAX_LENGTH = 50
export const PROFILE_MOBILE_MIN_DIGITS = 7
export const PROFILE_MOBILE_MAX_DIGITS = 15
