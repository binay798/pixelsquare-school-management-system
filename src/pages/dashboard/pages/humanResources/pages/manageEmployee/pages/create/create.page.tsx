import {
  Box,
  Card,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'

export function CreateEmployeePage() {
  return (
    <Box>
      <Box mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Create Employee
          </Typography>
          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
      </Box>
      <Card sx={{ p: 2 }}>
        <form>
          <FormBlock title="Basic Information">
            <Stack spacing={2}>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Firtname"
                  labelDetail={{ text: 'Firstname', required: true }}
                />
                <InputField
                  placeholder="Middlename"
                  labelDetail={{ text: 'Middlename', required: true }}
                />
                <InputField
                  placeholder="Lastname"
                  labelDetail={{ text: 'Lastname', required: true }}
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="National ID"
                  labelDetail={{ text: 'National ID', required: true }}
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Designation
                  </FormLabel>
                  <SelectField
                    placeholder="Select employee designation"
                    options={[
                      { label: 'Accountant', value: 'Accountant' },
                      { label: 'Receptionist', value: 'Receptionist' },
                      { label: 'Librarian', value: 'librarian' },
                    ]}
                  />
                </FormControl>
                <InputField
                  placeholder="Phone no."
                  labelDetail={{ text: 'Phone no.', required: true }}
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Gender
                  </FormLabel>
                  <SelectField
                    placeholder="Select gender"
                    options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                </FormControl>
                <InputField
                  placeholder="Blood group"
                  labelDetail={{ text: 'Blood Group', required: true }}
                />
                <InputField
                  placeholder="Religion"
                  labelDetail={{ text: 'Religion', required: true }}
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <CustomDatePicker
                  // label={'"month" and "year"'}
                  views={['day', 'month', 'year']}
                  labelDetail={{ text: 'Date of Birth', required: true }}
                />
                <InputField
                  placeholder="Permanent Address"
                  labelDetail={{ text: 'Permanent Address', required: true }}
                />
                <InputField
                  placeholder="Temporary Address"
                  labelDetail={{ text: 'Temporary Address', required: true }}
                />
              </Stack>
            </Stack>
          </FormBlock>
          <FormBlock title="Academic Information">
            <Stack spacing={2}>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Email Address"
                  labelDetail={{ text: 'Email Address', required: true }}
                  type="email"
                />
                <InputField
                  placeholder="Password"
                  labelDetail={{ text: 'Password', required: true }}
                  type="password"
                />
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Role
                  </FormLabel>
                  <SelectField
                    placeholder="Select role"
                    options={[
                      { label: 'Admin', value: 'male' },
                      { label: 'Librarian', value: 'female' },
                      { label: 'Accountant', value: 'other' },
                    ]}
                  />
                </FormControl>
              </Stack>
              <Stack spacing={2} direction="row">
                <CustomDatePicker
                  // label={'"month" and "year"'}
                  views={['day', 'month', 'year']}
                  labelDetail={{ text: 'Date of Birth', required: true }}
                />
                <InputField
                  placeholder="Resume"
                  labelDetail={{ text: 'Resume', required: true }}
                  type="file"
                />
              </Stack>
            </Stack>
          </FormBlock>
          <FormBlock title="Social Information">
            <Stack spacing={2}>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Facebook URL"
                  labelDetail={{ text: 'Facebook', required: false }}
                />
                <InputField
                  placeholder="Linkedin URL"
                  labelDetail={{ text: 'Linkedin', required: false }}
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Instagram URL"
                  labelDetail={{ text: '"Instagram', required: false }}
                />
                <InputField
                  placeholder="Twitter URL"
                  labelDetail={{ text: 'Twitter', required: false }}
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
