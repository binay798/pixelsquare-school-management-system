import { useState } from 'react'
import { Box, Collapse, LinearProgress, Stack, Typography } from '@mui/material'
import { ChevronDown, ChevronUp, Download, FileText } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_STATUS_META,
} from '../../attendance.constants'
import {
  downloadAttendanceCsv,
  formatAttendanceDay,
} from '../../attendance.helpers'
import { AttendanceSheetRow, AttendanceStats } from '../../attendance.types'

interface Props {
  rows: AttendanceSheetRow[]
  stats: AttendanceStats
  date: string
  savedAtLabel?: string
  loading?: boolean
  disabled?: boolean
}

/**
 * Report of the day. The attendance API has no history endpoint, the report is
 * therefore the sheet of the selected day, which is exactly what a teacher or
 * an admin checks before leaving the screen.
 */
export function AttendanceHistory({
  rows,
  stats,
  date,
  savedAtLabel,
  loading = false,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        px: 1.75,
        py: 1.25,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FileText size={15} color={colors.grey[600]} />
          <Typography
            sx={{ fontSize: 13, fontWeight: 600, color: colors.grey[800] }}
          >
            Day report
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey[500] }}>
            {formatAttendanceDay(date)} · {stats.marked}/{stats.total} marked
            {savedAtLabel ? ` · saved at ${savedAtLabel}` : ''}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<Download size={13} />}
            disabled={disabled || loading || rows.length === 0}
            onClick={() => downloadAttendanceCsv(rows, date)}
          >
            Export CSV
          </ButtonComp>
          <ButtonComp
            size="small"
            variant="text"
            startIcon={
              open ? <ChevronUp size={13} /> : <ChevronDown size={13} />
            }
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide' : 'Show'}
          </ButtonComp>
        </Stack>
      </Stack>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {ATTENDANCE_STATUS_LIST.map((status) => {
            const meta = ATTENDANCE_STATUS_META[status]
            const value = stats[status]
            const share =
              stats.total === 0 ? 0 : Math.round((value / stats.total) * 100)

            return (
              <Box key={status}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={0.5}
                >
                  <Typography sx={{ fontSize: 12, color: colors.grey[700] }}>
                    {meta.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.grey[800],
                    }}
                  >
                    {value} · {share}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={share}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: colors.grey[100],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: meta.accent,
                    },
                  }}
                />
              </Box>
            )
          })}

          <Typography sx={{ fontSize: 11.5, color: colors.grey[500], pt: 0.5 }}>
            {stats.unmarked > 0
              ? `${stats.unmarked} people have no status for this day.`
              : 'Everybody has a status for this day.'}
            {stats.dirty > 0
              ? ' The report includes unsaved edits.'
              : ' The export uses the values currently displayed.'}
          </Typography>
        </Stack>
      </Collapse>
    </Box>
  )
}
