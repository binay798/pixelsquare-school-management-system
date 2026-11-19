import { Box, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BookOpenCheck } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  CHART_COLORS,
  formatMonth,
  formatNumber,
  formatPercent,
} from '../dashboard.helpers'
import {
  DashboardEmptyState,
  DashboardPanel,
  SectionHeading,
  WidgetError,
  WidgetSkeleton,
} from './dashboardPrimitives.component'
import {
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  DashboardChartTooltip,
} from './dashboardChartTooltip.component'

interface Props {
  academics: Dashboard.IWidget<Dashboard.IAcademics>
  onRetry: () => void
}

const PANEL_HEIGHT = 212

/** Academic overview: enrolment, class distribution, attendance, performance. */
export function DashboardAcademicsSection({ academics, onRetry }: Props) {
  const data = academics.data

  const enrolmentSeries = useMemo(() => {
    let running = 0

    return (data?.enrolment.monthly ?? []).map((row) => {
      running += row.students

      return {
        month: formatMonth(row.month),
        admissions: row.students,
        cumulative: running,
      }
    })
  }, [data?.enrolment.monthly])

  const attendanceSeries = useMemo(
    () =>
      (data?.attendance ?? []).map((row) => ({
        date: row.date.slice(5),
        present: row.present,
        absent: row.absent,
        percentage: row.percentage,
      })),
    [data?.attendance]
  )

  const classSeries = useMemo(
    () =>
      (data?.class_distribution ?? [])
        .filter((row) => row.students > 0)
        .sort((a, b) => b.students - a.students)
        .slice(0, 9),
    [data?.class_distribution]
  )

  if (!data && academics.loading) {
    return (
      <Box>
        <SectionHeading
          eyebrow="Academics"
          title="Academic overview"
          subtitle="Enrolment, attendance and class distribution"
        />
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
            },
          }}
        >
          <DashboardPanel>
            <WidgetSkeleton />
          </DashboardPanel>
          <DashboardPanel>
            <WidgetSkeleton />
          </DashboardPanel>
        </Box>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box>
        <SectionHeading
          eyebrow="Academics"
          title="Academic overview"
          subtitle="Enrolment, attendance and class distribution"
        />
        <WidgetError message={academics.error} onRetry={onRetry} />
      </Box>
    )
  }

  return (
    <Box>
      <SectionHeading
        eyebrow="Academics"
        title="Academic overview"
        subtitle="Enrolment, attendance and class distribution for the active session"
        action={
          <Stack direction="row" spacing={1.5}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: 0.5,
                  bgcolor: CHART_COLORS.blue,
                }}
              />
              <Typography fontSize={11} color={colors.grey[600]}>
                New admissions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: 0.5,
                  bgcolor: CHART_COLORS.violet,
                }}
              />
              <Typography fontSize={11} color={colors.grey[600]}>
                Cumulative
              </Typography>
            </Stack>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          },
          mb: 1.5,
        }}
      >
        <DashboardPanel
          title="Student enrolment"
          subtitle={`${formatNumber(
            data.enrolment.total
          )} admissions recorded this session`}
        >
          {enrolmentSeries.length === 0 ? (
            <DashboardEmptyState
              title="No admissions recorded yet"
              description="Enrolment is built from the students registered in the active academic year."
              minHeight={PANEL_HEIGHT - 30}
            />
          ) : (
            <Box sx={{ width: '100%', height: PANEL_HEIGHT }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={enrolmentSeries}
                  margin={{ top: 8, right: 6, bottom: 0, left: -18 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="month" {...CHART_AXIS_PROPS} />
                  <YAxis allowDecimals={false} {...CHART_AXIS_PROPS} />
                  <Tooltip
                    cursor={{ fill: 'rgba(36,99,235,.04)' }}
                    content={<DashboardChartTooltip labelSuffix="admissions" />}
                  />
                  <Bar
                    dataKey="admissions"
                    name="New admissions"
                    fill={CHART_COLORS.blue}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative"
                    stroke={CHART_COLORS.violet}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Class-wise distribution"
          subtitle="Active students per class"
        >
          {classSeries.length === 0 ? (
            <DashboardEmptyState
              title="No class enrolment yet"
              description="Classes of the active academic year appear here as soon as students are enrolled."
              minHeight={PANEL_HEIGHT - 30}
            />
          ) : (
            <Box sx={{ width: '100%', height: PANEL_HEIGHT }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classSeries}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 0, left: 4 }}
                >
                  <CartesianGrid
                    {...CHART_GRID_PROPS}
                    horizontal={false}
                    vertical
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    {...CHART_AXIS_PROPS}
                  />
                  <YAxis
                    type="category"
                    dataKey="class_name"
                    width={64}
                    {...CHART_AXIS_PROPS}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(36,99,235,.04)' }}
                    content={<DashboardChartTooltip labelSuffix="students" />}
                  />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill={CHART_COLORS.sky}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DashboardPanel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          },
        }}
      >
        <DashboardPanel
          title="Attendance trend"
          subtitle="Present and absent students, last 20 school days"
          action={
            attendanceSeries.length > 0 ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: CHART_COLORS.green,
                  }}
                />
                <Typography fontSize={11} color={colors.grey[600]}>
                  {formatPercent(
                    attendanceSeries[attendanceSeries.length - 1]?.percentage
                  )}{' '}
                  latest
                </Typography>
              </Stack>
            ) : null
          }
        >
          {attendanceSeries.length === 0 ? (
            <DashboardEmptyState
              title="No attendance submitted yet"
              description="Daily registers of the active academic year appear here once teachers submit them."
              minHeight={PANEL_HEIGHT - 30}
            />
          ) : (
            <Box sx={{ width: '100%', height: PANEL_HEIGHT }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceSeries}
                  margin={{ top: 8, right: 6, bottom: 0, left: -18 }}
                >
                  <defs>
                    <linearGradient
                      id="presentFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={CHART_COLORS.green}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLORS.green}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <linearGradient id="absentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={CHART_COLORS.red}
                        stopOpacity={0.22}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLORS.red}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                  <YAxis allowDecimals={false} {...CHART_AXIS_PROPS} />
                  <Tooltip
                    content={<DashboardChartTooltip labelSuffix="students" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke={CHART_COLORS.green}
                    strokeWidth={2}
                    fill="url(#presentFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke={CHART_COLORS.red}
                    strokeWidth={2}
                    fill="url(#absentFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Academic performance"
          subtitle="Examinations and results"
        >
          <Stack
            spacing={1.25}
            sx={{
              height: '100%',
              minHeight: PANEL_HEIGHT - 30,
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: colors.deepPurple[50],
                color: colors.deepPurple[600],
              }}
            >
              <BookOpenCheck size={18} />
            </Box>
            <Box>
              <Typography
                fontSize={13}
                fontWeight={700}
                color={colors.grey[800]}
              >
                Examination data is not connected yet
              </Typography>
              <Typography fontSize={12} color={colors.grey[600]} mt={0.35}>
                {data.performance.reason ??
                  'Pass/fail distribution and class-wise performance will appear once the examinations module is published.'}
              </Typography>
            </Box>
            <Stack spacing={0.75}>
              {[
                'Pass / fail distribution',
                'Class-wise results',
                'Subject-wise averages',
              ].map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: colors.grey[400],
                    }}
                  />
                  <Typography fontSize={11.5} color={colors.grey[600]}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </DashboardPanel>
      </Box>
    </Box>
  )
}
