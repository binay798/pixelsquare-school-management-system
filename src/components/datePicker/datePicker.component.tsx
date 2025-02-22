import { FormControl, FormLabel } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { PickerValidDate } from '@mui/x-date-pickers'
import { colors } from '@src/helpers/colors.helpers'
import { BsCalendarDate } from 'react-icons/bs'

interface Props extends DatePickerProps<PickerValidDate> {
  labelDetail?: {
    text: string
    required: boolean
  }
}
export function CustomDatePicker(props: Props) {
  return (
    <FormControl fullWidth>
      <FormLabel
        sx={{
          fontSize: 13,
          mb: 1,
          color: colors.grey[800],
        }}
      >
        {props.labelDetail?.text}
      </FormLabel>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        {/* <DatePicker label={'"month" and "year"'} views={['month', 'year']} /> */}
        <DatePicker
          {...props}
          slots={{
            openPickerIcon: BsCalendarDate,
          }}
          slotProps={{
            desktopPaper: {
              style: {
                borderRadius: 18,
                boxShadow:
                  'rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
              },
            },
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 10], // Adjust the second value to control the downward translation
                  },
                },
              ],
            },
          }}
        />
      </LocalizationProvider>
    </FormControl>
  )
}
