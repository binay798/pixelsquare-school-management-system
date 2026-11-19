import { Box, Button, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, CreditCard, XCircle } from 'lucide-react'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  cancelPaymentAction,
  completePaymentAction,
  getPaymentsAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  PAYMENT_METHOD_META,
  PAYMENT_STATUS_META,
  formatDate,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

const PAGE_LIMIT = 20

const PAYMENT_STATUS_OPTIONS: IOption<Payroll.PaymentStatus>[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PARTIALLY_PAID', label: 'Partially paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REVERSED', label: 'Reversed' },
]

/** Salary payment batches (`GET /payroll/payments`). */
export function PayrollPaymentsPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const runFilter = Number(searchParams.get('run') ?? '') || undefined

  const { data, loading } = useSelector((store) => store.payroll.payments)

  const [status, setStatus] = useState<Payroll.PaymentStatus | undefined>()
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    dispatch(
      getPaymentsAction({
        filters: { run_id: runFilter, status },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, page, runFilter, status])

  const act = async (paymentId: number, task: () => Promise<unknown>) => {
    try {
      setBusyId(paymentId)
      await task()
      await dispatch(
        getPaymentsAction({
          filters: { run_id: runFilter, status },
          page,
          limit: PAGE_LIMIT,
        })
      )
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusyId(null)
    }
  }

  const rows = data?.rows ?? []
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)

  const columns: IFeeColumn<Payroll.IPayment>[] = [
    {
      key: 'payment',
      label: 'Batch',
      render: (row) => (
        <FeeCellStack
          primary={row.payment_number}
          secondary={`${formatDate(row.payment_date)} · ${
            row.cash_account_code ?? row.bank_account_id
          }`}
        />
      ),
    },
    {
      key: 'run',
      label: 'Run',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack primary={row.run_number} secondary={row.period_key} />
      ),
    },
    {
      key: 'method',
      label: 'Method',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {PAYMENT_METHOD_META[row.payment_method]}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={row.total_amount} strong />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={PAYMENT_STATUS_META[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'DRAFT' ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button
              size="small"
              variant="text"
              startIcon={<CheckCircle2 size={14} />}
              disabled={busyId === row.id}
              onClick={(event) => {
                event.stopPropagation()
                void act(row.id, () =>
                  dispatch(completePaymentAction(row.id)).unwrap()
                )
              }}
            >
              Complete
            </Button>
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<XCircle size={14} />}
              disabled={busyId === row.id}
              onClick={(event) => {
                event.stopPropagation()
                void act(row.id, () =>
                  dispatch(cancelPaymentAction({ paymentId: row.id })).unwrap()
                )
              }}
            >
              Cancel
            </Button>
          </Stack>
        ) : null,
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Salary payments"
        subtitle="Completing a batch posts Dr salary payable / Cr bank, settles the employees and closes the run when nothing is left."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={3}
          active={Boolean(status) || Boolean(runFilter)}
          onClear={() => {
            setStatus(undefined)
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="Any status"
              options={PAYMENT_STATUS_OPTIONS}
              value={
                PAYMENT_STATUS_OPTIONS.find(
                  (option) => option.value === status
                ) ?? null
              }
              onChange={(option) => {
                setStatus(
                  (option as IOption<Payroll.PaymentStatus> | null)?.value ??
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
        title="Payment batches"
        subtitle="A draft batch can still be cancelled before any journal exists."
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
          skeletonRows={8}
          emptyIcon={<CreditCard size={20} />}
          emptyTitle="No payment batch"
          emptyDescription="Create a batch from an authorized payroll run."
        />
      </FeePanel>
    </Box>
  )
}
