import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import {
  formatDate,
  IPendingActionMeta,
  PENDING_ACTION_META,
} from '../dashboard.helpers'
import {
  DashboardEmptyState,
  DashboardPanel,
  PriorityPill,
  WidgetError,
  WidgetSkeleton,
} from './dashboardPrimitives.component'

interface Props {
  summary: Dashboard.IWidget<Dashboard.ISummary>
  onRetry: () => void
}

const PRIORITY_WEIGHT: Record<IPendingActionMeta['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/**
 * Operational to-do list. Every row is a live counter from a module that owns
 * the data and navigates straight to the screen where the action is completed.
 */
export function DashboardPendingActions({ summary, onRetry }: Props) {
  const navigate = useNavigate()
  const data = summary.data

  const items = useMemo(() => {
    if (!data) {
      return []
    }

    return PENDING_ACTION_META.map((meta) => ({
      meta,
      count: Number(data.actions[meta.key] ?? 0),
    }))
      .filter((item) => item.count > 0)
      .sort(
        (a, b) =>
          PRIORITY_WEIGHT[a.meta.priority] - PRIORITY_WEIGHT[b.meta.priority] ||
          b.count - a.count
      )
  }, [data])

  const highPriority = items.filter(
    (item) => item.meta.priority === 'high'
  ).length

  if (!data && summary.loading) {
    return (
      <DashboardPanel
        title="Pending actions"
        subtitle="Tasks that need attention"
      >
        <WidgetSkeleton variant="list" rows={5} />
      </DashboardPanel>
    )
  }

  if (!data) {
    return (
      <DashboardPanel
        title="Pending actions"
        subtitle="Tasks that need attention"
      >
        <WidgetError message={summary.error} onRetry={onRetry} />
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      title="Pending actions"
      subtitle="Work waiting for an administrator in the modules you own"
      action={
        items.length > 0 ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography
              fontSize={10.5}
              fontWeight={700}
              color={colors.grey[600]}
              bgcolor={colors.grey[100]}
              px={0.85}
              py={0.15}
              borderRadius={999}
            >
              {items.length} queue{items.length === 1 ? '' : 's'}
            </Typography>
            {highPriority > 0 ? (
              <Typography
                fontSize={10.5}
                fontWeight={700}
                color={colors.red[700]}
                bgcolor={colors.red[50]}
                px={0.85}
                py={0.15}
                borderRadius={999}
              >
                {highPriority} high priority
              </Typography>
            ) : null}
          </Stack>
        ) : undefined
      }
      footer={
        <Typography fontSize={10.5} color={colors.grey[600]}>
          Admission approvals and examination publication are not exposed by the
          backend yet; their counters will appear here automatically once those
          APIs are published.
        </Typography>
      }
    >
      {items.length === 0 ? (
        <DashboardEmptyState
          icon={<CheckCircle2 size={20} />}
          title="You're all caught up"
          description="No pending approvals, unposted journals or unmarked attendance right now."
          minHeight={120}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {items.map(({ meta, count }) => {
            const Icon = meta.icon
            const dateLabel =
              meta.dateMode === 'today'
                ? formatDate(new Date().toISOString(), 'D MMM')
                : formatDate(data.generated_at, 'D MMM')

            return (
              <ButtonBase
                key={meta.key}
                onClick={() => navigate(meta.href)}
                aria-label={`${meta.label}: ${count} pending`}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 2,
                  border: `1px solid ${colors.grey[100]}`,
                  px: 1.25,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  transition: 'border-color .15s ease, background .15s ease',
                  '&:hover': {
                    borderColor: colors.grey[300],
                    bgcolor: colors.grey[50],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.75,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${meta.accent}14`,
                    color: meta.accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography
                      fontSize={12.5}
                      fontWeight={600}
                      color={colors.grey[800]}
                      noWrap
                    >
                      {meta.label}
                    </Typography>
                    <PriorityPill priority={meta.priority} />
                  </Stack>
                  <Typography fontSize={11} color={colors.grey[600]} noWrap>
                    {meta.hint}
                  </Typography>
                </Box>

                <Stack alignItems="flex-end" spacing={0.15} flexShrink={0}>
                  <Typography
                    fontSize={15}
                    fontWeight={700}
                    color={
                      meta.priority === 'high'
                        ? colors.red[600]
                        : colors.grey[900]
                    }
                    lineHeight={1.1}
                  >
                    {count}
                  </Typography>
                  <Typography fontSize={10} color={colors.grey[600]}>
                    {dateLabel}
                  </Typography>
                </Stack>

                <ChevronRight size={14} color={colors.grey[600]} />
              </ButtonBase>
            )
          })}
        </Box>
      )}
    </DashboardPanel>
  )
}
