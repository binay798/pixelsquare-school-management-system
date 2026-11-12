import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import {
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_STATUS_META,
} from '../../attendance.constants'
import { AttendanceStatus } from '../../attendance.types'

interface Props {
  value?: AttendanceStatus
  onChange: (status: AttendanceStatus) => void
  disabled?: boolean
}

const groupSx = {
  gap: 0.5,
  '& .MuiToggleButtonGroup-grouped': {
    border: `1px solid ${colors.grey[200]} !important`,
    borderRadius: '8px !important',
    ml: '0 !important',
    px: { xs: 0.75, sm: 1.25 },
    minWidth: { xs: 30, sm: 0 },
    height: 30,
    gap: 0.5,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    textTransform: 'none',
    color: colors.grey[600],
    bgcolor: '#fff',
    '&:hover': { bgcolor: colors.grey[50] },
    '&.Mui-disabled': { bgcolor: colors.grey[50] },
  },
}

/**
 * Segmented control of the sheet. The status of a person is a single value out
 * of three, so a dropdown would hide the alternatives behind a click: every
 * choice stays one click away and the colour of the state is visible at rest.
 */
export function AttendanceStatusSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value ?? null}
      disabled={disabled}
      aria-label="Attendance status"
      onChange={(_event, next: AttendanceStatus | null) => {
        if (next) {
          onChange(next)
        }
      }}
      sx={groupSx}
    >
      {ATTENDANCE_STATUS_LIST.map((status) => {
        const meta = ATTENDANCE_STATUS_META[status]
        const Icon = meta.icon
        const selected = value === status

        return (
          <ToggleButton
            key={status}
            value={status}
            aria-label={`Mark as ${meta.label.toLowerCase()}`}
            sx={
              selected
                ? {
                    bgcolor: `${meta.accent} !important`,
                    borderColor: `${meta.accent} !important`,
                    color: '#fff !important',
                    '&:hover': {
                      bgcolor: `${meta.accent} !important`,
                      color: '#fff !important',
                    },
                  }
                : undefined
            }
          >
            <Icon size={13} />
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              {meta.shortLabel}
            </Box>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
