import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getInvoicesAction } from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import {
  getPaymentDetailAction,
  getPaymentsAction,
  resetPaymentDetail,
} from '@src/store/redux/dashboard/fee/fee.payments.slice'
import { requestRefundAction } from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import { getWalletAction } from '@src/store/redux/dashboard/fee/fee.wallets.slice'
import {
  feeSelectPortalProps,
  formatDate,
  formatMoney,
  IOption,
  isMoney,
  PAYMENT_METHOD_OPTIONS,
  REFUND_TYPE_OPTIONS,
  toMinor,
} from '../../../fees.helpers'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../../components/feeStudentSelect.component'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (refund?: Fee.IRefund) => void
  /** Pre-select a student (e.g. the wallet screen already knows it). */
  initialStudent?: IStudentOption | null
  /** Pre-select the refund type (the wallet screen opens a wallet refund). */
  initialRefundType?: Fee.RefundType
}

/** Select option that keeps the row it represents (no second lookup needed). */
interface IPaymentOption extends IOption {
  payment: Fee.IPayment
  description: string
}

interface IInvoiceOption extends IOption {
  invoice: Fee.IInvoice
  description: string
}

/** Two-line option renderer shared by the payment and invoice selects. */
const renderReferenceOption = (option: IPaymentOption | IInvoiceOption) => (
  <div>
    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{option.label}</div>
    <div style={{ fontSize: 11.5, opacity: 0.7 }}>{option.description}</div>
  </div>
)

/**
 * Register a refund request (`POST /fees/refunds`).
 *
 * The refund is not paid here: it waits for a supervisor approval and a separate
 * `process` call, and the backend validates the refundable balance.
 */
