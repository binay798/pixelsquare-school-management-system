import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { LucideIcon } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  ATTENDANCE_STATUS_LIST,
  ATTENDANCE_STATUS_META,
  ATTENDANCE_TOTAL_META,
  ATTENDANCE_UNMARKED_META,
} from '../../attendance.constants'
import { AttendanceStats, AttendanceStatusFilter } from '../../attendance.types'

interface Props {
  stats: AttendanceStats
  activeFilter: AttendanceStatusFilter
  /** clicking the active card again goes back to `all` */
  onFilterChange: (filter: AttendanceStatusFilter) => void
  loading?: boolean
}

interface Card {
  key: AttendanceStatusFilter
  label: string
  value: number
  hint: string
  accent: string
  soft: string
  icon: LucideIcon
}

function shareOf(value: number, marked: number) {
  if (marked === 0) {
    return '—'
  }

  return `${Math.round((value / marked) * 100)}% of marked`
}

function buildCards(stats: AttendanceStats): Card[] {
  return [
    {
      key: 'all',
      label: ATTENDANCE_TOTAL_META.label,
      value: stats.total,
      hint: `${stats.marked} marked`,
      accent: ATTENDANCE_TOTAL_META.accent,
      soft: ATTENDANCE_TOTAL_META.soft,
      icon: ATTENDANCE_TOTAL_META.icon,
    },
    ...ATTENDANCE_STATUS_LIST.map((status) => {
      const meta = ATTENDANCE_STATUS_META[status]

      return {
        key: status as AttendanceStatusFilter,
        label: meta.label,
        value: stats[status],
        hint: shareOf(stats[status], stats.marked),
        accent: meta.accent,
        soft: meta.soft,
        icon: meta.icon,
      }
    }),
    {
      key: 'unmarked' as AttendanceStatusFilter,
      label: ATTENDANCE_UNMARKED_META.label,
      value: stats.unmarked,
      hint: stats.unmarked === 0 ? 'sheet complete' : 'needs a status',
      accent: ATTENDANCE_UNMARKED_META.accent,
      soft: ATTENDANCE_UNMARKED_META.soft,
      icon: ATTENDANCE_UNMARKED_META.icon,
    },
  ]
}

const cardSx = (accent: string, soft: string, active: boolean) => ({
  textAlign: 'left' as const,
  font: 'inherit',
  cursor: 'pointer',
  borderRadius: 3,
  p: 1.5,
  border: `1px solid ${active ? accent : colors.grey[200]}`,
  bgcolor: active ? soft : '#fff',
  transition: 'border-color .15s ease, background-color .15s ease',
  '&:hover': { borderColor: accent, bgcolor: soft },
  '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 1 },
})

/**
 * Summary of the day. The cards are also the status filter of the sheet, so the
 * numbers of the day and the rows below always describe the same thing.
 */
export function AttendanceSummary({
  stats,
  activeFilter,
  onFilterChange,
  loading = false,
}: Props) {
  const cards = buildCards(stats)

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
        {cards.map((card) => {
          const active = activeFilter === card.key
          const Icon = card.icon

          return (
            <Box
              key={card.key}
              component="button"
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(active ? 'all' : card.key)}
              sx={cardSx(card.accent, card.soft, active)}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    color: colors.grey[500],
                  }}
                >
                  {card.label}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: card.soft,
                    color: card.accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} />
                </Box>
              </Stack>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: colors.grey[900],
                }}
              >
                {loading ? '—' : card.value}
              </Typography>
              <Typography noWrap sx={{ fontSize: 11, color: colors.grey[500] }}>
                {card.hint}
              </Typography>
            </Box>
          )
        })}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1}
        sx={{
          mt: 1.5,
          px: 1.75,
          py: 1.25,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
        }}
      >
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: colors.grey[700] }}
        >
          Marking progress
        </Typography>
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <LinearProgress
            variant="determinate"
            value={stats.markingProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: colors.grey[100],
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor:
                  stats.markingProgress === 100
                    ? colors.green[600]
                    : colors.blue[500],
              },
            }}
          />
        </Box>
        <Typography
          sx={{ fontSize: 12, color: colors.grey[600], whiteSpace: 'nowrap' }}
        >
          {stats.marked}/{stats.total} marked · {stats.attendanceRate}% present
        </Typography>
      </Stack>
    </Box>
  )
}
