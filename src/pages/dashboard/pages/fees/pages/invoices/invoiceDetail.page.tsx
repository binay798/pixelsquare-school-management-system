import { Box, Divider, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, Banknote, FileText, Printer, Receipt } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  cancelInvoiceAction,
  getInvoiceDetailAction,
  issueInvoiceAction,
  resetInvoiceDetail,
} from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import { getPaymentsAction } from '@src/store/redux/dashboard/fee/fee.payments.slice'
import { getAdjustmentsAction } from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import { FeeReasonModal } from '../../components/feeReasonModal.component'
import { FeeStudentCard } from '../../components/feeStudentCard.component'
import {
  FeeDataTable,
  FeeAmount,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { InvoiceAdjustmentModal } from './components/invoiceAdjustmentModal.component'
import { useFeeStudent } from '../../hooks/useFeeStudent.hooks'
import {
  ADJUSTMENT_STATUS_META,
  ADJUSTMENT_TYPE_OPTIONS,
  formatDate,
  formatDateTime,
  formatMoney,
  INVOICE_STATUS_META,
  INTEGRATION_STATUS_META,
  PAYMENT_METHOD_LABEL,
  printElement,
} from '../../fees.helpers'

const INVOICE_BASE_PATH = '/dashboard/fees/invoices'

const parseBreakdown = (
  value: Fee.IInvoiceLine['concession_breakdown']
): Fee.IConcessionBreakdown[] => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  try {
    return JSON.parse(value) as Fee.IConcessionBreakdown[]
  } catch {
    return []
  }
}