export function RequestRefundModal({
  open,
  onClose,
  onSaved,
  initialStudent = null,
  initialRefundType = 'PAYMENT_REFUND',
}: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.feeRefunds.refundMutation)
  const { data: payments, loading: paymentsLoading } = useSelector(
    (store) => store.feePayments.payments
  )
  const { data: paymentDetail } = useSelector(
    (store) => store.feePayments.paymentDetail
  )
  const { data: invoices, loading: invoicesLoading } = useSelector(
    (store) => store.feeInvoices.invoices
  )
  const { data: walletData } = useSelector((store) => store.feeWallets.wallet)

  const [student, setStudent] = useState<IStudentOption | null>(null)
  const [form, setForm] = useState({
    refund_type: 'PAYMENT_REFUND' as Fee.RefundType,
    amount: '',
    reason: '',
    payment_method: 'CASH' as Fee.PaymentMethod,
    payment_id: '',
    invoice_id: '',
    reference: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const studentId = student?.value ?? null
  // The wallet slice is shared with the collection screen: never read another
  // student's balance while the new one is still loading.
  const wallet =
    walletData && walletData.student_id === studentId ? walletData : null

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setStudent(initialStudent)
    dispatch(resetPaymentDetail())
    setForm({
      refund_type: initialRefundType,
      amount: '',
      reason: '',
      payment_method: 'CASH',
      payment_id: '',
      invoice_id: '',
      reference: '',
    })
  }, [dispatch, open])

  // The refund references are always scoped to the selected student: the
  // accountant picks a document number, the form still sends the numeric id.
  useEffect(() => {
    if (!studentId) {
      return
    }

    dispatch(
      getPaymentsAction({
        filters: { student_id: studentId, status: 'CONFIRMED' },
        page: 1,
        limit: 200,
      })
    )
    dispatch(
      getInvoicesAction({
        filters: { student_id: studentId },
        page: 1,
        limit: 200,
      })
    )
    dispatch(getWalletAction({ studentId }))
  }, [dispatch, studentId])

  const paymentOptions = useMemo<IPaymentOption[]>(
    () =>
      (payments?.rows ?? [])
        .filter(
          (payment) =>
            payment.status === 'CONFIRMED' && payment.student_id === studentId
        )
        .map((payment) => ({
          value: String(payment.id),
          label: `${payment.payment_number} · ${formatMoney(
            payment.total_amount
          )}`,
          description: `${formatDate(payment.payment_date)} · ${formatMoney(
            payment.unallocated_amount
          )} unallocated`,
          payment,
        })),
    [payments, studentId]
  )

  const invoiceOptions = useMemo<IInvoiceOption[]>(
    () =>
      (invoices?.rows ?? [])
        .filter((invoice) => invoice.student_id === studentId)
        .map((invoice) => ({
          value: String(invoice.id),
          label: `${invoice.invoice_number} · ${formatMoney(
            invoice.total_amount
          )}`,
          description: `${invoice.status
            .replace(/_/g, ' ')
            .toLowerCase()} · ${formatMoney(
            invoice.outstanding_amount
          )} outstanding`,
          invoice,
        })),
    [invoices, studentId]
  )

  const selectedPayment =
    paymentOptions.find((option) => option.value === form.payment_id) ?? null
  const selectedInvoice =
    invoiceOptions.find((option) => option.value === form.invoice_id) ?? null

  const linkedPaymentDetail =
    paymentDetail && String(paymentDetail.id) === form.payment_id
      ? paymentDetail
      : null

  // A payment that settled exactly one invoice gives us the related invoice for
  // free; a split payment leaves the choice to the accountant.
  useEffect(() => {
    const allocations = linkedPaymentDetail?.allocations ?? []

    if (allocations.length !== 1) {
      return
    }

    const invoiceId = String(allocations[0].invoice_id)

    setForm((prev) =>
      prev.invoice_id === invoiceId ? prev : { ...prev, invoice_id: invoiceId }
    )
  }, [linkedPaymentDetail])

  const handleStudentChange = (next: IStudentOption | null) => {
    setStudent(next)
    setForm((prev) => ({ ...prev, payment_id: '', invoice_id: '' }))
    setErrors((prev) => ({ ...prev, student: '', payment_id: '' }))
    dispatch(resetPaymentDetail())
  }

  const handlePaymentChange = (option: IPaymentOption | null) => {
    setForm((prev) => ({
      ...prev,
      payment_id: option?.value ?? '',
      invoice_id: '',
    }))
    setErrors((prev) => ({ ...prev, payment_id: '' }))
    dispatch(resetPaymentDetail())

    if (option) {
      dispatch(getPaymentDetailAction({ paymentId: option.payment.id }))
    }
  }

  const handleInvoiceChange = (option: IInvoiceOption | null) => {
    setForm((prev) => ({ ...prev, invoice_id: option?.value ?? '' }))
  }

  const isWalletRefund = form.refund_type === 'WALLET_REFUND'
  const paymentRequired =
    form.refund_type === 'PAYMENT_REFUND' ||
    form.refund_type === 'OVERPAYMENT_REFUND'
  const walletBalance = wallet?.current_balance ?? '0.00'
  const linkedAllocations = linkedPaymentDetail?.allocations ?? []
  const invoiceHint = linkedPaymentDetail
    ? linkedAllocations.length === 1
      ? `Linked automatically from ${linkedPaymentDetail.payment_number}.`
      : linkedAllocations.length > 1
      ? `This payment settled ${linkedAllocations.length} invoices — pick the related one.`
      : 'This payment was kept as an advance (no invoice allocation).'
    : selectedInvoice
    ? `Outstanding ${formatMoney(selectedInvoice.invoice.outstanding_amount)}.`
    : 'Optional: link the refund to the invoice it relates to.'

  const submit = () => {
    const next: Record<string, string> = {}

    if (!student) {
      next.student = 'Select a student.'
    }
    if (!isMoney(form.amount)) {
      next.amount = 'Enter a positive amount with at most 2 decimals.'
    }
    if (form.reason.trim().length < 3) {
      next.reason = 'Explain the refund (at least 3 characters).'
    }
    if (paymentRequired && !form.payment_id) {
      next.payment_id = 'Select the payment being refunded.'
    }
    if (isWalletRefund) {
      if (!wallet || toMinor(walletBalance) <= 0) {
        next.amount = 'This student has no wallet balance to refund.'
      } else if (toMinor(form.amount) > toMinor(walletBalance)) {
        next.amount = `The refund exceeds the wallet balance (${formatMoney(
          walletBalance
        )}).`
      }
    }

    setErrors(next)

    if (Object.keys(next).length || !student) {
      return
    }

    dispatch(
      requestRefundAction({
        payload: {
          student_id: student.value,
          refund_type: form.refund_type,
          amount: form.amount,
          reason: form.reason.trim(),
          payment_method: form.payment_method,
          payment_id: form.payment_id ? Number(form.payment_id) : null,
          invoice_id: form.invoice_id ? Number(form.invoice_id) : null,
          wallet_id: isWalletRefund ? wallet?.id ?? null : null,
          reference: form.reference.trim() || null,
        },
        onSuccess: (refund) => {
          onSaved(refund)
          onClose()
        },
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ minWidth: { xs: 'auto', sm: 540 } }}>
        <Typography fontSize={16} fontWeight={700}>
          Request a refund
        </Typography>
        <Typography
          fontSize={12.5}
          color={colors.grey[500]}
          mt={0.25}
          mb={1.75}
        >
          A refund is never paid immediately: a supervisor approves it, then it
          is processed. The original payment or invoice is never deleted.
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Student *
            </Typography>
            <FeeStudentSelect value={student} onChange={handleStudentChange} />
            {errors.student ? (
              <Typography fontSize={11.5} color="error" mt={0.5}>
                {errors.student}
              </Typography>
            ) : null}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography
                width={200}
                fontSize={13}
                color={colors.grey[800]}
                mb={1}
              >
                Refund type *
              </Typography>
              <SelectField
                options={REFUND_TYPE_OPTIONS}
                value={
                  REFUND_TYPE_OPTIONS.find(
                    (option) => option.value === form.refund_type
                  ) ?? null
                }
                onChange={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    refund_type: (option as IOption<Fee.RefundType>).value,
                  }))
                }
              />
            </Box>
            <InputField
              labelDetail={{ text: 'Amount *', required: true }}
              placeholder="0.00"
              value={form.amount}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, amount: event.target.value }))
              }
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography
                width={200}
                fontSize={13}
                color={colors.grey[800]}
                mb={1}
              >
                Refund method *
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
              />
            </Box>
          </Stack>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Payment {paymentRequired ? '*' : '(optional)'}
            </Typography>
            <SelectField
              isClearable
              isDisabled={!studentId}
              isLoading={Boolean(studentId) && paymentsLoading}
              options={paymentOptions}
              value={selectedPayment}
              placeholder={
                studentId
                  ? 'Search a confirmed payment'
                  : 'Select a student first'
              }
              onChange={(option) =>
                handlePaymentChange((option as IPaymentOption | null) ?? null)
              }
              formatOptionLabel={(option) =>
                renderReferenceOption(option as IPaymentOption)
              }
              noOptionsMessage={() =>
                studentId
                  ? 'No confirmed payment for this student.'
                  : 'Select a student first.'
              }
              {...feeSelectPortalProps}
            />
            {errors.payment_id ? (
              <Typography fontSize={11.5} color="error" mt={0.5}>
                {errors.payment_id}
              </Typography>
            ) : (
              <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
                {isWalletRefund
                  ? `Wallet balance ${formatMoney(
                      walletBalance
                    )} — debited when the refund is processed.`
                  : 'Only confirmed payments can be refunded.'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Invoice (optional)
            </Typography>
            <SelectField
              isClearable
              isDisabled={!studentId}
              isLoading={Boolean(studentId) && invoicesLoading}
              options={invoiceOptions}
              value={selectedInvoice}
              placeholder={
                studentId
                  ? 'Search an invoice of this student'
                  : 'Select a student first'
              }
              onChange={(option) =>
                handleInvoiceChange((option as IInvoiceOption | null) ?? null)
              }
              formatOptionLabel={(option) =>
                renderReferenceOption(option as IInvoiceOption)
              }
              noOptionsMessage={() =>
                studentId
                  ? 'No invoice for this student.'
                  : 'Select a student first.'
              }
              {...feeSelectPortalProps}
            />
            <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
              {invoiceHint}
            </Typography>
          </Box>

          <InputField
            labelDetail={{ text: 'Reference', required: false }}
            placeholder="Cheque / transaction reference"
            value={form.reference}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reference: event.target.value }))
            }
          />

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Reason *', required: true }}
            placeholder="Why is the refund requested?"
            minRows={2}
            value={form.reason}
            error={Boolean(errors.reason)}
            helperText={errors.reason}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reason: event.target.value }))
            }
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Submit request
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
