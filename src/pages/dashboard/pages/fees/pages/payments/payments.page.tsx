import {
  Box,
  InputAdornment,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { Plus, Receipt, RotateCcw, Search } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import SpringModal from '@src/components/modal/modal.component'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getPaymentsAction,
  getPaymentReceiptAction,
  resetReceipt,
  reversePaymentAction,
} from '@src/store/redux/dashboard/fee/fee.payments.slice'
import { IPaymentFilters } from '@src/store/redux/dashboard/fee/fee.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeFilterBar } from '../../components/feeFilterBar.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import { FeeReasonModal } from '../../components/feeReasonModal.component'
import {
  formatDate,
  formatMoney,
  fullName,
  INTEGRATION_STATUS_META,
  IOption,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_META,
  PAYMENT_STATUS_OPTIONS,
  printElement,
} from '../../fees.helpers'

const PAGE_LIMIT = 20
const PAYMENTS_PATH = '/dashboard/fees/payments'

export function FeePaymentsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const { data: list, loading } = useSelector(
    (store) => store.feePayments.payments
  )
  const { data: receipt, loading: receiptLoading } = useSelector(
    (store) => store.feePayments.receipt
  )
  const { loading: mutating } = useSelector(
    (store) => store.feePayments.paymentMutation
  )

  const [filters, setFilters] = useState<IPaymentFilters>({})
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounceValue(searchText, 400)
  const [page, setPage] = useState(1)
  const [receiptId, setReceiptId] = useState<number | null>(null)
  const [reverseTarget, setReverseTarget] = useState<Fee.IPayment | null>(null)

  useEffect(() => {
    const term = debouncedSearch.trim()

    setFilters((prev) =>
      (prev.search ?? '') === term ? prev : { ...prev, search: term }
    )
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(() => {
    dispatch(getPaymentsAction({ filters, page, limit: PAGE_LIMIT }))
  }, [dispatch, filters, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!receiptId) {
      dispatch(resetReceipt())
    }
  }, [receiptId, dispatch])

  const columns: IFeeColumn<Fee.IPayment>[] = [
    {
      key: 'payment_number',
      label: 'Payment',
      render: (row) => (
        <FeeCellStack
          primary={row.payment_number}
          secondary={fullName(row.firstname, row.lastname)}
        />
      ),
    },
    {
      key: 'payment_date',
      label: 'Date',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {formatDate(row.payment_date)}
        </Typography>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {PAYMENT_METHOD_LABEL[row.payment_method]}
        </Typography>
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.total_amount)}
          tone="success"
          strong
        />
      ),
    },
    {
      key: 'unallocated_amount',
      label: 'Unallocated',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.unallocated_amount)}
          tone={Number(row.unallocated_amount) > 0 ? 'danger' : 'muted'}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={PAYMENT_STATUS_META[row.status]} />,
    },
    {
      key: 'accounting_event_status',
      label: 'Accounting',
      hideBelow: 'lg',
      render: (row) => (
        <FeeStatusChip
          meta={
            INTEGRATION_STATUS_META[row.accounting_event_status] ?? {
              label: row.accounting_event_status,
              text: '#334155',
              bg: '#f8fafc',
              border: '#e2e8f0',
              dot: '#94a3b8',
            }
          }
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          <Tooltip title="Receipt">
            <span>
              <ButtonComp
                size="small"
                variant="text"
                onClick={() => {
                  setReceiptId(row.id)
                  dispatch(getPaymentReceiptAction({ paymentId: row.id }))
                }}
                sx={{ minWidth: 0, px: 0.75 }}
              >
                <Receipt size={14} />
              </ButtonComp>
            </span>
          </Tooltip>
          {can('fee.payments.reverse') &&
          (row.status === 'CONFIRMED' || row.status === 'PENDING') ? (
            <Tooltip title="Reverse payment">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => setReverseTarget(row)}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <RotateCcw size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ]

  const total = Number(list?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Payment history"
        subtitle="Every collection with its allocation, wallet usage and accounting status."
        backTo="/dashboard/fees"
        actions={
          can('fee.payments.collect') ? (
            <ButtonComp
              startIcon={<Plus size={15} />}
              onClick={() => navigate(`${PAYMENTS_PATH}/collect`)}
            >
              Collect payment
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={1.75}>
        <FeeFilterBar
          active={Boolean(
            filters.status ||
              filters.payment_method ||
              filters.date_from ||
              filters.date_to ||
              filters.search
          )}
          onClear={() => {
            setSearchText('')
            setFilters({})
            setPage(1)
          }}
          columns={4}
        >
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Search
            </Typography>
            <InputField
              placeholder="Payment number, reference, student"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search size={15} color={colors.grey[500]} />
                </InputAdornment>
              }
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Method
            </Typography>
            <SelectField
              isClearable
              placeholder="All methods"
              options={PAYMENT_METHOD_OPTIONS}
              value={
                PAYMENT_METHOD_OPTIONS.find(
                  (option) => option.value === filters.payment_method
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  payment_method:
                    (option as IOption | null)?.value ?? undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={12} color={colors.grey[600]} mb={0.75}>
              Status
            </Typography>
            <SelectField
              isClearable
              placeholder="All statuses"
              options={PAYMENT_STATUS_OPTIONS}
              value={
                PAYMENT_STATUS_OPTIONS.find(
                  (option) => option.value === filters.status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  status: (option as IOption | null)?.value ?? undefined,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <CustomDatePicker
              labelDetail={{ text: 'From date', required: false }}
              views={['day', 'month', 'year']}
              value={filters.date_from ? moment(filters.date_from) : null}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  date_from:
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : undefined,
                }))
                setPage(1)
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title={`${total} payment${total === 1 ? '' : 's'}`}
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
          rows={list?.rows ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={6}
          emptyTitle="No payment recorded"
          emptyDescription="Collect a payment to see it here."
        />
      </FeePanel>

      <SpringModal
        open={Boolean(receiptId)}
        close={() => setReceiptId(null)}
        size="sm"
      >
        <Box sx={{ minWidth: { xs: 'auto', sm: 440 } }}>
          {receiptLoading || !receipt ? (
            <Typography fontSize={13} color={colors.grey[600]}>
              Loading receipt…
            </Typography>
          ) : (
            <Box id="fee-receipt-print">
              <Typography fontSize={15} fontWeight={700}>
                {receipt.receipt_number}
              </Typography>
              <Typography fontSize={12} color={colors.grey[500]} mb={1.5}>
                {receipt.student
                  ? fullName(
                      receipt.student.firstname,
                      receipt.student.lastname
                    )
                  : `Student #${receipt.payment.student_id}`}
              </Typography>
              <Stack spacing={0.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Amount
                  </Typography>
                  <Typography fontSize={13} fontWeight={700}>
                    {formatMoney(receipt.payment.total_amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Method
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {PAYMENT_METHOD_LABEL[receipt.payment.payment_method]}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Date
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {formatDate(receipt.payment.payment_date)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Accounting
                  </Typography>
                  <FeeStatusChip
                    meta={
                      INTEGRATION_STATUS_META[
                        receipt.payment.accounting_event_status
                      ]
                    }
                  />
                </Stack>
              </Stack>
              <Typography fontSize={12} fontWeight={600} mt={1.5} mb={0.5}>
                Allocations
              </Typography>
              {(receipt.payment.allocations ?? []).map((allocation) => (
                <Stack
                  key={allocation.id}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography fontSize={12} color={colors.grey[700]}>
                    {allocation.invoice_number}
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {formatMoney(allocation.allocated_amount)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
            <ButtonComp
              variant="outlined"
              startIcon={<Receipt size={14} />}
              onClick={() => printElement('fee-receipt-print', 'receipt')}
            >
              Print
            </ButtonComp>
            <ButtonComp onClick={() => setReceiptId(null)}>Close</ButtonComp>
          </Stack>
        </Box>
      </SpringModal>

      <FeeReasonModal
        open={Boolean(reverseTarget)}
        onClose={() => setReverseTarget(null)}
        heading={`Reverse payment ${reverseTarget?.payment_number ?? ''}?`}
        description="The payment and its allocations are reversed by a counter entry in the ledger. The original document is never deleted."
        label="Reversal reason"
        confirmText="Reverse payment"
        loading={mutating}
        onConfirm={(reason) => {
          if (!reverseTarget) {
            return
          }
          dispatch(
            reversePaymentAction({
              paymentId: reverseTarget.id,
              reason,
              onSuccess: () => {
                setReverseTarget(null)
                load()
              },
            })
          )
        }}
      />
    </Box>
  )
}
