import { useCallback, useMemo } from 'react'
import { useSelector } from '@src/store/hooks.store'
import {
  canViewPayrollModule,
  hasPayrollPermission,
  type PayrollPermission,
} from '@src/pages/dashboard/pages/payroll/payroll.helpers'

/**
 * Payroll permissions of the signed in user.
 *
 * Roles come from the session (`user.userRoles`) and are projected on the
 * `PAYROLL_PERMISSION_ROLES` matrix, which mirrors the guards of the backend
 * payroll routers. The API still validates every request: this hook only hides
 * what the backend would reject.
 */
export function usePayrollPermissions() {
  const { data } = useSelector((store) => store.auth.user)
  const roles = useMemo(() => data?.userRoles ?? [], [data?.userRoles])

  const can = useCallback(
    (permission: PayrollPermission) => hasPayrollPermission(roles, permission),
    [roles]
  )

  return {
    roles,
    can,
    canViewModule: canViewPayrollModule(roles),
    canManagePeriods: can('payroll.periods.manage'),
    canPrepareRuns: can('payroll.runs.prepare'),
    canCalculate: can('payroll.runs.calculate'),
    canSubmit: can('payroll.runs.submit'),
    canVerify: can('payroll.runs.verify'),
    canApprove: can('payroll.runs.approve'),
    canAuthorizePayment: can('payroll.runs.authorize_payment'),
    canPost: can('payroll.runs.post'),
    canFinalize: can('payroll.runs.finalize'),
    canGeneratePayslips: can('payroll.payslips.generate'),
    canCreatePayments: can('payroll.payments.create'),
    canManageRemittances: can('payroll.remittances.manage'),
    canManageLoans: can('payroll.loans.manage'),
    canApproveLoans: can('payroll.loans.approve'),
    canManageAdvances: can('payroll.advances.manage'),
    canApproveAdvances: can('payroll.advances.approve'),
    canManageReimbursements: can('payroll.reimbursements.manage'),
    canApproveReimbursements: can('payroll.reimbursements.approve'),
    canManageAdjustments: can('payroll.adjustments.manage'),
    canDecideAdjustments: can('payroll.adjustments.approve'),
    canViewReports: can('payroll.reports.view'),
    canManageSettings: can('payroll.settings.manage'),
    canManageComponents: can('payroll.structures.manage'),
    canManageStructures: can('payroll.structures.manage'),
  }
}
