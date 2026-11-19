import { Box, ButtonBase, Stack, Tooltip, Typography } from '@mui/material'
import { CalendarDays, RotateCw } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  DASHBOARD_ICONS,
  formatLongDate,
  formatRangeLabel,
  formatTimeAgo,
  getGreeting,
  TDashboardRangeKey,
} from '../dashboard.helpers'
import { DashboardRangePicker } from './dashboardPrimitives.component'

interface Props {
  name: string
  schoolName?: string | null
  academicYearName?: string | null
  range: Dashboard.IRange
  rangeKey: TDashboardRangeKey
  onRangeChange: (key: TDashboardRangeKey) => void
  onRefresh: () => void
  refreshing: boolean
  generatedAt?: string | null
}

/**
 * Compact welcome header: greeting, school + academic year context, date,
 * period filter and the refresh action. It deliberately stays one band high so
 * the KPI cards remain above the fold.
 */
export function DashboardHeader({
  name,
  schoolName,
  academicYearName,
  range,
  rangeKey,
  onRangeChange,
  onRefresh,
  refreshing,
  generatedAt,
}: Props) {
  const SchoolIcon = DASHBOARD_ICONS.school

  return (
    <Box sx={{ mb: 2.5, minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 1.75, lg: 2 }}
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ mb: 0.9, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: colors.grey[100],
                color: colors.grey[600],
                flexShrink: 0,
              }}
            >
              <SchoolIcon size={14} />
            </Box>
            <Typography
              fontSize={12}
              fontWeight={600}
              color={colors.grey[600]}
              noWrap
            >
              {schoolName || 'School workspace'}
            </Typography>
            {academicYearName ? (
              <>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    bgcolor: colors.grey[300],
                    flexShrink: 0,
                  }}
                />
                <Typography
                  fontSize={11.5}
                  fontWeight={600}
                  color={colors.blue[700]}
                  bgcolor={colors.blue[50]}
                  px={0.85}
                  py={0.15}
                  borderRadius={999}
                  noWrap
                >
                  {academicYearName}
                </Typography>
              </>
            ) : null}
          </Stack>

          <Typography
            component="h1"
            fontSize={{ xs: 23, md: 27 }}
            fontWeight={700}
            letterSpacing={-0.4}
            lineHeight={1.15}
            color={colors.grey[900]}
          >
            {getGreeting()}, {name}
          </Typography>
          <Typography fontSize={13} color={colors.grey[600]} mt={0.5}>
            Here&apos;s what&apos;s happening at your school today.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          rowGap={1}
          flexWrap="wrap"
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              height: 32,
              px: 1.25,
              borderRadius: 2,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
              color: colors.grey[600],
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            <CalendarDays size={14} color={colors.grey[600]} />
            {formatLongDate()}
          </Stack>

          <DashboardRangePicker
            value={rangeKey}
            onChange={onRangeChange}
            disabled={refreshing}
          />

          <Tooltip
            title={
              generatedAt
                ? `Updated ${formatTimeAgo(generatedAt)}`
                : 'Refresh dashboard'
            }
            placement="top"
          >
            <ButtonBase
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh dashboard data"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
                bgcolor: '#fff',
                color: colors.grey[600],
                display: 'grid',
                placeItems: 'center',
                transition: 'border-color .15s ease, background .15s ease',
                '&:hover': {
                  borderColor: colors.grey[300],
                  bgcolor: colors.grey[50],
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  animation: refreshing
                    ? 'dashSpin 1s linear infinite'
                    : 'none',
                  '@keyframes dashSpin': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <RotateCw size={14} />
              </Box>
            </ButtonBase>
          </Tooltip>
        </Stack>
      </Stack>

      <Typography fontSize={11} color={colors.grey[600]} mt={1}>
        Showing {formatRangeLabel(range)}
      </Typography>
    </Box>
  )
}
