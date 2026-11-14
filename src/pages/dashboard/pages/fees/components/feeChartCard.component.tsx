import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { FeeEmptyState } from './feeEmptyState.component'
import { formatMoney } from '../fees.helpers'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
  height?: number
  loading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
  /** Optional footer legend / totals. */
  legend?: ReactNode
}

/** Chart surface: fixed height, loading skeleton and honest empty state. */
export function FeeChartCard({
  title,
  subtitle,
  action,
  height = 230,
  loading = false,
  isEmpty = false,
  emptyMessage = 'No data for the selected period.',
  children,
  legend,
}: Props) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        p: 1.75,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        mb={1}
      >
        <Box>
          <Typography fontSize={13.5} fontWeight={700} color={colors.grey[900]}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography fontSize={11.5} color={colors.grey[500]} mt={0.2}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>

      <Box sx={{ flex: 1, minHeight: height }}>
        {loading ? (
          <Skeleton variant="rounded" height={height} />
        ) : isEmpty ? (
          <FeeEmptyState title={emptyMessage} minHeight={height - 20} />
        ) : (
          children
        )}
      </Box>

      {legend ? <Box mt={1}>{legend}</Box> : null}
    </Box>
  )
}

interface TooltipEntry {
  name?: string | number
  value?: string | number
  color?: string
  dataKey?: string | number
}

interface TooltipProps {
  active?: boolean
  label?: string | number
  payload?: TooltipEntry[]
  /** `true` when the series is a money series (formatted as currency). */
  money?: boolean
  labelSuffix?: string
}

/** Recharts tooltip with the same money formatting as the rest of the module. */
export function FeeChartTooltip({
  active,
  label,
  payload,
  money = true,
  labelSuffix,
}: TooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

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
      <Typography fontSize={11.5} color={colors.grey[500]} mb={0.4}>
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
            <Typography fontSize={11.5} color={colors.grey[600]}>
              {entry.name}
            </Typography>
          </Stack>
          <Typography fontSize={11.5} fontWeight={700} color={colors.grey[900]}>
            {money ? formatMoney(entry.value) : entry.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

/** Palette used by the charts (consistent with the status colours). */
export const FEE_CHART_COLORS = [
  '#2463eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
  '#14b8a6',
  '#ec4899',
  '#8b5cf6',
]
