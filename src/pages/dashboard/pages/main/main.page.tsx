import { useSelector } from '@src/store/hooks.store'
import { Box } from '@mui/material'
import { resolveDashboardView } from './dashboardViews'

/**
 * `/dashboard` — main content of the admin dashboard.
 *
 * The layout, sidebar, navbar, breadcrumbs and routing live in the parent
 * `Dashboard` page and are intentionally untouched: this component renders
 * inside the existing content container only.
 */
export function DashboardMain() {
  const roles = useSelector((store) => store.auth.user.data?.userRoles) ?? []
  const View = resolveDashboardView(roles)

  return (
    <Box sx={{ minWidth: 0 }}>
      <View />
    </Box>
  )
}
