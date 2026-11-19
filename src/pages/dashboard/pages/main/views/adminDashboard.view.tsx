import { Box } from '@mui/material'
import {
  useDashboardData,
  useDashboardIdentity,
} from '../hooks/useDashboard.hooks'
import { DashboardHeader } from '../components/dashboardHeader.component'
import { DashboardKpiGrid } from '../components/dashboardKpiGrid.component'
import { DashboardAcademicsSection } from '../components/dashboardAcademicsSection.component'
import { DashboardFinanceSection } from '../components/dashboardFinanceSection.component'
import { DashboardPendingActions } from '../components/dashboardPendingActions.component'
import { DashboardRecentActivity } from '../components/dashboardActivity.component'
import { DashboardUpcomingEvents } from '../components/dashboardEvents.component'
import { DashboardQuickActions } from '../components/dashboardQuickActions.component'

/**
 * Admin dashboard view. The page only composes widgets; every number comes from
 * `/api/dashboard/*` and every widget owns its loading / error / retry state.
 */
export function AdminDashboardView() {
  const identity = useDashboardIdentity()
  const {
    summary,
    academics,
    finance,
    feed,
    range,
    rangeKey,
    setRangeKey,
    refresh,
    retry,
    refreshing,
  } = useDashboardData()

  const schoolName = summary.data?.school.name ?? identity.school?.name ?? null
  const academicYearName =
    summary.data?.academic_year?.name ?? identity.activeYear?.name ?? null

  return (
    <Box sx={{ pb: 4, minWidth: 0 }}>
      <DashboardHeader
        name={identity.greetingName}
        schoolName={schoolName}
        academicYearName={academicYearName}
        range={range}
        rangeKey={rangeKey}
        onRangeChange={setRangeKey}
        onRefresh={refresh}
        refreshing={refreshing}
        generatedAt={summary.data?.generated_at}
      />

      <DashboardKpiGrid
        summary={summary}
        finance={finance}
        onRetrySummary={retry.summary}
      />

      <Box sx={{ mt: 3 }}>
        <DashboardAcademicsSection
          academics={academics}
          onRetry={retry.academics}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <DashboardFinanceSection finance={finance} onRetry={retry.finance} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <DashboardPendingActions summary={summary} onRetry={retry.summary} />
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          },
        }}
      >
        <DashboardRecentActivity feed={feed} onRetry={retry.feed} />
        <DashboardUpcomingEvents feed={feed} onRetry={retry.feed} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <DashboardQuickActions roles={identity.roles} />
      </Box>
    </Box>
  )
}