export function FeeInvoiceDetailPage() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const id = Number(invoiceId)
  const { data: invoice, loading } = useSelector(
    (store) => store.feeInvoices.invoiceDetail
  )
  const { data: payments, loading: paymentsLoading } = useSelector(
    (store) => store.feePayments.payments
  )
  const { data: adjustments, loading: adjustmentsLoading } = useSelector(
    (store) => store.feeRefunds.adjustments
  )
  const { loading: mutating } = useSelector(
    (store) => store.feeInvoices.invoiceMutation
  )
  const { student, loading: studentLoading } = useFeeStudent(
    invoice?.student_id ?? null
  )

  const [reasonMode, setReasonMode] = useState<'cancel' | null>(null)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)

  const load = useCallback(() => {
    if (!id) {
      return
    }

    dispatch(getInvoiceDetailAction({ invoiceId: id }))
    dispatch(
      getPaymentsAction({
        filters: { student_id: invoice?.student_id },
        page: 1,
        limit: 50,
      })
    )
    dispatch(
      getAdjustmentsAction({ filters: { invoice_id: id }, page: 1, limit: 50 })
    )
  }, [dispatch, id, invoice?.student_id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(
    () => () => {
      dispatch(resetInvoiceDetail())
    },
    [dispatch]
  )

  const lineColumns: IFeeColumn<Fee.IInvoiceLine>[] = [
    {
      key: 'description',
      label: 'Fee component',
      render: (row) => (
        <Box>
          <Typography fontSize={12.5} fontWeight={600}>
            {row.fee_type_name ?? row.description}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {row.quantity} × {formatMoney(row.unit_price)} ·{' '}
            {row.billing_frequency.replace('_', ' ').toLowerCase()}
          </Typography>
          {parseBreakdown(row.concession_breakdown).map((item) => (
            <Typography
              key={`${item.student_concession_id}-${item.code}`}
              fontSize={11}
              color={colors.green[700]}
            >
              − {item.name} ({item.code}):{' '}
              {formatMoney((item.applied_amount_minor / 100).toFixed(2))}
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      key: 'gross_amount',
      label: 'Gross',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => <FeeAmount value={formatMoney(row.gross_amount)} />,
    },
    {
      key: 'discount_amount',
      label: 'Discount',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.discount_amount)}
          tone={Number(row.discount_amount) > 0 ? 'success' : 'muted'}
        />
      ),
    },
    {
      key: 'tax_amount',
      label: 'Tax',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <FeeAmount value={formatMoney(row.tax_amount)} tone="muted" />
      ),
    },
    {
      key: 'net_amount',
      label: 'Net',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.net_amount)} strong />,
    },
  ]

  const paymentColumns: IFeeColumn<Fee.IPayment>[] = [
    {
      key: 'payment_number',
      label: 'Payment',
      render: (row) => (
        <Box>
          <Typography fontSize={12.5} fontWeight={600}>
            {row.payment_number}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {formatDate(row.payment_date)} ·{' '}
            {PAYMENT_METHOD_LABEL[row.payment_method]}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.total_amount)} tone="success" />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      hideBelow: 'sm',
      render: (row) => (
        <FeeStatusChip
          meta={{
            label: row.status,
            text: '#334155',
            bg: '#f8fafc',
            border: '#e2e8f0',
            dot: '#94a3b8',
          }}
        />
      ),
    },
  ]

  const adjustmentColumns: IFeeColumn<Fee.IAdjustment>[] = [
    {
      key: 'adjustment_type',
      label: 'Adjustment',
      render: (row) => (
        <Box>
          <Typography fontSize={12.5} fontWeight={600}>
            {ADJUSTMENT_TYPE_OPTIONS.find(
              (option) => option.value === row.adjustment_type
            )?.label ?? row.adjustment_type}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {formatDate(row.effective_date)}
            {row.reason ? ` · ${row.reason}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.amount)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={ADJUSTMENT_STATUS_META[row.status]} />
      ),
    },
  ]

  if (!id) {
    return (
      <Typography fontSize={13} color={colors.grey[600]}>
        Invalid invoice reference.
      </Typography>
    )
  }

  return (
    <Box>
      <FeePageHeader
        title={invoice ? `Invoice ${invoice.invoice_number}` : 'Invoice'}
        subtitle="Immutable financial snapshot: lines, discounts, penalties and allocations."
        backTo={INVOICE_BASE_PATH}
        loading={loading && !invoice}
        meta={
          invoice ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <FeeStatusChip
                meta={INVOICE_STATUS_META[invoice.status]}
                size="medium"
              />
              <FeeStatusChip
                meta={INTEGRATION_STATUS_META[invoice.accounting_event_status]}
                label={`Accounting: ${INTEGRATION_STATUS_META[
                  invoice.accounting_event_status
                ].label.toLowerCase()}`}
                size="medium"
              />
            </Stack>
          ) : null
        }
        actions={
          invoice ? (
            <>
              <ButtonComp
                size="small"
                variant="outlined"
                startIcon={<Printer size={14} />}
                onClick={() =>
                  printElement('fee-invoice-print', invoice.invoice_number)
                }
              >
                Print / PDF
              </ButtonComp>
              {can('fee.invoices.generate') && invoice.status === 'DRAFT' ? (
                <ButtonComp
                  size="small"
                  startIcon={<FileText size={14} />}
                  loading={mutating}
                  onClick={() =>
                    dispatch(
                      issueInvoiceAction({
                        invoiceId: invoice.id,
                        onSuccess: load,
                      })
                    )
                  }
                >
                  Issue invoice
                </ButtonComp>
              ) : null}
              {can('fee.payments.collect') &&
              Number(invoice.outstanding_amount) > 0 &&
              invoice.status !== 'DRAFT' ? (
                <ButtonComp
                  size="small"
                  startIcon={<Banknote size={14} />}
                  onClick={() =>
                    navigate(
                      `/dashboard/fees/payments/collect?studentId=${invoice.student_id}&invoiceId=${invoice.id}`
                    )
                  }
                >
                  Collect payment
                </ButtonComp>
              ) : null}
              {can('fee.invoices.cancel') &&
              ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(
                invoice.status
              ) ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Ban size={14} />}
                  onClick={() => setReasonMode('cancel')}
                >
                  Cancel
                </ButtonComp>
              ) : null}
              {can('fee.adjustments.approve') &&
              !['CANCELLED', 'VOIDED', 'DRAFT'].includes(invoice.status) ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  startIcon={<Receipt size={14} />}
                  onClick={() => setAdjustmentOpen(true)}
                >
                  Adjustment
                </ButtonComp>
              ) : null}
            </>
          ) : null
        }
      />

      {!invoice ? (
        <FeePanel>
          <Typography fontSize={13} color={colors.grey[600]}>
            {loading ? 'Loading invoice…' : 'Invoice not found.'}
          </Typography>
        </FeePanel>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' },
          }}
        >
          <Box>
            <Box id="fee-invoice-print">
              <FeePanel title="Student" noPadding>
                <Box p={2}>
                  <FeeStudentCard
                    student={student}
                    loading={studentLoading}
                    aside={
                      <Stack alignItems="flex-end">
                        <Typography fontSize={11.5} color={colors.grey[500]}>
                          Outstanding
                        </Typography>
                        <Typography
                          fontSize={18}
                          fontWeight={700}
                          color={
                            Number(invoice.outstanding_amount) > 0
                              ? colors.red[600]
                              : colors.green[700]
                          }
                        >
                          {formatMoney(invoice.outstanding_amount)}
                        </Typography>
                      </Stack>
                    }
                  />
                </Box>
              </FeePanel>

              <Box mt={1.5}>
                <FeePanel
                  title="Fee breakdown"
                  subtitle={`Issued ${formatDate(
                    invoice.issue_date
                  )} · due ${formatDate(invoice.due_date)}`}
                  noPadding
                  footer={
                    <Stack spacing={0.4} width="100%">
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color={colors.grey[600]}>
                          Subtotal
                        </Typography>
                        <Typography fontSize={12} fontWeight={600}>
                          {formatMoney(invoice.subtotal)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color={colors.grey[600]}>
                          Discount
                        </Typography>
                        <Typography
                          fontSize={12}
                          fontWeight={600}
                          color={colors.green[700]}
                        >
                          − {formatMoney(invoice.total_discount)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color={colors.grey[600]}>
                          Penalty / tax
                        </Typography>
                        <Typography fontSize={12} fontWeight={600}>
                          {formatMoney(invoice.total_penalty)} /{' '}
                          {formatMoney(invoice.tax_amount)}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 0.5 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={13} fontWeight={700}>
                          Total
                        </Typography>
                        <Typography
                          fontSize={14}
                          fontWeight={700}
                          color={colors.blue[700]}
                        >
                          {formatMoney(invoice.total_amount)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color={colors.grey[600]}>
                          Paid (wallet{' '}
                          {formatMoney(invoice.wallet_amount_applied)})
                        </Typography>
                        <Typography
                          fontSize={12}
                          fontWeight={600}
                          color={colors.green[700]}
                        >
                          {formatMoney(invoice.paid_amount)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color={colors.grey[600]}>
                          Outstanding
                        </Typography>
                        <Typography
                          fontSize={13}
                          fontWeight={700}
                          color={colors.red[600]}
                        >
                          {formatMoney(invoice.outstanding_amount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                >
                  <FeeDataTable
                    columns={lineColumns}
                    rows={invoice.lines ?? []}
                    rowKey={(row) => row.id}
                    dense
                    emptyTitle="No line item"
                  />
                </FeePanel>
              </Box>
            </Box>

            <Box mt={1.5}>
              <FeePanel title="Payments of this student" noPadding>
                <FeeDataTable
                  columns={paymentColumns}
                  rows={payments?.rows ?? []}
                  rowKey={(row) => row.id}
                  loading={paymentsLoading}
                  dense
                  emptyTitle="No payment recorded"
                />
              </FeePanel>
            </Box>
          </Box>

          <Box>
            <FeePanel title="Invoice information">
              <Stack spacing={0.75}>
                {[
                  ['Status', INVOICE_STATUS_META[invoice.status].label],
                  ['Billing period', invoice.billing_period_key ?? '—'],
                  ['Period start', formatDate(invoice.period_start)],
                  ['Period end', formatDate(invoice.period_end)],
                  ['Batch', invoice.batch_reference ?? '—'],
                  ['Created', formatDateTime(invoice.created_at)],
                ].map(([label, value]) => (
                  <Stack
                    key={label}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography fontSize={12} color={colors.grey[500]}>
                      {label}
                    </Typography>
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      textAlign="right"
                    >
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </FeePanel>

            <Box mt={1.5}>
              <FeePanel title="Adjustments" noPadding>
                <FeeDataTable
                  columns={adjustmentColumns}
                  rows={adjustments?.rows ?? []}
                  rowKey={(row) => row.id}
                  loading={adjustmentsLoading}
                  dense
                  emptyTitle="No adjustment"
                />
              </FeePanel>
            </Box>

            <Box mt={1.5}>
              <FeePanel title="Accounting synchronization">
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[500]}>
                      Event status
                    </Typography>
                    <FeeStatusChip
                      meta={
                        INTEGRATION_STATUS_META[invoice.accounting_event_status]
                      }
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[500]}>
                      Journal transaction
                    </Typography>
                    <Typography fontSize={12} fontWeight={600}>
                      {invoice.accounting_transaction_id
                        ? `#${invoice.accounting_transaction_id}`
                        : 'Not posted yet'}
                    </Typography>
                  </Stack>
                  {invoice.accounting_last_error ? (
                    <Typography fontSize={11.5} color={colors.red[600]}>
                      {invoice.accounting_last_error}
                    </Typography>
                  ) : null}
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    Fee processing and ledger posting are tracked separately: a
                    collected payment can still be pending in accounting.
                  </Typography>
                </Stack>
              </FeePanel>
            </Box>
          </Box>
        </Box>
      )}

      <InvoiceAdjustmentModal
        open={adjustmentOpen}
        invoiceId={invoice?.id ?? null}
        invoiceNumber={invoice?.invoice_number}
        outstanding={
          invoice ? formatMoney(invoice.outstanding_amount) : undefined
        }
        onClose={() => setAdjustmentOpen(false)}
        onSaved={load}
      />

      <FeeReasonModal
        open={reasonMode === 'cancel'}
        onClose={() => setReasonMode(null)}
        heading="Cancel this invoice?"
        description="The invoice keeps its number and snapshot. The receivable is reversed by the accounting engine and any paid amount has to be refunded first."
        label="Cancellation reason"
        confirmText="Cancel invoice"
        loading={mutating}
        onConfirm={(reason) => {
          if (!invoice) {
            return
          }
          dispatch(
            cancelInvoiceAction({
              invoiceId: invoice.id,
              reason,
              onSuccess: () => {
                setReasonMode(null)
                load()
              },
            })
          )
        }}
      />
    </Box>
  )
}
