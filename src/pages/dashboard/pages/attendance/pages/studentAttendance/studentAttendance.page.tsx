import { Box, Card, Stack, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

export function StudentAttendancePage() {
  return (
    <Box>
      <Stack direction={'row'} spacing={2}>
        <Box flex={3}>
          <Card sx={{ p: 2, minHeight: 400 }}>
            <Box mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Student Attendance
              </Typography>
              {/* <Typography variant="body2" mt={1}>
                Update the school&apos;s details to keep records accurate and
                up-to-date.
              </Typography> */}
            </Box>
          </Card>
        </Box>
        <Box flex={1.3}>
          <Card>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateCalendar readOnly />
            </LocalizationProvider>
          </Card>
        </Box>
      </Stack>
    </Box>
  )
}
