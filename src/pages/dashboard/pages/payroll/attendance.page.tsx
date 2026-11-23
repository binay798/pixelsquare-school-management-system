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
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createLeaveAction,
  createOvertimeAction,
  decideLeaveAction,
  decideOvertimeAction,
  getLeaveRequestsAction,
  getLeaveTypesAction,
  getOvertimeAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
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

const ATTENDANCE_STATUS_META: Record<string, IStatusMeta> = {
  PENDING: {
    text: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'Pending',
  },
  APPROVED: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Approved',
  },
  REJECTED: {
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'Rejected',
  },
  CANCELLED: {
    text: '#334155',
    bg: '#f8fafc',
    border: '#e2e8f0',
    dot: '#94a3b8',
    label: 'Cancelled',
  },
}

type TTab = 'leave' | 'overtime'

/** Leave requests and overtime entries with their approval. */
export function PayrollAttendancePage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data: leaveRequests, loading: leaveLoading } = useSelector(
    (store) => store.payroll.leaveRequests
  )
  const { data: overtime, loading: overtimeLoading } = useSelector(
    (store) => store.payroll.overtime
  )
  const { data: leaveTypes } = useSelector((store) => store.payroll.leaveTypes)

  const [tab, setTab] = useState<TTab>('leave')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [dialog, setDialog] = useState<'none' | 'leave' | 'overtime'>('none')
  const [employees, setEmployees] = useState<Payroll.IProfileListItem[]>([])
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [leaveTypeId, setLeaveTypeId] = useState<number | null>(null)
  const [fromDate, setFromDate] = useState(todayIso())
  const [toDate, setToDate] = useState(todayIso())
  const [hours, setHours] = useState('2')
  const [rateMultiplier, setRateMultiplier] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    dispatch(getLeaveTypesAction())
  }, [dispatch])

  useEffect(() => {
    dispatch(getLeaveRequestsAction({ page, limit: PAGE_LIMIT }))
  }, [dispatch, page])

  useEffect(() => {
    dispatch(getOvertimeAction({ page, limit: PAGE_LIMIT }))
  }, [dispatch, page])

  useEffect(() => {
    void payrollServices
      .listProfilesService({ is_payroll_eligible: true }, 1, 200)
      .then((result) => setEmployees(result.rows))
      .catch(() => setEmployees([]))
  }, [])

  const employeeOptions: IOption<string>[] = employees.map((row) => ({
    value: String(row.employee_id),
    label: `${[row.employee?.firstname, row.employee?.lastname]
      .filter(Boolean)
      .join(' ')} · ${row.role}`,
  }))

  const leaveTypeOptions: IOption<string>[] = (leaveTypes ?? []).map(
    (type) => ({
      value: String(type.id),
      label: `${type.code} · ${type.name}${type.is_paid ? '' : ' (unpaid)'}`,
    })
  )

  const run = async (task: () => Promise<unknown>) => {
    try {
      setBusy(true)
      await task()
      await dispatch(getLeaveRequestsAction({ page, limit: PAGE_LIMIT }))
      await dispatch(getOvertimeAction({ page, limit: PAGE_LIMIT }))
      setDialog('none')
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const openDialog = (kind: 'leave' | 'overtime') => {
    setEmployeeId(null)
    setLeaveTypeId(leaveTypes?.[0]?.id ?? null)
    setFromDate(todayIso())
    setToDate(todayIso())
    setHours('2')
    setRateMultiplier('')
    setNote('')
    setDialog(kind)
  }

  const leaveColumns: IFeeColumn<Payroll.ILeaveRequest>[] = [
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
      key: 'type',
      label: 'Type',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={row.leave_type_name}
          secondary={row.is_paid ? 'paid' : 'unpaid'}
        />
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {formatDate(row.from_date)} → {formatDate(row.to_date)}
        </Typography>
      ),
    },
    {
      key: 'days',
      label: 'Days',
      align: 'right',
      render: (row) => <Typography fontSize={12.5}>{row.days}</Typography>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={ATTENDANCE_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' && permissions.canVerify ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideLeaveAction({
                      requestId: row.id,
                      decision: 'APPROVE',
                    })
                  ).unwrap()
                )
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideLeaveAction({ requestId: row.id, decision: 'REJECT' })
                  ).unwrap()
                )
              }
            >
              Reject
            </Button>
          </Stack>
        ) : null,
    },
  ]

  const overtimeColumns: IFeeColumn<Payroll.IOvertimeEntry>[] = [
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
      key: 'date',
      label: 'Work date',
      render: (row) => (
        <Typography fontSize={12.5}>{formatDate(row.work_date)}</Typography>
      ),
    },
    {
      key: 'hours',
      label: 'Hours',
      align: 'right',
      render: (row) => (
        <Typography fontSize={12.5}>
          {row.hours}
          {row.rate_multiplier ? ` × ${row.rate_multiplier}` : ''}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={ATTENDANCE_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' && permissions.canVerify ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideOvertimeAction({
                      overtimeId: row.id,
                      decision: 'APPROVE',
                    })
                  ).unwrap()
                )
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideOvertimeAction({
                      overtimeId: row.id,
                      decision: 'REJECT',
                    })
                  ).unwrap()
                )
              }
            >
              Reject
            </Button>
          </Stack>
        ) : null,
    },
  ]
  const activeTotal = Number(
    (tab === 'leave' ? leaveRequests?.total : overtime?.total) ?? 0
  )
  const totalPages = Math.ceil(activeTotal / PAGE_LIMIT)

  return (
    <Box>
      <FeePageHeader
        title="Leave & overtime"
        subtitle="Only approved leave and overtime reach the calculation: they are the two manual inputs that need an approval."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {permissions.canManageComponents ? (
              <>
                <ButtonComp
                  size="small"
                  variant="contained"
                  onClick={() => openDialog('leave')}
                >
                  New leave
                </ButtonComp>
                <ButtonComp
                  size="small"
                  variant="outlined"
                  onClick={() => openDialog('overtime')}
                >
                  New overtime
                </ButtonComp>
              </>
            ) : null}
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} mb={2}>
        {(['leave', 'overtime'] as TTab[]).map((item) => (
          <ButtonComp
            key={item}
            size="small"
            variant={tab === item ? 'contained' : 'outlined'}
            onClick={() => {
              setTab(item)
              setPage(1)
            }}
          >
            {item === 'leave' ? 'Leave requests' : 'Overtime entries'}
          </ButtonComp>
        ))}
      </Stack>

      <FeePanel
        noPadding
        title={tab === 'leave' ? 'Leave requests' : 'Overtime entries'}
        subtitle={
          tab === 'leave'
            ? 'Approving consumes the latest balance row of the leave type.'
            : 'Approving makes the hours payable by the next calculation.'
        }
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
        {tab === 'leave' ? (
          <FeeDataTable
            columns={leaveColumns}
            rows={leaveRequests?.rows ?? []}
            rowKey={(row) => row.id}
            loading={leaveLoading}
            skeletonRows={6}
            emptyTitle="No leave request"
            emptyDescription="Submit one to have it approved into the calculation."
          />
        ) : (
          <FeeDataTable
            columns={overtimeColumns}
            rows={overtime?.rows ?? []}
            rowKey={(row) => row.id}
            loading={overtimeLoading}
            skeletonRows={6}
            emptyTitle="No overtime entry"
            emptyDescription="Overtime is paid only once approved."
          />
        )}
      </FeePanel>

      <Dialog
        open={dialog !== 'none'}
        onClose={() => setDialog('none')}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog === 'leave' ? 'New leave request' : 'New overtime entry'}
        </DialogTitle>
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

            {dialog === 'leave' ? (
              <>
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Leave type
                  </Typography>
                  <SelectField
                    placeholder="Select a leave type"
                    options={leaveTypeOptions}
                    value={
                      leaveTypeOptions.find(
                        (option) => option.value === String(leaveTypeId ?? '')
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (option as IOption<string> | null)?.value
                      setLeaveTypeId(value ? Number(value) : null)
                    }}
                  />
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <CustomDatePicker
                    format="YYYY-MM-DD"
                    labelDetail={{ text: 'From', required: true }}
                    views={['day', 'month', 'year']}
                    value={fromDate ? moment(fromDate) : null}
                    onChange={(value) =>
                      setFromDate(
                        value && moment(value).isValid()
                          ? moment(value).format('YYYY-MM-DD')
                          : todayIso()
                      )
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <CustomDatePicker
                    format="YYYY-MM-DD"
                    labelDetail={{ text: 'To', required: true }}
                    views={['day', 'month', 'year']}
                    value={toDate ? moment(toDate) : null}
                    onChange={(value) =>
                      setToDate(
                        value && moment(value).isValid()
                          ? moment(value).format('YYYY-MM-DD')
                          : todayIso()
                      )
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              </>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <CustomDatePicker
                  format="YYYY-MM-DD"
                  labelDetail={{ text: 'Work date', required: true }}
                  views={['day', 'month', 'year']}
                  value={fromDate ? moment(fromDate) : null}
                  onChange={(value) =>
                    setFromDate(
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : todayIso()
                    )
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                <InputField
                  labelDetail={{ text: 'Hours', required: true }}
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
                <InputField
                  labelDetail={{
                    text: 'Multiplier (blank = policy)',
                    required: false,
                  }}
                  value={rateMultiplier}
                  onChange={(event) => setRateMultiplier(event.target.value)}
                />
              </Stack>
            )}

            <InputField
              labelDetail={{ text: 'Reason / note', required: false }}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog('none')}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              busy ||
              !employeeId ||
              (dialog === 'leave' && !leaveTypeId) ||
              (dialog === 'overtime' && !hours)
            }
            onClick={() =>
              void run(() =>
                dialog === 'leave'
                  ? dispatch(
                      createLeaveAction({
                        employee_id: Number(employeeId),
                        leave_type_id: Number(leaveTypeId),
                        from_date: fromDate,
                        to_date: toDate,
                        reason: note || null,
                      })
                    ).unwrap()
                  : dispatch(
                      createOvertimeAction({
                        employee_id: Number(employeeId),
                        work_date: fromDate,
                        hours: Number(hours),
                        rate_multiplier: rateMultiplier.trim() || null,
                        note: note || null,
                      })
                    ).unwrap()
              )
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
