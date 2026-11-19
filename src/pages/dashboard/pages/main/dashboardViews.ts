import { ComponentType } from 'react'
import { ADMIN_DASHBOARD_ROLES } from './dashboard.helpers'
import { AdminDashboardView } from './views/adminDashboard.view'
import { RoleDashboardFallbackView } from './views/roleDashboardFallback.view'

/**
 * Dashboard view registry.
 *
 * The main route renders the first view whose role list matches the signed in
 * user. Teacher, student, guardian and employee workspaces only have to add an
 * entry here (plus their own view component) — no change to routing, the shell
 * or this page is required.
 */
export interface IDashboardViewDefinition {
  key: string
  roles: string[]
  Component: ComponentType
}

export const DASHBOARD_VIEWS: IDashboardViewDefinition[] = [
  {
    key: 'admin',
    roles: ADMIN_DASHBOARD_ROLES,
    Component: AdminDashboardView,
  },
]

export const resolveDashboardView = (roles: string[]): ComponentType => {
  const match = DASHBOARD_VIEWS.find((view) =>
    roles.some((role) => view.roles.includes(role))
  )

  return match?.Component ?? RoleDashboardFallbackView
}
