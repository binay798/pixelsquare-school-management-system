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
import { Landmark } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createRemittanceAction,
  getRemittancesAction,
  payRemittanceAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeAmount,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeeCellStack } from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  REMITTANCE_CODE_OPTIONS,
  REMITTANCE_STATUS_META,
  REMITTANCE_STATUS_OPTIONS,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

const PAGE_LIMIT = 20

type TDialog =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'pay'; remittanceId: number; label: string }

/** Statutory remittances: create the liability, then clear it with a payment. */
export function PayrollRemittancesPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.remittances)
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )

  const [code, setCode] = useState<Payroll.RemittanceCode | undefined>()
  const [status, setStatus] = useState<Payroll.RemittanceStatus | undefined>()
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<TDialog>({ kind: 'none' })
  const [busy, setBusy] = useState(false)

  const [paymentDate, setPaymentDate] = useState(todayIso())
  const [paymentReference, setPaymentReference] = useState('')
  const [cashAccountId, setCashAccountId] = useState<number | null>(null)

  const [createCode, setCreateCode] = useState<Payroll.RemittanceCode>('TDS')
  const [periodFrom, setPeriodFrom] = useState(todayIso())
  const [periodTo, setPeriodTo] = useState(todayIso())
  const [dueDate, setDueDate] = useState(todayIso())
  const [amount, setAmount] = useState('')

  useEffect(() => {
    dispatch(getAccountOptionsAction({ activeOnly: true }))
  }, [dispatch])

  useEffect(() => {
    dispatch(
      getRemittancesAction({
        filters: { code, status },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [code, dispatch, page, status])

  const accountSelectOptions: IOption<string>[] = (accountOptions ?? []).map(
    (account) => ({
      value: String(account.id),
      label: `${account.account_code} · ${account.account_name}`,
    })
  )

  const reload = () =>
    dispatch(
      getRemittancesAction({
        filters: { code, status },
        page,
        limit: PAGE_LIMIT,
      })
    )

  const submit = async (task: () => Promise<unknown>) => {
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

  const rows = data?.rows ?? []
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)

  const columns: IFeeColumn<Payroll.IRemittance>[] = [
    {
      key: 'remittance',
      label: 'Remittance',
      render: (row) => (
        <FeeCellStack
          primary={row.remittance_number}
          secondary={`${row.code} · ${formatDate(
            row.period_from
          )} → ${formatDate(row.period_to)}`}
        />
      ),
    },
    {
      key: 'due',
      label: 'Due date',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[600]}>
          {row.due_date ? formatDate(row.due_date) : '—'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={row.amount} strong />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={REMITTANCE_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' && permissions.canManageRemittances ? (
          <Button
            size="small"
            disabled={busy}
            onClick={() => {
              setPaymentDate(todayIso())
              setPaymentReference('')
              setCashAccountId(null)
              setDialog({
                kind: 'pay',
                remittanceId: row.id,
                label: row.remittance_number,
              })
            }}
          >
            Pay
          </Button>
        ) : null,
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Statutory remittances"
        subtitle="TDS, PF, SSF, CIT and insurance liabilities of the finalized runs, cleared with a bank payment."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.canManageRemittances ? (
            <ButtonComp
              size="small"
              variant="contained"
              startIcon={<Landmark size={15} />}
              onClick={() => {
                setCreateCode('TDS')
                setPeriodFrom(todayIso())
                setPeriodTo(todayIso())
                setDueDate(todayIso())
                setAmount('')
                setCashAccountId(null)
                setDialog({ kind: 'create' })
              }}
            >
              New remittance
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(code || status)}
          onClear={() => {
            setCode(undefined)
            setStatus(undefined)
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Scheme
            </Typography>
            <SelectField
              isClearable
              placeholder="Any scheme"
              options={REMITTANCE_CODE_OPTIONS}
              value={
                REMITTANCE_CODE_OPTIONS.find(
                  (option) => option.value === code
                ) ?? null
              }
              onChange={(option) => {
                setCode(
                  (option as IOption<Payroll.RemittanceCode> | null)?.value ??
                    undefined
                )
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="Any status"
              options={REMITTANCE_STATUS_OPTIONS}
              value={
                REMITTANCE_STATUS_OPTIONS.find(
                  (option) => option.value === status
                ) ?? null
              }
              onChange={(option) => {
                setStatus(
                  (option as IOption<Payroll.RemittanceStatus> | null)?.value ??
                    undefined
                )
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Remittances"
        subtitle="Paying a remittance posts Dr tax / PF / SSF payable, Cr bank."
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
          rows={rows}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyIcon={<Landmark size={20} />}
          emptyTitle="No remittance"
          emptyDescription="Create one from the statutory report of a finalized run."
        />
      </FeePanel>

      <Dialog
        open={dialog.kind === 'create'}
        onClose={() => setDialog({ kind: 'none' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New statutory remittance</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Scheme
              </Typography>
              <SelectField
                options={REMITTANCE_CODE_OPTIONS}
                value={
                  REMITTANCE_CODE_OPTIONS.find(
                    (option) => option.value === createCode
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (
                    option as IOption<Payroll.RemittanceCode> | null
                  )?.value
                  if (value) {
                    setCreateCode(value)
                  }
                }}
              />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Period from', required: true }}
                views={['day', 'month', 'year']}
                value={periodFrom ? moment(periodFrom) : null}
                onChange={(value) =>
                  setPeriodFrom(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Period to', required: true }}
                views={['day', 'month', 'year']}
                value={periodTo ? moment(periodTo) : null}
                onChange={(value) =>
                  setPeriodTo(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'Due date', required: false }}
                views={['day', 'month', 'year']}
                value={dueDate ? moment(dueDate) : null}
                onChange={(value) =>
                  setDueDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <InputField
                labelDetail={{ text: 'Amount', required: true }}
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Stack>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Cash / bank account (optional)
              </Typography>
              <SelectField
                isClearable
                placeholder="Select an account"
                options={accountSelectOptions}
                value={
                  accountSelectOptions.find(
                    (option) => option.value === String(cashAccountId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setCashAccountId(value ? Number(value) : null)
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: 'none' })}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !amount}
            onClick={() =>
              void submit(() =>
                dispatch(
                  createRemittanceAction({
                    code: createCode,
                    periodFrom,
                    periodTo,
                    dueDate,
                    amount,
                    cashAccountId,
                  })
                ).unwrap()
              )
            }
          >
            Create
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
          {dialog.kind === 'pay' ? `Pay ${dialog.label}` : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
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
              labelDetail={{ text: 'Payment reference', required: false }}
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
            />
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Cash / bank account (optional)
              </Typography>
              <SelectField
                isClearable
                placeholder="Select an account"
                options={accountSelectOptions}
                value={
                  accountSelectOptions.find(
                    (option) => option.value === String(cashAccountId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setCashAccountId(value ? Number(value) : null)
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: 'none' })}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || dialog.kind !== 'pay'}
            onClick={() => {
              if (dialog.kind !== 'pay') {
                return
              }
              void submit(() =>
                dispatch(
                  payRemittanceAction({
                    remittanceId: dialog.remittanceId,
                    paymentDate,
                    paymentReference: paymentReference || null,
                    cashAccountId,
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
