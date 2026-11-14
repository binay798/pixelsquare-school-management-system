import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { colors } from '@src/helpers/colors.helpers'

export interface IFeeStatCardProps {
  label: string
  value: ReactNode
  caption?: string
  icon?: ReactNode
  accent?: string
  soft?: string
  loading?: boolean
  /** Navigates / filters when the card is clicked. */
  onClick?: () => void
  active?: boolean
  tooltip?: string
}

/**
 * KPI card of the fee dashboard. Values always come from the API
 * (`/fees/dashboard`, `/fees/defaulters/aging`, …) — never from the client.
 */
export function FeeStatCard({
  label,
  value,
  caption,
  icon,
  accent = colors.blue[600],
  soft = colors.blue[50],
  loading = false,
  onClick,
  active = false,
  tooltip,
}: IFeeStatCardProps) {
  const card = (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: `1px solid ${active ? accent : colors.grey[200]}`,
        bgcolor: active ? soft : '#fff',
        p: 1.75,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .16s ease',
        boxShadow: active
          ? `0 12px 26px -18px ${accent}`
          : '0 1px 2px rgba(15,23,42,.04)',
        '&:hover': onClick
          ? {
              borderColor: accent,
              transform: 'translateY(-2px)',
              boxShadow: `0 16px 30px -20px ${accent}`,
            }
          : undefined,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: active ? accent : soft,
            color: active ? '#fff' : accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography
          fontSize={12}
          fontWeight={600}
          color={colors.grey[600]}
          noWrap
        >
          {label}
        </Typography>
      </Stack>

      <Box mt={1.25}>
        {loading ? (
          <Skeleton width={90} height={34} />
        ) : (
          <Typography
            fontSize={21}
            fontWeight={700}
            lineHeight={1.15}
            color={colors.grey[900]}
            noWrap
          >
            {value}
          </Typography>
        )}
        {caption ? (
          <Typography fontSize={11.5} color={colors.grey[500]} mt={0.35} noWrap>
            {caption}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )

  return tooltip ? (
    <Tooltip title={tooltip} placement="top">
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  ) : (
    card
  )
}

interface GridProps {
  children: ReactNode
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
}

/** Responsive grid used to lay out the KPI cards. */
export function FeeStatGrid({
  children,
  columns = { xs: 2, sm: 2, md: 3, xl: 4 },
}: GridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: `repeat(${columns.xs ?? 2}, minmax(0, 1fr))`,
          sm: `repeat(${columns.sm ?? 2}, minmax(0, 1fr))`,
          md: `repeat(${columns.md ?? 3}, minmax(0, 1fr))`,
          lg: `repeat(${columns.lg ?? columns.md ?? 3}, minmax(0, 1fr))`,
          xl: `repeat(${columns.xl ?? 4}, minmax(0, 1fr))`,
        },
      }}
    >
      {children}
    </Box>
  )
}
