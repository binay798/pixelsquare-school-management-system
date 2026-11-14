import { useCallback, useMemo } from 'react'
import { useSelector } from '@src/store/hooks.store'
import {
  canViewAccountingModule,
  hasAccountingPermission,
  type AccountingPermission,
} from '@src/pages/dashboard/pages/accounting/accounting.helpers'

/**
 * Accounting permissions of the signed in user.
 *
 * Roles come from the session (`user.userRoles`) and are projected on the
 * `ACCOUNTING_PERMISSION_ROLES` matrix, which mirrors the guards of the backend
 * accounting router. The API still validates every request: this hook only hides
 * what the backend would reject.
 */
export function useAccountingPermissions() {
  const { data } = useSelector((store) => store.auth.user)
  const roles = useMemo(() => data?.userRoles ?? [], [data?.userRoles])

  const can = useCallback(
    (permission: AccountingPermission) =>
      hasAccountingPermission(roles, permission),
    [roles]
  )

  return {
    roles,
    can,
    canViewModule: canViewAccountingModule(roles),
    canManageAccounts: can('accounting.accounts.manage'),
    canCreateJournal: can('accounting.journal.create'),
    canApproveJournal: can('accounting.journal.approve'),
    canPostJournal: can('accounting.journal.post'),
    canReverseJournal: can('accounting.journal.reverse'),
    canManagePeriods: can('accounting.periods.manage'),
    canClosePeriods: can('accounting.periods.close'),
    canViewReports: can('accounting.reports.view'),
  }
}
