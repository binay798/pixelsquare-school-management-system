import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { useFormik } from 'formik'
import moment from 'moment'
import { FaUser } from 'react-icons/fa'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
} from '@src/constants/profile.constants'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getProfileAction,
  updateProfileAction,
} from '@src/store/redux/dashboard/account/profile/profile.slice'
import {
  buildProfilePayload,
  IProfileDetailsValues,
  PROFILE_DETAILS_SCHEMA,
} from './profileDetailsForm.schema'

/**
 * Helper which reads a detail of the stored profile as a form value.
 *
 * The columns of `user_profiles` are nullable, so every detail can be `null`.
 */
const fromProfile = (
  profile: User.IUserProfile | null,
  key: keyof IProfileDetailsValues
) => (profile?.[key] as string | null | undefined) ?? ''

/**
 * Profile details section of the account page.
 *
 * The section reads its details from `GET /api/account/profile` and saves them
 * with `PATCH /api/account/profile`; the API writes them for the logged in user
 * only. A body of the form never carries an identifier, the server takes the
 * user from the access token.
 */
export function ProfileDetailsForm() {
  const dispatch = useDispatch()
  const { data: profile, loading: detailsLoading } = useSelector(
    (store) => store.accountProfile.details
  )
  const { loading: updateLoading } = useSelector(
    (store) => store.accountProfile.updateProfile
  )

  useEffect(() => {
    dispatch(getProfileAction({}))
  }, [dispatch])

  const formik = useFormik({
    initialValues: {
      firstname: fromProfile(profile, 'firstname'),
      middlename: fromProfile(profile, 'middlename'),
      lastname: fromProfile(profile, 'lastname'),
      mobile: fromProfile(profile, 'mobile'),
      temporary_address: fromProfile(profile, 'temporary_address'),
      permanent_address: fromProfile(profile, 'permanent_address'),
      religion: fromProfile(profile, 'religion'),
      blood_group: fromProfile(profile, 'blood_group'),
      date_of_birth: fromProfile(profile, 'date_of_birth'),
      gender: fromProfile(profile, 'gender'),
      nationality: fromProfile(profile, 'nationality'),
    },
    onSubmit: (values) => {
      dispatch(
        updateProfileAction({
          payload: buildProfilePayload(values),
        })
      )
    },
    validationSchema: PROFILE_DETAILS_SCHEMA,
    enableReinitialize: true,
  })

  const fieldState = (field: keyof IProfileDetailsValues) => ({
    error: formik.touched[field] && Boolean(formik.errors[field]),
    helperText: formik.touched[field] ? formik.errors[field] : undefined,
  })

  const selectedGender = GENDER_OPTIONS.find(
    (option) => option.value === formik.values.gender
  )
  const selectedBloodGroup = BLOOD_GROUP_OPTIONS.find(
    (option) => option.value === formik.values.blood_group
  )
  const dateOfBirth = moment(formik.values.date_of_birth, 'YYYY-MM-DD', true)

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} mb={2.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.blue[50],
            color: 'primary.main',
          }}
        >
          <FaUser size={18} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Profile Details
          </Typography>
          <Typography variant="body2">
            Keep your personal information and contact details up to date.
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {detailsLoading ? (
        <Box display={'flex'} justifyContent={'center'} py={6}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            formik.handleSubmit()
          }}
        >
          {!profile ? (
            <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
              Your account has no profile details yet. Fill in the form and save
              to create them.
            </Alert>
          ) : null}

          <FormBlock title="Personal information">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <InputField
                  placeholder="First name"
                  labelDetail={{ required: true, text: 'First name' }}
                  name="firstname"
                  value={formik.values.firstname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('firstname')}
                />
                <InputField
                  placeholder="Middle name"
                  labelDetail={{ required: false, text: 'Middle name' }}
                  name="middlename"
                  value={formik.values.middlename}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('middlename')}
                />
                <InputField
                  placeholder="Last name"
                  labelDetail={{ required: true, text: 'Last name' }}
                  name="lastname"
                  value={formik.values.lastname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('lastname')}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <InputField
                  placeholder="Phone no."
                  labelDetail={{ required: true, text: 'Mobile number' }}
                  name="mobile"
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('mobile')}
                />
                <CustomDatePicker
                  labelDetail={{ required: false, text: 'Date of birth' }}
                  name="date_of_birth"
                  maxDate={moment()}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'date_of_birth',
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : ''
                    )
                  }}
                  textFieldProps={{
                    value: dateOfBirth.isValid() ? dateOfBirth : null,
                    onBlur: formik.handleBlur,
                    ...fieldState('date_of_birth'),
                  }}
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                  >
                    Gender
                  </FormLabel>
                  <SelectField
                    placeholder="Select gender"
                    options={GENDER_OPTIONS}
                    value={selectedGender ?? null}
                    onChange={(option) => {
                      formik.setFieldValue(
                        'gender',
                        (option as { value: string } | null)?.value ?? ''
                      )
                    }}
                    onBlur={() => formik.setFieldTouched('gender', true)}
                  />
                  <FormHelperText error={fieldState('gender').error}>
                    {formik.touched.gender ? formik.errors.gender : ''}
                  </FormHelperText>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <FormLabel
                    sx={{ fontSize: 13, mb: 1, color: colors.grey[800] }}
                  >
                    Blood group
                  </FormLabel>
                  <SelectField
                    isClearable
                    placeholder="Select blood group"
                    options={BLOOD_GROUP_OPTIONS}
                    value={selectedBloodGroup ?? null}
                    onChange={(option) => {
                      formik.setFieldValue(
                        'blood_group',
                        (option as { value: string } | null)?.value ?? ''
                      )
                    }}
                    onBlur={() => formik.setFieldTouched('blood_group', true)}
                  />
                  <FormHelperText error={fieldState('blood_group').error}>
                    {formik.touched.blood_group
                      ? formik.errors.blood_group
                      : ''}
                  </FormHelperText>
                </FormControl>
                <InputField
                  placeholder="Religion"
                  labelDetail={{ required: false, text: 'Religion' }}
                  name="religion"
                  value={formik.values.religion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('religion')}
                />
                <InputField
                  placeholder="Nationality"
                  labelDetail={{ required: false, text: 'Nationality' }}
                  name="nationality"
                  value={formik.values.nationality}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('nationality')}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextareaField
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Temporary address"
                  labelDetail={{ required: false, text: 'Temporary address' }}
                  name="temporary_address"
                  value={formik.values.temporary_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('temporary_address')}
                />
                <TextareaField
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Permanent address"
                  labelDetail={{ required: false, text: 'Permanent address' }}
                  name="permanent_address"
                  value={formik.values.permanent_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...fieldState('permanent_address')}
                />
              </Stack>
            </Stack>
          </FormBlock>

          <Stack
            direction={'row'}
            spacing={2}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <ButtonComp
              variant="text"
              size="medium"
              disabled={updateLoading}
              onClick={() => formik.resetForm()}
            >
              Reset
            </ButtonComp>
            <ButtonComp type="submit" size="medium" loading={updateLoading}>
              Save details
            </ButtonComp>
          </Stack>
        </form>
      )}
    </Card>
  )
}
