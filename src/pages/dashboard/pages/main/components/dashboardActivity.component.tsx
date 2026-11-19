import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  ACTIVITY_META,
  formatCompactMoney,
  formatTimeAgo,
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

/** Compact audit-style timeline built from the operational modules. */
export function DashboardRecentActivity({ feed, onRetry }: Props) {
  const navigate = useNavigate()
  const activities = feed.data?.activities ?? []

  if (!feed.data && feed.loading) {
    return (
      <DashboardPanel title="Recent activity" subtitle="Latest operations">
        <WidgetSkeleton variant="list" rows={6} />
      </DashboardPanel>
    )
  }

  if (!feed.data) {
    return (
      <DashboardPanel title="Recent activity" subtitle="Latest operations">
        <WidgetError message={feed.error} onRetry={onRetry} />
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      title="Recent activity"
      subtitle="Payments, admissions, journals, payroll and notices"
      action={
        <Typography fontSize={10.5} color={colors.grey[600]}>
          Last {activities.length} events
        </Typography>
      }
    >
      {activities.length === 0 ? (
        <DashboardEmptyState
          title="No recent activity"
          description="Operations recorded in the modules will appear here."
          minHeight={140}
        />
      ) : (
        <Stack spacing={0.15}>
          {activities.map((activity) => {
            const meta = ACTIVITY_META[activity.entity_type]
            const Icon = meta.icon
            const href = meta.href(activity.entity_id)

            return (
              <ButtonBase
                key={`${activity.entity_type}-${activity.entity_id}-${activity.occurred_at}`}
                onClick={() => navigate(href)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  px: 0.75,
                  py: 0.8,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.1,
                  '&:hover': { bgcolor: colors.grey[50] },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${meta.accent}14`,
                    color: meta.accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={13} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.6} alignItems="baseline">
                    <Typography
                      fontSize={12.2}
                      fontWeight={600}
                      color={colors.grey[800]}
                      noWrap
                    >
                      {activity.title}
                    </Typography>
                    {activity.subject ? (
                      <Typography
                        fontSize={11.5}
                        color={colors.grey[600]}
                        noWrap
                      >
                        · {activity.subject}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Typography fontSize={10.5} color={colors.grey[600]} noWrap>
                    {activity.actor_name ? `${activity.actor_name} · ` : ''}
                    {formatTimeAgo(activity.occurred_at)}
                    {activity.reference ? ` · ${activity.reference}` : ''}
                  </Typography>
                </Box>

                {activity.amount ? (
                  <Typography
                    fontSize={11.5}
                    fontWeight={700}
                    color={colors.green[700]}
                    noWrap
                  >
                    {formatCompactMoney(activity.amount)}
                  </Typography>
                ) : null}

                <ChevronRight size={13} color={colors.grey[300]} />
              </ButtonBase>
            )
          })}
        </Stack>
      )}
    </DashboardPanel>
  )
}
