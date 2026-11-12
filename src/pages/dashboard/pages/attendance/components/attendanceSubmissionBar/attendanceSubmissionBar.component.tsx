import { Box, Stack, Typography } from '@mui/material'
import { AlertTriangle, Check, CloudOff, Save } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_STATUS_META,
} from '../../attendance.constants'
import { AttendanceStats } from '../../attendance.types'

interface Props {
  stats: AttendanceStats
  saving: boolean
  canSubmit: boolean
  /** the day is already partially or fully stored */
  hasSavedRecords: boolean
  /** what happens to the people without a status, depends on the day */
  unmarkedHint?: string
  savedAtLabel?: string
  onSave: () => void
  disabled?: boolean
}

function CountPill({
  value,
  label,
  accent,
  soft,
}: {
  value: number
  label: string
  accent: string
  soft: string
}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.4,
        borderRadius: 5,
        bgcolor: soft,
        color: accent,
      }}
    >
      <Box
        component="span"
        sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accent }}
      />
      <Typography
        component="span"
        sx={{ fontSize: 12, fontWeight: 700, color: accent }}
      >
        {value}
      </Typography>
      <Typography
        component="span"
        sx={{ fontSize: 11.5, color: colors.grey[600] }}
      >
        {label}
      </Typography>
    </Box>
  )
}

/**
 * Sticky footer of the sheet: it answers the only two questions left before
 * leaving the screen — is everything saved, and what will the save do.
 */
export function AttendanceSubmissionBar({
  stats,
  saving,
  canSubmit,
  hasSavedRecords,
  unmarkedHint,
  savedAtLabel,
  onSave,
  disabled = false,
}: Props) {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 3,
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        boxShadow: '0 -2px 12px rgba(16, 24, 40, 0.06)',
        px: 1.75,
        py: 1.25,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={1.25}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          flexWrap="wrap"
          rowGap={0.75}
        >
          {ATTENDANCE_STATUS_LIST.map((status) => (
            <CountPill
              key={status}
              value={stats[status]}
              label={ATTENDANCE_STATUS_META[status].label}
              accent={ATTENDANCE_STATUS_META[status].accent}
              soft={ATTENDANCE_STATUS_META[status].soft}
            />
          ))}
          {stats.unmarked > 0 ? (
            <CountPill
              value={stats.unmarked}
              label="not marked"
              accent={colors.grey[600]}
              soft={colors.grey[100]}
            />
          ) : null}
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.25}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {stats.dirty > 0 ? (
              <>
                <AlertTriangle size={13} color={colors.orange[800]} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.orange[800],
                  }}
                >
                  {stats.dirty} unsaved change{stats.dirty > 1 ? 's' : ''}
                </Typography>
              </>
            ) : savedAtLabel ? (
              <>
                <Check size={13} color={colors.green[600]} />
                <Typography sx={{ fontSize: 12, color: colors.grey[600] }}>
                  All changes saved at {savedAtLabel}
                </Typography>
              </>
            ) : (
              <>
                <CloudOff size={13} color={colors.grey[400]} />
                <Typography sx={{ fontSize: 12, color: colors.grey[500] }}>
                  No changes yet
                </Typography>
              </>
            )}
          </Stack>

          <ButtonComp
            size="medium"
            color="secondary"
            startIcon={<Save size={15} />}
            loading={saving}
            disabled={disabled || !canSubmit}
            onClick={onSave}
          >
            {hasSavedRecords ? 'Update attendance' : 'Save attendance'}
          </ButtonComp>
        </Stack>
      </Stack>

      {unmarkedHint ? (
        <Typography sx={{ mt: 0.75, fontSize: 11.5, color: colors.grey[500] }}>
          {unmarkedHint}
        </Typography>
      ) : null}
    </Box>
  )
}
