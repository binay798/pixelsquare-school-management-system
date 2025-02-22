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

export function ManageSchool() {
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
        <form>
          <FormBlock title="Basic Information">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="School Name"
                  labelDetail={{ text: 'School Name', required: true }}
                />
                <InputField
                  placeholder="Address"
                  labelDetail={{ text: 'Address', required: true }}
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
                  labelDetail={{ text: 'Affiliation', required: false }}
                />
                <InputField
                  placeholder="Established Year"
                  labelDetail={{ text: 'Year', required: false }}
                  type="number"
                />
                <InputField
                  placeholder="Slogan"
                  labelDetail={{ text: 'Slogan', required: false }}
                />
              </Stack>
            </Stack>
          </FormBlock>
          <FormBlock title="Management & Administration">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Principal Name"
                  labelDetail={{ text: 'Principal Name', required: true }}
                />
                <InputField
                  placeholder="Vice Principal Name"
                  labelDetail={{ text: 'Vice Principal Name', required: true }}
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
                    options={[
                      { label: 'Trust', value: 'trust' },
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
                  placeholder="Address"
                  labelDetail={{ text: 'Address', required: true }}
                />
                <InputField
                  placeholder="Phone Number"
                  labelDetail={{ text: 'Phone Number', required: true }}
                  type={'number'}
                />
                <InputField
                  placeholder="Email Address"
                  labelDetail={{ text: 'Email Address', required: true }}
                />
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Website URL"
                  labelDetail={{ text: 'Website URL', required: false }}
                />
                <InputField
                  placeholder="Latitude & Longitude"
                  labelDetail={{ text: 'GPS Coordinates', required: false }}
                />
              </Stack>
            </Stack>
          </FormBlock>

          <FormBlock title="Facilities & Infrastructures">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="School Name"
                  labelDetail={{ text: 'School Name', required: true }}
                />
                <InputField
                  placeholder="Address"
                  labelDetail={{ text: 'Address', required: true }}
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
                  labelDetail={{ text: 'Affiliation', required: false }}
                />
                <InputField
                  placeholder="Established Year"
                  labelDetail={{ text: 'Year', required: false }}
                  type="number"
                />
                <InputField
                  placeholder="Slogan"
                  labelDetail={{ text: 'Slogan', required: false }}
                />
              </Stack>
            </Stack>
          </FormBlock>

          <FormBlock title="Social Links">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="School Name"
                  labelDetail={{ text: 'School Name', required: true }}
                />
                <InputField
                  placeholder="Address"
                  labelDetail={{ text: 'Address', required: true }}
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
                  labelDetail={{ text: 'Affiliation', required: false }}
                />
                <InputField
                  placeholder="Established Year"
                  labelDetail={{ text: 'Year', required: false }}
                  type="number"
                />
                <InputField
                  placeholder="Slogan"
                  labelDetail={{ text: 'Slogan', required: false }}
                />
              </Stack>
            </Stack>
          </FormBlock>

          <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            <ButtonComp size="medium">Update</ButtonComp>
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
