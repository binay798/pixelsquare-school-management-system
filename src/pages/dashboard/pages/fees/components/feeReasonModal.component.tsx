import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { TextareaField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  heading: string
  description?: string
  label?: string
  confirmText?: string
  loading?: boolean
  minLength?: number
}

/**
 * Reason capture modal (cancel invoice, reverse payment, reject refund, …).
 * The reason is required by the backend schemas (min 3 chars) and is kept in the
 * audit trail, so it can never be skipped by the UI either.
 */
export function FeeReasonModal({
  open,
  onClose,
  onConfirm,
  heading,
  description,
  label = 'Reason',
  confirmText = 'Confirm',
  loading = false,
  minLength = 3,
}: Props) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) {
      setReason('')
      setTouched(false)
    }
  }, [open])

  const invalid = reason.trim().length < minLength

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirmationClick={() => {
        setTouched(true)

        if (!invalid) {
          onConfirm(reason.trim())
        }
      }}
      heading={heading}
      confirmText={confirmText}
      confirmLoader={loading}
    >
      <Stack spacing={1.5} textAlign="left">
        {description ? (
          <Typography fontSize={13} color={colors.grey[600]}>
            {description}
          </Typography>
        ) : null}
        <Box textAlign="left">
          <TextareaField
            labelDetail={{ text: label, required: true }}
            placeholder="Explain why (kept in the audit trail)"
            variant="outlined"
            minRows={3}
            value={reason}
            error={touched && invalid}
            helperText={
              touched && invalid
                ? `At least ${minLength} characters are required.`
                : undefined
            }
            onChange={(event) => setReason(event.target.value)}
          />
        </Box>
      </Stack>
    </ConfirmationModal>
  )
}
