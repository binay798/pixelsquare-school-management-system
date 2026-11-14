import { useCallback, useMemo } from 'react'
import { useSelector } from '@src/store/hooks.store'
import {
  canViewFeeModule,
  FeePermission,
  hasAnyFeePermission,
  hasFeePermission,
} from '@src/pages/dashboard/pages/fees/fees.helpers'

/**
 * Fee permissions of the signed in user.
 *
 * The roles come from the session (`userRoles`) and are mapped through
 * `FEE_PERMISSION_ROLES`, which mirrors the backend role matrix. The backend
 * still validates every request: this hook only hides what the API would reject.
 */
export function useFeePermissions() {
  const { data } = useSelector((store) => store.auth.user)
  const roles = useMemo(() => data?.userRoles ?? [], [data?.userRoles])

  const can = useCallback(
    (permission: FeePermission) => hasFeePermission(roles, permission),
    [roles]
  )

  const canAny = useCallback(
    (permissions: FeePermission[]) => hasAnyFeePermission(roles, permissions),
    [roles]
  )

  return {
    roles,
    can,
    canAny,
    canViewModule: canViewFeeModule(roles),
  }
}
