import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  CHART_COLORS,
  DASHBOARD_ICONS,
  formatCompactMoney,
  formatNumber,
  formatPercent,
} from '../dashboard.helpers'
import { WidgetError, WidgetSkeleton } from './dashboardPrimitives.component'

interface KpiCardProps {
  label: string
  value: string
  caption?: ReactNode
  icon: ReactNode
  accent: string
  soft: string
  href?: string
  /** Small supporting visual: a ring (attendance) or a progress bar (fees). */
  indicator?: ReactNode
  /** Emphasised footer value (e.g. overdue amount). */
  footer?: ReactNode
}

function KpiCard({
  label,
  value,
  caption,
  icon,
  accent,
  soft,
  href,
  indicator,
  footer,
}: KpiCardProps) {
  const navigate = useNavigate()

  return (
    <ButtonBase
      onClick={href ? () => navigate(href) : undefined}
      disabled={!href}
      aria-label={href ? `${label} — open module` : label}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${colors.grey[200]}`,
        bgcolor: '#fff',
        p: 1.75,
        position: 'relative',
        transition:
          'transform .16s ease, border-color .16s ease, box-shadow .16s ease',
        boxShadow: '0 1px 2px rgba(15,23,42,.03)',
        '&:hover': href
          ? {
              borderColor: accent,
              transform: 'translateY(-2px)',
              boxShadow: `0 16px 30px -22px ${accent}`,
            }
          : undefined,
        '&.Mui-disabled': { opacity: 1, color: 'inherit' },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Stack
          direction="row"
          spacing={0.9}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: soft,
              color: accent,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            fontSize={11.5}
            fontWeight={600}
            color={colors.grey[600]}
            noWrap
          >
            {label}
          </Typography>
        </Stack>

        {indicator ?? (
          <Box
            component="span"
            sx={{
              color: colors.grey[300],
              display: 'grid',
              placeItems: 'center',
              mt: 0.2,
            }}
          >
            <ArrowUpRight size={13} />
          </Box>
        )}
      </Stack>

      <Box sx={{ mt: 1.35 }}>
        <Typography
          fontSize={24}
          fontWeight={700}
          lineHeight={1.1}
          letterSpacing={-0.4}
          color={colors.grey[900]}
          noWrap
        >
          {value}
        </Typography>
        {caption ? (
          <Typography fontSize={11.5} color={colors.grey[600]} mt={0.45} noWrap>
            {caption}
          </Typography>
        ) : null}
        {footer ? <Box mt={0.7}>{footer}</Box> : null}
      </Box>
    </ButtonBase>
  )
}

/** Thin progress ring used by the attendance card. */
function AttendanceRing({ percentage }: { percentage: number }) {
  const size = 38
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const safe = Math.min(Math.max(percentage, 0), 100)
  const dash = (safe / 100) * circumference

  return (
    <Box
      sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.grey[100]}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={CHART_COLORS.green}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Typography
        fontSize={9}
        fontWeight={700}
        color={colors.grey[700]}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {Math.round(safe)}%
      </Typography>
    </Box>
  )
}

interface Props {
  summary: Dashboard.IWidget<Dashboard.ISummary>
  finance: Dashboard.IWidget<Dashboard.IFinance>
  onRetrySummary: () => void
}

const gridSx = {
  display: 'grid',
  gap: 1.5,
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    lg: 'repeat(3, minmax(0, 1fr))',
    xl: 'repeat(6, minmax(0, 1fr))',
  },
}

/**
 * Six operational KPIs. Students / attendance / staff come from
 * `/dashboard/summary`, the two money cards from `/dashboard/finance`, so a
 * failing finance query never hides the academic counters.
 */
export function DashboardKpiGrid({ summary, finance, onRetrySummary }: Props) {
  if (!summary.data && summary.loading) {
    return <WidgetSkeleton variant="cards" />
  }

  if (!summary.data) {
    return <WidgetError message={summary.error} onRetry={onRetrySummary} />
  }

  const kpis = summary.data.kpis
  const feeState = finance.data?.fees ?? null
  const financeLoading = finance.loading && !finance.data
  const financeFailed = Boolean(finance.error && !finance.data)
  const financeUnavailable = financeLoading || financeFailed
  const financeNote = financeLoading
    ? 'Loading finance data…'
    : 'Finance data unavailable'

  return (
    <Box sx={gridSx}>
      <KpiCard
        label="Total students"
        value={formatNumber(kpis.students.active)}
        caption={
          kpis.students.total !== kpis.students.active
            ? `${formatNumber(kpis.students.total)} on roll · ${formatNumber(
                kpis.students.active
              )} active`
            : `${formatNumber(kpis.students.total)} enrolled this year`
        }
        icon={<DASHBOARD_ICONS.students size={15} />}
        accent={CHART_COLORS.blue}
        soft={colors.blue[50]}
        href="/dashboard/manage-students/students-list"
        footer={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: CHART_COLORS.green,
              }}
            />
            <Typography fontSize={11} color={colors.grey[600]} noWrap>
              {formatNumber(kpis.students.new_in_range)} new in this period
            </Typography>
          </Stack>
        }
      />

      <KpiCard
        label="Today's attendance"
        value={formatPercent(kpis.attendance.percentage)}
        caption={`${formatNumber(
          kpis.attendance.present
        )} present · ${formatNumber(kpis.attendance.absent)} absent`}
        icon={<DASHBOARD_ICONS.attendance size={15} />}
        accent={CHART_COLORS.green}
        soft={colors.green[50]}
        href="/dashboard/attendance/student"
        indicator={<AttendanceRing percentage={kpis.attendance.percentage} />}
        footer={
          <Typography fontSize={11} color={colors.grey[600]} noWrap>
            {kpis.attendance.not_marked > 0
              ? `${formatNumber(
                  kpis.attendance.not_marked
                )} students not marked yet`
              : `${formatNumber(kpis.attendance.marked)} records submitted`}
          </Typography>
        }
      />

      <KpiCard
        label="Teaching staff"
        value={formatNumber(kpis.teachers.total)}
        caption="Active teachers on record"
        icon={<DASHBOARD_ICONS.teachers size={15} />}
        accent={CHART_COLORS.violet}
        soft={colors.deepPurple[50]}
        href="/dashboard/teachers"
        footer={
          <Typography fontSize={11} color={colors.grey[600]} noWrap>
            Across all academic departments
          </Typography>
        }
      />

      <KpiCard
        label="Fee collection"
        value={
          financeUnavailable ? '—' : formatCompactMoney(feeState?.collected)
        }
        caption={
          financeUnavailable
            ? financeNote
            : `${formatNumber(feeState?.payment_count)} payments received`
        }
        icon={<DASHBOARD_ICONS.collected size={15} />}
        accent={CHART_COLORS.teal}
        soft={colors.teal[50]}
        href="/dashboard/fees"
        footer={
          financeUnavailable ? null : (
            <Typography fontSize={11} color={colors.grey[600]} noWrap>
              {formatNumber(feeState?.invoice_count)} invoices ·{' '}
              {formatNumber(feeState?.payment_count)} payments
            </Typography>
          )
        }
      />

      <KpiCard
        label="Outstanding fees"
        value={
          financeUnavailable ? '—' : formatCompactMoney(feeState?.outstanding)
        }
        caption={financeUnavailable ? financeNote : 'Open receivables'}
        icon={<DASHBOARD_ICONS.outstanding size={15} />}
        accent={CHART_COLORS.amber}
        soft={colors.amber[50]}
        href="/dashboard/fees/defaulters"
        footer={
          financeFailed || financeLoading ? null : (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: CHART_COLORS.red,
                }}
              />
              <Typography fontSize={11} color={colors.red[700]} noWrap>
                {formatCompactMoney(feeState?.overdue)} overdue
              </Typography>
            </Stack>
          )
        }
      />

      <KpiCard
        label="Total employees"
        value={formatNumber(kpis.employees.total)}
        caption="Active staff across departments"
        icon={<DASHBOARD_ICONS.employees size={15} />}
        accent={CHART_COLORS.sky}
        soft={colors.lightBlue[50]}
        href="/dashboard/human-resources/manage-employee"
        footer={
          <Typography fontSize={11} color={colors.grey[600]} noWrap>
            Includes {formatNumber(kpis.teachers.total)} teaching staff
          </Typography>
        }
      />
    </Box>
  )
}
