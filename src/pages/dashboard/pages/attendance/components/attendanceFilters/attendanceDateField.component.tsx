import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { PickerValidDate } from '@mui/x-date-pickers'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import moment from 'moment'
import { colors } from '@src/helpers/colors.helpers'
import { isToday, shiftDay } from '../../attendance.helpers'
import { AttendanceFieldLabel } from '../attendanceFilters/attendanceFilters.component'

interface Props {
  /** `YYYY-MM-DD` */
  date: string
  onChange: (date: string) => void
  disabled?: boolean
  label?: string
}

/** Kept separate so the picker keeps the props type of the shared component. */
function DayPicker(props: DatePickerProps<PickerValidDate>) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker {...props} />
    </LocalizationProvider>
  )
}

const navBtnSx = {
  width: 34,
  height: 34,
  borderRadius: 2,
  border: `1px solid ${colors.grey[200]}`,
  bgcolor: '#fff',
}

/**
 * Day of the sheet with a previous / next shortcut: marking a sheet is always
 * done relative to the current day, a raw calendar picker makes that slow.
 */
export function AttendanceDateField({
  date,
  onChange,
  disabled = false,
  label = 'Attendance date',
}: Props) {
  const today = isToday(date)
  const selected = moment(date)

  return (
    <Box>
      <AttendanceFieldLabel>{label}</AttendanceFieldLabel>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Tooltip title="Previous day">
          <span>
            <IconButton
              size="small"
              sx={navBtnSx}
              disabled={disabled}
              aria-label="Previous day"
              onClick={() => onChange(shiftDay(date, -1))}
            >
              <ChevronLeft size={15} color={colors.grey[700]} />
            </IconButton>
          </span>
        </Tooltip>

        <Box flex={1} minWidth={0}>
          <DayPicker
            value={selected}
            format="DD MMM YYYY"
            maxDate={moment()}
            disabled={disabled}
            onChange={(value) => {
              if (value && moment(value).isValid()) {
                onChange(moment(value).format('YYYY-MM-DD'))
              }
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    fontSize: 13,
                    borderRadius: 2,
                    bgcolor: '#fff',
                  },
                },
              },
            }}
          />
        </Box>

        <Tooltip title="Next day">
          <span>
            <IconButton
              size="small"
              sx={navBtnSx}
              disabled={disabled || today}
              aria-label="Next day"
              onClick={() => onChange(shiftDay(date, 1))}
            >
              <ChevronRight size={15} color={colors.grey[700]} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  )
}
