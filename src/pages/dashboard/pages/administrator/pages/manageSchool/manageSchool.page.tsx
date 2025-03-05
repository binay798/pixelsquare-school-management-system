import {
  Box,
  Card,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useFormik } from 'formik'
import { manageSchoolDetailValidationSchema } from './manageSchool.validators'
import { omit, capitalize } from 'lodash'
import { updateSchoolDetailsSlice } from '@src/store/redux/dashboard/manageSchool/manageSchool.slice'

export function ManageSchool() {
  const { schoolDetail: school, updateSchoolDetail } = useSelector(
    (store) => store.manageSchool
  )
  const dispatch = useDispatch()
  const formik = useFormik({
    initialValues: omit(school.data, ['created_at', 'updated_at', 'id']),
    onSubmit: (values) => {
      dispatch(
        updateSchoolDetailsSlice({
          data: {
            ...values,
            phone: String(values.phone),
            // @ts-ignore
            established_year: Number(values.established_year),
            // @ts-ignore
            number_of_classrooms: Number(values.number_of_classrooms),
          },
          onSuccess: () => {
            formik.resetForm({ values })
          },
        })
      )
    },
    validationSchema: manageSchoolDetailValidationSchema,
    enableReinitialize: true,
  })

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Manage School
        </Typography>
        <Typography variant="body2" mt={1}>
          Update the school&apos;s details to keep records accurate and
          up-to-date.
        </Typography>
      </Box>

      <Card sx={{ p: 2, minHeight: '80vh' }}>
        <form onSubmit={formik.handleSubmit}>
          <FormBlock title="Basic Information">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="School Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  name="name"
                  labelDetail={{ text: 'School Name', required: true }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    formik.touched.name ? formik.errors.name : undefined
                  }
                />
                <InputField
                  placeholder="Address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  name="address"
                  labelDetail={{ text: 'Address', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={
                    formik.touched.address ? formik.errors.address : undefined
                  }
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    School Type
                  </FormLabel>
                  <SelectField
                    onChange={(e) => {
                      formik.setFieldValue(
                        'school_type',
                        (e as { value: string }).value
                      )
                    }}
                    // defaultValue={formik.values.school_type}

                    value={{
                      label: capitalize(formik.values.school_type),
                      value: formik.values.school_type,
                    }}
                    name="school_type"
                    placeholder="Select school type"
                    options={[
                      { label: 'Public', value: 'public' },
                      { label: 'Private', value: 'private' },
                      { label: 'Government', value: 'government' },
                    ]}
                  />
                </FormControl>
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="School Affiliation"
                  value={formik.values.affiliation}
                  onChange={formik.handleChange}
                  name="affiliation"
                  labelDetail={{ text: 'Affiliation', required: false }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.affiliation &&
                    Boolean(formik.errors.affiliation)
                  }
                  helperText={
                    formik.touched.affiliation
                      ? formik.errors.affiliation
                      : undefined
                  }
                />
                <InputField
                  placeholder="Established Year"
                  value={formik.values.established_year}
                  onChange={formik.handleChange}
                  name="established_year"
                  labelDetail={{ text: 'Year', required: false }}
                  type="number"
                  // @ts-ignore
                  step={'1'}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.established_year &&
                    Boolean(formik.errors.established_year)
                  }
                  helperText={
                    formik.touched.established_year
                      ? formik.errors.established_year
                      : undefined
                  }
                />
                <InputField
                  placeholder="Slogan"
                  value={formik.values.slogan}
                  onChange={formik.handleChange}
                  name="slogan"
                  labelDetail={{ text: 'Slogan', required: false }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.slogan && Boolean(formik.errors.slogan)}
                  helperText={
                    formik.touched.slogan ? formik.errors.slogan : undefined
                  }
                />
              </Stack>
            </Stack>
          </FormBlock>
          <FormBlock title="Management & Administration">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Principal Name"
                  value={formik.values.principal_name}
                  onChange={formik.handleChange}
                  name="principal_name"
                  labelDetail={{ text: 'Principal Name', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.principal_name &&
                    Boolean(formik.errors.principal_name)
                  }
                  helperText={
                    formik.touched.principal_name
                      ? formik.errors.principal_name
                      : undefined
                  }
                />
                <InputField
                  placeholder="Vice Principal Name"
                  value={formik.values.vice_principal_name}
                  onChange={formik.handleChange}
                  name="vice_principal_name"
                  labelDetail={{ text: 'Vice Principal Name', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.vice_principal_name &&
                    Boolean(formik.errors.vice_principal_name)
                  }
                  helperText={
                    formik.touched.vice_principal_name
                      ? formik.errors.vice_principal_name
                      : undefined
                  }
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    School Ownership
                  </FormLabel>
                  <SelectField
                    placeholder="Select school type"
                    onChange={(e) => {
                      formik.setFieldValue(
                        'school_ownership',
                        (e as { value: string }).value
                      )
                    }}
                    // defaultValue={formik.values.school_type}

                    value={{
                      label: capitalize(formik.values.school_ownership),
                      value: formik.values.school_ownership,
                    }}
                    options={[
                      { label: 'Private', value: 'private' },
                      { label: 'Society', value: 'society' },
                      { label: 'Government', value: 'government' },
                    ]}
                  />
                </FormControl>
              </Stack>
            </Stack>
          </FormBlock>
          <FormBlock title="Location & Contact Details">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  name="phone"
                  labelDetail={{ text: 'Phone Number', required: true }}
                  type={'number'}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={
                    formik.touched.phone ? formik.errors.phone : undefined
                  }
                />
                <InputField
                  placeholder="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  name="email"
                  labelDetail={{ text: 'Email Address', required: true }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    formik.touched.email ? formik.errors.email : undefined
                  }
                />
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Website URL"
                  value={formik.values.website_url}
                  onChange={formik.handleChange}
                  name="website_url"
                  labelDetail={{ text: 'Website URL', required: false }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.website_url &&
                    Boolean(formik.errors.website_url)
                  }
                  helperText={
                    formik.touched.website_url
                      ? formik.errors.website_url
                      : undefined
                  }
                />
                <InputField
                  placeholder="Latitude & Longitude"
                  value={formik.values.gps_coordinate}
                  onChange={formik.handleChange}
                  name="gps_coordinate"
                  labelDetail={{ text: 'GPS Coordinates', required: false }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.gps_coordinate &&
                    Boolean(formik.errors.gps_coordinate)
                  }
                  helperText={
                    formik.touched.gps_coordinate
                      ? formik.errors.gps_coordinate
                      : undefined
                  }
                />
              </Stack>
            </Stack>
          </FormBlock>

          <FormBlock title="Facilities & Infrastructures">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <InputField
                  placeholder="No. of classrooms"
                  type="number"
                  value={formik.values.number_of_classrooms}
                  onChange={formik.handleChange}
                  name="number_of_classrooms"
                  labelDetail={{ text: 'No. of classrooms', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.number_of_classrooms &&
                    Boolean(formik.errors.number_of_classrooms)
                  }
                  helperText={
                    formik.touched.number_of_classrooms
                      ? formik.errors.number_of_classrooms
                      : undefined
                  }
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Library Availability
                  </FormLabel>
                  <SelectField
                    placeholder="Library Availability"
                    onChange={(e) => {
                      formik.setFieldValue(
                        'library_availability',
                        (e as { value: string }).value
                      )
                    }}
                    value={{
                      label: formik.values.library_availability
                        ? 'Available'
                        : 'Not Available',
                      value: formik.values.library_availability,
                    }}
                    options={[
                      { label: 'Available', value: true },
                      { label: 'Not Available', value: false },
                    ]}
                  />
                </FormControl>

                <InputField
                  placeholder="Laboratories"
                  value={formik.values.laboratories}
                  onChange={formik.handleChange}
                  name="laboratories"
                  labelDetail={{ text: 'Laboratories', required: false }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.laboratories &&
                    Boolean(formik.errors.laboratories)
                  }
                  helperText={
                    formik.touched.laboratories
                      ? formik.errors.laboratories
                      : undefined
                  }
                />
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Playground Availability
                  </FormLabel>
                  <SelectField
                    placeholder="Playground Availability"
                    onChange={(e) => {
                      formik.setFieldValue(
                        'playground_availability',
                        (e as { value: string }).value
                      )
                    }}
                    // defaultValue={formik.values.school_type}

                    value={{
                      label: formik.values.playground_availability
                        ? 'Available'
                        : 'Not Available',
                      value: formik.values.playground_availability,
                    }}
                    options={[
                      { label: 'Available', value: true },
                      { label: 'Not Available', value: false },
                    ]}
                  />
                </FormControl>
                <InputField
                  placeholder="Sports Facilities"
                  value={formik.values.sports_facilities}
                  onChange={formik.handleChange}
                  name="sports_facilities"
                  labelDetail={{ text: 'Sports Facilities', required: false }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.sports_facilities &&
                    Boolean(formik.errors.sports_facilities)
                  }
                  helperText={
                    formik.touched.sports_facilities
                      ? formik.errors.sports_facilities
                      : undefined
                  }
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Transportation Services
                  </FormLabel>
                  <SelectField
                    placeholder="Transportation Services"
                    onChange={(e) => {
                      formik.setFieldValue(
                        'transportation_services',
                        (e as { value: string }).value
                      )
                    }}
                    // defaultValue={formik.values.school_type}

                    value={{
                      label: formik.values.transportation_services,

                      value: formik.values.transportation_services,
                    }}
                    options={[
                      { label: 'Available', value: 'Available' },
                      { label: 'Not Available', value: 'Not Available' },
                    ]}
                  />
                </FormControl>
              </Stack>
            </Stack>
          </FormBlock>

          <FormBlock title="Social Links">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Facebook"
                  value={formik.values.facebook_link}
                  onChange={formik.handleChange}
                  name="facebook_link"
                  labelDetail={{ text: 'Facebook URL', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.facebook_link &&
                    Boolean(formik.errors.facebook_link)
                  }
                  helperText={
                    formik.touched.facebook_link
                      ? formik.errors.facebook_link
                      : undefined
                  }
                />
                <InputField
                  placeholder="LinkedIn"
                  value={formik.values.linkedin_link}
                  onChange={formik.handleChange}
                  name="linkedin_link"
                  labelDetail={{ text: 'LinkedIn URL', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.linkedin_link &&
                    Boolean(formik.errors.linkedin_link)
                  }
                  helperText={
                    formik.touched.linkedin_link
                      ? formik.errors.linkedin_link
                      : undefined
                  }
                />
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Instagram"
                  value={formik.values.instagram_link}
                  onChange={formik.handleChange}
                  name="instagram_link"
                  labelDetail={{ text: 'Instagram URL', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.instagram_link &&
                    Boolean(formik.errors.instagram_link)
                  }
                  helperText={
                    formik.touched.instagram_link
                      ? formik.errors.instagram_link
                      : undefined
                  }
                />
                <InputField
                  placeholder="Twitter"
                  value={formik.values.twitter_link}
                  onChange={formik.handleChange}
                  name="twitter_link"
                  labelDetail={{ text: 'Twitter URL', required: true }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.twitter_link &&
                    Boolean(formik.errors.twitter_link)
                  }
                  helperText={
                    formik.touched.twitter_link
                      ? formik.errors.twitter_link
                      : undefined
                  }
                />
              </Stack>
            </Stack>
          </FormBlock>

          <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={updateSchoolDetail.loading}
              disabled={updateSchoolDetail.loading || !formik.dirty}
              type="submit"
              size="medium"
            >
              Update
            </ButtonComp>
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
