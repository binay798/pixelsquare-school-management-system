import { Box, Checkbox, Divider, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import { Banknote, CheckCircle2, Printer, Sparkles, Wallet } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import SpringModal from '@src/components/modal/modal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getInvoicesAction,
  applyWalletAction,
} from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import {
  collectPaymentAction,
  getPaymentReceiptAction,
} from '@src/store/redux/dashboard/fee/fee.payments.slice'
import { getWalletAction } from '@src/store/redux/dashboard/fee/fee.wallets.slice'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import { FeeStudentCard } from '../../components/feeStudentCard.component'
import { FeeStudentSelect } from '../../components/feeStudentSelect.component'
import { useFeeStudent } from '../../hooks/useFeeStudent.hooks'
import {
  feeSelectPortalProps,
  formatDate,
  formatMinorMoney,
  formatMoney,
  fromMinor,
  fullName,
  IOption,
  INTEGRATION_STATUS_META,
  isMoney,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_OPTIONS,
  printElement,
  toMinor,
} from '../../fees.helpers'

const PAYMENTS_PATH = '/dashboard/fees/payments'

interface IAllocationRow {
  invoice_id: number
  invoice_number: string
  outstanding: string
  amount: string
  selected: boolean
}

export function FeeCollectPaymentPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()
  const [searchParams] = useSearchParams()

  const {
    studentId,
    setStudentId,
    student,
    loading: studentLoading,
  } = useFeeStudent(
    searchParams.get('studentId') ? Number(searchParams.get('studentId')) : null
  )

  const { data: invoices, loading: invoicesLoading } = useSelector(
    (store) => store.feeInvoices.invoices
  )
  const { data: wallet } = useSelector((store) => store.feeWallets.wallet)
  const { data: receipt, loading: receiptLoading } = useSelector(
    (store) => store.feePayments.receipt
  )
  const { loading: collecting } = useSelector(
    (store) => store.feePayments.paymentMutation
  )
  const { loading: applyingWallet } = useSelector(
    (store) => store.feeInvoices.invoiceMutation
  )

  const preSelectedInvoiceId = searchParams.get('invoiceId')

  const [rows, setRows] = useState<IAllocationRow[]>([])
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'CASH' as Fee.PaymentMethod,
    payment_date: moment().format('YYYY-MM-DD'),
    payment_reference: '',
    payer_guardian_id: null as number | null,
    notes: '',
    allow_advance: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [receiptOpen, setReceiptOpen] = useState(false)

  useEffect(() => {
    if (!studentId) {
      setRows([])

      return
    }

    dispatch(getWalletAction({ studentId }))
    dispatch(
      getInvoicesAction({
        filters: { student_id: studentId, outstanding_only: true },
        page: 1,
        limit: 50,
      })
    )
  }, [dispatch, studentId])

  useEffect(() => {
    const list = invoices?.rows ?? []

    setRows(
      list.map((invoice) => ({
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        outstanding: invoice.outstanding_amount,
        amount: '',
        selected: preSelectedInvoiceId
          ? String(invoice.id) === preSelectedInvoiceId
          : false,
      }))
    )
  }, [invoices, preSelectedInvoiceId])

  const selectedRows = rows.filter((row) => row.selected)

  const allocatedMinor = selectedRows.reduce(
    (total, row) => total + toMinor(row.amount),
    0
  )
  const paymentMinor = toMinor(form.amount)
  const unallocatedMinor = paymentMinor - allocatedMinor

  const overAllocated = allocatedMinor > paymentMinor
  const exceedsInvoice = selectedRows.some(
    (row) => toMinor(row.amount) > toMinor(row.outstanding)
  )

  const walletBalance = wallet?.current_balance ?? '0.00'
  const hasWallet = toMinor(walletBalance) > 0

  const toggleRow = (invoiceId: number) =>
    setRows((prev) =>
      prev.map((row) =>
        row.invoice_id === invoiceId
          ? {
              ...row,
              selected: !row.selected,
              amount: row.selected ? '' : row.outstanding,
            }
          : row
      )
    )

  const setRowAmount = (invoiceId: number, amount: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.invoice_id === invoiceId ? { ...row, amount } : row
      )
    )

  const autoAllocate = useCallback(() => {
    let remaining = toMinor(form.amount)

    setRows((prev) =>
      prev.map((row) => {
        if (!row.selected) {
          return row
        }

        const outstanding = toMinor(row.outstanding)
        const allocated = Math.max(0, Math.min(outstanding, remaining))
        remaining -= allocated

        return { ...row, amount: allocated > 0 ? fromMinor(allocated) : '' }
      })
    )
  }, [form.amount])

  const submit = () => {
    const next: Record<string, string> = {}

    if (!studentId) {
      next.student = 'Select a student first.'
    }
    if (!isMoney(form.amount) || paymentMinor <= 0) {
      next.amount = 'Enter a positive payment amount.'
    }
    if (overAllocated) {
      next.amount = 'The allocated amount exceeds the payment amount.'
    }
    if (exceedsInvoice) {
      next.allocation = 'An allocation exceeds the outstanding balance.'
    }
    if (unallocatedMinor > 0 && !form.allow_advance) {
      next.amount =
        'The unallocated amount will be kept as an advance only if you allow it.'
    }

    setErrors(next)

    if (Object.keys(next).length || !studentId) {
      return
    }

    dispatch(
      collectPaymentAction({
        payload: {
          student_id: studentId,
          amount: form.amount,
          payment_method: form.payment_method,
          payment_date: form.payment_date,
          payment_reference: form.payment_reference.trim() || null,
          payer_guardian_id: form.payer_guardian_id,
          notes: form.notes.trim() || null,
          allow_advance: form.allow_advance,
          allocations: selectedRows
            .filter((row) => toMinor(row.amount) > 0)
            .map((row) => ({ invoice_id: row.invoice_id, amount: row.amount })),
          idempotency_key: `ui-payment-${studentId}-${form.payment_date}-${form.amount}`,
        },
        onSuccess: (payment) => {
          setForm((prev) => ({
            ...prev,
            amount: '',
            payment_reference: '',
            notes: '',
          }))
          dispatch(getPaymentReceiptAction({ paymentId: payment.id }))
          setReceiptOpen(true)
          setRows((prev) => prev.map((row) => ({ ...row, amount: '' })))
        },
      })
    )
  }

  const guardians = student?.guardians ?? []

  const guardianOptions = guardians.map((guardian, index) => ({
    value: String(guardian.link_details?.guardian_id ?? index),
    label: fullName(
      guardian.user_profile_details?.firstname,
      guardian.user_profile_details?.lastname
    ),
  }))

  const selectedAllocations = useMemo(
    () => selectedRows.filter((row) => toMinor(row.amount) > 0),
    [selectedRows]
  )

  const applyWallet = () => {
    if (!studentId) {
      return
    }

    const target = selectedRows[0] ?? rows[0]

    if (!target) {
      return
    }

    dispatch(
      applyWalletAction({
        invoiceId: target.invoice_id,
        studentId,
        invoiceIds: selectedRows.length
          ? selectedRows.map((row) => row.invoice_id)
          : undefined,
        strategy: 'DUE_DATE',
        onSuccess: () => {
          dispatch(getWalletAction({ studentId }))
          dispatch(
            getInvoicesAction({
              filters: { student_id: studentId, outstanding_only: true },
              page: 1,
              limit: 50,
            })
          )
        },
      })
    )
  }

  return (
    <Box>
      <FeePageHeader
        title="Collect payment"
        subtitle="Find the student, pick the invoices, allocate the money. The backend validates the allocation and posts the collection to the ledger."
        backTo={PAYMENTS_PATH}
        actions={
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(PAYMENTS_PATH)}
          >
            Payment history
          </ButtonComp>
        }
      />

      <Box mb={1.75}>
        <FeePanel
          title="1 · Find the student"
          subtitle="Search by student name — the existing student API is queried server side."
        >
          <FeeStudentSelect
            value={
              studentId
                ? {
                    value: studentId,
                    label: fullName(
                      student?.user_profile_details?.firstname,
                      student?.user_profile_details?.lastname
                    ),
                  }
                : null
            }
            placeholder="Search a student to collect a payment"
            onChange={(option) => setStudentId(option?.value ?? null)}
          />
          {errors.student ? (
            <Typography fontSize={11.5} color="error" mt={0.5}>
              {errors.student}
            </Typography>
          ) : null}
        </FeePanel>
      </Box>

      {studentId ? (
        <>
          <Box mb={1.75}>
            <FeeStudentCard
              student={student}
              loading={studentLoading}
              aside={
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    Wallet balance
                  </Typography>
                  <Typography
                    fontSize={17}
                    fontWeight={700}
                    color={colors.indigo[700]}
                  >
                    {formatMoney(walletBalance)}
                  </Typography>
                  {hasWallet && can('fee.wallets.manage') ? (
                    <ButtonComp
                      size="small"
                      variant="outlined"
                      startIcon={<Wallet size={13} />}
                      loading={applyingWallet}
                      onClick={applyWallet}
                    >
                      Apply to invoices
                    </ButtonComp>
                  ) : null}
                </Stack>
              }
            />
          </Box>

          {hasWallet ? (
            <Box mb={1.75}>
              <FeePanel title="5 · Wallet application">
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography fontSize={12.5} color={colors.grey[700]}>
                    Available {formatMoney(walletBalance)} — applying the
                    balance settles the selected invoices (or the oldest open
                    ones) and creates an internal wallet payment.
                  </Typography>
                  <ButtonComp
                    size="small"
                    variant="outlined"
                    startIcon={<Wallet size={13} />}
                    loading={applyingWallet}
                    disabled={!can('fee.wallets.manage')}
                    onClick={applyWallet}
                  >
                    Apply wallet balance
                  </ButtonComp>
                </Stack>
              </FeePanel>
            </Box>
          ) : null}
        </>
      ) : null}

      {studentId ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', xl: '1.4fr 1fr' },
          }}
        >
          <Box>
            <FeePanel
              title="2 · Outstanding invoices"
              subtitle="Only issued, partially paid and overdue invoices can be settled."
              noPadding
              action={
                <ButtonComp
                  size="small"
                  variant="text"
                  startIcon={<Sparkles size={13} />}
                  disabled={!paymentMinor}
                  onClick={autoAllocate}
                >
                  Auto allocate
                </ButtonComp>
              }
            >
              {invoicesLoading ? (
                <Box p={2}>
                  <Typography fontSize={12.5} color={colors.grey[500]}>
                    Loading invoices…
                  </Typography>
                </Box>
              ) : rows.length === 0 ? (
                <Box p={2}>
                  <Typography fontSize={12.5} color={colors.grey[500]}>
                    This student has no outstanding invoice. You can still
                    record an advance payment.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {rows.map((row) => (
                    <Stack
                      key={row.invoice_id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      sx={{ px: 2, py: 1.25 }}
                    >
                      <Checkbox
                        size="small"
                        checked={row.selected}
                        onChange={() => toggleRow(row.invoice_id)}
                      />
                      <Box flex={1}>
                        <Typography fontSize={12.5} fontWeight={600}>
                          {row.invoice_number}
                        </Typography>
                        <Typography fontSize={11.5} color={colors.grey[500]}>
                          Outstanding {formatMoney(row.outstanding)}
                        </Typography>
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: 150 } }}>
                        <InputField
                          placeholder="0.00"
                          value={row.amount}
                          disabled={!row.selected}
                          onChange={(event) =>
                            setRowAmount(row.invoice_id, event.target.value)
                          }
                        />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
              {errors.allocation ? (
                <Box px={2} pb={1}>
                  <Typography fontSize={11.5} color="error">
                    {errors.allocation}
                  </Typography>
                </Box>
              ) : null}
            </FeePanel>
          </Box>

          <Box>
            <FeePanel title="3 · Payment details">
              <Stack spacing={1.5}>
                <InputField
                  labelDetail={{ text: 'Payment amount', required: true }}
                  placeholder="0.00"
                  value={form.amount}
                  error={Boolean(errors.amount)}
                  helperText={errors.amount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                />

                <Box>
                  <Typography
                    fontSize={12.5}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Payment method
                  </Typography>
                  <SelectField
                    options={PAYMENT_METHOD_OPTIONS}
                    value={
                      PAYMENT_METHOD_OPTIONS.find(
                        (option) => option.value === form.payment_method
                      ) ?? null
                    }
                    onChange={(option) =>
                      setForm((prev) => ({
                        ...prev,
                        payment_method: (option as IOption<Fee.PaymentMethod>)
                          .value,
                      }))
                    }
                    {...feeSelectPortalProps}
                  />
                </Box>

                <CustomDatePicker
                  labelDetail={{ text: 'Payment date', required: false }}
                  views={['day', 'month', 'year']}
                  value={form.payment_date ? moment(form.payment_date) : null}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      payment_date:
                        value && moment(value).isValid()
                          ? moment(value).format('YYYY-MM-DD')
                          : '',
                    }))
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />

                <InputField
                  labelDetail={{ text: 'Reference', required: false }}
                  placeholder="Cheque number, transaction id…"
                  value={form.payment_reference}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      payment_reference: event.target.value,
                    }))
                  }
                />

                {guardianOptions.length ? (
                  <Box>
                    <Typography
                      fontSize={12.5}
                      color={colors.grey[700]}
                      mb={0.75}
                    >
                      Payer guardian
                    </Typography>
                    <SelectField
                      isClearable
                      options={guardianOptions}
                      placeholder="Select the payer"
                      value={
                        guardianOptions.find(
                          (option) =>
                            option.value === String(form.payer_guardian_id)
                        ) ?? null
                      }
                      onChange={(option) =>
                        setForm((prev) => ({
                          ...prev,
                          payer_guardian_id: (option as IOption | null)?.value
                            ? Number((option as IOption).value)
                            : null,
                        }))
                      }
                      {...feeSelectPortalProps}
                    />
                  </Box>
                ) : null}

                <TextareaField
                  variant="outlined"
                  labelDetail={{ text: 'Notes', required: false }}
                  minRows={2}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </Stack>
            </FeePanel>

            <Box mt={1.5}>
              <FeePanel title="4 · Allocation summary">
                <Stack spacing={0.6}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[600]}>
                      Payment amount
                    </Typography>
                    <Typography fontSize={12} fontWeight={600}>
                      {formatMoney(form.amount)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[600]}>
                      Allocated ({selectedAllocations.length} invoices)
                    </Typography>
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      color={colors.green[700]}
                    >
                      {formatMinorMoney(allocatedMinor)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[600]}>
                      Unallocated
                    </Typography>
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      color={
                        unallocatedMinor > 0
                          ? colors.orange[800]
                          : colors.grey[700]
                      }
                    >
                      {formatMinorMoney(unallocatedMinor)}
                    </Typography>
                  </Stack>
                </Stack>

                {unallocatedMinor > 0 ? (
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    spacing={1}
                    mt={1}
                  >
                    <Checkbox
                      size="small"
                      checked={form.allow_advance}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          allow_advance: event.target.checked,
                        }))
                      }
                    />
                    <Typography fontSize={11.5} color={colors.grey[600]}>
                      Keep the unallocated amount as a student advance (wallet).
                      Without this the backend rejects the payment.
                    </Typography>
                  </Stack>
                ) : null}

                <ButtonComp
                  fullWidth
                  sx={{ mt: 1.5 }}
                  startIcon={<Banknote size={14} />}
                  loading={collecting}
                  disabled={!can('fee.payments.collect')}
                  onClick={submit}
                >
                  Confirm payment & receipt
                </ButtonComp>
                <Typography
                  fontSize={11}
                  color={colors.grey[500]}
                  mt={0.75}
                  textAlign="center"
                >
                  The receipt appears only after the API confirms the payment —
                  gateway verification is never bypassed.
                </Typography>
              </FeePanel>
            </Box>
          </Box>
        </Box>
      ) : null}

      <SpringModal
        open={receiptOpen}
        close={() => setReceiptOpen(false)}
        size="sm"
      >
        <Box sx={{ minWidth: { xs: 'auto', sm: 460 } }}>
          {receiptLoading || !receipt ? (
            <Typography fontSize={13} color={colors.grey[600]}>
              Loading receipt…
            </Typography>
          ) : (
            <Box id="fee-receipt-print">
              <Stack alignItems="center" spacing={0.5} mb={1.5}>
                <CheckCircle2 size={30} color={colors.green[600]} />
                <Typography fontSize={16} fontWeight={700}>
                  Payment recorded
                </Typography>
                <Typography fontSize={12} color={colors.grey[500]}>
                  Receipt {receipt.receipt_number}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={0.5} mb={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Student
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {receipt.student
                      ? fullName(
                          receipt.student.firstname,
                          receipt.student.lastname
                        )
                      : `#${receipt.payment.student_id}`}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12} color={colors.grey[600]}>
                    Amount
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color={colors.green[700]}
                  >
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
                {toMinor(receipt.payment.unallocated_amount) > 0 ? (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={12} color={colors.grey[600]}>
                      Kept as advance
                    </Typography>
                    <Typography fontSize={12} fontWeight={600}>
                      {formatMoney(receipt.payment.unallocated_amount)}
                    </Typography>
                  </Stack>
                ) : null}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
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

              <Divider sx={{ mb: 1.5 }} />

              <Typography fontSize={12} fontWeight={600} mb={0.75}>
                Allocated invoices
              </Typography>
              <Stack spacing={0.4}>
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
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
            <ButtonComp
              variant="outlined"
              startIcon={<Printer size={14} />}
              onClick={() => printElement('fee-receipt-print', 'receipt')}
            >
              Print
            </ButtonComp>
            <ButtonComp
              onClick={() => {
                setReceiptOpen(false)
                navigate(PAYMENTS_PATH)
              }}
            >
              Done
            </ButtonComp>
          </Stack>
        </Box>
      </SpringModal>
    </Box>
  )
}
