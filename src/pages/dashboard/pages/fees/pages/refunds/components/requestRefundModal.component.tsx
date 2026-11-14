import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { requestRefundAction } from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import {
  IOption,
  isMoney,
  PAYMENT_METHOD_OPTIONS,
  REFUND_TYPE_OPTIONS,
} from '../../../fees.helpers'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../../components/feeStudentSelect.component'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

/**
 * Register a refund request (`POST /fees/refunds`).
 *
 * The refund is not paid here: it waits for a supervisor approval and a separate
 * `process` call, and the backend validates the refundable balance.
 */
export function RequestRefundModal({ open, onClose, onSaved }: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector((store) => store.feeRefunds.refundMutation)

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

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setStudent(null)
    setForm({
      refund_type: 'PAYMENT_REFUND',
      amount: '',
      reason: '',
      payment_method: 'CASH',
      payment_id: '',
      invoice_id: '',
      reference: '',
    })
  }, [open])

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
    if (form.refund_type === 'WALLET_REFUND' && !form.payment_id) {
      next.payment_id = 'A wallet refund requires the originating payment.'
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
          reference: form.reference.trim() || null,
        },
        onSuccess: () => {
          onSaved()
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
            <FeeStudentSelect value={student} onChange={setStudent} />
            {errors.student ? (
              <Typography fontSize={11.5} color="error" mt={0.5}>
                {errors.student}
              </Typography>
            ) : null}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
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
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
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
            <InputField
              labelDetail={{ text: 'Payment id', required: false }}
              placeholder="Original payment"
              value={form.payment_id}
              error={Boolean(errors.payment_id)}
              helperText={errors.payment_id ?? 'Required for wallet refunds.'}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  payment_id: event.target.value.replace(/[^0-9]/g, ''),
                }))
              }
            />
            <InputField
              labelDetail={{ text: 'Invoice id', required: false }}
              placeholder="Related invoice"
              value={form.invoice_id}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  invoice_id: event.target.value.replace(/[^0-9]/g, ''),
                }))
              }
            />
          </Stack>

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
