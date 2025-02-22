import { Box, Card, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
export function AcademicYearForm() {
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Create Academic Year
        </Typography>
        <Typography variant="body2" mt={1}>
          Update the school&apos;s details to keep records accurate and
          up-to-date.
        </Typography>
      </Box>
      <Card sx={{ p: 2 }}>
        <FormBlock title="Academic Year Form">
          <Stack spacing={2}>
            <Stack direction={'row'} spacing={2}>
              <InputField
                placeholder="Year"
                labelDetail={{ required: true, text: 'Name' }}
              />
              <CustomDatePicker
                // label={'"month" and "year"'}
                views={['month', 'year']}
                labelDetail={{ text: 'Start session', required: true }}
              />
              <CustomDatePicker
                // label={'"month" and "year"'}
                views={['month', 'year']}
                labelDetail={{ text: 'End session', required: true }}
              />
            </Stack>
            <TextareaField
              multiline={true}
              placeholder="Write some notes..."
              labelDetail={{ text: 'Note', required: false }}
              variant="outlined"
              rows={3}
            />
          </Stack>
        </FormBlock>
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'flex-end'}
          spacing={2}
        >
          <ButtonComp size="medium" variant="text">
            Cancel
          </ButtonComp>
          <ButtonComp size="medium">Submit</ButtonComp>
        </Stack>
      </Card>
    </Box>
  )
}
