import {
  Box,
  ButtonBase,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { ReactNode, useState } from 'react'
import {
  AlertTriangle,
  CalendarRange,
  ChevronDown,
  Inbox,
  RotateCw,
} from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  DASHBOARD_RANGES,
  PENDING_PRIORITY_META,
  TDashboardRangeKey,
} from '../dashboard.helpers'

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

interface PanelProps {
  children: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  noPadding?: boolean
  sx?: object
}

/** Bordered surface shared by every block of the dashboard. */
export function DashboardPanel({
  children,
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  sx,
}: PanelProps) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        boxShadow: '0 1px 2px rgba(15,23,42,.03)',
        ...sx,
      }}
    >
      {title || action ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ px: 2, pt: 1.75, pb: noPadding ? 1.25 : 0 }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              <Typography
                fontSize={14}
                fontWeight={700}
                color={colors.grey[900]}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography fontSize={11.5} color={colors.grey[600]} mt={0.25}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action ? (
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexShrink={0}
            >
              {action}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      <Box
        sx={{
          p: noPadding ? 0 : 2,
          pt: noPadding ? 0 : 1.5,
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      {footer ? (
        <Box
          sx={{
            px: 2,
            py: 1.1,
            borderTop: `1px solid ${colors.grey[100]}`,
            bgcolor: '#fff',
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

/** Heading of a group of panels (academic, financial, ...). */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: SectionHeadingProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
      mb={1.5}
    >
      <Box>
        {eyebrow ? (
          <Typography
            fontSize={10.5}
            fontWeight={700}
            letterSpacing={0.8}
            textTransform="uppercase"
            color={colors.grey[600]}
            mb={0.4}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          fontSize={{ xs: 16, md: 17 }}
          fontWeight={700}
          color={colors.grey[900]}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  )
}

/* ------------------------------------------------------------------ *
 * Widget states
 * ------------------------------------------------------------------ */

interface WidgetErrorProps {
  title?: string
  message?: string | null
  onRetry: () => void
  compact?: boolean
}

/** In-place failure of one widget group, with its own retry action. */
export function WidgetError({
  title = 'Could not load this section',
  message,
  onRetry,
  compact = false,
}: WidgetErrorProps) {
  return (
    <Stack
      direction={compact ? 'row' : 'column'}
      spacing={compact ? 1 : 1.25}
      alignItems={compact ? 'center' : 'flex-start'}
      justifyContent={compact ? 'space-between' : 'flex-start'}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${colors.red[100]}`,
        bgcolor: colors.red[50],
        px: 1.75,
        py: 1.5,
        minHeight: compact ? 'auto' : 130,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <AlertTriangle size={16} color={colors.red[600]} />
        <Box>
          <Typography fontSize={12.5} fontWeight={700} color={colors.red[800]}>
            {title}
          </Typography>
          {message ? (
            <Typography fontSize={11.5} color={colors.red[700]} mt={0.2}>
              {message}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      <ButtonBase
        onClick={onRetry}
        sx={{
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          border: `1px solid ${colors.red[200]}`,
          bgcolor: '#fff',
          color: colors.red[700],
          fontSize: 11.5,
          fontWeight: 600,
          display: 'inline-flex',
          gap: 0.5,
          '&:hover': { borderColor: colors.red[400] },
        }}
      >
        <RotateCw size={12} />
        Retry
      </ButtonBase>
    </Stack>
  )
}

interface WidgetSkeletonProps {
  variant?: 'cards' | 'chart' | 'list' | 'text'
  rows?: number
}

/** Lightweight skeleton with the shape of the widget it replaces. */
export function WidgetSkeleton({
  variant = 'chart',
  rows = 5,
}: WidgetSkeletonProps) {
  if (variant === 'cards') {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              p: 1.75,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="rounded" width={30} height={30} />
              <Skeleton width={70} height={16} />
            </Stack>
            <Skeleton width={90} height={34} sx={{ mt: 1.4 }} />
            <Skeleton width={120} height={14} />
          </Box>
        ))}
      </Box>
    )
  }

  if (variant === 'list') {
    return (
      <Stack spacing={1.25}>
        {Array.from({ length: rows }).map((_, index) => (
          <Stack key={index} direction="row" spacing={1.25} alignItems="center">
            <Skeleton variant="circular" width={30} height={30} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="55%" height={15} />
              <Skeleton width="35%" height={12} />
            </Box>
            <Skeleton width={42} height={20} />
          </Stack>
        ))}
      </Stack>
    )
  }

  if (variant === 'text') {
    return (
      <Stack spacing={0.75}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} width={index % 2 ? '70%' : '90%'} height={13} />
        ))}
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 190,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <Skeleton variant="rounded" width="100%" height="85%" />
    </Box>
  )
}

interface EmptyStateProps {
  title: string
  description?: string | null
  icon?: ReactNode
  action?: ReactNode
  minHeight?: number
}

/** Honest empty state: shows why there is nothing instead of placeholder data. */
export function DashboardEmptyState({
  title,
  description,
  icon,
  action,
  minHeight = 150,
}: EmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={0.75}
      sx={{ minHeight, py: 3, px: 2, textAlign: 'center' }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.grey[100],
          color: colors.grey[600],
        }}
      >
        {icon ?? <Inbox size={18} />}
      </Box>
      <Typography fontSize={13} fontWeight={600} color={colors.grey[800]}>
        {title}
      </Typography>
      {description ? (
        <Typography fontSize={12} color={colors.grey[600]} maxWidth={420}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box mt={0.75}>{action}</Box> : null}
    </Stack>
  )
}

/* ------------------------------------------------------------------ *
 * Small controls + pills
 * ------------------------------------------------------------------ */

interface RangePickerProps {
  value: TDashboardRangeKey
  onChange: (key: TDashboardRangeKey) => void
  disabled?: boolean
}

/** Compact date-range selector of the header. */
export function DashboardRangePicker({
  value,
  onChange,
  disabled,
}: RangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const active =
    DASHBOARD_RANGES.find((range) => range.key === value) ?? DASHBOARD_RANGES[0]

  return (
    <>
      <ButtonBase
        disabled={disabled}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Select dashboard date range"
        sx={{
          height: 32,
          px: 1.25,
          borderRadius: 2,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          color: colors.grey[700],
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-flex',
          gap: 0.75,
          whiteSpace: 'nowrap',
          transition: 'border-color .15s ease, background .15s ease',
          '&:hover': {
            borderColor: colors.grey[300],
            bgcolor: colors.grey[50],
          },
        }}
      >
        <CalendarRange size={14} color={colors.grey[600]} />
        {active.label}
        <ChevronDown size={13} color={colors.grey[600]} />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 190, mt: 0.75 } } }}
      >
        {DASHBOARD_RANGES.map((range) => (
          <MenuItem
            key={range.key}
            selected={range.key === value}
            onClick={() => {
              onChange(range.key)
              setAnchorEl(null)
            }}
            sx={{ fontSize: 12.5 }}
          >
            {range.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

interface PriorityPillProps {
  priority: 'high' | 'medium' | 'low'
}

export function PriorityPill({ priority }: PriorityPillProps) {
  const meta = PENDING_PRIORITY_META[priority]

  return (
    <Stack
      component="span"
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        display: 'inline-flex',
        px: 0.85,
        py: 0.2,
        borderRadius: 999,
        border: `1px solid ${meta.border}`,
        bgcolor: meta.bg,
        color: meta.color,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: meta.color }}
      />
      {meta.label}
    </Stack>
  )
}
