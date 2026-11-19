import { Box, Stack, Typography } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import { formatNumber } from '../dashboard.helpers'

interface TooltipEntry {
  name?: string | number
  value?: string | number
  color?: string
  dataKey?: string | number
}

interface Props {
  active?: boolean
  label?: string | number
  payload?: TooltipEntry[]
  /** Defaults to a plain integer formatter. */
  valueFormatter?: (value: string | number | undefined) => string
  labelSuffix?: string
}

/**
 * Shared chart tooltip of the dashboard. The formatter is injected so the same
 * component renders student counts, percentages or money without duplicating
 * markup.
 */
export function DashboardChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
  labelSuffix,
}: Props) {
  if (!active || !payload?.length) {
    return null
  }

  const format =
    valueFormatter ??
    ((value: string | number | undefined) => formatNumber(Number(value ?? 0)))

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: `1px solid ${colors.grey[200]}`,
        borderRadius: 2,
        boxShadow: '0 12px 24px -16px rgba(15,23,42,.45)',
        px: 1.25,
        py: 0.9,
        minWidth: 140,
      }}
    >
      <Typography fontSize={11} color={colors.grey[600]} mb={0.4}>
        {label}
        {labelSuffix ? ` ${labelSuffix}` : ''}
      </Typography>
      {payload.map((entry, index) => (
        <Stack
          key={`${entry.dataKey ?? entry.name}-${index}`}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: 0.5,
                bgcolor: entry.color ?? colors.blue[500],
              }}
            />
            <Typography fontSize={11} color={colors.grey[600]}>
              {entry.name}
            </Typography>
          </Stack>
          <Typography fontSize={11} fontWeight={700} color={colors.grey[900]}>
            {format(entry.value)}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

export const CHART_AXIS_PROPS = {
  tick: { fontSize: 10.5, fill: colors.grey[600] },
  axisLine: false,
  tickLine: false,
} as const

export const CHART_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: colors.grey[100],
  vertical: false,
} as const
