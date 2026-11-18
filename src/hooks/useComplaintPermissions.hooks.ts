import { useCallback, useMemo } from 'react'
import { useSelector } from '@src/store/hooks.store'
import {
  canViewComplaintModule,
  ComplaintPermission,
  hasAnyComplaintPermission,
  hasComplaintPermission,
} from '@src/pages/dashboard/pages/complaints/complaints.helpers'

/**
 * Complaint permissions of the signed in user.
 *
 * The roles come from the session (`userRoles`) and are mapped through
 * `COMPLAINT_PERMISSION_ROLES`, which mirrors the backend role matrix. The
 * backend still validates every request: this hook only hides what the API would
 * reject.
 */
export function useComplaintPermissions() {
  const { data } = useSelector((store) => store.auth.user)
  const roles = useMemo(() => data?.userRoles ?? [], [data?.userRoles])

  const can = useCallback(
    (permission: ComplaintPermission) =>
      hasComplaintPermission(roles, permission),
    [roles]
  )

  const canAny = useCallback(
    (permissions: ComplaintPermission[]) =>
      hasAnyComplaintPermission(roles, permissions),
    [roles]
  )

  return {
    roles,
    can,
    canAny,
    canViewModule: canViewComplaintModule(roles),
  }
}
