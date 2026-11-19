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
import moment from 'moment'
import { useEffect, useState } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  approveSettlementAction,
  cancelSettlementAction,
  createSettlementAction,
  getSettlementsAction,
  paySettlementAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import { PAYROLL_BASE_PATH, formatDate, todayIso } from './payroll.helpers'
import type { IOption, IStatusMeta } from './payroll.helpers'

const PAGE_LIMIT = 20

const SETTLEMENT_STATUS_META: Record<Payroll.SettlementStatus, IStatusMeta> = {
  DRAFT: {
    text: '#334155',
    bg: '#f8fafc',
    border: '#e2e8f0',
    dot: '#94a3b8',
    label: 'Draft',
  },
  APPROVED: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Approved',
  },
  PROCESSED: {
    text: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    dot: '#8b5cf6',
    label: 'Processed',
  },
  CANCELLED: {
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'Cancelled',
  },
}

type TDialog =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'pay'; settlementId: number; label: string }

/**
 * Final settlement: derived from the last finalized run of the employee plus an
 * optional leave encashment, approved by finance, then paid through the ledger.
 */
export function PayrollSettlementsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.settlements)
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )

  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [dialog, setDialog] = useState<TDialog>({ kind: 'none' })
  const [employees, setEmployees] = useState<Payroll.IProfileListItem[]>([])
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [terminationDate, setTerminationDate] = useState(todayIso())
  const [lastWorkingDay, setLastWorkingDay] = useState(todayIso())
  const [leaveDays, setLeaveDays] = useState('0')
  const [note, setNote] = useState('')
  const [cashAccountId, setCashAccountId] = useState<number | null>(null)
  const [paymentDate, setPaymentDate] = useState(todayIso())
  const [reference, setReference] = useState('')

  useEffect(() => {
    dispatch(getSettlementsAction({ page, limit: PAGE_LIMIT }))
  }, [dispatch, page])

  useEffect(() => {
    dispatch(getAccountOptionsAction({ activeOnly: true }))
  }, [dispatch])

  useEffect(() => {
    if (dialog.kind !== 'create') {
      return
    }

    void payrollServices
      .listProfilesService({ is_payroll_eligible: true }, 1, 200)
      .then((result) => setEmployees(result.rows))
      .catch(() => setEmployees([]))
  }, [dialog.kind])

  const reload = () =>
    dispatch(getSettlementsAction({ page, limit: PAGE_LIMIT }))

  const run = async (task: () => Promise<unknown>) => {
    try {
      setBusy(true)
      await task()
      await reload()
      setDialog({ kind: 'none' })
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const employeeOptions: IOption<string>[] = employees.map((row) => ({
    value: String(row.employee_id),
    label: `${[row.employee?.firstname, row.employee?.lastname]
      .filter(Boolean)
      .join(' ')} · ${row.role}`,
  }))

  const accountOptionsList: IOption<string>[] = (accountOptions ?? []).map(
    (account) => ({
      value: String(account.id),
      label: `${account.account_code} · ${account.account_name}`,
    })
  )

  const columns: IFeeColumn<Payroll.IFinalSettlement>[] = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <FeeCellStack
          primary={[row.employee?.firstname, row.employee?.lastname]
            .filter(Boolean)
            .join(' ')}
          secondary={row.role}
        />
      ),
    },
    {
      key: 'dates',
      label: 'Termination',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={formatDate(row.termination_date)}
          secondary={`last day ${formatDate(row.last_working_day)}`}
        />
      ),
    },
    {
      key: 'reference',
      label: 'Reference run',
      hideBelow: 'lg',
      render: (row) => (
        <FeeCellStack
          primary={row.run_number ?? '—'}
          secondary={row.period_key ?? undefined}
        />
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <FeeAmount value={row.gross_amount} />,
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={row.net_amount} strong />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={SETTLEMENT_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {row.status === 'DRAFT' &&
          permissions.can('payroll.settlement.approve') ? (
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(approveSettlementAction(row.id)).unwrap()
                )
              }
            >
              Approve
            </Button>
          ) : null}
          {row.status === 'APPROVED' &&
          permissions.can('payroll.settlement.manage') ? (
            <Button
              size="small"
              variant="contained"
              disabled={busy}
              onClick={() => {
                setCashAccountId(null)
                setPaymentDate(todayIso())
                setReference('')
                setDialog({
                  kind: 'pay',
                  settlementId: row.id,
                  label: row.run_number ?? `#${row.id}`,
                })
              }}
            >
              Pay
            </Button>
          ) : null}
          {['DRAFT', 'APPROVED'].includes(row.status) &&
          permissions.can('payroll.settlement.manage') ? (
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    cancelSettlementAction({ settlementId: row.id })
                  ).unwrap()
                )
              }
            >
              Cancel
            </Button>
          ) : null}
        </Stack>
      ),
    },
  ]
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)

  return (
    <Box>
      <FeePageHeader
        title="Final settlement"
        subtitle="Full & final payment of a leaving employee, derived from their last finalized payroll run."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.can('payroll.settlement.manage') ? (
            <ButtonComp
              size="small"
              variant="contained"
              onClick={() => {
                setEmployeeId(null)
                setTerminationDate(todayIso())
                setLastWorkingDay(todayIso())
                setLeaveDays('0')
                setNote('')
                setDialog({ kind: 'create' })
              }}
            >
              New settlement
            </ButtonComp>
          ) : null
        }
      />

      <FeePanel
        noPadding
        title="Settlements"
        subtitle="Approving marks the payroll profile as TERMINATED; paying posts Dr salary payable / Cr bank."
        footer={
          totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          ) : null
        }
      >
        <FeeDataTable
          columns={columns}
          rows={data?.rows ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyTitle="No final settlement"
          emptyDescription="Create one for an employee whose last payroll run is approved."
        />
      </FeePanel>

      <Dialog
        open={dialog.kind === 'create'}
        onClose={() => setDialog({ kind: 'none' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New final settlement</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Employee
              </Typography>
              <SelectField
                placeholder="Select an employee"
                options={employeeOptions}
                value={
                  employeeOptions.find(
                    (option) => option.value === String(employeeId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setEmployeeId(value ? Number(value) : null)
                }}
              />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Termination date', required: true }}
                views={['day', 'month', 'year']}
                value={terminationDate ? moment(terminationDate) : null}
                onChange={(value) =>
                  setTerminationDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Last working day', required: true }}
                views={['day', 'month', 'year']}
                value={lastWorkingDay ? moment(lastWorkingDay) : null}
                onChange={(value) =>
                  setLastWorkingDay(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
            <InputField
              labelDetail={{ text: 'Leave days encashed', required: false }}
              value={leaveDays}
              onChange={(event) => setLeaveDays(event.target.value)}
            />
            <InputField
              labelDetail={{ text: 'Note (optional)', required: false }}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Typography fontSize={11.5} color={colors.grey[600]}>
              The gross, the deductions and the daily rate come from the last
              finalized run; the leave encashment is added on top.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: 'none' })}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !employeeId}
            onClick={() =>
              void run(() =>
                dispatch(
                  createSettlementAction({
                    employee_id: Number(employeeId),
                    termination_date: terminationDate,
                    last_working_day: lastWorkingDay,
                    leave_days_encashed: Number(leaveDays) || 0,
                    note: note || null,
                  })
                ).unwrap()
              )
            }
          >
            Draft settlement
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog.kind === 'pay'}
        onClose={() => setDialog({ kind: 'none' })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {dialog.kind === 'pay' ? `Pay settlement ${dialog.label}` : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Cash / bank account
              </Typography>
              <SelectField
                placeholder="Select an account"
                options={accountOptionsList}
                value={
                  accountOptionsList.find(
                    (option) => option.value === String(cashAccountId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setCashAccountId(value ? Number(value) : null)
                }}
              />
            </Box>
            <CustomDatePicker
              format="YYYY-MM-DD"
              labelDetail={{ text: 'Payment date', required: true }}
              views={['day', 'month', 'year']}
              value={paymentDate ? moment(paymentDate) : null}
              onChange={(value) =>
                setPaymentDate(
                  value && moment(value).isValid()
                    ? moment(value).format('YYYY-MM-DD')
                    : todayIso()
                )
              }
              slotProps={{ textField: { size: 'small' } }}
            />
            <InputField
              labelDetail={{ text: 'Reference (optional)', required: false }}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: 'none' })}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !cashAccountId || dialog.kind !== 'pay'}
            onClick={() => {
              if (dialog.kind !== 'pay') {
                return
              }
              void run(() =>
                dispatch(
                  paySettlementAction({
                    settlementId: dialog.settlementId,
                    payment: {
                      cash_account_id: Number(cashAccountId),
                      payment_date: paymentDate,
                      reference_number: reference || null,
                    },
                  })
                ).unwrap()
              )
            }}
          >
            Confirm payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
