import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Download,
  Receipt,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  calculateRunAction,
  deleteRunAction,
  generatePayslipsAction,
  getRunDetailAction,
  getRunEmployeesAction,
  getRunRegisterAction,
  postRunToAccountingAction,
  transitionRunAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  RUN_EMPLOYEE_STATUS_META,
  RUN_STATUS_META,
  SEVERITY_META,
  canDeleteRun,
  canRecalculateRun,
  canRunAction,
  downloadCsv,
  formatDate,
} from './payroll.helpers'

const PAGE_LIMIT = 25

/** Payroll run detail: totals, employees, exceptions, approvals and ledger. */
export function PayrollRunDetailPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { runId } = useParams()
  const id = Number(runId)
  const permissions = usePayrollPermissions()

  const { data: run, loading } = useSelector((store) => store.payroll.runDetail)
  const { data: employees, loading: employeesLoading } = useSelector(
    (store) => store.payroll.runEmployees
  )
  const { data: register } = useSelector((store) => store.payroll.register)

  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }
    dispatch(getRunDetailAction(id))
    dispatch(getRunRegisterAction(id))
  }, [dispatch, id])

  useEffect(() => {
    if (!id) {
      return
    }
    dispatch(getRunEmployeesAction({ runId: id, page, limit: PAGE_LIMIT }))
  }, [dispatch, id, page])

  const runTask = async (task: () => Promise<unknown>) => {
    try {
      setBusy(true)
      await task()
      await dispatch(getRunDetailAction(id))
      await dispatch(
        getRunEmployeesAction({ runId: id, page, limit: PAGE_LIMIT })
      )
    } catch {
      /* toast already raised */
    } finally {
      setBusy(false)
    }
  }

  /**
   * Deletes a run that never became financial history. The backend refuses when
   * journals, payments, payslips, recoveries or settlements exist, so a rejected
   * delete keeps the page and explains why.
   */
  const deleteRun = async () => {
    try {
      setDeleting(true)
      await dispatch(deleteRunAction(id)).unwrap()
      setConfirmDelete(false)
      navigate(`${PAYROLL_BASE_PATH}/runs`)
    } catch {
      /* toast already raised */
    } finally {
      setDeleting(false)
    }
  }

  const exportRegister = () => {
    if (!register) {
      return
    }

    downloadCsv(
      `payroll-register-${register.run_number}`,
      [
        { key: 'name', label: 'Employee' },
        { key: 'role', label: 'Role' },
        { key: 'department_name', label: 'Department' },
        { key: 'days_payable', label: 'Payable days' },
        { key: 'gross_amount', label: 'Gross' },
        { key: 'total_deductions', label: 'Deductions' },
        { key: 'total_employer_contributions', label: 'Employer' },
        { key: 'net_amount', label: 'Net' },
        { key: 'paid_amount', label: 'Paid' },
        { key: 'outstanding_amount', label: 'Outstanding' },
        { key: 'status', label: 'Status' },
      ],
      register.rows.map((row) => ({
        ...row,
        name: [row.firstname, row.lastname].filter(Boolean).join(' '),
      }))
    )
  }

  if (!run) {
    return (
      <FeePageHeader
        title="Payroll run"
        backTo={`${PAYROLL_BASE_PATH}/runs`}
        backLabel="Runs"
        loading
      />
    )
  }

  const transitions = (
    [
      { transition: 'submit', label: 'Submit', allowed: permissions.canSubmit },
      { transition: 'verify', label: 'Verify', allowed: permissions.canVerify },
      {
        transition: 'approve',
        label: 'Approve',
        allowed: permissions.canApprove,
      },
      { transition: 'reject', label: 'Reject', allowed: permissions.canVerify },
      {
        transition: 'authorize-payment',
        label: 'Authorize payment',
        allowed: permissions.canAuthorizePayment,
      },
      { transition: 'close', label: 'Close', allowed: permissions.canFinalize },
      {
        transition: 'cancel',
        label: 'Cancel run',
        allowed: permissions.canPrepareRuns,
      },
    ] as const
  ).filter(
    (item) =>
      item.allowed &&
      canRunAction(
        run.status,
        item.transition === 'authorize-payment'
          ? 'authorize'
          : (item.transition as
              | 'submit'
              | 'verify'
              | 'approve'
              | 'reject'
              | 'close'
              | 'cancel')
      )
  )

  const rows = employees?.rows ?? []
  const employeePages = Math.ceil(Number(employees?.total ?? 0) / PAGE_LIMIT)
  const blockers = run.exceptions.filter(
    (exception) =>
      exception.severity === 'BLOCKER' && exception.status !== 'RESOLVED'
  )

  const employeeColumns: IFeeColumn<Payroll.IRunEmployee>[] = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <FeeCellStack
          primary={[row.employee?.firstname, row.employee?.lastname]
            .filter(Boolean)
            .join(' ')}
          secondary={`${row.role}${
            row.department_name ? ` · ${row.department_name}` : ''
          }`}
        />
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      render: (row) => <FeeAmount value={row.gross_amount} />,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <FeeAmount value={row.total_deductions} tone="danger" />,
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={row.net_amount} strong />,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={row.outstanding_amount} tone="muted" />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={RUN_EMPLOYEE_STATUS_META[row.status]} />
      ),
    },
  ]

  const disabled = busy || loading

  return (
    <Box>
      <FeePageHeader
        title={run.run_number}
        subtitle={`${run.period.period_key} · ${formatDate(
          run.period.start_date
        )} → ${formatDate(run.period.end_date)} · pay ${formatDate(
          run.period.pay_date
        )}`}
        backTo={`${PAYROLL_BASE_PATH}/runs`}
        backLabel="Runs"
        loading={loading}
        meta={
          <FeeStatusChip meta={RUN_STATUS_META[run.status]} size="medium" />
        }
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {canRunAction(run.status, 'post') && permissions.canPost ? (
              <ButtonComp
                size="small"
                variant="contained"
                disabled={disabled}
                onClick={() =>
                  runTask(() =>
                    dispatch(postRunToAccountingAction(run.id)).unwrap()
                  )
                }
              >
                Post to accounting
              </ButtonComp>
            ) : null}
            {permissions.canGeneratePayslips &&
            ['APPROVED', 'POSTED', 'PAYMENT_AUTHORIZED', 'PAID'].includes(
              run.status
            ) ? (
              <ButtonComp
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={() =>
                  runTask(() =>
                    dispatch(generatePayslipsAction(run.id)).unwrap()
                  )
                }
              >
                Generate payslips
              </ButtonComp>
            ) : null}
            {run.status === 'PAYMENT_AUTHORIZED' ? (
              <ButtonComp
                size="small"
                variant="outlined"
                startIcon={<Receipt size={15} />}
                onClick={() =>
                  navigate(`${PAYROLL_BASE_PATH}/payments?run=${run.id}`)
                }
              >
                Pay
              </ButtonComp>
            ) : null}
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Download size={15} />}
              disabled={!register}
              onClick={exportRegister}
            >
              Register CSV
            </ButtonComp>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        {transitions.map((item) => (
          <ButtonComp
            key={item.transition}
            size="small"
            variant={item.transition === 'reject' ? 'outlined' : 'contained'}
            disabled={disabled}
            onClick={() =>
              runTask(() =>
                dispatch(
                  transitionRunAction({
                    runId: run.id,
                    transition: item.transition,
                  })
                ).unwrap()
              )
            }
          >
            {item.label}
          </ButtonComp>
        ))}
        {canRecalculateRun(run.status) && permissions.canCalculate ? (
          <ButtonComp
            size="small"
            variant="outlined"
            startIcon={<RefreshCw size={15} />}
            disabled={disabled}
            onClick={() =>
              runTask(() => dispatch(calculateRunAction(run.id)).unwrap())
            }
          >
            Recalculate
          </ButtonComp>
        ) : null}
      </Stack>

      {canDeleteRun(run.status) && permissions.canPrepareRuns ? (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          useFlexGap
        >
          <ButtonComp
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={15} />}
            disabled={disabled}
            onClick={() => setConfirmDelete(true)}
          >
            Delete run
          </ButtonComp>
          <Typography fontSize={12} color={colors.grey[600]}>
            Only a run without journals, payments or payslips can be deleted.
            Later runs must be cancelled or reversed.
          </Typography>
        </Stack>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        {[
          ['Gross', run.total_gross],
          ['Deductions', run.total_deductions],
          ['Employer contributions', run.total_employer_contributions],
          ['Net payable', run.total_net],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${colors.grey[200]}`,
              bgcolor: '#fff',
            }}
          >
            <Typography fontSize={11.5} color={colors.grey[500]}>
              {label}
            </Typography>
            <Typography fontSize={17} fontWeight={700}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' },
          gap: 2,
        }}
      >
        <FeePanel
          noPadding
          title="Employees"
          subtitle={`${run.employee_count} employees · ${run.currency}`}
          footer={
            employeePages > 1 ? (
              <Pagination
                count={employeePages}
                page={page}
                onChange={(_, value) => setPage(value)}
                size="small"
                color="primary"
              />
            ) : null
          }
        >
          <FeeDataTable
            columns={employeeColumns}
            rows={rows}
            rowKey={(row) => row.id}
            loading={employeesLoading}
            skeletonRows={6}
            emptyTitle="No employee in this run"
            emptyDescription="Nobody matched the payroll eligibility rules of the period."
          />
        </FeePanel>

        <Stack spacing={2}>
          <FeePanel
            title="Exceptions"
            subtitle={`${run.exceptions.length} raised by the engine${
              blockers.length
                ? ` · ${blockers.length} blocker${
                    blockers.length > 1 ? 's' : ''
                  }`
                : ''
            }`}
          >
            <Stack spacing={1}>
              {blockers.length ? (
                <Typography fontSize={12} color="error">
                  A blocker stops the run from being submitted and verified. Fix
                  the cause it names — then press Recalculate to rebuild the
                  draft and clear the exceptions.
                </Typography>
              ) : null}
              {run.exceptions.slice(0, 12).map((exception) => (
                <Stack
                  key={exception.id}
                  spacing={0.5}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <AlertTriangle size={13} />
                      <Typography fontSize={12} fontWeight={600}>
                        {exception.code}
                      </Typography>
                    </Stack>
                    <FeeStatusChip meta={SEVERITY_META[exception.severity]} />
                  </Stack>
                  <Typography fontSize={11.5} color={colors.grey[600]}>
                    {exception.message}
                  </Typography>
                </Stack>
              ))}
              {!run.exceptions.length ? (
                <Typography fontSize={12.5} color={colors.green[700]}>
                  No exception raised.
                </Typography>
              ) : null}
            </Stack>
          </FeePanel>

          <FeePanel title="Ledger & approval trail">
            <Stack spacing={1}>
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Accounting: {run.accounting_event_status ?? 'not posted yet'}
                {run.accounting_transaction_id
                  ? ` · transaction #${run.accounting_transaction_id}`
                  : ''}
              </Typography>
              {run.approvals.map((approval) => (
                <Typography
                  key={approval.id}
                  fontSize={12}
                  color={colors.grey[600]}
                >
                  {approval.sequence}. {approval.stage} · {approval.status}
                  {approval.acted_at
                    ? ` · ${formatDate(approval.acted_at)}`
                    : ''}
                </Typography>
              ))}
              {!run.approvals.length ? (
                <Typography fontSize={12} color={colors.grey[600]}>
                  No approval recorded yet.
                </Typography>
              ) : null}
            </Stack>
          </FeePanel>
        </Stack>
      </Box>

      <Dialog
        open={confirmDelete}
        onClose={() => (deleting ? undefined : setConfirmDelete(false))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete payroll run {run.run_number}?</DialogTitle>
        <DialogContent>
          <Typography fontSize={13.5} color={colors.grey[700]}>
            The run, its {run.employee_count} calculated employee line(s), the
            input snapshots and the open exceptions are removed. The deletion is
            written to the payroll audit log with the run number, period, status
            and totals.
          </Typography>
          <Typography fontSize={13.5} color={colors.grey[700]} mt={1.5}>
            A run that already has accounting journals, salary payments or
            generated payslips is refused by the server — cancel or reverse it
            instead.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={deleteRun}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete run'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
