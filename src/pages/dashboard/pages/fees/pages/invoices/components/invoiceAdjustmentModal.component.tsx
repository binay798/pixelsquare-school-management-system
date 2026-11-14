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
import { createAdjustmentAction } from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import {
  ADJUSTMENT_TYPE_OPTIONS,
  IOption,
  isMoney,
  todayIso,
} from '../../../fees.helpers'

interface Props {
  open: boolean
  onClose: () => void
  invoiceId: number | null
  invoiceNumber?: string
  outstanding?: string
  onSaved: () => void
}

/**
 * Controlled adjustment of an issued invoice
 * (`POST /fees/invoices/:invoiceId/adjustments`).
 *
 * Issued lines can never be edited: a credit note, debit note, waiver, write off
 * or penalty is recorded instead, and approved by a supervisor when needed.
 */
export function InvoiceAdjustmentModal({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  outstanding,
  onSaved,
}: Props) {
  const dispatch = useDispatch()
  const { loading } = useSelector(
    (store) => store.feeRefunds.adjustmentMutation
  )

  const [form, setForm] = useState({
    adjustment_type: 'CREDIT_NOTE' as Fee.AdjustmentType,
    amount: '',
    reason: '',
    effective_date: todayIso(),
    apply_immediately: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setForm({
      adjustment_type: 'CREDIT_NOTE',
      amount: '',
      reason: '',
      effective_date: todayIso(),
      apply_immediately: true,
    })
  }, [open])

  const submit = () => {
    const next: Record<string, string> = {}

    if (!isMoney(form.amount)) {
      next.amount = 'Enter a positive amount with at most 2 decimals.'
    }
    if (form.reason.trim().length < 3) {
      next.reason = 'Explain the adjustment (at least 3 characters).'
    }

    setErrors(next)

    if (Object.keys(next).length || !invoiceId) {
      return
    }

    dispatch(
      createAdjustmentAction({
        invoiceId,
        payload: {
          adjustment_type: form.adjustment_type,
          amount: form.amount,
          reason: form.reason.trim(),
          effective_date: form.effective_date,
          apply_immediately: form.apply_immediately,
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
      <Box sx={{ minWidth: { xs: 'auto', sm: 500 } }}>
        <Typography fontSize={16} fontWeight={700}>
          Request an adjustment
        </Typography>
        <Typography
          fontSize={12.5}
          color={colors.grey[500]}
          mt={0.25}
          mb={1.75}
        >
          {invoiceNumber ? `Invoice ${invoiceNumber}. ` : ''}
          Outstanding {outstanding ? ` ${outstanding}` : ''}. A credit can never
          exceed the outstanding balance; leave the immediate application off to
          submit it for approval.
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Adjustment type *
            </Typography>
            <SelectField
              options={ADJUSTMENT_TYPE_OPTIONS}
              value={
                ADJUSTMENT_TYPE_OPTIONS.find(
                  (option) => option.value === form.adjustment_type
                ) ?? null
              }
              onChange={(option) =>
                setForm((prev) => ({
                  ...prev,
                  adjustment_type: (option as IOption<Fee.AdjustmentType>)
                    .value,
                }))
              }
            />
          </Box>

          <InputField
            labelDetail={{ text: 'Amount', required: true }}
            placeholder="0.00"
            value={form.amount}
            error={Boolean(errors.amount)}
            helperText={errors.amount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amount: event.target.value }))
            }
          />

          <TextareaField
            variant="outlined"
            labelDetail={{ text: 'Reason', required: true }}
            placeholder="Why is this adjustment required?"
            minRows={2}
            value={form.reason}
            error={Boolean(errors.reason)}
            helperText={errors.reason}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reason: event.target.value }))
            }
          />

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Application
            </Typography>
            <SelectField
              options={[
                { value: 'true', label: 'Apply immediately' },
                { value: 'false', label: 'Submit for approval' },
              ]}
              value={{
                value: String(form.apply_immediately),
                label: form.apply_immediately
                  ? 'Apply immediately'
                  : 'Submit for approval',
              }}
              onChange={(option) =>
                setForm((prev) => ({
                  ...prev,
                  apply_immediately: (option as IOption).value === 'true',
                }))
              }
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp loading={loading} onClick={submit}>
            Record adjustment
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
