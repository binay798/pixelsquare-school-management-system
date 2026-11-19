import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  EVENT_META,
  formatCompactMoney,
  formatDate,
  formatDay,
} from '../dashboard.helpers'
import {
  DashboardEmptyState,
  DashboardPanel,
  WidgetError,
  WidgetSkeleton,
} from './dashboardPrimitives.component'

interface Props {
  feed: Dashboard.IWidget<Dashboard.IFeed>
  onRetry: () => void
}

/** Next few school dates (fee deadlines, holidays, notices, pay dates). */
export function DashboardUpcomingEvents({ feed, onRetry }: Props) {
  const navigate = useNavigate()
  const events = feed.data?.events ?? []

  if (!feed.data && feed.loading) {
    return (
      <DashboardPanel title="Upcoming" subtitle="Next dates">
        <WidgetSkeleton variant="list" rows={5} />
      </DashboardPanel>
    )
  }

  if (!feed.data) {
    return (
      <DashboardPanel title="Upcoming" subtitle="Next dates">
        <WidgetError message={feed.error} onRetry={onRetry} />
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      title="Upcoming"
      subtitle="Fee deadlines, holidays, notices and pay dates"
      action={<CalendarDays size={14} color={colors.grey[600]} />}
    >
      {events.length === 0 ? (
        <DashboardEmptyState
          title="Nothing scheduled"
          description="Upcoming fee due dates, holidays and scheduled notices will appear here."
          minHeight={140}
        />
      ) : (
        <Stack spacing={0.5}>
          {events.map((event, index) => {
            const meta = EVENT_META[event.type]
            const Icon = meta.icon
            const date = formatDay(event.date)
            const clickable = Boolean(meta.href)

            return (
              <ButtonBase
                key={`${event.type}-${event.date}-${index}`}
                disabled={!clickable}
                onClick={
                  meta.href ? () => navigate(meta.href as string) : undefined
                }
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  px: 0.75,
                  py: 0.7,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.1,
                  '&:hover': clickable
                    ? { bgcolor: colors.grey[50] }
                    : undefined,
                  '&.Mui-disabled': { opacity: 1, color: 'inherit' },
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 40,
                    borderRadius: 1.75,
                    border: `1px solid ${colors.grey[200]}`,
                    bgcolor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={colors.grey[800]}
                    lineHeight={1}
                  >
                    {date.day}
                  </Typography>
                  <Typography
                    fontSize={8.5}
                    fontWeight={700}
                    letterSpacing={0.5}
                    color={colors.grey[600]}
                    mt={0.2}
                  >
                    {date.month}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Icon size={11} color={meta.accent} />
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      color={colors.grey[800]}
                      noWrap
                    >
                      {event.title}
                    </Typography>
                  </Stack>
                  <Typography fontSize={10.5} color={colors.grey[600]} noWrap>
                    {event.subtitle ?? formatDate(event.date, 'D MMM YYYY')}
                    {event.amount && Number(event.amount) > 0
                      ? ` · ${formatCompactMoney(event.amount)} pending`
                      : ''}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: meta.accent,
                    flexShrink: 0,
                  }}
                />
              </ButtonBase>
            )
          })}
        </Stack>
      )}
    </DashboardPanel>
  )
}
